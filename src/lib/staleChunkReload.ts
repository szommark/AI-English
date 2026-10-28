// Stale build recovery: a tab opened before a deploy still asks for the old hashed chunks
// (e.g. the Azure Speech SDK on the first sound check, or a lazy page), which the new
// deployment no longer has. Vite reports that as 'vite:preloadError'; one reload picks up the
// current build. Imported in main.tsx. A second failure within RELOAD_GUARD_MS is left to the
// caller's own error handling, so a chunk that is genuinely missing can't cause a reload loop.

const RELOAD_GUARD_MS = 30_000
const STORAGE_KEY = 'avalon:chunk-reload-at'

function reloadAllowed(): boolean {
  try {
    const last = Number(sessionStorage.getItem(STORAGE_KEY) ?? 0)
    if (Date.now() - last < RELOAD_GUARD_MS) return false
    sessionStorage.setItem(STORAGE_KEY, String(Date.now()))
    return true
  } catch {
    // Without storage there is no loop guard — don't reload.
    return false
  }
}

let installed = false

function install() {
  if (installed || typeof window === 'undefined') return
  installed = true
  window.addEventListener('vite:preloadError', () => {
    // The error still reaches the caller; the reload replaces the page right after.
    if (reloadAllowed()) window.location.reload()
  })
}

install()
