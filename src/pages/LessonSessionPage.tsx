import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import {
  lessonUnitRoute,
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

/** Shared page for the Stress Patterns and Connected Speech sessions: the unit list, and one unit at /:unitId. */
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

  if (unitId && !unit) return <Navigate to={`/pronunciation/${session.id}`} replace />

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

      {unit ? (
        <LessonUnitRunner
          key={unit.id}
          session={session}
          unit={unit}
          accent={accent}
          hasPriorFunnelAttempt={Boolean(progressOf(unit)?.attempts)}
          onProgressChange={refreshProgress}
          onProductionActiveChange={setProductionActive}
        />
      ) : (
        <ol className="space-y-3">
          {session.units.map((u, i) => {
            const entry = progressOf(u)
            return (
              <li key={u.id}>
                <Link
                  to={lessonUnitRoute(session.id, u.id)}
                  className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-rose-200 hover:shadow-[var(--shadow-card)]"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-100 text-sm font-semibold text-rose-700">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-foreground">{u.title}</span>
                    <span className="block text-xs text-rose-500">{u.titleHu}</span>
                    <span className="mt-1 block text-sm text-muted-foreground">{u.summaryHu}</span>
                  </span>
                  <ScoreChips entry={entry} />
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-rose-500" />
                </Link>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}

function ScoreChips({ entry }: { entry: PronunciationProgressEntry | null }) {
  if (!entry || entry.attempts === 0) return null
  return (
    <span className="flex shrink-0 flex-col items-end gap-1 text-[11px] font-medium text-rose-700">
      {entry.perceptionScore !== null && (
        <span className="rounded-full bg-rose-100 px-2 py-0.5">Hallás {Math.round(entry.perceptionScore)}%</span>
      )}
      {entry.productionScore !== null && (
        <span className="rounded-full bg-rose-100 px-2 py-0.5">Kiejtés {Math.round(entry.productionScore)}%</span>
      )}
    </span>
  )
}
