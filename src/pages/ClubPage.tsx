import { Link } from 'react-router-dom'
import { CalendarClock, Coffee, MapPin, Sparkles, Users, Utensils, Wallet, type LucideIcon } from 'lucide-react'
import { useAuthPrompt } from '../components/AppLayout'
import { CLUB, CLUB_LINK_ROUTES, clubCopy, type ClubCopy, type ClubLinkId } from '../data/clubCopy'
import { CONTACT_EMAIL } from '../data/landingCopy'
import { useAuth } from '../lib/AuthContext'
import { useClubSignups } from '../lib/club'
import { useLanguage } from '../lib/i18n'

function clock(minutes: number): string {
  return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}`
}

function InfoItem({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand-gold)]" aria-hidden="true" />
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-white/60">{label}</p>
        <p className="mt-0.5 text-[15px] font-semibold text-white">{value}</p>
      </div>
    </div>
  )
}

/** A platform feature the block continues on: a link when it has a page, else a plain label. */
function FeatureChip({ id, copy }: { id: ClubLinkId; copy: ClubCopy }) {
  const { user } = useAuth()
  const { promptSignIn } = useAuthPrompt()
  const route = CLUB_LINK_ROUTES[id]
  const label = copy.linkLabels[id]
  const chip =
    'inline-flex items-center rounded-full border border-[rgba(10,31,68,0.3)] px-3 py-1 text-xs font-semibold text-[var(--brand-navy)]'

  if (!route) return <span className={chip}>{label}</span>
  if (!user) {
    return (
      <button type="button" onClick={() => promptSignIn(route)} className={`${chip} hover:bg-[var(--brand-navy)] hover:text-white`}>
        {label}
      </button>
    )
  }
  return (
    <Link to={route} className={`${chip} hover:bg-[var(--brand-navy)] hover:text-white`}>
      {label}
    </Link>
  )
}

export default function ClubPage() {
  const { lang } = useLanguage()
  const copy = clubCopy[lang]
  const { participants, signedUp, signUp } = useClubSignups()

  const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(copy.mailSubject)}&body=${encodeURIComponent(copy.mailBody)}`
  let start = CLUB.startMinutes

  return (
    <article className="mx-auto max-w-4xl space-y-8 py-4 sm:py-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-gold)]">{copy.kicker}</p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="font-brand text-4xl font-semibold text-[var(--brand-navy)] sm:text-5xl">{copy.title}</h1>
          <span className="rounded-full bg-[var(--brand-gold)] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[var(--brand-navy)]">
            {copy.firstBadge}
          </span>
        </div>
        <div className="mt-4 h-0.5 w-24 bg-[var(--brand-gold)]" aria-hidden="true" />
        <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-foreground">{copy.intro}</p>
      </header>

      <section className="rounded-2xl bg-[var(--brand-navy)] p-6 text-white shadow-md sm:p-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem icon={Sparkles} label={copy.themeMonthLabel} value={copy.themeMonth} />
          <InfoItem icon={Utensils} label={copy.nextTopicLabel} value={copy.nextTopic} />
          <InfoItem icon={CalendarClock} label={copy.whenLabel} value={copy.when} />
          <InfoItem icon={MapPin} label={copy.whereLabel} value={copy.where} />
          <InfoItem icon={Wallet} label={copy.priceLabel} value={copy.price} />
          <InfoItem icon={Users} label={copy.participantsLabel} value={copy.participants.replace('{n}', String(participants))} />
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-white/15 pt-6">
          {CONTACT_EMAIL ? (
            <a
              href={mailto}
              onClick={signUp}
              className="rounded-lg bg-[var(--brand-gold)] px-6 py-3 font-brand text-xl font-semibold text-[var(--brand-navy)] shadow-sm hover:opacity-90"
            >
              {copy.signUp}
            </a>
          ) : (
            <span className="rounded-lg border border-white/30 px-6 py-3 font-brand text-xl text-white/70">{copy.signUpUnavailable}</span>
          )}
          <p className="max-w-md text-sm text-white/75">
            {signedUp ? <span className="font-semibold text-[var(--brand-gold)]">{copy.signedUp} </span> : null}
            {CONTACT_EMAIL ? copy.signUpNote : null}
          </p>
        </div>
      </section>

      <section>
        <div className="flex items-center gap-3">
          <Coffee className="h-6 w-6 text-[var(--brand-gold)]" aria-hidden="true" />
          <h2 className="font-brand text-3xl font-semibold text-[var(--brand-navy)]">{copy.scheduleTitle}</h2>
        </div>
        <p className="mt-2 text-muted-foreground">{copy.scheduleIntro}</p>

        <ol className="mt-6 space-y-0">
          {copy.blocks.map((block, i) => {
            const from = start
            start += block.minutes
            const last = i === copy.blocks.length - 1
            return (
              <li key={i} className="relative flex gap-4">
                <div className="flex w-14 shrink-0 flex-col items-end pt-4 text-right sm:w-16">
                  <span className="font-brand text-lg font-semibold tabular-nums text-[var(--brand-navy)]">{clock(from)}</span>
                </div>
                <div className="relative flex flex-col items-center">
                  <span className="mt-5 h-3 w-3 shrink-0 rounded-full bg-[var(--brand-gold)] ring-4 ring-[rgba(201,162,39,0.25)]" aria-hidden="true" />
                  {!last && <span className="w-0.5 flex-1 bg-border" aria-hidden="true" />}
                </div>
                <div className="mb-4 min-w-0 flex-1 rounded-xl border border-border bg-card p-4 shadow-sm">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <h3 className="font-semibold text-[var(--brand-navy)]">{block.title}</h3>
                    <span className="text-sm font-semibold tabular-nums text-muted-foreground">
                      {block.minutes} {copy.minutes}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-foreground">{block.text}</p>
                  {block.links.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {block.links.map((id) => (
                        <FeatureChip key={id} id={id} copy={copy} />
                      ))}
                    </div>
                  )}
                </div>
              </li>
            )
          })}
          <li className="flex gap-4">
            <div className="w-14 shrink-0 text-right sm:w-16">
              <span className="font-brand text-lg font-semibold tabular-nums text-[var(--brand-navy)]">{clock(start)}</span>
            </div>
            <div className="w-3" aria-hidden="true" />
          </li>
        </ol>
      </section>
    </article>
  )
}
