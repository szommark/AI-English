import { Captions } from 'lucide-react'
import { useLanguage } from '../../lib/i18n'
import type { NarrationPiece } from '../../lib/narration'

/**
 * The current segment's narration as text under the board, so the learner can read along
 * at their own pace. English parts of a Hungarian / German explanation are set off, and
 * the sentence being spoken is highlighted while the lesson plays.
 */
export default function NarrationCaptions({
  pieces,
  currentPiece,
  isPlaying,
  markEnglish,
  visible,
  onToggle,
}: {
  pieces: NarrationPiece[]
  currentPiece: number
  isPlaying: boolean
  /** Set off the English parts — only in a Hungarian / German explanation. */
  markEnglish: boolean
  visible: boolean
  onToggle: () => void
}) {
  const { t: tr } = useLanguage()

  if (!visible) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100"
      >
        <Captions className="h-4 w-4" />
        {tr('captionsShow')}
      </button>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm px-4 py-3 sm:px-5 sm:py-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
          <Captions className="h-4 w-4" />
          {tr('captionsTitle')}
        </span>
        <button type="button" onClick={onToggle} className="rounded-md px-2 py-0.5 text-xs text-slate-400 hover:bg-slate-100">
          {tr('captionsHide')}
        </button>
      </div>
      <p className="font-board text-base sm:text-lg leading-relaxed text-slate-700 min-h-[3.5rem]">
        {pieces.map((piece, i) => (
          <span key={i}>
            {i > 0 && !/^[.,!?;:)]/.test(piece.text) ? ' ' : ''}
            <span
              lang={piece.lang === 'en' ? 'en' : undefined}
              className={`rounded transition-colors ${markEnglish && piece.lang === 'en' ? 'font-semibold text-amber-800' : ''} ${
                isPlaying && i === currentPiece ? 'bg-amber-100' : ''
              }`}
            >
              {piece.text}
            </span>
          </span>
        ))}
      </p>
    </div>
  )
}
