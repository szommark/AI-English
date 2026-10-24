import { SpeakerIcon } from '../icons/AudioIcons'
import { sheet, useSheetLook } from './DrillCard'

const RATES = [1, 0.75] as const

export default function DrillControls({
  stageCount,
  stageIndex,
  rate,
  onSetRate,
  onReplay,
  replayLabel = 'Lejátszás',
  replayDisabled = false,
  onSkipToProduction,
}: {
  stageCount: number
  stageIndex: number
  rate: 1 | 0.75
  onSetRate: (rate: 1 | 0.75) => void
  onReplay?: () => void
  replayLabel?: string
  replayDisabled?: boolean
  /** Jumps straight to the Azure-scored production stage; omitted once it's reached. */
  onSkipToProduction?: () => void
}) {
  // The sheet puts these inside the card's left side (DrillCard's `aside`) and shows its stages as
  // labelled ovals above the card, so here they're a bare row: replay and a speed toggle, no dots.
  if (useSheetLook()) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {onReplay && (
          <button onClick={onReplay} disabled={replayDisabled} className={sheet.replayButton}>
            <SpeakerIcon className="h-3.5 w-3.5" />
            {replayLabel}
          </button>
        )}
        <div className="inline-flex rounded-full bg-secondary p-0.5" role="group" aria-label="Sebesség">
          {RATES.map((r) => (
            <button
              key={r}
              onClick={() => onSetRate(r)}
              aria-pressed={rate === r}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                rate === r ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {r}×
            </button>
          ))}
        </div>
        {onSkipToProduction && (
          <button onClick={onSkipToProduction} title="Ugrás a kiejtésellenőrzésre" className={sheet.replayButton}>
            Kiejtés
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
              <path d="M4 5.5v13l8.5-6.5L4 5.5zM12.5 5.5v13L21 12l-8.5-6.5z" />
            </svg>
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm px-4 py-3 flex items-center gap-4">
      <div className="flex items-center gap-1.5 shrink-0">
        {Array.from({ length: stageCount }).map((_, i) => (
          <span
            key={i}
            className={`h-2 w-2 rounded-full ${
              i === stageIndex ? 'bg-rose-500 scale-125' : i < stageIndex ? 'bg-rose-300' : 'bg-slate-200'
            }`}
          />
        ))}
      </div>

      {onReplay && (
        <button
          onClick={onReplay}
          disabled={replayDisabled}
          className="flex items-center gap-1.5 rounded-lg border border-rose-200 text-rose-700 text-xs font-medium px-3 py-1.5 hover:bg-rose-50 disabled:opacity-40"
        >
          <SpeakerIcon className="h-3.5 w-3.5" />
          {replayLabel}
        </button>
      )}

      <div className="flex-1" />

      {onSkipToProduction && (
        <button
          onClick={onSkipToProduction}
          title="Ugrás a kiejtésellenőrzésre"
          className="flex items-center gap-1 rounded-lg text-rose-700 text-xs font-medium px-2 py-1.5 hover:bg-rose-50 shrink-0"
        >
          Kiejtés
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
            <path d="M4 5.5v13l8.5-6.5L4 5.5zM12.5 5.5v13L21 12l-8.5-6.5z" />
          </svg>
        </button>
      )}

      <div className="flex items-center gap-1 shrink-0">
        {RATES.map((r) => (
          <button
            key={r}
            onClick={() => onSetRate(r)}
            className={`rounded-md px-2 py-1 text-xs font-medium ${
              rate === r ? 'bg-rose-100 text-rose-700' : 'text-slate-400 hover:bg-slate-100'
            }`}
          >
            {r}×
          </button>
        ))}
      </div>
    </div>
  )
}
