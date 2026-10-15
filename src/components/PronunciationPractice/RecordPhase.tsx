import { useEffect, useState, type ReactNode } from 'react'

/** Shared by the practice runner and the pronunciation check: one status line of the record phase. */
export function StatusLine({ icon, text, strong = false }: { icon: ReactNode; text: string; strong?: boolean }) {
  return (
    <p className={`flex items-center gap-2 text-sm ${strong ? 'font-semibold text-rose-700' : 'text-muted-foreground'}`}>
      {icon}
      {text}
    </p>
  )
}

/** The repeat window draining away. Remount (key) it for each recording. */
export function Countdown({ seconds }: { seconds: number }) {
  const [started, setStarted] = useState(false)
  useEffect(() => {
    const frame = requestAnimationFrame(() => setStarted(true))
    return () => cancelAnimationFrame(frame)
  }, [])
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
      <div
        className="h-full rounded-full bg-rose-400 ease-linear"
        style={{ width: started ? '0%' : '100%', transitionProperty: 'width', transitionDuration: `${seconds}s` }}
      />
    </div>
  )
}
