import { Link } from 'react-router-dom'
import { ChevronRight, MessagesSquare, PencilLine } from 'lucide-react'
import PageHeading from '../PageHeading'
import type { ExamPaperMeta } from '../../data/exams/types'
import type { SpeakingExam } from '../../data/exams/speaking'
import { examPaperLabel } from '../../lib/examLabels'
import { useLanguage } from '../../lib/i18n'

/** A nyelvvizsga paper with a speaking part: pick the written or the speaking exam. */
export default function ExamPartsHub({ meta, speaking }: { meta: ExamPaperMeta; speaking: SpeakingExam }) {
  const { t } = useLanguage()
  const minutes = speaking.tasks.reduce((n, task) => n + task.minutes, 0)

  const tiles = [
    {
      to: `/exams/${meta.id}/written`,
      icon: PencilLine,
      title: t('exWritten'),
      desc: t('exWrittenDesc'),
      detail: null,
    },
    {
      to: `/exams/${meta.id}/speaking`,
      icon: MessagesSquare,
      title: t('exSpeaking'),
      desc: t('exSpeakingDesc'),
      detail: (
        <>
          <p className="mt-3 text-sm font-medium text-foreground">{t('exSpeakingTaskCount', { n: speaking.tasks.length, min: minutes })}</p>
          <ol lang={meta.language} className="mt-1 space-y-0.5 text-sm text-muted-foreground">
            {speaking.tasks.map((task) => (
              <li key={task.id}>
                {task.label}: {task.title}
              </li>
            ))}
          </ol>
        </>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeading title={examPaperLabel(t, meta)} subtitle={t('exChoosePart')} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {tiles.map(({ to, icon: Icon, title, desc, detail }) => (
          <Link
            key={to}
            to={to}
            className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-[var(--shadow-card)]"
          >
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
              <Icon className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-foreground">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            <div className="flex-1">{detail}</div>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-sky-700">
              {t('exStart')}
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
