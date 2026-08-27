import { SpeakerIcon } from '../icons/AudioIcons'

const STAGE_COUNT = 4

export default function DrillControls({
  stageIndex,
  rate,
  onSetRate,
  onReplay,
  replayLabel = 'Lejátszás',
  replayDisabled = false,
}: {
  stageIndex: number
  rate: 1 | 0.75
  onSetRate: (rate: 1 | 0.75) => void
  onReplay?: () => void
  replayLabel?: string
  replayDisabled?: boolean
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm px-4 py-3 flex items-center gap-4">
      <div className="flex items-center gap-1.5 shrink-0">
        {Array.from({ length: STAGE_COUNT }).map((_, i) => (
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

      <div className="flex items-center gap-1 shrink-0">
        {([1, 0.75] as const).map((r) => (
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
