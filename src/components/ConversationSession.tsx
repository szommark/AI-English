import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Scenario, ChatMessage, FeedbackResult } from '../lib/types'
import { useTutorSpeechRecognition } from '../hooks/useTutorSpeechRecognition'
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis'
import { sendChatTurn } from '../lib/api'
import { scenarioPhotos } from '../assets/scenarioPhotos'
import UnsupportedBrowserNotice from './UnsupportedBrowserNotice'
import DailyCapBanner from './DailyCapBanner'
import FeedbackCard from './FeedbackCard'
import MouthBubbleLayer from './SpeechBubble/MouthBubbleLayer'
import TranscriptLines from './SpeechBubble/TranscriptLines'
import StateIndicator, { type IndicatorState } from './TutorBot/StateIndicator'
import LiveCaptions from './TutorBot/LiveCaptions'
import BottomBar from './TutorBot/BottomBar'
import { LISTEN_START_DELAY_MS, looksLikeEcho } from '../lib/tutorTurnTaking'

const MAX_TURNS = 6

const REPROMPT_LINES = ["Take your time — I'm listening.", "No rush — whenever you're ready."]

type Status = 'idle' | 'listening' | 'thinking' | 'speaking' | 'muted' | 'done'

/**
 * A Conversational English scenario, with Tutor Bot's hands-free turn-taking: one
 * "Start the conversation" tap opens the mic, the learner's turn ends on silence, the
 * character answers aloud and the mic reopens by itself. Typing works too, and the mic
 * pauses after a few silent windows until the learner taps it again.
 */
export default function ConversationSession({
  scenario,
  mode,
}: {
  scenario: Scenario
  mode: 'rehearsal' | 'test'
}) {
  const synthesis = useSpeechSynthesis(scenario.voiceGender)
  const photo = scenarioPhotos[scenario.id]
  const photoContainerRef = useRef<HTMLDivElement>(null)

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [turnIndex, setTurnIndex] = useState(0)
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const [permissionMessage, setPermissionMessage] = useState<string | null>(null)
  const [capResetAt, setCapResetAt] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<FeedbackResult | null>(null)
  const [typingFocused, setTypingFocused] = useState(false)
  const [autoMuted, setAutoMuted] = useState(false)

  const statusRef = useRef(status)
  const emptyStreakRef = useRef(0)

  useEffect(() => {
    statusRef.current = status
  }, [status])

  useEffect(() => synthesis.cancel, [synthesis.cancel])

  /** Speaks a line, then reopens the mic — or shows the feedback once the final reply is over. */
  function speakThen(text: string, then: 'listen' | 'done') {
    setStatus('speaking')
    synthesis.speak(text, {
      onEnd: () => {
        if (statusRef.current !== 'speaking') return
        setStatus(then === 'done' ? 'done' : 'listening')
      },
    })
  }

  async function submitTurn(userText: string) {
    setError(null)
    emptyStreakRef.current = 0
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

      setMessages((prev) => [...prev, { role: 'assistant', content: response.reply }])
      if (response.done) {
        setFeedback(response.feedback ?? { strengths: [], corrections: [] })
        speakThen(response.reply, 'done')
      } else {
        setTurnIndex((i) => i + 1)
        speakThen(response.reply, 'listen')
      }
    } catch (err) {
      const capError = err as Error & { resetAt?: string }
      if (capError.message === 'daily_cap_exceeded' && capError.resetAt) {
        setCapResetAt(capError.resetAt)
        return
      }
      console.error('Conversation turn failed', err)
      // Drop the unanswered turn so the learner can simply say it again.
      setMessages(messages)
      setError('Something went wrong reaching the conversation service — please say that again.')
      setStatus('listening')
    }
  }

  // Only a turn that arrives while we're listening counts (stale recognizer callbacks are ignored).
  function handleUtterance(text: string) {
    if (statusRef.current !== 'listening') return
    const lastAssistantText = messages.filter((m) => m.role === 'assistant').at(-1)?.content
    if (looksLikeEcho(text, lastAssistantText)) {
      console.warn('[conversation-speech] discarded a captured turn that looked like echo of the reply:', text)
      recognition.start()
      return
    }
    submitTurn(text)
  }

  function handleSilenceTimeout() {
    if (statusRef.current !== 'listening') return
    emptyStreakRef.current += 1
    const next = emptyStreakRef.current
    if (next === 2 && messages.length > 0) {
      // Spoken but kept out of the history the scenario's AI sees.
      speakThen(REPROMPT_LINES[Math.floor(Math.random() * REPROMPT_LINES.length)], 'listen')
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

  // Keep the mic running while listening, pausing it while the learner types. The short
  // delay lets any trailing TTS playback clear the speakers first.
  useEffect(() => {
    if (status !== 'listening') return
    if (typingFocused) {
      recognition.stop()
      return
    }
    const timer = setTimeout(() => recognition.start(), LISTEN_START_DELAY_MS)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, typingFocused])

  useEffect(() => {
    if (status === 'done') recognition.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  useEffect(() => {
    if (recognition.permissionDenied) {
      recognition.stop()
      setStatus('idle')
      setPermissionMessage(
        "AVaLoN needs microphone access for the conversation. Please allow it in your browser's site settings and reload the page.",
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

  function handleStart() {
    setError(null)
    emptyStreakRef.current = 0
    setStatus('listening')
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

  const assistantMessages = messages.filter((m) => m.role === 'assistant')
  const lastAssistantText = assistantMessages.at(-1)?.content ?? null
  const allTurns = messages.map((m) => ({ role: m.role, text: m.content }))

  if (status === 'done' && feedback) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-slate-800">Here's your feedback</h2>

        {photo && (
          <div className="hidden md:block relative mx-auto w-full max-w-xs">
            <img src={photo} alt={scenario.title} className="block h-auto w-full rounded-2xl shadow-sm" />
          </div>
        )}

        <FeedbackCard feedback={feedback} />

        <div className="hidden md:block rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <h2 className="font-medium text-slate-700">Conversation transcript</h2>
          <TranscriptLines turns={allTurns} aiLabel={scenario.aiRole} />
        </div>

        <Link to="/" className="inline-block text-indigo-600 hover:underline text-sm">
          ← Back to scenarios
        </Link>
      </div>
    )
  }

  const indicatorState: IndicatorState | null =
    status === 'listening' || status === 'thinking' || status === 'speaking' || status === 'muted' ? status : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">{scenario.title}</h2>
        <span className="text-sm text-slate-500">Turn {turnIndex + 1} of {MAX_TURNS}</span>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex flex-col items-center gap-3">
        {photo && (
          <div ref={photoContainerRef} className="relative w-full max-w-xs">
            <img src={photo} alt={scenario.title} className="block h-auto w-full rounded-2xl shadow-sm" />
            <MouthBubbleLayer
              containerRef={photoContainerRef}
              mouth={scenario.mouth}
              latestText={lastAssistantText}
              messageKey={assistantMessages.length}
              allTurns={allTurns}
            />
          </div>
        )}

        {/* z-10 keeps the controls clickable above the live bubble exchange. */}
        <div className="relative z-10 flex flex-col items-center gap-2">
          {indicatorState && <StateIndicator state={indicatorState} />}

          {status === 'idle' && (
            <button
              onClick={handleStart}
              className="rounded-full bg-indigo-600 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Start the conversation
            </button>
          )}

          {status === 'listening' && recognition.interimTranscript && (
            <p className="hidden md:block max-w-xs text-center text-sm italic text-slate-500">
              "{recognition.interimTranscript}"
            </p>
          )}

          {status === 'listening' && messages.length === 0 && !recognition.interimTranscript && (
            <p className="text-xs text-slate-400">Go ahead — say hello. Your turn ends when you pause.</p>
          )}

          {status === 'muted' && (
            <p className="max-w-xs text-center text-xs text-slate-400">
              {autoMuted
                ? "Paused after a few quiet moments — tap the mic when you're ready to continue."
                : "Mic paused — tap it when you're ready to continue."}
            </p>
          )}
        </div>
      </div>

      {/* Mobile: only the character's latest reply shows as a bubble, so the full exchange runs here. */}
      {status !== 'idle' && (
        <div className="md:hidden">
          <LiveCaptions
            turns={messages}
            interimText={status === 'listening' ? recognition.interimTranscript : ''}
            aiLabel={scenario.aiRole}
            emptyText="Go ahead — say hello."
          />
        </div>
      )}

      {status !== 'idle' && (
        <BottomBar
          muted={status === 'muted'}
          micDisabled={status === 'thinking'}
          textDisabled={status === 'thinking' || status === 'speaking'}
          onToggleMute={handleToggleMute}
          onSubmitText={submitTurn}
          onTypingFocusChange={setTypingFocused}
        />
      )}
    </div>
  )
}
