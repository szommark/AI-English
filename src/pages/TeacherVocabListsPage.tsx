import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import PageHeading from '../components/PageHeading'
import ProgressBar from '../components/VocabLists/ProgressBar'
import { inputClass, primaryButtonClass } from '../components/TeacherTools/ui'
import { useLanguage } from '../lib/i18n'
import { fetchVocabLists } from '../lib/vocabListsApi'
import { fetchTeacherRoster, type RosterEntry } from '../lib/teacherApi'
import type { VocabListSummary } from '../lib/vocab'

/** `?student=` value for lists nobody is assigned to. */
const UNASSIGNED = 'none'

/**
 * The teacher's word lists (/teacher/tools/vocab, design §5.1), filterable by the student
 * they are assigned to. The filter lives in the URL so it survives opening a list.
 */
export default function TeacherVocabListsPage() {
  const { t } = useLanguage()
  const [searchParams, setSearchParams] = useSearchParams()
  const archived = searchParams.get('archived') === 'true'
  const student = searchParams.get('student') ?? ''
  const [lists, setLists] = useState<VocabListSummary[] | null>(null)
  const [error, setError] = useState(false)
  const [roster, setRoster] = useState<RosterEntry[]>([])

  useEffect(() => {
    let cancelled = false
    setLists(null)
    setError(false)
    fetchVocabLists(archived)
      .then((l) => !cancelled && setLists(l))
      .catch(() => !cancelled && setError(true))
    return () => {
      cancelled = true
    }
  }, [archived])

  useEffect(() => {
    // Only feeds the filter: the lists work without it.
    fetchTeacherRoster()
      .then((r) => setRoster([...r].sort((a, b) => a.email.localeCompare(b.email))))
      .catch((err) => console.error('Failed to load roster', err))
  }, [])

  function setParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams)
    if (value) params.set(key, value)
    else params.delete(key)
    setSearchParams(params, { replace: true })
  }

  const shown = useMemo(() => {
    if (!lists || !student) return lists
    if (student === UNASSIGNED) return lists.filter((l) => l.assignedStudentIds.length === 0)
    return lists.filter((l) => l.assignedStudentIds.includes(student))
  }, [lists, student])

  const emailById = useMemo(() => new Map(roster.map((s) => [s.studentId, s.email])), [roster])

  const tab = (value: boolean, label: string) => (
    <button
      type="button"
      onClick={() => setParam('archived', value ? 'true' : null)}
      aria-pressed={archived === value}
      className={`rounded-md px-3 py-1 text-sm ${
        archived === value ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      {label}
    </button>
  )

  const newButton = (
    <Link to="/teacher/tools/vocab/new" className={primaryButtonClass}>
      + {t('vlNewList')}
    </Link>
  )

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeading title={t('wordLists')} subtitle={t('ttVocabDesc')} actions={newButton} />

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg bg-secondary p-0.5">
          {tab(false, t('vlActive'))}
          {tab(true, t('vlArchived'))}
        </div>
        <label className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
          <span className="shrink-0">{t('vlFilterStudent')}</span>
          <select
            value={student}
            onChange={(e) => setParam('student', e.target.value || null)}
            className={`${inputClass} w-auto min-w-0 max-w-[16rem] py-1.5`}
          >
            <option value="">{t('vlFilterAll')}</option>
            <option value={UNASSIGNED}>{t('vlFilterNone')}</option>
            {roster.map((s) => (
              <option key={s.studentId} value={s.studentId}>
                {s.email}
              </option>
            ))}
          </select>
        </label>
        {student && lists && shown && (
          <span className="text-sm text-muted-foreground">{t('vlFilterCount', { n: shown.length, total: lists.length })}</span>
        )}
      </div>

      {error ? (
        <p className="text-sm text-red-600">{t('vlLoadFailed')}</p>
      ) : lists === null || shown === null ? (
        <p className="text-sm text-muted-foreground">{t('loading')}</p>
      ) : lists.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <BookOpen className="mx-auto h-8 w-8 text-[var(--teal-accent-strong)]" />
          <p className="mt-3 text-sm text-muted-foreground">{archived ? t('vlNoArchived') : t('vlNoLists')}</p>
          {!archived && <div className="mt-4">{newButton}</div>}
        </div>
      ) : shown.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('vlFilterEmpty')}</p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {shown.map((l) => {
            const total = l.termCount * l.assignedCount
            const names = l.assignedStudentIds.map((id) => emailById.get(id)).filter(Boolean)
            return (
              <Link
                key={l.id}
                to={`/teacher/tools/vocab/${l.id}`}
                className="block space-y-2 rounded-2xl border border-border bg-card px-4 py-3 hover:border-[var(--teal-accent-border)]"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="min-w-0 break-words font-medium text-foreground">{l.title}</span>
                  {l.cefrLevel && (
                    <span className="shrink-0 rounded-md bg-secondary px-1.5 py-0.5 text-xs font-medium text-secondary-foreground">
                      {l.cefrLevel}
                    </span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t('vlWordCount', { n: l.termCount })} ·{' '}
                  {l.assignedCount > 0 ? t('vlStudentCount', { n: l.assignedCount }) : t('vlNotAssigned')}
                </div>
                {names.length > 0 && <div className="break-all text-xs text-muted-foreground">{names.join(', ')}</div>}
                {l.assignedCount > 0 && (
                  <div className="space-y-1">
                    <ProgressBar value={l.learned} max={total} />
                    <div className="flex flex-wrap justify-between gap-x-3 text-xs text-muted-foreground">
                      <span>{t('vlLearnedSummary', { learned: l.learned, total })}</span>
                      <span>{t('vlCompletedSummary', { done: l.completedCount, n: l.assignedCount })}</span>
                    </div>
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
