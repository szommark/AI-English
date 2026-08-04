/**
 * Measures how many lines `text` would wrap to at `maxWidthPx`, using a hidden DOM node
 * (not canvas) so it matches the real font/line-height exactly (must share the `text-sm`
 * class with whatever renders the actual bubble text).
 */
function measureLineCount(text: string, maxWidthPx: number): number {
  if (typeof document === 'undefined') return 1

  const el = document.createElement('div')
  el.className = 'text-sm'
  el.style.position = 'absolute'
  el.style.visibility = 'hidden'
  el.style.left = '-9999px'
  el.style.top = '0'
  el.style.width = `${maxWidthPx}px`
  el.style.whiteSpace = 'normal'
  el.style.wordBreak = 'break-word'
  el.textContent = text
  document.body.appendChild(el)

  const lineHeight = parseFloat(getComputedStyle(el).lineHeight) || 20
  const lines = Math.max(1, Math.round(el.scrollHeight / lineHeight))

  document.body.removeChild(el)
  return lines
}

/**
 * Splits `text` into the fewest chunks such that each chunk wraps to at most `maxLines`
 * lines at `maxWidthPx` — used so an over-long message becomes multiple chained bubbles
 * instead of growing taller or scrolling internally. Word boundaries are preserved.
 */
export function splitTextIntoChunks(text: string, maxWidthPx: number, maxLines: number): string[] {
  const words = text.split(/\s+/).filter(Boolean)
  if (words.length === 0) return ['']

  const chunks: string[] = []
  let remaining = words
  let guard = 0

  while (remaining.length > 0 && guard < 50) {
    guard++
    const fullText = remaining.join(' ')
    if (measureLineCount(fullText, maxWidthPx) <= maxLines) {
      chunks.push(fullText)
      break
    }

    // Binary search for the longest word-prefix that still fits within maxLines.
    let lo = 1
    let hi = remaining.length
    let best = 1
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2)
      const candidate = remaining.slice(0, mid).join(' ')
      if (measureLineCount(candidate, maxWidthPx) <= maxLines) {
        best = mid
        lo = mid + 1
      } else {
        hi = mid - 1
      }
    }

    chunks.push(remaining.slice(0, best).join(' '))
    remaining = remaining.slice(best)
  }

  return chunks
}
