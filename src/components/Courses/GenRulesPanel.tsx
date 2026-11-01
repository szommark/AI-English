import { useEffect, useState } from 'react'
import { deleteGenRule, fetchGenRules, updateGenRule } from '../../lib/courseApi'
import { GEN_RULE_MAX, type CourseGenRule, type GenRuleStatus } from '../../lib/courses'

const STATUS_LABEL: Record<GenRuleStatus, string> = { proposed: 'Proposed', approved: 'In use', rejected: 'Rejected' }
const STATUS_CLASS: Record<GenRuleStatus, string> = {
  proposed: 'bg-amber-100 text-amber-800',
  approved: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-slate-100 text-slate-600',
}
const REASON_LABEL: Record<string, string> = {
  answer_rejected: 'correct answer rejected',
  wrong_key: 'wrong key',
  faulty_logic: 'faulty logic',
  several_fit: 'more than one answer fits',
  unclear: 'unclear',
  typo: 'typo',
  other: 'other',
}

/**
 * /admin/courses: generator rules the AI drafted from repeated confirmed flags (3 with the same
 * reason in the same module kind). Approved rules go into the prompt of every new module of that kind.
 */
export default function GenRulesPanel() {
  const [rules, setRules] = useState<CourseGenRule[] | null>(null)
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  useEffect(() => {
    fetchGenRules()
      .then(setRules)
      .catch(() => setError('Failed to load the generator rules.'))
  }, [])

  async function act(id: string, action: () => Promise<CourseGenRule[]>) {
    setBusy(id)
    setError(null)
    try {
      setRules(await action())
      setDrafts((d) => {
        const { [id]: _done, ...rest } = d
        return rest
      })
    } catch {
      setError('That didn’t work. Please try again.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-slate-800">Generator rules from flags</h2>
      <p className="text-sm text-slate-500">
        When the AI confirms 3 student flags with the same reason in the same kind of module, it drafts a rule for the module writer. <strong>Approve</strong> puts it into the prompt of every new module of
        that kind; you can reword it first.
      </p>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {rules === null ? (
        !error && <p className="text-sm text-slate-500">Loading…</p>
      ) : rules.length === 0 ? (
        <p className="text-sm text-slate-500">No rules proposed yet.</p>
      ) : (
        <ul className="space-y-2">
          {rules.map((r) => {
            const draft = drafts[r.id] ?? r.rule
            const changed = draft.trim() !== r.rule
            return (
              <li key={r.id} className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className={`rounded px-2 py-0.5 font-medium ${STATUS_CLASS[r.status]}`}>{STATUS_LABEL[r.status]}</span>
                  <span>{r.kind ?? 'every module'}</span>
                  <span>· {REASON_LABEL[r.reason] ?? r.reason}</span>
                  <span>· from {r.flagCount} flags</span>
                  <span>· {new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                <textarea
                  className="min-h-[3.5rem] w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                  value={draft}
                  maxLength={GEN_RULE_MAX}
                  onChange={(e) => setDrafts((d) => ({ ...d, [r.id]: e.target.value }))}
                />
                <div className="flex flex-wrap gap-2 text-sm">
                  {changed && (
                    <button type="button" disabled={busy === r.id || !draft.trim()} className="rounded-md border border-slate-300 px-3 py-1 hover:bg-slate-50 disabled:opacity-50" onClick={() => void act(r.id, () => updateGenRule(r.id, { rule: draft.trim() }))}>
                      Save wording
                    </button>
                  )}
                  {r.status !== 'approved' && (
                    <button
                      type="button"
                      disabled={busy === r.id}
                      className="rounded-md bg-emerald-600 px-3 py-1 font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                      onClick={() => void act(r.id, () => updateGenRule(r.id, { status: 'approved', ...(changed && draft.trim() ? { rule: draft.trim() } : {}) }))}
                    >
                      Approve
                    </button>
                  )}
                  {r.status !== 'rejected' && (
                    <button type="button" disabled={busy === r.id} className="rounded-md border border-slate-300 px-3 py-1 hover:bg-slate-50 disabled:opacity-50" onClick={() => void act(r.id, () => updateGenRule(r.id, { status: 'rejected' }))}>
                      {r.status === 'approved' ? 'Stop using' : 'Reject'}
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={busy === r.id}
                    className="ml-auto rounded-md px-3 py-1 text-red-600 hover:bg-red-50 disabled:opacity-50"
                    onClick={() => window.confirm('Delete this rule?') && void act(r.id, () => deleteGenRule(r.id))}
                  >
                    Delete
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
