// Crossword game (Vocabulary › Games): a crossword built from a list's words, clued by their
// English definitions or Hungarian meanings. One entry is the solution: shaded and without a
// clue, its letters come from the words that cross it (and a hint on request).
// Pure logic — building the puzzle and checking the letters — so the component only renders.
import { normalizeTerm, type WordlistWord } from './vocab'
import { shuffle, type Rng } from './vocabGrid'

export type ClueLanguage = 'en' | 'hu'
export type Direction = 'across' | 'down'

/** Words in a crossword, the solution included. */
export const CROSSWORD_SIZES = [6, 9, 12] as const
export type CrosswordSize = (typeof CROSSWORD_SIZES)[number]

/** The fewest entries a crossword is built with, and so the shortest list the game offers. */
export const CROSSWORD_MIN_WORDS = 5

/** Answers are single words of 3–12 letters; the solution is 5–9 letters long. */
const ANSWER_MIN = 3
const ANSWER_MAX = 12
const SOLUTION_MIN = 5
const SOLUTION_MAX = 9

/** The grid never grows wider or taller than this, so it fits a phone screen. */
export const CROSSWORD_MAX_SPAN = 13

/** Layouts tried per puzzle; the best one is kept. */
const ATTEMPTS = 40
/** Words considered per layout, so long lists stay fast. */
const POOL_SIZE = 80

export interface CrosswordClue {
  text: string
  /** The language the clue is in: the one chosen, or the other when the word lacks it. */
  lang: ClueLanguage
}

export interface CrosswordWord {
  id: string
  term: string
  /** The letters in the grid: A–Z. */
  answer: string
  meaningHu: string | null
  clue: CrosswordClue
}

export interface CrosswordEntry {
  id: string
  number: number
  direction: Direction
  row: number
  col: number
  answer: string
  term: string
  meaningHu: string | null
  clue: CrosswordClue
  /** The solution: shaded, listed without its clue. */
  isSolution: boolean
}

export interface CrosswordPuzzle {
  rows: number
  cols: number
  /** Across entries by number, then down entries by number. */
  entries: CrosswordEntry[]
  solutionId: string
}

/** The grid letters for a term (A–Z only), or null when the term can't be an answer. */
export function crosswordAnswer(term: string): string | null {
  const word = normalizeTerm(term)
  if (!/^[a-z]+$/.test(word) || word.length < ANSWER_MIN || word.length > ANSWER_MAX) return null
  return word.toUpperCase()
}

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** The clue with the answer itself (and its common inflections) blanked out. */
export function maskAnswer(text: string, term: string): string {
  const pattern = new RegExp(`\\b${escapeRegExp(term)}(?:s|es|ed|d|ing|er|ers)?\\b`, 'gi')
  return text.replace(pattern, '___')
}

/** A word's clue in the chosen language, or in the other one when the word lacks it. */
export function crosswordClue(word: WordlistWord, lang: ClueLanguage): CrosswordClue | null {
  const text = { en: word.definitionEn?.trim(), hu: word.meaningHu?.trim() }
  const other: ClueLanguage = lang === 'en' ? 'hu' : 'en'
  const pick = text[lang] ? lang : text[other] ? other : null
  if (!pick) return null
  return { text: maskAnswer(text[pick]!, normalizeTerm(word.term)), lang: pick }
}

/** The list's words a crossword can use: single words with a clue, one per answer. */
export function crosswordEligibleWords(words: readonly WordlistWord[], lang: ClueLanguage): CrosswordWord[] {
  const answers = new Set<string>()
  const out: CrosswordWord[] = []
  for (const w of words) {
    const answer = crosswordAnswer(w.term)
    const clue = crosswordClue(w, lang)
    if (!answer || !clue || answers.has(answer)) continue
    answers.add(answer)
    out.push({ id: w.itemId, term: w.term, answer, meaningHu: w.meaningHu, clue })
  }
  return out
}

// --- Building the grid ----------------------------------------------------------------------

export const cellKey = (row: number, col: number) => `${row},${col}`

const STEP: Record<Direction, [number, number]> = { across: [0, 1], down: [1, 0] }

interface Placement {
  word: CrosswordWord
  row: number
  col: number
  direction: Direction
}

/** A layout being built, in unbounded coordinates (the first word starts at 0,0). */
interface Layout {
  placed: Placement[]
  letters: Map<string, string>
  /** The directions of the words through each cell: two at a crossing. */
  dirs: Map<string, Direction[]>
  minRow: number
  maxRow: number
  minCol: number
  maxCol: number
  /** The solution's cells, for steering crossings onto it. */
  solutionCells: Set<string>
}

function emptyLayout(): Layout {
  return {
    placed: [],
    letters: new Map(),
    dirs: new Map(),
    minRow: 0,
    maxRow: 0,
    minCol: 0,
    maxCol: 0,
    solutionCells: new Set(),
  }
}

/**
 * How many letters a word would share with the layout at this spot, or -1 when it can't go
 * there: a letter clashes, it runs along another word, it touches a word side by side or end
 * to end (which would make letter runs that aren't words), or the grid gets too big.
 */
function fit(layout: Layout, answer: string, row: number, col: number, direction: Direction): number {
  const [dr, dc] = STEP[direction]
  const len = answer.length
  const has = (r: number, c: number) => layout.letters.has(cellKey(r, c))
  if (has(row - dr, col - dc) || has(row + dr * len, col + dc * len)) return -1
  if (layout.placed.length > 0) {
    const endRow = row + dr * (len - 1)
    const endCol = col + dc * (len - 1)
    if (Math.max(layout.maxRow, endRow) - Math.min(layout.minRow, row) + 1 > CROSSWORD_MAX_SPAN) return -1
    if (Math.max(layout.maxCol, endCol) - Math.min(layout.minCol, col) + 1 > CROSSWORD_MAX_SPAN) return -1
  }
  let crossings = 0
  for (let i = 0; i < len; i++) {
    const r = row + dr * i
    const c = col + dc * i
    const key = cellKey(r, c)
    const letter = layout.letters.get(key)
    if (letter !== undefined) {
      if (letter !== answer[i] || layout.dirs.get(key)!.includes(direction)) return -1
      crossings++
    } else if (has(r + dc, c + dr) || has(r - dc, c - dr)) {
      return -1
    }
  }
  return crossings
}

function place(layout: Layout, p: Placement, isSolution = false) {
  const [dr, dc] = STEP[p.direction]
  layout.placed.push(p)
  for (let i = 0; i < p.word.answer.length; i++) {
    const r = p.row + dr * i
    const c = p.col + dc * i
    const key = cellKey(r, c)
    layout.letters.set(key, p.word.answer[i])
    layout.dirs.set(key, [...(layout.dirs.get(key) ?? []), p.direction])
    if (isSolution) layout.solutionCells.add(key)
    // The first word starts at 0,0, where the bounds start.
    layout.minRow = Math.min(layout.minRow, r)
    layout.maxRow = Math.max(layout.maxRow, r)
    layout.minCol = Math.min(layout.minCol, c)
    layout.maxCol = Math.max(layout.maxCol, c)
  }
}

/** The solution letters crossed by another word so far. */
const crossedSolutionCells = (layout: Layout) =>
  [...layout.solutionCells].filter((key) => layout.dirs.get(key)!.length > 1).length

/** The best spot where a word crosses the layout, and how much it is worth. */
function bestSpot(layout: Layout, word: CrosswordWord, rng: Rng): { placement: Placement; score: number } | null {
  let best: { placement: Placement; score: number } | null = null
  for (const [key, letter] of layout.letters) {
    if (layout.dirs.get(key)!.length > 1) continue
    const [r, c] = key.split(',').map(Number)
    const direction: Direction = layout.dirs.get(key)![0] === 'across' ? 'down' : 'across'
    const [dr, dc] = STEP[direction]
    for (let i = 0; i < word.answer.length; i++) {
      if (word.answer[i] !== letter) continue
      const row = r - dr * i
      const col = c - dc * i
      const crossings = fit(layout, word.answer, row, col, direction)
      if (crossings <= 0) continue
      // More crossings make a tighter, more solvable grid; crossing the solution matters most,
      // and a spot that keeps the grid small beats one that stretches it.
      const onSolution = layout.solutionCells.has(key) ? 1 : 0
      const rows = Math.max(layout.maxRow, row + dr * (word.answer.length - 1)) - Math.min(layout.minRow, row) + 1
      const cols = Math.max(layout.maxCol, col + dc * (word.answer.length - 1)) - Math.min(layout.minCol, col) + 1
      const growth = rows * cols - (layout.maxRow - layout.minRow + 1) * (layout.maxCol - layout.minCol + 1)
      const score = crossings * 4 + onSolution * 12 - growth * 0.15 + rng() * 3
      if (!best || score > best.score) best = { placement: { word, row, col, direction }, score }
    }
  }
  return best
}

/** One layout: the solution across, then greedily the best-fitting word, until `target` words. */
function buildLayout(solution: CrosswordWord, others: readonly CrosswordWord[], target: number, rng: Rng): Layout {
  const layout = emptyLayout()
  place(layout, { word: solution, row: 0, col: 0, direction: 'across' }, true)
  const pool = shuffle(others, rng).slice(0, POOL_SIZE)
  while (layout.placed.length < target) {
    let best: { placement: Placement; score: number } | null = null
    for (const word of pool) {
      const spot = bestSpot(layout, word, rng)
      if (spot && (!best || spot.score > best.score)) best = spot
    }
    if (!best) break
    place(layout, best.placement)
    pool.splice(pool.indexOf(best.placement.word), 1)
  }
  return layout
}

/** Which layout to keep: the most words, then the best-crossed solution, then the most compact. */
function layoutScore(layout: Layout): number {
  const rows = layout.maxRow - layout.minRow + 1
  const cols = layout.maxCol - layout.minCol + 1
  const crossedShare = crossedSolutionCells(layout) / layout.solutionCells.size
  return layout.placed.length * 100 + crossedShare * 80 - rows * cols * 0.5 - Math.abs(rows - cols)
}

/** The layout as a puzzle: coordinates from 0, entries numbered like a printed crossword. */
function toPuzzle(layout: Layout): CrosswordPuzzle {
  const starts = [...layout.placed].sort((a, b) => a.row - b.row || a.col - b.col)
  const numbers = new Map<string, number>()
  for (const p of starts) {
    const key = cellKey(p.row, p.col)
    if (!numbers.has(key)) numbers.set(key, numbers.size + 1)
  }
  const solutionId = layout.placed[0].word.id
  const entries = layout.placed
    .map<CrosswordEntry>((p) => ({
      id: p.word.id,
      number: numbers.get(cellKey(p.row, p.col))!,
      direction: p.direction,
      row: p.row - layout.minRow,
      col: p.col - layout.minCol,
      answer: p.word.answer,
      term: p.word.term,
      meaningHu: p.word.meaningHu,
      clue: p.word.clue,
      isSolution: p.word.id === solutionId,
    }))
    .sort((a, b) => (a.direction === b.direction ? a.number - b.number : a.direction === 'across' ? -1 : 1))
  return {
    rows: layout.maxRow - layout.minRow + 1,
    cols: layout.maxCol - layout.minCol + 1,
    entries,
    solutionId,
  }
}

/**
 * A random crossword of up to `size` words from the eligible words, or null when they don't
 * make one of at least CROSSWORD_MIN_WORDS entries.
 */
export function createCrossword(
  words: readonly CrosswordWord[],
  size: number,
  rng: Rng = Math.random,
): CrosswordPuzzle | null {
  const solutions = words.filter((w) => w.answer.length >= SOLUTION_MIN && w.answer.length <= SOLUTION_MAX)
  if (solutions.length === 0 || words.length < CROSSWORD_MIN_WORDS) return null
  let best: Layout | null = null
  for (let i = 0; i < ATTEMPTS; i++) {
    const solution = solutions[Math.floor(rng() * solutions.length)]
    const layout = buildLayout(
      solution,
      words.filter((w) => w !== solution),
      size,
      rng,
    )
    if (!best || layoutScore(layout) > layoutScore(best)) best = layout
  }
  return best && best.placed.length >= CROSSWORD_MIN_WORDS ? toPuzzle(best) : null
}

// --- Playing ----------------------------------------------------------------------------------

export interface CrosswordCell {
  row: number
  col: number
  answer: string
  /** The entry number printed in the cell, if an entry starts here. */
  number: number | null
  across: string | null
  down: string | null
  inSolution: boolean
}

/** The cells of an entry, first to last. */
export function entryCells(entry: CrosswordEntry): string[] {
  const [dr, dc] = STEP[entry.direction]
  return Array.from(entry.answer, (_, i) => cellKey(entry.row + dr * i, entry.col + dc * i))
}

/** Every letter cell of the grid, by cellKey. */
export function crosswordCells(puzzle: CrosswordPuzzle): Map<string, CrosswordCell> {
  const cells = new Map<string, CrosswordCell>()
  for (const entry of puzzle.entries) {
    entryCells(entry).forEach((key, i) => {
      const [row, col] = key.split(',').map(Number)
      const cell = cells.get(key) ?? { row, col, answer: entry.answer[i], number: null, across: null, down: null, inSolution: false }
      cell[entry.direction] = entry.id
      if (i === 0) cell.number = entry.number
      if (entry.isSolution) cell.inSolution = true
      cells.set(key, cell)
    })
  }
  return cells
}

/** The letters the player has typed, by cellKey. */
export type CrosswordFills = Record<string, string>

/** Filled cells whose letter is wrong. */
export function wrongCells(cells: Map<string, CrosswordCell>, fills: CrosswordFills): string[] {
  return [...cells].filter(([key, cell]) => fills[key] && fills[key] !== cell.answer).map(([key]) => key)
}

export function isSolved(cells: Map<string, CrosswordCell>, fills: CrosswordFills): boolean {
  return [...cells].every(([key, cell]) => fills[key] === cell.answer)
}

export function isEntryFilled(entry: CrosswordEntry, fills: CrosswordFills): boolean {
  return entryCells(entry).every((key) => Boolean(fills[key]))
}
