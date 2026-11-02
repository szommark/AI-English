import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabaseAdmin } from './supabaseAdmin.js'
import type {
  GrammarActivity,
  GrammarPracticeItem,
  PracticeCounts,
  PracticeKind,
  PracticeStartInput,
} from '../../src/lib/progressTypes.js'

// The practice log (supabase/migrations/20261105120000_practice_log.sql): word games with
// their list, Grammar Coach written practice and the time game — each start, and its finish.
// Routed from api/gamification.ts. Nothing here awards XP; that stays with awardXp.

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const KINDS: PracticeKind[] = ['vocab_game', 'grammar_written', 'tense_game']
const VARIANTS: Record<PracticeKind, string[]> = {
  vocab_game: ['grid', 'crossword'],
  grammar_written: [],
  tense_game: ['round', 'story'],
}
const MAX_ITEM_REF = 120
const MAX_WORDS = 500
/** How many recent activities of each kind the progress pages list. */
const RECENT_PRACTICE = 10

class BadInput extends Error {}

/** Validates a start request; throws BadInput on anything malformed. */
export function parseStart(body: Record<string, unknown>): PracticeStartInput {
  const kind = body.kind as PracticeKind
  if (!KINDS.includes(kind)) throw new BadInput('kind')
  const variant = body.variant ?? null
  if (variant !== null && (typeof variant !== 'string' || !VARIANTS[kind].includes(variant))) throw new BadInput('variant')
  if (kind !== 'grammar_written' && variant === null) throw new BadInput('variant')
  const itemRef = body.itemRef ?? null
  if (itemRef !== null && (typeof itemRef !== 'string' || itemRef.length === 0 || itemRef.length > MAX_ITEM_REF)) throw new BadInput('itemRef')
  const wordCount = body.wordCount ?? null
  if (wordCount !== null && (!Number.isInteger(wordCount) || (wordCount as number) < 1 || (wordCount as number) > MAX_WORDS)) {
    throw new BadInput('wordCount')
  }

  let list: PracticeStartInput['list'] = null
  if (kind === 'vocab_game') {
    const raw = (body.list ?? null) as { kind?: unknown; id?: unknown } | null
    if (!raw) throw new BadInput('list')
    if (raw.kind === 'conversations') list = { kind: 'conversations', id: null }
    else if ((raw.kind === 'teacher' || raw.kind === 'custom') && typeof raw.id === 'string' && UUID_RE.test(raw.id)) {
      list = { kind: raw.kind, id: raw.id }
    } else throw new BadInput('list')
  }
  return {
    kind,
    variant: variant as PracticeStartInput['variant'],
    itemRef: itemRef as string | null,
    wordCount: wordCount as number | null,
    list,
  }
}

/** A 0–1 share from the browser, stored as 0–100; null when absent. */
export function parseScore(raw: unknown): number | null {
  if (raw === null || raw === undefined) return null
  if (typeof raw !== 'number' || !Number.isFinite(raw) || raw < 0 || raw > 1) throw new BadInput('score')
  return Math.round(raw * 100)
}

async function handleStart(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  const input = parseStart((req.body ?? {}) as Record<string, unknown>)
  const { data, error } = await supabaseAdmin
    .from('practice_log')
    .insert({
      user_id: userId,
      kind: input.kind,
      variant: input.variant,
      item_ref: input.itemRef,
      list_source: input.list?.kind ?? null,
      list_id: input.list?.kind === 'teacher' ? input.list.id : null,
      student_list_id: input.list?.kind === 'custom' ? input.list.id : null,
      word_count: input.wordCount,
    })
    .select('id')
    .single()
  if (error) throw error
  res.status(200).json({ id: data.id })
}

/** Marks the caller's own started activity finished; a second finish keeps the first. */
async function handleFinish(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  const body = (req.body ?? {}) as Record<string, unknown>
  if (typeof body.id !== 'string' || !UUID_RE.test(body.id)) throw new BadInput('id')
  const score = parseScore(body.score)
  const { error } = await supabaseAdmin
    .from('practice_log')
    .update({ finished_at: new Date().toISOString(), score })
    .eq('id', body.id)
    .eq('user_id', userId)
    .is('finished_at', null)
  if (error) throw error
  res.status(200).json({ ok: true })
}

const HANDLERS: Record<string, (req: VercelRequest, res: VercelResponse, userId: string) => Promise<void>> = {
  'practice-start': handleStart,
  'practice-finish': handleFinish,
}

export const PRACTICE_ACTIONS = new Set(Object.keys(HANDLERS))

export async function handlePracticeAction(action: string, req: VercelRequest, res: VercelResponse, userId: string) {
  try {
    await HANDLERS[action](req, res, userId)
  } catch (err) {
    if (err instanceof BadInput) {
      res.status(400).json({ error: `Invalid ${err.message}` })
      return
    }
    console.error(`Practice log: ${action} failed`, err)
    if (!res.headersSent) res.status(502).json({ error: 'Failed' })
  }
}

// --- Reading, for the progress pages ---------------------------------------------------------

export interface PracticeRow {
  kind: PracticeKind
  variant: string | null
  item_ref: string | null
  list_source: string | null
  list_id: string | null
  student_list_id: string | null
  word_count: number | null
  score: number | null
  started_at: string
  finished_at: string | null
}

async function countOf(userId: string, kind: PracticeKind, finishedOnly: boolean): Promise<number> {
  let q = supabaseAdmin.from('practice_log').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('kind', kind)
  if (finishedOnly) q = q.not('finished_at', 'is', null)
  const { count, error } = await q
  if (error) throw error
  return count ?? 0
}

/** The latest rows of one kind plus how many were started and finished in all. */
export async function loadPractice(userId: string, kind: PracticeKind): Promise<{ rows: PracticeRow[]; counts: PracticeCounts }> {
  const [{ data, error }, started, finished] = await Promise.all([
    supabaseAdmin
      .from('practice_log')
      .select('kind, variant, item_ref, list_source, list_id, student_list_id, word_count, score, started_at, finished_at')
      .eq('user_id', userId)
      .eq('kind', kind)
      .order('started_at', { ascending: false })
      .limit(RECENT_PRACTICE),
    countOf(userId, kind, false),
    countOf(userId, kind, true),
  ])
  if (error) throw error
  return { rows: (data ?? []) as PracticeRow[], counts: { started, finished } }
}

function grammarItem(r: PracticeRow): GrammarPracticeItem {
  return {
    itemRef: r.item_ref,
    variant: r.variant === 'round' || r.variant === 'story' ? r.variant : null,
    score: r.score === null ? null : Number(r.score),
    startedAt: r.started_at,
    finished: r.finished_at !== null,
  }
}

export async function loadGrammarActivity(userId: string): Promise<GrammarActivity> {
  const [written, timeGame] = await Promise.all([loadPractice(userId, 'grammar_written'), loadPractice(userId, 'tense_game')])
  return {
    written: { items: written.rows.map(grammarItem), counts: written.counts },
    timeGame: { items: timeGame.rows.map(grammarItem), counts: timeGame.counts },
  }
}
