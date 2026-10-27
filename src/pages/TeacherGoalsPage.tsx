import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Target } from 'lucide-react'
import PageHeading from '../components/PageHeading'
import GoalCard from '../components/Goals/GoalCard'
import GoalForm from '../components/Goals/GoalForm'
import { inputClass, labelClass, primaryButtonClass } from '../components/TeacherTools/ui'
import { useLanguage } from '../lib/i18n'
import { MAX_OPEN_GOALS, isOpenGoal, type GoalInput, type LearnerGoal } from '../lib/goals'
import { fetchClassGoals, saveGoal } from '../lib/goalsApi'
import { fetchTeacherRoster, type RosterEntry } from '../lib/teacherApi'

const BLANK: GoalInput = { goalType: null, title: '', deadline: null, why: '', options: [], steps: [], daysPerWeek: null, rating: null }

/**
 * Teacher Toolkit › Goal setting (/teacher/tools/goals?student=…): a connected student's GROW
 * goals. The teacher sends a new goal, filled in (alone or with the student) or blank; the
 * student completes and confirms it on their My goals page.
 */
export default function TeacherGoalsPage() {
  const { t } = useLanguage()
  const [params, setParams] = useSearchParams()
  const [roster, setRoster] = useState<RosterEntry[] | null>(null)
  const [goalsByStudent, setGoalsByStudent] = useState<Map<string, LearnerGoal[]>>(new Map())
  const [error, setError] = useState(false)
  const [editing, setEditing] = useState<'new' | LearnerGoal | null>(null)

  useEffect(() => {
    Promise.all([fetchTeacherRoster(), fetchClassGoals()])
      .then(([r, g]) => {
        setRoster(r)
        setGoalsByStudent(new Map(g.map((s) => [s.studentId, s.goals])))
      })
      .catch(() => setError(true))
  }, [])

  const studentId = params.get('student') ?? roster?.[0]?.studentId ?? null
  const student = roster?.find((s) => s.studentId === studentId) ?? null
  const goals = (studentId && goalsByStudent.get(studentId)) || []
  const openCount = goals.filter(isOpenGoal).length
  const canAdd = openCount < MAX_OPEN_GOALS

  function setGoals(next: LearnerGoal[]) {
    if (!studentId) return
    setGoalsByStudent((m) => new Map(m).set(studentId, next))
  }

  function done(next: LearnerGoal[]) {
    setGoals(next)
    setEditing(null)
  }

  function pickStudent(id: string) {
    setEditing(null)
    setParams({ student: id }, { replace: true })
  }

  const name = student?.email ?? ''

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeading title={t('ttGoalsTitle')} subtitle={t('ttGoalsDesc')} />

      {error && <p className="text-sm text-red-600">{t('glLoadError')}</p>}
      {!error && roster === null && <p className="text-sm text-muted-foreground">{t('loading')}</p>}
      {roster?.length === 0 && <p className="text-sm text-muted-foreground">{t('glTeacherNoStudents')}</p>}

      {roster && roster.length > 0 && student && (
        <>
          <div className="flex flex-wrap items-end gap-3">
            <label className="min-w-0 flex-1 space-y-1">
              <span className={labelClass}>{t('tdTabStudents')}</span>
              <select value={student.studentId} onChange={(e) => pickStudent(e.target.value)} className={inputClass}>
                {roster.map((s) => {
                  const open = (goalsByStudent.get(s.studentId) ?? []).filter(isOpenGoal).length
                  return (
                    <option key={s.studentId} value={s.studentId}>
                      {s.email}
                      {open > 0 ? ` (${open})` : ''}
                    </option>
                  )
                })}
              </select>
            </label>
            <button type="button" disabled={!canAdd || !!editing} onClick={() => setEditing('new')} className={primaryButtonClass}>
              {t('glNew')}
            </button>
          </div>
          {!canAdd && !editing && <p className="text-sm text-muted-foreground">{t('glLimitTeacher', { n: MAX_OPEN_GOALS })}</p>}

          {editing === 'new' && (
            <GoalForm
              key={`new-${student.studentId}`}
              audience="teacher"
              withReality
              requireGoal={false}
              heading={t('glNewFor', { name })}
              submitLabel={t('glSendToStudent')}
              onSubmit={async (input) => done(await saveGoal(input, { studentId: student.studentId }))}
              extraAction={{
                label: t('glSendBlank'),
                hint: t('glSendBlankHint'),
                onClick: async () => done(await saveGoal(BLANK, { studentId: student.studentId })),
              }}
              onCancel={() => setEditing(null)}
            />
          )}
          {editing && editing !== 'new' && (
            <GoalForm
              key={editing.id}
              initial={editing}
              audience="teacher"
              // The Reality pre-fill only until the student confirms; after that the ratings are theirs.
              withReality={editing.status === 'pending'}
              requireGoal={editing.status !== 'pending'}
              heading={t('glEditFor', { name })}
              submitLabel={t('glSave')}
              onSubmit={async (input) => done(await saveGoal(input, { id: editing.id }))}
              onCancel={() => setEditing(null)}
            />
          )}

          {!editing && goals.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center">
              <Target className="mx-auto h-8 w-8 text-[var(--teal-accent-strong)]" />
              <p className="mt-3 text-sm text-muted-foreground">{t('glTeacherNoGoals')}</p>
            </div>
          )}

          {!editing &&
            goals.map((g) => <GoalCard key={g.id} goal={g} audience="teacher" onGoals={setGoals} onEdit={() => setEditing(g)} />)}
        </>
      )}
    </div>
  )
}
