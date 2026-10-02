import type { OrderItem as OrderItemData } from '../../data/exams/types'
import { useLanguage } from '../../lib/i18n'
import { fieldClass, type ItemProps } from './itemProps'

/**
 * Put the shuffled parts of a text in order: the parts are listed, and each position after the
 * printed example gets a select (the paper has a box per position).
 */
export default function OrderItem({ item, value, onChange, example }: ItemProps<OrderItemData>) {
  const { t } = useLanguage()
  const given = Array.isArray(value) ? value : []
  const slots = example ? item.answer : item.answer.map((_, i) => given[i] ?? '')
  const used = new Set(slots.filter(Boolean))
  const first = item.parts.find((p) => p.key === item.first)

  function set(i: number, key: string) {
    const next = item.answer.map((_, j) => given[j] ?? '')
    next[i] = key
    onChange(next)
  }

  return (
    <div className="space-y-3 py-3">
      <ul className="space-y-2 rounded-xl bg-muted px-4 py-3 text-base leading-relaxed">
        {item.parts.map((p) => (
          <li key={p.key} className={used.has(p.key) || p.key === item.first ? 'text-muted-foreground' : 'text-foreground'}>
            <span className="font-semibold">{p.key})</span> {p.text}
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {first && (
          <span className="inline-flex items-center gap-2 text-base">
            <span className="font-semibold tabular-nums text-muted-foreground">0.</span>
            <span className="rounded-lg border border-border bg-card px-3 py-2 font-medium opacity-70">{first.key}</span>
          </span>
        )}
        {slots.map((s, i) => (
          <label key={i} className="inline-flex items-center gap-2 text-base">
            <span className="font-semibold tabular-nums text-muted-foreground">{item.start + i}.</span>
            <select
              aria-label={`${item.start + i}.`}
              value={s}
              disabled={example}
              onChange={(e) => set(i, e.target.value)}
              className={`${fieldClass} min-w-[5rem] font-medium`}
            >
              <option value="">{t('exChoose')}</option>
              {item.parts
                .filter((p) => p.key !== item.first)
                .map((p) => (
                  <option key={p.key} value={p.key}>
                    {p.key}
                  </option>
                ))}
            </select>
          </label>
        ))}
      </div>
    </div>
  )
}
