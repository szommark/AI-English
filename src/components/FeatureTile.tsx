import { Link } from 'react-router-dom'
import { Plane, Bot, BookOpen, Briefcase, Mic, type LucideIcon } from 'lucide-react'
import type { Feature, FeatureAccent } from '../data/features'

const icons: Record<string, LucideIcon> = {
  Plane,
  Bot,
  BookOpen,
  Briefcase,
  Mic,
}

const accentClasses: Record<FeatureAccent, { badge: string; border: string }> = {
  indigo: { badge: 'bg-indigo-100 text-indigo-600', border: 'hover:border-indigo-200' },
  violet: { badge: 'bg-violet-100 text-violet-600', border: 'hover:border-violet-200' },
  amber: { badge: 'bg-amber-100 text-amber-600', border: 'hover:border-amber-200' },
  emerald: { badge: 'bg-emerald-100 text-emerald-600', border: 'hover:border-emerald-200' },
  rose: { badge: 'bg-rose-100 text-rose-600', border: 'hover:border-rose-200' },
}

export default function FeatureTile({
  feature,
  onClick,
}: {
  feature: Feature
  onClick?: (e: React.MouseEvent) => void
}) {
  const Icon = icons[feature.icon]
  const accent = accentClasses[feature.accent]

  return (
    <Link
      to={feature.route}
      onClick={onClick}
      className={`group block rounded-2xl border border-border bg-card overflow-hidden p-6 transition-all duration-300 hover:shadow-[var(--shadow-card)] hover:-translate-y-1 ${accent.border}`}
    >
      <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${accent.badge}`}>
        {Icon && <Icon className="h-6 w-6" />}
      </div>

      <h2 className="mt-4 font-semibold text-foreground">{feature.title}</h2>
      <p className="text-sm text-muted-foreground">{feature.titleHu}</p>
      <p className="text-sm text-muted-foreground mt-2">{feature.description}</p>
    </Link>
  )
}
