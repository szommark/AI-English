import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'
import type { MouthAnchor } from '../../lib/types'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import SpeechBubble from './SpeechBubble'
import { CROSSFADE_MS, DESKTOP_QUERY, MAX_STACK_SIZE, STACK_TRANSITION_MS } from './constants'

interface StackedBubble {
  id: number
  text: string
}

export interface MouthBubbleLayerProps {
  containerRef: RefObject<HTMLElement | null>
  mouth: MouthAnchor
  /** The newest line of dialogue to show, or null if nothing has been said yet. */
  latestText: string | null
  /** Increases whenever `latestText` represents a genuinely new message. */
  messageKey: number
}

/**
 * Shared bubble orchestrator for both test-mode live replies and the rehearsal
 * sample-script click-through. Desktop (>=768px) pushes older bubbles aside into a
 * capped stack; mobile crossfades between a single anchored bubble.
 */
export default function MouthBubbleLayer({ containerRef, mouth, latestText, messageKey }: MouthBubbleLayerProps) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const [history, setHistory] = useState<StackedBubble[]>([])
  const nextId = useRef(0)
  const prevKey = useRef<number | null>(null)

  useEffect(() => {
    if (latestText == null || messageKey === prevKey.current) return
    prevKey.current = messageKey
    setHistory((prev) => [...prev, { id: nextId.current++, text: latestText }])
  }, [messageKey, latestText])

  if (history.length === 0) return null

  return (
    <div className="pointer-events-none absolute inset-0">
      {isDesktop ? (
        <DesktopStack history={history} mouth={mouth} containerRef={containerRef} />
      ) : (
        <MobileSlot current={history[history.length - 1]} mouth={mouth} containerRef={containerRef} />
      )}
    </div>
  )
}

function DesktopStack({
  history,
  mouth,
  containerRef,
}: {
  history: StackedBubble[]
  mouth: MouthAnchor
  containerRef: RefObject<HTMLElement | null>
}) {
  // One extra slot beyond the visible cap: it renders at opacity 0 so the CSS
  // transition plays before it drops out of the window on the next new message.
  const windowSize = MAX_STACK_SIZE + 1
  const windowItems = history.slice(-windowSize).reverse() // index 0 = newest

  return (
    <>
      {windowItems.map((item, i) => (
        <SpeechBubble
          key={item.id}
          text={item.text}
          mouth={mouth}
          containerRef={containerRef}
          showTail={i === 0}
          style={stackStyle(i)}
        />
      ))}
    </>
  )
}

function stackStyle(index: number): CSSProperties {
  const base: CSSProperties = {
    transition: `transform ${STACK_TRANSITION_MS}ms ease, opacity ${STACK_TRANSITION_MS}ms ease`,
  }
  switch (index) {
    case 0:
      return { ...base, transform: 'translate(0, 0) scale(1)', opacity: 1, zIndex: 4 }
    case 1:
      return { ...base, transform: 'translate(55%, -6%) scale(0.92)', opacity: 0.85, zIndex: 3 }
    case 2:
      return { ...base, transform: 'translate(105%, -10%) scale(0.85)', opacity: 0.7, zIndex: 2 }
    default:
      // The (MAX_STACK_SIZE + 1)th bubble: fades out in place before being dropped.
      return { ...base, transform: 'translate(105%, -10%) scale(0.8)', opacity: 0, zIndex: 1, pointerEvents: 'none' }
  }
}

function MobileSlot({
  current,
  mouth,
  containerRef,
}: {
  current: StackedBubble
  mouth: MouthAnchor
  containerRef: RefObject<HTMLElement | null>
}) {
  const [displayed, setDisplayed] = useState(current)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    if (current.id === displayed.id) return
    setFading(true)
    const timer = setTimeout(() => {
      setDisplayed(current)
      setFading(false)
    }, CROSSFADE_MS)
    return () => clearTimeout(timer)
  }, [current, displayed.id])

  return (
    <SpeechBubble
      key={displayed.id}
      text={displayed.text}
      mouth={mouth}
      containerRef={containerRef}
      style={fading ? { transition: `opacity ${CROSSFADE_MS}ms ease`, opacity: 0 } : undefined}
    />
  )
}
