import { Fragment, useState } from 'react'
import type { Step } from '../../data/pronunciationLessons'
import { ContinueButton, Explanation, ReplayButton, type StepProps } from './shared'

type TokenSelect = Extract<Step, { type: 'token-select' }>

/** Hits minus false picks, over the number of right answers — picking everything doesn't pay. */
export function tokenSelectRatio(correct: number[], picked: Set<number>): number {
  if (correct.length === 0) return 1
  const right = new Set(correct)
  let hits = 0
  let wrong = 0
  picked.forEach((i) => (right.has(i) ? (hits += 1) : (wrong += 1)))
  return Math.max(0, (hits - wrong) / correct.length)
}

export default function TokenSelectStep({ step, speak, onDone }: StepProps<TokenSelect>) {
  const [picked, setPicked] = useState<Set<number>>(new Set())
  const [checked, setChecked] = useState(false)
  const right = new Set(step.correct)

  function toggle(i: number) {
    if (checked) return
    setPicked((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  const ratio = tokenSelectRatio(step.correct, picked)

  // After checking: right pick = green, wrong pick = red, missed answer = amber outline.
  function stateClasses(i: number, base: string): string {
    if (!checked) return picked.has(i) ? 'border-rose-500 bg-rose-100 text-rose-800' : base
    if (picked.has(i)) return right.has(i) ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-red-400 bg-red-50 text-red-700'
    return right.has(i) ? 'border-amber-400 bg-amber-50 text-amber-700' : base
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm text-slate-600">{step.promptHu}</p>
        <ReplayButton onClick={() => speak(step.audio)} />
      </div>

      {step.mode === 'words' ? (
        <div className="flex flex-wrap gap-2">
          {step.tokens.map((token, i) => (
            <button
              key={i}
              onClick={() => toggle(i)}
              disabled={checked}
              aria-pressed={picked.has(i)}
              className={`rounded-lg border-2 px-3 py-2 text-base font-medium transition ${stateClasses(i, 'border-slate-200 bg-white text-slate-700 hover:bg-rose-50')} disabled:cursor-default`}
            >
              {token}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-y-3">
          {step.tokens.map((token, i) => (
            <Fragment key={i}>
              <span className="rounded-lg bg-white border border-slate-200 px-3 py-2 text-base font-medium text-slate-700">{token}</span>
              {i < step.tokens.length - 1 && (
                <button
                  onClick={() => toggle(i)}
                  disabled={checked}
                  aria-pressed={picked.has(i)}
                  aria-label={`${token} és ${step.tokens[i + 1]} közötti határ`}
                  className={`mx-1 h-8 w-8 rounded-full border-2 text-sm transition ${stateClasses(i, 'border-dashed border-slate-300 text-slate-300 hover:border-rose-300 hover:text-rose-500')} disabled:cursor-default`}
                >
                  ‿
                </button>
              )}
            </Fragment>
          ))}
        </div>
      )}

      {!checked ? (
        <button
          onClick={() => setChecked(true)}
          disabled={picked.size === 0}
          className="rounded-lg bg-rose-600 text-white text-sm font-medium px-4 py-2 hover:bg-rose-700 disabled:opacity-40"
        >
          Ellenőrzés
        </button>
      ) : (
        <>
          <Explanation correct={ratio === 1} text={step.explainHu} />
          <ContinueButton onClick={() => onDone(ratio)} />
        </>
      )}
    </div>
  )
}
