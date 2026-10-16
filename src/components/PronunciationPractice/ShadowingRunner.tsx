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
  /** Plays the model instead of reading `text` aloud. */
  play?: () => Promise<void>
  /** Overrides the runner's `checkId` for this item. */
  checkId?: string
}

type Phase = 'idle' | 'playing' | 'connecting' | 'listening' | 'scored' | 'paused' | 'finished'

const MODEL_RATE = 0.9
const PAUSE_BETWEEN_MS = 1200

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

/**
 * Wordlist / Conversation / Sound Bank practice: each item is played, then after a beep the learner
 * repeats it and Azure scores it (prosody left out). The repeat window grows with the text's length.
 * By default a result is Azure's overall score as a bar; `renderResult` replaces that.
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

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        {phase === 'idle' ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <button
              type="button"
              onClick={() => start(0)}
              className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-rose-700"
            >
              <Play className="h-4 w-4" />
              {t('pronStart')}
            </button>
          </div>
        ) : phase === 'finished' ? (
          <div className="space-y-3 py-2">
            <p className="text-sm font-medium text-foreground">{t('pronFinished')}</p>
            {average !== null && (
              <div className="w-[70%]">
                <ScoreBar score={average} label={t('pronFinished')} />
              </div>
            )}
            {renderFinished?.(scored.map((i) => results[i]))}
            <button
              type="button"
              onClick={() => start(0)}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-secondary"
            >
              <RotateCcw className="h-4 w-4" />
              {t('pronRestart')}
            </button>
          </div>
        ) : (
          current && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                {current.speaker ? (
                  <span
                    className={`rounded-full px-2 py-0.5 font-medium ${
                      current.listenOnly ? 'bg-secondary text-foreground' : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {current.speaker}
                  </span>
                ) : (
                  <span />
                )}
                <span className="tabular-nums">
                  {index + 1} / {items.length}
                </span>
              </div>

              <div>
                <div className="text-xl font-semibold text-foreground sm:text-2xl">{current.display ?? current.text}</div>
                {current.gloss && <p className="mt-1 text-sm text-muted-foreground">{current.gloss}</p>}
              </div>

              <div className="min-h-[2.5rem] space-y-2">
                {phase === 'playing' && (
                  <StatusLine icon={<Volume2 className="h-4 w-4" />} text={t('pronListen')} />
                )}
                {phase === 'connecting' && <StatusLine icon={<Mic className="h-4 w-4" />} text={t('pronGetReady')} />}
                {phase === 'listening' && (
                  <>
                    <StatusLine icon={<Mic className="h-4 w-4 text-rose-600" />} text={t('pronYourTurn')} strong />
                    <Countdown key={index} seconds={windowSeconds} />
                  </>
                )}
                {phase === 'scored' && results[index] !== undefined && (
                  <div className={renderResult ? '' : 'w-[70%]'}>{resultView(index)}</div>
                )}
                {phase === 'paused' && error && <p className="text-sm text-red-600">{error}</p>}
              </div>

              <div className="flex flex-wrap gap-2">
                {running ? (
                  <button
                    type="button"
                    onClick={requestPause}
                    disabled={pauseRequested}
                    className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-secondary disabled:opacity-60"
                  >
                    <Pause className="h-4 w-4" />
                    {pauseRequested ? t('pronPausing') : t('pronPause')}
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => start(nextIndex)}
                      className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
                    >
                      <Play className="h-4 w-4" />
                      {t('pronResume')}
                    </button>
                    <button
                      type="button"
                      onClick={() => start(0)}
                      className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-secondary"
                    >
                      <RotateCcw className="h-4 w-4" />
                      {t('pronRestart')}
                    </button>
                  </>
                )}
              </div>
            </div>
          )
        )}
      </div>

      <ol className="space-y-2">
        {repeatIndexes.map((i) => {
          const highlight = i === index && phase !== 'idle' && phase !== 'finished' ? 'bg-rose-50' : ''
          return renderResult ? (
            <li key={i} className={`space-y-1.5 rounded-lg px-3 py-2 text-sm ${highlight}`}>
              <div className="text-foreground">{items[i].display ?? items[i].text}</div>
              {results[i] !== undefined && resultView(i)}
            </li>
          ) : (
            <li
              key={i}
              className={`grid grid-cols-[1fr_7.75rem] items-center gap-3 rounded-lg px-3 py-2 text-sm sm:grid-cols-[1fr_11.25rem] ${highlight}`}
            >
              <span className="min-w-0 truncate text-foreground">{items[i].text}</span>
              {results[i] !== undefined ? resultView(i) : <span className="mr-[4.5rem] h-2.5 rounded-full bg-secondary" />}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
