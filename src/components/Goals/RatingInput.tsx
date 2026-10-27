import { useLanguage } from '../../lib/i18n'
import { GOAL_SKILLS, type GoalRating, type GoalSkill } from '../../lib/goals'
import { GOAL_SKILL_LABEL } from './labels'
import { inputClass } from '../TeacherTools/ui'

/** The GROW Reality self-assessment: 0–10 on the goal, plus any skills 1–10. */
export default function RatingInput({
  overall,
  skills,
  onOverall,
  onSkill,
}: {
  overall: number | null
  skills: GoalRating['skills']
  onOverall: (n: number) => void
  onSkill: (skill: GoalSkill, n: number | null) => void
}) {
  const { t } = useLanguage()

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">{t('glOverall')}</p>
        <div role="radiogroup" aria-label={t('glOverall')} className="flex flex-wrap gap-1.5">
          {Array.from({ length: 11 }, (_, n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={overall === n}
              onClick={() => onOverall(n)}
              className={`h-9 w-9 rounded-lg border text-sm font-semibold transition-colors ${
                overall === n
                  ? 'border-[var(--teal-accent-strong)] bg-[var(--teal-accent)] text-primary'
                  : overall !== null && n < overall
                    ? 'border-[var(--teal-accent-border)] bg-[var(--teal-accent-soft)] text-foreground'
                    : 'border-border bg-card text-muted-foreground hover:bg-secondary'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">{t('glSkills')}</p>
        <div className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
          {GOAL_SKILLS.map((skill) => (
            <label key={skill} className="flex items-center justify-between gap-3 text-sm text-foreground">
              <span>{t(GOAL_SKILL_LABEL[skill])}</span>
              <select
                value={skills[skill] ?? ''}
                onChange={(e) => onSkill(skill, e.target.value ? Number(e.target.value) : null)}
                className={`${inputClass} max-w-[5rem] shrink-0 py-1.5`}
              >
                <option value="">–</option>
                {Array.from({ length: 10 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

/** Rating state for RatingInput: null until an overall score is picked. */
export function toRating(overall: number | null, skills: GoalRating['skills']): GoalRating | null {
  return overall === null ? null : { overall, skills }
}

export function withSkill(skills: GoalRating['skills'], skill: GoalSkill, n: number | null): GoalRating['skills'] {
  const next = { ...skills }
  if (n === null) delete next[skill]
  else next[skill] = n
  return next
}
