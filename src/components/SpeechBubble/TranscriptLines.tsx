import type { ConversationTurn } from '../../lib/bubblePlacement'

export interface TranscriptLinesProps {
  turns: ConversationTurn[]
  aiLabel: string
  className?: string
}

/** Plain-text per-line transcript, styled to match the existing mobile fallback lines. */
export default function TranscriptLines({ turns, aiLabel, className = '' }: TranscriptLinesProps) {
  if (turns.length === 0) return null
  return (
    <div className={`space-y-2 text-sm ${className}`}>
      {turns.map((turn, i) => (
        <p key={i}>
          <span className={`font-medium ${turn.role === 'user' ? 'text-indigo-600' : 'text-slate-700'}`}>
            {turn.role === 'user' ? 'You' : aiLabel}:{' '}
          </span>
          <span className="text-slate-600">{turn.text}</span>
        </p>
      ))}
    </div>
  )
}
