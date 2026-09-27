import type { ChoiceItem as ChoiceItemData } from '../../data/exams/types'
import { useLanguage } from '../../lib/i18n'
import { fieldClass, type ItemProps } from './itemProps'

/** Pick a bank option for a gap or a paragraph. Shows the key and the option's text. */
export default function ChoiceItem({ task, item, value, onChange, example }: ItemProps<ChoiceItemData>) {
  const { t } = useLanguage()
  const selected = example ? item.answer : typeof value === 'string' ? value : ''
  const optionLabel = (key: string, text: string) => (text === key ? key : `${key}) ${text}`)

  return (
    <select
      aria-label={`${item.id}.`}
      value={selected}
      disabled={example}
      onChange={(e) => onChange(e.target.value)}
      className={`${fieldClass} max-w-[min(16rem,100%)] truncate align-middle font-medium`}
    >
      {example ? (
        <option value={item.answer}>{optionLabel(item.answer, task.bank?.find((b) => b.key === item.answer)?.text ?? item.answer)}</option>
      ) : (
        <>
          <option value="">{t('exChoose')}</option>
          {task.bank?.map((b) => (
            <option key={b.key} value={b.key}>
              {optionLabel(b.key, b.text)}
            </option>
          ))}
        </>
      )}
    </select>
  )
}
