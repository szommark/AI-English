import { supabase } from './supabase'
import { getModelPreference } from './modelSelection'
import type { ChatMessage } from './types'

export interface TutorChatResponse {
  reply: string
  turnIndex: number
  ended: boolean
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
