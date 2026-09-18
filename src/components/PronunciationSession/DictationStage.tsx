import { useState } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import { scoreDictation } from '../../lib/wordMatch'
import { SpeakerIcon } from '../icons/AudioIcons'

export default function DictationStage({
  sentence,
  keyWords,
  label,
  submitted,
  onSubmit,
  onContinue,
  onReplay,
  replayLabel,
  replayDisabled,
}: {
  sentence: string
  keyWords: string[]
  label: string
  submitted: boolean
  onSubmit: (typed: string) => void
  onContinue: () => void
  onReplay: () => void
  replayLabel: string
  replayDisabled: boolean
}) {
  const [typed, setTyped] = useState('')
  const { words, matchedCount, keyWordMatchedCount } = submitted
    ? scoreDictation(sentence, typed, keyWords)
    : { words: [], matchedCount: 0, keyWordMatchedCount: 0 }
  const allCorrect = submitted && matchedCount === words.length && keyWordMatchedCount === keyWords.length

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <p className="text-sm text-slate-500">Írd le, amit hallasz.</p>
        <button
          onClick={onReplay}
          disabled={replayDisabled}
          className="flex items-center gap-1.5 rounded-lg border border-rose-200 text-rose-700 text-xs font-medium px-3 py-1.5 hover:bg-rose-50 disabled:opacity-40"
        >
          <SpeakerIcon className="h-3.5 w-3.5" />
          {replayLabel}
        </button>
      </div>

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
          <div className="flex items-center gap-2">
            {allCorrect ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            <p className="text-sm font-medium text-slate-700">
              {matchedCount}/{words.length} szó · {keyWordMatchedCount}/{keyWords.length} {label}
            </p>
          </div>
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
