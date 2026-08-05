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
}

/** Index of the exchange (user+AI pair) the most recent turn belongs to, or -1 if empty. */
export function currentExchangeIndexOf(turns: ConversationTurn[]): number {
  if (turns.length === 0) return -1
  return Math.floor((turns.length - 1) / 2)
}

/**
 * Shared bubble orchestrator for both test-mode live replies and the rehearsal
 * sample-script click-through. Desktop (>=768px) shows only the *current* exchange
 * anchored near the photo's mouth (user on the left, AI reply on the right) — older
 * exchanges move into <BubbleArchive>, rendered separately by the page in normal document
 * flow below the photo/controls. Mobile crossfades between a single anchored AI bubble
 * (unchanged).
 */
export default function MouthBubbleLayer({
  containerRef,
  mouth,
  latestText,
  messageKey,
  allTurns,
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
        <LiveExchange turns={allTurns} mouth={mouth} containerRef={containerRef} />
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

function LiveExchange({
  turns,
  mouth,
  containerRef,
}: {
  turns: ConversationTurn[]
  mouth: MouthAnchor
  containerRef: RefObject<HTMLElement | null>
}) {
  const { width } = useContainerSize(containerRef)

  const currentExchangeIndex = currentExchangeIndexOf(turns)
  const liveTurns = useMemo(
    () =>
      turns
        .map((turn, turnIndex) => ({ turn, turnIndex }))
        .filter(({ turnIndex }) => Math.floor(turnIndex / 2) === currentExchangeIndex),
    [turns, currentExchangeIndex]
  )

  const chunked = useMemo(() => {
    const textWrapWidth = CASCADE_MAX_WIDTH_PX - CASCADE_HORIZONTAL_PADDING_PX
    return liveTurns.map(({ turn, turnIndex }) => ({
      turnIndex,
      role: turn.role,
      chunks: splitTextIntoChunks(turn.text, textWrapWidth, CASCADE_MAX_LINES),
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveTurns])

  if (!width) return null

  const mouthPxX = (mouth.mouthX / 100) * width
  const boxWidthPx = (mouth.mouthBoxWidth / 100) * width
  const exclLeftPx = mouthPxX - boxWidthPx / 2
  const exclRightPx = mouthPxX + boxWidthPx / 2

  const userItem = chunked.find((c) => c.role === 'user')
  const aiItem = chunked.find((c) => c.role === 'assistant')

  return (
    <>
      <div
        className="pointer-events-none absolute flex flex-col items-end"
        style={{
          right: width - (exclLeftPx - CASCADE_GAP_PX),
          top: CASCADE_MARGIN_PX,
          gap: CASCADE_STACK_GAP_PX,
          width: CASCADE_MAX_WIDTH_PX,
        }}
      >
        {userItem?.chunks.map((chunk, ci) => (
          <CascadeBubble key={`${userItem.turnIndex}-${ci}`} text={chunk} variant="user" showTail={false} side="left" />
        ))}
      </div>
      <div
        className="pointer-events-none absolute flex flex-col items-start"
        style={{
          left: exclRightPx + CASCADE_GAP_PX,
          top: CASCADE_MARGIN_PX,
          gap: CASCADE_STACK_GAP_PX,
          width: CASCADE_MAX_WIDTH_PX,
        }}
      >
        {aiItem?.chunks.map((chunk, ci) => (
          <CascadeBubble
            key={`${aiItem.turnIndex}-${ci}`}
            text={chunk}
            variant="ai"
            showTail={ci === aiItem.chunks.length - 1}
            side="right"
          />
        ))}
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
