import type { ExamItem, ExamLanguage, ExamTask } from '../../data/exams/types'
import { answerKey, type AnswerValue, type ExamAnswers } from '../../lib/examScoring'
import { useLanguage } from '../../lib/i18n'
import BooleanItem from './BooleanItem'
import CorrectionItem from './CorrectionItem'
import MultiSelectItem from './MultiSelectItem'
import Passage from './Passage'
import ProductionItem from './ProductionItem'
import ShortTextItem from './ShortTextItem'

/** Items rendered in the passage (gaps and stems) rather than in the list below it. */
function isInPassage(task: ExamTask, item: ExamItem): boolean {
  return (task.passage ?? []).some((b) => b.itemId === item.id || b.text.includes(`{{${item.id}}}`))
}

export default function TaskView({
  task,
  language,
  answers,
  onAnswer,
  passageRepeated,
}: {
  task: ExamTask
  language: ExamLanguage
  answers: ExamAnswers
  onAnswer: (taskId: string, itemId: string, value: AnswerValue) => void
  /** The passage is the same as the previous task's: show it collapsed. */
  passageRepeated?: boolean
}) {
  const { t, lang: uiLang } = useLanguage()
  const valueOf = (itemId: string) => answers[answerKey(task.id, itemId)]
  const set = (itemId: string) => (v: AnswerValue) => onAnswer(task.id, itemId, v)

  const listed = [
    ...(task.examples ?? []).map((item) => ({ item, example: true })),
    ...task.items.map((item) => ({ item, example: false })),
  ].filter(({ item }) => !isInPassage(task, item))

  const usedKeys = new Set(
    task.items.map((i) => valueOf(i.id)).filter((v): v is string => typeof v === 'string'),
  )
  for (const e of task.examples ?? []) if (e.type === 'choice') usedKeys.add(e.answer)

  const passage = task.passage && (
    <Passage task={task} blocks={task.passage} valueOf={valueOf} onChange={(id, v) => onAnswer(task.id, id, v)} />
  )

  return (
    <section lang={language} className="space-y-5 rounded-2xl border border-border bg-card p-4 sm:p-6">
      <header className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground">
          {task.label}
          {task.title && <span className="ml-2">{task.title}</span>}
        </h2>
        <p className="text-base font-medium leading-relaxed text-foreground">{task.instructions}</p>
      </header>

      {passage &&
        (passageRepeated ? (
          <details className="rounded-xl border border-border px-4 py-3">
            <summary lang={uiLang} className="min-h-11 cursor-pointer py-2 text-sm font-medium text-muted-foreground">
              {t('exPassageAgain')}
            </summary>
            <div className="pt-3">{passage}</div>
          </details>
        ) : (
          passage
        ))}

      {task.bank && (
        <div className="rounded-xl bg-muted px-4 py-3">
          {task.bankTitle && <p className="mb-2 text-sm font-semibold tracking-wide text-foreground">{task.bankTitle}</p>}
          <ul className="grid gap-x-6 gap-y-1 text-base sm:grid-cols-2">
            {task.bank.map((b) => (
              <li key={b.key} className={usedKeys.has(b.key) ? 'text-muted-foreground line-through decoration-1' : 'text-foreground'}>
                {b.text === b.key ? b.key : (
                  <>
                    <span className="font-semibold">{b.key})</span> {b.text}
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {listed.length > 0 && (
        <div className="divide-y divide-border">
          {listed.map(({ item, example }) => {
            const props = { task, value: valueOf(item.id), onChange: set(item.id), example }
            const key = `${example ? 'ex' : 'it'}-${item.id}`
            const wrap = (node: React.ReactNode) => (
              <div key={key} className={example ? 'relative opacity-80' : undefined}>
                {example && (
                  <span lang={uiLang} className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t('exExample')}
                  </span>
                )}
                {node}
              </div>
            )
            switch (item.type) {
              case 'boolean':
                return wrap(<BooleanItem {...props} item={item} />)
              case 'short-text':
                return wrap(<ShortTextItem {...props} item={item} />)
              case 'correction':
                return wrap(<CorrectionItem {...props} item={item} />)
              case 'multi-select':
                return wrap(<MultiSelectItem {...props} item={item} />)
              case 'production':
                return wrap(<ProductionItem {...props} item={item} />)
              default:
                return null
            }
          })}
        </div>
      )}
    </section>
  )
}
