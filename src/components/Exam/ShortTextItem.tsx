import type { ShortTextItem as ShortTextItemData } from '../../data/exams/types'
import { countWords } from '../../lib/examScoring'
import { useLanguage } from '../../lib/i18n'
import { fieldClass, ItemNumber, type ItemProps } from './itemProps'

/**
 * A typed answer: inline in the passage (a gap, with the word to change shown next to it),
 * or as a question with an answer field underneath.
 */
export default function ShortTextItem({ item, value, onChange, example, inline }: ItemProps<ShortTextItemData> & { inline?: boolean }) {
  const { t } = useLanguage()
  const text = example ? item.answer.accepted[0] : typeof value === 'string' ? value : ''
  const max = item.answer.maxWords
  const tooLong = !example && max !== undefined && countWords(text) > max

  const input = (
    <input
      type="text"
      aria-label={item.prompt ?? `${item.id}.${item.baseWord ? ` (${item.baseWord})` : ''}`}
      value={text}
      disabled={example}
      onChange={(e) => onChange(e.target.value)}
      autoComplete="off"
      autoCapitalize="off"
      spellCheck={false}
      placeholder={inline ? undefined : t('exTypeHere')}
      className={`${fieldClass} ${inline ? 'w-36 align-middle' : 'w-full'} ${tooLong ? 'border-rose-400' : ''}`}
    />
  )

  if (inline) {
    return (
      <span className="inline-flex flex-wrap items-center gap-1 align-middle">
        {input}
        {item.baseWord && <span className="text-sm italic text-muted-foreground">({item.baseWord})</span>}
      </span>
    )
  }

  return (
    <div className="space-y-2 py-3">
      {item.prompt && (
        <p className="flex gap-2 text-base leading-relaxed text-foreground">
          <ItemNumber id={item.id} />
          <span>{item.prompt}</span>
        </p>
      )}
      <div className="pl-7">
        {input}
        {max !== undefined && !example && (
          <p className={`mt-1 text-xs ${tooLong ? 'text-rose-600' : 'text-muted-foreground'}`}>{t('exMaxWords', { n: max })}</p>
        )}
      </div>
    </div>
  )
}
