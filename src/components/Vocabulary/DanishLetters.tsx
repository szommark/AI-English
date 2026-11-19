import { useLanguage } from '../../lib/i18n'
import { DA_LETTER_FALLBACKS } from '../../lib/vocabPractice'

/** The letters a Hungarian keyboard lacks, as on-screen buttons (DA_LETTER_FALLBACKS). */
export const DA_EXTRA_LETTERS = Object.keys(DA_LETTER_FALLBACKS)

/**
 * Small æ ø å buttons for Danish answers. They keep the focus where it is (pointer down is
 * cancelled), so a tap types into the field or crossword square being edited.
 */
export function DanishLetterButtons({
  onLetter,
  upperCase = false,
  showHint = false,
  disabled = false,
}: {
  onLetter: (letter: string) => void
  upperCase?: boolean
  /** Also say that ae/oe/aa are accepted (typed answers; not the crossword). */
  showHint?: boolean
  disabled?: boolean
}) {
  const { t } = useLanguage()
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <div role="group" aria-label={t('vcDaLetters')} className="inline-flex gap-1">
        {DA_EXTRA_LETTERS.map((ch) => {
          const letter = upperCase ? ch.toUpperCase() : ch
          return (
            <button
              key={ch}
              type="button"
              disabled={disabled}
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => onLetter(letter)}
              aria-label={t('vcDaInsertLetter', { letter })}
              title={t('vcDaInsertLetter', { letter })}
              className="h-8 min-w-[2rem] rounded-md border border-border bg-card px-2 text-sm font-semibold text-foreground hover:bg-secondary disabled:opacity-40"
            >
              {letter}
            </button>
          )
        })}
      </div>
      {showHint && <span className="text-xs text-muted-foreground">{t('vcDaLettersHint')}</span>}
    </div>
  )
}

/**
 * The value of a text field after typing `letter` at its caret (replacing any selection), and
 * where the caret goes next. Without a field, the letter goes at the end.
 */
export function insertAtCaret(
  field: HTMLInputElement | HTMLTextAreaElement | null,
  value: string,
  letter: string,
): { value: string; caret: number } {
  const start = field?.selectionStart ?? value.length
  const end = field?.selectionEnd ?? start
  return { value: value.slice(0, start) + letter + value.slice(end), caret: start + letter.length }
}
