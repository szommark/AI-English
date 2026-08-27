import { SpeakerIcon } from '../icons/AudioIcons'

const CARD_LABELS = ['A', 'B', 'C'] as const

export default function OddOneOutStage({
  roundNumber,
  totalRounds,
  feedback,
  onPlay,
  onAnswer,
}: {
  roundNumber: number
  totalRounds: number
  feedback: { chosenIndex: 0 | 1 | 2; oddIndex: 0 | 1 | 2 } | null
  onPlay: (index: 0 | 1 | 2) => void
  onAnswer: (index: 0 | 1 | 2) => void
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        Hallgasd meg mindhármat, és válaszd ki, melyik hangzik másképp ({roundNumber}/{totalRounds})
      </p>
      <div className="grid grid-cols-3 gap-3">
        {CARD_LABELS.map((label, i) => {
          const index = i as 0 | 1 | 2
          const isCorrect = feedback && feedback.oddIndex === index
          const isWrongChoice = feedback && feedback.chosenIndex === index && feedback.chosenIndex !== feedback.oddIndex
          return (
            <div
              key={label}
              className={`rounded-xl border-2 p-4 flex flex-col items-center gap-3 transition ${
                isCorrect
                  ? 'border-emerald-400 bg-emerald-50'
                  : isWrongChoice
                    ? 'border-red-400 bg-red-50'
                    : 'border-rose-200 bg-white'
              }`}
            >
              <span className="text-lg font-semibold text-slate-600">{label}</span>
              <button
                onClick={() => onPlay(index)}
                aria-label={`${label} lejátszása`}
                className="h-10 w-10 flex items-center justify-center rounded-full text-rose-600 bg-rose-50 hover:bg-rose-100"
              >
                <SpeakerIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => onAnswer(index)}
                disabled={feedback !== null}
                className="text-xs font-medium text-rose-700 border border-rose-200 rounded-lg px-2 py-1 hover:bg-rose-50 disabled:opacity-40 disabled:cursor-default"
              >
                Ez más
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
