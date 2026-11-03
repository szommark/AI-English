import type { ReactNode } from 'react'
import { getFeature } from '../../data/features'
import { useMyProgressCopy, type MyProgressCopy } from '../../data/myProgressCopy'
import { localizeFeature, useLanguage, type Lang } from '../../lib/i18n'
import type { BadgeWallItem } from '../../lib/gamification/types'
import BadgeMedal from './BadgeMedal'

export function sectionName(section: string, lang: Lang, C: MyProgressCopy): string {
  if (section === 'teacher') return C.gamSectionTeacher
  if (section === 'challenge') return C.gamSectionChallenge
  if (section === 'courses') return C.gamSectionCourses
  if (section === 'tests') return C.gamSectionTests
  const feature = getFeature(section)
  return feature ? localizeFeature(lang, feature).title : section
}

/** A badge's name in the UI language; German falls back to English. */
export function badgeName(b: Pick<BadgeWallItem, 'nameHu' | 'nameEn'>, lang: Lang): string | null {
  return lang === 'hu' ? b.nameHu : b.nameEn
}

export interface SummaryState {
  level: number
  totalXp: number
  week: { goalDays: number; activeDays: number }
  weekStreak: number
  bestWeekStreak: number
  dailyStreak: number
}

/**
 * "Points, streaks and badges": level, this week, streaks, XP by area and the badges earned.
 * The first thing on "Az én fejlődésem" and on the teacher's student page, in the same format;
 * `children` adds what only one of them has (the teacher's bonus form).
 */
export default function GamificationSummary({
  me,
  xpBySection,
  badges,
  children,
}: {
  me: SummaryState
  xpBySection: { section: string; xp: number }[]
  /** Earned badges only. */
  badges: BadgeWallItem[]
  children?: ReactNode
}) {
  const C = useMyProgressCopy()
  const { lang } = useLanguage()
  return (
    <section className="rounded-xl border border-border bg-card p-5 space-y-5 shadow-sm">
      <h2 className="text-lg font-semibold text-foreground">{C.gamHeading}</h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat value={C.gamLevel(me.level)} label={C.gamTotalXp(me.totalXp)} />
        <Stat value={`${me.week.activeDays} / ${me.week.goalDays}`} label={C.gamDaysThisWeek} />
        <Stat value={`${me.weekStreak}`} label={C.gamWeekStreak(me.bestWeekStreak)} />
        <Stat value={`${me.dailyStreak}`} label={C.gamDayStreak} />
      </div>

      <div className="space-y-1">
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{C.gamBySectionHeading}</h3>
        {xpBySection.length === 0 ? (
          <p className="text-sm text-muted-foreground">{C.gamBySectionEmpty}</p>
        ) : (
          <ul className="text-sm text-foreground">
            {xpBySection.map((s) => (
              <li key={s.section} className="flex justify-between gap-3">
                <span>{sectionName(s.section, lang, C)}</span>
                <span className="text-muted-foreground">{s.xp} XP</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{C.gamBadgesEarned(badges.length)}</h3>
        {badges.length === 0 ? (
          <p className="text-sm text-muted-foreground">{C.gamNoBadges}</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {badges.map((b) => (
              <li key={b.key} className="flex items-center gap-2 rounded-full border border-border py-1 pl-1 pr-3">
                <BadgeMedal icon={b.icon} earned size="sm" />
                <span className="text-sm text-foreground">{badgeName(b, lang)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {children}
    </section>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg bg-secondary px-3 py-2">
      <p className="text-lg font-semibold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
