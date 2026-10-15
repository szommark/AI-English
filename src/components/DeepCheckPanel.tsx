import { useState } from 'react'
import { Mic } from 'lucide-react'
import { logDeepCheck, requestDeepCheckToken, type DeepCheckLimitError } from '../lib/api'
import { playBeep, primeBeep } from '../lib/beep'
import { runDeepCheck } from '../lib/pronunciation'
import { repeatWindowSeconds } from '../lib/pronunciationConfig'
import type { PronunciationCheckResult } from '../lib/types'
import PronunciationResultCard from './PronunciationResultCard'
import { Countdown, StatusLine } from './PronunciationPractice/RecordPhase'
import { useLanguage } from '../lib/i18n'

type Status = 'idle' | 'preparing' | 'recording' | 'done' | 'error'

export default function DeepCheckPanel({
  scenarioId,
  targetSentence,
  locale = 'en-US',
  onResult,
}: {
  scenarioId: string
  targetSentence: string
  locale?: 'en-US' | 'en-GB'
  onResult?: (result: PronunciationCheckResult) => void
}) {
  const { t } = useLanguage()
  const [status, setStatus] = useState<Status>('idle')
  const [result, setResult] = useState<PronunciationCheckResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  // Same record phase as Wordlist / Conversation practice: the window grows with the sentence.
  const windowSeconds = repeatWindowSeconds(targetSentence)

  const run = async () => {
    primeBeep()
    setStatus('preparing')
    setErrorMessage('')

    try {
      const { token, region } = await requestDeepCheckToken(scenarioId)
      const deepResult = await runDeepCheck({
        token,
        region,
        targetSentence,
        maxSeconds: windowSeconds,
        locale,
        onListening: () => {
          playBeep()
          setStatus('recording')
        },
      })
      setResult(deepResult)
      setStatus('done')
      onResult?.(deepResult)

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
        setErrorMessage(t('deepCheckUnavailable', { detail }))
      }
      setStatus('error')
    }
  }

  const busy = status === 'preparing' || status === 'recording'

  return (
    <div className="mt-2">
      <button
        onClick={run}
        disabled={busy}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 text-slate-600 text-xs px-3 py-1.5 hover:bg-slate-50 disabled:opacity-50"
      >
        <Mic className="h-3.5 w-3.5" />
        {t('deepCheckIdle')}
      </button>

      {busy && (
        <div className="mt-2 max-w-sm space-y-2">
          {status === 'preparing' ? (
            <StatusLine icon={<Mic className="h-4 w-4" />} text={t('pronGetReady')} />
          ) : (
            <>
              <StatusLine icon={<Mic className="h-4 w-4 text-rose-600" />} text={t('pronYourTurn')} strong />
              <Countdown seconds={windowSeconds} />
            </>
          )}
        </div>
      )}

      {status === 'error' && <p className="mt-2 text-xs text-red-600">{errorMessage}</p>}
      {status === 'done' && result && (
        <div className="mt-2">
          <PronunciationResultCard result={result} targetSentence={targetSentence} />
        </div>
      )}
    </div>
  )
}
