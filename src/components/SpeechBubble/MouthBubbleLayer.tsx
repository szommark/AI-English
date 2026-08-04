import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import type { MouthAnchor } from '../../lib/types'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useContainerSize } from '../../hooks/useContainerSize'
import { splitTextIntoChunks } from '../../lib/textWrap'
import SpeechBubble from './SpeechBubble'
import CascadeBubble from './CascadeBubble'
import {
  CASCADE_GAP_PX,
  CASCADE_HORIZONTAL_PADDING_PX,
  CASCADE_MARGIN_PX,
  CASCADE_MAX_LINES,
  CASCADE_MAX_WIDTH_PX,
  CASCADE_STACK_GAP_PX,
  CROSSFADE_MS,
  DESKTOP_QUERY,
} from './constants'

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

interface ChunkedTurn {
  turnIndex: number
  side: 'left' | 'right'
  role: 'user' | 'assistant'
  isLastAssistant: boolean
  chunks: string[]
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
  const { width } = useContainerSize(containerRef)

  const lastAssistantIndex = useMemo(() => {
    for (let i = turns.length - 1; i >= 0; i--) {
      if (turns[i].role === 'assistant') return i
    }
    return -1
  }, [turns])

  // Two turns (user + AI) make one exchange. Split the *known* total exchange count into two
  // balanced halves up front, so a short conversation (e.g. rehearsal's 3 exchanges) still
  // uses both sides instead of only ever filling the left.
  const leftExchangeCount = Math.ceil(Math.max(totalExchanges, 1) / 2)

  const chunkedTurns: ChunkedTurn[] = useMemo(() => {
    const textWrapWidth = CASCADE_MAX_WIDTH_PX - CASCADE_HORIZONTAL_PADDING_PX
    return turns.map((turn, turnIndex) => {
      const exchangeIndex = Math.floor(turnIndex / 2)
      return {
        turnIndex,
        side: exchangeIndex < leftExchangeCount ? 'left' : 'right',
        role: turn.role,
        isLastAssistant: turnIndex === lastAssistantIndex,
        chunks: splitTextIntoChunks(turn.text, textWrapWidth, CASCADE_MAX_LINES),
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turns, leftExchangeCount, lastAssistantIndex])

  if (!width) return null

  const mouthPxX = (mouth.mouthX / 100) * width
  const boxWidthPx = (mouth.mouthBoxWidth / 100) * width
  const exclLeftPx = mouthPxX - boxWidthPx / 2
  const exclRightPx = mouthPxX + boxWidthPx / 2

  function renderColumn(side: 'left' | 'right') {
    const items = chunkedTurns.filter((t) => t.side === side)
    return items.flatMap((t) =>
      t.chunks.map((chunk, chunkIndex) => (
        <CascadeBubble
          key={`${t.turnIndex}-${chunkIndex}`}
          text={chunk}
          variant={t.role === 'user' ? 'user' : 'ai'}
          showTail={t.isLastAssistant && chunkIndex === t.chunks.length - 1}
          side={side}
        />
      ))
    )
  }

  return (
    <>
      <div
        className="pointer-events-none absolute flex flex-col items-end"
        style={{ right: width - (exclLeftPx - CASCADE_GAP_PX), top: CASCADE_MARGIN_PX, gap: CASCADE_STACK_GAP_PX }}
      >
        {renderColumn('left')}
      </div>
      <div
        className="pointer-events-none absolute flex flex-col items-start"
        style={{ left: exclRightPx + CASCADE_GAP_PX, top: CASCADE_MARGIN_PX, gap: CASCADE_STACK_GAP_PX }}
      >
        {renderColumn('right')}
      </div>
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
