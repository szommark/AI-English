import { supabase } from './supabase'
import type { CapStatus, ChatMessage, ChatTurnResponse } from './types'

async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function fetchCapStatus(): Promise<CapStatus> {
  const headers = await authHeader()
  const res = await fetch('/api/cap-status', { headers })
  if (!res.ok) throw new Error('Failed to load session cap status')
  return res.json()
}

export async function sendChatTurn(params: {
  scenarioId: string
  mode: 'rehearsal' | 'test'
  history: ChatMessage[]
  turnIndex: number
  fullTranscript?: ChatMessage[]
}): Promise<ChatTurnResponse> {
  const headers = await authHeader()
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(params),
  })

  if (res.status === 403) {
    const body = await res.json()
    const err = new Error('daily_cap_exceeded') as Error & { resetAt?: string }
    err.resetAt = body.resetAt
    throw err
  }

  if (!res.ok) throw new Error('Failed to reach the conversation service')
  return res.json()
}
