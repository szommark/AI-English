import { useMemo, useState } from 'react'
import { CRITERIA_BY_ID, OTHER_REASON } from '../../data/examTaskCriteria'
import { pick, useExamTaskCopy } from '../../data/examTaskCopy'
import { itemIds, TASK_REVIEW_KEY, type ExamTask, type ExamTaskReview, type TaskRecommendation } from '../../lib/examTasks'
import { isCorrect, itemText, keyText } from '../../lib/listeningTaskExam'
import { cardClass, hintClass, secondaryButtonClass } from '../TeacherTools/ui'
import ItemCorrection from './ItemCorrection'

function countBy<T extends string>(list: T[]): [T, number][] {
  const m = new Map<T, number>()
  for (const x of list) m.set(x, (m.get(x) ?? 0) + 1)
  return [...m].sort((a, b) => b[1] - a[1])
}

/**
 * The owner's view of the submitted tests: per item, how testers answered and judged it. With
 * `onSaved` the owner can correct each item (wording, key, script excerpt) next to that feedback.
 */
export default function ResultsView({
  task,
  reviews,
  onSaved,
  editLocked = false,
}: {
  task: ExamTask
  reviews: ExamTaskReview[]
  /** The corrected task, after a save (owner only). */
  onSaved?: (saved: ExamTask) => void
  /** Unsaved edits on the Create tab: correcting here would lose them. */
  editLocked?: boolean
}) {
  const { c, lang } = useExamTaskCopy()
  const revisions = [...new Set(reviews.map((r) => r.revision))].sort((a, b) => b - a)
  const [revision, setRevision] = useState(revisions.includes(task.revision) ? task.revision : (revisions[0] ?? task.revision))
  const list = useMemo(() => reviews.filter((r) => r.revision === revision), [reviews, revision])
  const reasonLabel = (id: string) => (id === OTHER_REASON ? c('other') : pick(CRITERIA_BY_ID.get(id)?.label ?? { en: id, hu: id }, lang))
  // Item wording is the current revision's; older tests are shown against it with a note.
  const content = task.content
  const canEdit = task.isOwner && !!onSaved
  const [editing, setEditing] = useState<string | null>(null)
  const [savedNote, setSavedNote] = useState<{ id: string; revision: number } | null>(null)

  if (reviews.length === 0) return <p className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">{c('resultsEmpty')}</p>

  const recs = countBy(list.map((r) => r.recommendation).filter((r): r is TaskRecommendation => !!r))

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          {c('resultsFor')}
          <select className="min-h-9 rounded-lg border border-border bg-card px-2" value={revision} onChange={(e) => setRevision(Number(e.target.value))}>
            {[...new Set([task.revision, ...revisions])].map((r) => (
              <option key={r} value={r}>
                {c('revision', { n: r })}
              </option>
            ))}
          </select>
        </label>
        <span className="text-sm text-muted-foreground">{c('testsCount', { n: list.length })}</span>
        {recs.length > 0 && (
          <span className="text-sm">
            {c('recommendations')}: {recs.map(([r, n]) => `${c(`rec_${r}`)} ${n}`).join(' · ')}
          </span>
        )}
      </div>
      {revision !== task.revision && <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">{c('oldRevisionNote')}</p>}
      {list.length === 0 && <p className={hintClass}>{c('resultsEmpty')}</p>}
      {canEdit && editLocked && list.length > 0 && <p className={hintClass}>{c('editSaveCreateFirst')}</p>}

      {list.length > 0 &&
        itemIds(content).map((id) => {
          const verdicts = list.map((r) => r.verdicts[id]).filter(Boolean)
          const rejects = verdicts.filter((v) => v.verdict === 'reject')
          const answered = id === '0' ? [] : list.filter((r) => r.answers[id] !== undefined && r.answers[id] !== '')
          const right = answered.filter((r) => isCorrect(content, id, r.answers[id])).length
          const reasons = countBy(rejects.flatMap((v) => v.reasons))
          const notes = list.filter((r) => r.verdicts[id]?.note).map((r) => ({ who: r.reviewerEmail, note: r.verdicts[id].note as string }))
          const feedback = (
            <>
              <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                {id !== '0' && <span>{c('correctRate', { n: right, m: answered.length })}</span>}
                <span className="text-emerald-700">{c('accepts', { n: verdicts.length - rejects.length })}</span>
                <span className={rejects.length ? 'font-semibold text-rose-700' : 'text-muted-foreground'}>{c('rejects', { n: rejects.length })}</span>
              </p>
              {reasons.length > 0 && (
                <ul className="flex flex-wrap gap-2">
                  {reasons.map(([r, n]) => (
                    <li key={r} className="rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-800">
                      {reasonLabel(r)} × {n}
                    </li>
                  ))}
                </ul>
              )}
              {notes.length > 0 && (
                <ul className="space-y-1 text-sm">
                  {notes.map((n, i) => (
                    <li key={i}>
                      <span className="text-muted-foreground">{n.who}:</span> {n.note}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )
          return (
            <article key={id} className={cardClass}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p lang="en" className="min-w-0 flex-1 text-foreground">
                  <span className="mr-2 font-semibold tabular-nums text-muted-foreground">{id === '0' ? `${c('example')} (0)` : `${id}.`}</span>
                  {itemText(content, id)}
                  <span className="ml-2 text-sm font-medium text-muted-foreground">→ {keyText(content, id)}</span>
                </p>
                {canEdit && editing !== id && (
                  <button
                    type="button"
                    className={secondaryButtonClass}
                    disabled={editLocked}
                    onClick={() => {
                      setEditing(id)
                      setSavedNote(null)
                    }}
                  >
                    {c('editItem')}
                  </button>
                )}
              </div>
              {savedNote?.id === id && <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">{c('editSavedRevision', { n: savedNote.revision })}</p>}
              {editing === id ? (
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
                  <ItemCorrection
                    task={task}
                    id={id}
                    onCancel={() => setEditing(null)}
                    onSaved={(saved) => {
                      setEditing(null)
                      setSavedNote({ id, revision: saved.revision })
                      onSaved?.(saved)
                    }}
                  />
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{c('editFeedback')}</p>
                    {feedback}
                  </div>
                </div>
              ) : (
                feedback
              )}
            </article>
          )
        })}

      {list.length > 0 && (
        <section className={cardClass}>
          <h2 className="font-semibold text-foreground">{c('wholeTask')}</h2>
          <ul className="flex flex-wrap gap-2">
            {countBy(list.flatMap((r) => r.verdicts[TASK_REVIEW_KEY]?.reasons ?? [])).map(([r, n]) => (
              <li key={r} className="rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-800">
                {reasonLabel(r)} × {n}
              </li>
            ))}
          </ul>
          <ul className="space-y-2 text-sm">
            {list.map((r) => (
              <li key={r.reviewerId}>
                <span className="font-medium">{r.reviewerEmail}</span>
                {r.recommendation && <span className="ml-2 rounded bg-muted px-2 py-0.5 text-xs">{c(`rec_${r.recommendation}`)}</span>}
                {(r.verdicts[TASK_REVIEW_KEY]?.note || r.overallNote) && (
                  <p className="mt-0.5 text-muted-foreground">{[r.verdicts[TASK_REVIEW_KEY]?.note, r.overallNote].filter(Boolean).join(' — ')}</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
