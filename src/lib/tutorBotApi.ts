import { supabase } from './supabase'
import type { ChatMessage, FeedbackResult } from './types'

export interface TutorChatResponse {
  reply: string
  turnIndex: number
  ended: boolean
}

export interface TutorEndResponse {
  feedback: FeedbackResult
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
}): Promise<TutorChatResponse> {
  const headers = await authHeader()
  const res = await fetch('/api/tutor?action=chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(params),
  })

  if (!res.ok) throw new Error('Failed to reach the tutor bot service')
  return res.json()
}

export async function sendTutorEnd(params: { fullTranscript: ChatMessage[] }): Promise<TutorEndResponse> {
  const headers = await authHeader()
  const res = await fetch('/api/tutor?action=end', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(params),
  })

  if (!res.ok) throw new Error('Failed to end the tutor bot session')
  return res.json()
}
