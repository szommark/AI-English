import { useState, type FormEvent } from 'react'
import { useLanguage } from '../../lib/i18n'
import { ADD_WORDS_MAX, COMPILES_PER_DAY, COMPILE_MAX_WORDS, COMPILE_MIN_WORDS, TERM_MAX_LENGTH } from '../../lib/vocab'

const DEFAULT_BANK_COUNT = 5

const fieldClass =
  'rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-[var(--teal-accent)] focus:outline-none'
const actionButton =
  'rounded-lg border border-border bg-card px-4 py-2 text-sm text-foreground hover:bg-secondary disabled:opacity-40'

/** Typed input split into terms: commas, semicolons and new lines separate them. */
export function splitTerms(text: string): string[] {
  return text
    .split(/[,;\n]+/)
    .map((t) => t.trim().replace(/\s+/g, ' '))
    .filter(Boolean)
}

/**
 * Adding words to a custom list (design §7.2): type your own (several at once), or have
 * more picked for the list's topic and level from the word bank. Nothing is replaced.
 */
export default function AddWordsPanel({
  busy,
  compilesLeft,
  onAddTyped,
  onAddFromBank,
}: {
  /** The key of the list action in progress, if any. */
  busy: string | null
  compilesLeft: number
  /** Resolves true once the words are saved, so the box can be cleared. */
  onAddTyped: (terms: string[]) => Promise<boolean>
  onAddFromBank: (count: number) => void
}) {
  const { t } = useLanguage()
  const [text, setText] = useState('')
  const [count, setCount] = useState(DEFAULT_BANK_COUNT)
  const terms = splitTerms(text)
  const tooMany = terms.length > ADD_WORDS_MAX
  const tooLong = terms.some((term) => term.length > TERM_MAX_LENGTH)

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (terms.length === 0 || tooMany || tooLong) return
    if (await onAddTyped(terms)) setText('')
  }

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-4 sm:p-5">
      <form onSubmit={submit} className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">{t('vcAddTypedTitle')}</h3>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder={t('vcAddWordsPlaceholder')}
          aria-label={t('vcAddWordsPlaceholder')}
          className={`${fieldClass} w-full resize-y`}
          autoFocus
        />
        {tooMany && <p className="text-xs text-red-600">{t('vcTooManyWords', { n: ADD_WORDS_MAX })}</p>}
        <button type="submit" disabled={terms.length === 0 || tooMany || tooLong || busy !== null} className={actionButton}>
          {busy === 'add-words' ? t('vcSaving') : terms.length > 1 ? `${t('vcAddWord')} (${terms.length})` : t('vcAddWord')}
        </button>
      </form>

      <div className="space-y-2 border-t border-border pt-4">
        <h3 className="text-sm font-semibold text-foreground">{t('vcAddFromBankTitle')}</h3>
        <p className="text-xs text-muted-foreground">{t('vcAddFromBankHint', { n: compilesLeft, max: COMPILES_PER_DAY })}</p>
        <div className="flex flex-wrap items-center gap-2">
          <select value={count} onChange={(e) => setCount(Number(e.target.value))} aria-label={t('vcCompileCount')} className={fieldClass}>
            {Array.from({ length: COMPILE_MAX_WORDS - COMPILE_MIN_WORDS + 1 }, (_, i) => COMPILE_MIN_WORDS + i).map((n) => (
              <option key={n} value={n}>
                {t('vcWordCount', { n })}
              </option>
            ))}
          </select>
          <button type="button" onClick={() => onAddFromBank(count)} disabled={compilesLeft === 0 || busy !== null} className={actionButton}>
            {busy === 'add-bank' ? t('vcCompiling') : t('vcAddFromBankButton', { n: count })}
          </button>
        </div>
      </div>
    </div>
  )
}
