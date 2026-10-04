import { useEffect, useState } from 'react'
import { fetchClassSettings, saveClassSettings } from '../../lib/gamificationApi'
import type { TeacherClassSettings } from '../../lib/gamification/types'

/**
 * Teacher dashboard: class comparison and whether students may join the public leaderboard
 * (design §8.1, §8.3). English, like the teacher pages. Each switch saves at once.
 */
export default function ClassSettingsCard() {
  const [settings, setSettings] = useState<TeacherClassSettings | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchClassSettings()
      .then(setSettings)
      .catch(() => setSettings(null))
  }, [])

  if (!settings) return null

  async function save(next: { classComparison: boolean; leaderboardAllowed: boolean }) {
    setSaving(true)
    setError(null)
    try {
      setSettings(await saveClassSettings(next))
    } catch {
      setError("Couldn't save. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const current = { classComparison: settings.classComparison, leaderboardAllowed: settings.leaderboardAllowed }
  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
      <h2 className="font-medium text-foreground">Class rankings</h2>
      <label className="flex items-start gap-3 text-sm text-foreground">
        <input
          type="checkbox"
          checked={settings.classComparison}
          disabled={saving}
          onChange={(e) => save({ ...current, classComparison: e.target.checked })}
          className="mt-1"
        />
        <span>
          <span className="font-medium">Class comparison</span>
          <span className="block text-muted-foreground">
            Your students see a weekly ranking of the class by XP from their own practice. Classmates appear by their leaderboard
            nickname, or as “Osztálytárs 1, 2…” — never by name or email.
          </span>
          {!settings.globalClassComparison && <span className="block text-xs text-amber-700">Switched off by the admin for now; your choice applies once it’s on.</span>}
        </span>
      </label>
      <label className="flex items-start gap-3 text-sm text-foreground">
        <input
          type="checkbox"
          checked={settings.leaderboardAllowed}
          disabled={saving}
          onChange={(e) => save({ ...current, leaderboardAllowed: e.target.checked })}
          className="mt-1"
        />
        <span>
          <span className="font-medium">Allow the public leaderboard</span>
          <span className="block text-muted-foreground">
            Students aged 16 or over may join the app-wide weekly leaderboard under a nickname. Turn this off for a class of younger
            students: they then can’t join, and anyone already on it is hidden while connected to you.
          </span>
          {!settings.globalLeaderboard && <span className="block text-xs text-amber-700">The public leaderboard is switched off by the admin for now.</span>}
        </span>
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
