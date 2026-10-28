import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Bug } from 'lucide-react'
import { hasTeacherAccess, useAuth } from '../lib/AuthContext'
import { useLanguage } from '../lib/i18n'
import { buildTrail } from '../lib/navTrail'
import { FEEDBACK_COUNT_CHANGED_EVENT } from '../lib/feedback'
import { fetchNewFeedbackCount } from '../lib/feedbackApi'
import AuthModal from './AuthModal'
import BrandIntro, { shouldShowBrandIntro } from './BrandIntro'
import Wordmark from './Wordmark'
import LanguageSwitcher from './LanguageSwitcher'
import ProgressMenu from './ProgressMenu'
import LevelChip from './gamification/LevelChip'
import XpNotifications from './gamification/XpNotifications'
import ReportProblemDialog from './ReportProblem/ReportProblemDialog'

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
 * language switcher bottom-right (with "Report a problem" beside it when signed in), and — on all
 * pages except the home page — the "Back to home" button with the section trail beneath it,
 * top-left, at every depth.
 */
const FEEDBACK_COUNT_REFRESH_MS = 60_000

/** New problem reports for the admin's header link; refreshed on navigation at most once a
 *  minute, and right away when the inbox changes a status. */
function useNewFeedbackCount(enabled: boolean, pathname: string): number {
  const [count, setCount] = useState(0)
  const lastFetch = useRef(0)

  const refresh = useCallback(() => {
    lastFetch.current = Date.now()
    fetchNewFeedbackCount()
      .then(setCount)
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (enabled && Date.now() - lastFetch.current > FEEDBACK_COUNT_REFRESH_MS) refresh()
  }, [enabled, pathname, refresh])

  useEffect(() => {
    if (!enabled) return
    window.addEventListener(FEEDBACK_COUNT_CHANGED_EVENT, refresh)
    return () => window.removeEventListener(FEEDBACK_COUNT_CHANGED_EVENT, refresh)
  }, [enabled, refresh])

  return enabled ? count : 0
}

export default function AppLayout() {
  const { user, role } = useAuth()
  const { lang, t } = useLanguage()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const [authOpen, setAuthOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const closeReport = useCallback(() => setReportOpen(false), [])
  const newFeedback = useNewFeedbackCount(role === 'admin', pathname)
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
                  <ProgressMenu onReportProblem={() => setReportOpen(true)} />
                  {hasTeacherAccess(role) && (
                    <Link to="/teacher" className="font-medium text-muted-foreground hover:text-foreground hover:underline">
                      {t('teacherDashboard')}
                    </Link>
                  )}
                  {role === 'admin' && (
                    <Link to="/admin" className="inline-flex items-center gap-1.5 font-medium text-muted-foreground hover:text-foreground hover:underline">
                      {t('admin')}
                      {newFeedback > 0 && (
                        <span
                          title={`${newFeedback} new problem report${newFeedback === 1 ? '' : 's'}`}
                          className="rounded-full bg-red-600 px-1.5 text-xs font-semibold leading-5 text-white"
                        >
                          {newFeedback}
                        </span>
                      )}
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
      <div className="fixed bottom-4 right-4 z-40 flex items-center gap-2 sm:right-6">
        {user && (
          <button
            type="button"
            onClick={() => setReportOpen(true)}
            title={t('reportProblem')}
            aria-label={t('reportProblem')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm hover:bg-secondary hover:text-foreground"
          >
            <Bug className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">{t('reportProblem')}</span>
          </button>
        )}
        <LanguageSwitcher />
      </div>

      {user && <XpNotifications />}

      {user && reportOpen && <ReportProblemDialog onClose={closeReport} />}

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
