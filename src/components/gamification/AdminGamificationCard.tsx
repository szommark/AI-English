import { useEffect, useState } from 'react'
import { fetchAdminGamification, resetLeaderboardNickname, saveAdminGamification } from '../../lib/gamificationApi'
import type { AdminGamificationSettings } from '../../lib/gamification/types'

/**
 * Admin overview: the Phase 5 switches (the kill switch, design §8.2) and nickname moderation.
 * Both features ship switched off; the public leaderboard should only be turned on after the
 * legal check of its opt-in wording (design §8.3).
 */
export default function AdminGamificationCard() {
  const [data, setData] = useState<AdminGamificationSettings | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAdminGamification()
      .then(setData)
      .catch(() => setError("Couldn't load the gamification settings."))
  }, [])

  async function run(action: () => Promise<AdminGamificationSettings>) {
    setBusy(true)
    setError(null)
    try {
      setData(await action())
    } catch {
      setError("Couldn't save. Please try again.")
    } finally {
      setBusy(false)
    }
  }

  if (!data) return error ? <p className="text-sm text-red-600">{error}</p> : null

  return (
    <section className="space-y-3">
      <h2 className="font-medium text-slate-700">Gamification: rankings</h2>
      <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
        <label className="flex items-start gap-3 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={data.classComparison}
            disabled={busy}
            onChange={(e) => void run(() => saveAdminGamification({ classComparison: e.target.checked }))}
            className="mt-1"
          />
          <span>
            <span className="font-medium">Class comparison</span>
            <span className="block text-slate-500">Lets teachers turn on a weekly class ranking for their students.</span>
          </span>
        </label>
        <label className="flex items-start gap-3 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={data.publicLeaderboard}
            disabled={busy}
            onChange={(e) => {
              if (e.target.checked && !window.confirm('Turn on the public leaderboard for everyone? Only do this once the opt-in wording and the under-16 handling have been checked legally.')) return
              void run(() => saveAdminGamification({ publicLeaderboard: e.target.checked }))
            }}
            className="mt-1"
          />
          <span>
            <span className="font-medium">Public leaderboard</span>
            <span className="block text-slate-500">
              Opt-in, nickname only, 16+ self-declaration. Turning it off hides it at once; members stay opted in for when it returns.
            </span>
          </span>
        </label>

        <div className="space-y-2 border-t border-slate-100 pt-3">
          <h3 className="text-sm font-medium text-slate-700">On the leaderboard ({data.participants.length})</h3>
          {data.participants.length === 0 ? (
            <p className="text-sm text-slate-400">Nobody yet.</p>
          ) : (
            <ul className="space-y-1 text-sm text-slate-600">
              {data.participants.map((p) => (
                <li key={p.userId} className="flex flex-wrap items-center justify-between gap-2">
                  <span className="min-w-0">
                    <span className="font-medium text-slate-800">{p.nickname}</span> · {p.email}
                  </span>
                  <button
                    disabled={busy}
                    onClick={() => window.confirm(`Remove “${p.nickname}” from the leaderboard and clear the nickname?`) && void run(() => resetLeaderboardNickname(p.userId))}
                    className="text-xs text-red-600 hover:underline disabled:opacity-40"
                  >
                    Remove nickname
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </section>
  )
}
