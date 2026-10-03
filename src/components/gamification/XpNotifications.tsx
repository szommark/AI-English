import { useCallback, useEffect, useState } from 'react'
import { useLanguage } from '../../lib/i18n'
import { subscribeXpResults } from '../../lib/gamification/xpEvents'
import type { AwardResult } from '../../lib/gamification/types'
import LevelUpDialog from './LevelUpDialog'
import BadgeMedal from './BadgeMedal'

const TOAST_MS = 5000
/** Longer when a badge is earned, so there's time to read its proverb. */
const BADGE_TOAST_MS = 12000

/**
 * End-of-activity XP feedback, mounted once in AppLayout: a short toast for each award
 * (base + bonus, or the plain "cap reached" note, plus a line when this activity met the
 * weekly goal, plus any badge it earned with its proverb — the one moment the proverb is
 * shown outside the badge wall) and the level-up dialog. A 0 XP result from a repeat — not a
 * cap — shows nothing, unless it met the weekly goal or earned a badge.
 */
export default function XpNotifications() {
  const { lang, t } = useLanguage()
  const [toast, setToast] = useState<{ id: number; result: AwardResult } | null>(null)
  const [levelUp, setLevelUp] = useState<number | null>(null)

  useEffect(
    () =>
      subscribeXpResults((result) => {
        const badges = result.newBadges ?? []
        if (result.capped || result.totalAwarded > 0 || result.weeklyGoalMet || badges.length > 0) {
          setToast({ id: Date.now(), result: { ...result, newBadges: badges } })
        }
        if (result.leveledUp) setLevelUp(result.level)
      }),
    [],
  )

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), toast.result.newBadges.length > 0 ? BADGE_TOAST_MS : TOAST_MS)
    return () => clearTimeout(timer)
  }, [toast])

  const closeLevelUp = useCallback(() => setLevelUp(null), [])

  return (
    <>
      <div aria-live="polite" role="status" className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex justify-center sm:inset-x-auto sm:right-6 sm:justify-end">
        {toast && (
          <div key={toast.id} className="pointer-events-auto flex max-w-sm items-start gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-lg">
            <div className="min-w-0 space-y-3">
              <div>
                {toast.result.weeklyGoalMet && (
                  <p className="text-base font-semibold text-foreground">{t('weeklyGoalMetToast')}</p>
                )}
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
              {toast.result.newBadges.map((badge) => (
                <div key={badge.key} className="flex items-start gap-3 border-t border-border pt-3">
                  <BadgeMedal icon={badge.icon} earned />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground">{t('badgeEarned')}</p>
                    <p className="text-base font-semibold text-foreground">{lang === 'hu' ? badge.nameHu : badge.nameEn}</p>
                    {badge.wisdom && (
                      <>
                        <p className="mt-1 text-sm italic text-foreground" lang={badge.wisdom.language}>
                          {badge.wisdom.text}
                        </p>
                        <p className="text-sm text-muted-foreground" lang="hu">
                          {badge.wisdom.hungarian}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              ))}
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
