import type { ChatMessage, FeedbackResult, GrammarLesson, GrammarWidget } from '../../src/lib/types.js'
import { MISTAKE_CATEGORIES, type CefrLevel } from './prompts.js'

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const RETRY_DELAYS_MS = [1000, 2000, 4000]

export interface GroqUsage {
  prompt_tokens?: number
  completion_tokens?: number
  total_tokens?: number
}

export interface GroqResult {
  content: string
  usage: GroqUsage | null
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function callGroq(
  messages: ChatMessage[] | { role: string; content: string }[],
  model: string,
): Promise<GroqResult> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('Missing GROQ_API_KEY environment variable.')

  let lastError: unknown = null

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    const response = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
      }),
    })

    if (response.status === 429 && attempt < RETRY_DELAYS_MS.length) {
      await sleep(RETRY_DELAYS_MS[attempt])
      continue
    }

    if (!response.ok) {
      const text = await response.text()
      lastError = new Error(`Groq API error ${response.status}: ${text}`)
      break
    }

    const json = await response.json()
    const content = json.choices?.[0]?.message?.content ?? ''
    return { content, usage: json.usage ?? null }
  }

  throw lastError ?? new Error('Groq API request failed after retries.')
}

const MISTAKE_CATEGORY_SET = new Set<string>(MISTAKE_CATEGORIES)
const VALID_CEFR_LEVELS = new Set<string>(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])

export function parseFeedbackJson(raw: string): FeedbackResult {
  const cleaned = raw.trim().replace(/^```(json)?/i, '').replace(/```$/, '').trim()
  const parsed = JSON.parse(cleaned)
  const corrections = Array.isArray(parsed.corrections) ? parsed.corrections : []

  return {
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
    corrections: corrections.map((c: Record<string, unknown>) => ({
      original: typeof c?.original === 'string' ? c.original : '',
      corrected: typeof c?.corrected === 'string' ? c.corrected : '',
      note: typeof c?.note === 'string' ? c.note : '',
      category: typeof c?.category === 'string' && MISTAKE_CATEGORY_SET.has(c.category) ? c.category : 'other',
    })),
    vocabularyNoted: Array.isArray(parsed.vocabularyNoted)
      ? parsed.vocabularyNoted.filter((w: unknown): w is string => typeof w === 'string')
      : [],
  }
}

export interface PersonalizationUpdateResult {
  summary: string
  cefrLevel: CefrLevel
  rationale: string
}

/**
 * Same defensive parsing pattern as parseFeedbackJson — falls back to `currentCefr`
 * if the model returns a missing/invalid cefrLevel, rather than trusting it blindly.
 */
export function parsePersonalizationUpdateJson(raw: string, currentCefr: CefrLevel): PersonalizationUpdateResult {
  const cleaned = raw.trim().replace(/^```(json)?/i, '').replace(/```$/, '').trim()
  const parsed = JSON.parse(cleaned)

  const cefrLevel =
    typeof parsed.cefrLevel === 'string' && VALID_CEFR_LEVELS.has(parsed.cefrLevel)
      ? (parsed.cefrLevel as CefrLevel)
      : currentCefr

  return {
    summary: typeof parsed.summary === 'string' ? parsed.summary : '',
    cefrLevel,
    rationale: typeof parsed.rationale === 'string' ? parsed.rationale : '',
  }
}

const WIDGET_ALLOWLIST = new Set(['rule-box', 'example-sentence', 'comparison-table', 'sentence-structure-diagram', 'bullet-list'])

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0
}

function validateWidget(widget: unknown): widget is GrammarWidget {
  if (typeof widget !== 'object' || widget === null) return false
  const w = widget as Record<string, unknown>
  if (typeof w.type !== 'string' || !WIDGET_ALLOWLIST.has(w.type)) return false

  switch (w.type) {
    case 'rule-box':
      return isNonEmptyString(w.title) && isNonEmptyString(w.text)
    case 'example-sentence':
      return (
        Array.isArray(w.tokens) &&
        w.tokens.length > 0 &&
        w.tokens.every((t) => typeof t === 'object' && t !== null && isNonEmptyString((t as Record<string, unknown>).text))
      )
    case 'comparison-table':
      return (
        Array.isArray(w.headers) &&
        w.headers.length >= 2 &&
        w.headers.every((h) => typeof h === 'string') &&
        Array.isArray(w.rows) &&
        w.rows.length > 0 &&
        w.rows.every((row) => Array.isArray(row) && row.length === (w.headers as unknown[]).length && row.every((c) => typeof c === 'string'))
      )
    case 'sentence-structure-diagram':
      return (
        Array.isArray(w.blocks) &&
        w.blocks.length > 0 &&
        w.blocks.every(
          (b) => typeof b === 'object' && b !== null && isNonEmptyString((b as Record<string, unknown>).label) && isNonEmptyString((b as Record<string, unknown>).text),
        )
      )
    case 'bullet-list':
      return Array.isArray(w.items) && w.items.length > 0 && w.items.every((i) => typeof i === 'string' && i.trim().length > 0)
    default:
      return false
  }
}

/**
 * Strict parse+validate for the grammar lesson JSON — throws on any deviation from the
 * widget allowlist / expected shape, so an invalid Groq response never reaches the cache
 * or the board (see the fail-silent retry-once handling in api/grammar-lesson.ts).
 */
export function parseGrammarLessonJson(raw: string): GrammarLesson {
  const cleaned = raw.trim().replace(/^```(json)?/i, '').replace(/```$/, '').trim()
  const parsed = JSON.parse(cleaned)

  if (typeof parsed !== 'object' || parsed === null) throw new Error('Grammar lesson JSON is not an object')

  const segments = parsed.segments
  if (!Array.isArray(segments) || segments.length < 2 || segments.length > 8) {
    throw new Error('Grammar lesson has an invalid "segments" array')
  }
  for (const segment of segments) {
    if (typeof segment !== 'object' || segment === null) throw new Error('Grammar lesson segment is not an object')
    if (!isNonEmptyString((segment as Record<string, unknown>).narration)) throw new Error('Grammar lesson segment is missing narration')
    if (!validateWidget((segment as Record<string, unknown>).widget)) throw new Error('Grammar lesson segment has an invalid widget')
  }

  const practice = parsed.practice
  if (!Array.isArray(practice) || practice.length === 0) throw new Error('Grammar lesson is missing "practice" sentences')
  for (const line of practice) {
    if (typeof line !== 'object' || line === null) throw new Error('Grammar lesson practice line is not an object')
    if (!isNonEmptyString((line as Record<string, unknown>).en) || !isNonEmptyString((line as Record<string, unknown>).hu)) {
      throw new Error('Grammar lesson practice line is missing en/hu text')
    }
  }

  return parsed as GrammarLesson
}
