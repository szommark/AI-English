import { useState } from 'react'
import type { Step } from '../../data/pronunciationLessons'
import { ContinueButton, Explanation, ReplayButton, type StepProps } from './shared'

type SyllableTap = Extract<Step, { type: 'syllable-tap' }>

export default function SyllableTapStep({ step, speak, onDone }: StepProps<SyllableTap>) {
  const [chosen, setChosen] = useState<number | null>(null)
  const answered = chosen !== null
  const isCorrect = chosen === step.stressed

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm text-slate-600">
          Hallgasd meg, és kattints a hangsúlyos szótagra a(z) <span className="font-semibold text-rose-700">{step.target}</span> szóban.
        </p>
        <ReplayButton onClick={() => speak(step.audio)} />
      </div>

      {step.contextHu && <p className="rounded-lg bg-white border border-slate-200 px-3 py-2 text-sm text-slate-600">{step.contextHu}</p>}

      <div className="flex flex-wrap gap-2">
        {step.syllables.map((syllable, i) => {
          const isRight = answered && i === step.stressed
          const isWrongChoice = answered && chosen === i && i !== step.stressed
          return (
            <button
              key={i}
              onClick={() => !answered && setChosen(i)}
              disabled={answered}
              className={`rounded-xl border-2 px-5 py-3 text-xl font-medium transition ${
                isRight
                  ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                  : isWrongChoice
                    ? 'border-red-400 bg-red-50 text-red-700'
                    : 'border-rose-200 bg-white text-slate-700 hover:bg-rose-50'
              } disabled:cursor-default`}
            >
              {syllable}
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
