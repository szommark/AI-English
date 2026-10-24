import { supabase } from './supabase'

/**
 * QR codes from the admin overview point at https://avln.hu/?qr=<slug>. On load we log the
 * scan, drop the parameter from the address bar (so a reload or a shared link doesn't count
 * again) and remember the slug, so an account created from this browser within 30 days is
 * credited to the code (see handle_new_user in 20261024120000_qr_tracking.sql).
 */

export const QR_SITE_URL = 'https://avln.hu'

const PARAM = 'qr'
const ATTRIBUTION_KEY = 'aiEnglish:qrAttribution'
const VISITOR_KEY = 'aiEnglish:visitorId'
const ATTRIBUTION_DAYS = 30
const SLUG_PATTERN = /^[a-z0-9]{4,16}$/

interface QrAttribution {
  slug: string
  visitorId: string
  at: number
}

export function qrLink(slug: string): string {
  return `${QR_SITE_URL}/?${PARAM}=${slug}`
}

function visitorId(): string {
  try {
    const existing = window.localStorage.getItem(VISITOR_KEY)
    if (existing) return existing
    const id = crypto.randomUUID()
    window.localStorage.setItem(VISITOR_KEY, id)
    return id
  } catch {
    return crypto.randomUUID()
  }
}

/** Call once before the app renders. */
export function captureQrScan() {
  const url = new URL(window.location.href)
  const slug = url.searchParams.get(PARAM)?.trim().toLowerCase()
  if (slug === undefined) return

  url.searchParams.delete(PARAM)
  window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash)
  if (!SLUG_PATTERN.test(slug)) return

  const attribution: QrAttribution = { slug, visitorId: visitorId(), at: Date.now() }
  try {
    window.localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(attribution))
  } catch {
    // Private mode: the scan still counts, the sign-up just can't be credited.
  }
  void supabase.rpc('log_qr_scan', { p_slug: slug, p_visitor: attribution.visitorId }).then(({ error }) => {
    if (error) console.warn('QR scan not logged', error.message)
  })
}

/** Sign-up metadata crediting the last QR scan, if it was recent enough. */
export function qrSignupMetadata(): { qr_code: string; qr_visitor: string } | undefined {
  try {
    const raw = window.localStorage.getItem(ATTRIBUTION_KEY)
    if (!raw) return undefined
    const { slug, visitorId: visitor, at } = JSON.parse(raw) as QrAttribution
    if (!SLUG_PATTERN.test(slug) || Date.now() - at > ATTRIBUTION_DAYS * 86_400_000) return undefined
    return { qr_code: slug, qr_visitor: visitor }
  } catch {
    return undefined
  }
}

/** One account per scan: forget the scan once it has been credited. */
export function clearQrAttribution() {
  try {
    window.localStorage.removeItem(ATTRIBUTION_KEY)
  } catch {
    // ignore
  }
}
