import { useState } from 'react'
import { useLanguage } from '../../lib/i18n'
import { GOAL_SKILLS, goalScale, weeksLeft, type GoalRating, type GoalSkill, type LearnerGoal } from '../../lib/goals'
import { deleteGoal, rateGoal, setGoalOnHome, setGoalStatus, setGoalStep } from '../../lib/goalsApi'
import { cardClass, primaryButtonClass, secondaryButtonClass } from '../TeacherTools/ui'
import RatingInput, { toRating } from './RatingInput'
import GoalPlanView from './GoalPlanView'
import { GOAL_SKILL_LABEL, GOAL_STATUS_CLASS, GOAL_STATUS_LABEL, GOAL_TYPE_LABEL, goalErrorKey, realityLine } from './labels'

/** Start vs now on the goal's one scale (the goal 0–10, or its skill 1–10). */
function RealityView({ goal, start, now }: { goal: LearnerGoal; start: GoalRating; now: GoalRating }) {
  const { t } = useLanguage()
  const changed = now !== start
  const line = realityLine(t, goal, start.overall, changed ? now.overall : start.overall)
  // Ratings from before one-scale goals may hold several skill scores.
  const oldSkills = GOAL_SKILLS.filter((s) => start.skills[s] != null || now.skills[s] != null)
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">{line}</p>
      <div className="relative h-2.5 overflow-hidden rounded-full bg-secondary" aria-hidden="true">
        <span className="absolute inset-y-0 left-0 rounded-full bg-[var(--teal-accent)]" style={{ width: `${now.overall * 10}%` }} />
        {changed && <span className="absolute inset-y-0 w-0.5 bg-[var(--teal-accent-strong)]" style={{ left: `${start.overall * 10}%` }} />}
      </div>
      {oldSkills.length > 0 && (
        <ul className="flex flex-wrap gap-1.5 text-xs">
          {oldSkills.map((s) => {
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
 * One goal: Goal, Reality (start vs now), Options, Will steps and milestones. The teacher sets
 * and changes everything together with the student: edits, re-rates, ticks steps, plans
 * milestones, closes or reopens it. The student reads it and only chooses whether their home
 * page shows it.
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
  /** Teacher: opens the goal form. */
  onEdit?: () => void
  /** Teacher: opens the milestone editor. */
  onPlan?: () => void
  /** False when the student already has the most open goals. */
  canReopen?: boolean
}) {
  const { t, lang } = useLanguage()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  /** The teacher's re-rating in progress: the value, and the skill if it is chosen now. */
  const [rating, setRating] = useState<{ value: number | null; skill: GoalSkill | null } | null>(null)

  const teacher = audience === 'teacher'
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

  const weeks = goal.deadline ? weeksLeft(goal.deadline) : null
  const doneSteps = goal.steps.filter((s) => s.done).length
  const hasActions = teacher || active

  function saveRating() {
    const r = rating && toRating(rating.value)
    if (r) void run(() => rateGoal(goal.id, r, goal.skill ? null : rating?.skill))
  }

  return (
    <article className={`${cardClass} ${closed ? 'opacity-80' : ''}`}>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className={`rounded-full px-2.5 py-1 font-medium ${GOAL_STATUS_CLASS[goal.status]}`}>{t(GOAL_STATUS_LABEL[goal.status])}</span>
        {goal.goalType && <span className="text-muted-foreground">{t(GOAL_TYPE_LABEL[goal.goalType])}</span>}
        {goal.skill && <span className="text-muted-foreground">· {t(GOAL_SKILL_LABEL[goal.skill])}</span>}
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
            goalType={goal.goalType}
            skill={goal.skill ?? rating.skill}
            // A skill goal's skill is chosen once; after that it is changed in the goal form.
            onSkill={goal.skill ? undefined : (skill) => setRating({ value: null, skill })}
            chooseAtOnce
            value={rating.value}
            onValue={(value) => setRating((r) => r && { ...r, value })}
          />
          <div className="flex gap-3">
            <button type="button" disabled={busy || rating.value === null} onClick={saveRating} className={primaryButtonClass}>
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
          <RealityView goal={goal} start={start} now={now} />
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
                    disabled={busy || !teacher || !active}
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
          {!teacher && (
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
          )}
          {teacher && (
            <>
              {active && !rating && (
                <button type="button" disabled={busy} onClick={() => setRating({ value: null, skill: null })} className={secondaryButtonClass}>
                  {t(goalScale(goal) === null ? 'glChooseSkill' : now ? 'glRerate' : 'glRate')}
                </button>
              )}
              {onEdit && (
                <button type="button" disabled={busy} onClick={onEdit} className={secondaryButtonClass}>
                  {t('glEdit')}
                </button>
              )}
              {onPlan && !closed && (
                <button type="button" disabled={busy} onClick={onPlan} className={secondaryButtonClass}>
                  {t('gpEditPlan')}
                </button>
              )}
              {active && (
                <>
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
                </>
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
              {closed && canReopen && (
                <button type="button" disabled={busy} onClick={() => void run(() => setGoalStatus(goal.id, 'active'))} className={secondaryButtonClass}>
                  {t('glReopen')}
                </button>
              )}
            </>
          )}
        </div>
      )}
    </article>
  )
}
