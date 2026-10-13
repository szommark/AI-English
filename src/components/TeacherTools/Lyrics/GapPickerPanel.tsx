import { useState } from 'react'
import { Shuffle, WandSparkles } from 'lucide-react'
import {
  GAP_TARGETS,
  LEVEL_PRESETS,
  LYRICS_GOAL_MAX_LENGTH,
  LYRICS_MAX_GAPS,
  LYRICS_SUGGESTIONS_PER_DAY,
  LYRICS_WORD_LIST_MAX_LENGTH,
  type AutoPickOptions,
  type GapTarget,
  type LyricsGapSuggestion,
  type RepeatRule,
} from '../../../lib/lyricsGapFill'
import { useLanguage, type MessageKey } from '../../../lib/i18n'
import { TeacherToolsError, suggestLyricsGaps } from '../../../lib/teacherToolsApi'
import { GRAMMAR_LEVELS } from '../../../data/grammarCurriculum'
import { cardClass, hintClass, inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from '../ui'

const chipClass = (on: boolean) =>
  `rounded-full border px-3 py-1 text-xs font-medium ${
    on
      ? 'border-[var(--teal-accent-border)] bg-[var(--teal-accent-soft)] text-[var(--teal-accent-strong)]'
      : 'border-border bg-card text-muted-foreground hover:bg-secondary'
  }`

/** Rule-based gap picking plus the AI suggestion box. */
export default function GapPickerPanel({
  auto,
  onChange,
  onPick,
  onShuffle,
  onClear,
  pickMessage,
  lyrics,
  targetCount,
  onSuggested,
}: {
  auto: AutoPickOptions
  onChange: (next: AutoPickOptions) => void
  onPick: () => void
  onShuffle: () => void
  onClear: () => void
  pickMessage: string | null
  lyrics: string
  /** How many gaps the AI is asked for: the amount setting, resolved against the song. */
  targetCount: number
  onSuggested: (gaps: LyricsGapSuggestion[]) => void
}) {
  const { t } = useLanguage()
  const set = <K extends keyof AutoPickOptions>(key: K, value: AutoPickOptions[K]) => onChange({ ...auto, [key]: value })

  const toggleTarget = (target: GapTarget) =>
    set('targets', auto.targets.includes(target) ? auto.targets.filter((x) => x !== target) : [...auto.targets, target])

  const [goal, setGoal] = useState('')
  const [level, setLevel] = useState('')
  const [aiBusy, setAiBusy] = useState(false)
  const [aiMessage, setAiMessage] = useState<{ text: string; error: boolean } | null>(null)

  async function handleSuggest() {
    if (!lyrics.trim()) {
      setAiMessage({ text: t('lyAiNeedsLyrics'), error: true })
      return
    }
    setAiBusy(true)
    setAiMessage(null)
    try {
      const result = await suggestLyricsGaps({ lyrics, goal, count: Math.max(1, targetCount), level: level || null })
      if (result.gaps.length === 0) {
        setAiMessage({ text: t('lyAiEmpty'), error: true })
      } else {
        onSuggested(result.gaps)
        setAiMessage({ text: t('lyAiDone', { n: result.gaps.length, left: result.remaining }), error: false })
      }
    } catch (err) {
      const limit = err instanceof TeacherToolsError && err.status === 429
      setAiMessage({ text: t(limit ? 'lyAiLimit' : 'lyAiError'), error: true })
    } finally {
      setAiBusy(false)
    }
  }

  const number = (value: number, min: number, max: number, onValue: (n: number) => void) => (
    <input
      type="number"
      min={min}
      max={max}
      value={value}
      onChange={(e) => {
        const n = Number(e.target.value)
        if (Number.isFinite(n)) onValue(Math.min(max, Math.max(min, Math.round(n))))
      }}
      className={`${inputClass} w-20`}
    />
  )

  return (
    <section className={cardClass}>
      <h2 className="font-semibold text-foreground">{t('lyPickTitle')}</h2>

      <div className="space-y-2">
        <span className={labelClass}>{t('lyTargets')}</span>
        <div className="flex flex-wrap gap-2">
          {GAP_TARGETS.map((target) => (
            <button
              key={target}
              type="button"
              aria-pressed={auto.targets.includes(target)}
              onClick={() => toggleTarget(target)}
              className={chipClass(auto.targets.includes(target))}
            >
              {t(`lyTarget_${target}` as MessageKey)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1">
          <span className={labelClass}>{t('lyMustGap')}</span>
          <input
            value={auto.mustGap}
            maxLength={LYRICS_WORD_LIST_MAX_LENGTH}
            onChange={(e) => set('mustGap', e.target.value)}
            placeholder={t('lyWordListPlaceholder')}
            className={inputClass}
          />
        </label>
        <label className="space-y-1">
          <span className={labelClass}>{t('lyNeverGap')}</span>
          <input
            value={auto.neverGap}
            maxLength={LYRICS_WORD_LIST_MAX_LENGTH}
            onChange={(e) => set('neverGap', e.target.value)}
            placeholder={t('lyWordListPlaceholder')}
            className={inputClass}
          />
        </label>
      </div>

      <div className="space-y-2">
        <span className={labelClass}>{t('lyAmount')}</span>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={auto.amountMode}
            onChange={(e) => set('amountMode', e.target.value as AutoPickOptions['amountMode'])}
            className={`${inputClass} w-auto`}
          >
            <option value="count">{t('lyAmountCount')}</option>
            <option value="percent">{t('lyAmountPercent')}</option>
          </select>
          {number(auto.amount, 1, auto.amountMode === 'percent' ? 100 : LYRICS_MAX_GAPS, (n) => set('amount', n))}
        </div>
        <div className="flex flex-wrap gap-2">
          {LEVEL_PRESETS.map((p) => {
            const on = auto.amountMode === 'percent' && auto.amount === p.percent
            return (
              <button
                key={p.id}
                type="button"
                aria-pressed={on}
                onClick={() => onChange({ ...auto, amountMode: 'percent', amount: p.percent })}
                className={chipClass(on)}
              >
                {t(`lyLevel_${p.id}` as MessageKey)}
              </button>
            )
          })}
        </div>
        <label className="flex items-start gap-2 text-sm text-foreground">
          <input type="checkbox" className="mt-0.5" checked={auto.exact} onChange={(e) => set('exact', e.target.checked)} />
          <span>
            {t('lyExact')}
            <span className={`block ${hintClass}`}>{t('lyExactHint')}</span>
          </span>
        </label>
      </div>

      <details className="rounded-lg border border-border px-3 py-2">
        <summary className="cursor-pointer text-sm font-medium text-foreground">{t('lyRules')}</summary>
        <div className="mt-3 space-y-3">
          <label className="flex items-center justify-between gap-3 text-sm text-foreground">
            {t('lySkipLines')}
            {number(auto.skipLines, 0, 20, (n) => set('skipLines', n))}
          </label>
          <label className="flex items-center justify-between gap-3 text-sm text-foreground">
            {t('lyMinDistance')}
            {number(auto.minDistance, 0, 20, (n) => set('minDistance', n))}
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={auto.onePerLine} onChange={(e) => set('onePerLine', e.target.checked)} />
            {t('lyOnePerLine')}
          </label>
          <label className="flex flex-wrap items-center justify-between gap-3 text-sm text-foreground">
            {t('lyRepeats')}
            <select
              value={auto.repeats}
              onChange={(e) => set('repeats', e.target.value as RepeatRule)}
              className={`${inputClass} w-auto`}
            >
              {(['first', 'all', 'none'] as const).map((r) => (
                <option key={r} value={r}>
                  {t(`lyRepeats_${r}` as MessageKey)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </details>

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={onPick} className={primaryButtonClass}>
          {t('lyPick')}
        </button>
        <button type="button" onClick={onShuffle} className={`${secondaryButtonClass} inline-flex items-center gap-1.5`}>
          <Shuffle className="h-4 w-4" />
          {t('lyShuffle')}
        </button>
        <button type="button" onClick={onClear} className={secondaryButtonClass}>
          {t('lyClear')}
        </button>
      </div>
      {pickMessage && <p className="text-sm text-amber-700">{pickMessage}</p>}

      <div className="space-y-2 border-t border-border pt-4">
        <h3 className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
          <WandSparkles className="h-4 w-4 text-[var(--teal-accent-strong)]" />
          {t('lyAiTitle')}
        </h3>
        <div className="flex flex-wrap gap-2">
          <label className="min-w-[12rem] flex-1 space-y-1">
            <span className={labelClass}>{t('lyAiGoal')}</span>
            <input
              value={goal}
              maxLength={LYRICS_GOAL_MAX_LENGTH}
              onChange={(e) => setGoal(e.target.value)}
              placeholder={t('lyAiGoalPlaceholder')}
              className={inputClass}
            />
          </label>
          <label className="space-y-1">
            <span className={labelClass}>{t('lyAiLevel')}</span>
            <select value={level} onChange={(e) => setLevel(e.target.value)} className={`${inputClass} w-auto`}>
              <option value="">{t('lyAiAnyLevel')}</option>
              {GRAMMAR_LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button type="button" onClick={handleSuggest} disabled={aiBusy} className={secondaryButtonClass}>
          {aiBusy ? t('lyAiWorking') : t('lyAiButton')}
        </button>
        <p className={hintClass}>{t('lyAiNote', { n: LYRICS_SUGGESTIONS_PER_DAY })}</p>
        {aiMessage && <p className={`text-sm ${aiMessage.error ? 'text-red-600' : 'text-emerald-700'}`}>{aiMessage.text}</p>}
      </div>
    </section>
  )
}
