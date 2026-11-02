import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchStudentDetail, StudentDetailAccessError, type StudentDetail } from '../lib/teacherApi'
import { getScenario } from '../data/scenarios'
import FeedbackCard from '../components/FeedbackCard'
import StudentWordListsBox from '../components/VocabLists/StudentWordListsBox'
import {
  CoursesPanel,
  MistakesPanel,
  ProgressHeader,
  PronunciationPanel,
  VocabularyPanel,
} from '../components/Progress/ProgressPanels'
import StudentGamificationCard from '../components/gamification/StudentGamificationCard'
import StudentTenseExplorerCard from '../components/TenseExplorerSettings/StudentTenseExplorerCard'
import StudentGoalsCard from '../components/Goals/StudentGoalsCard'

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
    return <div className="flex items-center justify-center py-24 text-slate-400">Loading...</div>
  }

  if (accessError) {
    return (
      <div className="max-w-2xl space-y-4">
        <p className="text-sm text-slate-600">You don't have access to this student's data.</p>
        <Link to="/teacher" className="text-sm text-indigo-600 hover:underline">
          ← Back to dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-6">

        {error && <p className="text-sm text-red-600">{error}</p>}

        {detail && (
          <>
            {studentId && <StudentGamificationCard studentId={studentId} />}

            {studentId && <StudentGoalsCard studentId={studentId} />}

            {/* Same sections and format as the student's own "Az én fejlődésem" page. */}
            <ProgressHeader
              cefrCurrent={detail.cefrCurrent}
              history={detail.cefrHistory}
              last30Days={detail.sessionCounts.last30Days}
              total={detail.sessionCounts.total}
              teacher
            />

            <MistakesPanel areas={detail.mistakeAreas} mix={detail.mistakeMix} teacher />

            <PronunciationPanel items={detail.pronunciation} teacher />

            <VocabularyPanel counts={detail.vocabulary} activity={detail.vocabActivity} teacher />

            {studentId && <StudentWordListsBox studentId={studentId} />}

            {studentId && <StudentTenseExplorerCard studentId={studentId} />}

            <CoursesPanel courses={detail.courses} teacher />

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
    </div>
  )
}
