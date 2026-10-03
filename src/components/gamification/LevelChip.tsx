import { useEffect, useRef, useState } from 'react'
import { Flame } from 'lucide-react'
import { useAuth } from '../../lib/AuthContext'
import { useLanguage } from '../../lib/i18n'
import { fetchGamificationMe, markTeacherBonusesSeen } from '../../lib/gamificationApi'
import { publishTeacherBonuses, subscribeXpResults } from '../../lib/gamification/xpEvents'
import type { GamificationMe } from '../../lib/gamification/types'
import WeekPanel from './WeekPanel'

/**
 * Header chip: "Szint N" with a thin bar toward the next level, a small ring for this
 * week's goal and a flame with the daily streak. Tapping it opens WeekPanel (details and the
 * weekly-goal picker). Loads once per signed-in user and reloads after every XP award.
 * Renders nothing while signed out or if the state can't be loaded.
 */
export default function LevelChip() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [me, setMe] = useState<GamificationMe | null>(null)
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const userId = user?.id ?? null

  useEffect(() => {
    setMe(null)
    setOpen(false)
    if (!userId) return
    let cancelled = false
    // Teacher bonuses not seen yet are toasted once, then acknowledged. The set guards
    // against a reload landing before the acknowledgement has been saved.
    const toasted = new Set<string>()
    const load = () =>
      fetchGamificationMe().then((next) => {
        if (cancelled || !next) return
        setMe(next)
        const fresh = (next.unseenTeacherBonuses ?? []).filter((b) => !toasted.has(b.createdAt))
        if (fresh.length > 0) {
          fresh.forEach((b) => toasted.add(b.createdAt))
          publishTeacherBonuses(fresh)
          void markTeacherBonusesSeen()
        }
      })
    load()
    const unsubscribe = subscribeXpResults(load)
    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [userId])

  // Close on a click outside or Escape.
  useEffect(() => {
    if (!open) return
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!userId || !me) return null

  const levelPercent = me.xpForNextLevel > 0 ? Math.min(100, (me.xpIntoLevel / me.xpForNextLevel) * 100) : 0
  const weekRatio = Math.min(1, me.week.activeDays / me.week.goalDays)

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={t('progressChipLabel', { n: me.level, active: me.week.activeDays, goal: me.week.goalDays })}
        title={t('xpToNextLevel', { into: me.xpIntoLevel, next: me.xpForNextLevel })}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2.5 rounded-full border border-border bg-card px-3 py-1 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span aria-hidden="true" className="flex flex-col gap-1">
          <span className="text-xs font-semibold leading-none text-foreground">{t('xpLevel', { n: me.level })}</span>
          <span className="block h-1 w-14 overflow-hidden rounded-full bg-muted">
            <span className="block h-full rounded-full bg-[var(--teal-accent)]" style={{ width: `${levelPercent}%` }} />
          </span>
        </span>
        <WeekRing ratio={weekRatio} />
        {me.dailyStreak > 0 && (
          <span aria-hidden="true" className="inline-flex items-center gap-0.5 text-xs font-semibold text-foreground">
            <Flame className="h-3.5 w-3.5 text-amber-500" />
            {me.dailyStreak}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={t('weekPanelTitle')}
          className="fixed inset-x-4 top-16 z-50 max-h-[calc(100vh-5rem)] overflow-y-auto rounded-xl border border-border bg-card p-5 shadow-lg sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80"
        >
          <WeekPanel me={me} onChange={setMe} />
        </div>
      )}
    </div>
  )
}

/** This week's goal as a small ring (full when the goal is met). */
function WeekRing({ ratio }: { ratio: number }) {
  const r = 7
  const c = 2 * Math.PI * r
  return (
    <svg aria-hidden="true" viewBox="0 0 18 18" className="h-[18px] w-[18px] -rotate-90">
      <circle cx="9" cy="9" r={r} fill="none" strokeWidth="2.5" className="stroke-muted" />
      {ratio > 0 && (
        <circle
          cx="9"
          cy="9"
          r={r}
          fill="none"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={`${c * ratio} ${c}`}
          style={{ stroke: 'var(--teal-accent)' }}
        />
      )}
    </svg>
  )
}
