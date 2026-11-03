import { useEffect, useState } from 'react'
import { PROGRESS_LOCALE, useMyProgressCopy } from '../../data/myProgressCopy'
import { useLanguage } from '../../lib/i18n'
import { fetchGamificationOverview, markNoticesSeen } from '../../lib/gamificationApi'
import { publishMeNotices } from '../../lib/gamification/xpEvents'
import StudentChallenges from './StudentChallenges'
import { ClassRankingSection, LeaderboardSection } from './SocialSections'
import type { BadgeWallItem, GamificationOverview, WeekHistoryItem } from '../../lib/gamification/types'
import BadgeMedal from './BadgeMedal'
import GamificationSummary, { badgeName } from './GamificationSummary'
import WisdomCollection from './WisdomCollection'

function useDateFormats() {
  const { lang } = useLanguage()
  return {
    short: new Intl.DateTimeFormat(PROGRESS_LOCALE[lang], { month: 'short', day: 'numeric' }),
    long: new Intl.DateTimeFormat(PROGRESS_LOCALE[lang], { year: 'numeric', month: 'long', day: 'numeric' }),
  }
}

/**
 * The learner's gamification overview for "Az én fejlődésem", loaded once for both the
 * summary at the top and the panel further down. Loads apart from the page's own data, so a
 * failure here never hides the rest of the page.
 */
export function useGamificationOverview(): { data: GamificationOverview | null; error: boolean } {
  const [data, setData] = useState<GamificationOverview | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchGamificationOverview()
      .then((d) => {
        if (cancelled) return
        setData(d)
        // Loading this page can complete a challenge (e.g. the class reached its target).
        if (publishMeNotices(d.me)) void markNoticesSeen()
      })
      .catch(() => !cancelled && setError(true))
    return () => {
      cancelled = true
    }
  }, [])

  return { data, error }
}

/** The unlocked proverbs, then the summary block (first on the page): the same format the teacher sees. */
export function GamificationSummaryCard({ data, error }: { data: GamificationOverview | null; error: boolean }) {
  const C = useMyProgressCopy()
  if (error) {
    return (
      <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <p className="text-base text-muted-foreground">{C.gamLoadError}</p>
      </section>
    )
  }
  if (!data) return null
  return (
    <>
      <WisdomCollection badges={data.badges} emptyText={C.gamWisdomEmpty} />
      <GamificationSummary me={data.me} xpBySection={data.xpBySection} badges={data.badges.filter((b) => b.earned)} />
    </>
  )
}

/**
 * The rest of the gamification on "Az én fejlődésem" (design §10): progress to the next
 * level, challenges, teacher bonuses, the weekly goal over recent weeks, the badge wall and
 * the rankings. Level, streaks, XP by area and earned badges are in the summary at the top.
 */
export default function GamificationPanel({ data }: { data: GamificationOverview | null }) {
  const C = useMyProgressCopy()
  const dates = useDateFormats()
  if (!data) return null

  const { me } = data
  const levelPercent = me.xpForNextLevel > 0 ? Math.min(100, (me.xpIntoLevel / me.xpForNextLevel) * 100) : 0

  return (
    <section className="rounded-xl border border-border bg-card p-5 space-y-6 shadow-sm">
      <h2 className="text-lg font-semibold text-foreground">{C.gamMoreHeading}</h2>

      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <p className="text-xl font-semibold tracking-tight text-foreground">{C.gamLevel(me.level)}</p>
          <p className="text-sm text-muted-foreground">{C.gamToNext(me.xpIntoLevel, me.xpForNextLevel)}</p>
        </div>
        <span aria-hidden="true" className="mt-2 block h-2.5 overflow-hidden rounded-full bg-secondary">
          <span className="block h-full rounded-full bg-[var(--teal-accent)]" style={{ width: `${levelPercent}%` }} />
        </span>
      </div>

      <StudentChallenges challenges={data.challenges ?? []} />

      {data.teacherBonuses.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-foreground">{C.gamBonusesHeading}</h3>
          <ul className="divide-y divide-border">
            {data.teacherBonuses.map((b) => (
              <li key={b.createdAt} className="flex items-start justify-between gap-3 py-2">
                <div className="min-w-0">
                  <p className="text-base text-foreground">„{b.reason}”</p>
                  <p className="text-sm text-muted-foreground">{dates.long.format(new Date(b.createdAt))}</p>
                </div>
                <span className="shrink-0 text-base font-semibold text-foreground">{C.gamBonusAmount(b.amount)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <WeekHistory weeks={data.weeks} />
      <BadgeWall badges={data.badges} />
      <ClassRankingSection />
      <LeaderboardSection />
    </section>
  )
}

function WeekHistory({ weeks }: { weeks: WeekHistoryItem[] }) {
  const C = useMyProgressCopy()
  const dates = useDateFormats()
  const oldestFirst = [...weeks].reverse()
  return (
    <div className="space-y-2">
      <h3 className="text-base font-semibold text-foreground">{C.gamWeeksHeading}</h3>
      {oldestFirst.length === 0 ? (
        <p className="text-base text-muted-foreground">{C.gamWeeksEmpty}</p>
      ) : (
        <>
          <ol className="flex items-end gap-2">
            {oldestFirst.map((w) => {
              const state = w.goalMet === null ? 'open' : w.goalMet ? 'met' : 'missed'
              const date = dates.short.format(new Date(`${w.weekStart}T12:00:00`))
              const fill = Math.min(1, w.activeDays / Math.max(1, w.goalDays))
              return (
                <li key={w.weekStart} className="flex min-w-0 flex-1 flex-col items-center gap-1" aria-label={C.gamWeekLabel(date, w.activeDays, w.goalDays, state)}>
                  <span
                    aria-hidden="true"
                    className={`relative block h-16 w-full max-w-10 overflow-hidden rounded-md ${
                      state === 'open' ? 'border-2 border-dashed border-border' : 'bg-secondary'
                    }`}
                  >
                    <span
                      className={`absolute inset-x-0 bottom-0 ${state === 'met' ? 'bg-[var(--teal-accent)]' : 'bg-muted-foreground opacity-30'}`}
                      style={{ height: `${fill * 100}%` }}
                    />
                  </span>
                  <span aria-hidden="true" className="text-xs font-medium text-foreground">
                    {w.activeDays}/{w.goalDays}
                  </span>
                  <span aria-hidden="true" className="truncate text-xs text-muted-foreground">
                    {date}
                  </span>
                </li>
              )
            })}
          </ol>
          <p className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground" aria-hidden="true">
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-[var(--teal-accent)]" /> {C.gamWeekMetLegend}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm border-2 border-dashed border-border" /> {C.gamWeekOpenLegend}
            </span>
          </p>
        </>
      )}
    </div>
  )
}

/**
 * Every badge with its text in view, no hover or selection: when it was earned, how to earn
 * it, or — for a hidden one — that it's a surprise. Unlocked proverbs are at the top of the page.
 */
function BadgeWall({ badges }: { badges: BadgeWallItem[] }) {
  const C = useMyProgressCopy()
  const dates = useDateFormats()
  const { lang } = useLanguage()
  const earnedCount = badges.filter((b) => b.earned).length

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
        <h3 className="text-base font-semibold text-foreground">{C.gamBadgesHeading}</h3>
        <p className="text-sm text-muted-foreground">{C.gamBadgesCount(earnedCount, badges.length)}</p>
      </div>
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] gap-2">
        {badges.map((b) => {
          const secret = b.nameHu === null
          const note = secret
            ? C.gamBadgeHiddenText
            : b.earned
              ? b.earnedAt && C.gamBadgeEarnedOn(dates.short.format(new Date(b.earnedAt)))
              : lang === 'hu'
                ? b.criteriaHu
                : b.criteriaEn
          return (
            <li
              key={b.key}
              className={`flex flex-col items-center gap-2 rounded-lg px-2 py-3 text-center ${b.earned ? 'bg-secondary' : ''}`}
            >
              <BadgeMedal icon={b.icon} earned={b.earned} />
              <span className={`text-sm leading-tight ${b.earned ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                {badgeName(b, lang) ?? C.gamBadgeHiddenName}
              </span>
              {note && <span className="text-xs leading-snug text-muted-foreground">{note}</span>}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
