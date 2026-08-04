import { useEffect, useRef, useState, type RefObject } from 'react'
import type { MouthAnchor } from '../../lib/types'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useContainerSize } from '../../hooks/useContainerSize'
import { computeSideSlotLayout } from '../../lib/bubbleGeometry'
import SpeechBubble from './SpeechBubble'
import { CROSSFADE_MS, DESKTOP_QUERY, MAX_BUBBLE_HEIGHT_PCT, MAX_BUBBLE_WIDTH_PCT, SLOTS_PER_SIDE } from './constants'

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
 * sample-script click-through. Desktop (>=768px) lays out the full conversation history in
 * two non-overlapping columns (first SLOTS_PER_SIDE exchanges on the left, next
 * SLOTS_PER_SIDE on the right); mobile crossfades between a single anchored bubble.
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
        <DesktopSplit history={history} mouth={mouth} containerRef={containerRef} />
      ) : (
        <MobileSlot current={history[history.length - 1]} mouth={mouth} containerRef={containerRef} />
      )}
    </div>
  )
}

function DesktopSplit({
  history,
  mouth,
  containerRef,
}: {
  history: StackedBubble[]
  mouth: MouthAnchor
  containerRef: RefObject<HTMLElement | null>
}) {
  const { width, height } = useContainerSize(containerRef)
  if (!width || !height) return null

  return (
    <>
      {history.map((item, index) => {
        const groupIndex = Math.floor(index / SLOTS_PER_SIDE)
        const side = groupIndex % 2 === 0 ? 'left' : 'right'
        const slotIndex = index % SLOTS_PER_SIDE
        const layout = computeSideSlotLayout({
          containerWidth: width,
          containerHeight: height,
          ...mouth,
          side,
          slotIndex,
          slotCount: SLOTS_PER_SIDE,
          maxWidthPct: MAX_BUBBLE_WIDTH_PCT,
          maxHeightPct: MAX_BUBBLE_HEIGHT_PCT,
        })

        return (
          <SpeechBubble
            key={item.id}
            text={item.text}
            mouth={mouth}
            containerRef={containerRef}
            layout={layout}
            showTail={index === history.length - 1}
          />
        )
      })}
    </>
  )
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
