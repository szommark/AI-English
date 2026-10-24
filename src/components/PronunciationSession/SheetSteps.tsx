import { Check } from 'lucide-react'

export interface SheetStep {
  label: string
  /** Set once the step is done; shown after its label (e.g. "2/3", "85%"). */
  score?: string
}

/**
 * The sound sheet's step row: numbered ovals for the steps and a last one for the overall result.
 * The current step is rose; a done one is green with a tick and its score. `current` equal to
 * `steps.length` marks the overall result.
 */
export default function SheetSteps({
  steps,
  current,
  overallLabel,
}: {
  steps: SheetStep[]
  current: number
  overallLabel: string
}) {
  const showingOverall = current >= steps.length
  return (
    <ol className="flex flex-wrap items-center gap-2 text-sm">
      {steps.map((step, i) => {
        const done = step.score !== undefined
        const active = i === current
        return (
          <li
            key={i}
            aria-current={active ? 'step' : undefined}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 ${
              active
                ? 'border-rose-300 bg-rose-50 font-medium text-rose-700'
                : done
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-border text-muted-foreground'
            }`}
          >
            {done && !active && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
            {i + 1}. {step.label}
            {done && <span className="tabular-nums">· {step.score}</span>}
          </li>
        )
      })}
      <li
        aria-current={showingOverall ? 'step' : undefined}
        className={`rounded-full border px-3 py-1 ${
          showingOverall ? 'border-rose-300 bg-rose-50 font-medium text-rose-700' : 'border-border text-muted-foreground'
        }`}
      >
        {overallLabel}
      </li>
    </ol>
  )
}
