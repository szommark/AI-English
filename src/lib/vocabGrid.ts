// Word grid game (Vocabulary › Games): find each word's cell in an N×N matrix.
// Pure logic — the puzzle, the moves and the colour feedback — so the component only renders.
import { normalizeTerm, type WordlistWord } from './vocab'

export const GRID_SIZES = [3, 4, 5] as const
export type GridSize = (typeof GRID_SIZES)[number]

/** Words in a game: the N×N matrix, plus (optionally) one row of decoys that belong nowhere. */
export function gridWordCount(size: number, decoys: boolean): number {
  return size * size + (decoys ? size : 0)
}

/** The shortest list the game can use: a 3×3 grid without decoys. */
export const GRID_MIN_WORDS = gridWordCount(GRID_SIZES[0], false)

/** How long the no-hint preview shows the words: longer for more words (12 words → 11 s). */
export function previewSeconds(wordCount: number): number {
  return Math.round(5 + wordCount / 2)
}

/**
 * Where a card sits after a check. Hint mode only uses exact / wrong; without hints:
 * exact cell, right row, right column, somewhere else in the matrix, or a decoy.
 */
export type GridFeedback = 'exact' | 'row' | 'column' | 'inMatrix' | 'notInMatrix' | 'wrong'

export interface GridCard {
  id: string
  term: string
  meaningHu: string | null
}

export interface GridPuzzle {
  size: number
  /** Hint mode: each cell shows its word's Hungarian meaning. */
  hints: boolean
  cards: Record<string, GridCard>
  /** The card id that belongs in each cell, row by row. */
  solution: string[]
  /** The extra row of words that belong in no cell; empty when the game has no decoys. */
  decoyIds: string[]
  /** All the words, mixed, for the no-hint preview: size rows of size, plus a row of decoys. */
  previewOrder: string[]
}

export type Rng = () => number

export function shuffle<T>(items: readonly T[], rng: Rng = Math.random): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/**
 * The list's words a game can use: one per term, and in hint mode only words with a
 * Hungarian meaning, one per meaning — so every cell's hint points at exactly one word.
 */
export function gridEligibleWords(words: readonly WordlistWord[], hints: boolean): WordlistWord[] {
  const terms = new Set<string>()
  const meanings = new Set<string>()
  const out: WordlistWord[] = []
  for (const w of words) {
    const term = normalizeTerm(w.term)
    const meaning = normalizeTerm(w.meaningHu ?? '')
    if (!term || terms.has(term)) continue
    if (hints && (!meaning || meanings.has(meaning))) continue
    terms.add(term)
    meanings.add(meaning)
    out.push(w)
  }
  return out
}

/** A random puzzle from the list's words, or null when the list has too few of them. */
export function createGridPuzzle(
  words: readonly WordlistWord[],
  size: number,
  hints: boolean,
  decoys: boolean,
  rng: Rng = Math.random,
): GridPuzzle | null {
  const eligible = gridEligibleWords(words, hints)
  const count = gridWordCount(size, decoys)
  if (eligible.length < count) return null
  const chosen = shuffle(eligible, rng).slice(0, count)
  const cards: Record<string, GridCard> = {}
  for (const w of chosen) cards[w.itemId] = { id: w.itemId, term: w.term, meaningHu: w.meaningHu }
  const ids = chosen.map((w) => w.itemId)
  return {
    size,
    hints,
    cards,
    solution: ids.slice(0, size * size),
    decoyIds: ids.slice(size * size),
    previewOrder: shuffle(ids, rng),
  }
}

/** Feedback for a card standing in a cell. */
export function cellFeedback(puzzle: GridPuzzle, cardId: string, cell: number): GridFeedback {
  const target = puzzle.solution.indexOf(cardId)
  if (target === cell) return 'exact'
  if (puzzle.hints) return 'wrong'
  if (target < 0) return 'notInMatrix'
  const { size } = puzzle
  if (Math.floor(target / size) === Math.floor(cell / size)) return 'row'
  if (target % size === cell % size) return 'column'
  return 'inMatrix'
}

// --- Game state ---------------------------------------------------------------------------

/**
 * preview: the no-hint words on show; draw: cards come off the deck one by one;
 * arrange: the cards are rearranged between checks; solved: every cell is green.
 */
export type GridPhase = 'preview' | 'draw' | 'arrange' | 'solved'

export interface GridState {
  phase: GridPhase
  /** The card id in each cell, or null. */
  board: (string | null)[]
  /** Cards off the board: hint mode's word pool, or the no-hint words to place again. */
  tray: string[]
  /** No hints: face-down cards still to draw. */
  deck: string[]
  /** No hints: the card just drawn, waiting for a cell or the discard pile. */
  hand: string | null
  /** No hints: cards put aside as not in the matrix, at most as many as there are decoys. */
  discard: string[]
  /** No hints: decoys revealed by a check; out of the game. One may still stand in a cell until replaced. */
  dropped: string[]
  /** The last check's colour of each card, kept until the card moves. */
  feedback: Record<string, GridFeedback>
  /** Checks done so far; the draw counts as the first round. */
  checks: number
}

export type GridLocation =
  | { kind: 'cell'; index: number }
  | { kind: 'tray'; cardId: string }
  | { kind: 'hand' }
  | { kind: 'discard' }

export function initialGridState(puzzle: GridPuzzle, rng: Rng = Math.random): GridState {
  const all = [...puzzle.solution, ...puzzle.decoyIds]
  return {
    phase: puzzle.hints ? 'arrange' : 'preview',
    board: Array.from({ length: puzzle.size * puzzle.size }, () => null),
    tray: puzzle.hints ? shuffle(all, rng) : [],
    deck: puzzle.hints ? [] : shuffle(all, rng),
    hand: null,
    discard: [],
    dropped: [],
    feedback: {},
    checks: 0,
  }
}

/** The preview is over: shuffle every card into the deck. */
export function startDrawing(state: GridState, rng: Rng = Math.random): GridState {
  if (state.phase !== 'preview') return state
  return { ...state, phase: 'draw', deck: shuffle(state.deck, rng) }
}

export function drawCard(state: GridState): GridState {
  if (state.phase !== 'draw' || state.hand || state.deck.length === 0) return state
  return { ...state, hand: state.deck[0], deck: state.deck.slice(1) }
}

const isLocked = (state: GridState, cardId: string | null) => cardId !== null && state.feedback[cardId] === 'exact'
const isDropped = (state: GridState, cardId: string | null) => cardId !== null && state.dropped.includes(cardId)

/** The card at a location that can be picked up, or null (empty, green or dropped). */
export function movableCard(state: GridState, from: GridLocation): string | null {
  let cardId: string | null = null
  if (from.kind === 'cell') cardId = state.board[from.index] ?? null
  else if (from.kind === 'tray') cardId = state.tray.includes(from.cardId) ? from.cardId : null
  else if (from.kind === 'hand') cardId = state.hand
  if (state.phase === 'draw' && from.kind !== 'hand') return null
  if (state.phase !== 'draw' && state.phase !== 'arrange') return null
  if (isLocked(state, cardId) || isDropped(state, cardId)) return null
  return cardId
}

/** A cell counts as free when it is empty or holds a dropped decoy. */
export function isFreeCell(state: GridState, index: number): boolean {
  const occupant = state.board[index]
  return occupant === null || isDropped(state, occupant)
}

/** Whether the board is ready to check: every cell holds a word still in the game. */
export function boardComplete(state: GridState): boolean {
  return state.board.every((_, i) => !isFreeCell(state, i))
}

export function canMove(state: GridState, puzzle: GridPuzzle, from: GridLocation, to: GridLocation): boolean {
  const cardId = movableCard(state, from)
  if (!cardId) return false
  if (to.kind === 'cell') {
    if (from.kind === 'cell' && from.index === to.index) return false
    const occupant = state.board[to.index]
    return !isLocked(state, occupant)
  }
  if (to.kind === 'discard') return from.kind === 'hand' && state.discard.length < puzzle.decoyIds.length
  if (to.kind === 'tray') return state.phase === 'arrange' && from.kind === 'cell'
  return false
}

/**
 * Moves a card. Onto a cell holding another card, the two swap (a card from the tray or
 * the hand sends the occupant to the tray or the hand); a dropped decoy is simply replaced.
 * Moved cards lose their colour. In the draw phase the last card triggers the check, and in
 * hint mode so does filling the last cell before the first check.
 */
export function moveCard(state: GridState, puzzle: GridPuzzle, from: GridLocation, to: GridLocation): GridState {
  if (!canMove(state, puzzle, from, to)) return state
  const cardId = movableCard(state, from)!
  const board = [...state.board]
  let tray = state.tray.filter((id) => id !== cardId)
  let hand = from.kind === 'hand' ? null : state.hand
  let discard = state.discard
  const feedback = { ...state.feedback }
  delete feedback[cardId]
  if (from.kind === 'cell') board[from.index] = null

  if (to.kind === 'cell') {
    const occupant = board[to.index]
    board[to.index] = cardId
    if (occupant !== null && !isDropped(state, occupant)) {
      delete feedback[occupant]
      if (from.kind === 'cell') board[from.index] = occupant
      else if (from.kind === 'tray') tray = [...tray, occupant]
      else hand = occupant
    }
  } else if (to.kind === 'discard') {
    discard = [...discard, cardId]
  } else {
    tray = [...tray, cardId]
  }

  const next: GridState = { ...state, board, tray, hand, discard, feedback }
  const lastCardDrawn = next.phase === 'draw' && next.deck.length === 0 && next.hand === null
  const firstFill = puzzle.hints && next.checks === 0 && boardComplete(next)
  return lastCardDrawn || firstFill ? checkBoard(next, puzzle) : next
}

/**
 * Colours every card on the board. Without hints, decoys are dropped — on the board they
 * stay red until replaced — and words wrongly discarded come back to the tray, yellow.
 */
export function checkBoard(state: GridState, puzzle: GridPuzzle): GridState {
  if (!boardComplete(state) || (!puzzle.hints && state.tray.length > 0)) return state
  const feedback: Record<string, GridFeedback> = {}
  state.board.forEach((cardId, cell) => {
    if (cardId !== null) feedback[cardId] = cellFeedback(puzzle, cardId, cell)
  })
  const tray = puzzle.hints ? state.tray : state.discard.filter((id) => !puzzle.decoyIds.includes(id))
  if (!puzzle.hints) for (const id of tray) feedback[id] = 'inMatrix'
  const solved = state.board.every((id, cell) => id === puzzle.solution[cell])
  return {
    ...state,
    phase: solved ? 'solved' : 'arrange',
    tray,
    discard: [],
    // Every card has been placed or discarded by the first check, so all decoys are known.
    dropped: puzzle.hints ? [] : [...puzzle.decoyIds],
    feedback,
    checks: state.checks + 1,
  }
}

/** Ready for the Check button: arranging, every cell filled, nothing left in the no-hint tray. */
export function canCheck(state: GridState, puzzle: GridPuzzle): boolean {
  return state.phase === 'arrange' && boardComplete(state) && (puzzle.hints || state.tray.length === 0)
}
