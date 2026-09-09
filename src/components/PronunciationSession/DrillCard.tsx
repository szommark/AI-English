// Decorative bar heights for the soundwave motif — fixed, not random, so the card doesn't
// visually jitter on every re-render.
const WAVE_BAR_HEIGHTS = [6, 12, 20, 14, 24, 10, 18, 26, 12, 20, 8, 16]

function SoundWave() {
  return (
    <div className="flex items-end gap-1 h-7">
      {WAVE_BAR_HEIGHTS.map((h, i) => (
        <span key={i} className="w-1 rounded-full bg-rose-300" style={{ height: `${h}px` }} />
      ))}
    </div>
  )
}

export default function DrillCard({
  title,
  titleHu,
  children,
}: {
  title: string
  titleHu: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-rose-200 bg-gradient-to-b from-rose-50 to-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-rose-100 bg-rose-50/60 px-5 py-3">
        <div>
          <h2 className="font-semibold text-rose-900">{title}</h2>
          <p className="text-xs text-rose-500">{titleHu}</p>
        </div>
        <SoundWave />
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}
