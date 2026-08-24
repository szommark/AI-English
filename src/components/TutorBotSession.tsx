import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { ChatMessage } from '../lib/types'
import { useTutorSpeechRecognition } from '../hooks/useTutorSpeechRecognition'
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis'
import { sendTutorTurn } from '../lib/tutorBotApi'
import UnsupportedBrowserNotice from './UnsupportedBrowserNotice'
import MouthBubbleLayer from './SpeechBubble/MouthBubbleLayer'
import TranscriptLines from './SpeechBubble/TranscriptLines'
import TutorAvatar, { TUTOR_MOUTH_ANCHOR, TUTOR_VOICE_GENDER } from './TutorBot/TutorAvatar'
import StateIndicator, { type IndicatorState } from './TutorBot/StateIndicator'
import LiveCaptions from './TutorBot/LiveCaptions'
import BottomBar from './TutorBot/BottomBar'

// Cheap client-side "have they used Tutor Bot before" signal for isFirstSession —
// no per-learner backend profile is wired up yet (see api/tutor-chat.ts).
const VISITED_KEY = 'tutorBot:hasStarted'

const REPROMPT_LINES = [
  "Still there? Take your time.",
  "No rush — whenever you're ready, go ahead.",
]

const APOLOGY_LINE = "Sorry, I had trouble there — could you say that again?"

// Without headphones, the tutor's own TTS audio can leak back into the mic (no echo
// cancellation on the Web Speech API's capture, unlike a WebRTC call). Waiting a beat
// before reopening the mic lets any trailing playback/room reverb settle first.
const LISTEN_START_DELAY_MS = 500

// Second line of defense against that same leak: if the mic capture is suspiciously
// similar to what the tutor itself just said, treat it as echo rather than a real turn.
// Kept conservative (high overlap, longer minimum) — learners often echo back words
// from the tutor's own question as part of a natural answer, so this should only catch
// near-verbatim repeats, not just shared vocabulary.
const ECHO_OVERLAP_THRESHOLD = 0.85
const ECHO_MIN_WORDS = 6

function normalizeWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

function looksLikeEcho(candidate: string, lastAssistantText: string | undefined): boolean {
  if (!lastAssistantText) return false
  const candidateWords = normalizeWords(candidate)
  if (candidateWords.length < ECHO_MIN_WORDS) return false
  const assistantWords = new Set(normalizeWords(lastAssistantText))
  if (assistantWords.size === 0) return false
  const shared = candidateWords.filter((w) => assistantWords.has(w)).length
  return shared / candidateWords.length >= ECHO_OVERLAP_THRESHOLD
}

type Status = 'idle' | 'listening' | 'thinking' | 'speaking' | 'muted' | 'ended'

export default function TutorBotSession() {
  const synthesis = useSpeechSynthesis(TUTOR_VOICE_GENDER)
  const photoContainerRef = useRef<HTMLDivElement>(null)

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [turnIndex, setTurnIndex] = useState(0)
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const [permissionMessage, setPermissionMessage] = useState<string | null>(null)
  const [typingFocused, setTypingFocused] = useState(false)
  const [autoMuted, setAutoMuted] = useState(false)

  const statusRef = useRef(status)
  const pendingEndRef = useRef(false)
  const wasSpeakingRef = useRef(false)
  const emptyStreakRef = useRef(0)
  const isFirstSessionRef = useRef(typeof window !== 'undefined' ? !window.localStorage.getItem(VISITED_KEY) : true)

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
      const response = await sendTutorTurn({
        history: updatedMessages,
        turnIndex,
        isFirstSession: isFirstSessionRef.current,
      })

      const assistantMessage: ChatMessage = { role: 'assistant', content: response.reply }
      setMessages((prev) => [...prev, assistantMessage])

      if (response.ended) {
        pendingEndRef.current = true
      } else {
        setTurnIndex((i) => i + 1)
      }
      setStatus('speaking')
      synthesis.speak(response.reply)
    } catch (err) {
      console.error('Tutor Bot turn failed', err)
      speakCanned(APOLOGY_LINE)
    }
  }

  function speakCanned(text: string) {
    setMessages((prev) => [...prev, { role: 'assistant', content: text }])
    setStatus('speaking')
    synthesis.speak(text)
  }

  // Defense-in-depth against a stale/duplicate recognizer callback: only a turn that
  // fires while we're actually listening for one should ever be processed.
  function handleUtterance(text: string) {
    if (statusRef.current !== 'listening') return
    const lastAssistantText = messages.filter((m) => m.role === 'assistant').at(-1)?.content
    if (looksLikeEcho(text, lastAssistantText)) {
      console.warn('[tutor-speech] discarded a captured turn that looked like echo of the tutor\'s own voice:', text)
      recognition.start()
      return
    }
    submitTurn(text)
  }

  function handleSilenceTimeout() {
    if (statusRef.current !== 'listening') return
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
  // The delay before (re)starting gives any trailing TTS playback a moment to clear the
  // speakers first — see LISTEN_START_DELAY_MS.
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

  async function handleStart() {
    setError(null)
    setStatus('thinking')
    try {
      const response = await sendTutorTurn({ history: [], turnIndex: 0, isFirstSession: isFirstSessionRef.current })
      window.localStorage.setItem(VISITED_KEY, '1')
      setMessages([{ role: 'assistant', content: response.reply }])
      setStatus('speaking')
      synthesis.speak(response.reply)
    } catch (err) {
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

  function handleEnd() {
    recognition.stop()
    synthesis.cancel()
    pendingEndRef.current = false
    setStatus('ended')
  }

  const assistantMessages = messages.filter((m) => m.role === 'assistant')
  const lastAssistantText = assistantMessages.at(-1)?.content ?? null
  const allTurns = messages.map((m) => ({ role: m.role, text: m.content }))

  if (status === 'ended') {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-slate-800">Session ended</h2>

        <div className="hidden md:block relative mx-auto w-full max-w-xs">
          <TutorAvatar />
        </div>

        {messages.length > 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
            <h2 className="font-medium text-slate-700">Conversation transcript</h2>
            <TranscriptLines turns={allTurns} aiLabel="Tutor" />
          </div>
        ) : (
          <p className="text-sm text-slate-500">No conversation recorded for this session.</p>
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
        {status !== 'idle' && <span className="text-sm text-slate-500">Turn {turnIndex + 1}</span>}
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
          micDisabled={status === 'thinking'}
          endDisabled={false}
          textDisabled={status === 'thinking' || status === 'speaking'}
          onToggleMute={handleToggleMute}
          onEnd={handleEnd}
          onSubmitText={submitTurn}
          onTypingFocusChange={setTypingFocused}
        />
      )}
    </div>
  )
}
