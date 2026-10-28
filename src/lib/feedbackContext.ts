import { FEEDBACK_LIMITS, type FeedbackContext, type FeedbackLogEntry } from './feedback'

// Keeps the last few console errors and failed requests in memory, so a "Report a problem"
// report arrives with what actually went wrong. Nothing leaves the browser until the user
// sends a report. Imported first in main.tsx: the fetch wrapper has to be in place before
// the Supabase client captures `fetch`.

const MESSAGE_MAX = 300

const errors: FeedbackLogEntry[] = []
const requests: FeedbackLogEntry[] = []

function push(list: FeedbackLogEntry[], message: string) {
  list.push({ at: new Date().toISOString(), message: message.slice(0, MESSAGE_MAX) })
  if (list.length > FEEDBACK_LIMITS.logEntries) list.shift()
}

function describeValue(v: unknown): string {
  if (v instanceof Error) {
    const frame = v.stack?.split('\n').find((line) => line.trim().startsWith('at '))
    return frame ? `${v.name}: ${v.message} (${frame.trim()})` : `${v.name}: ${v.message}`
  }
  if (typeof v === 'string') return v
  try {
    return JSON.stringify(v) ?? String(v)
  } catch {
    return String(v)
  }
}

/** Same-origin URLs as path only; others as host + path. Query strings are dropped except
 *  the ?action= / ?resource= switch the API multiplexes on (they never carry personal data). */
function describeUrl(raw: string): string {
  try {
    const url = new URL(raw, window.location.href)
    const base = url.origin === window.location.origin ? url.pathname : `${url.host}${url.pathname}`
    const kept = ['action', 'resource']
      .filter((k) => url.searchParams.has(k))
      .map((k) => `${k}=${url.searchParams.get(k)}`)
    return kept.length ? `${base}?${kept.join('&')}` : base
  } catch {
    return raw.split('?')[0]
  }
}

let installed = false

function install() {
  if (installed || typeof window === 'undefined') return
  installed = true

  const originalError = console.error.bind(console)
  console.error = (...args: unknown[]) => {
    push(errors, args.map(describeValue).join(' '))
    originalError(...args)
  }

  window.addEventListener('error', (e) => {
    // Resource load failures (img/script) arrive here without a message.
    const where = e.filename ? ` (${describeUrl(e.filename)}:${e.lineno})` : ''
    push(errors, `Uncaught ${e.error ? describeValue(e.error) : e.message}${where}`)
  })
  window.addEventListener('unhandledrejection', (e) => {
    push(errors, `Unhandled rejection: ${describeValue(e.reason)}`)
  })

  const originalFetch = window.fetch.bind(window)
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const method = (init?.method ?? (input instanceof Request ? input.method : 'GET')).toUpperCase()
    const url = describeUrl(input instanceof Request ? input.url : String(input))
    const started = performance.now()
    try {
      const res = await originalFetch(input, init)
      if (res.status >= 400) {
        push(requests, `${method} ${url} → ${res.status} (${Math.round(performance.now() - started)} ms)`)
      }
      return res
    } catch (err) {
      if (!(err instanceof DOMException && err.name === 'AbortError')) {
        push(requests, `${method} ${url} → network error: ${describeValue(err)}`)
      }
      throw err
    }
  }
}

install()

function describeBrowser(ua: string): string {
  const checks: [RegExp, string][] = [
    [/Edg(?:A|iOS)?\/(\d+)/, 'Edge'],
    [/OPR\/(\d+)/, 'Opera'],
    [/SamsungBrowser\/(\d+)/, 'Samsung Internet'],
    [/(?:Firefox|FxiOS)\/(\d+)/, 'Firefox'],
    [/(?:Chrome|CriOS)\/(\d+)/, 'Chrome'],
    [/Version\/(\d+)[\d.]* (?:Mobile\/\S+ )?Safari/, 'Safari'],
  ]
  for (const [re, name] of checks) {
    const m = ua.match(re)
    if (m) return `${name} ${m[1]}`
  }
  return 'Unknown browser'
}

function describeOs(ua: string): string {
  const android = ua.match(/Android (\d+)/)
  if (android) return `Android ${android[1]}`
  const ios = ua.match(/(?:iPhone|iPad|iPod).*? OS (\d+)/)
  if (ios) return `iOS ${ios[1]}`
  // iPadOS 13+ reports itself as a Mac; touch support gives it away.
  if (/Macintosh/.test(ua)) return navigator.maxTouchPoints > 1 ? 'iPadOS' : 'macOS'
  if (/Windows NT/.test(ua)) return 'Windows'
  if (/CrOS/.test(ua)) return 'ChromeOS'
  if (/Linux/.test(ua)) return 'Linux'
  return 'Unknown OS'
}

async function micPermission(): Promise<FeedbackContext['micPermission']> {
  try {
    const status = await navigator.permissions.query({ name: 'microphone' as PermissionName })
    return status.state
  } catch {
    // Firefox and older Safari can't query the microphone permission.
    return 'unknown'
  }
}

export async function collectFeedbackContext(uiLang: string): Promise<FeedbackContext> {
  const ua = navigator.userAgent
  return {
    userAgent: ua,
    browser: describeBrowser(ua),
    os: describeOs(ua),
    viewport: { width: window.innerWidth, height: window.innerHeight, dpr: window.devicePixelRatio || 1 },
    uiLang,
    appVersion: __APP_VERSION__,
    micPermission: await micPermission(),
    online: navigator.onLine,
    errors: [...errors],
    requests: [...requests],
  }
}
