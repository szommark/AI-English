import { Link } from 'react-router-dom'
import { Volume2 } from 'lucide-react'
import type { Phoneme } from '../../data/phonemes'
import { useLanguage } from '../../lib/i18n'

export function HighlightedWord({ word, highlight }: { word: string; highlight: string }) {
  const index = word.toLowerCase().indexOf(highlight.toLowerCase())
  if (index === -1) return <>{word}</>
  return (
    <>
      {word.slice(0, index)}
      <span className="text-rose-600 font-semibold">{word.slice(index, index + highlight.length)}</span>
      {word.slice(index + highlight.length)}
    </>
  )
}

/**
 * A Sound Bank tile. The example word plays only while the pointer is on the speaker icon (or when
 * it is tapped), not on hovering the whole tile. The speaker sits beside the link, not inside it,
 * so it stays a real button.
 */
export default function PhonemeTile({
  phoneme,
  onSpeak,
}: {
  phoneme: Phoneme
  onSpeak: (word: string) => void
}) {
  const { t } = useLanguage()
  const primaryWord = phoneme.exampleWords[0]

  return (
    <div className="group relative">
      <Link
        to={`/pronunciation/sounds/${phoneme.id}`}
        className="block rounded-xl border border-border bg-card p-4 pr-12 transition-all hover:border-rose-200 hover:shadow-[var(--shadow-card)] group-hover:-translate-y-0.5"
      >
        <span className="text-xl font-semibold text-foreground">/{phoneme.ipaSymbol}/</span>
        <p className="mt-2 text-sm text-muted-foreground">
          <HighlightedWord word={primaryWord.word} highlight={primaryWord.highlight} />
        </p>
        {phoneme.curriculumId && (
          <span className="mt-2 inline-block rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-medium text-rose-700">
            Exercises
          </span>
        )}
      </Link>
      <button
        type="button"
        onMouseEnter={() => onSpeak(primaryWord.word)}
        onClick={() => onSpeak(primaryWord.word)}
        aria-label={t('sndSpeakExample', { word: primaryWord.word })}
        title={t('sndSpeakExample', { word: primaryWord.word })}
        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full text-foreground transition-transform hover:bg-secondary group-hover:-translate-y-0.5"
      >
        <Volume2 className="h-4 w-4" />
      </button>
    </div>
  )
}
