import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, X } from 'lucide-react'
import { getSoundItem } from '../../data/pronunciationCurriculum'
import { lessonSessionRoute, type LessonSession, type LessonUnit, type Step } from '../../data/pronunciationLessons'
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis'
import { recordPronunciationAttempt } from '../../lib/pronunciationProgressApi'
import { perceptionScoreFromRatios } from '../../lib/pronunciationScoring'
import type { AccentPreference } from '../../lib/voiceSelection'
import DrillCard from '../PronunciationSession/DrillCard'
import DrillControls from '../PronunciationSession/DrillControls'
import DrillFunnel from '../PronunciationSession/DrillFunnel'
import DictationStep from './DictationStep'
import ListenChooseStep from './ListenChooseStep'
import OddOneOutStep from './OddOneOutStep'
import ProductionStep from './ProductionStep'
import SyllableTapStep from './SyllableTapStep'
import TheoryCard from './TheoryCard'
import TokenSelectStep from './TokenSelectStep'
import { ContinueButton } from './shared'

type Phase = 'theory' | 'steps' | 'summary' | 'funnel' | 'funnel-done'

interface StepResult {
  label: string
  ratio: number
}

function stepLabel(step: Step): string {
  switch (step.type) {
    case 'listen-choose':
      return step.audio ?? step.promptHu.slice(0, 24)
    case 'syllable-tap':
      return step.target
    case 'token-select':
      return step.tokens.slice(0, 3).join(' ') + (step.tokens.length > 3 ? '…' : '')
    case 'odd-one-out':
      return step.words[step.oddIndex]
    case 'dictation':
      return step.text
    case 'production':
      return step.sentence
  }
}

/**
 * Runs one unit: theory → exercises → summary, or theory → the existing DrillFunnel for units
 * that wrap a curriculum item. Perception is the average of the exercises' accuracy; production
 * is the Azure score of the (optional) read-aloud step. Both are recorded once, on the summary,
 * under the unit id — funnel units record themselves under the curriculum item id.
 */
export default function LessonUnitRunner({
  session,
  unit,
  accent,
  hasPriorFunnelAttempt,
  onProgressChange,
  onProductionActiveChange,
}: {
  session: LessonSession
  unit: LessonUnit
  accent: AccentPreference
  hasPriorFunnelAttempt: boolean
  /** Called after progress was written, so the page can refetch its score chips. */
  onProgressChange?: () => void
  /** True while an Azure-scored (always en-US) step is on screen. */
  onProductionActiveChange?: (active: boolean) => void
}) {
  const [phase, setPhase] = useState<Phase>('theory')
  const [rate, setRate] = useState<1 | 0.75>(1)
  const [attempt, setAttempt] = useState(0)
  const synth = useSpeechSynthesis('female', accent)
  const speakRaw = synth.speak
  const speak = useCallback((text: string) => speakRaw(text, { rate }), [speakRaw, rate])

  const [stepIndex, setStepIndex] = useState(0)
  const [results, setResults] = useState<StepResult[]>([])
  const [productionScore, setProductionScore] = useState<number | null>(null)
  const [perceptionScore, setPerceptionScore] = useState<number | null>(null)
  const recordedRef = useRef(false)

  useEffect(() => {
    return () => synth.cancel()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const steps = unit.body.kind === 'steps' ? unit.body.steps : []
  const step = steps[stepIndex]

  function start() {
    synth.cancel()
    if (unit.body.kind === 'funnel') {
      setPhase('funnel')
      return
    }
    setStepIndex(0)
    setResults([])
    setProductionScore(null)
    setPerceptionScore(null)
    recordedRef.current = false
    setAttempt((a) => a + 1)
    setPhase('steps')
  }

  function finish(finalResults: StepResult[], production: number | null) {
    const perception = perceptionScoreFromRatios(finalResults.map((r) => r.ratio))
    setPerceptionScore(perception)
    setPhase('summary')
    if (recordedRef.current) return
    recordedRef.current = true
    recordPronunciationAttempt(unit.id, {
      perceptionScore: perception,
      ...(production !== null ? { productionScore: production } : {}),
    })
      .then(() => onProgressChange?.())
      .catch((err) => console.error('Failed to record pronunciation progress', err))
  }

  function advance(nextResults: StepResult[], production: number | null) {
    synth.cancel()
    if (stepIndex < steps.length - 1) {
      setStepIndex((i) => i + 1)
    } else {
      finish(nextResults, production)
    }
  }

  function handleRatio(ratio: number) {
    const next = [...results, { label: stepLabel(step), ratio }]
    setResults(next)
    advance(next, productionScore)
  }

  function handleProduction(result: { scores: { pronunciation: number } } | null) {
    const score = result ? Math.round(result.scores.pronunciation) : null
    setProductionScore(score)
    advance(results, score)
  }

  if (phase === 'theory') {
    return (
      <DrillCard title={unit.title} titleHu={unit.titleHu}>
        <div className="space-y-5">
          <TheoryCard blocks={unit.theory} speak={speak} />
          <ContinueButton onClick={start} label={unit.body.kind === 'funnel' ? 'Gyakorlás indítása →' : 'Kezdjük a feladatokat →'} />
        </div>
      </DrillCard>
    )
  }

  if (phase === 'funnel' && unit.body.kind === 'funnel') {
    const soundItem = getSoundItem(unit.body.soundItemId)
    if (!soundItem) return null
    return (
      <DrillFunnel
        soundItem={soundItem}
        accent={accent}
        hasPriorAttempt={hasPriorFunnelAttempt}
        onItemComplete={() => {
          setPhase('funnel-done')
          onProgressChange?.()
        }}
        onProductionActiveChange={onProductionActiveChange}
      />
    )
  }

  if (phase === 'funnel-done') {
    return (
      <DoneCard
        session={session}
        message="Szép munka! Ezt az egységet most gyakoroltad."
        onAgain={() => setPhase('theory')}
      />
    )
  }

  if (phase === 'summary') {
    const production = productionScore
    const perception = perceptionScore ?? 0
    return (
      <DrillCard title={unit.title} titleHu={unit.titleHu}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <ScoreTile label="Hallás" score={perception} />
            {steps.some((s) => s.type === 'production') && <ScoreTile label="Kiejtés" score={production} />}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {results.map((r, i) => (
              <span
                key={i}
                className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-sm font-medium ${
                  r.ratio >= 0.8 ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-600'
                }`}
              >
                {r.ratio >= 0.8 ? <Check className="h-3.5 w-3.5 shrink-0" /> : <X className="h-3.5 w-3.5 shrink-0" />}
                {r.label}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={start}
              className="rounded-lg border border-rose-300 text-rose-700 text-sm font-medium px-4 py-2 hover:bg-rose-50"
            >
              Gyakorlás újra
            </button>
            <Link
              to={lessonSessionRoute(session.id)}
              className="rounded-lg bg-rose-600 text-white text-sm font-medium px-4 py-2 hover:bg-rose-700"
            >
              Vissza az egységekhez
            </Link>
          </div>
        </div>
      </DrillCard>
    )
  }

  // phase === 'steps'
  return (
    <div className="space-y-4">
      <DrillCard title={unit.title} titleHu={unit.titleHu}>
        {step && (
          <div key={`${attempt}-${stepIndex}`}>
            {step.type === 'listen-choose' && <ListenChooseStep step={step} speak={speak} onDone={handleRatio} />}
            {step.type === 'syllable-tap' && <SyllableTapStep step={step} speak={speak} onDone={handleRatio} />}
            {step.type === 'token-select' && <TokenSelectStep step={step} speak={speak} onDone={handleRatio} />}
            {step.type === 'odd-one-out' && <OddOneOutStep step={step} speak={speak} onDone={handleRatio} />}
            {step.type === 'dictation' && <DictationStep step={step} speak={speak} onDone={handleRatio} />}
            {step.type === 'production' && (
              <ProductionStep
                unitId={unit.id}
                step={step}
                rate={rate}
                onActiveChange={onProductionActiveChange}
                onDone={handleProduction}
              />
            )}
          </div>
        )}
      </DrillCard>
      <DrillControls stageCount={steps.length} stageIndex={stepIndex} rate={rate} onSetRate={setRate} />
    </div>
  )
}

function ScoreTile({ label, score }: { label: string; score: number | null }) {
  return (
    <div className="rounded-xl border border-rose-100 bg-white px-4 py-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-2xl font-semibold text-slate-800">
        {score !== null ? `${score}%` : <span className="text-base font-normal text-slate-400">kihagyva</span>}
      </p>
    </div>
  )
}

function DoneCard({ session, message, onAgain }: { session: LessonSession; message: string; onAgain: () => void }) {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center space-y-3">
      <p className="text-sm font-medium text-rose-700">{message}</p>
      <div className="flex justify-center gap-3">
        <button onClick={onAgain} className="rounded-lg border border-rose-300 text-rose-700 text-sm font-medium px-4 py-2 hover:bg-rose-100">
          Gyakorlás újra
        </button>
        <Link to={lessonSessionRoute(session.id)} className="rounded-lg bg-rose-600 text-white text-sm font-medium px-4 py-2 hover:bg-rose-700">
          Vissza az egységekhez
        </Link>
      </div>
    </div>
  )
}
