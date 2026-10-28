import { Component, type ErrorInfo, type ReactNode } from 'react'
import { useLanguage } from '../../lib/i18n'
import { reportClientError } from '../../lib/clientErrors'
import { describeValue, logFeedbackError } from '../../lib/feedbackContext'

/** A lazy page chunk that no longer exists — usually a deploy happened while the tab was open. */
export function isChunkLoadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error)
  return /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i.test(
    message,
  )
}

interface Props {
  children: ReactNode
  fallback: (error: Error) => ReactNode
}

/**
 * Catches render crashes, records them for the admin Errors tab (React doesn't pass these to
 * window.onerror) and shows `fallback` instead of a white screen. Re-key it to reset, e.g. on
 * navigation.
 */
export default class CrashBoundary extends Component<Props, { error: Error | null }> {
  state = { error: null as Error | null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    reportClientError('render', error, info.componentStack ?? undefined)
    logFeedbackError(`Render crash: ${describeValue(error)}`)
  }

  render() {
    return this.state.error ? this.props.fallback(this.state.error) : this.props.children
  }
}

function reload() {
  window.location.reload()
}

/** Inside the app frame: header, language and the report dialog still work. */
export function CrashScreen({ error, onReport }: { error: Error; onReport?: () => void }) {
  const { t } = useLanguage()
  const stale = isChunkLoadError(error)

  return (
    <div role="alert" className="mx-auto max-w-lg rounded-xl border border-border bg-card p-6 text-center shadow-sm">
      <h1 className="text-lg font-semibold text-foreground">{t(stale ? 'crashUpdateTitle' : 'crashTitle')}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{t(stale ? 'crashUpdateBody' : 'crashBody')}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {!stale && onReport && (
          <button
            type="button"
            onClick={onReport}
            className="rounded-lg bg-[var(--teal-accent)] px-4 py-2 text-sm font-semibold text-primary hover:bg-[var(--teal-accent-strong)]"
          >
            {t('crashReport')}
          </button>
        )}
        <button
          type="button"
          onClick={reload}
          className={
            stale
              ? 'rounded-lg bg-[var(--teal-accent)] px-4 py-2 text-sm font-semibold text-primary hover:bg-[var(--teal-accent-strong)]'
              : 'rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-primary hover:bg-secondary'
          }
        >
          {t('crashReload')}
        </button>
      </div>
    </div>
  )
}

/** Outside every provider (main.tsx), so no translations: both languages, one button. */
export function RootCrashScreen() {
  return (
    <div role="alert" className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md rounded-xl border border-border bg-card p-6 text-center shadow-sm">
        <h1 className="text-lg font-semibold text-foreground">Hoppá, valami elromlott.</h1>
        <p className="mt-1 text-sm text-muted-foreground">Something went wrong.</p>
        <p className="mt-3 text-sm text-muted-foreground">
          A hibát rögzítettük. Töltsd újra az oldalt. · We've recorded the error. Please reload the page.
        </p>
        <button
          type="button"
          onClick={reload}
          className="mt-5 rounded-lg bg-[var(--teal-accent)] px-4 py-2 text-sm font-semibold text-primary hover:bg-[var(--teal-accent-strong)]"
        >
          Újratöltés · Reload
        </button>
      </div>
    </div>
  )
}
