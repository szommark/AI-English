import type { PronunciationCheckResult } from '../../lib/types'
import { overallSessionScore, PRODUCTION_WEIGHT } from '../../lib/pronunciationScoring'
import type { RoundResult } from './StageSummary'
import { sheet, useSheetLook } from './DrillCard'
import ScoreBar from '../PronunciationPractice/ScoreBar'

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
  /** Absent for a listening-only funnel (the Sound Bank sheet's Hearing tab): the total is then perception alone. */
  productionResult?: PronunciationCheckResult | null
  onFinish: () => void
}) {
  const sheetLook = useSheetLook()
  // null marks a stage the learner skipped (or left before its first answer).
  const ratioScore = (results: RoundResult[]) =>
    results.length > 0 ? Math.round((results.filter((r) => r.correct).length / results.length) * 100) : null
  const tally = (results: RoundResult[]) => `${results.filter((r) => r.correct).length}/${results.length}`
  const productionScore = productionResult?.scores.pronunciation ?? null
  const cardScore = cardResults ? ratioScore(cardResults) : null
  const fcScore = ratioScore(fcResults)
  const ooScore = ratioScore(ooResults)
  const dictationScore = dictationStats.total > 0 ? Math.round((dictationStats.matched / dictationStats.total) * 100) : null
  const overallScore =
    productionScore === null
      ? Math.round(perceptionScore ?? 0)
      : perceptionScore === undefined
        ? Math.round(productionScore)
        : overallSessionScore(perceptionScore, productionScore)

  // The sound sheet shows each step and the total as % bars, like its Pronunciation tab's result.
  // Labels and numbers match the sheet's step ovals.
  if (sheetLook) {
    const rows = [
      ...(cardResults ? [{ label: 'Kártyák', score: cardScore }] : []),
      { label: 'Melyik szó?', score: fcScore },
      { label: 'Melyikben van?', score: ooScore },
      { label: 'Diktálás', score: dictationScore },
      ...(productionScore !== null ? [{ label: 'Kiejtés', score: productionScore }] : []),
    ]
    return (
      <div className="space-y-5">
        <h3 className="text-base font-semibold text-foreground">Összesítés</h3>
        <ul className="space-y-2">
          {rows.map((row, i) => (
            <li key={row.label} className="grid grid-cols-[8rem_1fr] items-center gap-3 text-sm">
              <span className="text-foreground">
                {i + 1}. {row.label}
              </span>
              {row.score === null ? (
                <span className="text-muted-foreground">kihagyva</span>
              ) : (
                <ScoreBar score={row.score} label={row.label} />
              )}
            </li>
          ))}
          <li className="grid grid-cols-[8rem_1fr] items-center gap-3 border-t border-border pt-2 text-sm font-semibold">
            <span className="text-foreground">Összpontszám</span>
            <ScoreBar score={overallScore} label="Összpontszám" />
          </li>
        </ul>
        <button onClick={onFinish} className={sheet.primaryButton}>
          Befejezés
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className={`text-4xl font-bold ${scoreColor(overallScore)}`}>{overallScore}</p>
        <p className="text-sm text-slate-500">{productionScore === null ? 'Hallásgyakorlatok pontszáma' : 'Összesített pontszám'}</p>
        {productionScore !== null && (
          <p className="text-xs text-slate-400">
            {perceptionScore === undefined
              ? 'Csak a kiejtés alapján — a hallásgyakorlatokat kihagytad'
              : `Hallásgyakorlatok ${Math.round((1 - PRODUCTION_WEIGHT) * 100)}% · kiejtés ${Math.round(PRODUCTION_WEIGHT * 100)}%`}
          </p>
        )}
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
        {productionScore !== null && (
          <SummaryRow label="Kiejtés (élő ellenőrzés)" score={productionScore} detail={String(Math.round(productionScore))} />
        )}
      </div>

      <button onClick={onFinish} className="rounded-lg bg-rose-600 text-white text-sm font-medium px-4 py-2 hover:bg-rose-700">
        Befejezés
      </button>
    </div>
  )
}
