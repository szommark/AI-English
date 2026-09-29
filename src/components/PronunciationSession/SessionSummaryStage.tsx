import type { PronunciationCheckResult } from '../../lib/types'
import { overallSessionScore, PRODUCTION_WEIGHT } from '../../lib/pronunciationScoring'
import type { RoundResult } from './StageSummary'

function scoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-700'
  if (score >= 60) return 'text-amber-700'
  return 'text-red-600'
}

function SummaryRow({ label, score, detail }: { label: string; score: number | null; detail: string }) {
  return (
    <div className="flex items-center justify-between px-3 py-2">
      <span className="text-slate-600">{label}</span>
      {score === null ? (
        <span className="text-slate-400">kihagyva</span>
      ) : (
        <span className={`font-semibold ${scoreColor(score)}`}>{detail}</span>
      )}
    </div>
  )
}

export default function SessionSummaryStage({
  cardResults,
  fcResults,
  ooResults,
  dictationStats,
  perceptionScore,
  productionResult,
  onFinish,
}: {
  /** Present only when the tile has a card deck. */
  cardResults?: RoundResult[]
  fcResults: RoundResult[]
  ooResults: RoundResult[]
  dictationStats: { matched: number; total: number; keyMatched: number; keyTotal: number }
  /** Undefined when the learner skipped straight to production — the total is then production alone. */
  perceptionScore: number | undefined
  productionResult: PronunciationCheckResult
  onFinish: () => void
}) {
  // null marks a stage the learner skipped (or left before its first answer).
  const ratioScore = (results: RoundResult[]) =>
    results.length > 0 ? Math.round((results.filter((r) => r.correct).length / results.length) * 100) : null
  const tally = (results: RoundResult[]) => `${results.filter((r) => r.correct).length}/${results.length}`
  const productionScore = productionResult.scores.pronunciation
  const cardScore = cardResults ? ratioScore(cardResults) : null
  const fcScore = ratioScore(fcResults)
  const ooScore = ratioScore(ooResults)
  const dictationScore = dictationStats.total > 0 ? Math.round((dictationStats.matched / dictationStats.total) * 100) : null
  const overallScore =
    perceptionScore === undefined ? Math.round(productionScore) : overallSessionScore(perceptionScore, productionScore)

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className={`text-4xl font-bold ${scoreColor(overallScore)}`}>{overallScore}</p>
        <p className="text-sm text-slate-500">Összesített pontszám</p>
        <p className="text-xs text-slate-400">
          {perceptionScore === undefined
            ? 'Csak a kiejtés alapján — a hallásgyakorlatokat kihagytad'
            : `Hallásgyakorlatok ${Math.round((1 - PRODUCTION_WEIGHT) * 100)}% · kiejtés ${Math.round(PRODUCTION_WEIGHT * 100)}%`}
        </p>
      </div>

      <div className="rounded-lg bg-slate-50 border border-slate-200 divide-y divide-slate-200 text-sm">
        {cardResults && <SummaryRow label="Hallod a hangot?" score={cardScore} detail={tally(cardResults)} />}
        <SummaryRow label="Melyik szót hallottad?" score={fcScore} detail={tally(fcResults)} />
        <SummaryRow label="Melyikben van a hang?" score={ooScore} detail={tally(ooResults)} />
        <SummaryRow
          label="Írd le, amit hallasz"
          score={dictationScore}
          detail={`${dictationStats.matched}/${dictationStats.total} szó · ${dictationStats.keyMatched}/${dictationStats.keyTotal}`}
        />
        <SummaryRow label="Kiejtés (élő ellenőrzés)" score={productionScore} detail={String(Math.round(productionScore))} />
      </div>

      <button onClick={onFinish} className="rounded-lg bg-rose-600 text-white text-sm font-medium px-4 py-2 hover:bg-rose-700">
        Befejezés
      </button>
    </div>
  )
}
