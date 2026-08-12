// Mobile's single anchored bubble (unchanged) — sized relative to the photo container.
export const MAX_BUBBLE_WIDTH_PCT = 65
export const MAX_BUBBLE_HEIGHT_PCT = 62

// Desktop's photo-overlay bubbles — one-liner by default, wrapping within the same bubble up
// to the viewport-edge-relative width available on their side (see DesktopBubbleStage).
/** Gap between a bubble and the mouth exclusion box's edge, in px. */
export const MOUTH_GAP_PX = 10
/** Inset from the viewport's left/right edge that bubble regions may never cross, in px. */
export const VIEWPORT_MARGIN_PX = 16
/** Inset from the photo's top edge for the first bubble in a column, in px. */
export const BUBBLE_TOP_MARGIN_PX = 8
/** Vertical gap between stacked bubbles in the same column, in px. */
export const STACK_GAP_PX = 8

export const BUBBLE_BORDER_CLASS: Record<'ai' | 'user', string> = {
  ai: 'border-red-500',
  user: 'border-green-500',
}

export const ENTER_DURATION_MS = 200
export const CLEAR_FADE_MS = 200
export const CROSSFADE_MS = 150
/** Tailwind's default `md` breakpoint — desktop photo-overlay vs. mobile single-bubble switches here. */
export const DESKTOP_QUERY = '(min-width: 768px)'
