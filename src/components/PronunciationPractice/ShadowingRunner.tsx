import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Mic, Pause, Play, RotateCcw, Volume2 } from 'lucide-react'
import { logDeepCheck, requestDeepCheckToken, type DeepCheckLimitError } from '../../lib/api'
import { playBeep, primeBeep } from '../../lib/beep'
import { useLanguage } from '../../lib/i18n'
import { runDeepCheck } from '../../lib/pronunciation'
import { repeatWindowSeconds } from '../../lib/pronunciationConfig'
import { PRODUCTION_ASSESSMENT_ACCENT, PRODUCTION_ASSESSMENT_LOCALE } from '../../lib/voiceSelection'
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis'
import type { PronunciationCheckResult, VoiceGender } from '../../lib/types'
import { Countdown, StatusLine } from './RecordPhase'
import ScoreBar from './ScoreBar'

export interface ShadowItem {
  text: string
  /** Hungarian help shown under the text. */
  gloss?: string | null
  /** Who says the line (dialogues); the learner's own lines are labelled "You". */
  speaker?: string
  /** A partner line: only played, not repeated. */
  listenOnly?: boolean
  /** Shown instead of `text` (which stays the Azure reference text). */
  display?: ReactNode
  /** The sound this item opens with, shown as /ipa/ before it (on its own line on the card). */
  ipa?: string
  /** Plays the model instead of reading `text` aloud. */
  play?: () => Promise<void>
  /** Overrides the runner's `checkId` for this item. */
  checkId?: string
}

type Phase = 'idle' | 'playing' | 'connecting' | 'listening' | 'scored' | 'paused' | 'finished'

const MODEL_RATE = 0.9
const PAUSE_BETWEEN_MS = 1200

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

/** The card's type size for an item: How to make it's anchor-word size for a word, smaller as the text grows. */
function cardTextSize(text: string) {
  if (text.length <= 8) return 'text-5xl sm:text-6xl'
  if (text.length <= 16) return 'text-4xl sm:text-5xl'
  if (text.length <= 40) return 'text-2xl sm:text-3xl'
  return 'text-xl sm:text-2xl'
}

/**
 * Wordlist / Conversation / Sound Bank practice: each item is played, then after a beep the learner
 * repeats it and Azure scores it (prosody left out). The repeat window grows with the text's length.
 * By default a result is Azure's overall score as a bar; `renderResult` replaces that.
 * Laid out as the sound sheet's How to make it card: one rose card split by a dim line, the current
 * item in large type on the left and every item on the right (stacked on narrow screens), pill buttons.
 * Remount (key) it for a new set of items.
 */
export default function ShadowingRunner({
  items,
  checkId,
  modelGender = 'female',
  partnerGender = 'male',
  renderResult,
  scoreOf = (_item, result) => result.scores.pronunciation,
  renderFinished,
  onFinished,
  finishedLabel,
  autoStart = false,
}: {
  items: ShadowItem[]
  /** Sent in the token/log `scenarioId` slot. */
  checkId: string
  modelGender?: VoiceGender
  partnerGender?: VoiceGender
  /** Replaces the default score bar, on the current item and in the list. */
  renderResult?: (item: ShadowItem, result: PronunciationCheckResult) => ReactNode
  /** The 0–100 score an item counts with in the overall average. */
  scoreOf?: (item: ShadowItem, result: PronunciationCheckResult) => number
  /** Extra content under the overall score once every item is done. */
  renderFinished?: (results: PronunciationCheckResult[]) => ReactNode
  /** Called once with every item's result when the whole run finishes. */
  onFinished?: (results: PronunciationCheckResult[]) => void
  /** Heading over the average once the run is done (default "Done! Overall:"). */
  finishedLabel?: string
  /** Start playing on mount instead of showing the Start button (mount it from a click, for the beep). */
  autoStart?: boolean
}) {
  const { t } = useLanguage()
  // Azure always assesses in American English, so the model is American too.
  const modelTts = useSpeechSynthesis(modelGender, PRODUCTION_ASSESSMENT_ACCENT)
  const partnerTts = useSpeechSynthesis(partnerGender, PRODUCTION_ASSESSMENT_ACCENT)

  const [phase, setPhase] = useState<Phase>('idle')
  const [index, setIndex] = useState(0)
  /** Where Resume continues from. */
  const [nextIndex, setNextIndex] = useState(0)
  const [results, setResults] = useState<Record<number, PronunciationCheckResult>>({})
  const resultsRef = useRef<Record<number, PronunciationCheckResult>>({})
  const [windowSeconds, setWindowSeconds] = useState(0)
  const [error, setError] = useState('')
  const [pauseRequested, setPauseRequested] = useState(false)

  const runRef = useRef(0)
  const pauseRef = useRef(false)

  useEffect(() => {
    return () => {
      runRef.current++
      window.speechSynthesis?.cancel()
    }
  }, [])

  useEffect(() => {
    if (autoStart) start(0)
    // Mount only: a later change of autoStart must not restart a run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function speakAndWait(item: ShadowItem): Promise<void> {
    if (item.play) return item.play().catch((err) => console.error('Model audio failed:', err))
    const tts = item.listenOnly ? partnerTts : modelTts
    return new Promise((resolve) => {
      // Some browsers drop the end event; never hang on it.
      const fallback = setTimeout(resolve, item.text.length * 90 + 3000)
      tts.speak(item.text, {
        rate: item.listenOnly ? 1 : MODEL_RATE,
        onEnd: () => {
          clearTimeout(fallback)
          resolve()
        },
      })
    })
  }

  async function runFrom(start: number) {
    const run = ++runRef.current
    const alive = () => runRef.current === run
    pauseRef.current = false
    setPauseRequested(false)
    setError('')

    for (let i = start; i < items.length; i++) {
      if (!alive()) return
      if (pauseRef.current) {
        setNextIndex(i)
        setPhase('paused')
        return
      }
      const item = items[i]
      setIndex(i)
      setPhase('playing')
      await speakAndWait(item)
      if (!alive()) return
      if (item.listenOnly) {
        await wait(400)
        continue
      }

      setPhase('connecting')
      try {
        const itemCheckId = item.checkId ?? checkId
        const { token, region } = await requestDeepCheckToken(itemCheckId)
        if (!alive()) return
        const seconds = repeatWindowSeconds(item.text)
        setWindowSeconds(seconds)
        const result = await runDeepCheck({
          token,
          region,
          targetSentence: item.text,
          maxSeconds: seconds,
          locale: PRODUCTION_ASSESSMENT_LOCALE,
          prosody: false,
          onListening: () => {
            if (!alive()) return
            playBeep()
            setPhase('listening')
          },
        })
        logDeepCheck({ scenarioId: itemCheckId, targetSentence: item.text, azureResult: result, audioSeconds: result.audioSeconds }).catch(() => {
          // Logging failure shouldn't hide a result the learner already has.
        })
        if (!alive()) return
        resultsRef.current = { ...resultsRef.current, [i]: result }
        setResults(resultsRef.current)
        setPhase('scored')
        await wait(PAUSE_BETWEEN_MS)
      } catch (err) {
        if (!alive()) return
        const limitErr = err as DeepCheckLimitError
        const message = err instanceof Error ? err.message : String(err)
        if (limitErr.code) setError(limitErr.message)
        else if (message === 'deep_check_timeout' || message.startsWith('No speech was recognized (NoMatch')) setError(t('pronNotHeard'))
        else {
          console.error('Shadowing check failed:', err)
          setError(t('deepCheckUnavailable', { detail: message }))
        }
        // Resume retries the same item.
        setNextIndex(i)
        setPhase('paused')
        return
      }
    }
    if (!alive()) return
    setPhase('finished')
    onFinished?.(items.flatMap((_, i) => (resultsRef.current[i] ? [resultsRef.current[i]] : [])))
  }

  function start(from: number) {
    primeBeep()
    if (from === 0) {
      resultsRef.current = {}
      setResults({})
    }
    void runFrom(from)
  }

  function requestPause() {
    pauseRef.current = true
    setPauseRequested(true)
  }

  const running = phase === 'playing' || phase === 'connecting' || phase === 'listening' || phase === 'scored'
  const current = items[index]
  const repeatIndexes = items.flatMap((item, i) => (item.listenOnly ? [] : [i]))
  const scored = repeatIndexes.filter((i) => results[i] !== undefined)
  const average = scored.length > 0 ? scored.reduce((sum, i) => sum + scoreOf(items[i], results[i]), 0) / scored.length : null
  const resultView = (i: number) =>
    renderResult ? renderResult(items[i], results[i]) : <ScoreBar score={results[i].scores.pronunciation} />

  const primaryButton =
    'inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-rose-700'
  const secondaryButton =
    'inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm text-foreground hover:bg-secondary disabled:opacity-60'

  // Before the start the first item shows, so the left side already reads like How to make it.
  const shown = phase === 'idle' ? items[0] : current
  const panel =
    phase === 'finished' ? (
      <div className="space-y-3 py-2">
        <p className="text-sm font-medium text-foreground">{finishedLabel ?? t('pronFinished')}</p>
        {average !== null && (
          <div className="w-[70%]">
            <ScoreBar score={average} label={finishedLabel ?? t('pronFinished')} />
          </div>
        )}
        {renderFinished?.(scored.map((i) => results[i]))}
        <button type="button" onClick={() => start(0)} className={secondaryButton}>
          <RotateCcw className="h-4 w-4" />
          {t('pronRestart')}
        </button>
      </div>
    ) : (
      shown && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
            {shown.speaker ? <SpeakerBadge item={shown} /> : <span />}
            <span className="tabular-nums">
              {index + 1} / {items.length}
            </span>
          </div>

          <div>
            {shown.ipa && <div className="mb-3 text-3xl font-semibold text-foreground">/{shown.ipa}/</div>}
            <div lang="en" className={`font-semibold tracking-tight text-foreground ${cardTextSize(shown.text)}`}>
              {shown.display ?? shown.text}
            </div>
            {shown.gloss && <p className="mt-2 text-sm text-muted-foreground">{shown.gloss}</p>}
          </div>

          {phase === 'idle' ? (
            <button type="button" onClick={() => start(0)} className={primaryButton}>
              <Play className="h-4 w-4" />
              {t('pronStart')}
            </button>
          ) : (
            <>
              <div className="min-h-[2.5rem] space-y-2">
                {phase === 'playing' && <StatusLine icon={<Volume2 className="h-4 w-4" />} text={t('pronListen')} />}
                {phase === 'connecting' && <StatusLine icon={<Mic className="h-4 w-4" />} text={t('pronGetReady')} />}
                {phase === 'listening' && (
                  <>
                    <StatusLine icon={<Mic className="h-4 w-4 text-rose-600" />} text={t('pronYourTurn')} strong />
                    <Countdown key={index} seconds={windowSeconds} />
                  </>
                )}
                {phase === 'scored' && results[index] !== undefined && resultView(index)}
                {phase === 'paused' && error && <p className="text-sm text-red-600">{error}</p>}
              </div>

              <div className="flex flex-wrap gap-2">
                {running ? (
                  <button type="button" onClick={requestPause} disabled={pauseRequested} className={secondaryButton}>
                    <Pause className="h-4 w-4" />
                    {pauseRequested ? t('pronPausing') : t('pronPause')}
                  </button>
                ) : (
                  <>
                    <button type="button" onClick={() => start(nextIndex)} className={primaryButton}>
                      <Play className="h-4 w-4" />
                      {t('pronResume')}
                    </button>
                    <button type="button" onClick={() => start(0)} className={secondaryButton}>
                      <RotateCcw className="h-4 w-4" />
                      {t('pronRestart')}
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      )
    )

  // Every item is on the card, partner lines too (outlined, with no result), so the whole dialogue reads in order.
  const list = (
    <ol className="space-y-2">
      {items.map((item, i) => {
        const isCurrent = i === index && phase !== 'idle' && phase !== 'finished'
        return (
          <li
            key={i}
            className={`space-y-1.5 rounded-lg px-3 py-2 text-sm ${
              isCurrent
                ? 'bg-rose-50 ring-1 ring-rose-200'
                : item.listenOnly
                  ? 'border border-border bg-card'
                  : 'bg-secondary'
            }`}
          >
            {item.speaker && <SpeakerBadge item={item} />}
            <div lang="en" className={`font-medium ${item.listenOnly ? 'text-muted-foreground' : 'text-foreground'}`}>
              {item.ipa && <>/{item.ipa}/ · </>}
              {item.display ?? item.text}
            </div>
            {item.gloss && <p className="text-xs text-muted-foreground">{item.gloss}</p>}
            {results[i] !== undefined && resultView(i)}
          </li>
        )
      })}
    </ol>
  )

  return (
    <section
      className={`grid gap-6 rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)] sm:p-8 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-8 ${
        phase === 'listening' ? 'border-rose-400' : 'border-rose-200'
      }`}
    >
      {/* Stays in view while a long list scrolls past. */}
      <div className="md:sticky md:top-6 md:self-start">{panel}</div>
      <div className="border-t border-border pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0">{list}</div>
    </section>
  )
}

/** Who says a line: the learner's own lines in rose, the partner's in grey. */
function SpeakerBadge({ item }: { item: ShadowItem }) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
        item.listenOnly ? 'bg-secondary text-foreground' : 'bg-rose-100 text-rose-700'
      }`}
    >
      {item.speaker}
    </span>
  )
}
