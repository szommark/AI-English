import { supabase } from './supabase'
import type { Lang } from './i18n'
import type { TenseGameMode, TenseGameVerdict } from '../data/tenseGameQuestions'

async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export type TenseGameCheckError = 'daily_limit' | 'failed'

export class TenseGameCheckFailed extends Error {
  constructor(public reason: TenseGameCheckError) {
    super(`Tense game check failed: ${reason}`)
  }
}

/** Asks the AI whether the answer fits the question's time frame in a correct tense. */
export async function checkTenseGameAnswer(input: {
  questionId: string
  answer: string
  mode: TenseGameMode
  lang: Lang
}): Promise<TenseGameVerdict> {
  const res = await fetch('/api/grammar-lesson?action=tense-game-check', {
    method: 'POST',
    headers: { ...(await authHeader()), 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (res.status === 429) throw new TenseGameCheckFailed('daily_limit')
  if (!res.ok) throw new TenseGameCheckFailed('failed')
  const body = (await res.json()) as { verdict?: TenseGameVerdict }
  if (!body.verdict) throw new TenseGameCheckFailed('failed')
  return body.verdict
}
