import { useMemo, useState } from 'react'
import type { Step } from '../../data/pronunciationLessons'
import OddOneOutStage from '../PronunciationSession/OddOneOutStage'
import { ContinueButton, Explanation, shuffleIndices, type StepProps } from './shared'

type OddOneOut = Extract<Step, { type: 'odd-one-out' }>

/** The drill funnel's three-card stage, with the card order shuffled so the odd one isn't always C. */
export default function OddOneOutStep({ step, speak, onDone }: StepProps<OddOneOut>) {
  const order = useMemo(() => shuffleIndices(3), [step])
  const [feedback, setFeedback] = useState<{ chosenIndex: 0 | 1 | 2; oddIndex: 0 | 1 | 2 } | null>(null)

  const correctDisplayIndex = order.indexOf(step.oddIndex) as 0 | 1 | 2
  const isCorrect = feedback !== null && feedback.chosenIndex === correctDisplayIndex

  return (
    <div className="space-y-4">
      <OddOneOutStage
        roundNumber={1}
        totalRounds={1}
        promptHu={step.promptHu}
        answerLabelHu="Ez a más"
        feedback={feedback}
        onPlay={(displayIndex) => speak(step.words[order[displayIndex]])}
        onAnswer={(displayIndex) => !feedback && setFeedback({ chosenIndex: displayIndex, oddIndex: correctDisplayIndex })}
      />
      {feedback && (
        <>
          <Explanation correct={isCorrect} text={step.explainHu} />
          <ContinueButton onClick={() => onDone(isCorrect ? 1 : 0)} />
        </>
      )}
    </div>
  )
}
