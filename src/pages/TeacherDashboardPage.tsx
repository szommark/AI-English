import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { fetchInviteCode, regenerateInviteCode, fetchTeacherRoster, type RosterEntry } from '../lib/teacherApi'

export default function TeacherDashboardPage() {
  const { signOut, user } = useAuth()
  const [code, setCode] = useState<string | null>(null)
  const [regenerating, setRegenerating] = useState(false)
  const [students, setStudents] = useState<RosterEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([fetchInviteCode(), fetchTeacherRoster()])
      .then(([fetchedCode, roster]) => {
        setCode(fetchedCode)
        setStudents(roster)
      })
      .catch(() => setError('Failed to load your dashboard. Please try again.'))
      .finally(() => setLoading(false))
  }, [])

  async function handleRegenerate() {
    if (!window.confirm('Regenerate your invite code? The old code will stop working immediately.')) return
    setRegenerating(true)
    try {
      const newCode = await regenerateInviteCode()
      setCode(newCode)
    } catch {
      setError('Failed to regenerate your invite code. Please try again.')
    } finally {
      setRegenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-slate-50 to-slate-50">
      <header className="max-w-4xl mx-auto flex items-center justify-between px-4 py-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Teacher Dashboard</h1>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-slate-500">{user?.email}</span>
          <button onClick={signOut} className="text-indigo-600 hover:underline">
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pb-12 space-y-8">
        <Link to="/" className="text-sm text-indigo-600 hover:underline">
          ← Back to home
        </Link>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {loading ? (
          <p className="text-sm text-slate-400">Loading...</p>
        ) : (
          <>
            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
              <h2 className="font-medium text-slate-700">Your invite code</h2>
              <p className="text-3xl font-mono tracking-widest text-indigo-700">{code}</p>
              <button
                onClick={handleRegenerate}
                disabled={regenerating}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                {regenerating ? 'Regenerating...' : 'Regenerate'}
              </button>
            </div>

            <div className="space-y-3">
              <h2 className="font-medium text-slate-700">Students</h2>

              {students.length === 0 ? (
                <p className="text-sm text-slate-500">No students connected yet — share your code above</p>
              ) : (
                <div className="space-y-2">
                  {students.map((s) => (
                    <Link
                      key={s.studentId}
                      to={`/teacher/students/${s.studentId}`}
                      className="block rounded-lg border border-slate-200 bg-white px-4 py-3 hover:border-indigo-300"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-800">{s.email}</span>
                        <span className="text-xs text-slate-400">
                          Connected since {new Date(s.connectedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-slate-500">
                        {s.sessionCount} session{s.sessionCount === 1 ? '' : 's'}
                        {s.lastSessionAt && ` · last active ${new Date(s.lastSessionAt).toLocaleDateString()}`}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
