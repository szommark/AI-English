import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useLanguage } from '../../lib/i18n'
import {
  cellKey,
  crosswordCells,
  entryCells,
  isEntryFilled,
  isSolved,
  wrongCells,
  type ClueLanguage,
  type CrosswordEntry,
  type CrosswordFills,
  type CrosswordPuzzle,
  type Direction,
} from '../../lib/vocabCrossword'
import { awardClientXp } from '../../lib/gamificationApi'

type Phase = 'playing' | 'solved' | 'revealed'

const other = (d: Direction): Direction => (d === 'across' ? 'down' : 'across')

const ARROWS: Record<string, [number, number]> = {
  ArrowUp: [-1, 0],
  ArrowDown: [1, 0],
  ArrowLeft: [0, -1],
  ArrowRight: [0, 1],
}

/**
 * One crossword. Each square is an input: tap one and type; tapping it again switches
 * direction, arrows move, Tab / Enter jump to the next word. The puzzle comes from
 * src/lib/vocabCrossword.ts.
 */
export default function CrosswordGame({
  puzzle,
  clueLanguage,
  onPlayAgain,
  onQuit,
}: {
  puzzle: CrosswordPuzzle
  clueLanguage: ClueLanguage
  onPlayAgain: () => void
  onQuit: () => void
}) {
  const { t } = useLanguage()
  const cells = useMemo(() => crosswordCells(puzzle), [puzzle])
  const entryById = useMemo(() => new Map(puzzle.entries.map((e) => [e.id, e])), [puzzle])
  const solution = entryById.get(puzzle.solutionId)!
  const [fills, setFills] = useState<CrosswordFills>({})
  const [active, setActive] = useState(() => ({
    key: entryCells(puzzle.entries[0])[0],
    direction: puzzle.entries[0].direction,
  }))
  /** Letters the last check found wrong; a cell leaves the set when it is changed. */
  const [wrong, setWrong] = useState<Set<string>>(() => new Set())
  /** Wrong letters found by the last check, until the next change; null: no check to show. */
  const [checkResult, setCheckResult] = useState<number | null>(null)
  const [revealed, setRevealed] = useState<Set<string>>(() => new Set())
  const [hintShown, setHintShown] = useState(false)
  const [phase, setPhase] = useState<Phase>('playing')
  const inputs = useRef(new Map<string, HTMLInputElement>())
  /** Whether the square tapped was already the active one (a second tap switches direction). */
  const wasActive = useRef(false)
  const done = phase !== 'playing'

  const activeCell = cells.get(active.key)!
  const activeEntry = entryById.get((activeCell[active.direction] ?? activeCell[other(active.direction)])!)!
  const activeCells = useMemo(() => new Set(entryCells(activeEntry)), [activeEntry])

  // A solved crossword is one finished game: Vocabulary XP, 1 per word, like the word grid.
  // Showing the answers earns nothing.
  useEffect(() => {
    if (phase === 'solved') awardClientXp({ activityType: 'vocabulary.game', units: puzzle.entries.length })
    // Only the moment the puzzle is solved should award.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  /** The direction to use in a square: the preferred one if a word runs that way there. */
  const directionAt = (key: string, preferred: Direction) => (cells.get(key)![preferred] ? preferred : other(preferred))

  function focus(key: string, direction: Direction) {
    setActive({ key, direction: directionAt(key, direction) })
    inputs.current.get(key)?.focus()
  }

  /** Jump to a word: its first empty square, or its first square. */
  function focusEntry(entry: CrosswordEntry) {
    const keys = entryCells(entry)
    focus(keys.find((k) => !fills[k]) ?? keys[0], entry.direction)
  }

  function moveEntry(delta: number) {
    const i = puzzle.entries.indexOf(activeEntry)
    focusEntry(puzzle.entries[(i + delta + puzzle.entries.length) % puzzle.entries.length])
  }

  /** The square before or after one in the active word, or null at its ends. */
  function along(key: string, delta: number): string | null {
    const keys = entryCells(activeEntry)
    return keys[keys.indexOf(key) + delta] ?? null
  }

  /** Writes letters ('' clears a square); a changed square loses its check and reveal marks. */
  function write(changes: Record<string, string>) {
    const next = { ...fills }
    for (const [key, letter] of Object.entries(changes)) {
      if (letter) next[key] = letter
      else delete next[key]
    }
    setFills(next)
    const without = (set: Set<string>) => {
      const kept = [...set].filter((key) => !(key in changes))
      return kept.length === set.size ? set : new Set(kept)
    }
    setWrong(without)
    setRevealed(without)
    setCheckResult(null)
    if (isSolved(cells, next)) setPhase('solved')
  }

  const setLetter = (key: string, letter: string) => write({ [key]: letter })

  /**
   * Typed letters go into the active word from this square on (several at once when pasted
   * or autocompleted); then the next square is active.
   */
  function type(key: string, letters: string) {
    const keys = entryCells(activeEntry)
    const start = Math.max(0, keys.indexOf(key))
    const typed = keys.slice(start, start + letters.length)
    write(Object.fromEntries(typed.map((k, i) => [k, letters[i]])))
    focus(keys[start + typed.length] ?? typed.at(-1)!, active.direction)
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>, key: string) {
    if (done || e.ctrlKey || e.metaKey || e.altKey) return
    const cell = cells.get(key)!
    if (/^[a-z]$/i.test(e.key)) {
      e.preventDefault()
      type(key, e.key.toUpperCase())
    } else if (e.key === 'Backspace') {
      e.preventDefault()
      const prev = along(key, -1)
      if (fills[key] || !prev) setLetter(key, '')
      else {
        setLetter(prev, '')
        focus(prev, active.direction)
      }
    } else if (e.key === 'Delete') {
      e.preventDefault()
      setLetter(key, '')
    } else if (e.key in ARROWS) {
      e.preventDefault()
      const [dr, dc] = ARROWS[e.key]
      const direction: Direction = dr === 0 ? 'across' : 'down'
      const target = cellKey(cell.row + dr, cell.col + dc)
      if (cells.has(target)) focus(target, direction)
      else if (cell[direction]) setActive({ key, direction })
    } else if (e.key === 'Tab' || e.key === 'Enter') {
      e.preventDefault()
      moveEntry(e.shiftKey ? -1 : 1)
    } else if (e.key === ' ') {
      e.preventDefault()
      if (cell[other(active.direction)]) setActive({ key, direction: other(active.direction) })
    }
  }

  function check() {
    const found = wrongCells(cells, fills)
    setWrong(new Set(found))
    setCheckResult(found.length)
  }

  function revealLetter() {
    setLetter(active.key, activeCell.answer)
    setRevealed((r) => new Set(r).add(active.key))
  }

  function revealAll() {
    const all: CrosswordFills = {}
    for (const [key, cell] of cells) all[key] = cell.answer
    setRevealed(new Set([...cells.keys()].filter((key) => fills[key] !== cells.get(key)!.answer)))
    setFills(all)
    setWrong(new Set())
    setCheckResult(null)
    setPhase('revealed')
  }

  function cellClass(key: string): string {
    const cell = cells.get(key)!
    if (phase === 'solved') return cell.inSolution ? 'bg-amber-200 text-amber-950' : 'bg-emerald-50 text-emerald-900'
    const text = wrong.has(key) ? 'text-red-700' : revealed.has(key) ? 'text-sky-700' : 'text-foreground'
    const bg = wrong.has(key)
      ? 'bg-red-100'
      : !done && key === active.key
        ? 'bg-[var(--teal-accent)]'
        : !done && activeCells.has(key)
          ? 'bg-[var(--teal-accent-soft)]'
          : cell.inSolution
            ? 'bg-amber-100'
            : 'bg-card'
    return `${bg} ${text}`
  }

  /** A word's clue, with the language marked when it isn't the one chosen. */
  function clue(entry: CrosswordEntry, opts: { hint?: boolean } = {}) {
    if (entry.isSolution && !opts.hint) {
      return (
        <span>
          <span className="font-medium">★ {t('cwSolutionClue', { n: entry.answer.length })}</span>
          {hintShown && !done && <> — {clue(entry, { hint: true })}</>}
        </span>
      )
    }
    return (
      <span>
        {entry.clue.text}
        {entry.clue.lang !== clueLanguage && (
          <span className="ml-1.5 rounded bg-secondary px-1 py-px text-[10px] font-semibold uppercase text-muted-foreground">{entry.clue.lang}</span>
        )}
      </span>
    )
  }

  const clueList = (direction: Direction) => (
    <div className="space-y-1.5">
      <h3 className="text-sm font-semibold text-foreground">{t(direction === 'across' ? 'cwAcross' : 'cwDown')}</h3>
      <ol className="space-y-0.5">
        {puzzle.entries
          .filter((e) => e.direction === direction)
          .map((e) => (
            <li key={e.id}>
              <button
                type="button"
                onClick={() => focusEntry(e)}
                className={`flex w-full gap-2 rounded-md px-2 py-1 text-left text-sm ${
                  !done && e === activeEntry ? 'bg-[var(--teal-accent-soft)]' : 'hover:bg-secondary'
                } ${e.isSolution ? 'text-amber-900' : isEntryFilled(e, fills) ? 'text-muted-foreground' : 'text-foreground'}`}
              >
                <span className="w-5 shrink-0 text-right font-semibold tabular-nums">{e.number}</span>
                {clue(e)}
              </button>
            </li>
          ))}
      </ol>
    </div>
  )

  const solutionWord = solution.term

  return (
    <div className="space-y-4">
      {!done && (
        <>
          <p className="text-xs text-muted-foreground">{t('cwHowTo')}</p>
          <div className="flex items-stretch gap-1 rounded-lg bg-[var(--teal-accent-soft)]">
            <button
              type="button"
              onClick={() => moveEntry(-1)}
              aria-label={t('cwPrevClue')}
              title={t('cwPrevClue')}
              className="shrink-0 rounded-l-lg px-2 text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
            </button>
            <p className="flex-1 py-2 text-sm text-foreground" aria-live="polite">
              <span className="mr-2 font-semibold">
                {activeEntry.number} {t(activeEntry.direction === 'across' ? 'cwAcross' : 'cwDown')}
              </span>
              {clue(activeEntry)}
            </p>
            <button
              type="button"
              onClick={() => moveEntry(1)}
              aria-label={t('cwNextClue')}
              title={t('cwNextClue')}
              className="shrink-0 rounded-r-lg px-2 text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </>
      )}

      <div
        className="mx-auto grid w-full gap-[2px]"
        style={{ gridTemplateColumns: `repeat(${puzzle.cols}, minmax(0, 1fr))`, maxWidth: `${puzzle.cols * 2.5}rem` }}
      >
        {Array.from({ length: puzzle.rows * puzzle.cols }, (_, i) => {
          const row = Math.floor(i / puzzle.cols)
          const col = i % puzzle.cols
          const key = cellKey(row, col)
          const cell = cells.get(key)
          if (!cell) return <div key={key} aria-hidden className="aspect-square" />
          return (
            <div key={key} className={`relative aspect-square rounded-[3px] border border-slate-400 ${cellClass(key)}`}>
              {cell.number !== null && (
                <span className="pointer-events-none absolute left-0.5 top-px text-[8px] font-medium leading-none opacity-70 sm:text-[10px]">
                  {cell.number}
                </span>
              )}
              <input
                ref={(el) => {
                  if (el) inputs.current.set(key, el)
                  else inputs.current.delete(key)
                }}
                value={fills[key] ?? ''}
                readOnly={done}
                aria-label={t('cwCell', { row: row + 1, col: col + 1 })}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="characters"
                spellCheck={false}
                onPointerDown={() => {
                  wasActive.current = active.key === key && document.activeElement === inputs.current.get(key)
                }}
                onClick={(e) => {
                  // Keep the letter selected, so typing replaces it.
                  e.currentTarget.select()
                  if (wasActive.current && cell[other(active.direction)]) setActive({ key, direction: other(active.direction) })
                }}
                onFocus={(e) => {
                  e.target.select()
                  if (active.key !== key) setActive({ key, direction: directionAt(key, active.direction) })
                }}
                onKeyDown={(e) => onKeyDown(e, key)}
                // Phone keyboards don't report letters on keydown, and pasted text has none:
                // the typed text arrives here.
                onChange={(e) => {
                  if (done) return
                  const letters = e.target.value.toUpperCase().replace(/[^A-Z]/g, '')
                  if (letters) type(key, letters)
                  else setLetter(key, '')
                }}
                className="absolute inset-0 h-full w-full cursor-pointer bg-transparent text-center text-sm font-semibold uppercase caret-transparent outline-none sm:text-lg"
              />
            </div>
          )
        })}
      </div>

      <div className="space-y-2 rounded-xl border border-amber-300 bg-amber-50 p-3">
        <p className="text-sm font-semibold text-amber-900">★ {t('cwSolution')}</p>
        <div className="flex flex-wrap gap-1">
          {entryCells(solution).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => !done && focus(key, solution.direction)}
              aria-label={t('cwCell', { row: cells.get(key)!.row + 1, col: cells.get(key)!.col + 1 })}
              className="flex h-8 w-8 items-center justify-center rounded border border-amber-400 bg-white text-sm font-semibold text-amber-950"
            >
              {fills[key] ?? ''}
            </button>
          ))}
        </div>
        {phase === 'playing' && !hintShown && (
          <button type="button" onClick={() => setHintShown(true)} className="text-sm font-medium text-amber-900 underline underline-offset-2">
            {t('cwShowHint')}
          </button>
        )}
        {(hintShown || done) && (
          <p className="text-sm text-amber-900">
            <span className="font-medium">{t('cwHint')}:</span> {clue(solution, { hint: true })}
          </p>
        )}
      </div>

      {phase === 'solved' && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-800">
          🎉 {t('cwSolved', { word: solutionWord })}
        </p>
      )}
      {phase === 'revealed' && (
        <p className="rounded-xl border border-border bg-secondary p-3 text-sm text-foreground">{t('cwRevealed', { word: solutionWord })}</p>
      )}

      {checkResult !== null && (
        <p className={`text-sm ${checkResult === 0 ? 'text-emerald-700' : 'text-red-700'}`}>
          {checkResult === 0 ? t('cwCheckAllRight') : t('cwCheckWrong', { n: checkResult })}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {!done && (
          <>
            <button
              type="button"
              onClick={check}
              disabled={Object.keys(fills).length === 0}
              className="rounded-lg bg-[var(--teal-accent)] px-5 py-2.5 text-sm font-semibold text-primary hover:bg-[var(--teal-accent-strong)] disabled:opacity-40"
            >
              {t('vgCheck')}
            </button>
            <button
              type="button"
              onClick={revealLetter}
              disabled={fills[active.key] === activeCell.answer}
              className="rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground hover:bg-secondary disabled:opacity-40"
            >
              {t('cwRevealLetter')}
            </button>
            <button
              type="button"
              onClick={revealAll}
              className="rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground hover:bg-secondary"
            >
              {t('cwRevealAll')}
            </button>
          </>
        )}
        {done && (
          <button
            type="button"
            onClick={onPlayAgain}
            className="rounded-lg bg-[var(--teal-accent)] px-5 py-2.5 text-sm font-semibold text-primary hover:bg-[var(--teal-accent-strong)]"
          >
            {t('cwPlayAgain')}
          </button>
        )}
        <button
          type="button"
          onClick={onQuit}
          className="rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground hover:bg-secondary"
        >
          {t('vgQuit')}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {clueList('across')}
        {clueList('down')}
      </div>

      {done && (
        <div className="space-y-1.5">
          <h3 className="text-sm font-semibold text-foreground">{t('cwWords')}</h3>
          <ul className="space-y-0.5 text-sm">
            {puzzle.entries.map((e) => (
              <li key={e.id} className={e.isSolution ? 'text-amber-900' : 'text-foreground'}>
                {e.isSolution && '★ '}
                <span className="font-semibold">{e.term}</span>
                {e.meaningHu && <span className="text-muted-foreground"> — {e.meaningHu}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
