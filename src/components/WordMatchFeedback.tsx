import { matchWords } from '../lib/wordMatch'

export default function WordMatchFeedback({ target, heard }: { target: string; heard: string }) {
  const words = matchWords(target, heard)

  return (
    <div className="mt-2 rounded-lg bg-slate-50 border border-slate-200 p-3 text-sm space-y-1.5">
      <p>
        {words.map((w, i) => (
          <span key={i} className={w.matched ? 'text-emerald-700' : 'text-red-600 font-medium'}>
            {w.word}
            {i < words.length - 1 ? ' ' : ''}
          </span>
        ))}
      </p>
      <p className="text-slate-500">
        <span className="font-medium">Amit hallottunk:</span> {heard || '—'}
      </p>
      <p className="text-xs text-slate-400">
        Ez szóalapú visszajelzés, nem valódi kiejtéselemzés. (This is a word-match proxy, not real pronunciation
        scoring.)
      </p>
    </div>
  )
}
