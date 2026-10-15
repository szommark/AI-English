import { Check, Minus, X } from 'lucide-react'

/** Azure's pronunciation score (0–100) as a bar with the percentage and a tick / hyphen / cross. */
export default function ScoreBar({ score, label }: { score: number; label?: string }) {
  const pct = Math.round(Math.max(0, Math.min(100, score)))
  const tier = pct >= 80 ? 'good' : pct >= 60 ? 'ok' : 'low'
  const color = tier === 'good' ? 'bg-emerald-500' : tier === 'ok' ? 'bg-amber-400' : 'bg-rose-500'
  return (
    <div className="flex items-center gap-2">
      <div
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label={label}
        className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-secondary"
      >
        <div className={`h-full rounded-full ${color} transition-[width] duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-10 shrink-0 text-right text-sm font-medium tabular-nums text-foreground">{pct}%</span>
      {tier === 'good' ? (
        <Check className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
      ) : tier === 'ok' ? (
        <Minus className="h-4 w-4 shrink-0 text-black" aria-hidden="true" />
      ) : (
        <X className="h-4 w-4 shrink-0 text-red-600" aria-hidden="true" />
      )}
    </div>
  )
}
