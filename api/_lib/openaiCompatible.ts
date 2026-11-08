import type { ChatMessage } from '../../src/lib/types.js'
import type { GroqResult, ModelCallOptions } from './groq.js'

// Mistral and DeepSeek both speak the OpenAI chat-completions format, so they share one
// adapter. Neither gets reasoning_effort: DeepSeek's thinking mode stays off (faster,
// cheaper) and Mistral has no such parameter.

export type OpenAiCompatibleProvider = 'mistral' | 'deepseek'

const PROVIDERS: Record<OpenAiCompatibleProvider, { url: string; keyEnv: string; name: string }> = {
  mistral: { url: 'https://api.mistral.ai/v1/chat/completions', keyEnv: 'MISTRAL_API_KEY', name: 'Mistral' },
  deepseek: { url: 'https://api.deepseek.com/chat/completions', keyEnv: 'DEEPSEEK_API_KEY', name: 'DeepSeek' },
}

const RETRY_DELAYS_MS = [1000, 2000, 4000]

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function callOpenAiCompatible(
  provider: OpenAiCompatibleProvider,
  systemPrompt: string,
  messages: ChatMessage[],
  model: string,
  options: ModelCallOptions = {},
): Promise<GroqResult> {
  const { url, keyEnv, name } = PROVIDERS[provider]
  const apiKey = process.env[keyEnv]
  if (!apiKey) throw new Error(`Missing ${keyEnv} environment variable.`)

  const body = JSON.stringify({
    model,
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 4096,
    ...(options.json ? { response_format: { type: 'json_object' } } : {}),
  })

  let lastError: unknown = null
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body,
    })

    // A rate limit or a server hiccup is worth a short wait before the next try.
    if ((response.status === 429 || response.status >= 500) && attempt < RETRY_DELAYS_MS.length) {
      await sleep(RETRY_DELAYS_MS[attempt])
      continue
    }

    if (!response.ok) {
      lastError = new Error(`${name} API error ${response.status}: ${await response.text()}`)
      break
    }

    const json = await response.json()
    const content: string = json.choices?.[0]?.message?.content ?? ''
    if (!content.trim()) {
      lastError = new Error(`${name} returned no content (finish_reason: ${json.choices?.[0]?.finish_reason ?? 'unknown'})`)
      break
    }
    return { content, usage: json.usage ?? null }
  }

  throw lastError ?? new Error(`${name} API request failed after retries.`)
}
