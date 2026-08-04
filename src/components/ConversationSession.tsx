import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Scenario, ChatMessage, FeedbackResult } from '../lib/types'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis'
import { sendChatTurn } from '../lib/api'
import { scenarioPhotos } from '../assets/scenarioPhotos'
import UnsupportedBrowserNotice from './UnsupportedBrowserNotice'
import DailyCapBanner from './DailyCapBanner'
import FeedbackCard from './FeedbackCard'

const MAX_TURNS = 6

type Status = 'idle' | 'listening' | 'thinking' | 'speaking' | 'done'

export default function ConversationSession({
  scenario,
  mode,
}: {
  scenario: Scenario
  mode: 'rehearsal' | 'test'
}) {
  const recognition = useSpeechRecognition()
  const synthesis = useSpeechSynthesis()
  const photo = scenarioPhotos[scenario.id]

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [turnIndex, setTurnIndex] = useState(0)
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const [capResetAt, setCapResetAt] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<FeedbackResult | null>(null)

  if (!recognition.supported || !synthesis.supported) {
    return <UnsupportedBrowserNotice />
  }

  if (capResetAt) {
    return <DailyCapBanner resetAt={capResetAt} />
  }

  async function handleStop() {
    recognition.stop()
    const userText = recognition.transcript.trim()
    if (!userText) {
      setStatus('idle')
      setError("Didn't catch that — try speaking again.")
      return
    }

    setError(null)
    const userMessage: ChatMessage = { role: 'user', content: userText }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setStatus('thinking')

    try {
      const isFinalTurn = turnIndex >= MAX_TURNS - 1
      const response = await sendChatTurn({
        scenarioId: scenario.id,
        mode,
        history: updatedMessages,
        turnIndex,
        fullTranscript: isFinalTurn ? updatedMessages : undefined,
      })

      const assistantMessage: ChatMessage = { role: 'assistant', content: response.reply }
      setMessages((prev) => [...prev, assistantMessage])
      setStatus('speaking')
      synthesis.speak(response.reply)

      if (response.done) {
        setFeedback(response.feedback ?? { strengths: [], corrections: [] })
        setStatus('done')
      } else {
        setTurnIndex((i) => i + 1)
        setStatus('idle')
      }
    } catch (err) {
      const capError = err as Error & { resetAt?: string }
      if (capError.message === 'daily_cap_exceeded' && capError.resetAt) {
        setCapResetAt(capError.resetAt)
      } else {
        setError('Something went wrong reaching the conversation service. Please try again.')
        setStatus('idle')
      }
    }
  }

  if (status === 'done' && feedback) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-slate-800">Here's your feedback</h2>
        <FeedbackCard feedback={feedback} />
        <Link to="/" className="inline-block text-indigo-600 hover:underline text-sm">
          ← Back to scenarios
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">{scenario.title}</h2>
        <span className="text-sm text-slate-500">Turn {turnIndex + 1} of {MAX_TURNS}</span>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto rounded-lg border border-slate-200 p-4 bg-white">
        {messages.length === 0 && (
          <p className="text-sm text-slate-400">Tap the mic and start the conversation.</p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
              m.role === 'user'
                ? 'ml-auto bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-800'
            }`}
          >
            {m.content}
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex flex-col items-center gap-3">
        {mode === 'test' && photo && (
          <img
            src={photo}
            alt={scenario.title}
            className="w-full max-w-xs rounded-2xl shadow-sm"
          />
        )}

        {status === 'listening' && recognition.transcript && (
          <p className="text-sm text-slate-500 italic">"{recognition.transcript}"</p>
        )}

        <button
          disabled={status === 'thinking' || status === 'speaking'}
          onClick={() => {
            if (status === 'listening') {
              handleStop()
            } else {
              setError(null)
              recognition.start()
              setStatus('listening')
            }
          }}
          className={`h-16 w-16 rounded-full text-white text-sm font-medium disabled:opacity-40 ${
            status === 'listening' ? 'bg-red-500' : 'bg-indigo-600'
          }`}
        >
          {status === 'listening' ? 'Stop' : status === 'thinking' ? '...' : status === 'speaking' ? '🔊' : 'Speak'}
        </button>
        <p className="text-xs text-slate-400">
          {status === 'thinking' && 'Thinking...'}
          {status === 'speaking' && 'Listen to the reply...'}
          {status === 'idle' && 'Tap to speak'}
        </p>
      </div>
    </div>
  )
}
