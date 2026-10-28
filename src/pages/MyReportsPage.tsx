import { useEffect, useState } from 'react'
import { Bug, MessageSquare } from 'lucide-react'
import PageHeading from '../components/PageHeading'
import { secondaryButtonClass } from '../components/TeacherTools/ui'
import { useReportProblem } from '../components/AppLayout'
import { KIND_LABEL, MY_STATUS_STYLE, myStatusLabel } from '../components/ReportProblem/reportLabels'
import { useLanguage } from '../lib/i18n'
import type { MyFeedbackReport } from '../lib/feedback'
import { fetchMyFeedback, markMyFeedbackSeen } from '../lib/feedbackApi'

function ReportCard({ report }: { report: MyFeedbackReport }) {
  const { lang, t } = useLanguage()
  const date = new Date(report.createdAt).toLocaleDateString(lang, { year: 'numeric', month: 'short', day: 'numeric' })

  return (
    <li className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${MY_STATUS_STYLE[report.status]}`}>
          {t(myStatusLabel(report))}
        </span>
        {report.unseen && (
          <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">{t('mrUnseen')}</span>
        )}
        <span className="text-xs text-muted-foreground">
          {t(KIND_LABEL[report.kind])} · {t('mrSentOn', { date })}
        </span>
      </div>

      <p className="whitespace-pre-wrap text-sm text-foreground">{report.description}</p>
      {report.expected && (
        <p className="text-sm text-muted-foreground">
          <span className="font-medium">{t(report.kind === 'content' ? 'mrExpectedContent' : 'mrExpected')}:</span>{' '}
          {report.expected}
        </p>
      )}

      {report.adminReply && (
        <div className="rounded-lg border border-[var(--teal-accent-border)] bg-[var(--teal-accent-soft)] px-3 py-2">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
            {t('mrReplyTitle')}
          </p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{report.adminReply}</p>
        </div>
      )}
    </li>
  )
}

/** /my-reports: the user's own problem reports with their status and the team's replies. */
export default function MyReportsPage() {
  const { t } = useLanguage()
  const { openReport } = useReportProblem()
  const [reports, setReports] = useState<MyFeedbackReport[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetchMyFeedback()
      .then((list) => {
        setReports(list)
        // Opening the page counts as having seen every update ("New" stays visible this time).
        if (list.some((r) => r.unseen)) markMyFeedbackSeen().catch(() => {})
      })
      .catch(() => setError(true))
  }, [])

  const reportButton = (
    <button type="button" onClick={openReport} className={`${secondaryButtonClass} inline-flex items-center gap-1.5`}>
      <Bug className="h-4 w-4" aria-hidden="true" />
      {t('reportProblem')}
    </button>
  )

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeading title={t('myReports')} subtitle={t('mrSubtitle')} actions={reportButton} />

      {error && <p className="text-sm text-red-600">{t('mrLoadError')}</p>}
      {!error && reports === null && <p className="text-sm text-muted-foreground">{t('loading')}</p>}
      {reports && reports.length === 0 && <p className="text-sm text-muted-foreground">{t('mrEmpty')}</p>}
      {reports && reports.length > 0 && (
        <ul className="space-y-3">
          {reports.map((r) => (
            <ReportCard key={r.id} report={r} />
          ))}
        </ul>
      )}
    </div>
  )
}
