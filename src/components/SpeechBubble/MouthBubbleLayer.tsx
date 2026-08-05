import { useEffect, useRef, useState, type RefObject } from 'react'
import type { MouthAnchor } from '../../lib/types'
import type { ConversationTurn } from '../../lib/bubblePlacement'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import SpeechBubble from './SpeechBubble'
import DesktopBubbleStage from './DesktopBubbleStage'
import { CROSSFADE_MS, DESKTOP_QUERY } from './constants'

export type { ConversationTurn } from '../../lib/bubblePlacement'

interface StackedBubble {
  id: number
  text: string
}

export interface MouthBubbleLayerProps {
  containerRef: RefObject<HTMLElement | null>
  mouth: MouthAnchor
  /** The newest AI line to show, or null if nothing has been said yet. Drives mobile only. */
  latestText: string | null
  /** Increases whenever `latestText` represents a genuinely new AI message. Drives mobile only. */
  messageKey: number
  /** Full chronological history (both roles). Drives the desktop layout only. */
  allTurns: ConversationTurn[]
  /** Once the session has ended, desktop stops showing bubbles on the photo (final transcript takes over). */
  isEnded?: boolean
}

/**
 * Shared bubble orchestrator for both test-mode live replies and the rehearsal
 * sample-script click-through. Desktop (>=768px) fills the region flanking the mouth
 * exclusion zone with every turn in chronological order via DesktopBubbleStage. Mobile
 * crossfades between a single anchored AI bubble (unchanged).
 */
export default function MouthBubbleLayer({
  containerRef,
  mouth,
  latestText,
  messageKey,
  allTurns,
  isEnded = false,
}: MouthBubbleLayerProps) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY)

  // Mobile-only accumulation, untouched from before.
  const [history, setHistory] = useState<StackedBubble[]>([])
  const nextId = useRef(0)
  const prevKey = useRef<number | null>(null)

  useEffect(() => {
    if (latestText == null || messageKey === prevKey.current) return
    prevKey.current = messageKey
    setHistory((prev) => [...prev, { id: nextId.current++, text: latestText }])
  }, [messageKey, latestText])

  if (isDesktop) {
    return <DesktopBubbleStage containerRef={containerRef} mouth={mouth} turns={allTurns} isEnded={isEnded} />
  }

  if (history.length === 0) return null
  return (
    <div className="pointer-events-none absolute inset-0">
      <MobileSlot current={history[history.length - 1]} mouth={mouth} containerRef={containerRef} />
    </div>
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
