// Mobile's single anchored bubble (unchanged) — sized relative to the photo container.
export const MAX_BUBBLE_WIDTH_PCT = 65
export const MAX_BUBBLE_HEIGHT_PCT = 62

// Desktop's cascading history bubbles — kept to roughly a one-to-two-line height regardless
// of photo size, so a fixed px cap (not a % of the container) is the right unit here.
export const CASCADE_MAX_WIDTH_PCT = 45
export const CASCADE_MAX_HEIGHT_PX = 64
/** Vertical offset between cascading bubbles in the same column, as a fraction of bubble height. */
export const CASCADE_STEP_FRACTION = 0.35

export const ENTER_DURATION_MS = 200
export const CROSSFADE_MS = 150
/** Tailwind's default `md` breakpoint — desktop split-history vs. mobile replace switches here. */
export const DESKTOP_QUERY = '(min-width: 768px)'
