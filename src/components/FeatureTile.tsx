import { Link } from 'react-router-dom'
import {
  Plane,
  Bot,
  BookOpen,
  Briefcase,
  Mic,
  Languages,
  GraduationCap,
  Radio,
  FlaskConical,
  Sprout,
  Library,
  Users,
  type LucideIcon,
} from 'lucide-react'
import type { Feature } from '../data/features'
import { localizeFeature, useLanguage } from '../lib/i18n'

export const featureIcons: Record<string, LucideIcon> = {
  Plane,
  Bot,
  BookOpen,
  Briefcase,
  Mic,
  Languages,
  GraduationCap,
  Radio,
  FlaskConical,
  Sprout,
  Library,
  Users,
}

/** A gold padlock, drawn to hang on the chain across a locked tile. */
function Padlock({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 56" className={className} aria-hidden="true">
      <path d="M13 26V17a11 11 0 0 1 22 0v9" fill="none" stroke="var(--club-gold)" strokeWidth="5" strokeLinecap="round" />
      <rect x="5" y="24" width="38" height="30" rx="4" fill="var(--club-gold)" />
      <rect x="9" y="28" width="30" height="22" rx="2" fill="none" stroke="var(--club-gold-light)" strokeWidth="1" />
      <circle cx="24" cy="36" r="4" fill="var(--club-green)" />
      <path d="M22 38h4l1 7h-6z" fill="var(--club-green)" />
    </svg>
  )
}

/** A gold chain running across the tile: round links seen face-on, alternating with edge-on ones. */
function Chain() {
  return (
    <div className="flex items-center overflow-hidden" aria-hidden="true">
      {Array.from({ length: 24 }, (_, i) =>
        i % 2 === 0 ? (
          <span key={i} className="-mx-[3px] h-4 w-7 shrink-0 rounded-full border-[3px] border-[var(--club-gold)]" />
        ) : (
          <span key={i} className="-mx-[3px] h-[5px] w-7 shrink-0 rounded-full bg-[var(--club-gold-light)]" />
        ),
      )}
    </div>
  )
}

/** A feature that can't be opened yet: deep green, chained shut with a padlock, not a link. */
function LockedTile({ feature }: { feature: Feature }) {
  const { lang, t } = useLanguage()
  const text = localizeFeature(lang, feature)
  const Icon = featureIcons[feature.icon]

  return (
    <div
      aria-disabled="true"
      aria-label={`${text.title} (${t('comingSoon')})`}
      className="relative cursor-not-allowed select-none border border-[var(--club-gold)] bg-[var(--club-green)] p-1"
    >
      <div className="relative h-full overflow-hidden border border-[rgba(201,162,39,0.55)] p-5">
        <div className="flex items-start justify-between gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center border border-[var(--club-gold)] text-[var(--club-gold-light)] opacity-60">
            {Icon && <Icon className="h-6 w-6" />}
          </span>
          <span className="border border-[var(--club-gold)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--club-gold-light)]">
            {t('comingSoon')}
          </span>
        </div>
        <h2 className="mt-4 font-brand text-xl font-semibold text-[var(--club-cream)] opacity-80">{text.title}</h2>
        <p className="mt-2 pb-6 text-sm text-[var(--club-cream)] opacity-35">{text.description}</p>

        <div className="absolute inset-x-0 bottom-[26%] -rotate-[4deg]">
          <Chain />
        </div>
        <Padlock className="absolute bottom-[8%] right-[18%] h-14 w-12 drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]" />
      </div>
    </div>
  )
}

/** A home / group page tile in the club palette: cream paper in a gold double frame. */
export default function FeatureTile({
  feature,
  onClick,
  badge,
}: {
  feature: Feature
  onClick?: (e: React.MouseEvent) => void
  /** Short status text in the top-right corner, e.g. "5 due". */
  badge?: string
}) {
  const { lang } = useLanguage()
  if (feature.locked) return <LockedTile feature={feature} />

  const text = localizeFeature(lang, feature)
  const Icon = featureIcons[feature.icon]

  return (
    <Link
      to={feature.route}
      onClick={onClick}
      className="group block border border-[var(--club-gold)] bg-[var(--club-paper)] p-1 transition-all duration-300 hover:-translate-y-1 hover:bg-[var(--club-cream)] hover:shadow-[0_14px_30px_-14px_rgba(15,42,36,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--club-gold)] focus-visible:ring-offset-2"
    >
      <div className="h-full border border-[rgba(201,162,39,0.55)] p-5">
        <div className="flex items-start justify-between gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center border border-[var(--club-gold)] bg-[var(--club-cream)] text-[var(--club-green)] transition-colors group-hover:bg-[var(--club-green)] group-hover:text-[var(--club-gold-light)]">
            {Icon && <Icon className="h-6 w-6" />}
          </span>
          {badge && (
            <span className="bg-[var(--club-gold)] px-2.5 py-0.5 text-xs font-semibold text-[var(--club-green)]">{badge}</span>
          )}
        </div>

        <h2 className="mt-4 font-brand text-xl font-semibold text-[var(--club-green)]">{text.title}</h2>
        <div className="mt-2 h-px w-10 bg-[var(--club-gold)] transition-all duration-300 group-hover:w-16" aria-hidden="true" />
        <p className="mt-2 text-sm text-[#3d4f4a]">{text.description}</p>
      </div>
    </Link>
  )
}
