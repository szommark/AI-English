import DeepCheckPanel from '../DeepCheckPanel'
import type { PronunciationCheckResult } from '../../lib/types'
import { PRODUCTION_ASSESSMENT_LOCALE } from '../../lib/voiceSelection'

/** Always assessed in en-US, whatever the learner's accent preference — see PRODUCTION_ASSESSMENT_ACCENT. */
export default function ProductionStage({
  soundItemId,
  sentence,
  done,
  onResult,
  onContinue,
}: {
  soundItemId: string
  sentence: string
  done: boolean
  onResult: (result: PronunciationCheckResult) => void
  onContinue: () => void
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">Mondd ki hangosan a következő mondatot:</p>
      <p className="rounded-lg bg-white border border-rose-200 px-4 py-3 text-base font-medium text-slate-800">
        {sentence}
      </p>

      <DeepCheckPanel
        scenarioId={soundItemId}
        targetSentence={sentence}
        locale={PRODUCTION_ASSESSMENT_LOCALE}
        onResult={onResult}
      />

      {done && (
        <button onClick={onContinue} className="rounded-lg bg-rose-600 text-white text-sm font-medium px-4 py-2 hover:bg-rose-700">
          Tovább az összesítőhöz →
        </button>
      )}
    </div>
  )
}
