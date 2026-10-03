import { useCallback, useEffect, useState } from 'react'
import { useLanguage } from '../../lib/i18n'
import { subscribeXpResults } from '../../lib/gamification/xpEvents'
import type { AwardResult } from '../../lib/gamification/types'
import LevelUpDialog from './LevelUpDialog'

const TOAST_MS = 5000

/**
 * End-of-activity XP feedback, mounted once in AppLayout: a short toast for each award
 * (base + bonus, or the plain "cap reached" note) and the level-up dialog. A 0 XP result
 * from a repeat — not a cap — shows nothing.
 */
export default function XpNotifications() {
  const { t } = useLanguage()
  const [toast, setToast] = useState<{ id: number; result: AwardResult } | null>(null)
  const [levelUp, setLevelUp] = useState<number | null>(null)

  useEffect(
    () =>
      subscribeXpResults((result) => {
        if (result.capped || result.totalAwarded > 0) setToast({ id: Date.now(), result })
        if (result.leveledUp) setLevelUp(result.level)
      }),
    [],
  )

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), TOAST_MS)
    return () => clearTimeout(timer)
  }, [toast])

  const closeLevelUp = useCallback(() => setLevelUp(null), [])

  return (
    <>
      <div aria-live="polite" role="status" className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex justify-center sm:inset-x-auto sm:right-6 sm:justify-end">
        {toast && (
          <div key={toast.id} className="pointer-events-auto flex max-w-sm items-start gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-lg">
            <div className="min-w-0">
              {toast.result.totalAwarded > 0 && (
                <p className="text-base font-semibold text-foreground">{t('xpGained', { n: toast.result.totalAwarded })}</p>
              )}
              {toast.result.totalAwarded > 0 && toast.result.bonusXp > 0 && (
                <p className="text-xs text-muted-foreground">
                  {t('xpBonusBreakdown', { base: toast.result.baseXp, bonus: toast.result.bonusXp })}
                </p>
              )}
              {toast.result.capped && <p className="text-sm text-muted-foreground">{t('xpCapped')}</p>}
            </div>
            <button
              onClick={() => setToast(null)}
              aria-label={t('dismiss')}
              className="shrink-0 text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {levelUp !== null && <LevelUpDialog level={levelUp} onClose={closeLevelUp} />}
    </>
  )
}
