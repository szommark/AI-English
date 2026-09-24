import { useRef, useState, type FormEvent } from 'react'
import { useLanguage } from '../../lib/i18n'
import { parsePastedTerms, type ImportedRow } from '../../lib/vocabImport'
import type { AddOutcome } from '../../lib/vocabDraft'
import { LIST_MAX_ITEMS } from '../../lib/vocab'

type Mode = 'word' | 'paste' | 'upload'

export type AddWordError = 'empty' | 'duplicate' | 'full'

export const inputClass =
  'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-[var(--teal-accent)] focus:outline-none'

/**
 * The three ways to add terms (design §5.1) — all feed the one preview table through
 * `onImport`. "Add word" is the default and reports its own inline errors.
 */
export default function AddTermsPanel({
  onAddWord,
  onImport,
}: {
  onAddWord: (row: ImportedRow) => AddWordError | null
  onImport: (rows: ImportedRow[]) => Pick<AddOutcome, 'added' | 'duplicates' | 'overLimit'>
}) {
  const { t } = useLanguage()
  const [mode, setMode] = useState<Mode>('word')
  const [notice, setNotice] = useState<string | null>(null)

  function report(outcome: Pick<AddOutcome, 'added' | 'duplicates' | 'overLimit'>) {
    if (outcome.added === 0 && outcome.duplicates === 0 && outcome.overLimit === 0) {
      setNotice(t('vlImportNone'))
      return
    }
    const parts = [t('vlImportAdded', { n: outcome.added })]
    if (outcome.duplicates > 0) parts.push(t('vlImportDuplicates', { n: outcome.duplicates }))
    if (outcome.overLimit > 0) parts.push(t('vlImportOverLimit', { n: outcome.overLimit }))
    setNotice(parts.join(' · '))
  }

  const modes: [Mode, string][] = [
    ['word', t('vlModeWord')],
    ['paste', t('vlModePaste')],
    ['upload', t('vlModeUpload')],
  ]

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
      <h2 className="font-medium text-foreground">{t('vlAddTerms')}</h2>

      <div role="group" aria-label={t('vlAddTerms')} className="flex flex-wrap gap-1 rounded-lg bg-secondary p-0.5 sm:inline-flex">
        {modes.map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={mode === value}
            onClick={() => {
              setMode(value)
              setNotice(null)
            }}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm sm:flex-none ${
              mode === value ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === 'word' && <AddWordForm onAddWord={onAddWord} />}
      {mode === 'paste' && <PasteForm onImport={(rows) => report(onImport(rows))} />}
      {mode === 'upload' && (
        <UploadForm onImport={(rows) => report(onImport(rows))} onError={() => setNotice(t('vlUploadFailed'))} />
      )}

      {notice && mode !== 'word' && <p className="text-sm text-muted-foreground">{notice}</p>}
    </div>
  )
}

function AddWordForm({ onAddWord }: { onAddWord: (row: ImportedRow) => AddWordError | null }) {
  const { t } = useLanguage()
  const [term, setTerm] = useState('')
  const [meaning, setMeaning] = useState('')
  const [example, setExample] = useState('')
  const [error, setError] = useState<AddWordError | null>(null)
  const termRef = useRef<HTMLInputElement>(null)

  function submit(e: FormEvent) {
    e.preventDefault()
    const result = term.trim() ? onAddWord({ term, meaningHu: meaning, exampleEn: example }) : 'empty'
    setError(result)
    if (result === null) {
      setTerm('')
      setMeaning('')
      setExample('')
    }
    termRef.current?.focus()
  }

  const errorText =
    error === 'empty' ? t('vlErrEmptyTerm') : error === 'duplicate' ? t('vlErrDuplicate') : error === 'full' ? t('vlErrFull', { max: LIST_MAX_ITEMS }) : null

  return (
    <form onSubmit={submit} className="space-y-2" noValidate>
      <div className="grid gap-2 sm:grid-cols-[1fr_1fr_1.5fr_auto]">
        <input
          ref={termRef}
          value={term}
          onChange={(e) => {
            setTerm(e.target.value)
            if (error) setError(null)
          }}
          placeholder={t('vlTerm')}
          aria-label={t('vlTerm')}
          aria-invalid={error !== null}
          className={`${inputClass} ${error ? 'border-red-400' : ''}`}
        />
        <input
          value={meaning}
          onChange={(e) => setMeaning(e.target.value)}
          placeholder={t('vlMeaningOptional')}
          aria-label={t('vlMeaningOptional')}
          className={inputClass}
        />
        <input
          value={example}
          onChange={(e) => setExample(e.target.value)}
          placeholder={t('vlExampleOptional')}
          aria-label={t('vlExampleOptional')}
          className={inputClass}
        />
        <button
          type="submit"
          className="rounded-lg bg-[var(--teal-accent)] px-4 py-2 text-sm font-semibold text-primary hover:bg-[var(--teal-accent-strong)]"
        >
          {t('vlAdd')}
        </button>
      </div>
      {errorText && (
        <p className="text-sm text-red-600" role="alert">
          {errorText}
        </p>
      )}
    </form>
  )
}

function PasteForm({ onImport }: { onImport: (rows: ImportedRow[]) => void }) {
  const { t } = useLanguage()
  const [text, setText] = useState('')

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">{t('vlPasteHint')}</p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        placeholder={t('vlPastePlaceholder')}
        aria-label={t('vlModePaste')}
        className={`${inputClass} font-mono`}
      />
      <button
        type="button"
        disabled={!text.trim()}
        onClick={() => {
          onImport(parsePastedTerms(text))
          setText('')
        }}
        className="rounded-lg bg-[var(--teal-accent)] px-4 py-2 text-sm font-semibold text-primary hover:bg-[var(--teal-accent-strong)] disabled:opacity-40"
      >
        {t('vlPasteAdd')}
      </button>
    </div>
  )
}

function UploadForm({ onImport, onError }: { onImport: (rows: ImportedRow[]) => void; onError: () => void }) {
  const { t } = useLanguage()
  const [reading, setReading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File | undefined) {
    if (!file) return
    setReading(true)
    try {
      // Loaded on demand so the parsers (and the XLSX library) stay out of the main bundle.
      const { parseVocabFile } = await import('../../lib/vocabFileImport')
      onImport(await parseVocabFile(file))
    } catch (err) {
      console.error('Failed to read word list file', err)
      onError()
    } finally {
      setReading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">{t('vlUploadHint')}</p>
      <label className="inline-flex cursor-pointer items-center rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-secondary">
        {reading ? t('vlUploadReading') : t('vlUploadChoose')}
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          disabled={reading}
          onChange={(e) => handleFile(e.target.files?.[0])}
          className="sr-only"
        />
      </label>
    </div>
  )
}
