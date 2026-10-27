import { useEffect, useRef, useState } from 'react'
import { ListPlus, Upload, X } from 'lucide-react'
import { hintClass, inputClass, labelClass, secondaryButtonClass } from '../TeacherTools/ui'
import { useCompCopy } from '../../data/compTestCopy'
import { getGrammarItem, getGrammarPointsByLevel } from '../../data/grammarCurriculum'
import { fetchVocabList, fetchVocabLists } from '../../lib/vocabListsApi'
import type { VocabListSummary } from '../../lib/vocab'
import { COMP_GRAMMAR_OTHER_MAX, COMP_LEVELS, COMP_MAX_GRAMMAR, COMP_MAX_VOCAB, splitVocabulary, type CompLevel } from '../../lib/compTests'

export interface FocusValue {
  /** Grammar Coach curriculum ids. */
  grammar: string[]
  grammarOther: string
  /** The vocabulary box as typed: one term per line (or comma-separated). */
  vocabText: string
}

export const EMPTY_FOCUS: FocusValue = { grammar: [], grammarOther: '', vocabText: '' }

/**
 * Optional focus for a new test. Grammar: points from the Grammar Coach curriculum at the test's
 * level (earlier levels below them) and/or one in the teacher's own words. Vocabulary: typed,
 * uploaded (.txt/.csv/.xlsx/.xls, as in the word-list editor) or taken from a Toolkit word list.
 */
export default function FocusFields({ level, value, onChange }: { level: CompLevel; value: FocusValue; onChange: (next: FocusValue) => void }) {
  const { c, lang } = useCompCopy()
  const fileRef = useRef<HTMLInputElement>(null)
  const [lists, setLists] = useState<VocabListSummary[] | null>(null)
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<{ error: boolean; text: string } | null>(null)

  const terms = splitVocabulary(value.vocabText)
  const grammarCount = value.grammar.length + (value.grammarOther.trim() ? 1 : 0)
  const levelIndex = COMP_LEVELS.indexOf(level)
  const title = (id: string) => {
    const item = getGrammarItem(id)?.item
    return item ? (lang === 'hu' ? item.titleHu : item.title) : id
  }

  // A lower level drops the points above it.
  useEffect(() => {
    const kept = value.grammar.filter((id) => {
      const found = getGrammarItem(id)
      return found && COMP_LEVELS.indexOf(found.level) <= levelIndex
    })
    if (kept.length !== value.grammar.length) onChange({ ...value, grammar: kept })
  }, [levelIndex, value, onChange])

  function addTerms(more: string[], source: string) {
    const merged = splitVocabulary([value.vocabText, ...more].join('\n'))
    const added = merged.length - terms.length
    onChange({ ...value, vocabText: merged.join('\n') })
    setNote({ error: false, text: c('vocabAdded', { n: added, source }) })
  }

  async function upload(file: File) {
    setBusy(true)
    setNote(null)
    try {
      const { parseVocabFile } = await import('../../lib/vocabFileImport')
      const rows = await parseVocabFile(file)
      addTerms(
        rows.map((r) => r.term),
        file.name,
      )
    } catch {
      setNote({ error: true, text: c('vocabFileError') })
    } finally {
      setBusy(false)
    }
  }

  async function pickList(id: string) {
    const list = lists?.find((l) => l.id === id)
    if (!list) return
    setBusy(true)
    setNote(null)
    try {
      const detail = await fetchVocabList(id)
      addTerms(
        detail.items.map((i) => i.term),
        list.title,
      )
    } catch {
      setNote({ error: true, text: c('loadError') })
    } finally {
      setBusy(false)
    }
  }

  function loadLists() {
    if (lists) return
    fetchVocabLists()
      .then(setLists)
      .catch(() => setLists([]))
  }

  return (
    <fieldset className="space-y-4 rounded-xl border border-dashed border-border p-4">
      <legend className="px-1 text-sm font-semibold text-foreground">{c('focusTitle')}</legend>
      <p className={hintClass}>{c('focusHint')}</p>

      <div className="space-y-2">
        <span className={labelClass}>{c('grammarFocus')}</span>
        {value.grammar.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {value.grammar.map((id) => (
              <li key={id} className="inline-flex items-center gap-1 rounded-full bg-[var(--teal-accent-soft)] py-1 pl-3 pr-1 text-sm text-[var(--teal-accent-strong)]">
                {title(id)}
                <button type="button" aria-label={c('remove')} onClick={() => onChange({ ...value, grammar: value.grammar.filter((g) => g !== id) })} className="rounded-full p-0.5 hover:bg-white/50">
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <select
          value=""
          disabled={grammarCount >= COMP_MAX_GRAMMAR}
          onChange={(e) => e.target.value && onChange({ ...value, grammar: [...value.grammar, e.target.value] })}
          className={inputClass}
          aria-label={c('grammarPick')}
        >
          <option value="">{grammarCount >= COMP_MAX_GRAMMAR ? c('grammarFull', { n: COMP_MAX_GRAMMAR }) : c('grammarPick')}</option>
          {COMP_LEVELS.slice(0, levelIndex + 1)
            .reverse()
            .map((l) => (
              <optgroup key={l} label={l === level ? c('grammarThisLevel', { level: l }) : c('grammarEarlierLevel', { level: l })}>
                {getGrammarPointsByLevel(l)
                  .filter((p) => !value.grammar.includes(p.id))
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {lang === 'hu' ? p.titleHu : p.title}
                    </option>
                  ))}
              </optgroup>
            ))}
        </select>
        <input
          value={value.grammarOther}
          maxLength={COMP_GRAMMAR_OTHER_MAX}
          disabled={!value.grammarOther && grammarCount >= COMP_MAX_GRAMMAR}
          onChange={(e) => onChange({ ...value, grammarOther: e.target.value })}
          placeholder={c('grammarOtherPlaceholder')}
          aria-label={c('grammarOther')}
          lang="en"
          className={inputClass}
        />
        <p className={hintClass}>{c('grammarHint', { n: COMP_MAX_GRAMMAR })}</p>
      </div>

      <div className="space-y-2">
        <span className={labelClass}>{c('vocabFocus')}</span>
        <textarea
          value={value.vocabText}
          rows={4}
          lang="en"
          onChange={(e) => onChange({ ...value, vocabText: e.target.value })}
          placeholder={c('vocabPlaceholder')}
          aria-label={c('vocabFocus')}
          className={inputClass}
        />
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" disabled={busy} onClick={() => fileRef.current?.click()} className={`${secondaryButtonClass} inline-flex items-center gap-1.5`}>
            <Upload className="h-4 w-4" />
            {c('vocabUpload')}
          </button>
          <span className="inline-flex items-center gap-1.5">
            <ListPlus className="h-4 w-4 text-muted-foreground" />
            <select
              value=""
              disabled={busy}
              onFocus={loadLists}
              onMouseDown={loadLists}
              onChange={(e) => void pickList(e.target.value)}
              aria-label={c('vocabFromList')}
              className="max-w-[16rem] rounded-lg border border-border bg-card px-3 py-1.5 text-sm"
            >
              <option value="">{c('vocabFromList')}</option>
              {lists === null && <option disabled>{c('loading')}</option>}
              {lists?.length === 0 && <option disabled>{c('vocabNoLists')}</option>}
              {lists?.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title} ({l.termCount})
                </option>
              ))}
            </select>
          </span>
          {value.vocabText && (
            <button
              type="button"
              onClick={() => {
                onChange({ ...value, vocabText: '' })
                setNote(null)
              }}
              className="text-sm text-muted-foreground underline-offset-2 hover:underline"
            >
              {c('vocabClear')}
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept=".txt,.csv,.xlsx,.xls,text/plain,text/csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              e.target.value = ''
              if (file) void upload(file)
            }}
          />
        </div>
        <p className={terms.length > COMP_MAX_VOCAB ? 'text-xs text-red-600' : hintClass}>
          {terms.length > COMP_MAX_VOCAB ? c('vocabTooMany', { n: terms.length, max: COMP_MAX_VOCAB }) : c('vocabCount', { n: terms.length, max: COMP_MAX_VOCAB })}
        </p>
        {note && <p className={note.error ? 'text-xs text-red-600' : hintClass}>{note.text}</p>}
      </div>
    </fieldset>
  )
}
