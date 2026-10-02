import type { McqItem as McqItemData } from '../../data/exams/types'
import { useLanguage } from '../../lib/i18n'
import { fieldClass, ItemNumber, type ItemProps } from './itemProps'

/** The item's own options, or the task's shared ones. */
export function mcqOptions(task: ItemProps['task'], item: McqItemData) {
  return item.options ?? task.options ?? []
}

/**
 * Multiple choice. Inline (an `{{id}}` gap in the passage) it is a select; with a `stem` it is
 * a question followed by one large button per option.
 */
export default function McqItem({
  task,
  item,
  value,
  onChange,
  example,
  inline,
}: ItemProps<McqItemData> & { inline?: boolean }) {
  const { t } = useLanguage()
  const options = mcqOptions(task, item)
  const selected = example ? item.answer : typeof value === 'string' ? value : ''

  if (inline) {
    return (
      <select
        aria-label={`${item.id}.`}
        value={selected}
        disabled={example}
        onChange={(e) => onChange(e.target.value)}
        className={`${fieldClass} max-w-[min(16rem,100%)] truncate align-middle font-medium`}
      >
        {example ? (
          <option value={item.answer}>{options.find((o) => o.key === item.answer)?.text ?? item.answer}</option>
        ) : (
          <>
            <option value="">{t('exChoose')}</option>
            {options.map((o) => (
              <option key={o.key} value={o.key}>
                {o.key}) {o.text}
              </option>
            ))}
          </>
        )}
      </select>
    )
  }

  return (
    <div className="space-y-2 py-3">
      {item.stem && (
        <p className="flex gap-2 text-base leading-relaxed text-foreground">
          <ItemNumber id={item.id} />
          <span>{item.stem}</span>
        </p>
      )}
      <div className="flex flex-col gap-2 pl-7" role="group" aria-label={`${item.id}.`}>
        {options.map((o) => (
          <button
            key={o.key}
            type="button"
            disabled={example}
            aria-pressed={selected === o.key}
            onClick={() => onChange(o.key)}
            className={`min-h-11 rounded-lg border px-3 py-2 text-left text-base transition-colors ${
              selected === o.key
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-foreground hover:bg-muted'
            } disabled:cursor-default ${example && selected !== o.key ? 'opacity-50' : ''}`}
          >
            <span className="font-semibold">{o.key})</span> {o.text}
          </button>
        ))}
      </div>
    </div>
  )
}
