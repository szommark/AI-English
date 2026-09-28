import { supabaseAdmin } from './supabaseAdmin.js'
import { callModel } from './modelRouter.js'
import { buildPersonalizationUpdatePrompt, type CefrLevel } from './prompts.js'
import { parsePersonalizationUpdateJson } from './groq.js'
import type { ModelId } from '../../src/lib/models.js'
import type { FeedbackResult } from '../../src/lib/types.js'
import { areaForSubtype, getMistakeSubtype, isValidSubtype, OTHER_SUBTYPE } from '../../src/data/mistakeTaxonomy.js'

const SUMMARY_CADENCE = 5 // re-run the summary/CEFR call every Nth completed session
const SUMMARY_RECENT_EVENTS = 200 // how many of the latest mistake events the summary looks at
const SUMMARY_TOP_SUBTYPES = 10

export async function getLearnerProfile(userId: string, userEmail: string | undefined) {
  const { data } = await supabaseAdmin
    .from('learner_profiles')
    .select('cefr_level, learner_goal, summary, suggested_topic')
    .eq('user_id', userId)
    .maybeSingle()

  const learnerName = userEmail?.split('@')[0] ?? 'there'

  if (data) {
    return {
      learnerName,
      cefrLevel: (data.cefr_level ?? 'B1') as CefrLevel,
      learnerGoal: data.learner_goal ?? 'general everyday conversation practice',
      personalizationSummary: data.summary ?? 'No history recorded yet.',
      suggestedTopic: data.suggested_topic ?? 'their day so far',
    }
  }

  return {
    learnerName,
    cefrLevel: 'B1' as CefrLevel,
    learnerGoal: 'general everyday conversation practice',
    personalizationSummary: 'No history recorded yet — this is a new learner.',
    suggestedTopic: 'their day so far',
  }
}

export type MistakeEventSource = 'scenario' | 'tutor'

/**
 * One mistake_events row per correction, in a single insert. The area is derived from the
 * subtype here, never taken from the model. A failed insert is logged, not thrown — the
 * caller's feedback is already computed and must still reach the learner.
 */
async function insertMistakeEvents(
  userId: string,
  feedback: FeedbackResult,
  sessionId: string | null,
  source: MistakeEventSource,
) {
  const rows = (feedback.corrections ?? []).map((c) => {
    const subtype = isValidSubtype(c.subtype) ? c.subtype : OTHER_SUBTYPE
    return {
      user_id: userId,
      session_id: sessionId,
      area: areaForSubtype(subtype),
      subtype,
      example_original: c.original || null,
      example_corrected: c.corrected || null,
      note: c.note || null,
      source,
    }
  })
  if (rows.length === 0) return

  const { error } = await supabaseAdmin.from('mistake_events').insert(rows)
  if (error) console.error('Failed to insert mistake events', error)
}

// Vocabulary is no longer written here: vocabulary_mastery is a read-only view over
// vocab_cards (supabase/migrations/20260925120000_vocabulary_tutor_words.sql), and Tutor
// Bot words become cards in api/_lib/vocabTutorWords.ts. The summary below still reads it.

async function maybeUpdateSummaryAndCefr(userId: string, modelId: ModelId) {
  const { count } = await supabaseAdmin
    .from('sessions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (!count || count % SUMMARY_CADENCE !== 0) return

  const [{ data: mistakes }, { data: vocab }, { data: profile }] = await Promise.all([
    supabaseAdmin
      .from('mistake_events')
      .select('subtype, legacy_occurrences')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(SUMMARY_RECENT_EVENTS),
    supabaseAdmin.from('vocabulary_mastery').select('word, status').eq('user_id', userId).limit(30),
    supabaseAdmin.from('learner_profiles').select('cefr_level').eq('user_id', userId).maybeSingle(),
  ])

  const currentCefr = (profile?.cefr_level ?? 'B1') as CefrLevel

  // Legacy (re-labelled mistake_log) rows stand for legacy_occurrences corrections each.
  const countsBySubtype = new Map<string, number>()
  for (const m of mistakes ?? []) {
    countsBySubtype.set(m.subtype, (countsBySubtype.get(m.subtype) ?? 0) + (m.legacy_occurrences ?? 1))
  }
  const topMistakes = [...countsBySubtype.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, SUMMARY_TOP_SUBTYPES)
    .map(([subtype, occurrences]) => ({ label: getMistakeSubtype(subtype)?.labelEn ?? subtype, occurrences }))

  const { systemPrompt, messages } = buildPersonalizationUpdatePrompt({
    mistakes: topMistakes,
    vocabulary: vocab ?? [],
    currentCefr,
  })

  try {
    const result = await callModel(modelId, systemPrompt, messages)
    const update = parsePersonalizationUpdateJson(result.content, currentCefr)

    await supabaseAdmin.from('learner_profiles').upsert({
      user_id: userId,
      cefr_level: update.cefrLevel,
      summary: update.summary,
      summary_updated_at: new Date().toISOString(),
    })

    await supabaseAdmin.from('cefr_history').insert({
      user_id: userId,
      cefr_level: update.cefrLevel,
      rationale: update.rationale,
    })
  } catch (err) {
    console.error('Failed to update learner summary/CEFR', err)
  }
}

// Call this after any successful feedback call — from both api/chat.ts's existing
// end-of-session branch and api/tutor.ts's end action — with the id of the sessions row
// just inserted (null if that insert failed), so each mistake event links to its session.
// A failure anywhere in here must never surface to the learner as a broken response —
// callers should await this after they've already computed the feedback they're about to
// return, so it can't delay or break that response even if every write inside fails.
export async function recordFeedbackToPersonalization(
  userId: string,
  feedback: FeedbackResult,
  modelId: ModelId,
  session: { id: string | null; source: MistakeEventSource },
) {
  try {
    await insertMistakeEvents(userId, feedback, session.id, session.source)
    await maybeUpdateSummaryAndCefr(userId, modelId)
  } catch (err) {
    console.error('Failed to record personalization data', err)
  }
}
