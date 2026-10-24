import { Check, X } from 'lucide-react'
import { sheet, useSheetLook } from './DrillCard'

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
  const sheetLook = useSheetLook()
  const correctCount = results.filter((r) => r.correct).length

  return (
    <div className="space-y-4">
      <p className={sheetLook ? sheet.prompt : 'text-sm text-slate-500'}>
        {title} — {correctCount}/{results.length} helyes
      </p>
      <div lang="en" className={`flex flex-wrap ${sheetLook ? 'gap-2' : 'gap-1.5'}`}>
        {results.map((r, i) => (
          <span
            key={i}
            className={`inline-flex items-center gap-1 rounded-lg border font-medium ${sheetLook ? 'px-3 py-1.5 text-base' : 'px-2 py-1 text-sm'} ${
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
      <button onClick={onContinue} className={sheetLook ? sheet.primaryButton : 'rounded-lg bg-rose-600 text-white text-sm font-medium px-4 py-2 hover:bg-rose-700'}>
        Folytatás →
      </button>
    </div>
  )
}
