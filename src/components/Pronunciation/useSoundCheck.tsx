import { useState, type ReactNode } from 'react'
import { Mic } from 'lucide-react'
import { logDeepCheck, requestDeepCheckToken, type DeepCheckLimitError } from '../../lib/api'
import { playBeep, primeBeep } from '../../lib/beep'
import { useLanguage } from '../../lib/i18n'
import { runDeepCheck } from '../../lib/pronunciation'
import { repeatWindowSeconds, SOUND_CHECK_PREFIX } from '../../lib/pronunciationConfig'
import { PRODUCTION_ASSESSMENT_LOCALE } from '../../lib/voiceSelection'
import type { PronunciationCheckResult } from '../../lib/types'
import { Countdown, StatusLine } from '../PronunciationPractice/RecordPhase'
import { FocusSoundResultView } from './SoundResults'

type Status = 'idle' | 'preparing' | 'recording' | 'done' | 'error'

/**
 * The mic next to the sheet's symbol: the learner says the anchor word after the beep and gets the
 * focus sound's own result (Azure can't score a lone sound, see src/data/phonemePractice.ts).
 * Returns the mic's handler and state plus the status/result panel, which sits under the heading.
 */
export function useSoundCheck(
  phonemeId: string,
  ipaSymbol: string,
  anchorWord: string,
): { busy: boolean; run: () => void; panel: ReactNode } {
  const { t } = useLanguage()
  const [status, setStatus] = useState<Status>('idle')
  const [result, setResult] = useState<PronunciationCheckResult | null>(null)
  const [error, setError] = useState('')
  const windowSeconds = repeatWindowSeconds(anchorWord)
  const checkId = `${SOUND_CHECK_PREFIX}${phonemeId}`

  async function run() {
    primeBeep()
    setStatus('preparing')
    setError('')
    setResult(null)
    try {
      const { token, region } = await requestDeepCheckToken(checkId)
      const checked = await runDeepCheck({
        token,
        region,
        targetSentence: anchorWord,
        maxSeconds: windowSeconds,
        locale: PRODUCTION_ASSESSMENT_LOCALE,
        prosody: false,
        onListening: () => {
          playBeep()
          setStatus('recording')
        },
      })
      setResult(checked)
      setStatus('done')
      logDeepCheck({ scenarioId: checkId, targetSentence: anchorWord, azureResult: checked, audioSeconds: checked.audioSeconds }).catch(() => {
        // Logging failure shouldn't hide a result the learner already has.
      })
    } catch (err) {
      const limitErr = err as DeepCheckLimitError
      const message = err instanceof Error ? err.message : String(err)
      if (limitErr.code) setError(limitErr.message)
      else if (message === 'deep_check_timeout' || message.startsWith('No speech was recognized (NoMatch')) setError(t('pronNotHeard'))
      else {
        console.error('Sound check failed:', err)
        setError(t('deepCheckUnavailable', { detail: message }))
      }
      setStatus('error')
    }
  }

  const busy = status === 'preparing' || status === 'recording'

  const panel =
    status === 'idle' ? null : (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">{t('sndSayAnchor', { word: anchorWord, ipa: ipaSymbol })}</p>
      {status === 'preparing' && <StatusLine icon={<Mic className="h-4 w-4" />} text={t('pronGetReady')} />}
      {status === 'recording' && (
        <div className="max-w-sm space-y-2">
          <StatusLine icon={<Mic className="h-4 w-4 text-rose-600" />} text={t('pronYourTurn')} strong />
          <Countdown seconds={windowSeconds} />
        </div>
      )}
      {status === 'error' && <p className="text-sm text-red-600">{error}</p>}
      {status === 'done' && result && <FocusSoundResultView result={result} focusId={phonemeId} />}
    </div>
  )

  return { busy, run: () => void run(), panel }
}
