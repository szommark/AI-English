import { useEffect, useState } from 'react'
import PageHeading from '../components/PageHeading'
import { useLanguage, type MessageKey } from '../lib/i18n'
import { Link, useSearchParams } from 'react-router-dom'
import { fetchInviteCode, regenerateInviteCode, fetchTeacherRoster, type RosterEntry } from '../lib/teacherApi'
import TeacherToolsTab from '../components/TeacherTools/TeacherToolsTab'
import ClassSummaryCard, { StudentGamificationLine } from '../components/gamification/ClassSummaryCard'
import ChallengesSection from '../components/gamification/ChallengesSection'
import ClassSettingsCard from '../components/gamification/ClassSettingsCard'
import ClassTenseExplorerCard from '../components/TenseExplorerSettings/ClassTenseExplorerCard'
import { fetchClassGamification } from '../lib/gamificationApi'
import type { ClassGamification } from '../lib/gamification/types'

type DashboardTab = 'students' | 'tools'

const TABS: { tab: DashboardTab; label: MessageKey }[] = [
  { tab: 'students', label: 'tdTabStudents' },
  { tab: 'tools', label: 'teacherToolkit' },
]

/** /teacher: the class (default tab) and the Teacher Toolkit (?tab=tools) as tabs. */
export default function TeacherDashboardPage() {
  const { t } = useLanguage()
  const [searchParams, setSearchParams] = useSearchParams()
  const tab: DashboardTab = searchParams.get('tab') === 'tools' ? 'tools' : 'students'
  const [code, setCode] = useState<string | null>(null)
  const [regenerating, setRegenerating] = useState(false)
  const [students, setStudents] = useState<RosterEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [classGamification, setClassGamification] = useState<ClassGamification | null>(null)

  useEffect(() => {
    Promise.all([fetchInviteCode(), fetchTeacherRoster()])
      .then(([fetchedCode, roster]) => {
        setCode(fetchedCode)
        setStudents(roster)
      })
      .catch(() => setError('Failed to load your dashboard. Please try again.'))
      .finally(() => setLoading(false))
    // Optional extra: the roster works without it.
    fetchClassGamification()
      .then(setClassGamification)
      .catch((err) => console.error('Failed to load class gamification', err))
  }, [])

  const gamificationByStudent = new Map(classGamification?.students.map((s) => [s.studentId, s]) ?? [])

  function handleTabChange(next: DashboardTab) {
    if (next === tab) return
    const params = new URLSearchParams(searchParams)
    if (next === 'students') params.delete('tab')
    else params.set('tab', next)
    setSearchParams(params, { replace: true })
  }

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
    <div className="max-w-4xl space-y-8">
      <PageHeading title={t('teacherDashboard')} />

      <div className="inline-flex max-w-full flex-wrap rounded-lg bg-secondary p-0.5" role="group">
        {TABS.map(({ tab: value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => handleTabChange(value)}
            aria-pressed={tab === value}
            className={`rounded-md px-3 py-1.5 text-sm sm:px-4 ${
              tab === value ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t(label)}
          </button>
        ))}
      </div>

      {tab === 'tools' && <TeacherToolsTab />}

      {tab === 'students' && (
        <>
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

              {classGamification && <ClassSummaryCard summary={classGamification.summary} />}

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
                        className="block rounded-lg border border-border bg-card px-4 py-3 hover:border-[var(--teal-accent-border)]"
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
                        <StudentGamificationLine student={gamificationByStudent.get(s.studentId)} />
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <ChallengesSection students={students} />

              <ClassSettingsCard />

              <ClassTenseExplorerCard />
            </>
          )}
        </>
      )}
    </div>
  )
}
