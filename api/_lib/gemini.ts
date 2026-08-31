import type { ChatMessage } from '../../src/lib/types.js'

// Google renames/retires model ids periodically — re-check
// https://ai.google.dev/gemini-api/docs/models if calls start failing.
const GEMINI_URL_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'
const RETRY_DELAYS_MS = [1000, 2000, 4000]

export interface GeminiUsage {
  prompt_tokens?: number
  completion_tokens?: number
  total_tokens?: number
}

export interface GeminiResult {
  content: string
  usage: GeminiUsage | null
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function toGeminiRole(role: ChatMessage['role']): 'user' | 'model' {
  return role === 'assistant' ? 'model' : 'user'
}

export async function callGeminiChat(systemPrompt: string, recentHistory: ChatMessage[], model: string): Promise<GeminiResult> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('Missing GEMINI_API_KEY environment variable.')

  const contents = recentHistory.map((m) => ({
    role: toGeminiRole(m.role),
    parts: [{ text: m.content }],
  }))

  const requestBody = {
    contents,
    systemInstruction: { parts: [{ text: systemPrompt }] },
    // maxOutputTokens raised from the old 300 (sized only for Tutor Bot's short replies)
    // now that this model is also routable to Grammar Coach's multi-segment JSON lesson.
    generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
  }

  let lastError: unknown = null

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    const response = await fetch(`${GEMINI_URL_BASE}/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    })

    if ((response.status === 429 || response.status === 503) && attempt < RETRY_DELAYS_MS.length) {
      await sleep(RETRY_DELAYS_MS[attempt])
      continue
    }

    if (!response.ok) {
      const text = await response.text()
      lastError = new Error(`Gemini API error ${response.status}: ${text}`)
      break
    }

    const json = await response.json()
    const candidate = json.candidates?.[0]
    const parts: { text?: string }[] = candidate?.content?.parts ?? []
    const content = parts.map((p) => p.text ?? '').join('').trim()

    if (!content) {
      // An empty response is usually a SAFETY (or other) finishReason, not a transport
      // failure — surface it so logs can tell the two apart.
      const finishReason = candidate?.finishReason ?? 'UNKNOWN'
      lastError = new Error(`Gemini returned no content (finishReason: ${finishReason})`)
      break
    }

    const usageMetadata = json.usageMetadata
    const usage: GeminiUsage | null = usageMetadata
      ? {
          prompt_tokens: usageMetadata.promptTokenCount,
          completion_tokens: usageMetadata.candidatesTokenCount,
          total_tokens: usageMetadata.totalTokenCount,
        }
      : null

    return { content, usage }
  }

  throw lastError ?? new Error('Gemini API request failed after retries.')
}
