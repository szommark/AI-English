import { useState } from 'react'
import type { Step } from '../../data/pronunciationLessons'
import { scoreDictation } from '../../lib/wordMatch'
import DictationStage from '../PronunciationSession/DictationStage'
import type { StepProps } from './shared'

type Dictation = Extract<Step, { type: 'dictation' }>

const MAX_PLAYS = 3

/** The drill funnel's dictation stage: three plays, per-word diff, ratio = matched words / words. */
export default function DictationStep({ step, speak, onDone }: StepProps<Dictation>) {
  const [playsRemaining, setPlaysRemaining] = useState(MAX_PLAYS)
  const [typed, setTyped] = useState<string | null>(null)

  function replay() {
    if (playsRemaining <= 0) return
    speak(step.text)
    setPlaysRemaining((p) => p - 1)
  }

  function finish() {
    if (typed === null) return
    const { words, matchedCount } = scoreDictation(step.text, typed, step.keyWords)
    onDone(words.length > 0 ? matchedCount / words.length : 0)
  }

  return (
    <DictationStage
      sentence={step.text}
      keyWords={step.keyWords}
      label={step.labelHu}
      submitted={typed !== null}
      onSubmit={setTyped}
      onContinue={finish}
      onReplay={replay}
      replayLabel={`Lejátszás (${playsRemaining} hátra)`}
      replayDisabled={playsRemaining <= 0}
    />
  )
}
