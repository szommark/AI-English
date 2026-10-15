import { useCallback, useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import {
  lessonSessionRoute,
  progressIdOf,
  type LessonSession,
  type LessonUnit,
} from '../data/pronunciationLessons'
import {
  getAccentPreference,
  setAccentPreference,
  PRODUCTION_ACCENT_NOTE_HU,
  PRODUCTION_ASSESSMENT_ACCENT,
  type AccentPreference,
} from '../lib/voiceSelection'
import { fetchPronunciationProgress, type PronunciationProgressEntry } from '../lib/pronunciationProgressApi'
import AccentToggle from '../components/AccentToggle'
import PageHeading from '../components/PageHeading'
import LessonUnitRunner from '../components/PronunciationLessons/LessonUnitRunner'

/** Shared page for one Stress Patterns or Connected Speech unit, at /pronunciation/<session>/:unitId. */
export default function LessonSessionPage({ session }: { session: LessonSession }) {
  const { unitId } = useParams<{ unitId: string }>()
  const unit = unitId ? session.units.find((u) => u.id === unitId) : undefined

  const [accent, setAccent] = useState<AccentPreference>(() => getAccentPreference())
  const [progress, setProgress] = useState<PronunciationProgressEntry[]>([])
  // True while an Azure-scored step is on screen: those are always assessed in American English,
  // so the toggle shows (and locks on) US without touching the saved preference.
  const [productionActive, setProductionActive] = useState(false)
  const displayedAccent = productionActive ? PRODUCTION_ASSESSMENT_ACCENT : accent

  const refreshProgress = useCallback(() => {
    fetchPronunciationProgress().then(setProgress)
  }, [])
  useEffect(refreshProgress, [refreshProgress])

  function handleAccentChange(next: AccentPreference) {
    setAccent(next)
    setAccentPreference(next)
  }

  // The unit list itself is a tab of /pronunciation.
  if (!unit) return <Navigate to={lessonSessionRoute(session.id)} replace />

  const progressOf = (u: LessonUnit) => progress.find((p) => p.soundItemId === progressIdOf(u)) ?? null

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeading
        title={session.title}
        subtitle={session.descriptionHu}
        actions={
          <div className="flex flex-col items-end gap-1">
            <AccentToggle accent={displayedAccent} onChange={handleAccentChange} disabled={productionActive} />
            {productionActive && (
              <p className="max-w-[16rem] text-right text-xs text-muted-foreground">{PRODUCTION_ACCENT_NOTE_HU}</p>
            )}
          </div>
        }
      />

      <LessonUnitRunner
        key={unit.id}
        session={session}
        unit={unit}
        accent={accent}
        hasPriorFunnelAttempt={Boolean(progressOf(unit)?.attempts)}
        onProgressChange={refreshProgress}
        onProductionActiveChange={setProductionActive}
      />
    </div>
  )
}
