import { supabase } from './supabase'
import type { ChatMessage, FeedbackResult } from './types'
import type { AddedTutorWord } from './vocab'
import { publishXpResult } from './gamification/xpEvents'
import type { AwardResult } from './gamification/types'

export interface TutorChatResponse {
  reply: string
  turnIndex: number
  ended: boolean
  /** Set on the turn that completes a conversation for XP (TUTOR_MIN_TURNS_FOR_XP). */
  xp?: AwardResult | null
}

export interface TutorEndResponse {
  feedback: FeedbackResult
  /** Words added to the student's Vocabulary deck from this session (Phase 4). */
  addedWords?: AddedTutorWord[]
  /** True for drill personas (pronunciation): no grammar/vocab review was run. */
  feedbackSkipped?: boolean
}

export interface TutorPersonaSummary {
  id: string
  displayName: string
  description: string
}

async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/** Personas visible to the caller's role — powers the picker on TutorBotPage. */
export async function fetchPersonas(): Promise<TutorPersonaSummary[]> {
  const headers = await authHeader()
  const res = await fetch('/api/personas', { headers })
  if (!res.ok) throw new Error('Failed to load personas')
  const body = await res.json()
  return body.personas ?? []
}

export async function sendTutorTurn(params: {
  history: ChatMessage[]
  turnIndex: number
  isFirstSession?: boolean
  personaId: string
  /** Identifies the conversation for session tracking (counts only, no text). */
  sessionId?: string
}): Promise<TutorChatResponse> {
  const headers = await authHeader()
  const res = await fetch('/api/tutor?action=chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(params),
  })

  if (!res.ok) throw new Error('Failed to reach the tutor bot service')
  const body = (await res.json()) as TutorChatResponse
  publishXpResult(body.xp)
  return body
}

export async function sendTutorEnd(params: { fullTranscript: ChatMessage[]; personaId: string }): Promise<TutorEndResponse> {
  const headers = await authHeader()
  const res = await fetch('/api/tutor?action=end', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(params),
  })

  if (!res.ok) throw new Error('Failed to end the tutor bot session')
  return res.json()
}
