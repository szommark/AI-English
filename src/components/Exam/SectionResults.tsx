import { CircleCheck, CircleX } from 'lucide-react'
import type { ExamItem, ExamPaper, ExamSection } from '../../data/exams/types'
import type { ItemResult, SectionResult, TaskResult } from '../../lib/examScoring'
import { useLanguage } from '../../lib/i18n'

function Mark({ correct }: { correct: boolean }) {
  return correct ? (
    <CircleCheck className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
  ) : (
    <CircleX className="h-5 w-5 shrink-0 text-rose-600" aria-hidden />
  )
}

function stemOf(item: ExamItem | undefined): string | undefined {
  if (!item) return undefined
  if (item.type === 'boolean' || item.type === 'correction') return item.statement
  if (item.type === 'short-text') return item.prompt
  return undefined
}

function ObjectiveItem({ r, item, language }: { r: ItemResult; item?: ExamItem; language: string }) {
  const { t } = useLanguage()
  const stem = stemOf(item)
  return (
    <li className="flex gap-3 py-3">
      <Mark correct={r.correct} />
      <div className="min-w-0 flex-1 space-y-1 text-base">
        <p className="leading-relaxed">
          <span className="mr-2 font-semibold tabular-nums text-muted-foreground">{r.itemId}.</span>
          {stem && <span lang={language}>{stem}</span>}
        </p>
        <p className="text-sm">
          <span className="text-muted-foreground">{t('exYourAnswer')}: </span>
          <span lang={language} className={r.correct ? 'font-medium text-emerald-700' : 'font-medium text-rose-700'}>
            {r.given || t('exNoAnswer')}
          </span>
          {r.overWordLimit && <span className="ml-1 text-rose-700">({t('exOverWordLimit')})</span>}
        </p>
        {!r.correct && (
          <p className="text-sm">
            <span className="text-muted-foreground">{t('exCorrectAnswer')}: </span>
            <span lang={language} className="font-medium text-foreground">
              {r.expected}
            </span>
          </p>
        )}
        {item?.reviewNote && <p className="text-sm italic text-muted-foreground">{item.reviewNote}</p>}
      </div>
    </li>
  )
}

function MultiSelectResult({ r, language }: { r: ItemResult; language: string }) {
  const { t } = useLanguage()
  return (
    <ul className="divide-y divide-border">
      {r.options?.map((o) => {
        const right = o.ticked === o.shouldTick
        return (
          <li key={o.key} className="flex gap-3 py-2">
            <Mark correct={right} />
            <div className="text-base">
              <p lang={language}>
                <span className="mr-2 font-mono">{o.ticked ? '☒' : '☐'}</span>
                {o.text}
              </p>
              {!right && <p className="text-sm text-muted-foreground">{o.shouldTick ? t('exShouldTick') : t('exShouldNotTick')}</p>}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

function WritingResult({ item, text, language }: { item: ExamItem; text: string; language: string }) {
  const { t } = useLanguage()
  if (item.type !== 'production') return null
  return (
    <div className="space-y-4">
      <div>
        <p className="mb-1 text-sm font-semibold text-foreground">{t('exYourText')}</p>
        <div lang={language} className="whitespace-pre-wrap rounded-xl bg-muted p-4 text-base leading-relaxed">
          {item.opening && <p className="mb-2">{item.opening}</p>}
          {text.trim() || <span className="text-muted-foreground">{t('exNoAnswer')}</span>}
        </div>
      </div>
      {item.modelAnswer && (
        <div>
          <p className="mb-1 text-sm font-semibold text-foreground">{t('exModelAnswer')}</p>
          <div lang={language} className="whitespace-pre-wrap rounded-xl border border-border p-4 text-base leading-relaxed">
            {item.modelAnswer}
          </div>
        </div>
      )}
    </div>
  )
}

function RuleNote({ task }: { task: TaskResult }) {
  const { t } = useLanguage()
  if (!task.rule) return null
  const text =
    task.rule.kind === 'allSame'
      ? t('exRuleAllSame', { label: task.rule.label })
      : task.rule.kind === 'allTicked'
        ? t('exRuleAllTicked')
        : t('exRulePenalty', { n: task.rule.penalty })
  return <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">{text}</p>
}

/** Per-item review of a submitted section, with transcripts for listening. */
export default function SectionResults({
  paper,
  section,
  result,
  writingTexts,
}: {
  paper: ExamPaper
  section: ExamSection
  result: SectionResult
  /** Writing: the learner's text per task id. */
  writingTexts: Record<string, string>
}) {
  const { t } = useLanguage()
  const language = paper.language

  return (
    <div className="space-y-5">
      {result.scored ? (
        <div className="flex flex-wrap gap-3">
          <div className="rounded-xl bg-muted px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{result.scaled !== undefined ? t('exRawPoints') : t('exPoints')}</p>
            <p className="text-2xl font-semibold tabular-nums text-foreground">
              {result.raw} / {result.max}
            </p>
          </div>
          {result.scaled !== undefined ? (
            <div className="rounded-xl bg-muted px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{t('exScaledPoints')}</p>
              <p className="text-2xl font-semibold tabular-nums text-foreground">
                {result.scaled} / {result.scaledMax}
              </p>
            </div>
          ) : (
            <div className="rounded-xl bg-muted px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">%</p>
              <p className="text-2xl font-semibold tabular-nums text-foreground">
                {t('exPercent', { n: result.max ? Math.round((result.raw / result.max) * 100) : 0 })}
              </p>
            </div>
          )}
        </div>
      ) : (
        <p className="rounded-xl bg-muted px-4 py-3 text-sm text-foreground">{t('exAiComing')}</p>
      )}

      {result.tasks.map((task) => {
        const data = section.tasks.find((x) => x.id === task.taskId)!
        const transcript = section.transcripts?.find((tr) => tr.taskId === task.taskId)
        return (
          <section key={task.taskId} className="space-y-3 rounded-2xl border border-border bg-card p-4 sm:p-6">
            <header className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-lg font-semibold text-foreground">
                {task.label}
                {data.title && <span className="ml-2">{data.title}</span>}
              </h3>
              {result.scored && (
                <span className="text-sm font-semibold tabular-nums text-muted-foreground">{t('exTaskPoints', { n: task.raw, max: task.max })}</span>
              )}
            </header>
            <RuleNote task={task} />
            {task.items.map((r) => {
              const item = data.items.find((i) => i.id === r.itemId)
              if (r.type === 'production' && item) return <WritingResult key={r.itemId} item={item} text={writingTexts[`${task.taskId}/${r.itemId}`] ?? ''} language={language} />
              if (r.type === 'multi-select') return <MultiSelectResult key={r.itemId} r={r} language={language} />
              return null
            })}
            {task.items.some((r) => r.type !== 'production' && r.type !== 'multi-select') && (
              <ul className="divide-y divide-border">
                {task.items
                  .filter((r) => r.type !== 'production' && r.type !== 'multi-select')
                  .map((r) => (
                    <ObjectiveItem key={r.itemId} r={r} item={data.items.find((i) => i.id === r.itemId)} language={language} />
                  ))}
              </ul>
            )}
            {transcript && (
              <details className="rounded-xl border border-border px-4 py-2">
                <summary className="min-h-11 cursor-pointer py-2 text-sm font-medium text-foreground">{t('exTranscript')}</summary>
                <div lang={language} className="space-y-3 pb-3 pt-1 text-base leading-relaxed text-foreground">
                  <p className="font-semibold">{transcript.title}</p>
                  {transcript.paragraphs.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>
              </details>
            )}
          </section>
        )
      })}
    </div>
  )
}
