import { supabase } from './supabase'
import { getModelPreference } from './modelSelection'
import type { ChatMessage, FeedbackResult } from './types'

export interface TutorChatResponse {
  reply: string
  turnIndex: number
  ended: boolean
}

export interface TutorEndResponse {
  feedback: FeedbackResult
}

async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function sendTutorTurn(params: {
  history: ChatMessage[]
  turnIndex: number
  isFirstSession?: boolean
}): Promise<TutorChatResponse> {
  const headers = await authHeader()
  const res = await fetch('/api/tutor-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({ ...params, model: getModelPreference('tutorBot') }),
  })

  if (!res.ok) throw new Error('Failed to reach the tutor bot service')
  return res.json()
}

export async function sendTutorEnd(params: { fullTranscript: ChatMessage[] }): Promise<TutorEndResponse> {
  const headers = await authHeader()
  const res = await fetch('/api/tutor-end', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({ ...params, model: getModelPreference('tutorBot') }),
  })

  if (!res.ok) throw new Error('Failed to end the tutor bot session')
  return res.json()
}
