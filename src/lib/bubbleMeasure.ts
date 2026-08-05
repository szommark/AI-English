// Classes must exactly match the real bubble's box (padding/border/font) so the measured
// size matches what actually renders — see Bubble.tsx.
const BUBBLE_BOX_CLASS = 'rounded-lg border-4 px-3 py-2 text-sm'

let measureEl: HTMLDivElement | null = null

function getMeasureEl(): HTMLDivElement {
  if (measureEl) return measureEl
  const el = document.createElement('div')
  el.style.position = 'absolute'
  el.style.visibility = 'hidden'
  el.style.left = '-9999px'
  el.style.top = '-9999px'
  el.style.whiteSpace = 'pre-wrap'
  el.style.wordBreak = 'break-word'
  el.style.width = 'max-content'
  el.className = BUBBLE_BOX_CLASS
  document.body.appendChild(el)
  measureEl = el
  return el
}

export interface BubbleBoxSize {
  width: number
  height: number
}

/**
 * Measures the rendered size of a bubble's text at a given max width, using a hidden DOM
 * node with the same box classes as the real bubble. Shrinks to the text's natural
 * single-line width when it fits; otherwise wraps within maxWidthPx and reports the
 * resulting multi-line height. maxWidthPx <= 0 degenerates to a 0x0 box.
 */
export function measureBubbleBox(text: string, maxWidthPx: number): BubbleBoxSize {
  if (maxWidthPx <= 0) return { width: 0, height: 0 }
  const el = getMeasureEl()
  el.style.maxWidth = `${maxWidthPx}px`
  el.textContent = text
  return { width: el.offsetWidth, height: el.offsetHeight }
}
