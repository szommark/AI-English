import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../lib/i18n'
import { fetchVocabLists } from '../../lib/vocabListsApi'
import type { VocabListSummary } from '../../lib/vocab'
import ProgressBar from './ProgressBar'

/** Teacher dashboard section: the teacher's word lists (design §5.1). */
export default function WordListsSection() {
  const { t } = useLanguage()
  const [archived, setArchived] = useState(false)
  const [lists, setLists] = useState<VocabListSummary[] | null>(null)
  const [error, setError] = useState(false)

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

  const tab = (value: boolean, label: string) => (
    <button
      type="button"
      onClick={() => setArchived(value)}
      aria-pressed={archived === value}
      className={`rounded-md px-3 py-1 text-sm ${
        archived === value ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      {label}
    </button>
  )

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-medium text-foreground">{t('wordLists')}</h2>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg bg-secondary p-0.5">
            {tab(false, t('vlActive'))}
            {tab(true, t('vlArchived'))}
          </div>
          <Link
            to="/teacher/lists/new"
            className="rounded-lg bg-[var(--teal-accent)] px-3 py-1.5 text-sm font-semibold text-primary hover:bg-[var(--teal-accent-strong)]"
          >
            + {t('vlNewList')}
          </Link>
        </div>
      </div>

      {error ? (
        <p className="text-sm text-red-600">{t('vlLoadFailed')}</p>
      ) : lists === null ? (
        <p className="text-sm text-muted-foreground">{t('loading')}</p>
      ) : lists.length === 0 ? (
        <p className="text-sm text-muted-foreground">{archived ? t('vlNoArchived') : t('vlNoLists')}</p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {lists.map((l) => {
            const total = l.termCount * l.assignedCount
            return (
              <Link
                key={l.id}
                to={`/teacher/lists/${l.id}`}
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
    </section>
  )
}
