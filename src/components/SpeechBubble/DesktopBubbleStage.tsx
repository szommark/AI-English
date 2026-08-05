import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import type { MouthAnchor } from '../../lib/types'
import { computeBubblePlacement, type ConversationTurn, type PlacedBubble } from '../../lib/bubblePlacement'
import { measureBubbleBox } from '../../lib/bubbleMeasure'
import { useElementRect } from '../../hooks/useElementRect'
import Bubble from './Bubble'
import { BUBBLE_TOP_MARGIN_PX, CLEAR_FADE_MS, MOUTH_GAP_PX, STACK_GAP_PX, VIEWPORT_MARGIN_PX } from './constants'

export interface DesktopBubbleStageProps {
  containerRef: RefObject<HTMLElement | null>
  mouth: MouthAnchor
  turns: ConversationTurn[]
  /** Once the session has ended, bubbles stop appearing on the photo (final transcript takes over). */
  isEnded: boolean
}

/**
 * Desktop's unified photo-overlay placement: turns fill the left region (from the mouth
 * exclusion zone out to the viewport's left edge) top-to-bottom, switch to the right region
 * once the left is full, and clear-and-restart from the left once the right is also full.
 * Bubble width is capped by the viewport edge, not the photo/card — see MOUTH_GAP_PX /
 * VIEWPORT_MARGIN_PX usage below.
 */
export default function DesktopBubbleStage({ containerRef, mouth, turns, isEnded }: DesktopBubbleStageProps) {
  const { left: containerLeft, width: containerWidth, height: containerHeight } = useElementRect(containerRef)

  const { bubbles, exclLeft, exclRight } = useMemo(() => {
    if (!containerWidth || !containerHeight) {
      return { bubbles: [] as PlacedBubble[], exclLeft: 0, exclRight: 0 }
    }

    const mouthPxX = (mouth.mouthX / 100) * containerWidth
    const boxWidthPx = (mouth.mouthBoxWidth / 100) * containerWidth
    const exclLeft = mouthPxX - boxWidthPx / 2
    const exclRight = mouthPxX + boxWidthPx / 2

    const viewportWidth = window.innerWidth
    const leftWidth = Math.max(exclLeft - MOUTH_GAP_PX - (VIEWPORT_MARGIN_PX - containerLeft), 0)
    const rightWidth = Math.max(viewportWidth - VIEWPORT_MARGIN_PX - (containerLeft + exclRight + MOUTH_GAP_PX), 0)
    const availableHeight = Math.max(containerHeight - BUBBLE_TOP_MARGIN_PX, 0)

    const bubbles = computeBubblePlacement(turns, {
      leftWidth,
      rightWidth,
      availableHeight,
      stackGapPx: STACK_GAP_PX,
      measure: measureBubbleBox,
    })

    return { bubbles, exclLeft, exclRight }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turns, containerWidth, containerHeight, containerLeft, mouth.mouthX, mouth.mouthY, mouth.mouthBoxWidth, mouth.mouthBoxHeight])

  const currentGeneration = bubbles.length > 0 ? bubbles[bubbles.length - 1].generation : 0
  const prevGenRef = useRef(currentGeneration)
  const [fadingPrevGeneration, setFadingPrevGeneration] = useState(false)

  useEffect(() => {
    if (currentGeneration === prevGenRef.current) return
    prevGenRef.current = currentGeneration
    setFadingPrevGeneration(true)
    const timer = setTimeout(() => setFadingPrevGeneration(false), CLEAR_FADE_MS)
    return () => clearTimeout(timer)
  }, [currentGeneration])

  if (isEnded || bubbles.length === 0) return null

  const visibleBubbles = bubbles.filter(
    (b) => b.generation === currentGeneration || (fadingPrevGeneration && b.generation === currentGeneration - 1)
  )

  return (
    <div className="pointer-events-none absolute inset-0">
      {visibleBubbles.map((b) => {
        const left = b.side === 'left' ? exclLeft - MOUTH_GAP_PX - b.width : exclRight + MOUTH_GAP_PX
        const top = BUBBLE_TOP_MARGIN_PX + b.top
        return (
          <Bubble
            key={b.turnIndex}
            text={b.text}
            variant={b.role === 'user' ? 'user' : 'ai'}
            fadingOut={b.generation !== currentGeneration}
            style={{ left, top, width: b.width }}
          />
        )
      })}
    </div>
  )
}
