import { useEffect, type MouseEvent, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowUp, Briefcase, ChevronDown, GraduationCap, Sparkles, type LucideIcon } from 'lucide-react'
import { useAuthPrompt } from './AppLayout'
import ClubBanner from './ClubBanner'
import { DecoDivider, DecoFan } from './club/Deco'
import { CONTACT_EMAIL, landingCopy, type LandingPanelCopy } from '../data/landingCopy'
import { useLanguage } from '../lib/i18n'

/** Section anchors: a visitor can be sent straight to one, e.g. avln.hu/#companies. */
type SectionId = 'learners' | 'teachers' | 'companies'
const SECTION_IDS: SectionId[] = ['learners', 'teachers', 'companies']

function scrollToSection(id: string, instant = false) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  document.getElementById(id)?.scrollIntoView({ behavior: instant || reduce ? 'auto' : 'smooth', block: 'start' })
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="mt-2 space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5">
          <span className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rotate-45 bg-[var(--club-gold)]" aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

/** Cream paper in a gold double frame, as the club's programme cards. */
function PaperFrame({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`border border-[var(--club-gold)] bg-[var(--club-paper)] p-1 ${className}`}>
      <div className="h-full border border-[rgba(201,162,39,0.55)] p-5 sm:p-8">{children}</div>
    </div>
  )
}

function BackToTop() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  return (
    <div className="mt-6 flex justify-end">
      <button
        type="button"
        onClick={() => {
          const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
          window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
          navigate({ hash: '' }, { replace: true })
        }}
        className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--club-gold-dark)] hover:underline"
      >
        <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
        {t('backToTop')}
      </button>
    </div>
  )
}

/** One of the three audience buttons under the platform strip; jumps to its section. */
function AudienceButton({ id, label, icon: Icon }: { id: SectionId; label: string; icon: LucideIcon }) {
  const navigate = useNavigate()
  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    e.preventDefault()
    scrollToSection(id)
    navigate({ hash: id }, { replace: true })
  }
  return (
    <a
      href={`#${id}`}
      onClick={handleClick}
      className="group flex items-center gap-4 border border-[var(--club-gold)] bg-[var(--club-cream)] p-1 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-12px_rgba(15,42,36,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--club-gold)] focus-visible:ring-offset-2"
    >
      <span className="flex w-full items-center gap-4 border border-[rgba(201,162,39,0.55)] px-4 py-4 transition-colors group-hover:bg-[var(--club-green)]">
        <span className="flex h-11 w-11 shrink-0 rotate-45 items-center justify-center border-2 border-[var(--club-gold)] bg-[var(--club-green)]">
          <Icon className="h-5 w-5 -rotate-45 text-[var(--club-gold-light)]" aria-hidden="true" />
        </span>
        <span className="flex-1 font-brand text-xl font-semibold leading-tight text-[var(--club-green)] transition-colors group-hover:text-[var(--club-cream)]">
          {label}
        </span>
        <ChevronDown
          className="h-5 w-5 shrink-0 text-[var(--club-gold-dark)] transition-transform group-hover:translate-y-0.5 group-hover:text-[var(--club-gold-light)]"
          aria-hidden="true"
        />
      </span>
    </a>
  )
}

function SectionHeading({ title }: { title: string }) {
  return (
    <div className="text-center">
      <DecoFan className="mx-auto w-14" />
      <h2
        className="mt-2 font-brand text-3xl font-semibold leading-tight text-[var(--club-green)] sm:text-4xl"
      >
        {title}
      </h2>
      <DecoDivider className="mx-auto mt-3 max-w-xs" />
    </div>
  )
}

/** Teachers / companies: lead line, optional list, paragraphs, then the email button. */
function AudienceSection({ id, copy }: { id: SectionId; copy: LandingPanelCopy }) {
  return (
    <section id={id} className="scroll-mt-24">
      <PaperFrame>
        <SectionHeading title={copy.title} />
        <div className="mx-auto mt-6 max-w-3xl space-y-3 text-[15px] leading-relaxed text-foreground">
          <div>
            <p className="font-brand text-xl font-semibold text-[var(--club-green)]">{copy.lead}</p>
            {copy.list && <BulletList items={copy.list} />}
          </div>
          {copy.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <div className="pt-3 text-center">
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(copy.title)}`}
              className="inline-block bg-[var(--club-green)] px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--club-cream)] shadow-sm hover:bg-[var(--club-green-soft)]"
            >
              {copy.cta}
            </a>
          </div>
        </div>
        <BackToTop />
      </PaperFrame>
    </section>
  )
}

/**
 * Signed-out home page: the club banner, the platform in a horizontal strip, three audience
 * buttons, then one section per audience (learners, language schools and teachers, companies)
 * that the buttons jump to. All in the English club's palette (deep green, gold, cream).
 */
export default function WelcomePanels() {
  const { lang, t } = useLanguage()
  const { promptSignIn, promptSignUp } = useAuthPrompt()
  const { hash } = useLocation()
  const copy = landingCopy[lang]
  const learners = copy.learners

  // A shared link such as avln.hu/#companies lands on that section.
  useEffect(() => {
    const id = hash.slice(1)
    if (!SECTION_IDS.includes(id as SectionId)) return
    const timer = window.setTimeout(() => scrollToSection(id, true), 0)
    return () => window.clearTimeout(timer)
    // Only on arrival: the buttons scroll by themselves.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-8 py-2">
      <ClubBanner />

      <PaperFrame>
        <div className="grid gap-6 md:grid-cols-2 md:gap-0 md:divide-x md:divide-[rgba(201,162,39,0.55)]">
          {copy.platform.map((s, i) => (
            <div key={s.title} className={i === 0 ? 'md:pr-8' : 'md:pl-8'}>
              <h2 className="font-brand text-2xl font-semibold text-[var(--club-green)] sm:text-3xl">{s.title}</h2>
              <div className="mt-2 h-px w-12 bg-[var(--club-gold)]" aria-hidden="true" />
              <p className="mt-3 text-[15px] leading-relaxed text-foreground">{s.text}</p>
            </div>
          ))}
        </div>
      </PaperFrame>

      <nav className="grid gap-4 md:grid-cols-3">
        <AudienceButton id="learners" label={learners.title} icon={Sparkles} />
        <AudienceButton id="teachers" label={copy.teachers.title} icon={GraduationCap} />
        <AudienceButton id="companies" label={copy.business.title} icon={Briefcase} />
      </nav>

      <section id="learners" className="scroll-mt-24">
        <PaperFrame>
          <SectionHeading title={learners.title} />
          <p className="mx-auto mt-5 max-w-2xl text-center font-brand text-2xl italic leading-snug text-[var(--club-gold-dark)] sm:text-3xl">
            {learners.hero}
          </p>

          <div className="mx-auto mt-8 grid max-w-4xl gap-6 text-[15px] leading-relaxed md:grid-cols-2">
            <div>
              <p className="font-semibold text-[var(--club-green)]">{learners.forYouIntro}</p>
              <BulletList items={learners.forYou} />
            </div>
            <div>
              <p className="font-semibold text-[var(--club-green)]">{learners.youGetIntro}</p>
              <BulletList items={learners.youGet} />
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={promptSignUp}
              className="bg-[var(--club-gold)] px-8 py-3 font-brand text-xl font-semibold uppercase tracking-[0.12em] text-[var(--club-green)] shadow-sm [clip-path:polygon(0_0,100%_0,96%_50%,100%_100%,0_100%,4%_50%)] hover:bg-[var(--club-green)] hover:text-[var(--club-gold-light)]"
            >
              {learners.cta}
            </button>
            <span className="text-sm text-muted-foreground">
              {copy.haveAccount}{' '}
              <button
                type="button"
                onClick={() => promptSignIn()}
                className="font-semibold text-[var(--club-green)] underline hover:text-[var(--club-gold-dark)]"
              >
                {t('signIn')}
              </button>
            </span>
          </div>

          <p className="mx-auto mt-8 max-w-2xl border-l-2 border-[var(--club-gold)] pl-4 font-brand text-xl italic leading-snug text-[var(--club-green)]">
            {learners.closing}
          </p>
          <BackToTop />
        </PaperFrame>
      </section>

      <AudienceSection id="teachers" copy={copy.teachers} />
      <AudienceSection id="companies" copy={copy.business} />
    </div>
  )
}
