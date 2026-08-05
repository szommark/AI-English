export interface ConversationTurn {
  role: 'user' | 'assistant'
  text: string
}

export type BubbleSide = 'left' | 'right'

export interface PlacedBubble {
  turnIndex: number
  role: 'user' | 'assistant'
  text: string
  side: BubbleSide
  top: number
  width: number
  height: number
  /** Increments every time both sides fill up and the photo is cleared to start over. */
  generation: number
}

export interface PlacementOptions {
  leftWidth: number
  rightWidth: number
  /** Vertical space available on either side, from the top margin to the photo's bottom edge. */
  availableHeight: number
  stackGapPx: number
  measure: (text: string, maxWidthPx: number) => { width: number; height: number }
}

/**
 * Places turns strictly in chronological order: fills the left region top-to-bottom, then
 * (once a bubble would cross the photo's bottom edge) switches to the right region and fills
 * that top-to-bottom, then (once the right region is also full) clears both and starts a new
 * generation from the left again. A single turn whose bubble alone overflows the region is
 * still placed (rather than blocked/truncated) — the next turn then naturally fails to fit
 * against that already-overflowed height and triggers the side-switch/clear.
 */
export function computeBubblePlacement(turns: ConversationTurn[], opts: PlacementOptions): PlacedBubble[] {
  const { leftWidth, rightWidth, availableHeight, stackGapPx, measure } = opts
  const placed: PlacedBubble[] = []

  let generation = 0
  let side: BubbleSide = 'left'
  let cum: Record<BubbleSide, number> = { left: 0, right: 0 }
  let count: Record<BubbleSide, number> = { left: 0, right: 0 }

  let i = 0
  while (i < turns.length) {
    const turn = turns[i]
    const maxWidth = side === 'left' ? leftWidth : rightWidth
    const { width, height } = measure(turn.text, maxWidth)
    const gap = count[side] > 0 ? stackGapPx : 0
    const bottom = cum[side] + gap + height
    const fits = bottom <= availableHeight || count[side] === 0

    if (fits) {
      const top = cum[side] + gap
      placed.push({ turnIndex: i, role: turn.role, text: turn.text, side, top, width, height, generation })
      cum[side] = top + height
      count[side] += 1
      i += 1
      continue
    }

    if (side === 'left') {
      side = 'right'
      continue
    }

    generation += 1
    side = 'left'
    cum = { left: 0, right: 0 }
    count = { left: 0, right: 0 }
  }

  return placed
}
