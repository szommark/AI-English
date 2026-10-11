import { useEffect, useState, type ReactNode } from 'react'
import type { GrammarExerciseSet } from '../../lib/types'
import { useLanguage } from '../../lib/i18n'
import { FormItem, OrderItem, TransformItem, type ItemResult } from './WrittenExercises'

type Section = 'order' | 'form' | 'transform'

function emptyResults(set: GrammarExerciseSet): Record<Section, ItemResult[]> {
  return {
    order: set.order.map(() => null),
    form: set.form.map(() => null),
    transform: set.transform.map(() => null),
  }
}

function SectionBlock({ number, title, instruction, children }: { number: number; title: string; instruction: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-slate-800">
          {number}. {title}
        </h3>
        <p className="text-sm text-slate-500">{instruction}</p>
      </div>
      <ol className="space-y-4">{children}</ol>
    </section>
  )
}

/**
 * The three written exercise types for one grammar point. Each item is checked on its own;
 * once all are checked, onComplete gets the share answered correctly (0–1).
 */
export default function WrittenPractice({ set, onComplete }: { set: GrammarExerciseSet; onComplete: (score: number) => void }) {
  const { t } = useLanguage()
  const [results, setResults] = useState(() => emptyResults(set))
  // Bumped by "Start over" to remount the items with fresh inputs and reshuffled tiles.
  const [round, setRound] = useState(0)

  const all = [...results.order, ...results.form, ...results.transform]
  const checkedCount = all.filter((r) => r !== null).length
  const correctCount = all.filter((r) => r === true).length
  const isDone = checkedCount === all.length

  useEffect(() => {
    if (isDone) onComplete(correctCount / all.length)
    // Only the moment the last item is checked should report.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDone])

  const record = (section: Section, index: number) => (correct: boolean) =>
    setResults((r) => ({ ...r, [section]: r[section].map((v, i) => (i === index ? correct : v)) }))

  const startOver = () => {
    setResults(emptyResults(set))
    setRound((n) => n + 1)
  }

  return (
    <div key={round} className="space-y-6">
      <SectionBlock number={1} title={t('orderTitle')} instruction={t('orderInstruction')}>
        {set.order.map((item, i) => (
          <OrderItem key={i} number={i + 1} item={item} result={results.order[i]} onCheck={record('order', i)} />
        ))}
      </SectionBlock>

      <SectionBlock number={2} title={t('formTitle')} instruction={set.formInstruction}>
        {set.form.map((item, i) => (
          <FormItem key={i} number={i + 1} item={item} result={results.form[i]} onCheck={record('form', i)} />
        ))}
      </SectionBlock>

      <SectionBlock number={3} title={t('transformTitle')} instruction={set.transformInstruction}>
        {set.transform.map((item, i) => (
          <TransformItem key={i} number={i + 1} item={item} result={results.transform[i]} onCheck={record('transform', i)} />
        ))}
      </SectionBlock>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
        <p className={`text-sm ${isDone ? 'font-semibold text-amber-700' : 'text-slate-500'}`}>
          {isDone
            ? t('writtenDone', { correct: correctCount, total: all.length })
            : t('writtenProgress', { checked: checkedCount, total: all.length, correct: correctCount })}
        </p>
        {checkedCount > 0 && (
          <button onClick={startOver} className="text-sm text-indigo-600 hover:underline">
            {t('startOver')}
          </button>
        )}
      </div>
    </div>
  )
}
