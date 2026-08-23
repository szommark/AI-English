export type IndicatorState = 'listening' | 'thinking' | 'speaking' | 'muted'

const CONFIG: Record<IndicatorState, { label: string; dot: string; pulse: boolean }> = {
  listening: { label: 'Listening…', dot: 'bg-indigo-500', pulse: true },
  thinking: { label: 'Thinking…', dot: 'bg-amber-500', pulse: true },
  speaking: { label: 'Speaking…', dot: 'bg-emerald-500', pulse: true },
  muted: { label: 'Paused', dot: 'bg-slate-400', pulse: false },
}

export default function StateIndicator({ state }: { state: IndicatorState }) {
  const cfg = CONFIG[state]

  return (
    <div className="flex items-center gap-2" role="status" aria-live="polite">
      <span className="relative flex h-3 w-3">
        {cfg.pulse && (
          <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${cfg.dot}`} />
        )}
        <span className={`relative inline-flex h-3 w-3 rounded-full ${cfg.dot}`} />
      </span>
      <span className="text-xs font-medium text-slate-500">{cfg.label}</span>
    </div>
  )
}
