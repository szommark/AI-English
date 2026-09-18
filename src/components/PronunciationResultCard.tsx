import { useState } from 'react'
import { Check, X } from 'lucide-react'
import type { PronunciationCheckResult, PronunciationWordDetail, ProsodyFlag } from '../lib/types'

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

function normalizeWord(word: string): string {
  return word.toLowerCase().replace(/[.,!?;:"'()]/g, '')
}

/** Aligns each target-sentence word to its Azure result (if any), tolerating omitted words. */
function alignWords(targetSentence: string, resultWords: PronunciationWordDetail[]) {
  const targetWords = targetSentence.trim().split(/\s+/)
  let cursor = 0
  return targetWords.map((word) => {
    const key = normalizeWord(word)
    let foundAt = -1
    for (let j = cursor; j < Math.min(resultWords.length, cursor + 3); j++) {
      if (normalizeWord(resultWords[j].word) === key) {
        foundAt = j
        break
      }
    }
    if (foundAt === -1) return { word, detail: null }
    cursor = foundAt + 1
    return { word, detail: resultWords[foundAt] }
  })
}

export default function PronunciationResultCard({
  result,
  targetSentence,
}: {
  result: PronunciationCheckResult
  targetSentence: string
}) {
  const [expandedWord, setExpandedWord] = useState<number | null>(null)
  const aligned = alignWords(targetSentence, result.words)

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

      <div className="mt-4 text-sm">
        <p className="text-slate-600 mb-2">A mondatod szavanként (érintsd meg a hibásakat a részletekért):</p>
        <div className="flex flex-wrap gap-1.5">
          {aligned.map(({ word, detail }, i) => {
            const isOk = detail?.errorType === 'None'
            const isExpandable = detail !== null && !isOk
            return (
              <div key={i}>
                <button
                  onClick={() => isExpandable && setExpandedWord(expandedWord === i ? null : i)}
                  disabled={!isExpandable}
                  className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-sm font-medium ${
                    isOk
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : isExpandable
                        ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                        : 'border-dashed border-red-200 bg-red-50/50 text-red-500 cursor-default'
                  }`}
                >
                  {isOk ? (
                    <Check className="h-3.5 w-3.5 shrink-0" />
                  ) : (
                    <X className="h-3.5 w-3.5 shrink-0" />
                  )}
                  {word}
                </button>
                {expandedWord === i && detail && (
                  <div className="mt-1 w-full rounded-lg bg-white border border-red-100 p-2 text-xs space-y-1.5">
                    {detail.errorType === 'Omission' ? (
                      <p className="text-slate-500">
                        Ezt a szót nem hallottuk tisztán — próbáld hangosabban és lassabban kimondani.
                      </p>
                    ) : detail.phonemes && detail.phonemes.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {detail.phonemes.map((p, pi) => (
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
                    ) : (
                      <p className="text-slate-500">Nincs részletes hangonkénti adat ehhez a szóhoz.</p>
                    )}
                    {detail.prosodyFlags && detail.prosodyFlags.length > 0 && (
                      <p className="text-slate-500">{detail.prosodyFlags.map((f) => PROSODY_LABELS_HU[f]).join(', ')}</p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
        {aligned.some(({ detail }) => detail === null) && (
          <p className="mt-2 text-xs text-slate-500">
            A szaggatott szegélyű szavakat egyáltalán nem sikerült felismerni a felvételen — próbáld újra hangosabban.
          </p>
        )}
      </div>
    </div>
  )
}
