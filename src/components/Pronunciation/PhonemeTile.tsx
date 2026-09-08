import { Volume2 } from 'lucide-react'
import type { Phoneme } from '../../data/phonemes'

function HighlightedWord({ word, highlight }: { word: string; highlight: string }) {
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

export default function PhonemeTile({
  phoneme,
  onHover,
}: {
  phoneme: Phoneme
  onHover: (word: string) => void
}) {
  const primaryWord = phoneme.exampleWords[0]

  return (
    <div
      onMouseEnter={() => onHover(primaryWord.word)}
      className="group rounded-xl border border-border bg-card p-4 transition-all hover:border-rose-200 hover:shadow-[var(--shadow-card)] hover:-translate-y-0.5 cursor-default"
    >
      <div className="flex items-start justify-between">
        <span className="text-xl font-semibold text-foreground">/{phoneme.ipaSymbol}/</span>
        <Volume2 className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        <HighlightedWord word={primaryWord.word} highlight={primaryWord.highlight} />
      </p>
      {phoneme.curriculumId && (
        <span className="mt-2 inline-block rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-medium text-rose-700">
          Exercises
        </span>
      )}
    </div>
  )
}
