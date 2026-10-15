/** Azure's pronunciation score (0–100) as a bar only: the learner sees no number. */
export default function ScoreBar({ score, label }: { score: number; label?: string }) {
  const pct = Math.max(0, Math.min(100, score))
  const color = pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-400' : 'bg-rose-500'
  return (
    <div
      role="meter"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      aria-label={label}
      className="h-2.5 w-full overflow-hidden rounded-full bg-secondary"
    >
      <div className={`h-full rounded-full ${color} transition-[width] duration-500`} style={{ width: `${pct}%` }} />
    </div>
  )
}
