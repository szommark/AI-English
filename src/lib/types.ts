export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ScriptLine {
  speaker: string
  line: string
}

export interface Scenario {
  id: string
  title: string
  description: string
  aiRole: string
  setting: string
  systemPrompt: string
  rehearsalPhrases: string[]
  rehearsalScript: ScriptLine[]
}

export interface FeedbackCorrection {
  original: string
  corrected: string
  note: string
}

export interface FeedbackResult {
  strengths: string[]
  corrections: FeedbackCorrection[]
}

export interface ChatTurnResponse {
  reply: string
  done: boolean
  feedback?: FeedbackResult
}

export interface CapStatus {
  allowed: boolean
  remaining: number
  resetAt: string
}
