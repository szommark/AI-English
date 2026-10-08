import { useEffect, useState, type DragEvent, type ReactNode } from 'react'
import { RotateCcw } from 'lucide-react'
import { useLanguage, type MessageKey } from '../../lib/i18n'
import {
  canCheck,
  canMove,
  cardStatus,
  checkBoard,
  dealCards,
  endPreview,
  initialGridState,
  isFreeCell,
  moveCard,
  movableCard,
  previewSeconds,
  type GridFeedback,
  type GridLocation,
  type GridPuzzle,
  type GridState,
} from '../../lib/vocabGrid'
import { awardClientXp } from '../../lib/gamificationApi'

const FEEDBACK_STYLE: Record<GridFeedback, string> = {
  exact: 'border-emerald-500 bg-emerald-100 text-emerald-900',
  // Brown, so a right row never reads as green; Tailwind has no brown scale.
  row: 'border-[#8b5a2b] bg-[#efe0cf] text-[#5b3a1e]',
  column: 'border-violet-500 bg-violet-100 text-violet-900',
  inMatrix: 'border-yellow-400 bg-yellow-100 text-yellow-900',
  notInMatrix: 'border-red-400 bg-red-50 text-red-800',
}

/** A moved card: its last colour on the left half (border included), white on the right. */
const FEEDBACK_HALF: Record<GridFeedback, string> = {
  exact: 'border-emerald-500 from-emerald-100',
  row: 'border-[#8b5a2b] from-[#efe0cf]',
  column: 'border-violet-500 from-violet-100',
  inMatrix: 'border-yellow-400 from-yellow-100',
  notInMatrix: 'border-red-400 from-red-50',
}

/** The light on a moved card: green when its new cell fits every clue, red when it can't. */
const SPOT_STYLE = {
  possible: 'bg-green-500 shadow-[0_0_6px_2px_rgba(34,197,94,0.75)]',
  impossible: 'bg-red-500 shadow-[0_0_6px_2px_rgba(239,68,68,0.75)]',
}

const FEEDBACK_LABEL: Record<GridFeedback, MessageKey> = {
  exact: 'vgFbExact',
  row: 'vgFbRow',
  column: 'vgFbColumn',
  inMatrix: 'vgFbInMatrix',
  notInMatrix: 'vgFbNotInMatrix',
}

const LEGEND: GridFeedback[] = ['exact', 'row', 'column', 'inMatrix', 'notInMatrix']

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
  /** Cards turned over to show their Hungarian meaning. */
  const [flipped, setFlipped] = useState<Set<string>>(() => new Set())
  const [secondsLeft, setSecondsLeft] = useState(() => previewSeconds(puzzle.previewOrder.length))
  const { size } = puzzle
  const decoyCount = puzzle.decoyIds.length

  useEffect(() => {
    if (state.phase !== 'preview') return
    if (secondsLeft <= 0) {
      setState((s) => endPreview(s))
      return
    }
    const timer = window.setTimeout(() => setSecondsLeft((n) => n - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [state.phase, secondsLeft])

  // A solved puzzle is one finished game: Vocabulary XP, 1 per word placed on the grid,
  // fire-and-forget. Each puzzle is a new draw of words, so no item ref (no 24-hour repeat
  // rule); the daily cap limits it.
  useEffect(() => {
    if (state.phase === 'solved') {
      awardClientXp({ activityType: 'vocabulary.game', units: puzzle.solution.length })
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
    if (selected && canMove(state, selected, at)) {
      apply(moveCard(state, selected, at))
    } else if (sameLocation(selected, at)) {
      setSelected(null)
    } else if (movableCard(state, at)) {
      setSelected(at)
    }
  }

  function toggleFlip(cardId: string) {
    setFlipped((prev) => {
      const next = new Set(prev)
      if (next.has(cardId)) next.delete(cardId)
      else next.add(cardId)
      return next
    })
  }

  /** Drag-and-drop handlers for a place cards can be dropped on. */
  const dropTarget = (at: GridLocation) => ({
    onDragOver: (e: DragEvent) => {
      if (selected && canMove(state, selected, at)) e.preventDefault()
    },
    onDrop: (e: DragEvent) => {
      e.preventDefault()
      if (selected && canMove(state, selected, at)) apply(moveCard(state, selected, at))
    },
  })

  /** A card's word can be turned over to its Hungarian meaning (the solved grid shows both). */
  const canFlip = (cardId: string) => state.phase !== 'solved' && Boolean(puzzle.cards[cardId].meaningHu)

  /** The word on a card's face: the English term, or its Hungarian meaning when turned over. */
  function face(cardId: string): ReactNode {
    const word = puzzle.cards[cardId]
    return canFlip(cardId) && flipped.has(cardId) ? <span className="italic">{word.meaningHu}</span> : word.term
  }

  /** The small round button at a card's bottom right corner that turns it over. */
  function flipButton(cardId: string): ReactNode {
    if (!canFlip(cardId)) return null
    const isFlipped = flipped.has(cardId)
    return (
      <button
        type="button"
        onClick={() => toggleFlip(cardId)}
        aria-pressed={isFlipped}
        aria-label={t(isFlipped ? 'vgFlipBack' : 'vgFlip')}
        title={t(isFlipped ? 'vgFlipBack' : 'vgFlip')}
        className={`absolute bottom-0.5 right-0.5 flex h-5 w-5 items-center justify-center rounded-full border shadow-sm ${
          isFlipped
            ? 'border-[var(--teal-accent-strong)] bg-[var(--teal-accent)] text-primary'
            : 'border-border bg-white text-muted-foreground hover:text-foreground'
        }`}
      >
        <RotateCcw className="h-3 w-3" aria-hidden />
      </button>
    )
  }

  function card(cardId: string, at: GridLocation, opts: { dropped?: boolean; small?: boolean } = {}): ReactNode {
    const word = puzzle.cards[cardId]
    const status = cardStatus(state, puzzle, cardId, at.kind === 'cell' ? at.index : null)
    const movable = movableCard(state, at) !== null
    const isSelected = sameLocation(selected, at)
    const colour = opts.dropped
      ? 'border-red-300 bg-red-50 text-red-700 line-through opacity-70'
      : !status
        ? 'border-border bg-card text-foreground'
        : status.moved
          ? `${FEEDBACK_HALF[status.feedback]} bg-gradient-to-r from-50% to-white to-50% text-foreground`
          : FEEDBACK_STYLE[status.feedback]
    const spot = status?.possible == null ? null : status.possible ? 'possible' : 'impossible'
    const statusText = status
      ? [t(FEEDBACK_LABEL[status.feedback]), spot && t(spot === 'possible' ? 'vgSpotPossible' : 'vgSpotImpossible')]
          .filter(Boolean)
          .join(' · ')
      : null
    const flip = opts.dropped ? null : flipButton(cardId)
    return (
      <div className={`relative ${opts.small ? '' : 'h-full'}`}>
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
          title={statusText ?? undefined}
          className={`relative flex w-full flex-col items-center justify-center rounded-lg border-2 px-1 text-center font-medium leading-tight [overflow-wrap:anywhere] ${
            opts.small ? 'min-h-[2.25rem] py-1 text-xs' : 'h-full min-h-[3rem] py-1.5 text-xs sm:text-sm'
          } ${colour} ${movable ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'} ${
            isSelected ? 'ring-2 ring-[var(--teal-accent)] ring-offset-1' : ''
          }`}
        >
          {spot && <span aria-hidden className={`absolute right-1 top-1 h-2.5 w-2.5 rounded-full ${SPOT_STYLE[spot]}`} />}
          <span className={spot || flip ? 'px-2' : undefined}>{opts.dropped ? word.term : face(cardId)}</span>
          {statusText && <span className="sr-only">{statusText}</span>}
          {state.phase === 'solved' && word.meaningHu && (
            <span className="mt-0.5 text-[10px] font-normal opacity-80 sm:text-xs">{word.meaningHu}</span>
          )}
        </button>
        {flip}
      </div>
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
            onClick={() => setState((s) => endPreview(s))}
            className="rounded-lg bg-[var(--teal-accent)] px-4 py-2 text-sm font-semibold text-primary hover:bg-[var(--teal-accent-strong)]"
          >
            {t('vgReady')}
          </button>
        </div>
        <div className="grid gap-1.5 sm:gap-2" style={gridStyle}>
          {puzzle.previewOrder.map((id) => (
            <div key={id} className="relative">
              <div className="flex h-full min-h-[3rem] items-center justify-center rounded-lg border-2 border-border bg-card px-1 py-1.5 text-center text-xs font-medium leading-tight text-foreground [overflow-wrap:anywhere] sm:text-sm">
                <span className={canFlip(id) ? 'px-2' : undefined}>{face(id)}</span>
              </div>
              {flipButton(id)}
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
        const dropped = cardId !== null && state.dropped.includes(cardId)
        const pending = selected !== null && canMove(state, selected, at)
        return (
          <div
            key={index}
            {...dropTarget(at)}
            className={`flex flex-col rounded-xl p-1 ${
              pending && isFreeCell(state, index) ? 'outline outline-2 outline-dashed outline-[var(--teal-accent)]' : ''
            }`}
          >
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

  // Without decoys nothing can be red.
  const legendItems = LEGEND.filter((f) => f !== 'notInMatrix' || decoyCount > 0)
  const legend = (
    <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
      {legendItems.map((f) => (
        <li key={f} className="flex items-center gap-1.5">
          <span className={`inline-block h-3 w-3 rounded border-2 ${FEEDBACK_STYLE[f]}`} />
          {t(FEEDBACK_LABEL[f])}
        </li>
      ))}
      {(['possible', 'impossible'] as const).map((s) => (
        <li key={s} className="flex items-center gap-1.5">
          <span className={`inline-block h-2.5 w-2.5 rounded-full ${SPOT_STYLE[s]}`} />
          {t(s === 'possible' ? 'vgSpotPossible' : 'vgSpotImpossible')}
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

      {state.phase === 'deal' && (
        <p className="text-sm text-muted-foreground">{decoyCount > 0 ? t('vgDealHint', { n: decoyCount }) : t('vgDealHintNoDecoys')}</p>
      )}
      {state.phase === 'arrange' && state.checks > 0 && <p className="text-sm text-muted-foreground">{t('vgArrangeHint')}</p>}

      {board}

      {state.phase === 'deal' && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-14 w-11 items-center justify-center rounded-lg border-2 border-[var(--teal-accent-strong)] bg-[var(--teal-accent)] text-sm font-semibold tabular-nums text-primary shadow-[2px_2px_0_0_rgba(0,0,0,0.15)]" title={t('vgDeck')}>
            {state.deck.length}
          </div>
          <button
            type="button"
            onClick={() => apply(dealCards(state, puzzle))}
            className="rounded-lg bg-[var(--teal-accent)] px-5 py-2.5 text-sm font-semibold text-primary hover:bg-[var(--teal-accent-strong)]"
          >
            {t('vgDeal')}
          </button>
        </div>
      )}

      {state.phase === 'arrange' && state.tray.length > 0 && trayZone(t('vgTray'))}

      {state.dropped.length > 0 && (
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
            disabled={!canCheck(state)}
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
