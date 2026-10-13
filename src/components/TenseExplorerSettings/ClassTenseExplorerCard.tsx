import { useEffect, useState } from 'react'
import { deleteTeacherTenseSetting, fetchTeacherTenseSettings, saveTeacherTenseSetting } from '../../lib/tenseExplorerApi'
import type { TenseExplorerSetting } from '../../lib/tenseExplorerPolicy'
import TenseSetEditor, { OPEN_TENSE_SET, describeTenseSet, type TenseSetDraft } from './TenseSetEditor'

/** Teacher dashboard: the class-wide Tense Explorer setting (per-student overrides live on each student's page). */
export default function ClassTenseExplorerCard() {
  const [loaded, setLoaded] = useState(false)
  const [setting, setSetting] = useState<TenseExplorerSetting | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTeacherTenseSettings()
      .then((s) => {
        setSetting(s.classSetting)
        setLoaded(true)
      })
      .catch(() => setError("Couldn't load the Tense Explorer settings."))
  }, [])

  async function handleSave(draft: TenseSetDraft) {
    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      setSetting(await saveTeacherTenseSetting(draft))
      setMessage('Saved')
    } catch {
      setError("Couldn't save. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  async function handleReset() {
    if (!window.confirm('Reset the class setting? Students without their own setting will see all tenses again.')) return
    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      await deleteTeacherTenseSetting()
      setSetting(null)
      setMessage('Reset')
    } catch {
      setError("Couldn't reset. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
      <div>
        <h2 className="font-medium text-foreground">Tense Explorer</h2>
        <p className="text-sm text-muted-foreground">
          Choose which tenses your students see in Grammar Coach → Tense explorer. To give one student a different set, open
          their page from the list above.
        </p>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {loaded && (
        <>
          <p className="text-xs text-muted-foreground">
            {setting ? 'Current class setting: ' : 'Not set yet. Students see '}
            {describeTenseSet(setting)}.
          </p>
          <TenseSetEditor key={setting?.updatedAt ?? 'open'} initial={setting ?? OPEN_TENSE_SET} saving={saving} onSave={handleSave} />
          <div className="flex items-center gap-3">
            {setting && (
              <button
                type="button"
                onClick={handleReset}
                disabled={saving}
                className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-secondary disabled:opacity-40"
              >
                Reset to all tenses
              </button>
            )}
            {message && <span className="text-sm text-green-700">{message}</span>}
          </div>
        </>
      )}
    </div>
  )
}
