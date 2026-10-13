import { useEffect, useState } from 'react'
import { deleteTeacherTenseSetting, fetchTeacherTenseSettings, saveTeacherTenseSetting } from '../../lib/tenseExplorerApi'
import type { TenseExplorerSetting } from '../../lib/tenseExplorerPolicy'
import TenseSetEditor, { OPEN_TENSE_SET, describeTenseSet, type TenseSetDraft } from './TenseSetEditor'

/** Student page (teacher view): this student's Tense Explorer override, or the class setting it falls back to. */
export default function StudentTenseExplorerCard({ studentId }: { studentId: string }) {
  const [loaded, setLoaded] = useState(false)
  const [classSetting, setClassSetting] = useState<TenseExplorerSetting | null>(null)
  const [override, setOverride] = useState<TenseExplorerSetting | null>(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTeacherTenseSettings(studentId)
      .then((s) => {
        setClassSetting(s.classSetting)
        setOverride(s.studentSetting ?? null)
        setLoaded(true)
      })
      .catch(() => setError("Couldn't load the Tense Explorer settings."))
  }, [studentId])

  async function handleSave(draft: TenseSetDraft) {
    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      setOverride(await saveTeacherTenseSetting({ ...draft, studentId }))
      setEditing(false)
      setMessage('Saved')
    } catch {
      setError("Couldn't save. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  async function handleUseClass() {
    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      await deleteTeacherTenseSetting(studentId)
      setOverride(null)
      setMessage('This student now uses the class setting')
    } catch {
      setError("Couldn't remove the student's setting. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
      <h2 className="text-sm font-medium text-slate-700">Tense Explorer</h2>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {loaded && (
        <>
          {override ? (
            <p className="text-sm text-slate-600">
              This student has their own setting: {describeTenseSet(override)}.
            </p>
          ) : (
            <p className="text-sm text-slate-600">
              Uses your class setting: {describeTenseSet(classSetting)}.
            </p>
          )}

          {override || editing ? (
            <TenseSetEditor
              key={override?.updatedAt ?? 'new'}
              initial={override ?? classSetting ?? OPEN_TENSE_SET}
              saving={saving}
              onSave={handleSave}
              onCancel={override ? undefined : () => setEditing(false)}
            />
          ) : (
            <button
              type="button"
              onClick={() => {
                setEditing(true)
                setMessage(null)
              }}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
            >
              Set tenses for this student
            </button>
          )}

          <div className="flex items-center gap-3">
            {override && (
              <button
                type="button"
                onClick={handleUseClass}
                disabled={saving}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                Use the class setting instead
              </button>
            )}
            {message && <span className="text-sm text-green-700">{message}</span>}
          </div>
        </>
      )}
    </div>
  )
}
