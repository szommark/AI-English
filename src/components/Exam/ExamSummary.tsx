import type { ExamPaper } from '../../data/exams/types'
import type { ExamAnswers, PaperResult } from '../../lib/examScoring'
import { useLanguage } from '../../lib/i18n'
import SectionResults from './SectionResults'

/** Final summary: points per section, the written total for érettségi, and every section's review. */
export default function ExamSummary({ paper, result, answers }: { paper: ExamPaper; result: PaperResult; answers: ExamAnswers }) {
  const { t } = useLanguage()
  const erettsegi = paper.type === 'erettsegi'
  const texts = Object.fromEntries(Object.entries(answers).filter(([, v]) => typeof v === 'string')) as Record<string, string>

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-foreground">{t('exSummaryTitle')}</h2>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-left text-base">
          <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold" />
              <th className="px-3 py-3 text-right font-semibold">{erettsegi ? t('exRawPoints') : t('exPoints')}</th>
              <th className="px-4 py-3 text-right font-semibold">{erettsegi ? t('exScaledPoints') : '%'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {result.sections.map((s) => (
              <tr key={s.sectionId}>
                <td className="px-4 py-3 text-foreground">{s.titleHu}</td>
                {s.scored ? (
                  <>
                    <td className="px-3 py-3 text-right tabular-nums">
                      {s.raw} / {s.max}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">
                      {erettsegi ? `${s.scaled} / ${s.scaledMax}` : t('exPercent', { n: s.max ? Math.round((s.raw / s.max) * 100) : 0 })}
                    </td>
                  </>
                ) : (
                  <td colSpan={2} className="px-4 py-3 text-right text-sm text-muted-foreground">
                    {t('exNotScored')}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
          {erettsegi && (
            <tfoot className="bg-muted">
              <tr>
                <td className="px-4 py-3 font-semibold text-foreground" colSpan={2}>
                  {t('exWrittenTotal')}
                </td>
                <td className="px-4 py-3 text-right text-lg font-semibold tabular-nums">
                  {result.scaled} / {result.scaledMax}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <div className="space-y-1 text-sm text-muted-foreground">
        {erettsegi ? (
          <>
            <p>{t('exWritingExcludedErettsegi', { n: result.writingMax ?? 0 })}</p>
            <p>{t('exNoGrade')}</p>
          </>
        ) : (
          <>
            <p>{t('exWritingExcluded')}</p>
            <p>{t('exNoPassClaim')}</p>
          </>
        )}
      </div>

      {result.sections.map((s) => {
        const section = paper.sections.find((x) => x.id === s.sectionId)!
        return (
          <details key={s.sectionId} className="rounded-2xl border border-border bg-card px-4 py-2">
            <summary className="min-h-11 cursor-pointer py-2 font-medium text-foreground">
              {s.titleHu} — {t('exShowDetails')}
            </summary>
            <div className="pb-4 pt-2">
              <SectionResults paper={paper} section={section} result={s} writingTexts={texts} />
            </div>
          </details>
        )
      })}
    </div>
  )
}
