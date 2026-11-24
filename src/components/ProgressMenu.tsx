import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { useLanguage, type MessageKey } from '../lib/i18n'

const MENU_WIDTH_PX = 240

type MenuLink = { to: string; label: MessageKey }

/** Shown as a submenu under "My progress" (the overview page itself). */
const PROGRESS_LINKS: MenuLink[] = [
  { to: '/my-goals', label: 'myGoals' },
  { to: '/my-courses', label: 'myCourses' },
  { to: '/my-tests', label: 'myTests' },
]

const SETTINGS_LINKS: MenuLink[] = [
  { to: '/settings/voice', label: 'voiceSettings' },
  { to: '/settings/teacher', label: 'connectTeacher' },
]

const ALL_PATHS = ['/my-progress', ...PROGRESS_LINKS.map((l) => l.to), ...SETTINGS_LINKS.map((l) => l.to)]

/**
 * The signed-in user's header menu: "My progress ▾" opens the progress overview with its
 * submenu (goals, courses, tests), the personal settings (voice, teacher connection) and, under
 * a divider, the account email and Sign out. Report a problem lives on the floating button.
 */
export default function ProgressMenu() {
  const { user, signOut } = useAuth()
  const { t } = useLanguage()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const inProgressGroup = pathname === '/my-progress' || PROGRESS_LINKS.some((l) => pathname === l.to)
  const [subOpen, setSubOpen] = useState(inProgressGroup)
  // On narrow screens the header wraps and the button can sit at the left edge — open the
  // menu rightwards then, so it never runs off-screen.
  const [alignLeft, setAlignLeft] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  function toggle() {
    const rect = rootRef.current?.getBoundingClientRect()
    if (rect) setAlignLeft(rect.right < MENU_WIDTH_PX + 16)
    if (!open) setSubOpen(inProgressGroup)
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

  const inSection = ALL_PATHS.includes(pathname)

  function linkClass(to: string, indent = false) {
    return `block ${indent ? 'pl-8 pr-4' : 'px-4'} py-2 hover:bg-secondary ${
      pathname === to ? 'font-medium text-foreground' : 'text-muted-foreground hover:text-foreground'
    }`
  }

  function renderLink(l: MenuLink, indent = false) {
    return (
      <Link
        key={l.to}
        to={l.to}
        role="menuitem"
        aria-current={pathname === l.to ? 'page' : undefined}
        className={linkClass(l.to, indent)}
      >
        {t(l.label)}
      </Link>
    )
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`inline-flex items-center gap-1 border px-2.5 py-1.5 font-medium hover:border-[var(--club-gold)] hover:text-[var(--club-gold-light)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--club-gold)] ${
          inSection || open
            ? 'border-[var(--club-gold)] bg-[var(--club-green-soft)] text-[var(--club-gold-light)]'
            : 'border-transparent text-[var(--club-cream)]'
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
          <div className="flex items-stretch">
            <Link
              to="/my-progress"
              role="menuitem"
              aria-current={pathname === '/my-progress' ? 'page' : undefined}
              className={`flex-1 ${linkClass('/my-progress')}`}
            >
              {t('myProgress')}
            </Link>
            <button
              type="button"
              onClick={() => setSubOpen((v) => !v)}
              aria-expanded={subOpen}
              aria-label={t('myProgress')}
              className="px-3 text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <ChevronDown className={`h-4 w-4 transition-transform ${subOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>
          </div>
          {subOpen && PROGRESS_LINKS.map((l) => renderLink(l, true))}
          {SETTINGS_LINKS.map((l) => renderLink(l))}
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
