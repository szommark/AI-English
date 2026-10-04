import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { useLanguage } from '../../lib/i18n'
import { subscribeNotices, subscribeXpResults, type LearnerNotices } from '../../lib/gamification/xpEvents'
import type { AwardResult, CompletedChallenge, EarnedBadge } from '../../lib/gamification/types'
import LevelUpDialog from './LevelUpDialog'
import BadgeMedal from './BadgeMedal'

const TOAST_MS = 5000
/** Longer when there's more to read: a badge's proverb, a teacher's reason, a challenge. */
const LONG_TOAST_MS = 12000

const LOCALES = { hu: 'hu-HU', en: 'en-GB', de: 'de-DE' } as const

/**
 * End-of-activity feedback, mounted once in AppLayout:
 * - an XP toast for each award (base + bonus, or the plain "cap reached" note, plus a line
 *   when the activity met the weekly goal, challenges it completed and badges it earned —
 *   the badge's proverb is shown here once, otherwise only on the badge wall). A 0 XP result
 *   from a repeat — not a cap — shows nothing unless it brought one of those extras;
 * - a notices toast for teacher bonuses, new challenges and challenges completed while the
 *   learner was away (from the chip's state load);
 * - the level-up dialog.
 */
export default function XpNotifications() {
  const { t } = useLanguage()
  const [toast, setToast] = useState<{ id: number; result: AwardResult } | null>(null)
  const [noticeToast, setNoticeToast] = useState<{ id: number; notices: LearnerNotices } | null>(null)
  const [levelUp, setLevelUp] = useState<number | null>(null)

  useEffect(() => subscribeNotices((notices) => setNoticeToast({ id: Date.now(), notices })), [])

  useEffect(
    () =>
      subscribeXpResults((result) => {
        const full = { ...result, newBadges: result.newBadges ?? [], completedChallenges: result.completedChallenges ?? [] }
        if (full.capped || full.totalAwarded > 0 || full.weeklyGoalMet || full.newBadges.length > 0 || full.completedChallenges.length > 0) {
          setToast({ id: Date.now(), result: full })
        }
        if (full.leveledUp) setLevelUp(full.level)
      }),
    [],
  )

  useEffect(() => {
    if (!toast) return
    const long = toast.result.newBadges.length > 0 || toast.result.completedChallenges.length > 0
    const timer = setTimeout(() => setToast(null), long ? LONG_TOAST_MS : TOAST_MS)
    return () => clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    if (!noticeToast) return
    const timer = setTimeout(() => setNoticeToast(null), LONG_TOAST_MS)
    return () => clearTimeout(timer)
  }, [noticeToast])

  const closeLevelUp = useCallback(() => setLevelUp(null), [])

  return (
    <>
      <div aria-live="polite" role="status" className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:items-end">
        {noticeToast && (
          <ToastCard key={noticeToast.id} onClose={() => setNoticeToast(null)}>
            <Notices notices={noticeToast.notices} />
          </ToastCard>
        )}
        {toast && (
          <ToastCard key={toast.id} onClose={() => setToast(null)}>
            <div>
              {toast.result.weeklyGoalMet && <p className="text-base font-semibold text-foreground">{t('weeklyGoalMetToast')}</p>}
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
            <ChallengesDone challenges={toast.result.completedChallenges} />
            <Badges badges={toast.result.newBadges} />
          </ToastCard>
        )}
      </div>

      {levelUp !== null && <LevelUpDialog level={levelUp} onClose={closeLevelUp} />}
    </>
  )
}

function ToastCard({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  const { t } = useLanguage()
  return (
    <div className="pointer-events-auto flex max-w-sm items-start gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-lg">
      <div className="min-w-0 space-y-3">{children}</div>
      <button onClick={onClose} aria-label={t('dismiss')} className="shrink-0 text-muted-foreground hover:text-foreground">
        ✕
      </button>
    </div>
  )
}

function Notices({ notices }: { notices: LearnerNotices }) {
  const { lang, t } = useLanguage()
  const quote = (s: string) => (lang === 'en' ? `“${s}”` : `„${s}”`)
  const date = new Intl.DateTimeFormat(LOCALES[lang], { month: 'long', day: 'numeric' })
  return (
    <>
      {notices.teacherBonuses.map((b) => (
        <div key={b.createdAt}>
          <p className="text-base font-semibold text-foreground">{t('teacherBonusToast', { n: b.amount })}</p>
          {b.reason && <p className="text-sm text-muted-foreground">{quote(b.reason)}</p>}
        </div>
      ))}
      {notices.newChallenges.map((c) => (
        <div key={c.id}>
          <p className="text-xs font-medium text-muted-foreground">{t('challengeNewToast')}</p>
          <p className="text-base font-semibold text-foreground">{c.title}</p>
          <p className="text-sm text-muted-foreground">{t('challengeUntil', { date: date.format(new Date(`${c.endsOn}T12:00:00`)) })}</p>
        </div>
      ))}
      <ChallengesDone challenges={notices.completedChallenges} />
      <Badges badges={notices.newBadges} />
    </>
  )
}

function ChallengesDone({ challenges }: { challenges: CompletedChallenge[] }) {
  const { t } = useLanguage()
  return (
    <>
      {challenges.map((c) => (
        <div key={c.id} className="border-t border-border pt-3 first:border-t-0 first:pt-0">
          <p className="text-xs font-medium text-muted-foreground">{t('challengeDoneToast')}</p>
          <p className="text-base font-semibold text-foreground">{c.title}</p>
          {c.rewardXp > 0 && <p className="text-sm text-foreground">{t('xpGained', { n: c.rewardXp })}</p>}
        </div>
      ))}
    </>
  )
}

function Badges({ badges }: { badges: EarnedBadge[] }) {
  const { lang, t } = useLanguage()
  return (
    <>
      {badges.map((badge) => (
        <div key={badge.key} className="flex items-start gap-3 border-t border-border pt-3 first:border-t-0 first:pt-0">
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
    </>
  )
}
