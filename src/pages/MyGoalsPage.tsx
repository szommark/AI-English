import { useEffect, useState } from 'react'
import { Target } from 'lucide-react'
import PageHeading from '../components/PageHeading'
import GoalCard from '../components/Goals/GoalCard'
import GoalForm from '../components/Goals/GoalForm'
import { primaryButtonClass } from '../components/TeacherTools/ui'
import { useLanguage } from '../lib/i18n'
import { MAX_OPEN_GOALS, isOpenGoal, type LearnerGoal } from '../lib/goals'
import { fetchGoals, saveGoal } from '../lib/goalsApi'

/** "Céljaim" (/my-goals): the learner's GROW goals — set, confirm, tick, re-rate, close. */
export default function MyGoalsPage() {
  const { t } = useLanguage()
  const [goals, setGoals] = useState<LearnerGoal[] | null>(null)
  const [error, setError] = useState(false)
  /** 'new', or the goal being confirmed / edited. */
  const [editing, setEditing] = useState<'new' | LearnerGoal | null>(null)

  useEffect(() => {
    fetchGoals()
      .then(setGoals)
      .catch(() => setError(true))
  }, [])

  useEffect(() => {
    if (editing) window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [editing])

  const openCount = goals?.filter(isOpenGoal).length ?? 0
  const canAdd = openCount < MAX_OPEN_GOALS
  const open = goals?.filter(isOpenGoal) ?? []
  const closed = goals?.filter((g) => !isOpenGoal(g)) ?? []

  const newButton = (
    <button type="button" disabled={!canAdd || !!editing} onClick={() => setEditing('new')} className={primaryButtonClass}>
      {t('glNew')}
    </button>
  )

  function done(next: LearnerGoal[]) {
    setGoals(next)
    setEditing(null)
  }

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeading title={t('myGoals')} subtitle={t('glPageSubtitle')} actions={goals && newButton} />

      {error && <p className="text-sm text-red-600">{t('glLoadError')}</p>}
      {!error && goals === null && <p className="text-sm text-muted-foreground">{t('loading')}</p>}
      {goals && !canAdd && !editing && <p className="text-sm text-muted-foreground">{t('glLimit', { n: MAX_OPEN_GOALS })}</p>}

      {editing === 'new' && (
        <GoalForm
          audience="student"
          withReality
          requireGoal
          heading={t('glNew')}
          submitLabel={t('glSave')}
          onSubmit={async (input) => done(await saveGoal(input))}
          onCancel={() => setEditing(null)}
        />
      )}
      {editing && editing !== 'new' && (
        <GoalForm
          key={editing.id}
          initial={editing}
          audience="student"
          // Confirming a teacher's goal includes the self-assessment; an active goal is re-rated on its card.
          withReality={editing.status === 'pending'}
          requireGoal
          heading={editing.status === 'pending' ? t('glPendingTitle') : t('glEdit')}
          submitLabel={editing.status === 'pending' ? t('glConfirm') : t('glSave')}
          onSubmit={async (input) => done(await saveGoal(input, { id: editing.id }))}
          onCancel={() => setEditing(null)}
        />
      )}

      {!editing && goals?.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <Target className="mx-auto h-8 w-8 text-[var(--teal-accent-strong)]" />
          <h2 className="mt-3 font-semibold text-foreground">{t('glEmptyTitle')}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t('glEmptyBody')}</p>
          <div className="mt-4">{newButton}</div>
        </div>
      )}

      {!editing && (
        <>
          {open.map((g) => (
            <GoalCard key={g.id} goal={g} audience="student" onGoals={setGoals} onEdit={() => setEditing(g)} />
          ))}

          {closed.length > 0 && (
            <details className="space-y-3">
              <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                {t('glClosed')} ({closed.length})
              </summary>
              <div className="mt-3 space-y-4">
                {closed.map((g) => (
                  <GoalCard key={g.id} goal={g} audience="student" onGoals={setGoals} onEdit={() => setEditing(g)} canReopen={canAdd} />
                ))}
              </div>
            </details>
          )}
        </>
      )}
    </div>
  )
}
