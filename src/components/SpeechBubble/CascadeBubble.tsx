import { useEffect, useState } from 'react'
import { CASCADE_BORDER_CLASS, CASCADE_MAX_WIDTH_PX, CASCADE_TAIL_BORDER_COLOR } from './constants'

export interface CascadeBubbleProps {
  text: string
  variant: 'ai' | 'user'
  showTail: boolean
  /** Which column this bubble is in — the tail points toward the mouth on the opposite side. */
  side: 'left' | 'right'
}

/**
 * A single bubble in the desktop conversation-history columns. Unlike SpeechBubble (which
 * computes an absolute px position/size relative to the mouth), this one is a normal flex
 * item: width auto-sizes to content up to CASCADE_MAX_WIDTH_PX, height auto-sizes to its
 * (already line-capped) text, and vertical non-overlap comes from the parent flex column's
 * gap rather than manual positioning.
 */
export default function CascadeBubble({ text, variant, showTail, side }: CascadeBubbleProps) {
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    // A short timeout (rather than requestAnimationFrame) so the enter transition still
    // plays even in a backgrounded/non-composited tab, where rAF callbacks can be throttled
    // or suspended indefinitely.
    const id = setTimeout(() => setEntered(true), 10)
    return () => clearTimeout(id)
  }, [])

  return (
    <div
      className={`pointer-events-auto relative rounded-lg border-4 ${CASCADE_BORDER_CLASS[variant]} bg-white px-3 py-2 text-sm text-slate-800 shadow-md transition-[transform,opacity] duration-200 ease-out ${
        entered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}
      style={{ maxWidth: CASCADE_MAX_WIDTH_PX }}
    >
      {text}
      {showTail && <Tail side={side} variant={variant} />}
    </div>
  )
}

function Tail({ side, variant }: { side: 'left' | 'right'; variant: 'ai' | 'user' }) {
  const border = CASCADE_TAIL_BORDER_COLOR[variant]
  // Left column: mouth is to the right of the bubble, so the tail points right.
  if (side === 'left') {
    return (
      <>
        <div
          className="absolute"
          style={{ top: '50%', marginTop: -11, left: '100%', width: 16, height: 22, background: border, clipPath: 'polygon(0 0, 0 100%, 100% 50%)' }}
        />
        <div
          className="absolute"
          style={{ top: '50%', marginTop: -9, left: 'calc(100% - 1px)', width: 13, height: 18, background: '#ffffff', clipPath: 'polygon(0 0, 0 100%, 100% 50%)' }}
        />
      </>
    )
  }
  // Right column: mouth is to the left of the bubble, so the tail points left.
  return (
    <>
      <div
        className="absolute"
        style={{ top: '50%', marginTop: -11, right: '100%', width: 16, height: 22, background: border, clipPath: 'polygon(100% 0, 100% 100%, 0 50%)' }}
      />
      <div
        className="absolute"
        style={{ top: '50%', marginTop: -9, right: 'calc(100% - 1px)', width: 13, height: 18, background: '#ffffff', clipPath: 'polygon(100% 0, 100% 100%, 0 50%)' }}
      />
    </>
  )
}
