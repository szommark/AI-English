import { Volume2 } from 'lucide-react'
import { PROGRESS_LOCALE, useMyProgressCopy } from '../../data/myProgressCopy'
import { useLanguage } from '../../lib/i18n'
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis'
import { getAccentPreference } from '../../lib/voiceSelection'
import type { BadgeWallItem } from '../../lib/gamification/types'
import BadgeMedal from './BadgeMedal'
import { badgeName } from './GamificationSummary'

/**
 * The proverbs the learner has unlocked, newest first: one per earned badge, with the badge
 * it came from. First on "Az én fejlődésem" and on the teacher's student page. With nothing
 * unlocked yet it shows `emptyText`, or nothing at all when that's absent.
 */
export default function WisdomCollection({ badges, emptyText }: { badges: BadgeWallItem[]; emptyText?: string }) {
  const C = useMyProgressCopy()
  const { lang } = useLanguage()
  const synth = useSpeechSynthesis('female', getAccentPreference())
  const date = new Intl.DateTimeFormat(PROGRESS_LOCALE[lang], { year: 'numeric', month: 'short', day: 'numeric' })

  const unlocked = badges
    .filter((b) => b.earned && b.wisdom)
    .sort((a, b) => (b.earnedAt ?? '').localeCompare(a.earnedAt ?? ''))
  if (unlocked.length === 0 && !emptyText) return null

  return (
    <section className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-sm">
      <h2 className="text-lg font-semibold text-foreground">{C.gamWisdomHeading(unlocked.length)}</h2>
      {unlocked.length === 0 ? (
        <p className="text-base text-muted-foreground">{emptyText}</p>
      ) : (
        <ul className="divide-y divide-border">
          {unlocked.map((b) => {
            const wisdom = b.wisdom!
            return (
              <li key={b.key} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <BadgeMedal icon={b.icon} earned size="sm" />
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-start gap-2">
                    <p className="text-base italic text-foreground" lang={wisdom.language}>
                      {wisdom.text}
                    </p>
                    {synth.supported && wisdom.language === 'en' && (
                      <button
                        type="button"
                        onClick={() => synth.speak(wisdom.text)}
                        aria-label={C.gamListen}
                        className="shrink-0 rounded-full p-1 text-primary hover:bg-secondary"
                      >
                        <Volume2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  {lang === 'hu' && (
                    <p className="text-base text-muted-foreground" lang="hu">
                      {wisdom.hungarian}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {badgeName(b, lang)}
                    {b.earnedAt && ` · ${date.format(new Date(b.earnedAt))}`}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
