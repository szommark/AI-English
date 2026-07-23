import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { scenarios } from '../data/scenarios'
import { fetchCapStatus } from '../lib/api'
import type { CapStatus } from '../lib/types'
import DailyCapBanner from '../components/DailyCapBanner'
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
    <div className="min-h-screen bg-slate-50">
      <header className="max-w-3xl mx-auto flex items-center justify-between px-4 py-6">
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

      <main className="max-w-3xl mx-auto px-4 pb-12 space-y-6">
        {cap && !cap.allowed && <DailyCapBanner resetAt={cap.resetAt} />}
        {cap && cap.allowed && (
          <p className="text-sm text-slate-500">{cap.remaining} practice session(s) left today.</p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {scenarios.map((s) => (
            <div key={s.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-slate-800">{s.title}</h2>
              <p className="text-sm text-slate-500 mt-1">{s.description}</p>
              <div className="mt-4 flex gap-2">
                <Link
                  to={`/scenario/${s.id}/rehearsal`}
                  className="flex-1 text-center rounded-lg border border-indigo-600 text-indigo-600 text-sm py-2 hover:bg-indigo-50"
                >
                  Rehearsal
                </Link>
                <Link
                  to={`/scenario/${s.id}/test`}
                  className="flex-1 text-center rounded-lg bg-indigo-600 text-white text-sm py-2 hover:bg-indigo-700"
                >
                  Test mode
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
