import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { useLanguage } from '../../lib/i18n'
import type { LearnerGoal } from '../../lib/goals'
import { milestoneProgress, taskState, type GoalTask } from '../../lib/goalPlans'
import { budapestDate } from '../../lib/gamification/dates'
import { SCENARIO_MODE_LABEL, TASK_KIND_ICON, TASK_KIND_LABEL } from './labels'

/** Where the student opens a task's content. */
export function taskLink(task: GoalTask): string | null {
  switch (task.kind) {
    case 'course':
      return task.assignmentId ? `/my-courses/${task.assignmentId}` : null
    case 'comp_test':
      return task.assignmentId ? `/my-tests/${task.assignmentId}` : null
    case 'word_list':
      return `/vocabulary?list=${encodeURIComponent(task.ref)}`
    case 'scenario':
      return `/scenario/${encodeURIComponent(task.ref)}/${task.scenarioMode === 'practice' ? 'rehearsal' : 'test'}`
  }
}

/**
 * A goal's milestones, read-only: each with its due date and done/total, and its tasks with a
 * tick, an overdue label or the due date. The student opens a task from here; the teacher also
 * sees which tasks aren't assigned yet (the goal is still pending).
 */
export default function GoalPlanView({ goal, audience }: { goal: LearnerGoal; audience: 'student' | 'teacher' }) {
  const { t, lang } = useLanguage()
  const today = budapestDate()
  const date = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString(lang)
  const student = audience === 'student'
  const closed = goal.status === 'achieved' || goal.status === 'dropped'

  if (goal.milestones.length === 0) return null
  if (student && goal.status === 'pending') {
    return <p className="text-sm text-muted-foreground">{t('gpPendingStudent', { n: goal.milestones.length })}</p>
  }

  return (
    <div>
      <p className="text-sm font-medium text-foreground">{t('gpMilestones')}</p>
      <ol className="mt-2 space-y-3">
        {goal.milestones.map((m, i) => {
          const { done, total } = milestoneProgress(m)
          const finished = !!m.completedAt
          const late = !finished && !closed && m.dueOn < today
          return (
            <li key={m.id} className="relative pl-4">
              <span
                className={`absolute inset-y-0.5 left-0 w-1 rounded-full ${finished ? 'bg-emerald-400' : 'bg-[var(--teal-accent)]'}`}
                aria-hidden="true"
              />
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 ${
                    finished ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-border text-foreground'
                  }`}
                >
                  {finished && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                  {i + 1}. {m.title}
                  {total > 0 && <span className="tabular-nums text-muted-foreground">· {t('gpProgress', { done, total })}</span>}
                </span>
                <span className={late ? 'font-medium text-amber-700' : 'text-muted-foreground'}>
                  {late ? `${t('gpOverdue')} · ${date(m.dueOn)}` : t('gpDueOn', { date: date(m.dueOn) })}
                </span>
              </div>
              {m.note && <p className="mt-1 text-sm italic text-muted-foreground">{m.note}</p>}
              {m.tasks.length > 0 && (
                <ul className="mt-1.5 space-y-1">
                  {m.tasks.map((x) => {
                    const Icon = TASK_KIND_ICON[x.kind]
                    const state = taskState(x, today)
                    const link = student && !closed && state !== 'done' ? taskLink(x) : null
                    return (
                      <li key={x.id} className="flex flex-wrap items-center gap-2 text-sm">
                        {state === 'done' ? (
                          <Check className="h-4 w-4 shrink-0 text-emerald-600" aria-label={t('gpTaskDone')} />
                        ) : (
                          <Icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                        )}
                        <span className={state === 'done' ? 'text-muted-foreground line-through' : 'text-foreground'}>{x.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {t(TASK_KIND_LABEL[x.kind])}
                          {x.kind === 'scenario' && x.scenarioMode && ` · ${t(SCENARIO_MODE_LABEL[x.scenarioMode])}`}
                          {x.kind === 'comp_test' && x.minScore != null && ` · ≥ ${x.minScore}%`}
                        </span>
                        {state !== 'done' && (
                          <span className={`text-xs ${state === 'overdue' && !closed ? 'font-medium text-amber-700' : 'text-muted-foreground'}`}>
                            {state === 'overdue' && !closed ? `${t('gpOverdue')} · ${date(x.dueOn)}` : t('gpDueOn', { date: date(x.dueOn) })}
                          </span>
                        )}
                        {!student && !x.assigned && <span className="text-xs text-amber-700">· {t('gpNotAssigned')}</span>}
                        {link && (
                          <Link to={link} className="text-xs font-medium text-[var(--teal-accent-strong)] hover:underline">
                            {t('gpOpen')} →
                          </Link>
                        )}
                      </li>
                    )
                  })}
                </ul>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
