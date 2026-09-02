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
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2.5">
            <div
              className="h-8 w-8 rounded-md flex items-center justify-center text-white font-bold"
              style={{ background: 'var(--gradient-hero)' }}
            >
              A
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-foreground">Teacher Dashboard</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">{user?.email}</span>
            <button onClick={signOut} className="text-primary hover:underline">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        <Link to="/" className="text-sm text-primary hover:underline">
          ← Back to home
        </Link>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : (
          <>
            <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
              <h2 className="font-medium text-foreground">Your invite code</h2>
              <p className="text-3xl font-mono tracking-widest text-primary">{code}</p>
              <button
                onClick={handleRegenerate}
                disabled={regenerating}
                className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-secondary disabled:opacity-40"
              >
                {regenerating ? 'Regenerating...' : 'Regenerate'}
              </button>
            </div>

            <div className="space-y-3">
              <h2 className="font-medium text-foreground">Students</h2>

              {students.length === 0 ? (
                <p className="text-sm text-muted-foreground">No students connected yet — share your code above</p>
              ) : (
                <div className="space-y-2">
                  {students.map((s) => (
                    <Link
                      key={s.studentId}
                      to={`/teacher/students/${s.studentId}`}
                      className="block rounded-lg border border-border bg-card px-4 py-3 hover:border-[var(--teal-accent)]/40"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground">{s.email}</span>
                        <span className="text-xs text-muted-foreground">
                          Connected since {new Date(s.connectedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
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
