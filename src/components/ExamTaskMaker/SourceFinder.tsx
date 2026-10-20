import { useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { useExamTaskCopy, type ExamTaskCopyKey } from '../../data/examTaskCopy'
import { searchExamSources } from '../../lib/examTaskApi'
import { levelSpec, type ExamField, type ListeningFormat, type TaskLevel } from '../../lib/examTasks'
import type { SourceCandidate, SourceSearchResult } from '../../lib/examSources'
import { TeacherToolsError } from '../../lib/teacherToolsApi'
import { hintClass, inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from '../TeacherTools/ui'

const chipClass = 'rounded-full bg-muted px-2 py-0.5 text-xs text-foreground'
const warnChipClass = 'rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900'

/**
 * The web source finder (the teacher's research methodology): full-text sources only, newest
 * first, each with word count, figures, field vocabulary, format recommendation, capacity and
 * licence. Picking one makes its full text the generation source.
 */
export default function SourceFinder({
  level,
  field,
  format,
  picked,
  onPick,
  onFormat,
}: {
  level: TaskLevel
  field: ExamField
  format: ListeningFormat
  picked: SourceCandidate | null
  onPick: (s: SourceCandidate) => void
  onFormat: (f: ListeningFormat) => void
}) {
  const { c, lang } = useExamTaskCopy()
  const [topic, setTopic] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<SourceSearchResult | null>(null)
  const [remaining, setRemaining] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function search() {
    setBusy(true)
    setError(null)
    try {
      const { remaining: left, ...found } = await searchExamSources({
        topic: topic.trim(),
        field,
        level,
        format,
      })
      setResult(found)
      setRemaining(left)
    } catch (err) {
      const code = err instanceof TeacherToolsError ? err.code : 'generic'
      setError(c(code === 'daily_limit' ? 'err_daily_limit' : 'err_generic'))
    } finally {
      setBusy(false)
    }
  }

  const items = levelSpec(level, format).items
  const date = (iso: string) =>
    iso
      ? new Date(iso).toLocaleDateString(lang === 'hu' ? 'hu-HU' : 'en-GB', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : ''

  return (
    <div className="space-y-3">
      <form
        className="flex flex-wrap items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          if (!busy) search()
        }}
      >
        <label className={`${labelClass} min-w-56 flex-1`}>
          {c('src_topic')}
          <input className={`${inputClass} mt-1`} value={topic} maxLength={120} placeholder={c('src_topicPlaceholder')} onChange={(e) => setTopic(e.target.value)} />
        </label>
        <button type="submit" className={primaryButtonClass} disabled={busy}>
          {busy ? c('src_searching') : c('src_search')}
        </button>
      </form>
      <p className={hintClass}>
        {c('src_hint')}
        {remaining !== null && ` ${c('remaining', { n: remaining })}`}
      </p>
      {error && <p className="text-sm text-red-600">{error}</p>}

      {result && (
        <div className="space-y-3">
          {!result.guardian && <p className={hintClass}>{c('src_noGuardian')}</p>}
          {!result.analysed && result.sources.length > 0 && <p className="text-sm text-amber-800">{c('src_noAnalysis')}</p>}
          {result.sources.length === 0 && <p className="text-sm text-foreground">{c('src_empty')}</p>}
          <ol className="space-y-3">
            {result.sources.map((s) => {
              const chosen = picked?.url === s.url
              return (
                <li
                  key={s.url}
                  className={`space-y-2 rounded-xl border p-4 ${chosen ? 'border-[var(--teal-accent-border)] bg-[var(--teal-accent-soft)]' : 'border-border bg-card'}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-foreground underline-offset-2 hover:underline"
                      >
                        {s.title}
                        <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                      </a>
                      <p className={hintClass}>
                        {s.publisher} · {date(s.date)}
                      </p>
                    </div>
                    <button type="button" className={chosen ? primaryButtonClass : secondaryButtonClass} aria-pressed={chosen} onClick={() => onPick(s)}>
                      {chosen ? c('src_picked') : c('src_pick')}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <span className={chipClass}>{c('src_words', { n: s.wordCount })}</span>
                    <span className={s.environmental ? warnChipClass : chipClass}>{c(s.environmental ? 'src_formatTf' : 'src_formatBoth')}</span>
                    {s.usableFacts !== null && <span className={chipClass}>{c('src_capacity', { facts: s.usableFacts, items })}</span>}
                    {s.thin && <span className={warnChipClass}>{c('src_thin')}</span>}
                    {(s.topicFit === 'partial' || s.topicFit === 'off') && <span className={warnChipClass}>{c(`src_fit_${s.topicFit}`)}</span>}
                  </div>
                  <p className={`text-xs ${format === 'notes' && s.figures > 6 ? 'text-amber-800' : 'text-muted-foreground'}`}>
                    {c(format === 'notes' ? 'src_figuresNotes' : 'src_figuresTf', { n: s.figures })}
                  </p>
                  {s.formatNote && <p className="text-sm text-foreground">{s.formatNote}</p>}
                  {s.vocabulary.length > 0 && (
                    <div className="text-sm">
                      <p className="font-medium text-foreground">{c('src_vocab')}</p>
                      <ul className="mt-1 space-y-0.5">
                        {s.vocabulary.map((v) => (
                          <li key={v.category} className="text-foreground">
                            <span className="font-medium">{v.category}:</span> {v.terms.join(', ')}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <p className={hintClass}>{c(`src_licence_${s.provider}` as ExamTaskCopyKey)}</p>
                  {chosen && s.environmental && format === 'notes' && (
                    <div className="flex flex-wrap items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
                      <span>{c('src_envWarn')}</span>
                      <button type="button" className={secondaryButtonClass} onClick={() => onFormat('true-false')}>
                        {c('envSwitch')}
                      </button>
                    </div>
                  )}
                </li>
              )
            })}
          </ol>
          {result.skipped.length > 0 && (
            <details className="text-sm">
              <summary className="cursor-pointer text-muted-foreground">{c('src_skipped', { n: result.skipped.length })}</summary>
              <ul className="mt-1 space-y-0.5">
                {result.skipped.map((s) => (
                  <li key={s.url} className="text-muted-foreground">
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
                      {s.title}
                    </a>{' '}
                    — {c(`src_reason_${s.reason}`)}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  )
}
