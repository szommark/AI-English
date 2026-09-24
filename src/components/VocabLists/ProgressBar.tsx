/** Thin teal progress bar; empty when max is 0. */
export default function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div
      className="h-1.5 overflow-hidden rounded-full bg-secondary"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
    >
      <div className="h-full rounded-full bg-[var(--teal-accent)]" style={{ width: `${pct}%` }} />
    </div>
  )
}
