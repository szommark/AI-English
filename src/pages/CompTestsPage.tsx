import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpenText, Headphones } from 'lucide-react'
import PageHeading from '../components/PageHeading'
import { primaryButtonClass } from '../components/TeacherTools/ui'
import { useCompCopy } from '../data/compTestCopy'
import { fetchCompTests } from '../lib/compTestApi'
import type { CompTestSummary } from '../lib/compTests'

/** /teacher/tools/comp-tests: the teacher's reading and listening comprehension tests. */
export default function CompTestsPage() {
  const { c, lang } = useCompCopy()
  const [tests, setTests] = useState<CompTestSummary[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetchCompTests()
      .then(setTests)
      .catch(() => setError(true))
  }, [])

  const date = (iso: string) => new Date(iso).toLocaleDateString(lang)

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeading
        title={c('pageTitle')}
        subtitle={c('pageSubtitle')}
        actions={
          <Link to="/teacher/tools/comp-tests/new" className={primaryButtonClass}>
            {c('newTest')}
          </Link>
        }
      />
      <Link to="/teacher?tab=tools" className="inline-block text-sm text-muted-foreground hover:underline">
        {c('backToToolkit')}
      </Link>

      {error && <p className="text-sm text-red-600">{c('loadError')}</p>}
      {!error && !tests && <p className="text-sm text-muted-foreground">{c('loading')}</p>}
      {tests && tests.length === 0 && <p className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">{c('empty')}</p>}

      {tests && tests.length > 0 && (
        <ul className="space-y-2">
          {tests.map((t) => {
            const Icon = t.skill === 'reading' ? BookOpenText : Headphones
            return (
              <li key={t.id}>
                <Link to={`/teacher/tools/comp-tests/${t.id}`} className="flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-3 hover:border-[var(--teal-accent-border)]">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[var(--teal-accent-strong)]" />
                  <span className="min-w-0">
                    <span className="block font-medium text-foreground">{t.title}</span>
                    <span className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span>
                        {c(`skill_${t.skill}`)} · {t.level} · {c('itemCount', { n: t.itemCount })}
                      </span>
                      <span>{t.assignedCount ? c('submittedCount', { n: t.submittedCount, m: t.assignedCount }) : c('notAssigned')}</span>
                      <span>{c('updated', { date: date(t.updatedAt) })}</span>
                    </span>
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
