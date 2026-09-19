import type { PronunciationCheckResult } from '../../lib/types'
import { overallSessionScore, perceptionScoreFromRatios, PRODUCTION_WEIGHT } from '../../lib/pronunciationScoring'
import type { RoundResult } from './StageSummary'

function scoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-700'
  if (score >= 60) return 'text-amber-700'
  return 'text-red-600'
}

export default function SessionSummaryStage({
  cardResults,
  fcResults,
  ooResults,
  dictationStats,
  productionResult,
  onFinish,
}: {
  /** Present only when the tile has a card deck. */
  cardResults?: RoundResult[]
  fcResults: RoundResult[]
  ooResults: RoundResult[]
  dictationStats: { matched: number; total: number; keyMatched: number; keyTotal: number }
  productionResult: PronunciationCheckResult
  onFinish: () => void
}) {
  const ratio = (results: RoundResult[]) => results.filter((r) => r.correct).length / results.length
  const cardScore = cardResults ? Math.round(ratio(cardResults) * 100) : null
  const fcScore = Math.round(ratio(fcResults) * 100)
  const ooScore = Math.round(ratio(ooResults) * 100)
  const dictationScore = Math.round((dictationStats.matched / dictationStats.total) * 100)
  const perceptionScore = perceptionScoreFromRatios([
    ...(cardResults ? [ratio(cardResults)] : []),
    ratio(fcResults),
    ratio(ooResults),
    dictationStats.matched / dictationStats.total,
  ])
  const overallScore = overallSessionScore(perceptionScore, productionResult.scores.pronunciation)

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className={`text-4xl font-bold ${scoreColor(overallScore)}`}>{overallScore}</p>
        <p className="text-sm text-slate-500">Összesített pontszám</p>
        <p className="text-xs text-slate-400">
          Hallásgyakorlatok {Math.round((1 - PRODUCTION_WEIGHT) * 100)}% · kiejtés {Math.round(PRODUCTION_WEIGHT * 100)}%
        </p>
      </div>

      <div className="rounded-lg bg-slate-50 border border-slate-200 divide-y divide-slate-200 text-sm">
        {cardResults && cardScore !== null && (
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-slate-600">Hallod a hangot?</span>
            <span className={`font-semibold ${scoreColor(cardScore)}`}>
              {cardResults.filter((r) => r.correct).length}/{cardResults.length}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-slate-600">Melyik szót hallottad?</span>
          <span className={`font-semibold ${scoreColor(fcScore)}`}>
            {fcResults.filter((r) => r.correct).length}/{fcResults.length}
          </span>
        </div>
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-slate-600">Melyikben van a hang?</span>
          <span className={`font-semibold ${scoreColor(ooScore)}`}>
            {ooResults.filter((r) => r.correct).length}/{ooResults.length}
          </span>
        </div>
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-slate-600">Írd le, amit hallasz</span>
          <span className={`font-semibold ${scoreColor(dictationScore)}`}>
            {dictationStats.matched}/{dictationStats.total} szó · {dictationStats.keyMatched}/{dictationStats.keyTotal}
          </span>
        </div>
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-slate-600">Kiejtés (élő ellenőrzés)</span>
          <span className={`font-semibold ${scoreColor(productionResult.scores.pronunciation)}`}>
            {Math.round(productionResult.scores.pronunciation)}
          </span>
        </div>
      </div>

      <button onClick={onFinish} className="rounded-lg bg-rose-600 text-white text-sm font-medium px-4 py-2 hover:bg-rose-700">
        Befejezés
      </button>
    </div>
  )
}
