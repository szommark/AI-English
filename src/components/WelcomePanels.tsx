import { Briefcase, GraduationCap, Sparkles, type LucideIcon } from 'lucide-react'
import { useAuthPrompt } from './AppLayout'
import { CONTACT_EMAIL, landingCopy, type LandingPanelCopy } from '../data/landingCopy'
import { useLanguage } from '../lib/i18n'

function BulletList({ items, onNavy = false }: { items: string[]; onNavy?: boolean }) {
  return (
    <ul className="mt-2 space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5">
          <span
            className={`mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full ${onNavy ? 'bg-[var(--brand-gold)]' : 'bg-[var(--brand-navy)]'}`}
            aria-hidden="true"
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function SidePanel({ copy, icon: Icon, className }: { copy: LandingPanelCopy; icon: LucideIcon; className: string }) {
  return (
    <section className={`flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm ${className}`}>
      <Icon className="h-7 w-7 text-[var(--brand-gold)]" aria-hidden="true" />
      <h2 className="mt-3 font-brand text-2xl font-semibold leading-tight text-[var(--brand-navy)]">{copy.title}</h2>
      <div className="mt-3 h-0.5 w-12 bg-[var(--brand-gold)]" aria-hidden="true" />
      <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-foreground">
        <div>
          <p className="font-semibold text-[var(--brand-navy)]">{copy.lead}</p>
          {copy.list && <BulletList items={copy.list} />}
        </div>
        {copy.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      <a
        href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(copy.title)}`}
        className="mt-6 self-start rounded-lg border-2 border-[var(--brand-navy)] px-4 py-2 text-sm font-semibold text-[var(--brand-navy)] hover:bg-[var(--brand-navy)] hover:text-white md:mt-auto"
      >
        {copy.cta}
      </a>
    </section>
  )
}

/**
 * Signed-out home page: companies (left), language learners with the platform brief (middle,
 * widest) and language schools / teachers (right). Below xl the learners span the top with the
 * two side panels beneath them; on phones everything stacks, learners first.
 */
export default function WelcomePanels() {
  const { lang, t } = useLanguage()
  const { promptSignIn, promptSignUp } = useAuthPrompt()
  const copy = landingCopy[lang]
  const learners = copy.learners

  return (
    <div className="grid gap-5 py-2 md:grid-cols-2 xl:grid-cols-[1fr_1.9fr_1fr]">
      <SidePanel copy={copy.business} icon={Briefcase} className="order-2 xl:order-1" />

      <section className="order-1 flex flex-col rounded-2xl bg-[var(--brand-navy)] p-6 text-white shadow-md sm:p-8 md:col-span-2 xl:order-2 xl:col-span-1">
        <Sparkles className="h-7 w-7 text-[var(--brand-gold)]" aria-hidden="true" />
        <h2 className="mt-3 font-brand text-3xl font-semibold leading-tight sm:text-4xl">{learners.title}</h2>
        <div className="mt-3 h-0.5 w-16 bg-[var(--brand-gold)]" aria-hidden="true" />
        <p className="mt-4 font-brand text-2xl leading-snug text-white">{learners.hero}</p>

        <div className="mt-5 grid gap-5 text-[15px] leading-relaxed text-white/90 md:grid-cols-2 xl:grid-cols-1">
          <div>
            <p className="font-semibold text-[var(--brand-gold)]">{learners.forYouIntro}</p>
            <BulletList items={learners.forYou} onNavy />
          </div>
          <div>
            <p className="font-semibold text-[var(--brand-gold)]">{learners.youGetIntro}</p>
            <BulletList items={learners.youGet} onNavy />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
          <button
            type="button"
            onClick={promptSignUp}
            className="rounded-lg bg-[var(--brand-gold)] px-6 py-3 font-brand text-xl font-semibold text-[var(--brand-navy)] shadow-sm hover:opacity-90"
          >
            {learners.cta}
          </button>
          <span className="text-sm text-white/75">
            {copy.haveAccount}{' '}
            <button type="button" onClick={() => promptSignIn()} className="font-semibold text-white underline hover:text-[var(--brand-gold)]">
              {t('signIn')}
            </button>
          </span>
        </div>

        <p className="mt-6 border-l-2 border-[var(--brand-gold)] pl-4 font-brand text-xl italic leading-snug text-white">
          {learners.closing}
        </p>

        <div className="mt-8 space-y-5 border-t border-white/15 pt-6">
          {copy.platform.map((s) => (
            <div key={s.title}>
              <h3 className="font-brand text-2xl font-semibold text-[var(--brand-gold)]">{s.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-white/85">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <SidePanel copy={copy.teachers} icon={GraduationCap} className="order-3" />
    </div>
  )
}
