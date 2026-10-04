import { useEffect, useState, type DragEvent, type ReactNode } from 'react'
import { useLanguage, type MessageKey } from '../../lib/i18n'
import {
  canCheck,
  canMove,
  checkBoard,
  drawCard,
  gridGameScore,
  initialGridState,
  isFreeCell,
  moveCard,
  movableCard,
  previewSeconds,
  startDrawing,
  type GridFeedback,
  type GridLocation,
  type GridPuzzle,
  type GridState,
} from '../../lib/vocabGrid'
import { awardClientXp } from '../../lib/gamificationApi'

const FEEDBACK_STYLE: Record<GridFeedback, string> = {
  exact: 'border-emerald-500 bg-emerald-100 text-emerald-900',
  row: 'border-sky-500 bg-sky-100 text-sky-900',
  column: 'border-violet-500 bg-violet-100 text-violet-900',
  inMatrix: 'border-amber-400 bg-amber-100 text-amber-900',
  notInMatrix: 'border-red-400 bg-red-50 text-red-800',
  wrong: 'border-red-400 bg-red-50 text-red-800',
}

const FEEDBACK_LABEL: Record<GridFeedback, MessageKey> = {
  exact: 'vgFbExact',
  row: 'vgFbRow',
  column: 'vgFbColumn',
  inMatrix: 'vgFbInMatrix',
  notInMatrix: 'vgFbNotInMatrix',
  wrong: 'vgFbWrong',
}

const LEGEND: Record<'hints' | 'plain', GridFeedback[]> = {
  hints: ['exact', 'wrong'],
  plain: ['exact', 'row', 'column', 'inMatrix', 'notInMatrix'],
}

const sameLocation = (a: GridLocation | null, b: GridLocation) =>
  a !== null &&
  a.kind === b.kind &&
  (a.kind !== 'cell' || (b.kind === 'cell' && a.index === b.index)) &&
  (a.kind !== 'tray' || (b.kind === 'tray' && a.cardId === b.cardId))

/**
 * One word grid game. Cards move by drag and drop, or by tapping a card and then its
 * place (touch screens). The rules live in src/lib/vocabGrid.ts.
 */
export default function GridGame({
  puzzle,
  onPlayAgain,
  onQuit,
}: {
  puzzle: GridPuzzle
  onPlayAgain: () => void
  onQuit: () => void
}) {
  const { t } = useLanguage()
  const [state, setState] = useState<GridState>(() => initialGridState(puzzle))
  /** The card being dragged, or tapped and waiting for its place. */
  const [selected, setSelected] = useState<GridLocation | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(() => previewSeconds(puzzle.size))
  const { size, hints } = puzzle

  useEffect(() => {
    if (state.phase !== 'preview') return
    if (secondsLeft <= 0) {
      setState((s) => startDrawing(s))
      return
    }
    const timer = window.setTimeout(() => setSecondsLeft((n) => n - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [state.phase, secondsLeft])

  // A solved puzzle is one finished game: Vocabulary XP, fire-and-forget. Each puzzle is a new
  // draw of words, so no item ref (no 24-hour repeat rule); the daily cap limits it.
  useEffect(() => {
    if (state.phase === 'solved') {
      awardClientXp({ activityType: 'vocabulary.game', performanceScore: gridGameScore(state.checks) })
    }
    // Only the moment the puzzle is solved should award.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase])

  function apply(next: GridState) {
    setState(next)
    setSelected(null)
  }

  /** A tap on a card or a place: finish a pending move there, or pick this card up. */
  function tap(at: GridLocation) {
    if (selected && canMove(state, puzzle, selected, at)) {
      apply(moveCard(state, puzzle, selected, at))
    } else if (sameLocation(selected, at)) {
      setSelected(null)
    } else if (movableCard(state, at)) {
      setSelected(at)
    }
  }

  function draw() {
    const next = drawCard(state)
    setState(next)
    if (next.hand) setSelected({ kind: 'hand' })
  }

  /** Drag-and-drop handlers for a place cards can be dropped on. */
  const dropTarget = (at: GridLocation) => ({
    onDragOver: (e: DragEvent) => {
      if (selected && canMove(state, puzzle, selected, at)) e.preventDefault()
    },
    onDrop: (e: DragEvent) => {
      e.preventDefault()
      if (selected && canMove(state, puzzle, selected, at)) apply(moveCard(state, puzzle, selected, at))
    },
  })

  function card(cardId: string, at: GridLocation, opts: { dropped?: boolean; small?: boolean } = {}): ReactNode {
    const word = puzzle.cards[cardId]
    const feedback = state.feedback[cardId]
    const movable = movableCard(state, at) !== null
    const isSelected = sameLocation(selected, at)
    const colour = opts.dropped
      ? 'border-red-300 bg-red-50 text-red-700 line-through opacity-70'
      : feedback
        ? FEEDBACK_STYLE[feedback]
        : 'border-border bg-card text-foreground'
    return (
      <button
        type="button"
        draggable={movable}
        onDragStart={(e) => {
          e.dataTransfer.setData('text/plain', word.term)
          e.dataTransfer.effectAllowed = 'move'
          setSelected(at)
        }}
        onDragEnd={() => setSelected((s) => (sameLocation(s, at) ? null : s))}
        onClick={() => tap(at)}
        aria-pressed={isSelected}
        title={feedback ? t(FEEDBACK_LABEL[feedback]) : undefined}
        className={`flex w-full flex-col items-center justify-center rounded-lg border-2 px-1 text-center font-medium leading-tight [overflow-wrap:anywhere] ${
          opts.small ? 'min-h-[2.25rem] py-1 text-xs' : 'h-full min-h-[3rem] py-1.5 text-xs sm:text-sm'
        } ${colour} ${movable ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'} ${
          isSelected ? 'ring-2 ring-[var(--teal-accent)] ring-offset-1' : ''
        }`}
      >
        <span>{word.term}</span>
        {state.phase === 'solved' && !hints && word.meaningHu && (
          <span className="mt-0.5 text-[10px] font-normal opacity-80 sm:text-xs">{word.meaningHu}</span>
        )}
      </button>
    )
  }

  const gridStyle = { gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }

  if (state.phase === 'preview') {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-foreground">{t('vgPreview', { n: secondsLeft })}</p>
          <button
            type="button"
            onClick={() => setState((s) => startDrawing(s))}
            className="rounded-lg bg-[var(--teal-accent)] px-4 py-2 text-sm font-semibold text-primary hover:bg-[var(--teal-accent-strong)]"
          >
            {t('vgReady')}
          </button>
        </div>
        <div className="grid gap-1.5 sm:gap-2" style={gridStyle}>
          {puzzle.previewOrder.map((id) => (
            <div
              key={id}
              className="flex min-h-[3rem] items-center justify-center rounded-lg border-2 border-border bg-card px-1 py-1.5 text-center text-xs font-medium leading-tight text-foreground [overflow-wrap:anywhere] sm:text-sm"
            >
              {puzzle.cards[id].term}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const board = (
    <div className="grid gap-1.5 sm:gap-2" style={gridStyle}>
      {state.board.map((cardId, index) => {
        const at: GridLocation = { kind: 'cell', index }
        const meaning = hints ? puzzle.cards[puzzle.solution[index]].meaningHu : null
        const dropped = cardId !== null && state.dropped.includes(cardId)
        const pending = selected !== null && canMove(state, puzzle, selected, at)
        return (
          <div
            key={index}
            {...dropTarget(at)}
            className={`flex flex-col gap-1 rounded-xl p-1 ${hints ? 'bg-secondary' : ''} ${
              pending && isFreeCell(state, index) ? 'outline outline-2 outline-dashed outline-[var(--teal-accent)]' : ''
            }`}
          >
            {meaning && <p className="px-0.5 text-center text-[11px] leading-tight text-muted-foreground [overflow-wrap:anywhere] sm:text-xs">{meaning}</p>}
            <div className="flex-1">
              {cardId !== null ? (
                card(cardId, at, { dropped })
              ) : (
                <button
                  type="button"
                  onClick={() => tap(at)}
                  aria-label={t('vgEmptyCell')}
                  className="h-full min-h-[3rem] w-full rounded-lg border-2 border-dashed border-border bg-card"
                />
              )}
            </div>
          </div>
        )
      })}
    </div>
  )

  const legend = (
    <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
      {LEGEND[hints ? 'hints' : 'plain'].map((f) => (
        <li key={f} className="flex items-center gap-1.5">
          <span className={`inline-block h-3 w-3 rounded border-2 ${FEEDBACK_STYLE[f]}`} />
          {t(FEEDBACK_LABEL[f])}
        </li>
      ))}
    </ul>
  )

  const trayZone = (label: string) => (
    <div
      {...dropTarget({ kind: 'tray', cardId: '' })}
      onClick={(e) => {
        if (e.target === e.currentTarget) tap({ kind: 'tray', cardId: '' })
      }}
      className="space-y-1.5 rounded-xl border border-dashed border-border p-2"
    >
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
        {state.tray.map((id) => (
          <div key={id}>{card(id, { kind: 'tray', cardId: id }, { small: true })}</div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">{t('vgRound', { n: Math.max(1, state.checks + (state.phase === 'solved' ? 0 : 1)) })}</p>
        {state.checks > 0 && legend}
      </div>

      {state.phase === 'arrange' && hints && state.checks === 0 && <p className="text-sm text-muted-foreground">{t('vgHintsOn')}</p>}
      {state.phase === 'draw' && <p className="text-sm text-muted-foreground">{t('vgDrawHint')}</p>}
      {state.phase === 'arrange' && state.checks > 0 && <p className="text-sm text-muted-foreground">{t('vgArrangeHint')}</p>}

      {board}

      {state.phase === 'draw' && (
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <button
            type="button"
            onClick={draw}
            disabled={state.hand !== null || state.deck.length === 0}
            className="flex min-h-[4.5rem] flex-col items-center justify-center rounded-xl border-2 border-[var(--teal-accent-strong)] bg-[var(--teal-accent)] text-primary shadow-sm disabled:opacity-40"
          >
            <span className="text-sm font-semibold">{t('vgDraw')}</span>
            <span className="text-xs">
              {t('vgDeck')}: {state.deck.length}
            </span>
          </button>
          <div className="space-y-1">
            <p className="text-center text-xs text-muted-foreground">{t('vgHand')}</p>
            {state.hand ? card(state.hand, { kind: 'hand' }) : <div className="min-h-[3rem] rounded-lg border-2 border-dashed border-border" />}
          </div>
          <div
            {...dropTarget({ kind: 'discard' })}
            onClick={() => tap({ kind: 'discard' })}
            className={`space-y-1 rounded-xl border-2 border-dashed p-1.5 ${
              selected?.kind === 'hand' && state.discard.length < size ? 'border-red-400 bg-red-50' : 'border-border'
            }`}
          >
            <p className="text-center text-xs text-muted-foreground">
              {t('vgDiscard')} ({state.discard.length}/{size})
            </p>
            <ul className="space-y-0.5">
              {state.discard.map((id) => (
                <li key={id} className="truncate rounded bg-secondary px-1.5 py-0.5 text-center text-xs text-foreground">
                  {puzzle.cards[id].term}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {state.phase === 'arrange' && (hints || state.tray.length > 0) && trayZone(t(hints ? 'vgPool' : 'vgTray'))}

      {!hints && state.dropped.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">{t('vgDropped')}</p>
          <ul className="flex flex-wrap gap-1.5">
            {state.dropped.map((id) => (
              <li key={id} className="rounded-md border border-red-300 bg-red-50 px-2 py-0.5 text-xs text-red-700 line-through">
                {puzzle.cards[id].term}
              </li>
            ))}
          </ul>
        </div>
      )}

      {state.phase === 'solved' && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-800">
          🎉 {t('vgSolved', { n: state.checks })}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {state.phase === 'arrange' && state.checks > 0 && (
          <button
            type="button"
            onClick={() => apply(checkBoard(state, puzzle))}
            disabled={!canCheck(state, puzzle)}
            className="rounded-lg bg-[var(--teal-accent)] px-5 py-2.5 text-sm font-semibold text-primary hover:bg-[var(--teal-accent-strong)] disabled:opacity-40"
          >
            {t('vgCheck')}
          </button>
        )}
        {state.phase === 'solved' && (
          <button
            type="button"
            onClick={onPlayAgain}
            className="rounded-lg bg-[var(--teal-accent)] px-5 py-2.5 text-sm font-semibold text-primary hover:bg-[var(--teal-accent-strong)]"
          >
            {t('vgPlayAgain')}
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
    </div>
  )
}
