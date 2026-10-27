import { useEffect, useState } from 'react'
import { Send } from 'lucide-react'
import { cardClass, hintClass, inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from '../TeacherTools/ui'
import { useCompCopy } from '../../data/compTestCopy'
import { fetchTeacherRoster, type RosterEntry } from '../../lib/teacherApi'
import { assignCompTest, fetchAssignmentResult, fetchAssignments, remarkAnswer, withdrawAssignment } from '../../lib/compTestApi'
import type { CompAssignment, CompAssignmentDetail } from '../../lib/compTests'
import ResultList from './ResultList'

/**
 * Assign the test to connected students and follow their results: one row per student, the
 * submitted ones open into the item-by-item result, where typed answers can be re-marked.
 */
export default function AssignPanel({ testId, dirty }: { testId: string; dirty: boolean }) {
  const { c, lang } = useCompCopy()
  const [roster, setRoster] = useState<RosterEntry[] | null>(null)
  const [assignments, setAssignments] = useState<CompAssignment[] | null>(null)
  const [picked, setPicked] = useState<Set<string>>(new Set())
  const [due, setDue] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState<CompAssignmentDetail | null>(null)
  const [busyKey, setBusyKey] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([fetchTeacherRoster(), fetchAssignments(testId)])
      .then(([r, a]) => {
        setRoster(r)
        setAssignments(a)
      })
      .catch(() => setError(c('loadError')))
  }, [testId, c])

  const assignedIds = new Set(assignments?.map((a) => a.studentId) ?? [])
  const free = roster?.filter((s) => !assignedIds.has(s.studentId)) ?? []
  const date = (iso: string) => new Date(iso).toLocaleDateString(lang)

  async function assign() {
    setBusy(true)
    setError(null)
    try {
      setAssignments(await assignCompTest(testId, [...picked], due ? new Date(`${due}T23:59:00`).toISOString() : null))
      setPicked(new Set())
    } catch {
      setError(c('assignError'))
    } finally {
      setBusy(false)
    }
  }

  async function withdraw(a: CompAssignment) {
    if (!window.confirm(a.submittedAt ? c('withdrawSubmittedConfirm', { email: a.studentEmail }) : c('withdrawConfirm', { email: a.studentEmail }))) return
    try {
      setAssignments(await withdrawAssignment(testId, a.id))
      if (open?.id === a.id) setOpen(null)
    } catch {
      setError(c('saveError'))
    }
  }

  async function toggleResult(a: CompAssignment) {
    if (open?.id === a.id) {
      setOpen(null)
      return
    }
    try {
      setOpen(await fetchAssignmentResult(a.id))
    } catch {
      setError(c('loadError'))
    }
  }

  async function remark(key: string, correct: boolean | null) {
    if (!open) return
    setBusyKey(key)
    try {
      const next = await remarkAnswer(open.id, key, correct)
      setOpen(next)
      setAssignments((list) => list?.map((a) => (a.id === next.id ? { ...a, score: next.score, max: next.max } : a)) ?? null)
    } catch {
      setError(c('saveError'))
    } finally {
      setBusyKey(null)
    }
  }

  return (
    <div className="space-y-5">
      <section className={cardClass}>
        <h2 className="font-semibold text-foreground">{c('assignTitle')}</h2>
        {dirty && <p className="text-sm text-amber-700">{c('assignSaveFirst')}</p>}
        {roster && roster.length === 0 && <p className={hintClass}>{c('noStudents')}</p>}
        {roster && roster.length > 0 && free.length === 0 && <p className={hintClass}>{c('allAssigned')}</p>}
        {free.length > 0 && (
          <>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setPicked(new Set(free.map((s) => s.studentId)))} className={secondaryButtonClass}>
                {c('selectAll')}
              </button>
              {picked.size > 0 && (
                <button type="button" onClick={() => setPicked(new Set())} className={secondaryButtonClass}>
                  {c('selectNone')}
                </button>
              )}
            </div>
            <ul className="grid gap-1 sm:grid-cols-2">
              {free.map((s) => (
                <li key={s.studentId}>
                  <label className="flex min-h-9 cursor-pointer items-center gap-2 rounded-lg px-2 text-sm hover:bg-muted">
                    <input
                      type="checkbox"
                      checked={picked.has(s.studentId)}
                      onChange={() =>
                        setPicked((p) => {
                          const next = new Set(p)
                          if (next.has(s.studentId)) next.delete(s.studentId)
                          else next.add(s.studentId)
                          return next
                        })
                      }
                    />
                    <span className="truncate">{s.email}</span>
                  </label>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-end gap-3">
              <label className="block space-y-1">
                <span className={labelClass}>{c('dueDate')}</span>
                <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className={inputClass} />
              </label>
              <button type="button" disabled={busy || dirty || picked.size === 0} onClick={() => void assign()} className={`${primaryButtonClass} inline-flex items-center gap-2`}>
                <Send className="h-4 w-4" />
                {busy ? c('assigning') : c('assignN', { n: picked.size })}
              </button>
            </div>
          </>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </section>

      <section className={cardClass}>
        <h2 className="font-semibold text-foreground">{c('resultsTitle')}</h2>
        {assignments && assignments.length === 0 && <p className={hintClass}>{c('notAssignedYet')}</p>}
        {assignments && assignments.length > 0 && (
          <ul className="divide-y divide-border">
            {assignments.map((a) => (
              <li key={a.id} className="py-2">
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="min-w-0 flex-1 truncate font-medium text-foreground">{a.studentEmail}</span>
                  {a.submittedAt ? (
                    <>
                      <span className="font-semibold tabular-nums text-foreground">
                        {a.score}/{a.max}
                      </span>
                      <span className="text-muted-foreground">{c('submittedOn', { date: date(a.submittedAt) })}</span>
                      <button type="button" onClick={() => void toggleResult(a)} className={secondaryButtonClass}>
                        {open?.id === a.id ? c('hideAnswers') : c('showAnswers')}
                      </button>
                    </>
                  ) : (
                    <span className="text-muted-foreground">{a.dueAt ? c('pendingDue', { date: date(a.dueAt) }) : c('pending')}</span>
                  )}
                  <button type="button" onClick={() => void withdraw(a)} className="text-xs text-muted-foreground underline-offset-2 hover:underline">
                    {c('withdraw')}
                  </button>
                </div>
                {open?.id === a.id && open.content && open.result && (
                  <div className="mt-3">
                    <ResultList content={open.content} result={open.result} onRemark={(key, correct) => void remark(key, correct)} busyKey={busyKey} />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
