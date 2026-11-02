import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Target } from 'lucide-react'
import PageHeading from '../components/PageHeading'
import GoalCard from '../components/Goals/GoalCard'
import GoalForm from '../components/Goals/GoalForm'
import GoalPlanEditor from '../components/Goals/GoalPlanEditor'
import { inputClass, labelClass, primaryButtonClass } from '../components/TeacherTools/ui'
import { useLanguage } from '../lib/i18n'
import { MAX_OPEN_GOALS, isOpenGoal, type LearnerGoal } from '../lib/goals'
import { fetchClassGoals, saveGoal } from '../lib/goalsApi'
import { fetchTeacherRoster, type RosterEntry } from '../lib/teacherApi'

/**
 * Teacher Toolkit › Goal setting (/teacher/tools/goals?student=…): a connected student's GROW
 * goals. Only the teacher sets them, together with the student; a saved goal is active at once
 * and the student sees it read-only on their My goals page.
 */
export default function TeacherGoalsPage() {
  const { t } = useLanguage()
  const [params, setParams] = useSearchParams()
  const [roster, setRoster] = useState<RosterEntry[] | null>(null)
  const [goalsByStudent, setGoalsByStudent] = useState<Map<string, LearnerGoal[]>>(new Map())
  const [error, setError] = useState(false)
  const [editing, setEditing] = useState<'new' | LearnerGoal | null>(null)
  const [planning, setPlanning] = useState<LearnerGoal | null>(null)

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
    setPlanning(null)
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
            <button type="button" disabled={!canAdd || !!editing || !!planning} onClick={() => setEditing('new')} className={primaryButtonClass}>
              {t('glNew')}
            </button>
          </div>
          {!canAdd && !editing && <p className="text-sm text-muted-foreground">{t('glLimitTeacher', { n: MAX_OPEN_GOALS })}</p>}

          {editing === 'new' && (
            <GoalForm
              key={`new-${student.studentId}`}
              withReality
              heading={t('glNewFor', { name })}
              submitLabel={t('glSave')}
              onSubmit={async (input) => done(await saveGoal(input, { studentId: student.studentId }))}
              onCancel={() => setEditing(null)}
            />
          )}
          {editing && editing !== 'new' && (
            <GoalForm
              key={editing.id}
              initial={editing}
              // An active goal is re-rated on its card; a pending one (from before) starts on save.
              withReality={editing.status === 'pending'}
              heading={t('glEditFor', { name })}
              submitLabel={t('glSave')}
              onSubmit={async (input) => done(await saveGoal(input, { id: editing.id }))}
              onCancel={() => setEditing(null)}
            />
          )}

          {planning && (
            <GoalPlanEditor
              key={planning.id}
              goal={planning}
              onSaved={(next) => {
                setGoals(next)
                setPlanning(null)
              }}
              onCancel={() => setPlanning(null)}
            />
          )}

          {!editing && !planning && goals.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center">
              <Target className="mx-auto h-8 w-8 text-[var(--teal-accent-strong)]" />
              <p className="mt-3 text-sm text-muted-foreground">{t('glTeacherNoGoals')}</p>
            </div>
          )}

          {!editing &&
            !planning &&
            goals.map((g) => (
              <GoalCard
                key={g.id}
                goal={g}
                audience="teacher"
                onGoals={setGoals}
                onEdit={() => setEditing(g)}
                onPlan={() => setPlanning(g)}
                canReopen={canAdd}
              />
            ))}
        </>
      )}
    </div>
  )
}
