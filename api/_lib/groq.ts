import type { ChatMessage } from '../../src/lib/types'

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.1-8b-instant'
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
