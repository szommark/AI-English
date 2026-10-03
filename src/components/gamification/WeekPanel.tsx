import { useState } from 'react'
import { useLanguage, type MessageKey } from '../../lib/i18n'
import { setWeeklyGoal } from '../../lib/gamificationApi'
import { MAX_FREEZES, WEEKLY_GOAL_MAX_DAYS, WEEKLY_GOAL_MIN_DAYS } from '../../lib/gamification/constants'
import type { GamificationMe } from '../../lib/gamification/types'

const GOAL_OPTIONS = Array.from(
  { length: WEEKLY_GOAL_MAX_DAYS - WEEKLY_GOAL_MIN_DAYS + 1 },
  (_, i) => WEEKLY_GOAL_MIN_DAYS + i,
)

/**
 * The header chip's panel: level, this week's goal, week and daily streaks, rest days
 * (freezes) and the weekly-goal picker. Nothing here is a warning: a lapsed streak shows a
 * neutral "new streak" note only.
 */
export default function WeekPanel({ me, onChange }: { me: GamificationMe; onChange: (next: GamificationMe) => void }) {
  const { t } = useLanguage()
  const [saving, setSaving] = useState(false)
  const [saveFailed, setSaveFailed] = useState(false)

  const count = (n: number, one: MessageKey, many: MessageKey) => (n === 1 ? t(one) : t(many, { n }))
  const weekDone = me.week.activeDays >= me.week.goalDays
  const weekPercent = Math.min(100, (me.week.activeDays / me.week.goalDays) * 100)
  const levelPercent = me.xpForNextLevel > 0 ? Math.min(100, (me.xpIntoLevel / me.xpForNextLevel) * 100) : 0

  async function chooseGoal(days: number) {
    if (saving || days === me.weeklyGoalDays) return
    setSaving(true)
    setSaveFailed(false)
    try {
      onChange(await setWeeklyGoal(days))
    } catch {
      setSaveFailed(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4 text-sm">
      <div>
        <p className="font-semibold text-foreground">{t('xpLevel', { n: me.level })}</p>
        <Bar percent={levelPercent} />
        <p className="mt-1 text-xs text-muted-foreground">
          {t('xpToNextLevel', { into: me.xpIntoLevel, next: me.xpForNextLevel })}
        </p>
      </div>

      <div>
        <p className="font-medium text-foreground">
          {t('weekGoalProgress', { active: me.week.activeDays, goal: me.week.goalDays })}
        </p>
        <Bar percent={weekPercent} />
        {weekDone && <p className="mt-1 text-xs text-muted-foreground">{t('weekGoalDone')}</p>}
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
        <dt className="text-muted-foreground">{t('weekStreakLabel')}</dt>
        <dd className="text-foreground">
          {count(me.weekStreak, 'countWeeksOne', 'countWeeks')}
          {me.bestWeekStreak > me.weekStreak && (
            <span className="text-muted-foreground"> · {t('bestStreak', { n: me.bestWeekStreak })}</span>
          )}
        </dd>
        <dt className="text-muted-foreground">{t('dailyStreakLabel')}</dt>
        <dd className="text-foreground">{count(me.dailyStreak, 'countDaysOne', 'countDays')}</dd>
        <dt className="text-muted-foreground">{t('freezesLabel')}</dt>
        <dd className="text-foreground">
          {me.freezes} / {MAX_FREEZES}
        </dd>
      </dl>
      <p className="text-xs text-muted-foreground">{t('freezesHint', { max: MAX_FREEZES })}</p>

      {me.streakRestartedToday && <p className="rounded-lg bg-secondary px-3 py-2 text-foreground">{t('streakRestarted')}</p>}

      <div>
        <p id="weekly-goal-label" className="font-medium text-foreground">
          {t('weeklyGoalLabel')}
        </p>
        <div role="group" aria-labelledby="weekly-goal-label" className="mt-2 grid grid-cols-4 gap-2">
          {GOAL_OPTIONS.map((days) => {
            const selected = days === me.weeklyGoalDays
            return (
              <button
                key={days}
                type="button"
                aria-pressed={selected}
                disabled={saving}
                onClick={() => chooseGoal(days)}
                className={`rounded-lg border px-2 py-2 text-sm font-medium disabled:opacity-60 ${
                  selected
                    ? 'border-transparent bg-primary text-primary-foreground'
                    : 'border-border bg-card text-foreground hover:bg-secondary'
                }`}
              >
                {t('countDays', { n: days })}
              </button>
            )
          })}
        </div>
        {me.weeklyGoalDays !== me.week.goalDays && (
          <p className="mt-2 text-xs text-muted-foreground">{t('weeklyGoalNextWeek', { n: me.weeklyGoalDays })}</p>
        )}
        {saveFailed && <p className="mt-2 text-xs text-red-600">{t('weeklyGoalSaveFailed')}</p>}
      </div>
    </div>
  )
}

function Bar({ percent }: { percent: number }) {
  return (
    <span aria-hidden="true" className="mt-1.5 block h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <span className="block h-full rounded-full bg-[var(--teal-accent)]" style={{ width: `${percent}%` }} />
    </span>
  )
}
