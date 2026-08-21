import { Link, Navigate, useParams } from 'react-router-dom'
import { Plane, Bot, BookOpen, Briefcase, Mic, type LucideIcon } from 'lucide-react'
import { getFeature } from '../data/features'
import type { FeatureAccent } from '../data/features'

const icons: Record<string, LucideIcon> = {
  Plane,
  Bot,
  BookOpen,
  Briefcase,
  Mic,
}

const accentClasses: Record<FeatureAccent, string> = {
  indigo: 'bg-indigo-100 text-indigo-600',
  violet: 'bg-violet-100 text-violet-600',
  amber: 'bg-amber-100 text-amber-600',
  emerald: 'bg-emerald-100 text-emerald-600',
  rose: 'bg-rose-100 text-rose-600',
}

export default function ComingSoonPage() {
  const { featureId } = useParams()
  const feature = featureId ? getFeature(featureId) : undefined

  if (!feature) return <Navigate to="/" replace />

  const Icon = icons[feature.icon]

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full rounded-2xl border border-slate-200 bg-white shadow-sm p-8 text-center space-y-4">
        <div className={`mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full ${accentClasses[feature.accent]}`}>
          {Icon && <Icon className="h-7 w-7" />}
        </div>

        <div>
          <h2 className="font-semibold text-slate-800">{feature.title}</h2>
          <p className="text-sm text-slate-500">{feature.titleHu}</p>
        </div>

        <h1 className="text-2xl font-bold text-slate-800">Fejlesztés alatt</h1>
        <p className="text-sm text-slate-500">Ezen a funkción még dolgozunk — nézz vissza hamarosan!</p>

        <Link to="/" className="inline-block text-sm text-indigo-600 hover:underline">
          ← Vissza a főoldalra
        </Link>
      </div>
    </div>
  )
}
