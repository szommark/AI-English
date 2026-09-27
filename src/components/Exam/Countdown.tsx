import { useEffect, useRef, useState } from 'react'
import { Clock } from 'lucide-react'
import { useLanguage } from '../../lib/i18n'

function clock(ms: number): string {
  const s = Math.ceil(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

/** Sticky section timer. Warns in the last minute and calls `onExpire` once at zero. */
export default function Countdown({ deadline, onExpire }: { deadline: number; onExpire: () => void }) {
  const { t } = useLanguage()
  const [now, setNow] = useState(() => Date.now())
  const fired = useRef(false)
  const left = Math.max(0, deadline - now)

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    if (left === 0 && !fired.current) {
      fired.current = true
      onExpire()
    }
  }, [left, onExpire])

  const warning = left <= 60_000

  return (
    <div
      className={`sticky top-2 z-10 rounded-xl border px-4 py-3 shadow-sm ${
        warning ? 'border-amber-300 bg-amber-50 text-amber-900' : 'border-border bg-card text-foreground'
      }`}
    >
      <p className="flex items-center gap-2 text-base font-semibold tabular-nums">
        <Clock className="h-5 w-5" />
        {t('exTimeLeft', { time: clock(left) })}
      </p>
      {warning && (
        <p className="mt-1 text-sm" role="alert">
          {t('exOneMinute')}
        </p>
      )}
    </div>
  )
}
