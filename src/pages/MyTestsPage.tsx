import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpenText, CheckCircle2, Headphones } from 'lucide-react'
import PageHeading from '../components/PageHeading'
import { useCompCopy } from '../data/compTestCopy'
import { fetchMyTests } from '../lib/compTestApi'
import type { MyCompTestSummary } from '../lib/compTests'

/** /my-tests: the reading and listening tests the learner's teachers assigned, to do and done. */
export default function MyTestsPage() {
  const { c, lang } = useCompCopy()
  const [tests, setTests] = useState<MyCompTestSummary[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetchMyTests()
      .then(setTests)
      .catch(() => setError(true))
  }, [])

  const date = (iso: string) => new Date(iso).toLocaleDateString(lang)
  const todo = tests?.filter((t) => !t.submittedAt) ?? []
  const done = tests?.filter((t) => t.submittedAt) ?? []

  const row = (t: MyCompTestSummary) => {
    const Icon = t.skill === 'reading' ? BookOpenText : Headphones
    return (
      <li key={t.assignmentId}>
        <Link to={`/my-tests/${t.assignmentId}`} className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 hover:border-[var(--teal-accent-border)]">
          <Icon className="h-5 w-5 shrink-0 text-[var(--teal-accent-strong)]" />
          <span className="min-w-0 flex-1">
            <span className="block font-medium text-foreground">{t.title}</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              {c(`skill_${t.skill}`)} · {t.level} · {c('fromTeacher', { email: t.teacherEmail })}
              {!t.submittedAt && t.dueAt ? ` · ${c('dueOn', { date: date(t.dueAt) })}` : ''}
            </span>
          </span>
          {t.submittedAt ? (
            <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              {t.score}/{t.max}
            </span>
          ) : (
            <span className="shrink-0 rounded-lg bg-[var(--teal-accent-soft)] px-3 py-1.5 text-sm font-semibold text-[var(--teal-accent-strong)]">{c('start')}</span>
          )}
        </Link>
      </li>
    )
  }

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeading title={c('myTestsTitle')} subtitle={c('myTestsSubtitle')} />
      {error && <p className="text-sm text-red-600">{c('loadError')}</p>}
      {!error && !tests && <p className="text-sm text-muted-foreground">{c('loading')}</p>}
      {tests && tests.length === 0 && <p className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">{c('myTestsEmpty')}</p>}
      {todo.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-semibold text-foreground">{c('toDo')}</h2>
          <ul className="space-y-2">{todo.map(row)}</ul>
        </section>
      )}
      {done.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-semibold text-foreground">{c('done')}</h2>
          <ul className="space-y-2">{done.map(row)}</ul>
        </section>
      )}
    </div>
  )
}
