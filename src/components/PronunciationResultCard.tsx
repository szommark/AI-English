import type { PronunciationCheckResult } from '../lib/types'

function scoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-700'
  if (score >= 60) return 'text-amber-700'
  return 'text-red-600'
}

export default function PronunciationResultCard({ result }: { result: PronunciationCheckResult }) {
  const flaggedWords = result.words.filter((w) => w.errorType !== 'None')

  return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-5">
      <h3 className="font-semibold text-indigo-800 mb-3">Mélyelemzés (Deep check)</h3>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <p className={`text-xl font-semibold ${scoreColor(result.scores.accuracy)}`}>
            {Math.round(result.scores.accuracy)}
          </p>
          <p className="text-xs text-slate-500">Kiejtés pontossága</p>
        </div>
        <div>
          <p className={`text-xl font-semibold ${scoreColor(result.scores.fluency)}`}>
            {Math.round(result.scores.fluency)}
          </p>
          <p className="text-xs text-slate-500">Folyékonyság</p>
        </div>
        <div>
          <p className={`text-xl font-semibold ${scoreColor(result.scores.completeness)}`}>
            {Math.round(result.scores.completeness)}
          </p>
          <p className="text-xs text-slate-500">Teljesség</p>
        </div>
        <div>
          <p className={`text-xl font-semibold ${scoreColor(result.scores.pronunciation)}`}>
            {Math.round(result.scores.pronunciation)}
          </p>
          <p className="text-xs text-slate-500">Összpontszám</p>
        </div>
      </div>

      {flaggedWords.length > 0 && (
        <div className="mt-4 text-sm">
          <p className="text-slate-600 mb-1">Ezekre a szavakra érdemes figyelni:</p>
          <p className="space-x-2">
            {flaggedWords.map((w, i) => (
              <span key={i} className="text-red-600 font-medium">
                {w.word}
              </span>
            ))}
          </p>
        </div>
      )}
    </div>
  )
}
