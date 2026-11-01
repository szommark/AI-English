import { useEffect, useRef, useState } from 'react'
import { Mic, RotateCcw } from 'lucide-react'
import { TutorPortrait } from './RoleplayStep'
import { TUTOR_VOICE_GENDER } from '../TutorBot/TutorAvatar'
import WordSpeakButton from '../WordSpeakButton'
import { InlineText, plainLine } from './RichText'
import { useCourseCopy } from '../../data/courseCopy'
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis'
import type { CourseStep } from '../../lib/courses'

type Speak = Extract<CourseStep, { type: 'speak' }>
type Phase = 'ready' | 'bot' | 'recording' | 'done'

/** A pause this long after the learner has said something ends the answer (the Tutor Bot page uses less). */
export const SPEAK_SILENCE_MS = 3000

interface RecognitionLike {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((e: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null
  onend: (() => void) | null
  onerror: ((e: { error?: string }) => void) | null
  start: () => void
  stop: () => void
}

function recognitionCtor(): (new () => RecognitionLike) | null {
  const w = window as unknown as { SpeechRecognition?: new () => RecognitionLike; webkitSpeechRecognition?: new () => RecognitionLike }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

/** The countdown as a ring with m:ss in the middle. */
function Countdown({ left, total }: { left: number; total: number }) {
  const r = 24
  const len = 2 * Math.PI * r
  const shown = Math.max(0, Math.ceil(left))
  return (
    <svg viewBox="0 0 56 56" className="h-14 w-14" role="timer" aria-label={`${shown}s`}>
      <circle cx="28" cy="28" r={r} fill="none" strokeWidth="4" className="stroke-secondary" />
      <circle
        cx="28"
        cy="28"
        r={r}
        fill="none"
        strokeWidth="4"
        strokeLinecap="round"
        className="stroke-[var(--teal-accent)] transition-[stroke-dashoffset] duration-300"
        strokeDasharray={len}
        strokeDashoffset={len * (1 - Math.max(0, left) / total)}
        transform="rotate(-90 28 28)"
      />
      <text x="28" y="32" textAnchor="middle" className="fill-foreground text-[13px] font-semibold">
        {Math.floor(shown / 60)}:{String(shown % 60).padStart(2, '0')}
      </text>
    </svg>
  )
}

/**
 * The one-exchange speaking task: the Tutor Bot (as the person in the situation) asks one question
 * out loud, then the learner answers against a countdown. The answer ends when time runs out, when
 * they tap Done, or after SPEAK_SILENCE_MS of silence once they have said something. The transcript
 * can be corrected before asking for feedback; the model answer shows after answering.
 */
export default function SpeakStep({ step, answer, onAnswer, speak }: { step: Speak; answer: string; onAnswer: (text: string) => void; speak: (text: string) => void }) {
  const { c } = useCourseCopy()
  const synthesis = useSpeechSynthesis(TUTOR_VOICE_GENDER)
  const [canRecognize] = useState(() => typeof window !== 'undefined' && recognitionCtor() !== null)
  // A blocked or missing microphone: the learner types instead.
  const [micBlocked, setMicBlocked] = useState(false)
  const supported = canRecognize && !micBlocked
  const [phase, setPhase] = useState<Phase>(answer.trim() ? 'done' : 'ready')
  const [left, setLeft] = useState(step.seconds)
  const [interim, setInterim] = useState('')
  const recRef = useRef<RecognitionLike | null>(null)
  const phaseRef = useRef(phase)
  phaseRef.current = phase
  const textRef = useRef(answer)
  textRef.current = answer
  const heardAt = useRef(0)
  const startedAt = useRef(0)

  const line = step.botLine ?? step.prompt
  const botName = step.botName ?? 'Tutor'

  function finish() {
    if (phaseRef.current !== 'recording') return
    phaseRef.current = 'done'
    recRef.current?.stop()
    recRef.current = null
    setInterim('')
    setPhase('done')
  }

  function listen() {
    const Ctor = recognitionCtor()
    if (!Ctor) return
    const r = new Ctor()
    r.lang = 'en-US'
    r.continuous = true
    r.interimResults = true
    r.onresult = (e) => {
      let live = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const text = e.results[i][0].transcript
        if (e.results[i].isFinal) {
          const prev = textRef.current.trim()
          textRef.current = `${prev}${prev && text.trim() ? ' ' : ''}${text.trim()}`
          onAnswer(textRef.current)
        } else live += text
      }
      heardAt.current = Date.now()
      setInterim(live)
    }
    // Browsers end recognition on their own after a while; keep listening until the answer ends.
    r.onend = () => {
      if (phaseRef.current !== 'recording' || recRef.current !== r) return
      try {
        r.start()
      } catch {
        // already running
      }
    }
    r.onerror = (e) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed' || e.error === 'audio-capture') {
        recRef.current = null
        setInterim('')
        setMicBlocked(true)
      }
    }
    recRef.current = r
    r.start()
  }

  function startRecording() {
    if (phaseRef.current !== 'bot') return
    phaseRef.current = 'recording'
    startedAt.current = Date.now()
    heardAt.current = 0
    setLeft(step.seconds)
    setPhase('recording')
    if (supported) listen()
  }

  function start() {
    onAnswer('')
    textRef.current = ''
    setPhase('bot')
    phaseRef.current = 'bot'
    // Some devices never report the end of speech: start after the time the line should take.
    let begun = false
    const go = () => {
      if (begun) return
      begun = true
      startRecording()
    }
    synthesis.speak(plainLine(line), { onEnd: go })
    window.setTimeout(go, 2500 + line.split(/\s+/).length * 450)
  }

  // The clock: time out, or a long enough pause after the learner has spoken.
  useEffect(() => {
    if (phase !== 'recording') return
    const t = window.setInterval(() => {
      const elapsed = (Date.now() - startedAt.current) / 1000
      setLeft(step.seconds - elapsed)
      if (elapsed >= step.seconds) finish()
      else if (supported && heardAt.current && textRef.current.trim() && Date.now() - heardAt.current >= SPEAK_SILENCE_MS) finish()
    }, 250)
    return () => window.clearInterval(t)
    // finish only reads refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, step.seconds, supported])

  useEffect(
    () => () => {
      synthesis.cancel()
      const r = recRef.current
      recRef.current = null
      // stop() still delivers the last results; after leaving (or being marked) they're dropped.
      if (r) r.onresult = null
      r?.stop()
    },
    // On leaving the step only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  return (
    <div className="space-y-4">
      {/* The bot big, in its own column; its question, the countdown and the task beside it. */}
      <div className="grid gap-4 sm:grid-cols-[minmax(0,18rem)_1fr] sm:items-center">
        <TutorPortrait />
        <div className="min-w-0 space-y-3">
          <div className="flex items-center gap-3">
            <p className="flex-1 text-sm font-semibold text-muted-foreground">{botName}</p>
            {phase === 'recording' && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{c('speakCountdown')}</span>
                <Countdown left={left} total={step.seconds} />
              </div>
            )}
          </div>
          {phase !== 'ready' && (
            <div className="flex items-start gap-2 rounded-2xl rounded-tl-sm bg-card p-3 text-base text-foreground ring-1 ring-border">
              <p className="flex-1">
                <InlineText text={line} />
              </p>
              <WordSpeakButton label={c('listen')} onSpeak={() => speak(plainLine(line))} />
            </div>
          )}
          {step.botLine && (
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{c('speakTask')}:</span> <InlineText text={step.prompt} />
            </p>
          )}
          {step.targets && step.targets.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 text-sm">
              <span className="text-muted-foreground">{c('tryToUse')}</span>
              {step.targets.map((t) => (
                <span key={t} className="rounded-md bg-[var(--teal-accent-soft)] px-2 py-0.5 text-foreground">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {phase === 'ready' && (
        <div className="space-y-2">
          <button type="button" onClick={start} className="rounded-xl bg-[var(--teal-accent)] px-5 py-3 font-semibold text-primary">
            {c('speakStart')}
          </button>
          <p className="text-xs text-muted-foreground">{supported ? c('speakEndHint') : c('speakTypeHint')}</p>
        </div>
      )}
      {phase === 'bot' && <p className="text-sm text-muted-foreground">{c('speakBotAsks', { name: botName })}</p>}

      {phase === 'recording' && supported && (
        <div className="space-y-3">
          {(answer || interim) && (
            <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-[var(--teal-accent)] px-3 py-2 text-sm text-primary">
              {answer}
              {interim && <span className="italic opacity-80">{answer ? ' ' : ''}{interim}</span>}
            </div>
          )}
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-sm text-red-600">
              <Mic className="h-4 w-4 animate-pulse" />
              {c('speakListening')}
            </span>
            <button type="button" onClick={finish} className="ml-auto rounded-xl border-2 border-[var(--teal-accent)] px-5 py-2 font-semibold text-foreground">
              {c('speakFinish')}
            </button>
          </div>
        </div>
      )}

      {(phase === 'done' || (phase === 'recording' && !supported)) && (
        <div className="space-y-2">
          <textarea
            value={answer}
            onChange={(e) => onAnswer(e.target.value)}
            placeholder={c('speakPlaceholder')}
            className="min-h-[7rem] w-full rounded-xl border-2 border-border bg-card px-4 py-3 text-base text-foreground focus:border-[var(--teal-accent)] focus:outline-none"
          />
          <div className="flex items-center gap-3">
            <p className="flex-1 text-xs text-muted-foreground">{supported ? c('speakFixHint') : c('speakTypeHint')}</p>
            {phase === 'done' && (
              <button type="button" onClick={start} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm text-foreground hover:bg-secondary">
                <RotateCcw className="h-4 w-4" />
                {c('speakAgain')}
              </button>
            )}
          </div>
          {phase === 'done' && step.model && (
            <div className="rounded-xl border border-border bg-secondary/50 p-3 text-sm">
              <div className="flex items-start gap-2">
                <p className="flex-1 text-foreground">
                  <span className="font-semibold">{c('modelAnswer')}:</span> <InlineText text={step.model} />
                </p>
                <WordSpeakButton label={c('listen')} onSpeak={() => speak(plainLine(step.model as string))} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
