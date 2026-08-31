import { supabase } from './supabase'
import { getModelPreference } from './modelSelection'
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
    body: JSON.stringify({ ...params, model: getModelPreference('rehearsal') }),
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

export interface DeepCheckLimitError extends Error {
  code: 'monthly_limit_reached'
  message: string
}

export async function requestDeepCheckToken(scenarioId: string): Promise<{ token: string; region: string }> {
  const headers = await authHeader()
  const res = await fetch('/api/pronunciation-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({ scenarioId }),
  })

  if (res.status === 403) {
    const body = await res.json()
    const err = new Error(body.message ?? 'Deep check limit reached') as DeepCheckLimitError
    err.code = body.error
    throw err
  }

  if (!res.ok) throw new Error('Failed to reach the pronunciation service')
  return res.json()
}

export async function logDeepCheck(params: {
  scenarioId: string
  targetSentence: string
  azureResult: unknown
  audioSeconds: number
}): Promise<void> {
  const headers = await authHeader()
  const res = await fetch('/api/pronunciation-log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(params),
  })

  if (!res.ok) throw new Error('Failed to log pronunciation check')
}
