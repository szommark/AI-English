import { useEffect, useRef, useState, type RefObject } from 'react'
import type { MouthAnchor } from '../../lib/types'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useContainerSize } from '../../hooks/useContainerSize'
import { computeSideCascadeLayout } from '../../lib/bubbleGeometry'
import SpeechBubble from './SpeechBubble'
import { CASCADE_MAX_HEIGHT_PX, CASCADE_MAX_WIDTH_PCT, CROSSFADE_MS, DESKTOP_QUERY } from './constants'

interface StackedBubble {
  id: number
  text: string
}

export interface ConversationTurn {
  role: 'user' | 'assistant'
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
  /**
   * The known maximum number of exchanges (user+AI pairs) this conversation can reach —
   * MAX_TURNS for a live session, or the sample script's character-line count for rehearsal.
   * Used to split exchanges into two balanced halves so short conversations still use both
   * sides instead of only ever filling the left. Drives the desktop layout only.
   */
  totalExchanges: number
}

/**
 * Shared bubble orchestrator for both test-mode live replies and the rehearsal
 * sample-script click-through. Desktop (>=768px) shows the full conversation history as a
 * cascading, overlapping stack split across two columns — the first half of the expected
 * exchanges on the left, the second half on the right, so both sides fill regardless of how
 * many exchanges the conversation actually has; mobile crossfades between a single anchored
 * AI bubble (unchanged).
 */
export default function MouthBubbleLayer({
  containerRef,
  mouth,
  latestText,
  messageKey,
  allTurns,
  totalExchanges,
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
    if (allTurns.length === 0) return null
    return (
      <div className="pointer-events-none absolute inset-0">
        <DesktopSplit turns={allTurns} totalExchanges={totalExchanges} mouth={mouth} containerRef={containerRef} />
      </div>
    )
  }

  if (history.length === 0) return null
  return (
    <div className="pointer-events-none absolute inset-0">
      <MobileSlot current={history[history.length - 1]} mouth={mouth} containerRef={containerRef} />
    </div>
  )
}

function DesktopSplit({
  turns,
  totalExchanges,
  mouth,
  containerRef,
}: {
  turns: ConversationTurn[]
  totalExchanges: number
  mouth: MouthAnchor
  containerRef: RefObject<HTMLElement | null>
}) {
  const { width, height } = useContainerSize(containerRef)
  if (!width || !height) return null

  const lastAssistantIndex = (() => {
    for (let i = turns.length - 1; i >= 0; i--) {
      if (turns[i].role === 'assistant') return i
    }
    return -1
  })()

  // Two turns (user + AI) make one exchange. Split the *known* total exchange count into two
  // balanced halves up front, so a short conversation (e.g. rehearsal's 3 exchanges) still
  // uses both sides instead of only ever filling the left.
  const leftExchangeCount = Math.ceil(Math.max(totalExchanges, 1) / 2)
  const sideOf = (turnIndex: number): 'left' | 'right' => {
    const exchangeIndex = Math.floor(turnIndex / 2)
    return exchangeIndex < leftExchangeCount ? 'left' : 'right'
  }

  const leftIndices = turns.map((_, i) => i).filter((i) => sideOf(i) === 'left')
  const rightIndices = turns.map((_, i) => i).filter((i) => sideOf(i) === 'right')

  function renderColumn(indices: number[], side: 'left' | 'right') {
    return indices.map((turnIndex, slotIndex) => {
      const turn = turns[turnIndex]
      const layout = computeSideCascadeLayout({
        containerWidth: width,
        containerHeight: height,
        ...mouth,
        side,
        slotIndex,
        maxWidthPct: CASCADE_MAX_WIDTH_PCT,
        maxHeightPx: CASCADE_MAX_HEIGHT_PX,
      })

      return (
        <SpeechBubble
          key={turnIndex}
          text={turn.text}
          mouth={mouth}
          containerRef={containerRef}
          layout={layout}
          variant={turn.role === 'user' ? 'user' : 'ai'}
          showTail={turn.role === 'assistant' && turnIndex === lastAssistantIndex}
          style={{ zIndex: slotIndex + 1 }}
        />
      )
    })
  }

  return (
    <>
      {renderColumn(leftIndices, 'left')}
      {renderColumn(rightIndices, 'right')}
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
