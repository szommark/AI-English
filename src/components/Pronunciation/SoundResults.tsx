import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import { getPhoneme } from '../../data/phonemes'
import { useAuth } from '../../lib/AuthContext'
import { useLanguage } from '../../lib/i18n'
import { focusSoundResult, soundsToPractise } from '../../lib/phonemeLabels'
import type { PronunciationCheckResult, PronunciationWordDetail } from '../../lib/types'
import PronunciationResultCard from '../PronunciationResultCard'
import ScoreBar from '../PronunciationPractice/ScoreBar'

/** Admins keep Azure's per-phoneme points; teachers and students get bars. */
export function useShowsPhonemePoints(): boolean {
  return useAuth().role === 'admin'
}

/** Shown instead of a bar when Azure heard a different sound. */
export function HeardAs({ ipa, expected }: { ipa: string; expected?: string }) {
  const { t } = useLanguage()
  return (
    <p className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-sm font-medium text-red-600">
      <X className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {expected && <span className="font-mono">/{expected}/ →</span>}
      {t('sndHeardAs', { ipa })}
    </p>
  )
}

/** The words Azure assessed against the reference text (insertions are extra noise, so left out). */
function assessedWords(result: PronunciationCheckResult): PronunciationWordDetail[] {
  return result.words.filter((w) => w.errorType !== 'Insertion')
}

/** The focus sound only, inside the anchor word: its bar, or what was heard instead. */
export function FocusSoundResultView({
  result,
  focusId,
}: {
  result: PronunciationCheckResult
  focusId: string
}) {
  const { t } = useLanguage()
  const showPoints = useShowsPhonemePoints()
  const word = assessedWords(result)[0]
  if (showPoints) return <PronunciationResultCard result={result} targetSentence={word?.word ?? ''} showAllPhonemes />
  const focus = focusSoundResult(word, focusId)
  if (!focus) return <p className="text-sm text-muted-foreground">{t('sndNotInRecording')}</p>
  if (focus.heardAs) return <HeardAs ipa={focus.heardAs} />
  return (
    <div className="max-w-xs">
      <ScoreBar score={focus.score} />
    </div>
  )
}

/** One row per word: its bar, or the sounds Azure heard instead of the expected ones. */
export function WordResultsView({
  result,
  targetText,
}: {
  result: PronunciationCheckResult
  targetText: string
}) {
  const { t } = useLanguage()
  const showPoints = useShowsPhonemePoints()
  // Minimal pairs are sent as "thin, tin"; the comma would stick to the first word chip.
  if (showPoints) return <PronunciationResultCard result={result} targetSentence={targetText.replace(/,/g, '')} showAllPhonemes />
  const words = assessedWords(result)
  // A single word is already the item's own label.
  const labelled = words.length > 1
  return (
    <ul className="space-y-1.5">
      {words.map((word, i) => {
        const substitutions = (word.phonemes ?? []).filter((p) => p.heardAs)
        return (
          <li
            key={i}
            className={`items-center gap-3 text-sm ${labelled ? 'grid grid-cols-[6.5rem_1fr] sm:grid-cols-[8rem_1fr]' : 'flex'}`}
          >
            {labelled && <span className="min-w-0 truncate text-foreground">{word.word}</span>}
            {word.errorType === 'Omission' ? (
              <span className="text-xs text-muted-foreground">{t('sndWordMissing')}</span>
            ) : substitutions.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {substitutions.map((p, pi) => (
                  <HeardAs key={pi} ipa={p.heardAs!} expected={p.phoneme} />
                ))}
              </div>
            ) : (
              <div className="max-w-xs">
                <ScoreBar score={word.accuracyScore} />
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}

/** Other sounds that scored under 80 or were heard as something else, linked to their own sheets. */
export function PractiseTooLinks({ results, focusId }: { results: PronunciationCheckResult[]; focusId: string }) {
  const { t } = useLanguage()
  const phonemes = soundsToPractise(results, focusId).flatMap((id) => getPhoneme(id) ?? [])
  if (phonemes.length === 0) return null
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">{t('sndPractiseToo')}</p>
      <ul className="flex flex-wrap gap-2">
        {phonemes.map((p) => (
          <li key={p.id}>
            <Link
              to={`/pronunciation/sounds/${p.id}?mode=pronunciation`}
              className="inline-block rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-base font-semibold text-rose-700 hover:bg-rose-100"
            >
              /{p.ipaSymbol}/
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
