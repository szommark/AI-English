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

export default function FeatureTile({ feature }: { feature: Feature }) {
  const Icon = icons[feature.icon]
  const accent = accentClasses[feature.accent]

  return (
    <Link
      to={feature.route}
      className={`group block rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden p-6 transition hover:shadow-lg hover:-translate-y-0.5 ${accent.border}`}
    >
      <div className={`inline-flex h-12 w-12 items-center justify-center rounded-full ${accent.badge}`}>
        {Icon && <Icon className="h-6 w-6" />}
      </div>

      <h2 className="mt-4 font-semibold text-slate-800">{feature.title}</h2>
      <p className="text-sm text-slate-500">{feature.titleHu}</p>
      <p className="text-sm text-slate-500 mt-2">{feature.description}</p>
    </Link>
  )
}
