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
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-slate-50 to-slate-50">
      <header className="max-w-4xl mx-auto flex items-center justify-between px-4 py-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">AI-English</h1>
        </div>
        <div className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              <span className="text-slate-500">{user.email}</span>
              {role === 'teacher' && (
                <Link to="/teacher" className="text-slate-500 hover:underline">
                  Teacher Dashboard
                </Link>
              )}
              {role === 'admin' && (
                <Link to="/admin" className="text-slate-500 hover:underline">
                  Admin
                </Link>
              )}
              <Link to="/settings/teacher" className="text-slate-500 hover:underline">
                Connect to teacher
              </Link>
              <button onClick={signOut} className="text-indigo-600 hover:underline">
                Sign out
              </button>
            </>
          ) : (
            <button
              onClick={() => setAuthOpen(true)}
              className="rounded-lg bg-indigo-600 text-white text-sm px-4 py-2 hover:bg-indigo-700"
            >
              Sign in
            </button>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pb-12 space-y-8">
        <div className="text-center">
          <p className="text-slate-600">Choose how you'd like to practice today</p>
          <p className="text-sm text-slate-400">Válaszd ki, hogyan szeretnél ma gyakorolni</p>
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
