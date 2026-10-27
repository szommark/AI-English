import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { useLanguage, type MessageKey } from '../lib/i18n'

const MENU_WIDTH_PX = 240

const LINKS: { to: string; label: MessageKey }[] = [
  { to: '/my-progress', label: 'myProgressOverview' },
  { to: '/my-goals', label: 'myGoals' },
  { to: '/settings/voice', label: 'voiceSettings' },
  { to: '/settings/teacher', label: 'connectTeacher' },
]

/**
 * The signed-in user's header menu: "My progress ▾" opens the progress overview, the personal
 * settings (voice, teacher connection) and, under a divider, the account email and Sign out.
 */
export default function ProgressMenu() {
  const { user, signOut } = useAuth()
  const { t } = useLanguage()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  // On narrow screens the header wraps and the button can sit at the left edge — open the
  // menu rightwards then, so it never runs off-screen.
  const [alignLeft, setAlignLeft] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  function toggle() {
    const rect = rootRef.current?.getBoundingClientRect()
    if (rect) setAlignLeft(rect.right < MENU_WIDTH_PX + 16)
    setOpen((v) => !v)
  }

  // Close whenever the user navigates (including via one of the menu's own links).
  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const inSection = LINKS.some((l) => pathname === l.to)

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 font-medium text-primary hover:bg-secondary ${
          inSection || open ? 'bg-secondary' : ''
        }`}
      >
        {t('myProgress')}
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {open && (
        <div
          role="menu"
          style={{ width: MENU_WIDTH_PX }}
          className={`absolute ${alignLeft ? 'left-0' : 'right-0'} z-50 mt-2 overflow-hidden rounded-xl border border-border bg-card py-1 shadow-lg`}
        >
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              role="menuitem"
              aria-current={pathname === l.to ? 'page' : undefined}
              className={`block px-4 py-2 hover:bg-secondary ${
                pathname === l.to ? 'font-medium text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t(l.label)}
            </Link>
          ))}
          <div className="my-1 border-t border-border" role="separator" />
          <p className="truncate px-4 pt-1 text-xs text-muted-foreground" title={user?.email ?? undefined}>
            {user?.email}
          </p>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              signOut()
            }}
            className="block w-full px-4 py-2 text-left text-primary hover:bg-secondary"
          >
            {t('signOut')}
          </button>
        </div>
      )}
    </div>
  )
}
