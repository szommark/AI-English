import { Check } from 'lucide-react'
import { cardClass, hintClass } from '../TeacherTools/ui'
import { useCompCopy } from '../../data/compTestCopy'
import { vocabCoverage, type CompFocus } from '../../lib/compTests'

/**
 * The focus the test was generated with: its grammar points, and which focus words the text (as
 * edited now) uses. Teacher-only; students never see it. "Remove focus" drops it from the test.
 */
export default function FocusCard({ focus, text, onRemove }: { focus: CompFocus; text: string; onRemove: () => void }) {
  const { c } = useCompCopy()
  const { used, missing } = vocabCoverage(text, focus.vocabulary)

  return (
    <section className={cardClass}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-semibold text-foreground">{c('focusTitle')}</h2>
        <button type="button" onClick={onRemove} className="text-xs text-muted-foreground underline-offset-2 hover:underline">
          {c('focusRemove')}
        </button>
      </div>
      {focus.grammar.length > 0 && (
        <p className="text-sm text-foreground">
          <span className="font-medium">{c('grammarFocus')}:</span> <span lang="en">{focus.grammar.join(' · ')}</span>
        </p>
      )}
      {focus.vocabulary.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-foreground">
            <span className="font-medium">{c('vocabFocus')}:</span> {c('vocabCoverage', { n: used.length, m: focus.vocabulary.length })}
          </p>
          <ul className="flex flex-wrap gap-1.5" lang="en">
            {used.map((w) => (
              <li key={w} className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-sm text-emerald-800">
                <Check className="h-3.5 w-3.5" />
                {w}
              </li>
            ))}
            {missing.map((w) => (
              <li key={w} className="rounded-full border border-dashed border-border px-2.5 py-0.5 text-sm text-muted-foreground">
                {w}
              </li>
            ))}
          </ul>
          <p className={hintClass}>{c('vocabCoverageHint')}</p>
        </div>
      )}
    </section>
  )
}
