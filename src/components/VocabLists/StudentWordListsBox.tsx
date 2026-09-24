import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../lib/i18n'
import { fetchStudentVocabLists } from '../../lib/vocabListsApi'
import type { VocabStudentListProgress } from '../../lib/vocab'
import ListProgress from './ListProgress'

/** Student detail page: this teacher's word lists assigned to the student, with progress. */
export default function StudentWordListsBox({ studentId }: { studentId: string }) {
  const { t } = useLanguage()
  const [lists, setLists] = useState<VocabStudentListProgress[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchStudentVocabLists(studentId)
      .then((l) => !cancelled && setLists(l))
      .catch(() => !cancelled && setError(true))
    return () => {
      cancelled = true
    }
  }, [studentId])

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4">
      <h2 className="text-sm font-medium text-foreground">{t('wordLists')}</h2>
      {error ? (
        <p className="text-sm text-red-600">{t('vlLoadFailed')}</p>
      ) : lists === null ? (
        <p className="text-sm text-muted-foreground">{t('loading')}</p>
      ) : lists.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('vlStudentNone')}</p>
      ) : (
        <ul className="space-y-3">
          {lists.map((l) => (
            <li key={l.listId} className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Link to={`/teacher/lists/${l.listId}`} className="text-sm font-medium text-foreground hover:underline">
                  {l.title}
                </Link>
                {l.cefrLevel && (
                  <span className="rounded-md bg-secondary px-1.5 py-0.5 text-xs text-secondary-foreground">{l.cefrLevel}</span>
                )}
                {l.archivedAt && <span className="text-xs text-muted-foreground">({t('vlArchivedTag')})</span>}
              </div>
              <ListProgress progress={l} completedAt={l.completedAt} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
