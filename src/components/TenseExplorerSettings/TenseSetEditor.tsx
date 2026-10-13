import { useState } from 'react'
import { TENSE_IDS, type TenseId } from '../../lib/tenseEngine/index.ts'
import { TENSE_CONTENT, type TenseContent } from '../../data/tenseExplorerContent.ts'
import type { TenseExplorerSetting } from '../../lib/tenseExplorerPolicy'

export interface TenseSetDraft {
  tenses: TenseId[]
  allowCustomize: boolean
}

/** The default when a teacher has saved nothing: every tense, students may change the set. */
export const OPEN_TENSE_SET: TenseSetDraft = { tenses: TENSE_IDS, allowCustomize: true }

const FRAMES: { frame: TenseContent['frame']; label: string }[] = [
  { frame: 'present', label: 'Present' },
  { frame: 'past', label: 'Past' },
  { frame: 'future', label: 'Future' },
]

/** One-line description of a setting for the teacher pages (English, like the other teacher pages). */
export function describeTenseSet(setting: TenseSetDraft | TenseExplorerSetting | null): string {
  const s = setting ?? OPEN_TENSE_SET
  const count = s.tenses.length === TENSE_IDS.length ? `all ${TENSE_IDS.length} tenses` : `${s.tenses.length} of ${TENSE_IDS.length} tenses`
  return s.allowCustomize ? `${count} to start with; students can show the others` : `exactly ${count}, locked`
}

/**
 * Teacher editor for a Tense Explorer setting: tense checkboxes in Present | Past | Future
 * columns and the "can students change it" choice. Saves on the button, not per click.
 */
export default function TenseSetEditor({
  initial,
  saving,
  onSave,
  onCancel,
}: {
  initial: TenseSetDraft
  saving: boolean
  onSave: (draft: TenseSetDraft) => void
  onCancel?: () => void
}) {
  const [tenses, setTenses] = useState<Set<TenseId>>(() => new Set(initial.tenses))
  const [allowCustomize, setAllowCustomize] = useState(initial.allowCustomize)

  const ordered = TENSE_IDS.filter((t) => tenses.has(t))
  const dirty =
    allowCustomize !== initial.allowCustomize ||
    ordered.length !== initial.tenses.length ||
    ordered.some((t, i) => t !== initial.tenses[i])

  function toggle(tense: TenseId) {
    const next = new Set(tenses)
    if (next.has(tense)) next.delete(tense)
    else next.add(tense)
    setTenses(next)
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        {FRAMES.map(({ frame, label }) => (
          <fieldset key={frame} className="min-w-0 space-y-1">
            <legend className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</legend>
            {TENSE_IDS.filter((t) => TENSE_CONTENT[t].frame === frame).map((tense) => (
              <label key={tense} className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={tenses.has(tense)}
                  onChange={() => toggle(tense)}
                  disabled={saving}
                  className="h-4 w-4 accent-amber-500"
                />
                {TENSE_CONTENT[tense].nameEn}
              </label>
            ))}
          </fieldset>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <button
          type="button"
          onClick={() => setTenses(new Set(TENSE_IDS))}
          disabled={saving}
          className="rounded-lg border border-slate-200 px-2.5 py-1 text-slate-600 hover:bg-slate-50"
        >
          Select all
        </button>
        <button
          type="button"
          onClick={() => setTenses(new Set())}
          disabled={saving}
          className="rounded-lg border border-slate-200 px-2.5 py-1 text-slate-600 hover:bg-slate-50"
        >
          Clear
        </button>
      </div>

      <fieldset className="space-y-2">
        <legend className="mb-1 text-sm font-medium text-slate-700">Can students change which tenses they see?</legend>
        <label className="flex items-start gap-2 text-sm text-slate-700">
          <input
            type="radio"
            checked={allowCustomize}
            onChange={() => setAllowCustomize(true)}
            disabled={saving}
            className="mt-1 accent-amber-500"
          />
          <span>
            <span className="font-medium">Yes, full customization</span>
            <span className="block text-slate-500">
              These tenses are what students see first. They can still show the other tenses, hide boxes and use the filters.
            </span>
          </span>
        </label>
        <label className="flex items-start gap-2 text-sm text-slate-700">
          <input
            type="radio"
            checked={!allowCustomize}
            onChange={() => setAllowCustomize(false)}
            disabled={saving}
            className="mt-1 accent-amber-500"
          />
          <span>
            <span className="font-medium">No, locked</span>
            <span className="block text-slate-500">
              Students see exactly these tenses. The filters, the Boxes menu and the hide buttons are not shown.
            </span>
          </span>
        </label>
      </fieldset>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => onSave({ tenses: ordered, allowCustomize })}
          disabled={saving || !dirty || ordered.length === 0}
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={saving} className="text-sm text-slate-500 hover:text-slate-700">
            Cancel
          </button>
        )}
        {ordered.length === 0 && <span className="text-xs text-red-600">Choose at least one tense.</span>}
      </div>
    </div>
  )
}
