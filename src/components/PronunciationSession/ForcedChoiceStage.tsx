import { SpeakerIcon } from '../icons/AudioIcons'

export default function ForcedChoiceStage({
  words,
  roundNumber,
  totalRounds,
  feedback,
  onReplay,
  onAnswer,
}: {
  words: [string, string]
  roundNumber: number
  totalRounds: number
  feedback: { chosenIndex: 0 | 1; correctIndex: 0 | 1 } | null
  onReplay: () => void
  onAnswer: (choiceIndex: 0 | 1) => void
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <p className="text-sm text-slate-500">
          Melyik szót hallottad? ({roundNumber}/{totalRounds})
        </p>
        <button
          onClick={onReplay}
          className="flex items-center gap-1.5 rounded-lg border border-rose-200 text-rose-700 text-xs font-medium px-3 py-1.5 hover:bg-rose-50"
        >
          <SpeakerIcon className="h-3.5 w-3.5" />
          Lejátszás
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {words.map((word, i) => {
          const index = i as 0 | 1
          const isCorrect = feedback && feedback.correctIndex === index
          const isWrongChoice = feedback && feedback.chosenIndex === index && feedback.chosenIndex !== feedback.correctIndex
          return (
            <button
              key={word}
              onClick={() => onAnswer(index)}
              disabled={feedback !== null}
              className={`rounded-xl border-2 px-4 py-6 text-lg font-medium transition ${
                isCorrect
                  ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                  : isWrongChoice
                    ? 'border-red-400 bg-red-50 text-red-700'
                    : 'border-rose-200 bg-white text-slate-700 hover:bg-rose-50'
              } disabled:cursor-default`}
            >
              {word}
            </button>
          )
        })}
      </div>
    </div>
  )
}
