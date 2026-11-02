import { useState } from 'react'
import { useLanguage } from '../../lib/i18n'
import { GOAL_SKILLS, type GoalRating, type GoalSkill, type GoalType } from '../../lib/goals'
import { secondaryButtonClass } from '../TeacherTools/ui'
import { GOAL_SKILL_LABEL } from './labels'

/**
 * The GROW Reality self-assessment on the goal's one scale: 0–10 on the goal, or — for an
 * "Improving a skill" goal — first a "Choose skill" button, then 1–10 for that skill.
 */
export default function RatingInput({
  goalType,
  skill,
  onSkill,
  chooseAtOnce = false,
  value,
  onValue,
}: {
  goalType: GoalType | null
  skill: GoalSkill | null
  /** Choosing (or, with null, changing) a skill goal's skill; omit when it can't change. */
  onSkill?: (skill: GoalSkill | null) => void
  /** Show the skills straight away (the "Choose skill" button was already pressed). */
  chooseAtOnce?: boolean
  value: number | null
  onValue: (n: number) => void
}) {
  const { t } = useLanguage()
  const [choosing, setChoosing] = useState(chooseAtOnce)
  const skillGoal = goalType === 'skill'

  if (skillGoal && !skill) {
    if (!onSkill) return null
    return choosing ? (
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">{t('glChooseSkillPrompt')}</p>
        <div className="flex flex-wrap gap-1.5">
          {GOAL_SKILLS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                onSkill(s)
                setChoosing(false)
              }}
              className="rounded-full border border-border bg-card px-3 py-1 text-sm text-foreground hover:border-[var(--teal-accent-border)] hover:bg-[var(--teal-accent-soft)]"
            >
              {t(GOAL_SKILL_LABEL[s])}
            </button>
          ))}
        </div>
      </div>
    ) : (
      <button type="button" onClick={() => setChoosing(true)} className={secondaryButtonClass}>
        {t('glChooseSkill')}
      </button>
    )
  }

  const min = skillGoal ? 1 : 0
  const label = skill ? t('glSkillScale', { skill: t(GOAL_SKILL_LABEL[skill]) }) : t('glOverall')

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {skill && onSkill && (
          <button type="button" onClick={() => onSkill(null)} className="text-xs font-medium text-[var(--teal-accent-strong)] hover:underline">
            {t('glChangeSkill')}
          </button>
        )}
      </div>
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
        {Array.from({ length: 11 - min }, (_, i) => i + min).map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            onClick={() => onValue(n)}
            className={`h-9 w-9 rounded-lg border text-sm font-semibold transition-colors ${
              value === n
                ? 'border-[var(--teal-accent-strong)] bg-[var(--teal-accent)] text-primary'
                : value !== null && n < value
                  ? 'border-[var(--teal-accent-border)] bg-[var(--teal-accent-soft)] text-foreground'
                  : 'border-border bg-card text-muted-foreground hover:bg-secondary'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}

/** The rating to save: one value on the goal's scale, or null until one is picked. */
export function toRating(value: number | null): GoalRating | null {
  return value === null ? null : { overall: value, skills: {} }
}
