import { useState } from 'react'
import type { PronunciationCheckResult, ProsodyFlag } from '../lib/types'

function scoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-700'
  if (score >= 60) return 'text-amber-700'
  return 'text-red-600'
}

const PROSODY_LABELS_HU: Record<ProsodyFlag, string> = {
  UnexpectedBreak: 'váratlan szünet',
  MissingBreak: 'hiányzó szünet',
  Monotone: 'monoton hangsúly',
}

export default function PronunciationResultCard({ result }: { result: PronunciationCheckResult }) {
  const [expandedWord, setExpandedWord] = useState<number | null>(null)
  const flaggedWords = result.words.filter((w) => w.errorType !== 'None')

  return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-5">
      <h3 className="font-semibold text-indigo-800 mb-3">Kiejtésellenőrzés eredménye</h3>

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
        {result.scores.prosody !== undefined && (
          <div>
            <p className={`text-xl font-semibold ${scoreColor(result.scores.prosody)}`}>
              {Math.round(result.scores.prosody)}
            </p>
            <p className="text-xs text-slate-500">Beszéddallam (prozódia)</p>
          </div>
        )}
      </div>

      {flaggedWords.length > 0 && (
        <div className="mt-4 text-sm">
          <p className="text-slate-600 mb-1">Ezekre a szavakra érdemes figyelni (érintsd meg a részletekért):</p>
          <div className="flex flex-wrap gap-x-1 gap-y-2">
            {flaggedWords.map((w, i) => (
              <div key={i}>
                <button
                  onClick={() => setExpandedWord(expandedWord === i ? null : i)}
                  className="text-red-600 font-medium underline decoration-dotted hover:text-red-700"
                >
                  {w.word}
                </button>
                {expandedWord === i && (
                  <div className="mt-1 w-full rounded-lg bg-white border border-red-100 p-2 text-xs space-y-1.5">
                    {w.phonemes && w.phonemes.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {w.phonemes.map((p, pi) => (
                          <span
                            key={pi}
                            className={`rounded px-1.5 py-0.5 font-mono ${
                              p.accuracyScore >= 80
                                ? 'bg-emerald-50 text-emerald-700'
                                : p.accuracyScore >= 60
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-red-50 text-red-600'
                            }`}
                          >
                            {p.phoneme} {Math.round(p.accuracyScore)}
                          </span>
                        ))}
                      </div>
                    )}
                    {w.prosodyFlags && w.prosodyFlags.length > 0 && (
                      <p className="text-slate-500">{w.prosodyFlags.map((f) => PROSODY_LABELS_HU[f]).join(', ')}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
