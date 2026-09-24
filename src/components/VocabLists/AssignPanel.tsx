import { useState } from 'react'
import { useLanguage } from '../../lib/i18n'
import { assignVocabList } from '../../lib/vocabListsApi'
import type { RosterEntry } from '../../lib/teacherApi'
import type { VocabAssignResult } from '../../lib/vocab'

/**
 * Assign a saved list to connected students, individually or "all current students"
 * (a snapshot of the roster now — later connections aren't added; design §5.1).
 */
export default function AssignPanel({
  listId,
  roster,
  assignedIds,
  blockedReason,
  onAssigned,
}: {
  listId: string
  roster: RosterEntry[]
  assignedIds: Set<string>
  /** Shown instead of allowing assignment (e.g. unsaved changes). */
  blockedReason: string | null
  onAssigned: () => void
}) {
  const { t } = useLanguage()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [all, setAll] = useState(false)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<VocabAssignResult | null>(null)
  const [error, setError] = useState(false)

  function toggle(id: string) {
    setSelected((s) => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function assign() {
    setBusy(true)
    setError(false)
    setResult(null)
    try {
      const r = await assignVocabList(listId, all ? { allCurrentStudents: true } : { studentIds: [...selected] })
      setResult(r)
      setSelected(new Set())
      setAll(false)
      onAssigned()
    } catch (err) {
      console.error('Failed to assign word list', err)
      setError(true)
    } finally {
      setBusy(false)
    }
  }

  const canAssign = !blockedReason && !busy && (all || selected.size > 0)

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-card p-5">
      <h2 className="font-medium text-foreground">{t('vlAssignHeading')}</h2>

      {roster.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('vlNoStudents')}</p>
      ) : (
        <>
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <input type="checkbox" checked={all} onChange={(e) => setAll(e.target.checked)} className="h-4 w-4" />
            {t('vlAssignAll', { n: roster.length })}
          </label>
          <ul className="space-y-1 border-l-2 border-border pl-3">
            {roster.map((s) => (
              <li key={s.studentId}>
                <label className={`flex items-center gap-2 text-sm ${all ? 'text-muted-foreground' : 'text-foreground'}`}>
                  <input
                    type="checkbox"
                    checked={all || selected.has(s.studentId)}
                    disabled={all}
                    onChange={() => toggle(s.studentId)}
                    className="h-4 w-4"
                  />
                  <span className="min-w-0 break-all">{s.email}</span>
                  {assignedIds.has(s.studentId) && (
                    <span className="shrink-0 text-xs text-muted-foreground">({t('vlAlreadyAssigned')})</span>
                  )}
                </label>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">{t('vlAssignLaterNote')}</p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={assign}
              disabled={!canAssign}
              className="rounded-lg bg-[var(--teal-accent)] px-4 py-2 text-sm font-semibold text-primary hover:bg-[var(--teal-accent-strong)] disabled:opacity-40"
            >
              {busy ? t('vlAssigning') : t('vlAssign')}
            </button>
            {blockedReason && <span className="text-sm text-muted-foreground">{blockedReason}</span>}
          </div>
        </>
      )}

      {result && (
        <p className="text-sm text-emerald-700" role="status">
          {t('vlAssignResult', { n: result.studentCount, created: result.cardsCreated, upgraded: result.cardsUpgraded })}
        </p>
      )}
      {error && <p className="text-sm text-red-600">{t('vlAssignFailed')}</p>}
    </div>
  )
}
