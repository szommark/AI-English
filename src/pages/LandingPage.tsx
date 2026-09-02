import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { features, type Feature } from '../data/features'
import FeatureTile from '../components/FeatureTile'
import AuthModal from '../components/AuthModal'
import { useAuth } from '../lib/AuthContext'

export default function LandingPage() {
  const { user, role, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation() as { state?: { from?: string } }

  const [authOpen, setAuthOpen] = useState(false)
  const [pendingRoute, setPendingRoute] = useState<string | null>(null)

  useEffect(() => {
    if (!user && location.state?.from) {
      setPendingRoute(location.state.from)
      setAuthOpen(true)
    }
  }, [location.state, user])

  useEffect(() => {
    if (user && authOpen) {
      setAuthOpen(false)
      if (pendingRoute) {
        navigate(pendingRoute)
        setPendingRoute(null)
      }
    }
  }, [user, authOpen, pendingRoute, navigate])

  function handleTileClickFor(feature: Feature) {
    return (e: React.MouseEvent) => {
      if (!user) {
        e.preventDefault()
        setPendingRoute(feature.route)
        setAuthOpen(true)
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2.5">
            <div
              className="h-8 w-8 rounded-md flex items-center justify-center text-white font-bold"
              style={{ background: 'var(--gradient-hero)' }}
            >
              A
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-foreground">AI-English</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            {user ? (
              <>
                <span className="text-muted-foreground">{user.email}</span>
                {role === 'teacher' && (
                  <Link to="/teacher" className="text-muted-foreground hover:underline">
                    Teacher Dashboard
                  </Link>
                )}
                {role === 'admin' && (
                  <Link to="/admin" className="text-muted-foreground hover:underline">
                    Admin
                  </Link>
                )}
                <Link to="/settings/teacher" className="text-muted-foreground hover:underline">
                  Connect to teacher
                </Link>
                <button onClick={signOut} className="text-primary hover:underline">
                  Sign out
                </button>
              </>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="rounded-lg bg-[var(--teal-accent)] text-primary text-sm font-semibold px-4 py-2 hover:bg-[var(--teal-accent-strong)]"
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12 space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--teal-accent-strong)]">
            Gyakorlás
          </p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
            Choose how you'd like to practice today
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">Válaszd ki, hogyan szeretnél ma gyakorolni</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((f) => (
            <FeatureTile key={f.id} feature={f} onClick={handleTileClickFor(f)} />
          ))}
        </div>
      </main>

      {authOpen && (
        <AuthModal
          onClose={() => {
            setAuthOpen(false)
            setPendingRoute(null)
          }}
        />
      )}
    </div>
  )
}
