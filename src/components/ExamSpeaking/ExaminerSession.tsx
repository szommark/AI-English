import { useEffect, useRef, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import type { SpeakingTask } from '../../data/exams/speaking'
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis'
import { useTutorSpeechRecognition } from '../../hooks/useTutorSpeechRecognition'
import { sendSpeakingTurn } from '../../lib/examSpeakingApi'
import { useLanguage } from '../../lib/i18n'
import { LISTEN_START_DELAY_MS, looksLikeEcho } from '../../lib/tutorTurnTaking'
import type { ChatMessage } from '../../lib/types'
import BottomBar from '../TutorBot/BottomBar'
import LiveCaptions from '../TutorBot/LiveCaptions'
import StateIndicator from '../TutorBot/StateIndicator'
import TutorAvatar, { TUTOR_VOICE_GENDER } from '../TutorBot/TutorAvatar'

type Status = 'idle' | 'thinking' | 'speaking' | 'listening' | 'muted' | 'done'

const REPROMPT_LINE = 'Take your time — whenever you are ready.'

/**
 * One speaking task with the AI examiner, in the Tutor Bot's voice interface: the examiner
 * speaks (TTS), the mic listens for the learner's turn, typing works too. The conversation
 * is handed up after every turn so the page can keep it; the task ends when the examiner
 * closes it or the learner ends it.
 */
export default function ExaminerSession({
  paperId,
  task,
  messages,
  done,
  autoStart,
  onMessages,
  onDone,
}: {
  paperId: string
  task: SpeakingTask
  messages: ChatMessage[]
  done: boolean
  /** Start right away (the learner just clicked to get here, so speech is allowed). */
  autoStart: boolean
  onMessages: (messages: ChatMessage[]) => void
  onDone: () => void
}) {
  const { t } = useLanguage()
  const synthesis = useSpeechSynthesis(TUTOR_VOICE_GENDER)
  const [status, setStatus] = useState<Status>(done ? 'done' : 'idle')
  const [error, setError] = useState(false)
  const [typingFocused, setTypingFocused] = useState(false)

  const messagesRef = useRef(messages)
  const statusRef = useRef(status)
  const pendingDoneRef = useRef(false)
  const wasSpeakingRef = useRef(false)
  const silenceStreakRef = useRef(0)
  const startedRef = useRef(false)

  useEffect(() => {
    statusRef.current = status
  }, [status])

  function setMessages(next: ChatMessage[]) {
    messagesRef.current = next
    onMessages(next)
  }

  function finish() {
    recognition.stop()
    synthesis.cancel()
    pendingDoneRef.current = false
    setStatus('done')
    onDone()
  }

  function say(text: string) {
    if (!synthesis.supported) {
      afterSpeaking()
      return
    }
    setStatus('speaking')
    synthesis.speak(text)
  }

  function afterSpeaking() {
    if (pendingDoneRef.current) finish()
    else setStatus('listening')
  }

  async function requestTurn(history: ChatMessage[]) {
    setError(false)
    setStatus('thinking')
    try {
      const res = await sendSpeakingTurn({ paperId, taskId: task.id, history })
      setMessages([...history, { role: 'assistant', content: res.reply }])
      pendingDoneRef.current = res.taskDone
      say(res.reply)
    } catch (err) {
      console.error('Speaking exam turn failed', err)
      setError(true)
      setStatus('idle')
    }
  }

  function submitTurn(text: string) {
    silenceStreakRef.current = 0
    recognition.stop()
    requestTurn([...messagesRef.current, { role: 'user', content: text }])
  }

  function handleUtterance(text: string) {
    if (statusRef.current !== 'listening') return
    const lastExaminerLine = messagesRef.current.filter((m) => m.role === 'assistant').at(-1)?.content
    if (looksLikeEcho(text, lastExaminerLine)) {
      console.warn('[exam-speech] discarded a captured turn that looked like echo of the examiner:', text)
      recognition.start()
      return
    }
    submitTurn(text)
  }

  function handleSilenceTimeout() {
    if (statusRef.current !== 'listening') return
    silenceStreakRef.current += 1
    if (silenceStreakRef.current === 2) say(REPROMPT_LINE)
    else if (silenceStreakRef.current >= 3) {
      recognition.stop()
      setStatus('muted')
    } else recognition.start()
  }

  const recognition = useTutorSpeechRecognition({ onUtterance: handleUtterance, onSilenceTimeout: handleSilenceTimeout })
  const micAvailable = recognition.supported && !recognition.permissionDenied

  /** Start the task, or pick it up again after a reload. */
  function begin() {
    startedRef.current = true
    const history = messagesRef.current
    if (history.length === 0 || history.at(-1)?.role === 'user') requestTurn(history)
    else setStatus('listening')
  }

  useEffect(() => {
    if (autoStart && !done && !startedRef.current) begin()
    return () => {
      recognition.stop()
      synthesis.cancel()
    }
    // Mount only: the task component is keyed by task id.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // speaking → listening (or done) once the examiner's line has been read out.
  useEffect(() => {
    if (synthesis.speaking) {
      wasSpeakingRef.current = true
      return
    }
    if (!wasSpeakingRef.current) return
    wasSpeakingRef.current = false
    if (statusRef.current === 'speaking') afterSpeaking()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [synthesis.speaking])

  // The mic runs during the learner's turn, paused while they type.
  useEffect(() => {
    if (status !== 'listening' || !micAvailable) return
    if (typingFocused) {
      recognition.stop()
      return
    }
    const timer = setTimeout(() => recognition.start(), LISTEN_START_DELAY_MS)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, typingFocused, micAvailable])

  function toggleMute() {
    if (status === 'speaking') {
      synthesis.cancel()
      setStatus('listening')
    } else if (status === 'listening') {
      recognition.stop()
      setStatus('muted')
    } else if (status === 'muted') {
      silenceStreakRef.current = 0
      setStatus('listening')
    }
  }

  const indicator = status === 'listening' && !micAvailable ? 'muted' : status
  const learnerHasSpoken = messages.some((m) => m.role === 'user')

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="w-24 shrink-0 sm:w-32 lg:w-36">
          <TutorAvatar />
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <p className="text-sm font-semibold text-foreground">{t('exSpkExaminer')}</p>
          {(indicator === 'listening' || indicator === 'thinking' || indicator === 'speaking' || indicator === 'muted') && (
            <StateIndicator state={indicator} />
          )}
          {status === 'idle' && (
            <button
              type="button"
              onClick={begin}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              {error && <RotateCcw className="h-4 w-4" />}
              {error ? t('exRetry') : messages.length ? t('exSpkResumeTask') : t('exSpkBeginTask')}
            </button>
          )}
          {error && <p className="text-sm text-rose-700" role="alert">{t('exSpkTurnFailed')}</p>}
          {status === 'done' && <p className="text-sm font-medium text-emerald-700">{t('exSpkTaskDone')}</p>}
        </div>
      </div>

      {recognition.permissionDenied && (
        <p className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">{t('exSpkMicBlocked')}</p>
      )}

      <LiveCaptions
        turns={messages}
        interimText={status === 'listening' ? recognition.interimTranscript : ''}
        aiLabel={t('exSpkExaminer')}
        userLabel={t('exSpkYou')}
        emptyText={t('exSpkHowItWorks')}
      />

      {status !== 'idle' && status !== 'done' && (
        <BottomBar
          muted={status === 'muted' || !micAvailable}
          micDisabled={status === 'thinking' || !micAvailable}
          endDisabled={false}
          textDisabled={status === 'thinking' || status === 'speaking'}
          onToggleMute={toggleMute}
          onEnd={finish}
          onSubmitText={submitTurn}
          onTypingFocusChange={setTypingFocused}
        />
      )}

      {status !== 'done' && learnerHasSpoken && (
        <button
          type="button"
          onClick={finish}
          className="min-h-11 rounded-xl border border-border bg-card px-4 text-sm font-medium text-foreground hover:bg-muted"
        >
          {t('exSpkEndTask')}
        </button>
      )}
    </div>
  )
}
