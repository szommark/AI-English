import { useEffect, useState } from 'react'
import { useAuth } from '../../lib/AuthContext'
import { useLanguage } from '../../lib/i18n'
import { fetchGamificationMe } from '../../lib/gamificationApi'
import { progressInLevel, type LevelProgress } from '../../lib/gamification/levels'
import { subscribeXpResults } from '../../lib/gamification/xpEvents'

/**
 * "Szint N" with a thin bar toward the next level, for the header. Loads once per signed-in
 * user and then follows every award result, so it updates without a refetch. Renders nothing
 * while signed out or if the level can't be loaded.
 */
export default function LevelChip() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [progress, setProgress] = useState<LevelProgress | null>(null)
  const userId = user?.id ?? null

  useEffect(() => {
    setProgress(null)
    if (!userId) return
    let cancelled = false
    fetchGamificationMe().then((me) => {
      if (!cancelled && me) setProgress(progressInLevel(me.totalXp))
    })
    const unsubscribe = subscribeXpResults((result) => setProgress(progressInLevel(result.totalXp)))
    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [userId])

  if (!userId || !progress) return null

  const label = t('xpToNextLevel', { into: progress.xpIntoLevel, next: progress.xpForNextLevel })
  const percent = progress.xpForNextLevel > 0 ? Math.min(100, (progress.xpIntoLevel / progress.xpForNextLevel) * 100) : 0

  return (
    // Focusable so the tooltip also opens on tap (touch screens have no hover).
    <span tabIndex={0} title={label} aria-label={`${t('xpLevel', { n: progress.level })} — ${label}`} className="group relative inline-flex flex-col gap-1 rounded-full border border-border bg-card px-3 py-1 outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <span aria-hidden="true" className="text-xs font-semibold leading-none text-foreground">
        {t('xpLevel', { n: progress.level })}
      </span>
      <span aria-hidden="true" className="block h-1 w-14 overflow-hidden rounded-full bg-muted">
        <span className="block h-full rounded-full bg-[var(--teal-accent)]" style={{ width: `${percent}%` }} />
      </span>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground shadow-sm group-hover:block group-focus:block"
      >
        {label}
      </span>
    </span>
  )
}
