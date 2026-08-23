import { supabase } from './supabase'
import type { ChatMessage, ChatTurnResponse, FeedbackResult } from './types'

async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function postTutorChat(body: unknown): Promise<ChatTurnResponse> {
  const headers = await authHeader()
  const res = await fetch('/api/tutor-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })

  if (res.status === 403) {
    const resBody = await res.json()
    const err = new Error('daily_cap_exceeded') as Error & { resetAt?: string }
    err.resetAt = resBody.resetAt
    throw err
  }

  if (!res.ok) throw new Error('Failed to reach the tutor bot service')
  return res.json()
}

export function sendTutorGreeting(): Promise<ChatTurnResponse> {
  return postTutorChat({ type: 'greet' })
}

export function sendTutorTurn(params: {
  history: ChatMessage[]
  turnIndex: number
  fullTranscript?: ChatMessage[]
}): Promise<ChatTurnResponse> {
  return postTutorChat({ type: 'turn', ...params })
}

export async function sendTutorEnd(params: { fullTranscript: ChatMessage[] }): Promise<{ feedback: FeedbackResult }> {
  const headers = await authHeader()
  const res = await fetch('/api/tutor-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({ type: 'end', ...params }),
  })

  if (!res.ok) throw new Error('Failed to end the tutor bot session')
  return res.json()
}
