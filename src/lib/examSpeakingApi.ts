import { supabase } from './supabase'
import type { SpeakingAssessment, SpeakingAssessRequest, SpeakingTurnRequest, SpeakingTurnResponse } from './examSpeakingTypes'

async function post<T>(action: string, body: unknown): Promise<T> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  const res = await fetch(`/api/tutor?action=${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Speaking exam request failed (${res.status})`)
  return res.json() as Promise<T>
}

/** One examiner turn of one speaking task. */
export const sendSpeakingTurn = (params: SpeakingTurnRequest) => post<SpeakingTurnResponse>('exam-turn', params)

/** The AI's estimated scores and feedback for the whole speaking exam. */
export const assessSpeakingExam = (params: SpeakingAssessRequest) => post<SpeakingAssessment>('exam-assess', params)
