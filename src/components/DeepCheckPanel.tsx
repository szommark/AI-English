import { useState } from 'react'
import { logDeepCheck, requestDeepCheckToken, type DeepCheckLimitError } from '../lib/api'
import { runDeepCheck } from '../lib/pronunciation'
import { DEEP_CHECK_MAX_SECONDS } from '../lib/pronunciationConfig'
import type { PronunciationCheckResult } from '../lib/types'
import PronunciationResultCard from './PronunciationResultCard'

type Status = 'idle' | 'recording' | 'scoring' | 'done' | 'error'

export default function DeepCheckPanel({ scenarioId, targetSentence }: { scenarioId: string; targetSentence: string }) {
  const [status, setStatus] = useState<Status>('idle')
  const [result, setResult] = useState<PronunciationCheckResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  const run = async () => {
    setStatus('recording')
    setErrorMessage('')

    try {
      const { token, region } = await requestDeepCheckToken(scenarioId)
      setStatus('scoring')
      const deepResult = await runDeepCheck({ token, region, targetSentence, maxSeconds: DEEP_CHECK_MAX_SECONDS })
      setResult(deepResult)
      setStatus('done')

      await logDeepCheck({
        scenarioId,
        targetSentence,
        azureResult: deepResult,
        audioSeconds: deepResult.audioSeconds,
      }).catch(() => {
        // Logging failure shouldn't hide a result the user already has.
      })
    } catch (err) {
      const limitErr = err as DeepCheckLimitError
      if (limitErr.code) {
        setErrorMessage(limitErr.message)
      } else {
        console.error('Deep check failed:', err)
        const detail = err instanceof Error ? err.message : String(err)
        setErrorMessage(`A mélyelemzés most nem elérhető. Próbáld újra kicsit később. (${detail})`)
      }
      setStatus('error')
    }
  }

  return (
    <div className="mt-2">
      <button
        onClick={run}
        disabled={status === 'recording' || status === 'scoring'}
        className="rounded-lg border border-slate-300 text-slate-600 text-xs px-3 py-1.5 hover:bg-slate-50 disabled:opacity-50"
      >
        {status === 'recording' && `Felvétel... (max. ${DEEP_CHECK_MAX_SECONDS} mp)`}
        {status === 'scoring' && 'Elemzés...'}
        {(status === 'idle' || status === 'done' || status === 'error') && 'Mélyelemzés'}
      </button>

      {status === 'error' && <p className="mt-2 text-xs text-red-600">{errorMessage}</p>}
      {status === 'done' && result && (
        <div className="mt-2">
          <PronunciationResultCard result={result} />
        </div>
      )}
    </div>
  )
}
