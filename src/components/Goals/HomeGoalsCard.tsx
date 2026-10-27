import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Target } from 'lucide-react'
import { useLanguage } from '../../lib/i18n'
import type { LearnerGoal } from '../../lib/goals'
import { fetchGoals } from '../../lib/goalsApi'

/**
 * Home-page strip: a goal the teacher sent (always, until confirmed) and the active goals the
 * learner chose to show here, each with its next step. Renders nothing when there are none.
 */
export default function HomeGoalsCard() {
  const { t } = useLanguage()
  const [goals, setGoals] = useState<LearnerGoal[]>([])

  useEffect(() => {
    let cancelled = false
    fetchGoals()
      .then((g) => !cancelled && setGoals(g))
      // The home page works without it.
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const pending = goals.filter((g) => g.status === 'pending')
  const shown = goals.filter((g) => g.status === 'active' && g.showOnHome)
  if (pending.length === 0 && shown.length === 0) return null

  return (
    <section className="mx-auto max-w-5xl space-y-3">
      {pending.length > 0 && (
        <Link
          to="/my-goals"
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-5 py-4 hover:border-amber-400"
        >
          <span>
            <span className="block font-semibold text-foreground">{t('glPendingTitle')}</span>
            <span className="block text-sm text-muted-foreground">{t('glPendingBody')}</span>
          </span>
          <span className="text-sm font-medium text-amber-800">{t('glPendingButton')} →</span>
        </Link>
      )}

      {shown.length > 0 && (
        <div className="rounded-2xl border border-[var(--teal-accent-border)] bg-[var(--teal-accent-soft)] px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-semibold text-foreground">
              <Target className="h-5 w-5 text-[var(--teal-accent-strong)]" aria-hidden="true" />
              {t('myGoals')}
            </h2>
            <Link to="/my-goals" className="text-sm font-medium text-[var(--teal-accent-strong)] hover:underline">
              {t('glHomeAll')}
            </Link>
          </div>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((g) => {
              const start = g.ratings[0]
              const now = g.ratings.at(-1)
              const next = g.steps.find((s) => !s.done)
              return (
                <li key={g.id} className="rounded-xl bg-card px-4 py-3 shadow-sm">
                  <p className="font-medium text-foreground">{g.title}</p>
                  {start && now && (
                    <p className="text-xs text-muted-foreground">
                      {start === now ? t('glStartOnly', { start: start.overall }) : t('glStartNow', { start: start.overall, now: now.overall })}
                    </p>
                  )}
                  {g.steps.length > 0 && (
                    <p className="mt-1 text-sm text-foreground">
                      {next ? (
                        <>
                          <span className="text-muted-foreground">{t('glHomeNext')}</span> {next.text}
                        </>
                      ) : (
                        <span className="text-muted-foreground">{t('glHomeAllDone')}</span>
                      )}
                    </p>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </section>
  )
}
