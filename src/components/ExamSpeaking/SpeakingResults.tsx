import { SPEAKING_CRITERIA, SPEAKING_CRITERION_MAX, type SpeakingExam } from '../../data/exams/speaking'
import type { SpeakingAssessment } from '../../lib/examSpeakingTypes'
import { useLanguage, type MessageKey } from '../../lib/i18n'
import type { ChatMessage } from '../../lib/types'
import { RoleCard } from './SpeakingTaskSheet'

const CRITERION_KEY: Record<(typeof SPEAKING_CRITERIA)[number], MessageKey> = {
  task: 'exSpkCriterion_task',
  fluency: 'exSpkCriterion_fluency',
  vocabulary: 'exSpkCriterion_vocabulary',
  grammar: 'exSpkCriterion_grammar',
}

function Transcript({ turns, language }: { turns: ChatMessage[]; language: string }) {
  const { t } = useLanguage()
  return (
    <div lang={language} className="space-y-2 text-sm">
      {turns.map((m, i) => (
        <p key={i} className="text-foreground">
          <span className={`font-semibold ${m.role === 'user' ? 'text-indigo-600' : 'text-violet-600'}`}>
            {m.role === 'user' ? t('exSpkYou') : t('exSpkExaminer')}:
          </span>{' '}
          {m.content}
        </p>
      ))}
    </div>
  )
}

/** The AI's estimated scores per task and criterion, its feedback and every task's conversation. */
export default function SpeakingResults({
  exam,
  language,
  assessment,
  transcripts,
}: {
  exam: SpeakingExam
  language: string
  assessment: SpeakingAssessment
  transcripts: Record<string, ChatMessage[]>
}) {
  const { t } = useLanguage()
  const percent = assessment.max ? Math.round((assessment.total / assessment.max) * 100) : 0

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3">
        <div className="rounded-xl bg-muted px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{t('exPoints')}</p>
          <p className="text-2xl font-semibold tabular-nums text-foreground">
            {assessment.total} / {assessment.max}
          </p>
        </div>
        <div className="rounded-xl bg-muted px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">%</p>
          <p className="text-2xl font-semibold tabular-nums text-foreground">{t('exPercent', { n: percent })}</p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{t('exSpkEstimateNote')}</p>
      {assessment.summary && <p className="text-base leading-relaxed text-foreground">{assessment.summary}</p>}

      {exam.tasks.map((task) => {
        const result = assessment.tasks.find((r) => r.taskId === task.id)
        const turns = transcripts[task.id] ?? []
        return (
          <section key={task.id} className="space-y-3 rounded-2xl border border-border bg-card p-4 sm:p-6">
            <header className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-lg font-semibold text-foreground">
                {task.label}
                <span lang={language} className="ml-2">
                  {task.title}
                </span>
              </h3>
              {result && (
                <span className="text-sm font-semibold tabular-nums text-muted-foreground">{t('exTaskPoints', { n: result.total, max: result.max })}</span>
              )}
            </header>
            {result && !result.attempted && <p className="text-sm text-muted-foreground">{t('exSpkNotAttempted')}</p>}
            {result?.attempted && (
              <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {SPEAKING_CRITERIA.map((c) => (
                  <div key={c} className="flex items-center justify-between gap-3 rounded-lg bg-muted px-3 py-2 text-sm">
                    <dt className="text-foreground">{t(CRITERION_KEY[c])}</dt>
                    <dd className="flex items-center gap-2">
                      <span className="flex gap-0.5" aria-hidden>
                        {Array.from({ length: SPEAKING_CRITERION_MAX }, (_, i) => (
                          <span key={i} className={`h-2 w-3 rounded-sm ${i < result.scores[c] ? 'bg-sky-600' : 'bg-border'}`} />
                        ))}
                      </span>
                      <span className="font-semibold tabular-nums text-foreground">
                        {result.scores[c]}/{SPEAKING_CRITERION_MAX}
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>
            )}
            {result?.comment && <p className="text-base leading-relaxed text-foreground">{result.comment}</p>}
            {turns.length > 0 && (
              <details className="rounded-xl border border-border px-4 py-2">
                <summary className="min-h-11 cursor-pointer py-2 text-sm font-medium text-foreground">{t('exSpkConversation')}</summary>
                <div className="pb-3 pt-1">
                  <Transcript turns={turns} language={language} />
                </div>
              </details>
            )}
            {task.examinerCard && (
              <details className="rounded-xl border border-border px-4 py-2">
                <summary className="min-h-11 cursor-pointer py-2 text-sm font-medium text-foreground">{t('exSpkExaminerCard')}</summary>
                <div lang={language} className="pb-3 pt-1">
                  <RoleCard card={task.examinerCard} tone="muted" />
                </div>
              </details>
            )}
          </section>
        )
      })}

      {assessment.strengths.length > 0 && (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <h3 className="mb-2 font-semibold text-emerald-800">{t('exSpkStrengths')}</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm text-emerald-900">
            {assessment.strengths.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </section>
      )}
      {assessment.corrections.length > 0 && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h3 className="mb-3 font-semibold text-amber-800">{t('exSpkCorrections')}</h3>
          <div className="space-y-4">
            {assessment.corrections.map((c, i) => (
              <div key={i} className="text-sm">
                <p lang={language} className="text-slate-500 line-through">
                  {c.original}
                </p>
                <p lang={language} className="font-medium text-emerald-700">
                  {c.corrected}
                </p>
                <p className="mt-0.5 text-slate-600">{c.note}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
