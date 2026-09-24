import { useLanguage } from '../../lib/i18n'
import { LIST_MAX_ITEMS, normalizeTerm } from '../../lib/vocab'
import { duplicateTerms, isMissingMeaning, type DraftRow } from '../../lib/vocabDraft'
import { GRAMMAR_LEVELS, type CefrLevel } from '../../data/grammarCurriculum'
import { inputClass } from './AddTermsPanel'

const cellInput = inputClass.replace('px-3 py-2', 'px-2 py-1.5')
/** Wide screens: one grid row per term. Phones: each term becomes a stacked card. */
const rowGrid = 'grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,1.6fr)_5.5rem_2rem] sm:items-start'

/**
 * The editable preview (design §5.1): term, Hungarian meaning, example and level, with a
 * per-row fill-in state and a "Needs a meaning" highlight that blocks saving.
 */
export default function PreviewTable({
  rows,
  onChange,
  onTermCommit,
  onRemove,
}: {
  rows: DraftRow[]
  onChange: (key: number, patch: Partial<DraftRow>) => void
  onTermCommit: (key: number) => void
  onRemove: (key: number) => void
}) {
  const { t } = useLanguage()
  const duplicates = duplicateTerms(rows)

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-medium text-foreground">{t('vlWords')}</h2>
        <span className={`text-sm ${rows.length > LIST_MAX_ITEMS ? 'text-red-600' : 'text-muted-foreground'}`}>
          {t('vlCount', { n: rows.length, max: LIST_MAX_ITEMS })}
        </span>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('vlEmptyPreview')}</p>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">{t('vlPreviewHint')}</p>
          <div className={`${rowGrid} hidden px-1 text-xs font-medium text-muted-foreground sm:grid`}>
            <span>{t('vlTerm')}</span>
            <span>{t('vlMeaning')}</span>
            <span>{t('vlExample')}</span>
            <span>{t('vlLevel')}</span>
            <span />
          </div>
          <ul className="space-y-2">
            {rows.map((row) => {
              const busy = row.enrich === 'pending' || row.enrich === 'loading'
              const missing = isMissingMeaning(row)
              const duplicate = duplicates.has(normalizeTerm(row.term))
              const emptyTerm = !normalizeTerm(row.term)
              return (
                <li
                  key={row.key}
                  className={`${rowGrid} rounded-xl border p-2 sm:rounded-lg sm:border-transparent sm:p-1 ${
                    missing || duplicate || emptyTerm
                      ? 'border-amber-300 bg-amber-50/60 sm:border-amber-300'
                      : 'border-border'
                  }`}
                >
                  <div className="space-y-1">
                    <input
                      value={row.term}
                      onChange={(e) => onChange(row.key, { term: e.target.value })}
                      onBlur={() => onTermCommit(row.key)}
                      aria-label={t('vlTerm')}
                      placeholder={t('vlTerm')}
                      className={`${cellInput} font-medium ${duplicate || emptyTerm ? 'border-amber-400' : ''}`}
                    />
                    {duplicate && <p className="text-xs text-amber-700">{t('vlRowDuplicate')}</p>}
                  </div>
                  <div className="space-y-1">
                    <input
                      value={row.meaningHu}
                      onChange={(e) => onChange(row.key, { meaningHu: e.target.value })}
                      aria-label={t('vlMeaning')}
                      placeholder={busy ? t('vlFilling') : t('vlMeaning')}
                      className={`${cellInput} ${missing ? 'border-amber-400 bg-card' : ''}`}
                    />
                    {busy && (
                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground" aria-live="polite">
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-[var(--teal-accent)] border-t-transparent" />
                        {t('vlFilling')}
                      </p>
                    )}
                    {missing && <p className="text-xs font-medium text-amber-700">{t('vlNeedsMeaning')}</p>}
                  </div>
                  <input
                    value={row.exampleEn}
                    onChange={(e) => onChange(row.key, { exampleEn: e.target.value })}
                    aria-label={t('vlExample')}
                    placeholder={busy ? t('vlFilling') : t('vlExample')}
                    className={cellInput}
                  />
                  <div className="flex items-start gap-2 sm:contents">
                    <select
                      value={row.cefrLevel}
                      onChange={(e) => onChange(row.key, { cefrLevel: e.target.value as CefrLevel | '' })}
                      aria-label={t('vlLevel')}
                      className={`${cellInput} w-24 sm:w-full`}
                    >
                      <option value="">—</option>
                      {GRAMMAR_LEVELS.map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => onRemove(row.key)}
                      aria-label={`${t('vlRemove')}: ${row.term}`}
                      title={t('vlRemove')}
                      className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-red-600 sm:ml-0"
                    >
                      ✕
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </div>
  )
}
