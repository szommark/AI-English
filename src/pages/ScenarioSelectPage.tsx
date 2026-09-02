import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
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
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2.5">
            <div
              className="h-8 w-8 rounded-md flex items-center justify-center text-white font-bold"
              style={{ background: 'var(--gradient-hero)' }}
            >
              A
            </div>
            <div>
              <span className="text-[15px] font-semibold tracking-tight text-foreground">AI-English</span>
              <p className="text-xs text-muted-foreground">
                Conversational English (Társalgási angol) — válassz egy szituációt
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">{user?.email}</span>
            <Link to="/settings/voice" className="text-primary hover:underline">
              Voice settings
            </Link>
            <button onClick={signOut} className="text-primary hover:underline">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <Link to="/" className="text-sm text-primary hover:underline">
          ← Vissza a főoldalra
        </Link>

        {cap && !cap.allowed && <DailyCapBanner resetAt={cap.resetAt} />}
        {cap && cap.allowed && (
          <p className="text-sm text-muted-foreground">{cap.remaining} practice session(s) left today.</p>
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
