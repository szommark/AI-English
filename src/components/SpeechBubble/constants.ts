// Mobile's single anchored bubble (unchanged) — sized relative to the photo container.
export const MAX_BUBBLE_WIDTH_PCT = 65
export const MAX_BUBBLE_HEIGHT_PCT = 62

// Desktop's cascading history bubbles — auto-width to content (capped), auto-height to a
// max line count instead of a fixed box, laid out via flex so they never overlap each other.
export const CASCADE_MAX_WIDTH_PX = 220
export const CASCADE_HORIZONTAL_PADDING_PX = 24 // px-3 on both sides
export const CASCADE_MAX_LINES = 2
/** Gap between the bubble column and the exclusion box edge, in px. */
export const CASCADE_GAP_PX = 10
/** Inset from the container's top edge, in px. */
export const CASCADE_MARGIN_PX = 8
/** Vertical gap between stacked bubbles in the same column, in px. */
export const CASCADE_STACK_GAP_PX = 6

export const CASCADE_BORDER_CLASS: Record<'ai' | 'user', string> = {
  ai: 'border-red-500',
  user: 'border-green-500',
}
export const CASCADE_TAIL_BORDER_COLOR: Record<'ai' | 'user', string> = {
  ai: '#ef4444', // red-500
  user: '#22c55e', // green-500
}

export const ENTER_DURATION_MS = 200
export const CROSSFADE_MS = 150
/** Tailwind's default `md` breakpoint — desktop split-history vs. mobile replace switches here. */
export const DESKTOP_QUERY = '(min-width: 768px)'
