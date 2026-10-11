import { useState, type ReactNode } from 'react'
import type { GrammarFormExercise, GrammarOrderExercise, GrammarTransformExercise } from '../../lib/types'
import { useLanguage } from '../../lib/i18n'
import { finalPunctuation, GAP, joinTiles, matchesAnswer, sentenceTiles } from '../../lib/grammarExercises'

/** null until the learner checks the item; then whether it was right. */
export type ItemResult = boolean | null

interface ItemProps<T> {
  number: number
  item: T
  result: ItemResult
  onCheck: (correct: boolean) => void
}

/** Fisher–Yates; reshuffles (a few tries) if it lands on the original order. */
function shuffled<T>(items: T[]): T[] {
  for (let attempt = 0; attempt < 5; attempt++) {
    const copy = [...items]
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[copy[i], copy[j]] = [copy[j], copy[i]]
    }
    if (copy.some((v, i) => v !== items[i])) return copy
  }
  return items
}

function ItemShell({ number, result, correctAnswer, children }: { number: number; result: ItemResult; correctAnswer: string; children: ReactNode }) {
  const { t } = useLanguage()
  return (
    <li className="flex gap-3">
      <span className="mt-1.5 w-5 shrink-0 text-right text-sm font-semibold text-slate-400">{number}.</span>
      <div className="min-w-0 flex-1 space-y-2">
        {children}
        {result === true && <p className="text-sm font-medium text-emerald-600">✓ {t('answerCorrect')}</p>}
        {result === false && (
          <p className="text-sm text-rose-600">
            ✗ {t('answerWrong')} <span className="font-medium text-slate-700">{correctAnswer}</span>
          </p>
        )}
      </div>
    </li>
  )
}

function CheckButton({ disabled, onClick }: { disabled: boolean; onClick: () => void }) {
  const { t } = useLanguage()
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="shrink-0 rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {t('checkAnswer')}
    </button>
  )
}

const inputClass =
  'rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-800 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 disabled:bg-slate-50'

export function OrderItem({ number, item, result, onCheck }: ItemProps<GrammarOrderExercise>) {
  const { t } = useLanguage()
  const punctuation = finalPunctuation(item.answer)
  // Tiles are tracked by index: a sentence can use the same word twice.
  const [tiles] = useState(() => shuffled([...sentenceTiles(item.answer), item.extra]))
  const [picked, setPicked] = useState<number[]>([])
  const checked = result !== null
  const built = joinTiles(picked.map((i) => tiles[i]), punctuation)

  return (
    <ItemShell number={number} result={result} correctAnswer={item.answer}>
      <div className="flex flex-wrap items-start gap-2">
        <div className="flex min-h-[2.5rem] flex-1 flex-wrap items-center gap-1.5 rounded-lg border-2 border-dashed border-slate-200 bg-white/70 px-2 py-1.5">
          {picked.length === 0 && <span className="px-1 text-sm text-slate-400">{t('orderPlaceholder')}</span>}
          {picked.map((tileIndex, position) => (
            <button
              key={tileIndex}
              disabled={checked}
              onClick={() => setPicked((p) => p.filter((_, i) => i !== position))}
              className="rounded-md bg-amber-100 px-2 py-0.5 text-sm text-amber-900 transition hover:bg-amber-200 disabled:hover:bg-amber-100"
            >
              {position === 0 ? tiles[tileIndex].charAt(0).toUpperCase() + tiles[tileIndex].slice(1) : tiles[tileIndex]}
            </button>
          ))}
          {picked.length > 0 && <span className="text-sm text-slate-500">{punctuation}</span>}
        </div>
        {!checked && <CheckButton disabled={picked.length === 0} onClick={() => onCheck(matchesAnswer(built, [item.answer, ...(item.alternatives ?? [])]))} />}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {tiles.map((tile, i) =>
          picked.includes(i) ? null : (
            <button
              key={i}
              disabled={checked}
              onClick={() => setPicked((p) => [...p, i])}
              className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-sm text-slate-700 shadow-sm transition hover:border-amber-300 hover:bg-amber-50 disabled:opacity-50"
            >
              {tile}
            </button>
          ),
        )}
      </div>
    </ItemShell>
  )
}

export function FormItem({ number, item, result, onCheck }: ItemProps<GrammarFormExercise>) {
  const [value, setValue] = useState('')
  const checked = result !== null
  const [before, after] = item.sentence.split(GAP)
  const check = () => {
    if (!checked && value.trim()) onCheck(matchesAnswer(value, item.answers))
  }

  return (
    <ItemShell number={number} result={result} correctAnswer={item.answers[0]}>
      <div className="flex flex-wrap items-center gap-2">
        <p className="min-w-0 flex-1 basis-full text-sm leading-8 text-slate-700 sm:basis-0">
          {before}
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && check()}
            disabled={checked}
            aria-label={`${number}.`}
            autoCapitalize="off"
            autoComplete="off"
            spellCheck={false}
            className={`${inputClass} mx-1 w-36`}
          />
          <span className="text-slate-500">({item.cue})</span>
          {after}
        </p>
        {!checked && <CheckButton disabled={!value.trim()} onClick={check} />}
      </div>
    </ItemShell>
  )
}

export function TransformItem({ number, item, result, onCheck }: ItemProps<GrammarTransformExercise>) {
  const { t } = useLanguage()
  const [value, setValue] = useState('')
  const checked = result !== null
  const check = () => {
    if (!checked && value.trim()) onCheck(matchesAnswer(value, item.answers))
  }

  return (
    <ItemShell number={number} result={result} correctAnswer={item.answers[0]}>
      <p className="pt-1 text-sm text-slate-700">
        {item.source}
        {item.cue && <span className="text-slate-500"> ({item.cue})</span>}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && check()}
          disabled={checked}
          placeholder={t('transformPlaceholder')}
          aria-label={`${number}.`}
          autoComplete="off"
          spellCheck={false}
          className={`${inputClass} min-w-0 flex-1`}
        />
        {!checked && <CheckButton disabled={!value.trim()} onClick={check} />}
      </div>
    </ItemShell>
  )
}
