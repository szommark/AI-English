import { useCallback, useEffect, useRef, useState } from 'react'
import { Loader2, Mic, Send } from 'lucide-react'
import tutorPhoto from '../../assets/tutor-avatar.jpg'
import { TUTOR_VOICE_GENDER } from '../TutorBot/TutorAvatar'
import { useCourseCopy } from '../../data/courseCopy'
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis'
import { useTutorSpeechRecognition } from '../../hooks/useTutorSpeechRecognition'
import { OPEN_MAX, ROLEPLAY_LINE_MAX, isOpenAnswer, type CourseStep, type RoleplayLine, type StepAnswer } from '../../lib/courses'

type Roleplay = Extract<CourseStep, { type: 'roleplay' }>
type Phase = 'ready' | 'bot' | 'listening' | 'waiting' | 'thinking' | 'done'

/** The conversation as one text: what is stored and marked ("You:" lines are the learner's). */
export function roleplayTranscript(step: Roleplay, lines: RoleplayLine[]): string {
  return lines.map((l) => `${l.role === 'bot' ? step.botName : 'You'}: ${l.text}`).join('\n')
}

/** How many turns the learner has taken in a stored transcript. */
export function learnerTurns(transcript: string): number {
  return transcript.split('\n').filter((l) => l.startsWith('You: ')).length
}

/**
 * A spoken role-play with the Tutor Bot (its photo and voice): the situation and goals on top,
 * then the conversation. The bot opens, the learner answers hands-free (silence ends a turn, as on
 * the Tutor Bot page) or types; after the last turn the module's button asks for feedback.
 */
export default function RoleplayStep({
  step,
  answer,
  onAnswer,
  onTurn,
}: {
  step: Roleplay
  answer: StepAnswer | undefined
  onAnswer: (transcript: string) => void
  onTurn?: (history: RoleplayLine[]) => Promise<{ reply: string; done: boolean }>
}) {
  const { c } = useCourseCopy()
  const marked = isOpenAnswer(answer) ? answer : null
  const [lines, setLines] = useState<RoleplayLine[]>([])
  const [phase, setPhase] = useState<Phase>('ready')
  const [typed, setTyped] = useState('')
  const [error, setError] = useState<string | null>(null)
  const synthesis = useSpeechSynthesis(TUTOR_VOICE_GENDER)
  const linesRef = useRef<RoleplayLine[]>([])
  linesRef.current = lines
  const endRef = useRef<HTMLDivElement>(null)

  const turnsUsed = lines.filter((l) => l.role === 'learner').length

  const sendRef = useRef<(text: string) => void>(() => undefined)
  const recognition = useTutorSpeechRecognition({
    onUtterance: (text) => sendRef.current(text),
    onSilenceTimeout: () => setPhase((p) => (p === 'listening' ? 'waiting' : p)),
  })

  const listen = useCallback(() => {
    if (!recognition.supported || recognition.permissionDenied) {
      setPhase('waiting')
      return
    }
    setPhase('listening')
    recognition.start()
  }, [recognition])

  const sayAndListen = useCallback(
    (text: string, last: boolean) => {
      setPhase('bot')
      // Some devices never report the end of speech: move on after the time the line should take.
      let ended = false
      const next = () => {
        if (ended) return
        ended = true
        if (last) setPhase('done')
        else listen()
      }
      synthesis.speak(text, { onEnd: next })
      window.setTimeout(next, 2500 + text.split(/\s+/).length * 450)
    },
    [synthesis, listen],
  )

  async function send(raw: string) {
    const text = raw.trim().slice(0, ROLEPLAY_LINE_MAX)
    if (!text || !onTurn || phase === 'thinking' || phase === 'done') return
    recognition.stop()
    const history: RoleplayLine[] = [...linesRef.current, { role: 'learner', text }]
    setLines(history)
    onAnswer(roleplayTranscript(step, history))
    setTyped('')
    setError(null)
    setPhase('thinking')
    try {
      const { reply, done } = await onTurn(history)
      const next: RoleplayLine[] = [...history, { role: 'bot', text: reply }]
      setLines(next)
      onAnswer(roleplayTranscript(step, next))
      sayAndListen(reply, done || history.filter((l) => l.role === 'learner').length >= step.turns)
    } catch (err) {
      setError((err as { code?: string })?.code === 'daily_limit' ? c('roleplayLimit') : c('roleplayError'))
      setPhase('waiting')
    }
  }
  sendRef.current = (text) => void send(text)

  function start() {
    const first: RoleplayLine[] = [{ role: 'bot', text: step.opening }]
    setLines(first)
    onAnswer(roleplayTranscript(step, first))
    sayAndListen(step.opening, false)
  }

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'nearest' })
  }, [lines.length])
  useEffect(
    () => () => {
      synthesis.cancel()
      recognition.stop()
    },
    // On leaving the step only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const shown = marked ? marked.text.split('\n').map((l): RoleplayLine => (l.startsWith('You: ') ? { role: 'learner', text: l.slice(5) } : { role: 'bot', text: l.slice(l.indexOf(':') + 1).trim() })) : lines

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-secondary/40 p-3 text-sm">
        <p className="font-semibold text-foreground">{c('roleplaySituation')}</p>
        <p className="mt-1 text-foreground/90">{step.situation}</p>
        <p className="mt-2 font-semibold text-foreground">{c('roleplayGoals')}</p>
        <ul className="mt-1 list-disc space-y-0.5 pl-5 text-foreground/90">
          {step.goals.map((g) => (
            <li key={g}>{g}</li>
          ))}
        </ul>
        {step.targets && step.targets.length > 0 && (
          <p className="mt-2 text-muted-foreground">
            {c('tryToUse')} <span className="text-foreground">{step.targets.join(', ')}</span>
          </p>
        )}
      </div>

      {shown.length > 0 && (
        <ol className="space-y-2">
          {shown.map((l, i) => (
            <li key={i} className={`flex items-end gap-2 ${l.role === 'learner' ? 'justify-end' : ''}`}>
              {l.role === 'bot' && <img src={tutorPhoto} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />}
              <div
                className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${l.role === 'bot' ? 'rounded-bl-sm bg-card text-foreground ring-1 ring-border' : 'rounded-br-sm bg-[var(--teal-accent)] text-primary'}`}
              >
                {l.role === 'bot' && <span className="block text-[11px] font-semibold text-muted-foreground">{step.botName}</span>}
                {l.text}
              </div>
            </li>
          ))}
          {phase === 'listening' && recognition.interimTranscript && (
            <li className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-[var(--teal-accent-soft)] px-3 py-2 text-sm italic text-foreground">{recognition.interimTranscript}</div>
            </li>
          )}
          <div ref={endRef} />
        </ol>
      )}

      {!marked && (
        <>
          {phase === 'ready' && (
            <div className="flex items-center gap-3">
              <img src={tutorPhoto} alt="" className="h-14 w-14 rounded-full object-cover" />
              <button type="button" onClick={start} className="rounded-xl bg-[var(--teal-accent)] px-5 py-3 font-semibold text-primary">
                {c('roleplayStart')}
              </button>
            </div>
          )}
          {phase !== 'ready' && phase !== 'done' && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              {(phase === 'thinking' || phase === 'bot') && <Loader2 className="h-4 w-4 animate-spin" />}
              {phase === 'listening' && <Mic className="h-4 w-4 animate-pulse text-red-600" />}
              {phase === 'bot' ? c('roleplayBotSpeaking', { name: step.botName }) : phase === 'thinking' ? c('roleplayThinking') : phase === 'listening' ? c('roleplayListening') : c('roleplayYourTurn')}
              <span className="ml-auto text-xs">{c('roleplayTurns', { n: turnsUsed, m: step.turns })}</span>
            </p>
          )}
          {(phase === 'waiting' || phase === 'listening') && (
            // Not a <form>: the step sits inside the module player's form, and forms can't nest.
            <div className="flex items-center gap-2">
              {phase === 'waiting' && recognition.supported && !recognition.permissionDenied && (
                <button type="button" onClick={listen} aria-label={c('roleplaySpeak')} className="rounded-full bg-[var(--teal-accent)] p-3 text-primary">
                  <Mic className="h-5 w-5" />
                </button>
              )}
              <input
                value={typed}
                maxLength={ROLEPLAY_LINE_MAX}
                onChange={(e) => setTyped(e.target.value)}
                onKeyDown={(e) => {
                  // Enter sends this line instead of submitting the module (Get feedback).
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    void send(typed)
                  }
                }}
                placeholder={c('roleplayTypePlaceholder')}
                className="min-w-0 flex-1 rounded-xl border-2 border-border bg-card px-3 py-2.5 text-base text-foreground focus:border-[var(--teal-accent)] focus:outline-none"
              />
              <button type="button" onClick={() => void send(typed)} disabled={!typed.trim()} aria-label={c('roleplaySend')} className="rounded-xl border border-border p-2.5 text-foreground disabled:opacity-40">
                <Send className="h-5 w-5" />
              </button>
            </div>
          )}
          {phase === 'done' && <p className="rounded-xl bg-[var(--teal-accent-soft)] p-3 text-sm text-foreground">{c('roleplayDone')}</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </>
      )}

      {marked && (
        <div className="rounded-xl bg-[var(--teal-accent-soft)] p-4">
          <p className="text-2xl font-bold text-foreground">
            {marked.score}/{OPEN_MAX}
          </p>
          <p className="mt-1 text-base text-foreground">{marked.feedback}</p>
          {marked.corrections.length > 0 && (
            <ul className="mt-3 space-y-1 text-sm">
              {marked.corrections.map((x, i) => (
                <li key={i}>
                  <span className="text-red-700 line-through dark:text-red-300">{x.wrong}</span> → <span className="font-medium text-emerald-800 dark:text-emerald-200">{x.right}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
