import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import Wordmark from '../components/Wordmark'
import { missionCopy, WORDMARK_TOKEN } from '../data/missionCopy'
import { useLanguage } from '../lib/i18n'

/** Splits a paragraph on the brand name so it renders as the wordmark. */
function withWordmark(text: string) {
  return text.split(WORDMARK_TOKEN).map((part, i) => (
    <Fragment key={i}>
      {i > 0 && <Wordmark />}
      {part}
    </Fragment>
  ))
}

export default function MissionPage() {
  const { lang, t } = useLanguage()
  const copy = missionCopy[lang]

  return (
    <article className="max-w-2xl mx-auto py-6 sm:py-10">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-gold)]">{t('mission')}</p>
      <h1 className="mt-2 font-brand text-4xl sm:text-5xl font-semibold text-[var(--brand-navy)]">
        {copy.greeting ?? <Wordmark />}
      </h1>
      <div className="mt-5 h-0.5 w-24 bg-[var(--brand-gold)]" aria-hidden="true" />

      <div className="mt-8 space-y-5 text-[17px] leading-relaxed text-foreground">
        {copy.paragraphs.map((p, i) => (
          <p key={i}>{withWordmark(p)}</p>
        ))}
      </div>

      <Link
        to="/"
        className="mt-10 inline-flex items-center rounded-lg bg-[var(--brand-navy)] px-6 py-3 font-brand text-xl font-semibold text-white shadow-sm hover:opacity-90"
      >
        {copy.closing}
      </Link>
    </article>
  )
}
