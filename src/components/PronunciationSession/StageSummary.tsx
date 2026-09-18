import { Check, X } from 'lucide-react'

export interface RoundResult {
  word: string
  correct: boolean
}

export default function StageSummary({
  title,
  results,
  onContinue,
}: {
  title: string
  results: RoundResult[]
  onContinue: () => void
}) {
  const correctCount = results.filter((r) => r.correct).length

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        {title} — {correctCount}/{results.length} helyes
      </p>
      <div className="flex flex-wrap gap-1.5">
        {results.map((r, i) => (
          <span
            key={i}
            className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-sm font-medium ${
              r.correct
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-red-200 bg-red-50 text-red-600'
            }`}
          >
            {r.correct ? <Check className="h-3.5 w-3.5 shrink-0" /> : <X className="h-3.5 w-3.5 shrink-0" />}
            {r.word}
          </span>
        ))}
      </div>
      <button onClick={onContinue} className="rounded-lg bg-rose-600 text-white text-sm font-medium px-4 py-2 hover:bg-rose-700">
        Folytatás →
      </button>
    </div>
  )
}
