import type { ChatMessage, GrammarLesson, GrammarWidget } from '../../src/lib/types.js'
import type { CefrLevel, GrammarItem } from '../../src/data/grammarCurriculum.js'

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
// llama-3.1-8b-instant was deprecated by Groq (shutdown 2026-08-16); this is their
// official recommended replacement for that tier.
const MODEL = 'openai/gpt-oss-20b'
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

async function callGroq(messages: ChatMessage[] | { role: string; content: string }[]): Promise<GroqResult> {
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
        model: MODEL,
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

export async function callGroqChat(systemPrompt: string, recentHistory: ChatMessage[]): Promise<GroqResult> {
  const messages = [{ role: 'system', content: systemPrompt }, ...recentHistory]
  return callGroq(messages)
}

export async function callGroqFeedback(
  scenarioTitle: string,
  aiRole: string,
  transcript: ChatMessage[],
): Promise<GroqResult> {
  const transcriptText = transcript
    .map((m) => `${m.role === 'user' ? 'Learner' : aiRole}: ${m.content}`)
    .join('\n')

  const systemPrompt = `You are an English teacher reviewing a Hungarian learner's roleplay practice for the scenario "${scenarioTitle}". Review the transcript below and respond with ONLY valid JSON (no markdown, no code fences) matching exactly this shape:
{"strengths": ["...", "..."], "corrections": [{"original": "...", "corrected": "...", "note": "..."}]}
Give 2-3 strengths and 2-3 corrections. Each correction must reference an actual line the learner said, with a corrected version and a short note explaining the fix (grammar, vocabulary, or phrasing). Be encouraging but specific.`

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: transcriptText },
  ]

  return callGroq(messages)
}

export function parseFeedbackJson(raw: string): { strengths: string[]; corrections: { original: string; corrected: string; note: string }[] } {
  const cleaned = raw.trim().replace(/^```(json)?/i, '').replace(/```$/, '').trim()
  const parsed = JSON.parse(cleaned)
  return {
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
    corrections: Array.isArray(parsed.corrections) ? parsed.corrections : [],
  }
}

const HUNGARIAN_NARRATION_LEVELS: CefrLevel[] = ['A1', 'A2']

export async function callGroqGrammarLesson(item: GrammarItem, cefrLevel: CefrLevel): Promise<GroqResult> {
  const useHungarian = HUNGARIAN_NARRATION_LEVELS.includes(cefrLevel)

  const languageRule = useHungarian
    ? `The learner is at CEFR level ${cefrLevel}, so write every "title", "text", "narration", "label", table header/cell, and bullet-list item in HUNGARIAN. The only exception: English-language example sentences themselves (inside "example-sentence" tokens, "sentence-structure-diagram" block text when it quotes an actual sentence, and the "practice" sentences' "en" field) MUST stay in English — never translate the examples.`
    : `The learner is at CEFR level ${cefrLevel}, so write everything — rule text, narration, labels, table content, bullet items, and example sentences — in ENGLISH.`

  const systemPrompt = `You are an English grammar teacher preparing a short micro-lesson for a Hungarian learner on the grammar point "${item.title}" (CEFR level ${cefrLevel}).

Respond with ONLY valid JSON (no markdown, no code fences) matching EXACTLY this shape:
{"segments":[{"widget":<widget>,"narration":"..."}],"practice":[{"en":"...","hu":"..."}]}

Produce 3 to 5 segments, ordered so the lesson builds up naturally (e.g. rule first, then examples, then a summary). Each segment's "widget" must be EXACTLY one of these shapes — no other fields, no other widget types:
- {"type":"rule-box","title":"...","text":"..."}
- {"type":"example-sentence","tokens":[{"text":"...","highlighted":true|false}, ...]} — tokens are the words/punctuation of ONE example sentence in order; set "highlighted":true only on the word(s) that demonstrate the grammar point.
- {"type":"comparison-table","headers":["...","..."],"rows":[["...","..."], ...]} — 2 to 4 headers, 2 to 5 rows, each row has the same number of cells as headers.
- {"type":"sentence-structure-diagram","blocks":[{"label":"Subject","text":"..."}, ...]} — labeled blocks in sentence order (e.g. Subject, Verb, Object).
- {"type":"bullet-list","title":"...","items":["...", ...]} — 2 to 6 short items.

Don't use the same widget type in two consecutive segments. "narration" is a short (1-3 sentence) spoken-aloud script for that segment — plain text, no markdown, no asterisks.

"practice" must contain exactly 4 short practice sentences in English that test this exact grammar point, ordered from easier to harder, each with an "en" (English) and "hu" (Hungarian translation) field.

${languageRule}`

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Generate the lesson for "${item.title}" now.` },
  ]

  return callGroq(messages)
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
