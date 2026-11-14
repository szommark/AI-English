import { Link } from 'react-router-dom'
import { CalendarClock, MapPin, Sparkles, Users, type LucideIcon } from 'lucide-react'
import { useAuthPrompt } from '../components/AppLayout'
import Wordmark from '../components/Wordmark'
import ClubSignUp from '../components/club/ClubSignUp'
import { DecoDivider, DecoFan, DecoFrame } from '../components/club/Deco'
import { CLUB_LINK_ROUTES, clubCopy, type ClubCopy, type ClubLinkId } from '../data/clubCopy'
import { useAuth } from '../lib/AuthContext'
import { useLanguage } from '../lib/i18n'

const SIGN_UP_ID = 'jelentkezes'

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']

/** One line of the cream plaque (time, place, size, themes), as on the poster. */
function PlaqueItem({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 text-left">
      <Icon className="mt-0.5 h-6 w-6 shrink-0 text-[#0f2a24]" aria-hidden="true" />
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8a6d14]">{label}</p>
        <p className="mt-0.5 font-brand text-xl font-semibold leading-snug text-[#0f2a24]">{value}</p>
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
    'inline-flex items-center border border-[#c9a227] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#0f2a24]'
  const hover = 'hover:bg-[#0f2a24] hover:text-[#f6ecd2]'

  if (!route) return <span className={chip}>{label}</span>
  if (!user) {
    return (
      <button type="button" onClick={() => promptSignIn(route)} className={`${chip} ${hover}`}>
        {label}
      </button>
    )
  }
  return (
    <Link to={route} className={`${chip} ${hover}`}>
      {label}
    </Link>
  )
}

export default function ClubPage() {
  const { lang } = useLanguage()
  const copy = clubCopy[lang]

  return (
    <article className="mx-auto max-w-5xl space-y-10 py-4 sm:py-8">
      <DecoFrame className="text-center" innerClassName="px-5 py-8 sm:px-12 sm:py-12">
        <DecoFan className="mx-auto w-24 sm:w-32" />
        <span className="mt-4 inline-block border border-[#c9a227] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.25em] text-[#e9d28a]">
          {copy.firstBadge}
        </span>
        <h1 className="mt-4 leading-none">
          <Wordmark className="!text-[#f6ecd2] text-6xl sm:text-7xl" />
          <span className="mt-2 block font-brand text-3xl font-semibold text-[#f6ecd2] sm:text-4xl">English club</span>
        </h1>
        <p className="mt-4 font-brand text-3xl italic text-[#e9d28a] sm:text-4xl">{copy.subtitle}</p>
        <DecoDivider className="mx-auto mt-6 max-w-sm" />

        <div className="mx-auto mt-8 max-w-3xl border-2 border-[#c9a227] bg-[#f6ecd2] p-1">
          <div className="grid gap-5 border border-[#c9a227] p-5 sm:grid-cols-2 sm:p-6">
            <PlaqueItem icon={CalendarClock} label={copy.whenLabel} value={copy.when} />
            <PlaqueItem icon={MapPin} label={copy.whereLabel} value={copy.where} />
            <PlaqueItem icon={Users} label={copy.sizeLabel} value={copy.size} />
            <PlaqueItem icon={Sparkles} label={copy.themesLabel} value={copy.themes} />
          </div>
        </div>

        <p className="mt-8 font-brand text-2xl italic leading-snug text-[#f6ecd2] sm:text-3xl">{copy.slogan}</p>

        <div className="mt-8 flex flex-col items-center gap-3">
          <p className="font-brand text-2xl italic text-[#e9d28a]">{copy.joinUs}</p>
          <button
            type="button"
            onClick={() => document.getElementById(SIGN_UP_ID)?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-[#c9a227] px-8 py-3 font-brand text-xl font-semibold uppercase tracking-[0.15em] text-[#0f2a24] shadow-sm [clip-path:polygon(0_0,100%_0,96%_50%,100%_100%,0_100%,4%_50%)] hover:bg-[#e9d28a]"
          >
            {copy.signUp}
          </button>
        </div>
      </DecoFrame>

      <ClubSignUp copy={copy} id={SIGN_UP_ID} />

      <section>
        <div className="text-center">
          <DecoFan className="mx-auto w-16" />
          <h2 className="mt-2 font-brand text-3xl font-semibold text-[#0f2a24] sm:text-4xl">{copy.scheduleTitle}</h2>
          <DecoDivider className="mx-auto mt-3 max-w-xs" />
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{copy.scheduleIntro}</p>
        </div>

        <ol className="mt-8 grid gap-5 md:grid-cols-2">
          {copy.blocks.map((block, i) => (
            <li key={i} className="border border-[#c9a227] bg-[#fbf6e9] p-1">
              <div className="flex h-full flex-col border border-[rgba(201,162,39,0.55)] p-5">
                <span className="flex h-10 w-10 rotate-45 items-center justify-center self-start border-2 border-[#c9a227] bg-[#0f2a24]">
                  <span className="-rotate-45 font-brand text-sm font-semibold text-[#e9d28a]">{ROMAN[i]}</span>
                </span>
                <h3 className="mt-4 font-brand text-xl font-semibold leading-snug text-[#0f2a24]">{block.title}</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-foreground">{block.text}</p>
                {block.links.length > 0 && (
                  <div className="mt-auto flex flex-wrap gap-2 pt-4">
                    {block.links.map((id) => (
                      <FeatureChip key={id} id={id} copy={copy} />
                    ))}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>
    </article>
  )
}
