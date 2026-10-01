import { useEffect, useRef, useState } from 'react'
import type { Step } from '../../data/pronunciationLessons'
import type { PronunciationCheckResult } from '../../lib/types'
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis'
import { PRODUCTION_ASSESSMENT_ACCENT } from '../../lib/voiceSelection'
import ProductionStage from '../PronunciationSession/ProductionStage'
import { ReplayButton } from './shared'

type Production = Extract<Step, { type: 'production' }>

/**
 * Azure-scored read-aloud for a unit. Like the drill funnel's production stage it is always
 * assessed in en-US and its model sentence plays in a US voice; `onActiveChange` lets the page
 * show that on its accent toggle. Skippable (no mic, or no Azure budget): a skip reports `null`.
 */
export default function ProductionStep({
  unitId,
  step,
  rate,
  onActiveChange,
  onDone,
}: {
  unitId: string
  step: Production
  rate: number
  onActiveChange?: (active: boolean) => void
  onDone: (result: PronunciationCheckResult | null) => void
}) {
  const synth = useSpeechSynthesis('female', PRODUCTION_ASSESSMENT_ACCENT)
  const [result, setResult] = useState<PronunciationCheckResult | null>(null)

  const onActiveChangeRef = useRef(onActiveChange)
  onActiveChangeRef.current = onActiveChange
  useEffect(() => {
    onActiveChangeRef.current?.(true)
    return () => {
      onActiveChangeRef.current?.(false)
      synth.cancel()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-4">
      <ReplayButton onClick={() => synth.speak(step.sentence, { rate })} label="Mintamondat meghallgatása" />
      <ProductionStage
        soundItemId={unitId}
        sentence={step.sentence}
        done={result !== null}
        onResult={setResult}
        onContinue={() => onDone(result)}
      />
      {result === null && (
        <button onClick={() => onDone(null)} className="text-xs text-slate-500 underline hover:text-slate-700">
          Kihagyás
        </button>
      )}
    </div>
  )
}
