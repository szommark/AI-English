import { useEffect, useState } from 'react'
import { Volume2 } from 'lucide-react'
import { MY_PROGRESS_COPY as C } from '../../data/myProgressCopy'
import { getFeature } from '../../data/features'
import { fetchGamificationOverview, markNoticesSeen } from '../../lib/gamificationApi'
import { publishMeNotices } from '../../lib/gamification/xpEvents'
import StudentChallenges from './StudentChallenges'
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis'
import { getAccentPreference } from '../../lib/voiceSelection'
import type { BadgeWallItem, GamificationOverview, WeekHistoryItem } from '../../lib/gamification/types'
import BadgeMedal from './BadgeMedal'

const DATE = new Intl.DateTimeFormat('hu-HU', { month: 'short', day: 'numeric' })
const LONG_DATE = new Intl.DateTimeFormat('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' })

function sectionName(section: string): string {
  if (section === 'teacher') return 'Tanári jutalom' // Teacher bonus (Phase 4)
  if (section === 'challenge') return 'Kihívások' // Challenge rewards (Phase 4b)
  return getFeature(section)?.titleHu ?? section
}

/**
 * The gamification panel on "Az én fejlődésem" (design §10): level and XP by area, the
 * weekly goal over recent weeks, and the badge wall. Hungarian-only, like the page. Loads on
 * its own, so a failure here never hides the rest of the page.
 */
export default function GamificationPanel() {
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

  if (error) {
    return (
      <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <p className="text-base text-muted-foreground">{C.gamLoadError}</p>
      </section>
    )
  }
  if (!data) return null

  const { me } = data
  const levelPercent = me.xpForNextLevel > 0 ? Math.min(100, (me.xpIntoLevel / me.xpForNextLevel) * 100) : 0
  const maxSectionXp = Math.max(1, ...data.xpBySection.map((s) => s.xp))

  return (
    <section className="rounded-xl border border-border bg-card p-5 space-y-6 shadow-sm">
      <h2 className="text-lg font-semibold text-foreground">{C.gamHeading}</h2>

      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <p className="text-3xl font-semibold tracking-tight text-foreground">{C.gamLevel(me.level)}</p>
          <p className="text-base text-muted-foreground">{C.gamTotalXp(me.totalXp)}</p>
        </div>
        <span aria-hidden="true" className="mt-2 block h-2.5 overflow-hidden rounded-full bg-secondary">
          <span className="block h-full rounded-full bg-[var(--teal-accent)]" style={{ width: `${levelPercent}%` }} />
        </span>
        <p className="mt-1 text-sm text-muted-foreground">{C.gamToNext(me.xpIntoLevel, me.xpForNextLevel)}</p>
      </div>

      <StudentChallenges challenges={data.challenges ?? []} />

      <div className="space-y-2">
        <h3 className="text-base font-semibold text-foreground">{C.gamBySectionHeading}</h3>
        {data.xpBySection.length === 0 ? (
          <p className="text-base text-muted-foreground">{C.gamBySectionEmpty}</p>
        ) : (
          <ul className="space-y-2">
            {data.xpBySection.map((s) => (
              <li key={s.section} className="flex items-center gap-3 text-sm">
                <span className="w-36 shrink-0 text-foreground sm:w-44">{sectionName(s.section)}</span>
                <span aria-hidden="true" className="h-2.5 flex-1 overflow-hidden rounded-full bg-secondary">
                  <span className="block h-full rounded-full bg-[var(--teal-accent)]" style={{ width: `${(s.xp / maxSectionXp) * 100}%` }} />
                </span>
                <span className="w-16 shrink-0 text-right font-medium text-foreground">{s.xp} XP</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {data.teacherBonuses.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-foreground">{C.gamBonusesHeading}</h3>
          <ul className="divide-y divide-border">
            {data.teacherBonuses.map((b) => (
              <li key={b.createdAt} className="flex items-start justify-between gap-3 py-2">
                <div className="min-w-0">
                  <p className="text-base text-foreground">„{b.reason}”</p>
                  <p className="text-sm text-muted-foreground">{LONG_DATE.format(new Date(b.createdAt))}</p>
                </div>
                <span className="shrink-0 text-base font-semibold text-foreground">{C.gamBonusAmount(b.amount)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <WeekHistory weeks={data.weeks} />
      <BadgeWall badges={data.badges} />
    </section>
  )
}

function WeekHistory({ weeks }: { weeks: WeekHistoryItem[] }) {
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
              const date = DATE.format(new Date(`${w.weekStart}T12:00:00`))
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

function BadgeWall({ badges }: { badges: BadgeWallItem[] }) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const selected = badges.find((b) => b.key === selectedKey) ?? null
  const earnedCount = badges.filter((b) => b.earned).length

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
        <h3 className="text-base font-semibold text-foreground">{C.gamBadgesHeading}</h3>
        <p className="text-sm text-muted-foreground">{C.gamBadgesCount(earnedCount, badges.length)}</p>
      </div>
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(6.5rem,1fr))] gap-2">
        {badges.map((b) => {
          const isSelected = b.key === selectedKey
          return (
            <li key={b.key}>
              <button
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedKey(isSelected ? null : b.key)}
                onMouseEnter={() => setSelectedKey(b.key)}
                onFocus={() => setSelectedKey(b.key)}
                className={`flex h-full w-full flex-col items-center gap-2 rounded-lg border px-2 py-3 text-center hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  isSelected ? 'border-[var(--teal-accent)] bg-secondary' : 'border-transparent'
                }`}
              >
                <BadgeMedal icon={b.icon} earned={b.earned} />
                <span className={`text-xs leading-tight ${b.earned ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                  {b.nameHu ?? C.gamBadgeHiddenName}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
      {selected ? <BadgeDetail badge={selected} /> : <p className="text-sm text-muted-foreground">{C.gamBadgesHint}</p>}
    </div>
  )
}

/** The wisdom card: the badge, how to earn it or when it was earned, and — once earned — its proverb. */
function BadgeDetail({ badge }: { badge: BadgeWallItem }) {
  const synth = useSpeechSynthesis('female', getAccentPreference())
  const secret = badge.nameHu === null

  return (
    <div aria-live="polite" className="flex items-start gap-4 rounded-lg bg-secondary p-4">
      <BadgeMedal icon={badge.icon} earned={badge.earned} size="lg" />
      <div className="min-w-0 space-y-1">
        <p className="text-base font-semibold text-foreground">{badge.nameHu ?? C.gamBadgeHiddenName}</p>
        {secret ? (
          <p className="text-sm text-muted-foreground">{C.gamBadgeHiddenText}</p>
        ) : badge.earned ? (
          <>
            {badge.earnedAt && (
              <p className="text-sm text-muted-foreground">{C.gamBadgeEarnedOn(LONG_DATE.format(new Date(badge.earnedAt)))}</p>
            )}
            {badge.wisdom && (
              <div className="pt-2">
                <div className="flex items-start gap-2">
                  <p className="text-base italic text-foreground" lang={badge.wisdom.language}>
                    {badge.wisdom.text}
                  </p>
                  {synth.supported && badge.wisdom.language === 'en' && (
                    <button
                      type="button"
                      onClick={() => synth.speak(badge.wisdom!.text)}
                      aria-label={C.gamListen}
                      className="shrink-0 rounded-full p-1 text-primary hover:bg-card"
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <p className="text-base text-muted-foreground" lang="hu">
                  {badge.wisdom.hungarian}
                </p>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-foreground">
            <span className="text-muted-foreground">{C.gamBadgeHowTo}</span> {badge.criteriaHu}
          </p>
        )}
      </div>
    </div>
  )
}
