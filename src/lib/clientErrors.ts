import { CLIENT_ERROR_LIMITS, type ClientErrorItem, type ClientErrorKind } from './feedback'
import { describeBrowser } from './feedbackContext'

// Automatic crash capture: uncaught errors, unhandled promise rejections and React render crashes
// (CrashBoundary) are batched and posted silently to /api/connect?action=client-errors, where the
// same error from many visitors folds into one row with a counter. Imported in main.tsx right
// after feedbackContext. Development builds stay quiet unless localStorage
// 'avalon:send-dev-errors' is '1'.

const FLUSH_DELAY_MS = 5000
/** Requests per page load — a render loop must not turn into a request loop. */
const MAX_SENDS = 30
/** Distinct errors per page load. */
const MAX_DISTINCT = 25

/** Noise that says nothing about Avalon's code. */
const IGNORED_MESSAGES = [
  /ResizeObserver loop/i,
  /^Script error\.?$/i, // cross-origin script without details
  /AbortError/,
  /The (operation|user) aborted/i,
]
const EXTENSION_FRAME = /(chrome|moz|safari(-web)?)-extension:\/\//

const pending = new Map<string, ClientErrorItem>()
const seen = new Set<string>()
let sends = 0
let timer: ReturnType<typeof setTimeout> | undefined

function enabled(): boolean {
  if (!import.meta.env.DEV) return true
  try {
    return localStorage.getItem('avalon:send-dev-errors') === '1'
  } catch {
    return false
  }
}

function describe(error: unknown): { message: string; stack: string } {
  if (error instanceof Error) {
    const message = error.message ? `${error.name}: ${error.message}` : error.name
    return { message, stack: error.stack ?? '' }
  }
  if (typeof error === 'string') return { message: error, stack: '' }
  try {
    return { message: JSON.stringify(error) ?? String(error), stack: '' }
  } catch {
    return { message: String(error), stack: '' }
  }
}

export function reportClientError(kind: ClientErrorKind, error: unknown, extraStack?: string) {
  const { message, stack } = describe(error)
  if (!message.trim() || IGNORED_MESSAGES.some((re) => re.test(message)) || EXTENSION_FRAME.test(stack)) return
  // A fetch failing while offline is the network, not a bug.
  if (!navigator.onLine && /fetch|network|load failed/i.test(message)) return

  const pagePath = window.location.pathname
  const key = `${kind}|${message}|${pagePath}`
  const existing = pending.get(key)
  if (existing) {
    existing.count++
  } else {
    if (!seen.has(key) && seen.size >= MAX_DISTINCT) return
    seen.add(key)
    const fullStack = [stack, extraStack].filter(Boolean).join('\n').slice(0, CLIENT_ERROR_LIMITS.stack)
    pending.set(key, {
      kind,
      message: message.slice(0, CLIENT_ERROR_LIMITS.message),
      stack: fullStack || undefined,
      pagePath,
      count: 1,
    })
  }
  if (!timer) timer = setTimeout(() => void flush(false), FLUSH_DELAY_MS)
}

async function flush(keepalive: boolean) {
  if (timer) clearTimeout(timer)
  timer = undefined
  if (pending.size === 0) return
  if (!enabled() || sends >= MAX_SENDS) {
    pending.clear()
    return
  }

  const entries = [...pending.entries()].slice(0, CLIENT_ERROR_LIMITS.batch)
  for (const [key] of entries) pending.delete(key)
  if (pending.size > 0) timer = setTimeout(() => void flush(false), FLUSH_DELAY_MS)
  sends++

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  try {
    // Loaded lazily: this module runs before the Supabase client exists (see main.tsx).
    const { supabase } = await import('./supabase')
    const token = (await supabase.auth.getSession()).data.session?.access_token
    if (token) headers.Authorization = `Bearer ${token}`
  } catch {
    // Signed out or storage unavailable — the error is still worth recording.
  }

  try {
    await fetch('/api/connect?action=client-errors', {
      method: 'POST',
      headers,
      keepalive,
      body: JSON.stringify({
        appVersion: __APP_VERSION__,
        browser: describeBrowser(navigator.userAgent),
        errors: entries.map(([, item]) => item),
      }),
    })
  } catch {
    // Best effort; never let the reporter itself raise an error.
  }
}

let installed = false

function install() {
  if (installed || typeof window === 'undefined') return
  installed = true
  window.addEventListener('error', (e) => reportClientError('error', e.error ?? e.message))
  window.addEventListener('unhandledrejection', (e) => reportClientError('rejection', e.reason))
  // Send what's queued when the tab is hidden or closed; keepalive lets the request outlive the page.
  window.addEventListener('pagehide', () => void flush(true))
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') void flush(true)
  })
}

install()
