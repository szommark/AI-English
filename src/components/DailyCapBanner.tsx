import { useEffect, useState } from 'react'

function formatCountdown(resetAt: string): string {
  const ms = new Date(resetAt).getTime() - Date.now()
  if (ms <= 0) return 'any moment now'
  const hours = Math.floor(ms / 3_600_000)
  const minutes = Math.floor((ms % 3_600_000) / 60_000)
  return `${hours}h ${minutes}m`
}

export default function DailyCapBanner({ resetAt }: { resetAt: string }) {
  const [countdown, setCountdown] = useState(() => formatCountdown(resetAt))

  useEffect(() => {
    const id = setInterval(() => setCountdown(formatCountdown(resetAt)), 30_000)
    return () => clearInterval(id)
  }, [resetAt])

  return (
    <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-800">
      <p className="font-medium">You've used all 3 practice sessions for today.</p>
      <p className="mt-1">Come back tomorrow for more practice — resets in about {countdown}.</p>
    </div>
  )
}
