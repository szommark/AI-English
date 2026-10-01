import { SpeakerIcon } from '../icons/AudioIcons'

/** Fisher-Yates shuffle of [0, 1, ..., n-1]. */
export function shuffleIndices(n: number): number[] {
  const arr = Array.from({ length: n }, (_, i) => i)
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function ReplayButton({ onClick, label = 'Lejátszás', disabled = false }: { onClick: () => void; label?: string; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-1.5 rounded-lg border border-rose-200 text-rose-700 text-xs font-medium px-3 py-1.5 hover:bg-rose-50 disabled:opacity-40"
    >
      <SpeakerIcon className="h-3.5 w-3.5" />
      {label}
    </button>
  )
}

export function ContinueButton({ onClick, label = 'Folytatás →' }: { onClick: () => void; label?: string }) {
  return (
    <button onClick={onClick} className="rounded-lg bg-rose-600 text-white text-sm font-medium px-4 py-2 hover:bg-rose-700">
      {label}
    </button>
  )
}

/** Shown under an answered step: the verdict and the one-line reason. */
export function Explanation({ correct, text }: { correct: boolean; text?: string }) {
  return (
    <div
      className={`rounded-lg border px-3 py-2 text-sm ${
        correct ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-700'
      }`}
    >
      <p className="font-medium">{correct ? 'Helyes!' : 'Nem egészen.'}</p>
      {text && <p className="mt-0.5 text-slate-700">{text}</p>}
    </div>
  )
}

/** Every step component reports its accuracy (0–1) once the learner presses "Folytatás". */
export interface StepProps<S> {
  step: S
  /** Speaks text in the learner's accent at the currently chosen speed. */
  speak: (text: string) => void
  onDone: (ratio: number) => void
}
