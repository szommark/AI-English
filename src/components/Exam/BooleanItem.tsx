import type { BooleanItem as BooleanItemData } from '../../data/exams/types'
import { ItemNumber, type ItemProps } from './itemProps'

/** A true/false (richtig/falsch) statement with two large toggle buttons. */
export default function BooleanItem({ task, item, value, onChange, example }: ItemProps<BooleanItemData>) {
  const [yes, no] = task.booleanLabels ?? ['T', 'F']
  const current = example ? item.answer : typeof value === 'boolean' ? value : undefined

  return (
    <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="flex gap-2 text-base leading-relaxed text-foreground">
        <ItemNumber id={item.id} />
        <span>{item.statement}</span>
      </p>
      <div className="flex shrink-0 gap-2 pl-7 sm:pl-0" role="group" aria-label={`${item.id}.`}>
        {[
          { v: true, label: yes },
          { v: false, label: no },
        ].map(({ v, label }) => (
          <button
            key={label}
            type="button"
            disabled={example}
            aria-pressed={current === v}
            onClick={() => onChange(v)}
            className={`h-11 w-14 rounded-lg border text-base font-semibold transition-colors ${
              current === v
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-foreground hover:bg-muted'
            } disabled:cursor-default ${example && current !== v ? 'opacity-50' : ''}`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
