import { useState } from 'react'
import { useLanguage } from '../../lib/i18n'
import { GOAL_SKILLS, weeksLeft, type GoalRating, type LearnerGoal } from '../../lib/goals'
import { deleteGoal, rateGoal, setGoalOnHome, setGoalStatus, setGoalStep } from '../../lib/goalsApi'
import { cardClass, primaryButtonClass, secondaryButtonClass } from '../TeacherTools/ui'
import RatingInput, { toRating, withSkill } from './RatingInput'
import GoalPlanView from './GoalPlanView'
import { GOAL_SKILL_LABEL, GOAL_STATUS_CLASS, GOAL_STATUS_LABEL, GOAL_TYPE_LABEL, goalErrorKey } from './labels'

/** Start vs now on the goal (0–10), with the skills that were rated. */
function RealityView({ start, now }: { start: GoalRating; now: GoalRating }) {
  const { t } = useLanguage()
  const changed = now !== start
  const skills = GOAL_SKILLS.filter((s) => start.skills[s] != null || now.skills[s] != null)
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">
        {changed ? t('glStartNow', { start: start.overall, now: now.overall }) : t('glStartOnly', { start: start.overall })}
      </p>
      <div className="relative h-2.5 overflow-hidden rounded-full bg-secondary" aria-hidden="true">
        <span className="absolute inset-y-0 left-0 rounded-full bg-[var(--teal-accent)]" style={{ width: `${now.overall * 10}%` }} />
        {changed && <span className="absolute inset-y-0 w-0.5 bg-[var(--teal-accent-strong)]" style={{ left: `${start.overall * 10}%` }} />}
      </div>
      {skills.length > 0 && (
        <ul className="flex flex-wrap gap-1.5 text-xs">
          {skills.map((s) => {
            const a = start.skills[s]
            const b = now.skills[s]
            return (
              <li key={s} className="rounded-full bg-secondary px-2.5 py-1 text-foreground">
                {t(GOAL_SKILL_LABEL[s])} {changed && a != null && b != null && a !== b ? `${a} → ${b}` : (b ?? a)}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

/**
 * One goal: Goal, Reality (start vs now), Options and Will steps. The student ticks steps,
 * re-rates, closes or reopens it and chooses whether the home page shows it; a teacher sees the
 * same and can edit it or withdraw an unconfirmed one.
 */
export default function GoalCard({
  goal,
  audience,
  onGoals,
  onEdit,
  onPlan,
  canReopen = true,
}: {
  goal: LearnerGoal
  audience: 'student' | 'teacher'
  /** Every change replies with the student's goal list. */
  onGoals: (goals: LearnerGoal[]) => void
  onEdit: () => void
  /** Teacher: opens the milestone editor. */
  onPlan?: () => void
  /** False when the student already has the most open goals. */
  canReopen?: boolean
}) {
  const { t, lang } = useLanguage()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rating, setRating] = useState<{ overall: number | null; skills: GoalRating['skills'] } | null>(null)

  const student = audience === 'student'
  const active = goal.status === 'active'
  const pending = goal.status === 'pending'
  const closed = !active && !pending
  const start = goal.ratings[0] ?? (pending ? goal.draftRating : null)
  const now = goal.ratings.at(-1) ?? start

  async function run(action: () => Promise<LearnerGoal[]>) {
    setBusy(true)
    setError(null)
    try {
      onGoals(await action())
      setRating(null)
    } catch (err) {
      setError(t(goalErrorKey(err)))
    } finally {
      setBusy(false)
    }
  }

  const hasActions = !student || pending || active || (closed && canReopen)
  const weeks = goal.deadline ? weeksLeft(goal.deadline) : null
  const doneSteps = goal.steps.filter((s) => s.done).length

  return (
    <article className={`${cardClass} ${closed ? 'opacity-80' : ''}`}>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className={`rounded-full px-2.5 py-1 font-medium ${GOAL_STATUS_CLASS[goal.status]}`}>{t(GOAL_STATUS_LABEL[goal.status])}</span>
        {goal.goalType && <span className="text-muted-foreground">{t(GOAL_TYPE_LABEL[goal.goalType])}</span>}
        {goal.startedBy === 'teacher' && student && <span className="text-muted-foreground">· {t('glStartedByTeacher')}</span>}
        {goal.startedBy === 'student' && !student && <span className="text-muted-foreground">· {t('glStartedByStudent')}</span>}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-foreground">{goal.title || t('glBlank')}</h3>
        {goal.deadline && (
          <p className="text-sm text-muted-foreground">
            {t('glDeadlineLine', { date: new Date(`${goal.deadline}T00:00:00`).toLocaleDateString(lang) })}
            {!closed && weeks !== null && <> · {weeks >= 0 ? t('glWeeksLeft', { n: weeks }) : t('glDeadlinePassed')}</>}
          </p>
        )}
        {goal.why && <p className="mt-1 text-sm italic text-muted-foreground">{goal.why}</p>}
      </div>

      {rating ? (
        <div className="space-y-3 rounded-xl bg-secondary/60 p-4">
          <RatingInput
            overall={rating.overall}
            skills={rating.skills}
            onOverall={(n) => setRating((r) => r && { ...r, overall: n })}
            onSkill={(skill, n) => setRating((r) => r && { ...r, skills: withSkill(r.skills, skill, n) })}
          />
          <div className="flex gap-3">
            <button
              type="button"
              disabled={busy || rating.overall === null}
              onClick={() => {
                const r = toRating(rating.overall, rating.skills)
                if (r) void run(() => rateGoal(goal.id, r))
              }}
              className={primaryButtonClass}
            >
              {t('glRatingSave')}
            </button>
            <button type="button" onClick={() => setRating(null)} className="text-sm text-muted-foreground hover:text-foreground">
              {t('glCancel')}
            </button>
          </div>
        </div>
      ) : start && now ? (
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">{t('glStepReality')}</p>
          <RealityView start={start} now={now} />
        </div>
      ) : (
        !pending && <p className="text-sm text-muted-foreground">{t('glNotRated')}</p>
      )}

      {goal.options.length > 0 && (
        <div>
          <p className="text-sm font-medium text-foreground">{t('glStepOptions')}</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-foreground">
            {goal.options.map((o, i) => (
              <li key={i}>{o}</li>
            ))}
          </ul>
        </div>
      )}

      {(goal.steps.length > 0 || goal.daysPerWeek) && (
        <div>
          <p className="text-sm font-medium text-foreground">
            {t('glStepWill')}
            {goal.steps.length > 0 && (
              <span className="font-normal text-muted-foreground"> · {t('glStepsDone', { done: doneSteps, total: goal.steps.length })}</span>
            )}
          </p>
          <ul className="mt-1 space-y-1">
            {goal.steps.map((s) => (
              <li key={s.id}>
                <label className="flex items-start gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={s.done}
                    disabled={busy || !active}
                    onChange={(e) => void run(() => setGoalStep(goal.id, s.id, e.target.checked))}
                    className="mt-0.5 h-4 w-4 accent-[var(--teal-accent-strong)]"
                  />
                  <span className={s.done ? 'text-muted-foreground line-through' : ''}>{s.text}</span>
                </label>
              </li>
            ))}
          </ul>
          {goal.daysPerWeek && <p className="mt-1 text-sm text-muted-foreground">{t('glDaysLine', { n: goal.daysPerWeek })}</p>}
        </div>
      )}

      <GoalPlanView goal={goal} audience={audience} />

      {error && <p className="text-sm text-red-600">{error}</p>}

      {hasActions && (
      <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
        {student && pending && (
          <>
            <button type="button" onClick={onEdit} className={primaryButtonClass}>
              {t('glPendingButton')}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => window.confirm(t('glDropConfirm')) && void run(() => setGoalStatus(goal.id, 'dropped'))}
              className={secondaryButtonClass}
            >
              {t('glDrop')}
            </button>
          </>
        )}
        {student && active && (
          <>
            {!rating && (
              <button type="button" disabled={busy} onClick={() => setRating({ overall: now?.overall ?? null, skills: now?.skills ?? {} })} className={secondaryButtonClass}>
                {t('glRerate')}
              </button>
            )}
            <button type="button" disabled={busy} onClick={onEdit} className={secondaryButtonClass}>
              {t('glEdit')}
            </button>
            <button type="button" disabled={busy} onClick={() => void run(() => setGoalStatus(goal.id, 'achieved'))} className={secondaryButtonClass}>
              {t('glMarkAchieved')}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => window.confirm(t('glDropConfirm')) && void run(() => setGoalStatus(goal.id, 'dropped'))}
              className={secondaryButtonClass}
            >
              {t('glDrop')}
            </button>
            <label className="ml-auto flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={goal.showOnHome}
                disabled={busy}
                onChange={(e) => void run(() => setGoalOnHome(goal.id, e.target.checked))}
                className="h-4 w-4 accent-[var(--teal-accent-strong)]"
              />
              {t('glShowOnHome')}
            </label>
          </>
        )}
        {student && closed && canReopen && (
          <button type="button" disabled={busy} onClick={() => void run(() => setGoalStatus(goal.id, 'active'))} className={secondaryButtonClass}>
            {t('glReopen')}
          </button>
        )}
        {!student && (
          <>
            <button type="button" disabled={busy} onClick={onEdit} className={secondaryButtonClass}>
              {t('glEdit')}
            </button>
            {onPlan && !closed && (
              <button type="button" disabled={busy} onClick={onPlan} className={secondaryButtonClass}>
                {t('gpEditPlan')}
              </button>
            )}
            {pending && (
              <button
                type="button"
                disabled={busy}
                onClick={() => window.confirm(t('glWithdrawConfirm')) && void run(() => deleteGoal(goal.id))}
                className={secondaryButtonClass}
              >
                {t('glWithdraw')}
              </button>
            )}
          </>
        )}
      </div>
      )}
    </article>
  )
}
