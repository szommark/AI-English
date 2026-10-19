import { useEffect, useState } from 'react'
import { CheckCircle2, Send } from 'lucide-react'
import { useExamTaskCopy } from '../../data/examTaskCopy'
import { fetchPools, fetchTeachers, shareExamTask } from '../../lib/examTaskApi'
import type { ReviewerStatus, TeacherPool, TeacherRef } from '../../lib/examTasks'
import { cardClass, hintClass, primaryButtonClass } from '../TeacherTools/ui'
import TeacherPicker from './TeacherPicker'

/** The owner chooses which teachers test the task, one by one or a saved pool at a time. */
export default function SharePanel({
  taskId,
  reviewers,
  onShared,
}: {
  taskId: string
  reviewers: ReviewerStatus[]
  onShared: () => void
}) {
  const { c } = useExamTaskCopy()
  const [teachers, setTeachers] = useState<TeacherRef[] | null>(null)
  const [pools, setPools] = useState<TeacherPool[]>([])
  const [selected, setSelected] = useState<string[]>(reviewers.map((r) => r.reviewerId))
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    setSelected(reviewers.map((r) => r.reviewerId))
  }, [reviewers])

  useEffect(() => {
    Promise.all([fetchTeachers(), fetchPools()])
      .then(([t, p]) => {
        setTeachers(t)
        setPools(p)
      })
      .catch(() => setTeachers([]))
  }, [])

  async function save() {
    setBusy(true)
    setMessage(null)
    try {
      const ids = await shareExamTask(taskId, selected)
      setMessage(c('testersSaved', { n: ids.length }))
      onShared()
    } catch {
      setMessage(c('err_generic'))
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
      <p className={hintClass}>{c('testingHint')}</p>
      {teachers === null && <p className={hintClass}>{c('loading')}</p>}
      {teachers?.length === 0 && <p className={hintClass}>{c('noTeachers')}</p>}
      {teachers && teachers.length > 0 && (
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
