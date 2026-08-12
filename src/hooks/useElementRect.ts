import { useEffect, useState, type RefObject } from 'react'

export interface ElementRect {
  left: number
  width: number
  height: number
}

/**
 * Tracks an element's viewport-relative left edge and width. Unlike useContainerSize (which
 * only reports size via ResizeObserver), bubble placement needs the element's horizontal
 * position too — e.g. a centered, max-width-capped container keeps the same width but slides
 * further from the viewport edge as the window widens, which ResizeObserver alone won't catch.
 */
export function useElementRect<T extends HTMLElement>(ref: RefObject<T | null>): ElementRect {
  const [rect, setRect] = useState<ElementRect>({ left: 0, width: 0, height: 0 })

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const measure = () => {
      const r = el.getBoundingClientRect()
      setRect({ left: r.left, width: r.width, height: r.height })
    }

    measure()

    const ro = new ResizeObserver(measure)
    ro.observe(el)
    window.addEventListener('resize', measure)

    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [ref])

  return rect
}
