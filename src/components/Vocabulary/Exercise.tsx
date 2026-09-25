import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { useLanguage } from '../../lib/i18n'
import { answerHint, checkTypedAnswer, gapSentence, practiceSentence, shuffle, type AnswerCheck } from '../../lib/vocabPractice'
import type { ExerciseContent, PracticeExercise } from '../../lib/vocab'
import { SpeakerIcon } from '../icons/AudioIcons'

export interface ExerciseOutcome {
  correct: boolean
  /** Hint, second attempt or a one-letter typo — rated Hard. */
  usedHint: boolean
  responseMs: number
  check: AnswerCheck
}

export interface Speech {
  supported: boolean
  speak: (text: string, options?: { rate?: number }) => void
}

/** Slower playback for the "Slowly" button in listening exercises. */
const SLOW_RATE = 0.7

const inputClass =
  'w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground placeholder:text-muted-foreground/70 focus:border-[var(--teal-accent)] focus:outline-none'
const primaryButton =
  'rounded-lg bg-[var(--teal-accent)] px-4 py-2.5 text-sm font-semibold text-primary hover:bg-[var(--teal-accent-strong)] disabled:opacity-40'
const secondaryButton =
  'rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-secondary disabled:opacity-40'

function SpeakButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick} className={`${secondaryButton} inline-flex items-center gap-1.5`}>
      <SpeakerIcon className="h-4 w-4" />
      {label}
    </button>
  )
}

/** One exercise of the practice ladder (design §7). Reports once, via onDone. */
export default function Exercise({
  card,
  exercise,
  speech,
  onDone,
}: {
  card: ExerciseContent
  exercise: PracticeExercise
  speech: Speech
  onDone: (outcome: ExerciseOutcome) => void
}) {
  return exercise === 'recognition' ? (
    <Recognition card={card} speech={speech} onDone={onDone} />
  ) : (
    <Typed card={card} exercise={exercise} speech={speech} onDone={onDone} />
  )
}

function Recognition({ card, speech, onDone }: { card: ExerciseContent; speech: Speech; onDone: (o: ExerciseOutcome) => void }) {
  const { t } = useLanguage()
  const started = useRef(performance.now())
  const options = useMemo(() => shuffle([card.meaningHu!, ...card.distractors]), [card])

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">{t('vcExRecognition')}</p>
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-2xl font-semibold text-foreground">{card.term}</p>
        {speech.supported && <SpeakButton onClick={() => speech.speak(card.term)} label={t('vcPlay')} />}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => {
              const correct = option === card.meaningHu
              onDone({
                correct,
                usedHint: false,
                responseMs: performance.now() - started.current,
                check: correct ? 'exact' : 'wrong',
              })
            }}
            className="rounded-xl border border-border bg-card px-4 py-3 text-left text-sm text-foreground hover:border-[var(--teal-accent)] hover:bg-[var(--teal-accent-soft)]"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}

function Typed({
  card,
  exercise,
  speech,
  onDone,
}: {
  card: ExerciseContent
  exercise: Exclude<PracticeExercise, 'recognition'>
  speech: Speech
  onDone: (o: ExerciseOutcome) => void
}) {
  const { t } = useLanguage()
  const started = useRef(performance.now())
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState('')
  const [hintShown, setHintShown] = useState(false)
  const [retrying, setRetrying] = useState(false)

  const sentence = practiceSentence(card)
  const gap = exercise === 'recall' ? null : gapSentence(sentence, card.term)
  // Compare against the sentence's own form when there is one ("Book a table" at the
  // start of a sentence); the check ignores case either way.
  const expected = gap?.answer ?? card.term
  const listenText = exercise === 'listening' ? (gap ? sentence! : card.term) : null

  useEffect(() => {
    inputRef.current?.focus()
    if (listenText && speech.supported) speech.speak(listenText)
    // Once per exercise: the parent remounts this component for every card.
  }, [])

  function finish(check: AnswerCheck) {
    onDone({
      correct: check !== 'wrong',
      usedHint: hintShown || retrying || check === 'typo',
      responseMs: performance.now() - started.current,
      check,
    })
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!value.trim()) return
    const check = checkTypedAnswer(expected, value)
    // One second try after a wrong answer (design §6.1: "second attempt" → Hard).
    if (check === 'wrong' && !retrying) {
      setRetrying(true)
      setValue('')
      inputRef.current?.focus()
      return
    }
    finish(check)
  }

  const instruction =
    exercise === 'recall'
      ? t('vcExRecall')
      : exercise === 'context'
        ? t('vcExContext')
        : gap
          ? t('vcExListening')
          : t('vcExListeningTerm')

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">{instruction}</p>

      {exercise === 'recall' && <p className="text-2xl font-semibold text-foreground">{card.meaningHu}</p>}

      {gap && (
        <p className="text-lg leading-relaxed text-foreground">
          {gap.before}
          <span className="mx-1 inline-block min-w-[5rem] border-b-2 border-[var(--teal-accent)] text-center text-muted-foreground">
            {hintShown ? answerHint(gap.answer) : ' '}
          </span>
          {gap.after}
        </p>
      )}
      {exercise === 'context' && card.meaningHu && <p className="text-sm text-muted-foreground">({card.meaningHu})</p>}

      {listenText && speech.supported && (
        <div className="flex flex-wrap gap-2">
          <SpeakButton onClick={() => speech.speak(listenText)} label={t('vcPlay')} />
          <SpeakButton onClick={() => speech.speak(listenText, { rate: SLOW_RATE })} label={t('vcPlaySlow')} />
        </div>
      )}

      {hintShown && !gap && <p className="font-mono text-lg tracking-wider text-muted-foreground">{answerHint(expected)}</p>}

      <form onSubmit={submit} className="space-y-3">
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t('vcAnswerPlaceholder')}
          aria-label={t('vcAnswerPlaceholder')}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          className={`${inputClass} ${retrying ? 'border-amber-400' : ''}`}
        />
        {retrying && (
          <p className="text-sm text-amber-700" role="status">
            {t('vcTryAgain')}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <button type="submit" disabled={!value.trim()} className={primaryButton}>
            {t('vcCheck')}
          </button>
          <button type="button" disabled={hintShown} onClick={() => setHintShown(true)} className={secondaryButton}>
            {t('vcHint')}
          </button>
          <button type="button" onClick={() => finish('wrong')} className={secondaryButton}>
            {t('vcDontKnow')}
          </button>
        </div>
      </form>
    </div>
  )
}
