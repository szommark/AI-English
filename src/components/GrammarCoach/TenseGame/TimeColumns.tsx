import { useLanguage, type MessageKey } from '../../../lib/i18n'
import { TIME_FRAMES, type TimeFrame } from '../../../data/tenseGameQuestions'

export interface GameQuestion {
  id: string
  frame: TimeFrame
  text: string
  focus: string
  sample: string
}

export interface PlacedAnswer {
  question: GameQuestion
  answer: string
  /** The AI's fixed version when the answer had small mistakes; empty otherwise. */
  corrected: string
  secondTry: boolean
  /** Story mode keeps missed lines in the story: shown greyed, `answer` holding the model answer. */
  missed?: boolean
}

export const FRAME_LABEL: Record<TimeFrame, MessageKey> = {
  past: 'tensePresetPast',
  present: 'tensePresetPresent',
  future: 'tensePresetFuture',
}

export const FRAME_STYLE: Record<TimeFrame, { column: string; heading: string; dot: string; card: string }> = {
  past: { column: 'border-sky-200 bg-sky-50/60', heading: 'text-sky-700', dot: 'bg-sky-500', card: 'border-sky-200' },
  present: { column: 'border-emerald-200 bg-emerald-50/60', heading: 'text-emerald-700', dot: 'bg-emerald-500', card: 'border-emerald-200' },
  future: { column: 'border-violet-200 bg-violet-50/60', heading: 'text-violet-700', dot: 'bg-violet-500', card: 'border-violet-200' },
}

const sameText = (a: string, b: string) => a.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim() === b.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

/** The three columns the answers land in, each with its question above the answer. */
export default function TimeColumns({
  placed,
  latestId,
  totals,
}: {
  placed: PlacedAnswer[]
  latestId: string | null
  /** How many questions each column can get. */
  totals: Record<TimeFrame, number>
}) {
  const { t } = useLanguage()
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {TIME_FRAMES.map((frame) => {
        const items = placed.filter((p) => p.question.frame === frame)
        const style = FRAME_STYLE[frame]
        return (
          <section key={frame} aria-label={t(FRAME_LABEL[frame])} className={`min-w-0 rounded-xl border p-3 ${style.column}`}>
            <h3 className={`mb-2 flex items-center justify-between text-sm font-semibold ${style.heading}`}>
              <span className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} aria-hidden />
                {t(FRAME_LABEL[frame])}
              </span>
              <span className="text-xs font-medium tabular-nums opacity-70">
                {items.filter((i) => !i.missed).length} / {totals[frame]}
              </span>
            </h3>
            {items.length === 0 ? (
              <p className="py-4 text-center text-xs text-slate-400">{t('tenseGameEmptyColumn')}</p>
            ) : (
              <ul className="space-y-2">
                {items.map((item) => (
                  <li
                    key={item.question.id}
                    className={`rounded-lg border p-2.5 ${
                      item.missed ? 'border-dashed border-slate-300 bg-white/60' : `bg-white shadow-sm ${style.card}`
                    } ${item.question.id === latestId ? 'tense-game-drop' : ''}`}
                  >
                    <p className="text-xs text-slate-500">{item.question.text}</p>
                    {item.missed ? (
                      <p className="mt-1 text-sm italic text-slate-400 break-words">{item.answer}</p>
                    ) : (
                      <p className="mt-1 text-sm font-medium text-slate-800 break-words">{item.answer}</p>
                    )}
                    {!item.missed && item.corrected && !sameText(item.corrected, item.answer) && (
                      <p className="mt-1 text-xs text-slate-500">
                        <span className="font-medium">{t('tenseGameCorrected')}</span> {item.corrected}
                      </p>
                    )}
                    {(item.secondTry || item.missed) && (
                      <span className="mt-1.5 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                        {t(item.missed ? 'tenseGameModelLine' : 'tenseGameSecondTry')}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )
      })}
    </div>
  )
}

/** Questions per column, e.g. for a story with an uneven split. */
export function frameTotals(questions: GameQuestion[]): Record<TimeFrame, number> {
  const totals: Record<TimeFrame, number> = { past: 0, present: 0, future: 0 }
  for (const q of questions) totals[q.frame]++
  return totals
}
