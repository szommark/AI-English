import { useState } from 'react'
import { matchWords } from '../../lib/wordMatch'

export default function DictationStage({
  sentence,
  submitted,
  onSubmit,
  onContinue,
}: {
  sentence: string
  submitted: boolean
  onSubmit: (typed: string) => void
  onContinue: () => void
}) {
  const [typed, setTyped] = useState('')
  const words = submitted ? matchWords(sentence, typed) : []

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">Írd le, amit hallasz.</p>

      <input
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        disabled={submitted}
        placeholder="Amit hallottál..."
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 disabled:bg-slate-50"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !submitted && typed.trim()) onSubmit(typed)
        }}
      />

      {!submitted && (
        <button
          onClick={() => onSubmit(typed)}
          disabled={!typed.trim()}
          className="rounded-lg bg-rose-600 text-white text-sm font-medium px-4 py-2 hover:bg-rose-700 disabled:opacity-40"
        >
          Ellenőrzés
        </button>
      )}

      {submitted && (
        <div className="space-y-3">
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-sm">
            <p>
              {words.map((w, i) => (
                <span key={i} className={w.matched ? 'text-slate-700' : 'text-red-600 font-medium underline'}>
                  {w.word}
                  {i < words.length - 1 ? ' ' : ''}
                </span>
              ))}
            </p>
          </div>
          <button onClick={onContinue} className="rounded-lg bg-rose-600 text-white text-sm font-medium px-4 py-2 hover:bg-rose-700">
            Folytatás →
          </button>
        </div>
      )}
    </div>
  )
}
