import { useEffect, useState } from 'react'
import { useLanguage } from '../../lib/i18n'

// Small pieces shared by the speaking exam's exam and practice runners.

export function PrimaryButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="min-h-12 rounded-xl bg-primary px-6 text-base font-semibold text-primary-foreground hover:opacity-90">
      {children}
    </button>
  )
}

export function SecondaryButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="min-h-12 rounded-xl border border-border bg-card px-6 text-base font-medium text-foreground hover:bg-muted">
      {children}
    </button>
  )
}

/** A row of pill buttons: the speaking tasks, plus whatever leads back out. */
export function StepPill({
  current,
  onClick,
  children,
}: {
  current?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-current={current ? 'step' : undefined}
      onClick={onClick}
      className={`inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-sm font-medium ${
        current ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-foreground hover:bg-muted'
      }`}
    >
      {children}
    </button>
  )
}

/** Time spent on a task so far, against roughly how long it takes in the exam. */
export function Elapsed({ since, minutes }: { since: number; minutes: number }) {
  const { t } = useLanguage()
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  const sec = Math.max(0, Math.floor((now - since) / 1000))
  const time = `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`
  return (
    <span className={`text-sm tabular-nums ${sec > minutes * 60 ? 'text-amber-700' : 'text-muted-foreground'}`}>
      {t('exSpkElapsed', { time, n: minutes })}
    </span>
  )
}
