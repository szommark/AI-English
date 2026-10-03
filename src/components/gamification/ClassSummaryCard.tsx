import type { ClassGamification, ClassStudentGamification } from '../../lib/gamification/types'

/** Teacher dashboard: how the class is doing with practice this week (design §7.1). English, like the teacher pages. */
export default function ClassSummaryCard({ summary }: { summary: ClassGamification['summary'] }) {
  if (summary.students === 0) return null
  const stats = [
    { value: `${summary.activeThisWeek} / ${summary.students}`, label: 'practised this week' },
    { value: `${summary.goalMetThisWeek} / ${summary.students}`, label: 'met their weekly goal so far' },
    { value: `${summary.xpThisWeek}`, label: 'XP earned this week' },
    {
      value: summary.lastWeekOnRecord > 0 ? `${summary.goalMetLastWeek} / ${summary.lastWeekOnRecord}` : '–',
      label: 'met their goal last week',
    },
  ]
  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
      <h2 className="font-medium text-foreground">Class this week</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg bg-secondary px-3 py-3">
            <p className="text-xl font-semibold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/** One roster line: level, this week's goal and the daily streak. */
export function StudentGamificationLine({ student }: { student: ClassStudentGamification | undefined }) {
  if (!student) return null
  const goalMet = student.week.activeDays >= student.week.goalDays
  return (
    <div className="mt-1 text-sm text-muted-foreground">
      Level {student.level} · {student.week.activeDays}/{student.week.goalDays} days this week
      {goalMet && ' ✓'}
      {student.dailyStreak > 1 && ` · ${student.dailyStreak}-day streak`}
      {student.weekStreak > 1 && ` · ${student.weekStreak} goal weeks in a row`}
    </div>
  )
}
