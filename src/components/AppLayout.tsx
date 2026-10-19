import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { hasTeacherAccess, useAuth } from '../lib/AuthContext'
import { useLanguage } from '../lib/i18n'
import { buildTrail } from '../lib/navTrail'
import AuthModal from './AuthModal'
import BrandIntro, { shouldShowBrandIntro } from './BrandIntro'
import Wordmark from './Wordmark'
import LanguageSwitcher from './LanguageSwitcher'
import ProgressMenu from './ProgressMenu'
import LevelChip from './gamification/LevelChip'
import XpNotifications from './gamification/XpNotifications'

interface AuthPromptValue {
  /** Opens the sign-in modal; after a successful sign-in the app navigates to `route`. */
  promptSignIn: (route?: string) => void
}

const AuthPromptContext = createContext<AuthPromptValue | undefined>(undefined)

export function useAuthPrompt(): AuthPromptValue {
  const ctx = useContext(AuthPromptContext)
  if (!ctx) throw new Error('useAuthPrompt must be used within AppLayout')
  return ctx
}

/**
 * Shared frame for every page: brand + a short account menu on the top bar (Mission and Sign in
 * when signed out; level, My progress ▾ and the role's dashboard when signed in), a floating
 * language switcher bottom-right, and — on all
 * pages except the home page — the "Back to home" button with the section trail beneath it,
 * top-left, at every depth.
 */
export default function AppLayout() {
  const { user, role } = useAuth()
  const { lang, t } = useLanguage()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const [authOpen, setAuthOpen] = useState(false)
  const [pendingRoute, setPendingRoute] = useState<string | null>(null)

  useEffect(() => {
    if (user && authOpen) {
      setAuthOpen(false)
      if (pendingRoute) {
        navigate(pendingRoute)
        setPendingRoute(null)
      }
    }
  }, [user, authOpen, pendingRoute, navigate])

  const promptValue = useMemo<AuthPromptValue>(
    () => ({
      promptSignIn: (route) => {
        setPendingRoute(route ?? null)
        setAuthOpen(true)
      },
    }),
    [],
  )

  const trail = useMemo(() => buildTrail(pathname, lang, t), [pathname, lang, t])
  const isHome = pathname === '/'
  // Decided once on mount: the intro plays only when a session starts on the home page.
  const [showIntro, setShowIntro] = useState(() => isHome && shouldShowBrandIntro())
  const hideIntro = useCallback(() => setShowIntro(false), [])

  return (
    <AuthPromptContext.Provider value={promptValue}>
      {showIntro && <BrandIntro onDone={hideIntro} />}
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-md flex items-center justify-center bg-[var(--brand-navy)] font-brand text-xl font-semibold leading-none text-white">
                A
              </div>
              <Wordmark className="text-xl" />
            </Link>

            <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-2 text-sm">
              {user ? (
                <>
                  <LevelChip />
                  <ProgressMenu />
                  {hasTeacherAccess(role) && (
                    <Link to="/teacher" className="font-medium text-muted-foreground hover:text-foreground hover:underline">
                      {t('teacherDashboard')}
                    </Link>
                  )}
                  {role === 'admin' && (
                    <Link to="/admin" className="font-medium text-muted-foreground hover:text-foreground hover:underline">
                      {t('admin')}
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link to="/mission" className="font-medium text-[var(--brand-navy)] hover:underline">
                    {t('mission')}
                  </Link>
                  <button
                    onClick={() => promptValue.promptSignIn()}
                    className="rounded-lg bg-[var(--teal-accent)] text-primary text-sm font-semibold px-4 py-2 hover:bg-[var(--teal-accent-strong)]"
                  >
                    {t('signIn')}
                  </button>
                </>
              )}
            </div>
          </div>
        </header>

        {!isHome && (
          <nav aria-label={t('breadcrumbLabel')} className="max-w-6xl mx-auto px-4 pt-5 space-y-2">
            <Link
              to="/"
              className="inline-flex items-center rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-primary shadow-sm hover:bg-secondary"
            >
              {t('backHome')}
            </Link>
            {trail.length > 0 && (
              <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
                {trail.map((crumb, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    {i > 0 && <span aria-hidden="true">›</span>}
                    {crumb.to ? (
                      <Link
                        to={crumb.to}
                        className="rounded-md border border-border bg-card px-2.5 py-1 hover:bg-secondary hover:text-foreground"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span aria-current="page" className="px-1 font-medium text-foreground">
                        {crumb.label}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </nav>
        )}

        <main className="max-w-6xl mx-auto px-4 py-8">
          <Outlet />
        </main>
      </div>

      {/* Floats on every page, apart from the header menu. */}
      <div className="fixed bottom-4 right-4 z-40 sm:right-6">
        <LanguageSwitcher />
      </div>

      {user && <XpNotifications />}

      {authOpen && (
        <AuthModal
          onClose={() => {
            setAuthOpen(false)
            setPendingRoute(null)
          }}
        />
      )}
    </AuthPromptContext.Provider>
  )
}
