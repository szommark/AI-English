import { useState } from 'react'
import { TriangleAlert } from 'lucide-react'
import type { ExamPaper, ExamSection } from '../../data/exams/types'
import type { ExamMode } from '../../lib/examAttempt'
import { sectionWarnings, unansweredCount, type AnswerValue, type ExamAnswers, type TaskWarning } from '../../lib/examScoring'
import { useLanguage, type MessageKey } from '../../lib/i18n'
import Countdown from './Countdown'
import ExamAudio from './ExamAudio'
import TaskView from './TaskView'

const WARNING_KEY: Record<TaskWarning['kind'], MessageKey> = {
  allSame: 'exWarnAllSame',
  tooManyTicks: 'exWarnTooMany',
  allTicked: 'exWarnAllTicked',
}

export default function SectionView({
  paper,
  section,
  mode,
  answers,
  onAnswer,
  onSubmit,
  deadline,
  onTimeUp,
  audioStartedAt,
  onAudioStart,
  onAudioEnded,
}: {
  paper: ExamPaper
  section: ExamSection
  mode: ExamMode
  answers: ExamAnswers
  onAnswer: (taskId: string, itemId: string, value: AnswerValue) => void
  onSubmit: () => void
  /** Exam mode, timed section: when time runs out (ms since epoch). */
  deadline?: number
  onTimeUp: () => void
  audioStartedAt?: number
  onAudioStart: (at: number) => void
  onAudioEnded: () => void
}) {
  const { t } = useLanguage()
  const [confirming, setConfirming] = useState(false)
  const warnings = confirming ? sectionWarnings(section, answers) : []
  const unanswered = confirming ? unansweredCount(section, answers) : 0

  function warningText(w: TaskWarning): string {
    // "3." → "3. feladat"; labels like "Task 2" are shown as printed.
    const number = w.taskLabel.match(/^(\d+)\.$/)?.[1]
    const task = number ? t('exTaskNumber', { n: number }) : w.taskLabel
    if (w.kind === 'allSame') return t(WARNING_KEY[w.kind], { task, label: w.label })
    if (w.kind === 'tooManyTicks') return t(WARNING_KEY[w.kind], { task, n: w.ticks, max: w.pick })
    return t(WARNING_KEY[w.kind], { task })
  }

  return (
    <div className="space-y-5">
      {deadline !== undefined && <Countdown deadline={deadline} onExpire={onTimeUp} />}

      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-foreground">{section.titleHu}</h2>
        {section.intro && (
          <div lang={section.kind === 'listening' ? paper.language : 'hu'} className="space-y-1 text-sm leading-relaxed text-muted-foreground">
            {section.intro.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        )}
      </div>

      {section.audio && (
        <ExamAudio
          audio={section.audio}
          tasks={section.tasks}
          mode={mode}
          startedAt={audioStartedAt}
          onStart={onAudioStart}
          onEnded={onAudioEnded}
          endsSection={mode === 'exam' && section.timeLimitMin !== undefined}
        />
      )}

      {section.tasks.map((task, i) => (
        <TaskView
          key={task.id}
          task={task}
          language={paper.language}
          answers={answers}
          onAnswer={onAnswer}
          passageRepeated={i > 0 && !!task.passage && task.passage === section.tasks[i - 1].passage}
        />
      ))}

      {section.kind === 'writing' && <p className="text-sm text-muted-foreground">{t('exWritingPhaseNote')}</p>}

      {!confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="min-h-12 w-full rounded-xl bg-primary px-6 text-base font-semibold text-primary-foreground hover:opacity-90 sm:w-auto"
        >
          {t('exSubmitSection')}
        </button>
      ) : (
        <div className="space-y-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900" role="alertdialog" aria-label={t('exBeforeSubmit')}>
          <p className="flex items-center gap-2 font-semibold">
            <TriangleAlert className="h-5 w-5" />
            {t('exBeforeSubmit')}
          </p>
          {warnings.length > 0 && (
            <ul className="list-disc space-y-1 pl-6 text-sm">
              {warnings.map((w, i) => (
                <li key={i}>{warningText(w)}</li>
              ))}
            </ul>
          )}
          {unanswered > 0 && <p className="text-sm">{t('exWarnUnanswered', { n: unanswered })}</p>}
          <p className="text-sm">{t('exSubmitFinal')}</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={onSubmit}
              className="min-h-12 rounded-xl bg-primary px-6 text-base font-semibold text-primary-foreground hover:opacity-90"
            >
              {warnings.length || unanswered ? t('exSubmitAnyway') : t('exSubmitSection')}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="min-h-12 rounded-xl border border-border bg-card px-6 text-base font-medium text-foreground hover:bg-muted"
            >
              {t('exKeepWorking')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
