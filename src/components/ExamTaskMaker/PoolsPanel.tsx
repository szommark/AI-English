import { useEffect, useState } from 'react'
import { Users } from 'lucide-react'
import { useExamTaskCopy } from '../../data/examTaskCopy'
import { deletePool, fetchPools, fetchTeachers, savePool } from '../../lib/examTaskApi'
import type { TeacherPool, TeacherRef } from '../../lib/examTasks'
import { cardClass, hintClass, inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from '../TeacherTools/ui'
import TeacherPicker from './TeacherPicker'

/** The creator's saved groups of testing teachers. */
export default function PoolsPanel() {
  const { c } = useExamTaskCopy()
  const [pools, setPools] = useState<TeacherPool[] | null>(null)
  const [teachers, setTeachers] = useState<TeacherRef[]>([])
  const [editing, setEditing] = useState<{ id?: string; name: string; memberIds: string[] } | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    Promise.all([fetchPools(), fetchTeachers()])
      .then(([p, t]) => {
        setPools(p)
        setTeachers(t)
      })
      .catch(() => setError(true))
  }, [])

  async function save() {
    if (!editing || !editing.name.trim()) return
    setBusy(true)
    try {
      const pool = await savePool({ name: editing.name, memberIds: editing.memberIds }, editing.id)
      setPools((list) => [...(list ?? []).filter((p) => p.id !== pool.id), pool].sort((a, b) => a.name.localeCompare(b.name)))
      setEditing(null)
    } catch {
      setError(true)
    } finally {
      setBusy(false)
    }
  }

  async function remove(id: string) {
    setBusy(true)
    try {
      await deletePool(id)
      setPools((list) => (list ?? []).filter((p) => p.id !== id))
      setEditing(null)
    } finally {
      setBusy(false)
    }
  }

  const emailOf = (id: string) => teachers.find((t) => t.id === id)?.email ?? '…'

  return (
    <section className={cardClass}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-semibold text-foreground">
          <Users className="h-5 w-5 text-[var(--teal-accent-strong)]" />
          {c('pools')}
        </h2>
        {!editing && (
          <button type="button" className={secondaryButtonClass} onClick={() => setEditing({ name: '', memberIds: [] })}>
            {c('newPool')}
          </button>
        )}
      </div>
      <p className={hintClass}>{c('poolsHint')}</p>
      {error && <p className="text-sm text-red-600">{c('loadError')}</p>}

      {pools && pools.length > 0 && (
        <ul className="divide-y divide-border">
          {pools.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
              <span className="min-w-0">
                <span className="font-medium text-foreground">{p.name}</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  {c('members', { n: p.memberIds.length })}: {p.memberIds.map(emailOf).join(', ')}
                </span>
              </span>
              <button type="button" className={secondaryButtonClass} onClick={() => setEditing({ id: p.id, name: p.name, memberIds: p.memberIds })}>
                {c('edit')}
              </button>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <div className="space-y-3 rounded-xl border border-border p-4">
          <label className={labelClass}>
            {c('poolName')}
            <input className={`${inputClass} mt-1`} value={editing.name} maxLength={80} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
          </label>
          {teachers.length === 0 ? (
            <p className={hintClass}>{c('noTeachers')}</p>
          ) : (
            <TeacherPicker teachers={teachers} selected={editing.memberIds} onChange={(memberIds) => setEditing({ ...editing, memberIds })} />
          )}
          <div className="flex flex-wrap gap-2">
            <button type="button" className={primaryButtonClass} disabled={busy || !editing.name.trim()} onClick={save}>
              {c('savePool')}
            </button>
            <button type="button" className={secondaryButtonClass} onClick={() => setEditing(null)}>
              {c('cancel')}
            </button>
            {editing.id && (
              <button type="button" className={`${secondaryButtonClass} ml-auto text-red-700`} disabled={busy} onClick={() => remove(editing.id as string)}>
                {c('deletePool')}
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
