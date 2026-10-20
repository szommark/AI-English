import { useEffect, useState } from 'react'
import { CheckCircle2, Lock, Send } from 'lucide-react'
import { useExamTaskCopy } from '../../data/examTaskCopy'
import { fetchPools, fetchTeachers, shareExamTask } from '../../lib/examTaskApi'
import type { ExamTask, ReviewerStatus, TeacherPool, TeacherRef } from '../../lib/examTasks'
import { TeacherToolsError } from '../../lib/teacherToolsApi'
import { cardClass, hintClass, primaryButtonClass } from '../TeacherTools/ui'
import TeacherPicker from './TeacherPicker'

/**
 * The owner chooses which teachers test the task, one by one or a saved pool at a time. Locked
 * while the task is a draft: it has to be published for review first (and again after a change).
 */
export default function SharePanel({
  task,
  reviewers,
  onShared,
}: {
  task: Pick<ExamTask, 'id' | 'revision' | 'status' | 'publishedRevision'>
  reviewers: ReviewerStatus[]
  onShared: () => void
}) {
  const { c } = useExamTaskCopy()
  const [teachers, setTeachers] = useState<TeacherRef[] | null>(null)
  const [pools, setPools] = useState<TeacherPool[]>([])
  const [selected, setSelected] = useState<string[]>(reviewers.map((r) => r.reviewerId))
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const locked = task.status !== 'published'

  useEffect(() => {
    setSelected(reviewers.map((r) => r.reviewerId))
  }, [reviewers])

  useEffect(() => {
    if (locked) return
    Promise.all([fetchTeachers(), fetchPools()])
      .then(([t, p]) => {
        setTeachers(t)
        setPools(p)
      })
      .catch(() => setTeachers([]))
  }, [locked])

  async function save() {
    setBusy(true)
    setMessage(null)
    try {
      const ids = await shareExamTask(task.id, selected)
      setMessage(c('testersSaved', { n: ids.length }))
      onShared()
    } catch (err) {
      setMessage(c(err instanceof TeacherToolsError && err.code === 'not_published' ? 'err_not_published' : 'err_generic'))
    } finally {
      setBusy(false)
    }
  }

  const status = (id: string) => {
    const r = reviewers.find((x) => x.reviewerId === id)
    if (!r) return null
    return r.submitted ? (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-700">
        <CheckCircle2 className="h-3.5 w-3.5" />
        {c('tested')}
      </span>
    ) : (
      <span className="text-xs text-muted-foreground">{c('waiting')}</span>
    )
  }

  return (
    <section className={cardClass}>
      <h2 className="flex items-center gap-2 font-semibold text-foreground">
        <Send className="h-5 w-5 text-[var(--teal-accent-strong)]" />
        {c('testing')}
      </h2>
      {locked ? (
        <div className="space-y-2 rounded-xl bg-muted px-4 py-3 text-sm">
          <p className="flex items-start gap-2 text-foreground">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            {task.publishedRevision !== null ? c('shareChanged', { n: task.revision }) : c('shareLocked')}
          </p>
          {task.publishedRevision !== null && reviewers.length > 0 && <p className={hintClass}>{c('shareChangedTesters')}</p>}
          {reviewers.length > 0 && <p className={hintClass}>{reviewers.map((r) => r.email).join(', ')}</p>}
        </div>
      ) : (
        <p className={hintClass}>{c('testingHint')}</p>
      )}
      {!locked && teachers === null && <p className={hintClass}>{c('loading')}</p>}
      {!locked && teachers?.length === 0 && <p className={hintClass}>{c('noTeachers')}</p>}
      {!locked && teachers && teachers.length > 0 && (
        <>
          {pools.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted-foreground">{c('addPool')}</span>
              {pools.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelected((s) => [...new Set([...s, ...p.memberIds])])}
                  className="rounded-full border border-border px-3 py-1 hover:bg-muted"
                >
                  {p.name} ({p.memberIds.length})
                </button>
              ))}
            </div>
          )}
          <TeacherPicker teachers={teachers} selected={selected} onChange={setSelected} statusOf={status} />
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className={primaryButtonClass} disabled={busy} onClick={save}>
              {c('saveTesters')}
            </button>
            {message && <span className="text-sm text-muted-foreground">{message}</span>}
          </div>
        </>
      )}
    </section>
  )
}
