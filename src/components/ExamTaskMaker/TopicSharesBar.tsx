import { useExamTaskCopy, type ExamTaskCopyKey } from '../../data/examTaskCopy'
import type { TopicShares } from '../../lib/examSources'

const PARTS: { key: keyof TopicShares; label: ExamTaskCopyKey; color: string }[] = [
  { key: 'technology', label: 'share_technology', color: 'bg-sky-500' },
  { key: 'economics', label: 'share_economics', color: 'bg-violet-500' },
  { key: 'agriculture', label: 'share_agriculture', color: 'bg-amber-500' },
  { key: 'environment', label: 'share_environment', color: 'bg-emerald-500' },
]

/**
 * How much of a source text is about technology, economics, agriculture and the environment (the
 * model's estimate). Shown so the teacher can decide whether an environment-topic text still has
 * enough technical, economic or agricultural content for a notes task.
 */
export default function TopicSharesBar({ shares }: { shares: TopicShares }) {
  const { c } = useExamTaskCopy()
  const other = Math.max(0, 100 - PARTS.reduce((sum, p) => sum + shares[p.key], 0))
  return (
    <figure className="space-y-1">
      <figcaption className="text-xs font-medium text-muted-foreground">{c('share_title')}</figcaption>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted" aria-hidden>
        {PARTS.map((p) => (shares[p.key] > 0 ? <div key={p.key} className={p.color} style={{ width: `${shares[p.key]}%` }} /> : null))}
      </div>
      <ul className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-foreground">
        {PARTS.map((p) => (
          <li key={p.key} className="inline-flex items-center gap-1">
            <span aria-hidden className={`h-2 w-2 rounded-full ${p.color}`} />
            {c(p.label)} <span className="font-semibold tabular-nums">{shares[p.key]}%</span>
          </li>
        ))}
        {other > 0 && (
          <li className="inline-flex items-center gap-1 text-muted-foreground">
            <span aria-hidden className="h-2 w-2 rounded-full bg-slate-300" />
            {c('share_other')} <span className="tabular-nums">{other}%</span>
          </li>
        )}
      </ul>
    </figure>
  )
}
