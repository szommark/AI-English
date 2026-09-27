import type { CorrectionItem as CorrectionItemData } from '../../data/exams/types'
import { useLanguage } from '../../lib/i18n'
import { fieldClass, ItemNumber, type ItemProps } from './itemProps'

/** A statement with wrong information and a field for the corrected information. */
export default function CorrectionItem({ item, value, onChange, example }: ItemProps<CorrectionItemData>) {
  const { t } = useLanguage()
  const text = example ? item.answer.accepted[0] : typeof value === 'string' ? value : ''

  return (
    <div className="grid gap-2 py-3 sm:grid-cols-2 sm:items-center sm:gap-4">
      <p className="flex gap-2 text-base leading-relaxed text-foreground">
        <ItemNumber id={item.id} />
        <span>{item.statement}</span>
      </p>
      <input
        type="text"
        aria-label={`${item.id}. ${item.statement}`}
        value={text}
        disabled={example}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
        spellCheck={false}
        placeholder={t('exTypeHere')}
        className={`${fieldClass} ml-7 w-[calc(100%-1.75rem)] sm:ml-0 sm:w-full`}
      />
    </div>
  )
}
