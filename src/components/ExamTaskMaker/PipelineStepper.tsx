import { Check } from 'lucide-react'
import { useExamTaskCopy, type ExamTaskCopyKey } from '../../data/examTaskCopy'
import type { ExamTask, ExamTaskReview } from '../../lib/examTasks'

export type PipelineStep = 'create' | 'test' | 'results' | 'published'

const STEPS: { id: PipelineStep; label: ExamTaskCopyKey }[] = [
  { id: 'create', label: 'pipe_create' },
  { id: 'test', label: 'pipe_test' },
  { id: 'results', label: 'pipe_results' },
  { id: 'published', label: 'pipe_published' },
]

/** Whether the owner has submitted their own test of the task's current revision. */
export function ownTestDone(task: Pick<ExamTask, 'revision'>, myReview: ExamTaskReview | null): boolean {
  return !!myReview?.submittedAt && myReview.revision === task.revision
}

/** Which steps are done, and the next one, for a saved task (or an unsaved new one). */
export function pipelineState(task: Pick<ExamTask, 'revision' | 'status'> | null, myReview: ExamTaskReview | null, dirty: boolean) {
  const created = !!task && !dirty
  const tested = created && !!task && ownTestDone(task, myReview)
  const published = created && task?.status === 'published'
  const done: Record<PipelineStep, boolean> = { create: created, test: tested, results: tested, published }
  const next: PipelineStep = !created ? 'create' : !tested ? 'test' : !published ? 'results' : 'published'
  return { done, next }
}

/**
 * The exam task pipeline the owner walks through: Creation → Testing → Results → Published for
 * review. Publishing unlocks once the owner's own test of the current revision is in; any change
 * (a new revision) sends the task back to Testing.
 */
export default function PipelineStepper({
  task,
  myReview,
  dirty,
  current,
  onGo,
}: {
  task: Pick<ExamTask, 'revision' | 'status' | 'publishedRevision'> | null
  myReview: ExamTaskReview | null
  dirty: boolean
  current: 'create' | 'test' | 'results'
  onGo: (step: 'create' | 'test' | 'results') => void
}) {
  const { c } = useExamTaskCopy()
  const { done, next } = pipelineState(task, myReview, dirty)
  // A test of an earlier revision exists: say why Testing is open again.
  const retest = !!task && !done.test && !!myReview?.submittedAt && myReview.revision !== task.revision
  const hint: ExamTaskCopyKey =
    next === 'create' ? 'pipe_next_save' : next === 'test' ? (retest ? 'pipe_retest' : 'pipe_next_test') : next === 'results' ? 'pipe_next_results' : 'pipe_next_share'

  return (
    <nav aria-label={c('pipe_label')} className="space-y-2">
      <ol className="flex flex-wrap items-center gap-2">
        {STEPS.map((s, i) => {
          const isDone = done[s.id]
          const isNext = next === s.id && !isDone
          const target = s.id === 'published' ? 'create' : s.id
          const isCurrent = s.id !== 'published' && current === s.id
          return (
            <li key={s.id} className="flex items-center gap-2">
              {i > 0 && <span aria-hidden className={`hidden h-px w-6 sm:block ${done[STEPS[i - 1].id] ? 'bg-[var(--teal-accent)]' : 'bg-border'}`} />}
              <button
                type="button"
                disabled={!task}
                aria-current={isCurrent ? 'step' : undefined}
                onClick={() => onGo(target)}
                className={`inline-flex min-h-9 items-center gap-2 rounded-full border px-3 text-sm font-medium transition-colors disabled:cursor-default ${
                  isDone
                    ? 'border-[var(--teal-accent-border)] bg-[var(--teal-accent-soft)] text-[var(--teal-accent-strong)]'
                    : isNext
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-muted-foreground'
                } ${isCurrent ? 'ring-2 ring-[var(--teal-accent)] ring-offset-1' : ''}`}
              >
                <span
                  className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs ${isDone ? 'bg-[var(--teal-accent)] text-white' : 'border border-current'}`}
                >
                  {isDone ? <Check className="h-3.5 w-3.5" aria-label={c('pipe_done')} /> : i + 1}
                </span>
                {c(s.label)}
              </button>
            </li>
          )
        })}
      </ol>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {c(hint)}
      </p>
    </nav>
  )
}
