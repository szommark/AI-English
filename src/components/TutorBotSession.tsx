import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { ChatMessage, FeedbackResult } from '../lib/types'
import { useTutorSpeechRecognition } from '../hooks/useTutorSpeechRecognition'
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis'
import { sendTutorGreeting, sendTutorTurn, sendTutorEnd } from '../lib/tutorBotApi'
import UnsupportedBrowserNotice from './UnsupportedBrowserNotice'
import DailyCapBanner from './DailyCapBanner'
import FeedbackCard from './FeedbackCard'
import MouthBubbleLayer from './SpeechBubble/MouthBubbleLayer'
import TranscriptLines from './SpeechBubble/TranscriptLines'
import TutorAvatar, { TUTOR_MOUTH_ANCHOR } from './TutorBot/TutorAvatar'
import StateIndicator, { type IndicatorState } from './TutorBot/StateIndicator'
import LiveCaptions from './TutorBot/LiveCaptions'
import BottomBar from './TutorBot/BottomBar'

const MAX_TURNS = 6

const REPROMPT_LINES = [
  "Still there? Take your time.",
  "No rush — whenever you're ready, go ahead.",
]

const APOLOGY_LINE = "Sorry, I had trouble there — could you say that again?"

type Status = 'idle' | 'listening' | 'thinking' | 'speaking' | 'muted' | 'ended'

export default function TutorBotSession() {
  const synthesis = useSpeechSynthesis()
  const photoContainerRef = useRef<HTMLDivElement>(null)

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [turnIndex, setTurnIndex] = useState(0)
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const [capResetAt, setCapResetAt] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<FeedbackResult | null>(null)
  const [permissionMessage, setPermissionMessage] = useState<string | null>(null)
  const [typingFocused, setTypingFocused] = useState(false)
  const [autoMuted, setAutoMuted] = useState(false)

  const statusRef = useRef(status)
  const pendingEndRef = useRef(false)
  const wasSpeakingRef = useRef(false)
  const emptyStreakRef = useRef(0)

  useEffect(() => {
    statusRef.current = status
  }, [status])

  async function submitTurn(userText: string) {
    setError(null)
    emptyStreakRef.current = 0
    const userMessage: ChatMessage = { role: 'user', content: userText }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setStatus('thinking')

    try {
      const isFinalTurn = turnIndex >= MAX_TURNS - 1
      const response = await sendTutorTurn({
        history: updatedMessages,
        turnIndex,
        fullTranscript: isFinalTurn ? updatedMessages : undefined,
      })

      const assistantMessage: ChatMessage = { role: 'assistant', content: response.reply }
      setMessages((prev) => [...prev, assistantMessage])

      if (response.done) {
        setFeedback(response.feedback ?? { strengths: [], corrections: [] })
        pendingEndRef.current = true
      } else {
        setTurnIndex((i) => i + 1)
      }
      setStatus('speaking')
      synthesis.speak(response.reply)
    } catch (err) {
      const capError = err as Error & { resetAt?: string }
      if (capError.message === 'daily_cap_exceeded' && capError.resetAt) {
        setCapResetAt(capError.resetAt)
        return
      }
      console.error('Tutor Bot turn failed', err)
      speakCanned(APOLOGY_LINE)
    }
  }

  function speakCanned(text: string) {
    setMessages((prev) => [...prev, { role: 'assistant', content: text }])
    setStatus('speaking')
    synthesis.speak(text)
  }

  function handleUtterance(text: string) {
    submitTurn(text)
  }

  function handleSilenceTimeout() {
    emptyStreakRef.current += 1
    const next = emptyStreakRef.current
    if (next === 2) {
      speakCanned(REPROMPT_LINES[Math.floor(Math.random() * REPROMPT_LINES.length)])
    } else if (next >= 3) {
      recognition.stop()
      setAutoMuted(true)
      setStatus('muted')
    } else {
      recognition.start()
    }
  }

  const recognition = useTutorSpeechRecognition({
    onUtterance: handleUtterance,
    onSilenceTimeout: handleSilenceTimeout,
  })

  // Auto-advance speaking -> listening (or -> ended, for the final turn) once TTS finishes.
  useEffect(() => {
    if (synthesis.speaking) {
      wasSpeakingRef.current = true
      return
    }
    if (!wasSpeakingRef.current) return
    wasSpeakingRef.current = false
    if (statusRef.current !== 'speaking') return

    if (pendingEndRef.current) {
      pendingEndRef.current = false
      setStatus('ended')
    } else {
      setStatus('listening')
    }
  }, [synthesis.speaking])

  // Keep the mic running whenever we're in `listening`, pausing while the learner types.
  useEffect(() => {
    if (status !== 'listening') return
    if (typingFocused) {
      recognition.stop()
    } else {
      recognition.start()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, typingFocused])

  useEffect(() => {
    if (recognition.permissionDenied) {
      recognition.stop()
      setStatus('idle')
      setPermissionMessage(
        "AI-English needs microphone access for Tutor Bot. Please allow it in your browser's site settings and reload the page.",
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recognition.permissionDenied])

  if (permissionMessage) {
    return (
      <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
        <p className="font-medium">Microphone access is blocked.</p>
        <p className="mt-1">{permissionMessage}</p>
      </div>
    )
  }

  if (!recognition.supported || !synthesis.supported) {
    return <UnsupportedBrowserNotice />
  }

  if (capResetAt) {
    return <DailyCapBanner resetAt={capResetAt} />
  }

  async function handleStart() {
    setError(null)
    setStatus('thinking')
    try {
      const response = await sendTutorGreeting()
      setMessages([{ role: 'assistant', content: response.reply }])
      setStatus('speaking')
      synthesis.speak(response.reply)
    } catch (err) {
      const capError = err as Error & { resetAt?: string }
      if (capError.message === 'daily_cap_exceeded' && capError.resetAt) {
        setCapResetAt(capError.resetAt)
        return
      }
      console.error('Tutor Bot greeting failed', err)
      setStatus('idle')
      setError('Something went wrong reaching the tutor bot. Please try again.')
    }
  }

  function handleToggleMute() {
    if (status === 'speaking') {
      synthesis.cancel()
      setStatus('listening')
      return
    }
    if (status === 'listening') {
      recognition.stop()
      setStatus('muted')
      return
    }
    if (status === 'muted') {
      emptyStreakRef.current = 0
      setAutoMuted(false)
      setStatus('listening')
    }
  }

  async function handleEnd() {
    recognition.stop()
    synthesis.cancel()

    if (messages.some((m) => m.role === 'user')) {
      setStatus('thinking')
      try {
        const result = await sendTutorEnd({ fullTranscript: messages })
        setFeedback(result.feedback ?? { strengths: [], corrections: [] })
      } catch {
        setFeedback({ strengths: [], corrections: [] })
      }
    } else {
      setFeedback({ strengths: [], corrections: [] })
    }
    setStatus('ended')
  }

  const assistantMessages = messages.filter((m) => m.role === 'assistant')
  const lastAssistantText = assistantMessages.at(-1)?.content ?? null
  const allTurns = messages.map((m) => ({ role: m.role, text: m.content }))

  if (status === 'ended' && feedback) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-slate-800">Here's your feedback</h2>

        <div className="hidden md:block relative mx-auto w-full max-w-xs">
          <TutorAvatar />
        </div>

        <FeedbackCard feedback={feedback} />

        {messages.length > 0 && (
          <div className="hidden md:block rounded-xl border border-slate-200 bg-white p-5 space-y-4">
            <h2 className="font-medium text-slate-700">Conversation transcript</h2>
            <TranscriptLines turns={allTurns} aiLabel="Tutor" />
          </div>
        )}

        <Link to="/" className="inline-block text-indigo-600 hover:underline text-sm">
          ← Back to home
        </Link>
      </div>
    )
  }

  const indicatorState: IndicatorState | null =
    status === 'listening' || status === 'thinking' || status === 'speaking' || status === 'muted' ? status : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">Tutor Bot</h2>
        {status !== 'idle' && (
          <span className="text-sm text-slate-500">Turn {turnIndex + 1} of {MAX_TURNS}</span>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex flex-col items-center gap-3">
        <div ref={photoContainerRef} className="relative w-full max-w-xs">
          <TutorAvatar />
          <MouthBubbleLayer
            containerRef={photoContainerRef}
            mouth={TUTOR_MOUTH_ANCHOR}
            latestText={lastAssistantText}
            messageKey={assistantMessages.length}
            allTurns={allTurns}
          />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-2">
          {indicatorState && <StateIndicator state={indicatorState} />}

          {status === 'idle' && (
            <button
              onClick={handleStart}
              className="rounded-full bg-indigo-600 px-6 py-3 text-sm font-medium text-white"
            >
              Start talking
            </button>
          )}

          {status === 'muted' && autoMuted && (
            <p className="text-xs text-slate-400 max-w-xs text-center">
              Paused after a few quiet moments — tap the mic when you're ready to continue.
            </p>
          )}
        </div>
      </div>

      {status !== 'idle' && (
        <LiveCaptions turns={messages} interimText={status === 'listening' ? recognition.interimTranscript : ''} />
      )}

      {status !== 'idle' && (
        <BottomBar
          muted={status === 'muted'}
          micDisabled={status === 'thinking' || status === 'ended'}
          endDisabled={status === 'ended'}
          textDisabled={status === 'thinking' || status === 'speaking' || status === 'ended'}
          onToggleMute={handleToggleMute}
          onEnd={handleEnd}
          onSubmitText={submitTurn}
          onTypingFocusChange={setTypingFocused}
        />
      )}
    </div>
  )
}
