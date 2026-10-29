import { useEffect, useMemo, useRef, useState } from 'react'
import { CheckCircle2, Mic, Square, XCircle } from 'lucide-react'
import WordSpeakButton from '../WordSpeakButton'
import RichText from './RichText'
import { useCourseCopy } from '../../data/courseCopy'
import { GAP } from '../../lib/grammarExercises'
import { OPEN_MAX, countWords, isOpenAnswer, orderTiles, seededShuffle, stepScore, type CourseStep, type ModulePassage, type OpenAnswer, type StepAnswer } from '../../lib/courses'

interface Props {
  step: CourseStep
  answer: StepAnswer | undefined
  onAnswer: (answer: StepAnswer) => void
  /** After "Check": the answer is locked and marked. */
  checked: boolean
  passage?: ModulePassage
  seed: string
  speak: (text: string) => void
  /** Listening: the module's recording. */
  audioUrl?: string | null
}

const optionBase = 'w-full rounded-xl border-2 px-4 py-3 text-left text-base transition-colors disabled:cursor-default'
const tileBase = 'rounded-lg border-2 px-3 py-2 text-base font-medium transition-colors'

/** One step of a module on one screen: what it shows, and its answer controls. */
export default function StepView(props: Props) {
  const { step } = props
  switch (step.type) {
    case 'info':
      return (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">{step.title}</h2>
          <RichText text={step.body} className="text-base leading-relaxed text-foreground/90" />
        </div>
      )
    case 'words':
      return <WordsStep {...props} step={step} />
    case 'text':
      return <TextStep passage={props.passage} />
    case 'choice':
      return <ChoiceStep {...props} step={step} />
    case 'gap':
      return <GapStep {...props} step={step} />
    case 'match':
      return <MatchStep {...props} step={step} />
    case 'order':
      return <OrderStep {...props} step={step} />
    case 'listen':
      return <ListenStep audioUrl={props.audioUrl} />
    case 'write':
    case 'speak':
      return <OpenStep {...props} step={step} />
  }
}

function WordsStep({ step, speak }: Props & { step: Extract<CourseStep, { type: 'words' }> }) {
  const { c } = useCourseCopy()
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-foreground">{c('wordsTitle')}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{c('wordsHint')}</p>
      </div>
      <ul className="space-y-3">
        {step.words.map((w) => (
          <li key={w.term} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-lg font-semibold text-foreground">
                  {w.term}
                  {w.pos && <span className="ml-2 text-xs font-normal italic text-muted-foreground">{w.pos}</span>}
                </p>
                <p className="mt-1 text-base text-foreground/90">{w.meaning}</p>
                {w.example && <p className="mt-2 text-sm italic text-muted-foreground">“{w.example}”</p>}
              </div>
              <WordSpeakButton label={c('listen')} onSpeak={() => speak(w.example ? `${w.term}. ${w.example}` : w.term)} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function TextStep({ passage }: { passage?: ModulePassage }) {
  const { c } = useCourseCopy()
  if (!passage) return null
  return (
    <article className="space-y-4">
      <p className="text-sm text-muted-foreground">{c('textHint')}</p>
      {passage.title && <h2 className="text-xl font-semibold text-foreground">{passage.title}</h2>}
      <RichText text={passage.text} className="text-base leading-relaxed text-foreground/90" />
    </article>
  )
}

function Prompt({ text }: { text: string }) {
  return <p className="text-lg font-medium leading-snug text-foreground">{text}</p>
}

function ChoiceStep({ step, answer, onAnswer, checked }: Props & { step: Extract<CourseStep, { type: 'choice' }> }) {
  return (
    <div className="space-y-4">
      <Prompt text={step.prompt} />
      <div className="space-y-2">
        {step.options.map((o, i) => {
          const picked = answer === i
          const right = checked && i === step.answer
          const wrong = checked && picked && i !== step.answer
          return (
            <button
              key={i}
              type="button"
              disabled={checked}
              onClick={() => onAnswer(i)}
              className={`${optionBase} ${
                right
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100'
                  : wrong
                    ? 'border-red-400 bg-red-50 text-red-900 dark:bg-red-950/40 dark:text-red-100'
                    : picked
                      ? 'border-[var(--teal-accent)] bg-[var(--teal-accent-soft)] text-foreground'
                      : 'border-border bg-card text-foreground hover:border-[var(--teal-accent-border)]'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="flex-1">{o}</span>
                {right && <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />}
                {wrong && <XCircle className="h-5 w-5 shrink-0 text-red-500" />}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function GapStep({ step, answer, onAnswer, checked, seed }: Props & { step: Extract<CourseStep, { type: 'gap' }> }) {
  const { c } = useCourseCopy()
  const [before, after = ''] = step.sentence.split(GAP)
  const value = typeof answer === 'string' ? answer : ''
  const options = useMemo(() => (step.options ? seededShuffle(step.options, `${seed}:${step.id}`) : null), [step.options, seed, step.id])
  const correct = checked && stepScore(step, value) === 1
  const slotClass = checked
    ? correct
      ? 'border-emerald-500 text-emerald-800 dark:text-emerald-200'
      : 'border-red-400 text-red-700 line-through dark:text-red-300'
    : value
      ? 'border-[var(--teal-accent)] text-foreground'
      : 'border-muted-foreground/40 text-transparent'

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">{options ? c('gapTapHint') : c('gapTypeHint')}</p>
      <p className="text-lg leading-loose text-foreground">
        {before}
        <span className={`mx-1 inline-block min-w-[4.5rem] border-b-2 px-1 text-center font-semibold ${slotClass}`}>{value || '·'}</span>
        {after}
      </p>
      {options ? (
        <div className="flex flex-wrap gap-2">
          {options.map((o) => (
            <button
              key={o}
              type="button"
              disabled={checked}
              onClick={() => onAnswer(o)}
              className={`${tileBase} ${value === o ? 'border-[var(--teal-accent)] bg-[var(--teal-accent-soft)]' : 'border-border bg-card hover:border-[var(--teal-accent-border)]'}`}
            >
              {o}
            </button>
          ))}
        </div>
      ) : (
        <input
          type="text"
          value={value}
          disabled={checked}
          onChange={(e) => onAnswer(e.target.value)}
          autoCapitalize="off"
          autoComplete="off"
          spellCheck={false}
          placeholder={c('typeAnswer')}
          className="w-full rounded-xl border-2 border-border bg-card px-4 py-3 text-lg text-foreground focus:border-[var(--teal-accent)] focus:outline-none"
        />
      )}
    </div>
  )
}

function MatchStep({ step, answer, onAnswer, checked, seed }: Props & { step: Extract<CourseStep, { type: 'match' }> }) {
  const { c } = useCourseCopy()
  const picks = Array.isArray(answer) ? (answer as number[]) : step.pairs.map(() => -1)
  const [selected, setSelected] = useState<number | null>(() => (picks.indexOf(-1) >= 0 ? picks.indexOf(-1) : null))
  // Right items shown shuffled; values are pair indexes.
  const rightOrder = useMemo(() => seededShuffle(step.pairs.map((_, i) => i), `${seed}:${step.id}`), [step.pairs, seed, step.id])
  const badge = (left: number) => String(left + 1)

  function pickRight(pairIndex: number) {
    if (checked || selected === null) return
    const next = picks.map((p) => (p === pairIndex ? -1 : p))
    next[selected] = pairIndex
    onAnswer(next)
    const free = next.findIndex((p, i) => p === -1 && i !== selected)
    setSelected(free >= 0 ? free : null)
  }

  return (
    <div className="space-y-4">
      <Prompt text={step.prompt} />
      <p className="text-sm text-muted-foreground">{c('matchHint')}</p>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          {step.pairs.map((p, i) => {
            const ok = checked && picks[i] === i
            return (
              <button
                key={i}
                type="button"
                disabled={checked}
                onClick={() => setSelected(i)}
                className={`${optionBase} flex items-start gap-2 text-sm ${
                  checked
                    ? ok
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
                      : 'border-red-400 bg-red-50 dark:bg-red-950/40'
                    : selected === i
                      ? 'border-[var(--teal-accent)] bg-[var(--teal-accent-soft)]'
                      : 'border-border bg-card'
                }`}
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold">{badge(i)}</span>
                <span className="min-w-0 flex-1 break-words">
                  {p.left}
                  {checked && !ok && <span className="mt-1 block text-xs text-emerald-800 dark:text-emerald-200">→ {p.right}</span>}
                </span>
              </button>
            )
          })}
        </div>
        <div className="space-y-2">
          {rightOrder.map((pairIndex) => {
            const owner = picks.indexOf(pairIndex)
            return (
              <button
                key={pairIndex}
                type="button"
                disabled={checked}
                onClick={() => pickRight(pairIndex)}
                className={`${optionBase} flex items-start gap-2 text-sm ${owner >= 0 ? 'border-[var(--teal-accent-border)] bg-secondary/60' : 'border-border bg-card hover:border-[var(--teal-accent-border)]'}`}
              >
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${owner >= 0 ? 'bg-[var(--teal-accent)] text-primary' : 'border border-dashed border-muted-foreground/50'}`}
                >
                  {owner >= 0 ? badge(owner) : ''}
                </span>
                <span className="min-w-0 flex-1 break-words">{step.pairs[pairIndex].right}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function OrderStep({ step, answer, onAnswer, checked, seed }: Props & { step: Extract<CourseStep, { type: 'order' }> }) {
  const { c } = useCourseCopy()
  const tiles = useMemo(() => orderTiles(step, seed), [step, seed])
  const built = Array.isArray(answer) ? (answer as string[]) : []
  // Which tiles are still in the pool (a word can occur twice).
  const used = new Map<string, number>()
  for (const w of built) used.set(w, (used.get(w) ?? 0) + 1)
  const pool = tiles.map((w) => {
    const n = used.get(w) ?? 0
    if (n > 0) {
      used.set(w, n - 1)
      return null
    }
    return w
  })
  const correct = checked && stepScore(step, built) === 1

  return (
    <div className="space-y-4">
      <Prompt text={step.prompt} />
      <p className="text-sm text-muted-foreground">{c('orderHint')}</p>
      <div
        className={`flex min-h-[3.5rem] flex-wrap gap-2 rounded-xl border-2 border-dashed p-3 ${
          checked ? (correct ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40' : 'border-red-400 bg-red-50 dark:bg-red-950/40') : 'border-border'
        }`}
      >
        {built.map((w, i) => (
          <button
            key={`${w}-${i}`}
            type="button"
            disabled={checked}
            onClick={() => onAnswer(built.filter((_, k) => k !== i))}
            className={`${tileBase} border-[var(--teal-accent)] bg-[var(--teal-accent-soft)]`}
          >
            {w}
          </button>
        ))}
      </div>
      {checked && !correct && (
        <p className="text-sm text-emerald-800 dark:text-emerald-200">
          {c('rightAnswer')}: <span className="font-semibold">{step.answer}</span>
        </p>
      )}
      {!checked && (
        <div className="flex flex-wrap gap-2">
          {pool.map((w, i) =>
            w === null ? (
              <span key={i} className={`${tileBase} border-transparent bg-secondary/40 text-transparent`} aria-hidden="true">
                {tiles[i]}
              </span>
            ) : (
              <button key={i} type="button" onClick={() => onAnswer([...built, w])} className={`${tileBase} border-border bg-card hover:border-[var(--teal-accent-border)]`}>
                {w}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  )
}

export function ListenStep({ audioUrl }: { audioUrl?: string | null }) {
  const { c } = useCourseCopy()
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">{c('listenTitle')}</h2>
      <p className="text-sm text-muted-foreground">{c('listenHint')}</p>
      {audioUrl ? <audio controls preload="auto" src={audioUrl} className="w-full" /> : <p className="text-sm text-red-600">{c('noRecording')}</p>}
    </div>
  )
}

interface RecognitionLike {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((e: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null
  onend: (() => void) | null
  onerror: (() => void) | null
  start: () => void
  stop: () => void
}

function recognitionCtor(): (new () => RecognitionLike) | null {
  const w = window as unknown as { SpeechRecognition?: new () => RecognitionLike; webkitSpeechRecognition?: new () => RecognitionLike }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

/**
 * Continuous dictation for a speaking task: final phrases are appended to the answer as they
 * come, the phrase being spoken shows live. Without speech recognition the learner types.
 */
function useDictation(onFinal: (text: string) => void) {
  const [supported] = useState(() => typeof window !== 'undefined' && recognitionCtor() !== null)
  const [listening, setListening] = useState(false)
  const [interim, setInterim] = useState('')
  const [seconds, setSeconds] = useState(0)
  const ref = useRef<RecognitionLike | null>(null)
  const finalRef = useRef(onFinal)
  finalRef.current = onFinal

  useEffect(() => {
    if (!listening) return
    const started = Date.now()
    const t = window.setInterval(() => setSeconds(Math.round((Date.now() - started) / 1000)), 500)
    return () => window.clearInterval(t)
  }, [listening])

  useEffect(() => () => ref.current?.stop(), [])

  function start() {
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
        if (e.results[i].isFinal) finalRef.current(text.trim())
        else live += text
      }
      setInterim(live)
    }
    r.onend = () => {
      setListening(false)
      setInterim('')
    }
    r.onerror = () => setListening(false)
    ref.current = r
    setSeconds(0)
    setListening(true)
    r.start()
  }

  function stop() {
    ref.current?.stop()
    setListening(false)
  }

  return { supported, listening, interim, seconds, start, stop }
}

function OpenStep({ step, answer, onAnswer, speak }: Props & { step: Extract<CourseStep, { type: 'write' | 'speak' }> }) {
  const { c } = useCourseCopy()
  const marked: OpenAnswer | null = isOpenAnswer(answer) ? answer : null
  const draft = marked ? marked.text : typeof answer === 'string' ? answer : ''
  const words = countWords(draft)
  const dictation = useDictation((text) => onAnswer(`${draftRef.current}${draftRef.current && text ? ' ' : ''}${text}`))
  const draftRef = useRef(draft)
  draftRef.current = draft
  const speaking = step.type === 'speak'
  const showModelNow = !!step.model && (marked || (speaking && step.modelFirst))

  return (
    <div className="space-y-4">
      <p className="text-lg font-medium leading-snug text-foreground">{step.prompt}</p>
      <p className="text-sm text-muted-foreground">
        {speaking ? c('speakHint', { n: step.seconds }) : c('writeHint', { min: step.minWords, max: step.maxWords })}
      </p>
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
      {showModelNow && !marked && (
        <div className="rounded-xl border border-border bg-secondary/50 p-3 text-sm">
          <div className="flex items-start gap-2">
            <p className="flex-1 text-foreground">
              <span className="font-semibold">{c('modelAnswer')}:</span> {step.model}
            </p>
            <WordSpeakButton label={c('listen')} onSpeak={() => speak(step.model as string)} />
          </div>
        </div>
      )}

      {!marked && speaking && dictation.supported && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => (dictation.listening ? dictation.stop() : dictation.start())}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-3 font-semibold ${dictation.listening ? 'bg-red-600 text-white' : 'bg-[var(--teal-accent)] text-primary'}`}
          >
            {dictation.listening ? <Square className="h-4 w-4" /> : <Mic className="h-5 w-5" />}
            {dictation.listening ? c('stopRecording') : draft ? c('recordMore') : c('startRecording')}
          </button>
          {dictation.listening && (
            <span className="text-sm text-muted-foreground">
              {dictation.seconds}s / {step.seconds}s
            </span>
          )}
        </div>
      )}
      {!marked && speaking && !dictation.supported && <p className="text-sm text-muted-foreground">{c('noMic')}</p>}

      {!marked && (
        <>
          <textarea
            value={draft + (dictation.interim ? `${draft ? ' ' : ''}${dictation.interim}` : '')}
            onChange={(e) => onAnswer(e.target.value)}
            readOnly={dictation.listening}
            placeholder={speaking ? c('speakPlaceholder') : c('writePlaceholder')}
            className="min-h-[9rem] w-full rounded-xl border-2 border-border bg-card px-4 py-3 text-base text-foreground focus:border-[var(--teal-accent)] focus:outline-none"
          />
          {!speaking && (
            <p className={`text-xs ${words > step.maxWords || (words > 0 && words < step.minWords) ? 'text-amber-700' : 'text-muted-foreground'}`}>
              {c('wordCount', { n: words, min: step.minWords, max: step.maxWords })}
              {words < Math.ceil(step.minWords / 2) && ` · ${c('writeMore', { n: Math.ceil(step.minWords / 2) })}`}
            </p>
          )}
          {speaking && draft && <p className="text-xs text-muted-foreground">{c('transcriptHint')}</p>}
        </>
      )}

      {marked && (
        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-card p-3 text-sm text-foreground/90 whitespace-pre-wrap">{marked.text}</div>
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
          {step.model && (
            <div className="rounded-xl border border-border bg-secondary/50 p-3 text-sm">
              <div className="flex items-start gap-2">
                <p className="flex-1 text-foreground">
                  <span className="font-semibold">{c('modelAnswer')}:</span> {step.model}
                </p>
                {speaking && <WordSpeakButton label={c('listen')} onSpeak={() => speak(step.model as string)} />}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
