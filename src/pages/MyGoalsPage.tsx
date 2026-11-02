import { useEffect, useState } from 'react'
import { Target } from 'lucide-react'
import PageHeading from '../components/PageHeading'
import GoalCard from '../components/Goals/GoalCard'
import { useLanguage } from '../lib/i18n'
import type { LearnerGoal } from '../lib/goals'
import { fetchGoals } from '../lib/goalsApi'

/**
 * "Céljaim" (/my-goals): the goals the learner set with their teacher, read-only. The learner
 * only chooses which ones the home page shows.
 */
export default function MyGoalsPage() {
  const { t } = useLanguage()
  const [goals, setGoals] = useState<LearnerGoal[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetchGoals()
      .then(setGoals)
      .catch(() => setError(true))
  }, [])

  // A goal still waiting for the teacher (from before goals became teacher-only) isn't shown.
  const active = goals?.filter((g) => g.status === 'active') ?? []
  const closed = goals?.filter((g) => g.status === 'achieved' || g.status === 'dropped') ?? []

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeading title={t('myGoals')} subtitle={t('glPageSubtitle')} />

      {error && <p className="text-sm text-red-600">{t('glLoadError')}</p>}
      {!error && goals === null && <p className="text-sm text-muted-foreground">{t('loading')}</p>}

      {goals && active.length === 0 && closed.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <Target className="mx-auto h-8 w-8 text-[var(--teal-accent-strong)]" />
          <h2 className="mt-3 font-semibold text-foreground">{t('glEmptyTitle')}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t('glEmptyBody')}</p>
        </div>
      )}

      {active.map((g) => (
        <GoalCard key={g.id} goal={g} audience="student" onGoals={setGoals} />
      ))}

      {closed.length > 0 && (
        <details className="space-y-3">
          <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
            {t('glClosed')} ({closed.length})
          </summary>
          <div className="mt-3 space-y-4">
            {closed.map((g) => (
              <GoalCard key={g.id} goal={g} audience="student" onGoals={setGoals} />
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
