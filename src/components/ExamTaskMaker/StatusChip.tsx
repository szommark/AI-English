import { useExamTaskCopy } from '../../data/examTaskCopy'
import type { ExamTaskSummary } from '../../lib/examTasks'

/** Draft / Published for review, with the current revision. */
export default function StatusChip({ task }: { task: Pick<ExamTaskSummary, 'status' | 'revision'> }) {
  const { c } = useExamTaskCopy()
  const published = task.status === 'published'
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        published ? 'bg-[var(--teal-accent-soft)] text-[var(--teal-accent-strong)]' : 'bg-amber-100 text-amber-800'
      }`}
    >
      {c(published ? 'status_published' : 'status_draft')} · {c('revision', { n: task.revision })}
    </span>
  )
}
