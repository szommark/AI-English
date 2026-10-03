import { useEffect, useRef } from 'react'
import { useLanguage } from '../../lib/i18n'

/**
 * Hungarian definite article before a numeral: "az" when the number is read starting with a
 * vowel (egy, öt, ötven, ötszáz, ezer…), otherwise "a".
 */
export function hungarianArticle(n: number): 'a' | 'az' {
  if (n === 1 || String(n).startsWith('5') || (n >= 1000 && n < 2000)) return 'az'
  return 'a'
}

/** One short, dismissible level-up message. No animation beyond the overlay itself. */
export default function LevelUpDialog({ level, onClose }: { level: number; onClose: () => void }) {
  const { t } = useLanguage()
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    buttonRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="level-up-title"
        className="w-full max-w-sm rounded-xl border border-border bg-card p-6 text-center shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="level-up-title" className="text-lg font-semibold text-foreground">
          {t('levelUpTitle')}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t('levelUpBody', { article: hungarianArticle(level), level })}
        </p>
        <button
          ref={buttonRef}
          onClick={onClose}
          className="mt-5 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          {t('levelUpContinue')}
        </button>
      </div>
    </div>
  )
}
