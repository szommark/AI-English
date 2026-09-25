import { supabaseAdmin } from './supabaseAdmin.js'
import { enrichTerms } from './vocabEnrichment.js'
import { newCardFields } from './vocabScheduler.js'
import type { CefrLevel } from './prompts.js'
import type { VocabularyNote, VocabularyReason } from '../../src/lib/types.js'
import { MAX_TUTOR_ITEMS_PER_SESSION, normalizeTerm, termKind, type AddedTutorWord } from '../../src/lib/vocab.js'

// Tutor Bot words → cards, automatically (design decision 2, §5.2). No confirmation
// screen: noise is kept down by the per-session cap, dedup against the student's deck,
// and a one-tap undo on the feedback card (POST /api/vocab?action=remove).

/** switched > asked > lacked: a Hungarian word mid-sentence is exactly the word they lacked. */
const REASON_PRIORITY: Record<VocabularyReason, number> = { switched: 0, asked: 1, lacked: 2 }

/** Pure: at most `max` notes, highest-priority reason first, model order kept within a reason. */
export function prioritizeNotes(notes: VocabularyNote[], max = MAX_TUTOR_ITEMS_PER_SESSION): VocabularyNote[] {
  return notes
    .map((note, i) => ({ note, i }))
    .sort((a, b) => REASON_PRIORITY[a.note.reason] - REASON_PRIORITY[b.note.reason] || a.i - b.i)
    .slice(0, max)
    .map(({ note }) => note)
}

interface ItemRow {
  id: string
  term_normalized: string
  meaning_hu: string | null
}

/**
 * Adds the session's study targets to the student's deck as tutor-origin cards (FSRS
 * New), skipping terms they already have a card for — active or suspended. Items are
 * enriched first (cached terms cost nothing); a term whose enrichment fails still gets a
 * card on a 'pending' global item, which the practice session fills in later.
 * Returns the cards actually created, in priority order.
 */
export async function addTutorWords(
  userId: string,
  notes: VocabularyNote[],
  cefrHint?: CefrLevel,
): Promise<AddedTutorWord[]> {
  const candidates = prioritizeNotes(notes)
  if (candidates.length === 0) return []

  const { data: existing, error: existingError } = await supabaseAdmin
    .from('vocab_cards')
    .select('term_normalized')
    .eq('user_id', userId)
    .in('term_normalized', candidates.map((n) => normalizeTerm(n.term)))
  if (existingError) throw existingError
  const have = new Set((existing ?? []).map((r) => r.term_normalized as string))
  const fresh = candidates.filter((n) => !have.has(normalizeTerm(n.term)))
  if (fresh.length === 0) return []

  // Never throws on model failure; failed terms simply stay pending.
  await enrichTerms(
    fresh.map((n) => n.term),
    { userId, origin: 'tutor', cefrHint },
  )

  const { data: items, error: itemsError } = await supabaseAdmin.rpc('ensure_global_vocab_items', {
    p_items: fresh.map((n) => {
      const termNormalized = normalizeTerm(n.term)
      return { term: n.term, term_normalized: termNormalized, kind: termKind(termNormalized), origin: 'tutor' }
    }),
  })
  if (itemsError) throw itemsError
  const itemByTerm = new Map(((items ?? []) as ItemRow[]).map((i) => [i.term_normalized, i]))

  const now = new Date()
  const rows = fresh.flatMap((n) => {
    const item = itemByTerm.get(normalizeTerm(n.term))
    if (!item) return []
    return [
      {
        user_id: userId,
        item_id: item.id,
        term_normalized: item.term_normalized,
        origin: 'tutor',
        ...newCardFields(now),
        ladder_step: 1,
        context_original: n.learnerSaid,
        context_corrected: n.betterVersion,
      },
    ]
  })

  // ignoreDuplicates: a card created meanwhile (e.g. a teacher assignment) wins, and
  // only the rows actually inserted come back.
  const { data: inserted, error: insertError } = await supabaseAdmin
    .from('vocab_cards')
    .upsert(rows, { onConflict: 'user_id,term_normalized', ignoreDuplicates: true })
    .select('id, term_normalized')
  if (insertError) throw insertError
  const cardByTerm = new Map((inserted ?? []).map((c) => [c.term_normalized as string, c.id as string]))

  return fresh.flatMap((n): AddedTutorWord[] => {
    const termNormalized = normalizeTerm(n.term)
    const cardId = cardByTerm.get(termNormalized)
    if (!cardId) return []
    return [{ cardId, term: n.term, meaningHu: itemByTerm.get(termNormalized)?.meaning_hu ?? null, reason: n.reason }]
  })
}
