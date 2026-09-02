import { supabaseAdmin } from './supabaseAdmin.js'
import { callModel } from './modelRouter.js'
import { buildPersonalizationUpdatePrompt, type CefrLevel } from './prompts.js'
import { parsePersonalizationUpdateJson } from './groq.js'
import type { ModelId } from '../../src/lib/models.js'
import type { FeedbackResult } from '../../src/lib/types.js'

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000
const SUMMARY_CADENCE = 5 // re-run the summary/CEFR call every Nth completed session

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

async function upsertMistakes(userId: string, feedback: FeedbackResult) {
  for (const correction of feedback.corrections ?? []) {
    const category = correction.category ?? 'other'
    const since = new Date(Date.now() - THIRTY_DAYS_MS).toISOString()

    const { data: existing } = await supabaseAdmin
      .from('mistake_log')
      .select('id, occurrences')
      .eq('user_id', userId)
      .eq('category', category)
      .gte('last_seen_at', since)
      .order('last_seen_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (existing) {
      await supabaseAdmin
        .from('mistake_log')
        .update({
          occurrences: existing.occurrences + 1,
          last_seen_at: new Date().toISOString(),
          example_original: correction.original,
          example_corrected: correction.corrected,
        })
        .eq('id', existing.id)
    } else {
      await supabaseAdmin.from('mistake_log').insert({
        user_id: userId,
        category,
        example_original: correction.original,
        example_corrected: correction.corrected,
        occurrences: 1,
      })
    }
  }
}

async function upsertVocabulary(userId: string, words: string[]) {
  for (const word of words) {
    const normalized = word.trim().toLowerCase()
    if (!normalized) continue

    const { data: existing } = await supabaseAdmin
      .from('vocabulary_mastery')
      .select('occurrences')
      .eq('user_id', userId)
      .eq('word', normalized)
      .maybeSingle()

    const occurrences = (existing?.occurrences ?? 0) + 1
    // 1st sighting -> new, 2nd -> practicing, 3rd+ -> mastered. A placeholder
    // rule, not a real spaced-repetition model — revisit if it feels off in practice.
    const status = occurrences === 1 ? 'new' : occurrences === 2 ? 'practicing' : 'mastered'

    await supabaseAdmin.from('vocabulary_mastery').upsert({
      user_id: userId,
      word: normalized,
      status,
      occurrences,
      last_seen_at: new Date().toISOString(),
    })
  }
}

async function maybeUpdateSummaryAndCefr(userId: string, modelId: ModelId) {
  const { count } = await supabaseAdmin
    .from('sessions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (!count || count % SUMMARY_CADENCE !== 0) return

  const [{ data: mistakes }, { data: vocab }, { data: profile }] = await Promise.all([
    supabaseAdmin
      .from('mistake_log')
      .select('category, occurrences')
      .eq('user_id', userId)
      .order('occurrences', { ascending: false })
      .limit(10),
    supabaseAdmin.from('vocabulary_mastery').select('word, status').eq('user_id', userId).limit(30),
    supabaseAdmin.from('learner_profiles').select('cefr_level').eq('user_id', userId).maybeSingle(),
  ])

  const currentCefr = (profile?.cefr_level ?? 'B1') as CefrLevel

  const { systemPrompt, messages } = buildPersonalizationUpdatePrompt({
    mistakes: mistakes ?? [],
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
// end-of-session branch and api/tutor-end.ts. A failure anywhere in here must never
// surface to the learner as a broken response — callers should await this after
// they've already computed the feedback they're about to return, so it can't delay
// or break that response even if every write inside fails.
export async function recordFeedbackToPersonalization(userId: string, feedback: FeedbackResult, modelId: ModelId) {
  try {
    await upsertMistakes(userId, feedback)
    await upsertVocabulary(userId, feedback.vocabularyNoted ?? [])
    await maybeUpdateSummaryAndCefr(userId, modelId)
  } catch (err) {
    console.error('Failed to record personalization data', err)
  }
}
