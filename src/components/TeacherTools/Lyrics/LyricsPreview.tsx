import { lineSegments, type GapGroup, type LyricsDoc } from '../../../lib/lyricsGapFill'
import { useLanguage } from '../../../lib/i18n'

/**
 * The editor's live preview: every word is a button that adds a gap, every gap one that
 * removes it (a whole phrase gap at once).
 */
export default function LyricsPreview({
  doc,
  byWord,
  numberGaps,
  onToggleWord,
}: {
  doc: LyricsDoc
  byWord: Map<number, GapGroup>
  numberGaps: boolean
  onToggleWord: (word: number) => void
}) {
  const { t } = useLanguage()

  if (doc.words.length === 0) return <p className="text-sm text-muted-foreground">{t('lyPreviewEmpty')}</p>

  return (
    <div className="text-[15px] leading-8 text-foreground">
      {doc.lines.map((line, i) => {
        if (line.kind === 'blank') return <div key={i} className="h-3" />
        if (line.kind === 'header') {
          return (
            <div key={i} className="mt-1 text-sm font-semibold italic text-muted-foreground">
              {line.tokens[0].text}
            </div>
          )
        }
        return (
          <div key={i}>
            {lineSegments(line, byWord).map((s, k) => {
              if (s.kind === 'gap') {
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => onToggleWord(s.group.words[0])}
                    className="mx-0.5 rounded-md border border-[var(--teal-accent-border)] bg-[var(--teal-accent-soft)] px-1.5 py-0.5 font-medium text-[var(--teal-accent-strong)] hover:line-through"
                  >
                    {numberGaps && <sup className="mr-0.5 text-[10px] font-bold">{s.group.number}</sup>}
                    {s.group.answer}
                  </button>
                )
              }
              if (s.word === null) return <span key={k} className="whitespace-pre-wrap">{s.text}</span>
              const word = s.word
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => onToggleWord(word)}
                  className="rounded px-px hover:bg-secondary hover:text-[var(--teal-accent-strong)]"
                >
                  {s.text}
                </button>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
