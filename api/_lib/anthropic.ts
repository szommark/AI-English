import Anthropic from '@anthropic-ai/sdk'
import type { ChatMessage } from '../../src/lib/types.js'
import type { GroqResult, ModelCallOptions } from './groq.js'

// Claude Haiku 5.5 and Sonnet 5.5 through the official SDK. Differences from the other
// providers that matter here:
// - No temperature: the API version this SDK sends (2026-10-21) rejects sampling params.
// - Thinking is adaptive and always on; depth is set with output_config.effort. Thinking
//   tokens count against max_tokens, so the budget gets headroom on top of the caller's.
// - No JSON mode flag without a schema: JSON is asked for in the system prompt and any
//   code fence or stray prose around the object is trimmed off.
// - The conversation must start with a user turn and must not end with an assistant turn
//   (that would be a prefill, which these models reject).
// - Sonnet 5.5 gets Anthropic's server-side fallback, so a safety decline is retried on a
//   suitable Claude model inside the same call; Haiku has no server-side fallback.

const THINKING_HEADROOM_TOKENS = 4000
const SERVER_FALLBACK_MODELS = new Set(['claude-sonnet-5-5'])

let client: Anthropic | null = null

function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error('Missing ANTHROPIC_API_KEY environment variable.')
  client ??= new Anthropic({ maxRetries: 3 })
  return client
}

function toClaudeMessages(messages: ChatMessage[]): Anthropic.Beta.BetaMessageParam[] {
  const out: Anthropic.Beta.BetaMessageParam[] = messages
    .filter((m) => m.content.trim())
    .map((m) => ({ role: m.role, content: m.content }))
  if (out.length === 0 || out[0].role !== 'user') out.unshift({ role: 'user', content: 'Begin.' })
  if (out[out.length - 1].role !== 'user') out.push({ role: 'user', content: 'Continue.' })
  return out
}

/** The JSON object in a reply, without code fences or text around it. */
export function extractJsonObject(text: string): string {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  return start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned
}

export async function callClaude(
  systemPrompt: string,
  messages: ChatMessage[],
  model: string,
  options: ModelCallOptions = {},
): Promise<GroqResult> {
  const system = options.json
    ? `${systemPrompt}\n\nReply with the JSON object only: no text before or after it and no code fences.`
    : systemPrompt
  const serverFallback = SERVER_FALLBACK_MODELS.has(model)

  // Streaming keeps long generations (whole course modules, exam tasks) clear of HTTP timeouts.
  const stream = getClient().beta.messages.stream({
    model,
    max_tokens: (options.maxTokens ?? 4096) + THINKING_HEADROOM_TOKENS,
    system,
    messages: toClaudeMessages(messages),
    output_config: { effort: options.reasoningEffort ?? 'low' },
    ...(serverFallback ? { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' as const } : {}),
  })
  const message = await stream.finalMessage()

  if (message.stop_reason === 'refusal') {
    throw new Error(`Claude declined the request (${message.stop_details?.category ?? 'no category'})`)
  }
  const text = message.content
    .map((block) => (block.type === 'text' ? block.text : ''))
    .join('')
    .trim()
  if (!text) throw new Error(`Claude returned no text (stop_reason: ${message.stop_reason})`)

  const u = message.usage
  const prompt = (u.input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0) + (u.cache_read_input_tokens ?? 0)
  const completion = u.output_tokens ?? 0
  return {
    content: options.json ? extractJsonObject(text) : text,
    usage: { prompt_tokens: prompt, completion_tokens: completion, total_tokens: prompt + completion },
  }
}
