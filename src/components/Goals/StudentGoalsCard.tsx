import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../lib/i18n'
import type { LearnerGoal } from '../../lib/goals'
import { fetchGoals } from '../../lib/goalsApi'
import { GOAL_STATUS_CLASS, GOAL_STATUS_LABEL } from './labels'

/** Teacher's student page: the student's goals at a glance, with a link to the Goal setting tool. */
export default function StudentGoalsCard({ studentId }: { studentId: string }) {
  const { t } = useLanguage()
  const [goals, setGoals] = useState<LearnerGoal[] | null>(null)

  useEffect(() => {
    fetchGoals(studentId)
      .then(setGoals)
      .catch(() => setGoals([]))
  }, [studentId])

  if (goals === null) return null

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-slate-700">{t('ttGoalsTitle')}</h2>
        <Link to={`/teacher/tools/goals?student=${encodeURIComponent(studentId)}`} className="text-sm text-indigo-600 hover:underline">
          {t('glOpenTool')}
        </Link>
      </div>
      {goals.length === 0 ? (
        <p className="text-sm text-slate-400">{t('glTeacherNoGoals')}</p>
      ) : (
        <ul className="space-y-1.5">
          {goals.map((g) => {
            const start = g.ratings[0]
            const now = g.ratings.at(-1)
            return (
              <li key={g.id} className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${GOAL_STATUS_CLASS[g.status]}`}>{t(GOAL_STATUS_LABEL[g.status])}</span>
                <span className="font-medium text-slate-700">{g.title || t('glBlank')}</span>
                {start && now && <span className="text-slate-400">{start.overall} → {now.overall} / 10</span>}
                {g.steps.length > 0 && (
                  <span className="text-slate-400">· {t('glStepsDone', { done: g.steps.filter((s) => s.done).length, total: g.steps.length })}</span>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
