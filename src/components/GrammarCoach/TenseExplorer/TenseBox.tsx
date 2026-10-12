import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, ChevronDown, Dices, EyeOff, Info, Pin, PinOff } from 'lucide-react'
import { useLanguage, type MessageKey } from '../../../lib/i18n'
import { parsePhrase, verbWarnings, type Subject, type TenseId } from '../../../lib/tenseEngine/index.ts'
import { TENSE_CONTENT } from '../../../data/tenseExplorerContent.ts'
import TenseTimeline from '../TenseTimeline'
import SentenceList from './SentenceList'
import type { ExplainLang } from './explorerSettings'

const PARSE_ERROR_MESSAGE: Record<string, MessageKey> = {
  'not-english': 'tenseNotEnglish',
  'too-long': 'tenseTooLong',
}

/** One tense card: its own verb input, three sentences, warnings, explanation and timeline. */
export default function TenseBox({
  tense,
  input,
  onInputChange,
  onRandom,
  subject,
  timeCue,
  explainLang,
  label,
  onHide,
  canHide,
  pinned,
  pinDisabled,
  onTogglePin,
  speak,
}: {
  tense: TenseId
  input: string
  onInputChange: (value: string) => void
  onRandom: () => void
  subject: Subject
  timeCue: boolean
  explainLang: ExplainLang
  label: (key: MessageKey) => string
  onHide: () => void
  canHide: boolean
  pinned: boolean
  pinDisabled: boolean
  onTogglePin: () => void
  speak?: (text: string) => void
}) {
  const { t } = useLanguage()
  const [showUses, setShowUses] = useState(false)
  const usesId = useId()
  const errorId = useId()
  const content = TENSE_CONTENT[tense]
  const hu = explainLang === 'hu'

  const parsed = input.trim() ? parsePhrase(input) : null
  const phrase = parsed && !('error' in parsed) ? parsed : null
  const errorKey = parsed && 'error' in parsed ? PARSE_ERROR_MESSAGE[parsed.error] : undefined
  const warnings = phrase ? verbWarnings(tense, phrase.verb) : []
  const uses = hu ? content.usesHu : content.usesEn
  const pitfall = hu ? content.pitfallHu : content.pitfallEn

  return (
    <article className="min-w-0 space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" aria-label={content.nameEn}>
      <header className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-slate-800">{content.nameEn}</h3>
          {hu && <p className="text-xs text-slate-500">{content.nameHu}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <span
            className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-200"
            title={t('tenseSubject')}
          >
            {subject}
          </span>
          <button
            type="button"
            onClick={onTogglePin}
            disabled={pinDisabled}
            aria-pressed={pinned}
            aria-label={`${t('tenseCompare')}: ${content.nameEn}`}
            title={t('tenseCompare')}
            className={`rounded-md p-1.5 transition disabled:cursor-not-allowed disabled:opacity-40 ${
              pinned ? 'bg-amber-100 text-amber-700' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
            }`}
          >
            {pinned ? <PinOff size={15} /> : <Pin size={15} />}
          </button>
          <button
            type="button"
            onClick={onHide}
            disabled={!canHide}
            aria-label={`${t('tenseHideBox')}: ${content.nameEn}`}
            title={t('tenseHideBox')}
            className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <EyeOff size={15} />
          </button>
        </div>
      </header>

      <div>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder={t('tenseVerbPlaceholder')}
            aria-label={`${content.nameEn}: ${t('tenseVerbPlaceholder')}`}
            aria-invalid={Boolean(errorKey)}
            aria-describedby={errorKey ? errorId : undefined}
            autoComplete="off"
            spellCheck={false}
            className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
          />
          <button
            type="button"
            onClick={onRandom}
            aria-label={`${t('tenseRandom')}: ${content.nameEn}`}
            title={t('tenseRandom')}
            className="shrink-0 rounded-lg border border-slate-200 px-2 text-slate-500 transition hover:bg-amber-50 hover:text-amber-600"
          >
            <Dices size={16} />
          </button>
        </div>
        {errorKey && (
          <p id={errorId} className="mt-1 text-xs text-rose-600">
            {t(errorKey)}
          </p>
        )}
      </div>

      {phrase ? (
        <SentenceList
          tense={tense}
          phrase={phrase}
          subject={subject}
          timeCue={timeCue}
          label={label}
          listenLabel={t('listen')}
          speak={speak}
        />
      ) : (
        !errorKey && <p className="text-sm italic text-slate-400">{t('tenseEmptyBox')}</p>
      )}

      {warnings.map((w) => (
        <p key={w} className="flex gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <Info size={14} className="mt-0.5 shrink-0" />
          <span>{label(w === 'stative-continuous' ? 'tenseStativeWarn' : 'tenseBeContinuousNote')}</span>
        </p>
      ))}

      <div>
        <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">{label('tenseTimeline')}</p>
        <TenseTimeline frame={content.frame} aspect={content.aspect} lang={explainLang} />
      </div>

      <div className="border-t border-slate-100 pt-2">
        <button
          type="button"
          onClick={() => setShowUses((v) => !v)}
          aria-expanded={showUses}
          aria-controls={usesId}
          className="flex w-full items-center justify-between rounded-md py-1 text-left text-sm font-medium text-slate-700 hover:text-amber-700"
        >
          {label('tenseWhenUsed')}
          <ChevronDown size={16} className={`shrink-0 transition-transform ${showUses ? 'rotate-180' : ''}`} />
        </button>
        {showUses && (
          <div id={usesId} className="mt-2 space-y-3 text-sm text-slate-700">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label('tenseFormula')}</p>
              <p className="font-mono text-xs text-slate-700">{content.formulaEn}</p>
            </div>
            <ul className="list-disc space-y-0.5 pl-5">
              {uses.map((use) => (
                <li key={use}>{use}</li>
              ))}
            </ul>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label('tenseCues')}</p>
              <p className="text-xs text-slate-600">{content.cuesEn.join(', ')}</p>
            </div>
            {pitfall && (
              <div className="rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-700">{label('tenseHuPitfall')}</p>
                <p className="text-xs text-slate-700">{pitfall}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {content.lessonId && (
        <Link
          to={`/grammar-coach?lesson=${content.lessonId}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 hover:text-amber-800 hover:underline"
        >
          <BookOpen size={14} />
          {t('tenseOpenLesson')}
        </Link>
      )}
    </article>
  )
}
