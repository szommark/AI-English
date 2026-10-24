import { createContext, useContext } from 'react'

// Decorative bar heights for the soundwave motif — fixed, not random, so the card doesn't
// visually jitter on every re-render.
const WAVE_BAR_HEIGHTS = [6, 12, 20, 14, 24, 10, 18, 26, 12, 20, 8, 16]

/**
 * True inside a sound sheet (/pronunciation/sound/:id): the drill cards then take the sheet's How to
 * make it look — white rose card, the sheet's type scale, pill buttons. Lessons and sessions keep theirs.
 */
export const SheetLookContext = createContext(false)

export const useSheetLook = () => useContext(SheetLookContext)

/** The sheet look's buttons and text, shared by the drill stages. */
export const sheet = {
  primaryButton:
    'inline-flex items-center justify-center gap-2 rounded-full bg-rose-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-40',
  secondaryButton:
    'inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground hover:bg-secondary disabled:opacity-40',
  replayButton:
    'inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-foreground hover:bg-secondary disabled:opacity-40',
  prompt: 'text-sm text-muted-foreground',
  word: 'text-3xl font-semibold tracking-tight sm:text-4xl',
}

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
  if (useSheetLook()) {
    return (
      <section className="rounded-2xl border border-rose-200 bg-card p-6 shadow-[var(--shadow-card)] sm:p-8">
        <div className="mb-6 flex items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <h2 className="text-sm font-medium text-foreground">{title}</h2>
            <p className="text-sm text-muted-foreground">{titleHu}</p>
          </div>
          <SoundWave />
        </div>
        {children}
      </section>
    )
  }
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
