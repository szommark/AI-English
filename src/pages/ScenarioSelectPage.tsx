import { useEffect, useState } from 'react'
import { scenarios } from '../data/scenarios'
import { fetchCapStatus } from '../lib/api'
import type { CapStatus } from '../lib/types'
import DailyCapBanner from '../components/DailyCapBanner'
import ScenarioCard from '../components/ScenarioCard'
import { useAuth } from '../lib/AuthContext'

export default function ScenarioSelectPage() {
  const { signOut, user } = useAuth()
  const [cap, setCap] = useState<CapStatus | null>(null)

  useEffect(() => {
    fetchCapStatus()
      .then(setCap)
      .catch(() => setCap(null))
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-slate-50 to-slate-50">
      <header className="max-w-4xl mx-auto flex items-center justify-between px-4 py-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">AI-English</h1>
          <p className="text-sm text-slate-500">Holiday English — pick a scenario</p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-slate-500">{user?.email}</span>
          <button onClick={signOut} className="text-indigo-600 hover:underline">
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pb-12 space-y-6">
        {cap && !cap.allowed && <DailyCapBanner resetAt={cap.resetAt} />}
        {cap && cap.allowed && (
          <p className="text-sm text-slate-500">{cap.remaining} practice session(s) left today.</p>
        )}

        <div className="grid gap-6 sm:grid-cols-2">
          {scenarios.map((s) => (
            <ScenarioCard key={s.id} scenario={s} />
          ))}
        </div>
      </main>
    </div>
  )
}
