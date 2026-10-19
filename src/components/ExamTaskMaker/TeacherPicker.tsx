import type { TeacherRef } from '../../lib/examTasks'

/** A checkbox list of the app's other teachers (by email). */
export default function TeacherPicker({
  teachers,
  selected,
  onChange,
  statusOf,
}: {
  teachers: TeacherRef[]
  selected: string[]
  onChange: (ids: string[]) => void
  /** Optional text after a teacher (e.g. "tested"). */
  statusOf?: (id: string) => React.ReactNode
}) {
  const toggle = (id: string) => onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id])
  return (
    <ul className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
      {teachers.map((t) => (
        <li key={t.id}>
          <label className="flex min-h-9 cursor-pointer items-center gap-2 rounded px-2 text-sm hover:bg-muted">
            <input type="checkbox" checked={selected.includes(t.id)} onChange={() => toggle(t.id)} className="h-4 w-4" />
            <span className="min-w-0 flex-1 truncate text-foreground">{t.email}</span>
            {statusOf?.(t.id)}
          </label>
        </li>
      ))}
    </ul>
  )
}
