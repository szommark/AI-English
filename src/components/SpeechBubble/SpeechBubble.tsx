import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'
import type { MouthAnchor } from '../../lib/types'
import { computeBubbleLayout, type Direction } from '../../lib/bubbleGeometry'
import { useContainerSize } from '../../hooks/useContainerSize'
import { MAX_BUBBLE_WIDTH_PCT, MAX_BUBBLE_HEIGHT_PCT } from './constants'

export interface SpeechBubbleProps {
  text: string
  mouth: MouthAnchor
  containerRef: RefObject<HTMLElement | null>
  maxWidthPct?: number
  maxHeightPct?: number
  /** Set false for bubbles further back in the desktop push-aside stack. */
  showTail?: boolean
  style?: CSSProperties
  className?: string
}

function clamp(value: number, min: number, max: number): number {
  if (max < min) return (min + max) / 2
  return Math.min(Math.max(value, min), max)
}

export default function SpeechBubble({
  text,
  mouth,
  containerRef,
  maxWidthPct = MAX_BUBBLE_WIDTH_PCT,
  maxHeightPct = MAX_BUBBLE_HEIGHT_PCT,
  showTail = true,
  style,
  className = '',
}: SpeechBubbleProps) {
  const { width, height } = useContainerSize(containerRef)
  const [entered, setEntered] = useState(false)
  const [overflowing, setOverflowing] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // A short timeout (rather than requestAnimationFrame) so the enter transition still
    // plays even in a backgrounded/non-composited tab, where rAF callbacks can be throttled
    // or suspended indefinitely.
    const id = setTimeout(() => setEntered(true), 10)
    return () => clearTimeout(id)
  }, [])

  useLayoutEffect(() => {
    const el = contentRef.current
    if (!el) return
    setOverflowing(el.scrollHeight > el.clientHeight + 1)
  })

  if (!width || !height) return null

  const layout = computeBubbleLayout({
    containerWidth: width,
    containerHeight: height,
    ...mouth,
    maxWidthPct,
    maxHeightPct,
  })

  const tailX = clamp(layout.tailTip.x - layout.left, 14, layout.width - 14)
  const tailY = clamp(layout.tailTip.y - layout.top, 14, layout.height - 14)

  return (
    <div
      className={`absolute rounded-lg border border-slate-200 bg-white shadow-md transition-[transform,opacity] duration-200 ease-out ${
        entered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      } ${className}`}
      style={{
        left: layout.left,
        top: layout.top,
        width: layout.width,
        height: layout.height,
        pointerEvents: 'auto',
        ...style,
      }}
    >
      <div ref={contentRef} className="h-full overflow-y-auto rounded-lg px-3 py-2 text-sm text-slate-800">
        {text}
      </div>
      {overflowing && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-5 rounded-b-lg bg-gradient-to-t from-white to-transparent" />
      )}
      {showTail && <Tail direction={layout.direction} x={tailX} y={tailY} />}
    </div>
  )
}

function Tail({ direction, x, y }: { direction: Direction; x: number; y: number }) {
  const border = '#e2e8f0' // slate-200, matches the bubble's border color
  switch (direction) {
    // Bubble sits above the mouth — tail hangs off the bottom edge, pointing down.
    case 'up':
      return (
        <>
          <div
            className="absolute"
            style={{ left: x - 11, top: '100%', width: 22, height: 16, background: border, clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }}
          />
          <div
            className="absolute"
            style={{ left: x - 9, top: 'calc(100% - 1px)', width: 18, height: 13, background: '#ffffff', clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }}
          />
        </>
      )
    // Bubble sits below the mouth — tail sticks up off the top edge, pointing up.
    case 'down':
      return (
        <>
          <div
            className="absolute"
            style={{ left: x - 11, bottom: '100%', width: 22, height: 16, background: border, clipPath: 'polygon(0 100%, 100% 100%, 50% 0%)' }}
          />
          <div
            className="absolute"
            style={{ left: x - 9, bottom: 'calc(100% - 1px)', width: 18, height: 13, background: '#ffffff', clipPath: 'polygon(0 100%, 100% 100%, 50% 0%)' }}
          />
        </>
      )
    // Bubble sits left of the mouth — tail sticks out the right edge, pointing right.
    case 'left':
      return (
        <>
          <div
            className="absolute"
            style={{ top: y - 11, left: '100%', width: 16, height: 22, background: border, clipPath: 'polygon(0 0, 0 100%, 100% 50%)' }}
          />
          <div
            className="absolute"
            style={{ top: y - 9, left: 'calc(100% - 1px)', width: 13, height: 18, background: '#ffffff', clipPath: 'polygon(0 0, 0 100%, 100% 50%)' }}
          />
        </>
      )
    // Bubble sits right of the mouth — tail sticks out the left edge, pointing left.
    case 'right':
      return (
        <>
          <div
            className="absolute"
            style={{ top: y - 11, right: '100%', width: 16, height: 22, background: border, clipPath: 'polygon(100% 0, 100% 100%, 0 50%)' }}
          />
          <div
            className="absolute"
            style={{ top: y - 9, right: 'calc(100% - 1px)', width: 13, height: 18, background: '#ffffff', clipPath: 'polygon(100% 0, 100% 100%, 0 50%)' }}
          />
        </>
      )
  }
}
