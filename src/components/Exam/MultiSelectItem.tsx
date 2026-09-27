import { Check } from 'lucide-react'
import type { MultiSelectItem as MultiSelectItemData } from '../../data/exams/types'
import { useLanguage } from '../../lib/i18n'
import type { ItemProps } from './itemProps'

function Box({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={`mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-2 ${
        checked ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card'
      }`}
    >
      {checked && <Check className="h-5 w-5" strokeWidth={3} />}
    </span>
  )
}

/** Tick the statements that are mentioned; the paper allows a fixed number of ticks. */
export default function MultiSelectItem({ item, value, onChange }: ItemProps<MultiSelectItemData>) {
  const { t } = useLanguage()
  const ticked = Array.isArray(value) ? value : []
  const over = ticked.length > item.pick

  function toggle(key: string) {
    onChange(ticked.includes(key) ? ticked.filter((k) => k !== key) : [...ticked, key])
  }

  return (
    <div className="space-y-1">
      {item.exampleOption && (
        <div className="flex items-start gap-3 rounded-lg px-2 py-2 opacity-70">
          <Box checked />
          <span className="text-base leading-relaxed">
            <span className="font-semibold text-muted-foreground">0.</span> {item.exampleOption}
          </span>
        </div>
      )}
      {item.options.map((o) => {
        const checked = ticked.includes(o.key)
        return (
          <label key={o.key} className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-2 hover:bg-muted">
            <input type="checkbox" className="sr-only" checked={checked} onChange={() => toggle(o.key)} />
            <Box checked={checked} />
            <span className="text-base leading-relaxed text-foreground">{o.text}</span>
          </label>
        )
      })}
      <p className={`px-2 pt-2 text-sm font-medium ${over ? 'text-rose-600' : 'text-muted-foreground'}`} aria-live="polite">
        {t('exTicked', { n: ticked.length, max: item.pick })}
      </p>
    </div>
  )
}
