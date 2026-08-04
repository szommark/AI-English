import type { MouthAnchor } from './types'

export type Direction = 'up' | 'down' | 'left' | 'right'

export interface BubbleLayout {
  direction: Direction
  left: number
  top: number
  width: number
  height: number
  tailTip: { x: number; y: number }
}

export interface ComputeLayoutArgs extends MouthAnchor {
  containerWidth: number
  containerHeight: number
  maxWidthPct: number
  maxHeightPct: number
  /** Gap between the bubble and the exclusion box edge, in px. */
  gapPx?: number
  /** Inset from the container edges, in px. */
  marginPx?: number
}

const DEFAULT_GAP_PX = 10
const DEFAULT_MARGIN_PX = 8

function clamp(value: number, min: number, max: number): number {
  if (max < min) return min
  return Math.min(Math.max(value, min), max)
}

/**
 * Picks the quadrant (up/down/left/right of the mouth) with the most available space,
 * sizes the bubble to fit within it (capped by maxWidthPct/maxHeightPct), and returns a
 * tail tip that sits on the exclusion box's edge. The main axis of the chosen direction
 * (height for up/down, width for left/right) is derived directly from the gap between the
 * container edge and the exclusion box, so the bubble can never overlap the mouth zone.
 */
export function computeBubbleLayout(args: ComputeLayoutArgs): BubbleLayout {
  const {
    containerWidth: W,
    containerHeight: H,
    mouthX,
    mouthY,
    mouthBoxWidth,
    mouthBoxHeight,
    maxWidthPct,
    maxHeightPct,
    gapPx = DEFAULT_GAP_PX,
    marginPx = DEFAULT_MARGIN_PX,
  } = args

  const mouthPx = { x: (mouthX / 100) * W, y: (mouthY / 100) * H }
  const boxW = (mouthBoxWidth / 100) * W
  const boxH = (mouthBoxHeight / 100) * H
  const excl = {
    left: mouthPx.x - boxW / 2,
    top: mouthPx.y - boxH / 2,
    right: mouthPx.x + boxW / 2,
    bottom: mouthPx.y + boxH / 2,
  }

  const regions: Record<Direction, { width: number; height: number }> = {
    up: { width: W, height: Math.max(excl.top, 0) },
    down: { width: W, height: Math.max(H - excl.bottom, 0) },
    left: { width: Math.max(excl.left, 0), height: H },
    right: { width: Math.max(W - excl.right, 0), height: H },
  }

  let direction: Direction = 'down'
  let bestArea = -Infinity
  for (const dir of Object.keys(regions) as Direction[]) {
    const area = regions[dir].width * regions[dir].height
    if (area > bestArea) {
      bestArea = area
      direction = dir
    }
  }

  const maxW = (maxWidthPct / 100) * W
  const maxH = (maxHeightPct / 100) * H

  let width: number
  let height: number
  let left: number
  let top: number

  if (direction === 'up' || direction === 'down') {
    const availableHeight = Math.max(regions[direction].height - gapPx - marginPx, 0)
    height = Math.min(availableHeight, maxH)
    width = Math.min(Math.max(W - 2 * marginPx, 0), maxW)
    left = clamp(mouthPx.x - width / 2, marginPx, Math.max(W - width - marginPx, marginPx))
    top = direction === 'up' ? excl.top - gapPx - height : excl.bottom + gapPx
  } else {
    const availableWidth = Math.max(regions[direction].width - gapPx - marginPx, 0)
    width = Math.min(availableWidth, maxW)
    height = Math.min(Math.max(H - 2 * marginPx, 0), maxH)
    top = clamp(mouthPx.y - height / 2, marginPx, Math.max(H - height - marginPx, marginPx))
    left = direction === 'left' ? excl.left - gapPx - width : excl.right + gapPx
  }

  // Redundant safety net (keeps the bubble fully within the container even if
  // floating-point edge cases push it slightly out) — never re-introduces overlap
  // since it only pulls the bubble further from the exclusion box, never toward it.
  left = clamp(left, 0, Math.max(W - width, 0))
  top = clamp(top, 0, Math.max(H - height, 0))

  const tailTip = computeTailTip(direction, mouthPx, excl)

  return { direction, left, top, width, height, tailTip }
}

function computeTailTip(
  direction: Direction,
  mouthPx: { x: number; y: number },
  excl: { left: number; top: number; right: number; bottom: number }
): { x: number; y: number } {
  switch (direction) {
    case 'up':
      return { x: clamp(mouthPx.x, excl.left, excl.right), y: excl.top }
    case 'down':
      return { x: clamp(mouthPx.x, excl.left, excl.right), y: excl.bottom }
    case 'left':
      return { x: excl.left, y: clamp(mouthPx.y, excl.top, excl.bottom) }
    case 'right':
      return { x: excl.right, y: clamp(mouthPx.y, excl.top, excl.bottom) }
  }
}
