import { Check, X } from 'lucide-react'
import { answerKey } from '../../lib/examScoring'
import { optionKey, type CompResult, type CompSection, type CompTestContent } from '../../lib/compTests'
import { useCompCopy } from '../../data/compTestCopy'

/** What the item asked, as one line (the gap-fill items have no wording of their own). */
function itemPrompt(section: CompSection, id: string, gapLabel: string): string {
  switch (section.type) {
    case 'mcq':
      return section.items.find((i) => i.id === id)?.stem ?? ''
    case 'true-false':
      return section.items.find((i) => i.id === id)?.statement ?? ''
    case 'matching':
      return section.items.find((i) => i.id === id)?.text ?? ''
    case 'short-answer':
      return section.items.find((i) => i.id === id)?.question ?? ''
    case 'gap-fill':
      return gapLabel
  }
}

/** A given or expected choice key with its option text ("B) in the morning"). */
function withOptionText(section: CompSection, id: string, key: string): string {
  if (!key) return key
  const options = section.type === 'mcq' ? section.items.find((i) => i.id === id)?.options : section.type === 'matching' ? section.options : undefined
  if (!options) return key
  const index = key.charCodeAt(0) - 65
  return options[index] !== undefined && optionKey(index) === key ? `${key}) ${options[index]}` : key
}

/**
 * Item-by-item result: what the student gave, the key, right or wrong. With `onRemark`, typed
 * answers (gap fill, short answer) get Accept / Reject / Automatic buttons for the teacher.
 */
export default function ResultList({
  content,
  result,
  onRemark,
  busyKey,
}: {
  content: CompTestContent
  result: CompResult
  onRemark?: (key: string, correct: boolean | null) => void
  busyKey?: string | null
}) {
  const { c } = useCompCopy()
  const byKey = new Map(result.items.map((i) => [i.key, i]))

  return (
    <div className="space-y-5">
      {content.sections.map((section, si) => (
        <section key={section.id} className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">
            {c('taskN', { n: si + 1 })} · {c(`type_${section.type}`)}
          </h3>
          <ul className="divide-y divide-border rounded-xl border border-border bg-card">
            {section.items.map((item) => {
              const key = answerKey(section.id, item.id)
              const r = byKey.get(key)
              if (!r) return null
              const typed = section.type === 'gap-fill' || section.type === 'short-answer'
              return (
                <li key={key} className="flex flex-wrap items-start gap-3 px-3 py-2.5 text-sm">
                  <span className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${r.correct ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
                    {r.correct ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                  </span>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p lang="en" className="text-foreground">
                      <span className="mr-1.5 font-semibold text-muted-foreground">{item.id}.</span>
                      {itemPrompt(section, item.id, c('gap'))}
                    </p>
                    <p className="text-muted-foreground">
                      {c('given')}: <span lang="en" className={r.correct ? 'font-medium text-emerald-700' : 'font-medium text-rose-700'}>{withOptionText(section, item.id, r.given) || '—'}</span>
                      {!r.correct || r.overridden ? (
                        <>
                          {' · '}
                          {c('expected')}: <span lang="en" className="font-medium text-foreground">{withOptionText(section, item.id, r.expected)}</span>
                        </>
                      ) : null}
                      {r.overridden && <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">{c('remarked')}</span>}
                    </p>
                  </div>
                  {onRemark && typed && r.given && (
                    <div className="flex shrink-0 gap-1">
                      <button type="button" disabled={busyKey === key} onClick={() => onRemark(key, true)} className="rounded-md border border-border px-2 py-1 text-xs hover:bg-secondary disabled:opacity-50">
                        {c('accept')}
                      </button>
                      <button type="button" disabled={busyKey === key} onClick={() => onRemark(key, false)} className="rounded-md border border-border px-2 py-1 text-xs hover:bg-secondary disabled:opacity-50">
                        {c('reject')}
                      </button>
                      {r.overridden && (
                        <button type="button" disabled={busyKey === key} onClick={() => onRemark(key, null)} className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-secondary disabled:opacity-50">
                          {c('automatic')}
                        </button>
                      )}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
