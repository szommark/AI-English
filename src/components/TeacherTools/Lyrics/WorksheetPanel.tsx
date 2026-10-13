import {
  LYRICS_MAX_DISTRACTORS,
  LYRICS_NOTE_MAX_LENGTH,
  LYRICS_WORD_LIST_MAX_LENGTH,
  defaultInstructions,
  type AnswerMode,
  type HintStyle,
  type WorksheetOptions,
} from '../../../lib/lyricsGapFill'
import { useLanguage, type MessageKey } from '../../../lib/i18n'
import { cardClass, inputClass, labelClass } from '../ui'

/** How the worksheet (and class mode) presents the gaps. */
export default function WorksheetPanel({ sheet, onChange }: { sheet: WorksheetOptions; onChange: (next: WorksheetOptions) => void }) {
  const { t } = useLanguage()
  const set = <K extends keyof WorksheetOptions>(key: K, value: WorksheetOptions[K]) => onChange({ ...sheet, [key]: value })

  const check = (key: 'numberGaps' | 'phraseGaps' | 'answerKey' | 'showLink', label: MessageKey) => (
    <label className="flex items-center gap-2 text-sm text-foreground">
      <input type="checkbox" checked={sheet[key]} onChange={(e) => set(key, e.target.checked)} />
      {t(label)}
    </label>
  )

  const note = (key: 'beforeListening' | 'afterListening', label: MessageKey) => (
    <label className="block space-y-1">
      <span className={labelClass}>{t(label)}</span>
      <textarea
        rows={2}
        value={sheet[key]}
        maxLength={LYRICS_NOTE_MAX_LENGTH}
        onChange={(e) => set(key, e.target.value)}
        className={inputClass}
      />
    </label>
  )

  return (
    <section className={cardClass}>
      <h2 className="font-semibold text-foreground">{t('lySheetTitle')}</h2>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1">
          <span className={labelClass}>{t('lyAnswerMode')}</span>
          <select value={sheet.answerMode} onChange={(e) => set('answerMode', e.target.value as AnswerMode)} className={inputClass}>
            {(['write', 'wordBank', 'choice'] as const).map((m) => (
              <option key={m} value={m}>
                {t(`lyMode_${m}` as MessageKey)}
              </option>
            ))}
          </select>
        </label>

        {sheet.answerMode === 'choice' ? (
          <label className="space-y-1">
            <span className={labelClass}>{t('lyChoiceCount')}</span>
            <select value={sheet.choiceCount} onChange={(e) => set('choiceCount', Number(e.target.value))} className={inputClass}>
              {Array.from({ length: LYRICS_MAX_DISTRACTORS }, (_, i) => i + 2).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <label className="space-y-1">
            <span className={labelClass}>{t('lyHint')}</span>
            <select value={sheet.hintStyle} onChange={(e) => set('hintStyle', e.target.value as HintStyle)} className={inputClass}>
              {(['blank', 'letters', 'firstLetter'] as const).map((h) => (
                <option key={h} value={h}>
                  {t(`lyHint_${h}` as MessageKey)}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {sheet.answerMode === 'wordBank' && (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1">
            <span className={labelClass}>{t('lyBankOrder')}</span>
            <select
              value={sheet.bankOrder}
              onChange={(e) => set('bankOrder', e.target.value as WorksheetOptions['bankOrder'])}
              className={inputClass}
            >
              {(['alphabetical', 'shuffled'] as const).map((o) => (
                <option key={o} value={o}>
                  {t(`lyBankOrder_${o}` as MessageKey)}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className={labelClass}>{t('lyBankExtras')}</span>
            <input
              value={sheet.bankExtras}
              maxLength={LYRICS_WORD_LIST_MAX_LENGTH}
              onChange={(e) => set('bankExtras', e.target.value)}
              placeholder={t('lyWordListPlaceholder')}
              className={inputClass}
            />
          </label>
        </div>
      )}

      <div className="space-y-2">
        {check('numberGaps', 'lyNumberGaps')}
        {check('phraseGaps', 'lyPhraseGaps')}
        {check('answerKey', 'lyAnswerKey')}
        {check('showLink', 'lyShowLink')}
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" checked={sheet.fontSize === 'large'} onChange={(e) => set('fontSize', e.target.checked ? 'large' : 'normal')} />
          {t('lyLargePrint')}
        </label>
      </div>

      <label className="block space-y-1">
        <span className={labelClass}>{t('lyInstructions')}</span>
        <input
          value={sheet.instructions}
          maxLength={LYRICS_NOTE_MAX_LENGTH}
          onChange={(e) => set('instructions', e.target.value)}
          placeholder={defaultInstructions(sheet.answerMode)}
          className={inputClass}
        />
      </label>
      {note('beforeListening', 'lyBefore')}
      {note('afterListening', 'lyAfter')}
    </section>
  )
}
