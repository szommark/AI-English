import { Fragment, type ReactNode } from 'react'
import { Briefcase, GraduationCap, Sparkles, type LucideIcon } from 'lucide-react'
import Wordmark from './Wordmark'
import { useAuthPrompt } from './AppLayout'
import { WORDMARK_TOKEN } from '../data/missionCopy'
import { CONTACT_EMAIL, landingCopy, type LandingPanelCopy } from '../data/landingCopy'
import { useLanguage } from '../lib/i18n'

/** Splits a text on the brand name so it renders as the wordmark (white capitals on the navy panel). */
function withWordmark(text: string, onNavy = false): ReactNode {
  return text.split(WORDMARK_TOKEN).map((part, i) => (
    <Fragment key={i}>
      {i > 0 && <Wordmark className={onNavy ? '!text-white' : ''} />}
      {part}
    </Fragment>
  ))
}

function SidePanel({ copy, icon: Icon, className }: { copy: LandingPanelCopy; icon: LucideIcon; className: string }) {
  return (
    <section className={`flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm ${className}`}>
      <Icon className="h-7 w-7 text-[var(--brand-gold)]" aria-hidden="true" />
      <h2 className="mt-3 font-brand text-2xl font-semibold leading-tight text-[var(--brand-navy)]">{copy.title}</h2>
      <div className="mt-3 h-0.5 w-12 bg-[var(--brand-gold)]" aria-hidden="true" />
      <p className="mt-4 text-[15px] leading-relaxed text-foreground">{withWordmark(copy.summary)}</p>
      <a
        href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(copy.title)}`}
        className="mt-6 self-start rounded-lg border-2 border-[var(--brand-navy)] px-4 py-2 text-sm font-semibold text-[var(--brand-navy)] hover:bg-[var(--brand-navy)] hover:text-white lg:mt-auto"
      >
        {copy.cta}
      </a>
    </section>
  )
}

/**
 * Signed-out home page: companies (left), language learners with the platform brief (middle,
 * widest) and teachers / language schools (right). On narrow screens learners come first.
 */
export default function WelcomePanels() {
  const { lang, t } = useLanguage()
  const { promptSignIn, promptSignUp } = useAuthPrompt()
  const copy = landingCopy[lang]

  return (
    <div className="grid gap-5 py-2 lg:grid-cols-[1fr_1.9fr_1fr]">
      <SidePanel copy={copy.business} icon={Briefcase} className="order-2 lg:order-1" />

      <section className="order-1 flex flex-col rounded-2xl bg-[var(--brand-navy)] p-6 text-white shadow-md sm:p-8 lg:order-2">
        <Sparkles className="h-7 w-7 text-[var(--brand-gold)]" aria-hidden="true" />
        <h2 className="mt-3 font-brand text-3xl font-semibold leading-tight sm:text-4xl">{copy.learners.title}</h2>
        <div className="mt-3 h-0.5 w-16 bg-[var(--brand-gold)]" aria-hidden="true" />
        <p className="mt-4 text-[17px] leading-relaxed text-white/90">{withWordmark(copy.learners.summary, true)}</p>
        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
          <button
            type="button"
            onClick={promptSignUp}
            className="rounded-lg bg-[var(--brand-gold)] px-6 py-3 font-brand text-xl font-semibold text-[var(--brand-navy)] shadow-sm hover:opacity-90"
          >
            {copy.learners.cta}
          </button>
          <span className="text-sm text-white/75">
            {copy.haveAccount}{' '}
            <button type="button" onClick={() => promptSignIn()} className="font-semibold text-white underline hover:text-[var(--brand-gold)]">
              {t('signIn')}
            </button>
          </span>
        </div>

        <div className="mt-8 border-t border-white/15 pt-6">
          <h3 className="font-brand text-2xl font-semibold text-[var(--brand-gold)]">{copy.platform.title}</h3>
          <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-white/85">
            {copy.platform.paragraphs.map((p, i) => (
              <p key={i}>{withWordmark(p, true)}</p>
            ))}
          </div>
        </div>
      </section>

      <SidePanel copy={copy.teachers} icon={GraduationCap} className="order-3" />
    </div>
  )
}
