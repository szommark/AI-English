import { useEffect, useMemo, useState } from 'react'
import { Check, Plus, X } from 'lucide-react'
import { useLanguage, type MessageKey } from '../../lib/i18n'
import { TASK_KINDS, type TaskKind } from '../../lib/goalPlans'
import { fetchCourses } from '../../lib/courseApi'
import { fetchCompTests } from '../../lib/compTestApi'
import { fetchVocabLists } from '../../lib/vocabListsApi'
import { scenarios } from '../../data/scenarios'
import { inputClass } from '../TeacherTools/ui'
import { TASK_KIND_ICON, TASK_KIND_LABEL } from './labels'

export interface PickedContent {
  kind: TaskKind
  ref: string
  title: string
}

interface Option extends PickedContent {
  detail: string
}

const EMPTY: Record<TaskKind, MessageKey> = {
  course: 'gpPickerEmptyCourse',
  scenario: 'gpPickerNoMatch',
  word_list: 'gpPickerEmptyList',
  comp_test: 'gpPickerEmptyTest',
}

/** The teacher's own content of one kind (published courses only), or the built-in scenarios. */
async function loadOptions(kind: TaskKind, lang: string): Promise<Option[]> {
  switch (kind) {
    case 'course':
      return (await fetchCourses())
        .filter((c) => c.status === 'published')
        .map((c) => ({ kind, ref: c.id, title: c.title, detail: [c.level, c.topic].filter(Boolean).join(' · ') }))
    case 'word_list':
      return (await fetchVocabLists()).map((l) => ({
        kind,
        ref: l.id,
        title: l.title,
        detail: [l.cefrLevel, `${l.termCount}`].filter(Boolean).join(' · '),
      }))
    case 'comp_test':
      return (await fetchCompTests()).map((c) => ({ kind, ref: c.id, title: c.title, detail: [c.level, c.skill, c.topic].filter(Boolean).join(' · ') }))
    case 'scenario':
      return scenarios.map((s) => ({ kind, ref: s.id, title: lang === 'hu' ? s.titleHu : s.title, detail: s.description }))
  }
}

/**
 * Picks content for a milestone's tasks: one tab per kind, with a search box. Each click adds
 * a task at once (the dialog stays open, so several can be added); content already under this
 * milestone shows as added.
 */
export default function TaskPicker({
  added,
  onPick,
  onClose,
}: {
  /** `${kind}:${ref}` of the milestone's tasks. */
  added: Set<string>
  onPick: (item: PickedContent) => void
  onClose: () => void
}) {
  const { t, lang } = useLanguage()
  const [kind, setKind] = useState<TaskKind>('course')
  const [options, setOptions] = useState<Partial<Record<TaskKind, Option[] | 'error'>>>({})
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (options[kind]) return
    let live = true
    loadOptions(kind, lang)
      .then((list) => live && setOptions((o) => ({ ...o, [kind]: list })))
      .catch(() => live && setOptions((o) => ({ ...o, [kind]: 'error' })))
    return () => {
      live = false
    }
  }, [kind, lang, options])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const list = options[kind]
  const shown = useMemo(() => {
    if (!Array.isArray(list)) return []
    const q = query.trim().toLowerCase()
    return q ? list.filter((o) => `${o.title} ${o.detail}`.toLowerCase().includes(q)) : list
  }, [list, query])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-picker-title"
        className="relative flex max-h-full w-full max-w-lg flex-col rounded-xl border border-border bg-card p-5 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" onClick={onClose} aria-label={t('gpClose')} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground">
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
        <h2 id="task-picker-title" className="text-lg font-semibold text-foreground">
          {t('gpPickerTitle')}
        </h2>

        <div className="mt-3 flex flex-wrap gap-1 rounded-lg bg-secondary p-1" role="tablist">
          {TASK_KINDS.map((k) => {
            const Icon = TASK_KIND_ICON[k]
            return (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={kind === k}
                onClick={() => {
                  setKind(k)
                  setQuery('')
                }}
                className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium ${
                  kind === k ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {t(TASK_KIND_LABEL[k])}
              </button>
            )
          })}
        </div>

        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('gpSearch')}
          aria-label={t('gpSearch')}
          className={`${inputClass} mt-3`}
        />

        <ul className="mt-3 min-h-[8rem] flex-1 space-y-1 overflow-y-auto">
          {list === undefined && <li className="p-2 text-sm text-muted-foreground">{t('loading')}</li>}
          {list === 'error' && <li className="p-2 text-sm text-red-600">{t('gpPickerLoadError')}</li>}
          {Array.isArray(list) && shown.length === 0 && (
            <li className="p-2 text-sm text-muted-foreground">{t(list.length === 0 ? EMPTY[kind] : 'gpPickerNoMatch')}</li>
          )}
          {shown.map((o) => {
            const isAdded = added.has(`${o.kind}:${o.ref}`)
            return (
              <li key={o.ref}>
                <button
                  type="button"
                  disabled={isAdded}
                  onClick={() => onPick({ kind: o.kind, ref: o.ref, title: o.title.slice(0, 160) })}
                  className="flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left hover:bg-secondary disabled:hover:bg-transparent"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-foreground">{o.title}</span>
                    {o.detail && <span className="block truncate text-xs text-muted-foreground">{o.detail}</span>}
                  </span>
                  {isAdded ? (
                    <span className="inline-flex shrink-0 items-center gap-1 text-xs text-emerald-700">
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      {t('gpAdded')}
                    </span>
                  ) : (
                    <Plus className="h-4 w-4 shrink-0 text-[var(--teal-accent-strong)]" aria-hidden="true" />
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
