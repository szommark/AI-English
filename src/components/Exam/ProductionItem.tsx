import type { ProductionItem as ProductionItemData } from '../../data/exams/types'
import { countWords } from '../../lib/examScoring'
import { useLanguage } from '../../lib/i18n'
import type { ItemProps } from './itemProps'

/** A writing task: prompt, content points, the pre-printed greeting and a text area with a word counter. */
export default function ProductionItem({ item, value, onChange }: ItemProps<ProductionItemData>) {
  const { t } = useLanguage()
  const text = typeof value === 'string' ? value : ''
  const words = countWords(text)
  const inRange = words >= item.minWords && words <= item.maxWords
  const counterColour = words === 0 ? 'text-muted-foreground' : inRange ? 'text-emerald-700' : 'text-amber-700'

  return (
    <div className="space-y-4">
      <div className="space-y-2 text-base leading-relaxed text-foreground">
        {item.prompt.map((p) => (
          <p key={p}>{p}</p>
        ))}
        <ol className="list-decimal space-y-1 pl-6">
          {item.contentPoints.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ol>
        {item.promptAfter?.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card">
        {item.opening && (
          <p className="border-b border-border px-4 py-3 text-base font-medium text-foreground" title={t('exOpeningNote')}>
            {item.opening}
          </p>
        )}
        <textarea
          aria-label={item.opening ?? item.prompt[0]}
          value={text}
          onChange={(e) => onChange(e.target.value)}
          rows={12}
          spellCheck={false}
          className="block w-full resize-y rounded-b-xl bg-transparent px-4 py-3 text-base leading-relaxed text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--teal-accent)]"
        />
      </div>
      <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
        <span className={`font-semibold tabular-nums ${counterColour}`} aria-live="polite">
          {t('exWordCount', { n: words })}
        </span>
        <span className="text-muted-foreground">{t('exWordTarget', { min: item.minWords, max: item.maxWords })}</span>
      </div>
      {item.opening && <p className="text-xs text-muted-foreground">{t('exOpeningNote')}</p>}

      {item.criteria && (
        <div className="rounded-lg bg-muted px-4 py-3 text-sm">
          <p className="font-semibold text-foreground">{t('exCriteria')}</p>
          <ul className="mt-1 space-y-0.5 text-muted-foreground">
            {item.criteria.map((c) => (
              <li key={c.labelHu} className="flex justify-between gap-4">
                <span>{c.labelHu}</span>
                <span className="shrink-0 tabular-nums">{t('exPointsShort', { n: c.points })}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
