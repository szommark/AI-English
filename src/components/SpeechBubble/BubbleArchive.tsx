import { useMemo } from 'react'
import { currentExchangeIndexOf, type ConversationTurn } from './MouthBubbleLayer'
import CascadeBubble from './CascadeBubble'
import { splitTextIntoChunks } from '../../lib/textWrap'
import { CASCADE_HORIZONTAL_PADDING_PX, CASCADE_MAX_LINES, CASCADE_MAX_WIDTH_PX } from './constants'

export interface BubbleArchiveProps {
  turns: ConversationTurn[]
  className?: string
}

/**
 * Desktop-only chronological list of every exchange except the current one (which stays
 * live near the photo's mouth via MouthBubbleLayer) — same bubble styling (colored border,
 * chained 2-line splitting), arranged as a plain chat-log list in normal document flow below
 * the photo/controls, so it never needs to overflow or be constrained by anything.
 */
export default function BubbleArchive({ turns, className = '' }: BubbleArchiveProps) {
  const currentExchangeIndex = currentExchangeIndexOf(turns)
  const archivedTurns = useMemo(
    () => turns.filter((_, i) => Math.floor(i / 2) < currentExchangeIndex),
    [turns, currentExchangeIndex]
  )

  if (archivedTurns.length === 0) return null

  const textWrapWidth = CASCADE_MAX_WIDTH_PX - CASCADE_HORIZONTAL_PADDING_PX

  return (
    <div className={`hidden md:flex md:flex-col gap-2 ${className}`}>
      {archivedTurns.map((turn, i) => {
        const chunks = splitTextIntoChunks(turn.text, textWrapWidth, CASCADE_MAX_LINES)
        return (
          <div key={i} className={`flex flex-col gap-1 ${turn.role === 'user' ? 'items-start' : 'items-end'}`}>
            {chunks.map((chunk, ci) => (
              <CascadeBubble
                key={ci}
                text={chunk}
                variant={turn.role === 'user' ? 'user' : 'ai'}
                showTail={false}
                side={turn.role === 'user' ? 'left' : 'right'}
              />
            ))}
          </div>
        )
      })}
    </div>
  )
}
