import { useEffect, useState, type CSSProperties } from 'react'
import { BUBBLE_BORDER_CLASS, ENTER_DURATION_MS } from './constants'

export interface BubbleProps {
  text: string
  variant: 'ai' | 'user'
  /** Absolute left/top/width, in px, relative to the photo container. */
  style: CSSProperties
  /** True while this bubble is being removed by a clear-and-restart — plays a fade-out. */
  fadingOut?: boolean
}

/**
 * A single one-liner-first, wrap-in-place speech bubble placed on the photo by
 * DesktopBubbleStage. Width/height come pre-measured from the caller (see bubbleMeasure.ts) —
 * this component only handles the enter/fade-out transition and visual styling.
 */
export default function Bubble({ text, variant, style, fadingOut = false }: BubbleProps) {
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    // A short timeout (rather than requestAnimationFrame) so the enter transition still
    // plays even in a backgrounded/non-composited tab, where rAF callbacks can be throttled
    // or suspended indefinitely.
    const id = setTimeout(() => setEntered(true), 10)
    return () => clearTimeout(id)
  }, [])

  const visible = entered && !fadingOut

  return (
    <div
      className={`pointer-events-auto absolute rounded-lg border-4 ${BUBBLE_BORDER_CLASS[variant]} bg-white px-3 py-2 text-sm text-slate-800 shadow-md transition-[transform,opacity] ease-out ${
        visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}
      style={{ transitionDuration: `${ENTER_DURATION_MS}ms`, ...style }}
    >
      {text}
    </div>
  )
}
