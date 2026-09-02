import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchStudentDetail, StudentDetailAccessError, type StudentDetail } from '../lib/teacherApi'
import { getScenario } from '../data/scenarios'
import FeedbackCard from '../components/FeedbackCard'

const MODE_LABELS: Record<string, string> = {
  rehearsal: 'Rehearsal',
  test: 'Test Mode',
  tutor: 'Tutor Bot',
}

function sessionLabel(scenarioId: string | null, mode: string): string {
  if (scenarioId) {
    const scenario = getScenario(scenarioId)
    if (scenario) return `${scenario.title} — ${MODE_LABELS[mode] ?? mode}`
  }
  return MODE_LABELS[mode] ?? mode
}

export default function StudentProgressPage() {
  const { studentId } = useParams<{ studentId: string }>()
  const [detail, setDetail] = useState<StudentDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [accessError, setAccessError] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!studentId) return
    fetchStudentDetail(studentId)
      .then(setDetail)
      .catch((err) => {
        if (err instanceof StudentDetailAccessError) setAccessError(true)
        else setError('Failed to load this student. Please try again.')
      })
      .finally(() => setLoading(false))
  }, [studentId])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading...</div>
  }

  if (accessError) {
    return (
      <div className="min-h-screen bg-slate-50">
        <main className="max-w-2xl mx-auto px-4 py-8 space-y-4">
          <p className="text-sm text-slate-600">You don't have access to this student's data.</p>
          <Link to="/teacher" className="text-sm text-indigo-600 hover:underline">
            ← Back to dashboard
          </Link>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        <Link to="/teacher" className="text-sm text-indigo-600 hover:underline">
          ← Back to dashboard
        </Link>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {detail && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
                <h2 className="text-sm font-medium text-slate-700">Mistake categories</h2>
                {detail.mistakes.length === 0 ? (
                  <p className="text-sm text-slate-400">No mistakes recorded yet.</p>
                ) : (
                  <ul className="text-sm text-slate-600 space-y-1">
                    {detail.mistakes.map((m) => (
                      <li key={m.category} className="flex items-center justify-between">
                        <span>{m.category.replace(/_/g, ' ')}</span>
                        <span className="text-slate-400">{m.occurrences}x</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
                <h2 className="text-sm font-medium text-slate-700">Vocabulary</h2>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>New</span>
                  <span className="text-slate-400">{detail.vocabulary.new}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Practicing</span>
                  <span className="text-slate-400">{detail.vocabulary.practicing}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Mastered</span>
                  <span className="text-slate-400">{detail.vocabulary.mastered}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
              <h2 className="text-sm font-medium text-slate-700">CEFR history</h2>
              {detail.cefrHistory.length === 0 ? (
                <p className="text-sm text-slate-400">No CEFR estimates recorded yet.</p>
              ) : (
                <p className="text-sm text-slate-600">
                  {detail.cefrHistory.map((c, i) => (
                    <span key={i}>
                      {i > 0 && ' → '}
                      {c.cefrLevel}
                      <span className="text-slate-400"> ({new Date(c.createdAt).toLocaleDateString()})</span>
                    </span>
                  ))}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <h2 className="text-sm font-medium text-slate-700">Sessions</h2>

              {detail.sessions.length === 0 ? (
                <p className="text-sm text-slate-500">No sessions yet.</p>
              ) : (
                detail.sessions.map((s) => (
                  <div key={s.id} className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">{sessionLabel(s.scenarioId, s.mode)}</span>
                      <span className="text-slate-400">{new Date(s.createdAt).toLocaleString()}</span>
                    </div>
                    <FeedbackCard feedback={s.feedback} />
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
