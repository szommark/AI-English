import { useState } from 'react'
import { CheckCircle2, OctagonX, Sparkles, TriangleAlert } from 'lucide-react'
import { CRITERIA, CRITERIA_BY_ID, GROUP_LABEL, type CriterionGroup } from '../../data/examTaskCriteria'
import { pick, useExamTaskCopy } from '../../data/examTaskCopy'
import type { ListeningFormat } from '../../lib/examTasks'
import type { CheckReport, Finding, ItemDistance } from '../../lib/listeningChecks'
import { cardClass, inputClass, secondaryButtonClass } from '../TeacherTools/ui'

const GROUPS: CriterionGroup[] = ['A', 'B', 'C', 'D', 'E', 'F']
const MIN_GAP = 15

/** One bar per item: syllables since the previous answer, against the 15-syllable minimum. */
export function DistanceChart({ distances }: { distances: ItemDistance[] }) {
  const { c } = useExamTaskCopy()
  const max = Math.max(60, ...distances.map((d) => d.gapSyllables ?? 0))
  return (
    <figure className="space-y-1">
      <figcaption className="text-xs font-medium text-muted-foreground">{c('distanceChart')}</figcaption>
      <div className="space-y-1">
        {distances.map((d, i) => {
          const v = d.gapSyllables
          const short = v !== null && v < MIN_GAP
          return (
            <div key={d.id} className="flex items-center gap-2 text-xs">
              <span className="w-8 shrink-0 text-right font-semibold tabular-nums text-muted-foreground">({d.id})</span>
              <div className="relative h-4 flex-1 rounded bg-muted">
                {v !== null && (
                  <div
                    className={`h-4 rounded ${short ? 'bg-rose-400' : 'bg-[var(--teal-accent)]'}`}
                    style={{ width: `${Math.max(2, (Math.min(v, max) / max) * 100)}%` }}
                  />
                )}
                <div className="absolute inset-y-0 border-l-2 border-dashed border-foreground/40" style={{ left: `${(MIN_GAP / max) * 100}%` }} aria-hidden />
              </div>
              <span className={`w-28 shrink-0 whitespace-nowrap tabular-nums ${short ? 'font-semibold text-rose-700' : 'text-muted-foreground'}`}>
                {v === null ? '—' : c('syllables', { n: v })}
                {i === 0 && v !== null ? ` (${c('leadIn')})` : ''}
              </span>
            </div>
          )
        })}
      </div>
    </figure>
  )
}

function FindingLine({ f }: { f: Finding }) {
  const { c, lang } = useExamTaskCopy()
  const criterion = CRITERIA_BY_ID.get(f.criterionId)
  const Icon = f.status === 'fail' ? OctagonX : TriangleAlert
  return (
    <li className="flex gap-2 text-sm">
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${f.status === 'fail' ? 'text-rose-600' : 'text-amber-600'}`} aria-label={f.status === 'fail' ? c('blocker') : c('warning')} />
      <span>
        <span className="font-medium text-foreground">
          {f.itemId !== undefined && `${c('itemN', { n: f.itemId })} · `}
          {criterion ? pick(criterion.label, lang) : f.criterionId}
        </span>
        <span className="text-muted-foreground"> — {pick(f.detail, lang)}</span>
      </span>
    </li>
  )
}

export default function ChecksPanel({
  report,
  format,
  onFix,
  fixing,
}: {
  report: CheckReport
  format: ListeningFormat
  onFix: (keepScript: boolean, note: string) => void
  fixing: boolean
}) {
  const { c, lang } = useExamTaskCopy()
  const [keepScript, setKeepScript] = useState(true)
  const [note, setNote] = useState('')
  const fails = report.findings.filter((f) => f.status === 'fail').length
  const warns = report.findings.length - fails
  const manual = CRITERIA.filter((x) => !x.auto && x.formats.includes(format))

  return (
    <section className={cardClass} aria-live="polite">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold text-foreground">{c('checks')}</h2>
        <span className={`text-sm font-medium ${fails ? 'text-rose-700' : warns ? 'text-amber-700' : 'text-emerald-700'}`}>
          {report.findings.length ? c('checksSummary', { fail: fails, warn: warns }) : c('checksClean')}
        </span>
      </div>

      <DistanceChart distances={report.distances} />

      {GROUPS.map((g) => {
        const list = report.findings
          .filter((f) => CRITERIA_BY_ID.get(f.criterionId)?.group === g)
          .sort((a, b) => (a.status === b.status ? 0 : a.status === 'fail' ? -1 : 1))
        if (list.length === 0) return null
        return (
          <div key={g} className="space-y-1">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{pick(GROUP_LABEL[g], lang)}</h3>
            <ul className="space-y-1">
              {list.map((f, i) => (
                <FindingLine key={i} f={f} />
              ))}
            </ul>
          </div>
        )
      })}

      <details className="text-sm">
        <summary className="cursor-pointer text-muted-foreground">{c('passedAuto', { n: report.passed.length })}</summary>
        <ul className="mt-1 space-y-0.5 pl-1">
          {report.passed.map((id) => (
            <li key={id} className="flex gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              {pick(CRITERIA_BY_ID.get(id)?.label ?? { en: id, hu: id }, lang)}
            </li>
          ))}
        </ul>
      </details>
      <details className="text-sm">
        <summary className="cursor-pointer text-muted-foreground">{c('manualChecks', { n: manual.length })}</summary>
        <ul className="mt-1 list-disc space-y-0.5 pl-6 text-muted-foreground">
          {manual.map((x) => (
            <li key={x.id}>
              <span className="text-foreground">{pick(x.label, lang)}</span> — {pick(x.test, lang)}
            </li>
          ))}
        </ul>
      </details>

      {report.findings.length > 0 && (
        <div className="space-y-2 rounded-xl border border-border p-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={keepScript} onChange={(e) => setKeepScript(e.target.checked)} className="h-4 w-4" />
            {c('keepScript')}
          </label>
          <input className={`${inputClass} text-sm`} placeholder={c('teacherNote')} value={note} maxLength={1000} onChange={(e) => setNote(e.target.value)} />
          <button type="button" className={`${secondaryButtonClass} inline-flex items-center gap-2`} disabled={fixing} onClick={() => onFix(keepScript, note)}>
            <Sparkles className="h-4 w-4" />
            {fixing ? c('revising') : c('fixWithAi')}
          </button>
        </div>
      )}
    </section>
  )
}
