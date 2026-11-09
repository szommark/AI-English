import { Link } from 'react-router-dom'
import { Coffee } from 'lucide-react'
import { clubCopy } from '../data/clubCopy'
import { useLanguage } from '../lib/i18n'

/** Above the signed-out home page's panels: the next club session, linking to /club. */
export default function ClubBanner() {
  const { lang } = useLanguage()
  const copy = clubCopy[lang]

  return (
    <section className="flex flex-col gap-4 rounded-2xl border-2 border-[var(--brand-gold)] bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div className="flex gap-4">
        <Coffee className="mt-1 h-8 w-8 shrink-0 text-[var(--brand-gold)]" aria-hidden="true" />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-gold)]">{copy.banner.kicker}</p>
            <span className="rounded-full bg-[var(--brand-gold)] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[var(--brand-navy)]">
              {copy.firstBadge}
            </span>
          </div>
          <h2 className="mt-1 font-brand text-2xl font-semibold leading-tight text-[var(--brand-navy)]">
            {copy.nextTopicLabel}: {copy.nextTopic}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {copy.themeMonthLabel}: {copy.themeMonth}
          </p>
          <p className="mt-1 text-[15px] text-foreground">
            {copy.when} · {copy.where} · {copy.price}
          </p>
        </div>
      </div>
      <Link
        to="/club"
        className="shrink-0 self-start rounded-lg bg-[var(--brand-navy)] px-5 py-3 font-semibold text-white shadow-sm hover:opacity-90 sm:self-center"
      >
        {copy.banner.cta}
      </Link>
    </section>
  )
}
