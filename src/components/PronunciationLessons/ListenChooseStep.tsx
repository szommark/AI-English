import { useMemo, useState } from 'react'
import type { Step } from '../../data/pronunciationLessons'
import { ContinueButton, Explanation, ReplayButton, shuffleIndices, type StepProps } from './shared'

type ListenChoose = Extract<Step, { type: 'listen-choose' }>

export default function ListenChooseStep({ step, speak, onDone }: StepProps<ListenChoose>) {
  const order = useMemo(
    () => (step.keepOrder ? step.options.map((_, i) => i) : shuffleIndices(step.options.length)),
    [step],
  )
  const [chosen, setChosen] = useState<number | null>(null)
  const answered = chosen !== null
  const isCorrect = chosen === step.correct

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm text-slate-600">{step.promptHu}</p>
        {step.audio && <ReplayButton onClick={() => speak(step.audio!)} />}
      </div>

      <div className={`grid gap-3 ${step.options.length === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2'}`}>
        {order.map((optionIndex) => {
          const isRight = answered && optionIndex === step.correct
          const isWrongChoice = answered && chosen === optionIndex && optionIndex !== step.correct
          return (
            <button
              key={optionIndex}
              onClick={() => !answered && setChosen(optionIndex)}
              disabled={answered}
              className={`rounded-xl border-2 px-4 py-4 text-base font-medium transition ${
                isRight
                  ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                  : isWrongChoice
                    ? 'border-red-400 bg-red-50 text-red-700'
                    : 'border-rose-200 bg-white text-slate-700 hover:bg-rose-50'
              } disabled:cursor-default`}
            >
              {step.options[optionIndex]}
            </button>
          )
        })}
      </div>

      {answered && (
        <>
          <Explanation correct={isCorrect} text={step.explainHu} />
          <ContinueButton onClick={() => onDone(isCorrect ? 1 : 0)} />
        </>
      )}
    </div>
  )
}
