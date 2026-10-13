import { supabase } from './supabase'
import type { Lang } from './i18n'
import type { TenseGameMode, TenseGameVerdict } from '../data/tenseGameQuestions'
import type { StoryDecisionResult, TenseStoryId } from '../data/tenseStories'

async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export type TenseGameCheckError = 'daily_limit' | 'failed'

export class TenseGameCheckFailed extends Error {
  constructor(public reason: TenseGameCheckError) {
    super(`Tense game request failed: ${reason}`)
  }
}

async function post<T>(action: string, input: object, field: string): Promise<T> {
  const res = await fetch(`/api/grammar-lesson?action=${action}`, {
    method: 'POST',
    headers: { ...(await authHeader()), 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (res.status === 429) throw new TenseGameCheckFailed('daily_limit')
  if (!res.ok) throw new TenseGameCheckFailed('failed')
  const body = (await res.json()) as Record<string, unknown>
  if (body[field] === undefined || body[field] === null) throw new TenseGameCheckFailed('failed')
  return body[field] as T
}

/** Asks the AI whether the answer fits the question's time frame in a correct tense (and, in a story, the fact card). */
export function checkTenseGameAnswer(input: {
  questionId: string
  answer: string
  mode: TenseGameMode
  lang: Lang
  storyId?: TenseStoryId
}): Promise<TenseGameVerdict> {
  return post('tense-game-check', input, 'verdict')
}

/** Judges a story's final decision: the reason for a choice, or which kind of reply it was. */
export function judgeStoryDecision(input: { storyId: TenseStoryId; choiceId?: string; reply: string; lang: Lang }): Promise<StoryDecisionResult> {
  return post('tense-story-decision', input, 'result')
}

/** The story's closing document, written from the learner's answers. */
export function writeStoryUp(input: {
  storyId: TenseStoryId
  answers: { questionId: string; answer: string }[]
  decision: string
  outcomeId: string
}): Promise<string> {
  return post('tense-story-writeup', input, 'writeUp')
}
