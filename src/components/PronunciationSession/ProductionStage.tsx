import DeepCheckPanel from '../DeepCheckPanel'
import type { PronunciationCheckResult } from '../../lib/types'

export default function ProductionStage({
  soundItemId,
  sentence,
  locale,
  done,
  onResult,
  onFinish,
}: {
  soundItemId: string
  sentence: string
  locale: 'en-US' | 'en-GB'
  done: boolean
  onResult: (result: PronunciationCheckResult) => void
  onFinish: () => void
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">Mondd ki hangosan a következő mondatot:</p>
      <p className="rounded-lg bg-white border border-rose-200 px-4 py-3 text-base font-medium text-slate-800">
        {sentence}
      </p>

      <DeepCheckPanel scenarioId={soundItemId} targetSentence={sentence} locale={locale} onResult={onResult} />

      {done && (
        <button onClick={onFinish} className="rounded-lg bg-rose-600 text-white text-sm font-medium px-4 py-2 hover:bg-rose-700">
          Befejezés
        </button>
      )}
    </div>
  )
}
