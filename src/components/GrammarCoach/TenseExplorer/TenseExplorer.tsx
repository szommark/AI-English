// Grammar Coach "Tense explorer": put a verb or phrase into any of the 13 tense boxes and see
// positive / question / negative sentences, when the tense is used and a timeline.
// Static and offline: no network calls, no XP, no Supabase.
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Dices, Shuffle } from 'lucide-react'
import { messageIn, useLanguage, type MessageKey } from '../../../lib/i18n'
import { getAccentPreference, type AccentPreference } from '../../../lib/voiceSelection'
import { useSpeechSynthesis } from '../../../hooks/useSpeechSynthesis'
import {
  SUBJECTS,
  TENSE_IDS,
  assignSubjects,
  parsePhrase,
  randomPhrase,
  type Subject,
  type TenseId,
} from '../../../lib/tenseEngine/index.ts'
import { TENSE_CONTENT, type TenseContent } from '../../../data/tenseExplorerContent.ts'
import TenseBox from './TenseBox'
import BoxesPopover from './BoxesPopover'
import ComparePanel from './ComparePanel'
import {
  PRESETS,
  loadSettings,
  saveSettings,
  type ExplainLang,
  type SubjectMode,
} from './explorerSettings'

const MAX_PINNED = 2
const FRAMES: { frame: TenseContent['frame']; label: MessageKey }[] = [
  { frame: 'present', label: 'tensePresetPresent' },
  { frame: 'past', label: 'tensePresetPast' },
  { frame: 'future', label: 'tensePresetFuture' },
]

const emptyBoxes = () => Object.fromEntries(TENSE_IDS.map((t) => [t, { input: '' }])) as Record<TenseId, { input: string }>
const sameSet = (set: Set<TenseId>, list: TenseId[]) => set.size === list.length && list.every((t) => set.has(t))
const phraseText = (input: string) => {
  const parsed = parsePhrase(input)
  return 'error' in parsed ? null : [parsed.verb, parsed.rest].filter(Boolean).join(' ')
}

function readAccent(): AccentPreference {
  try {
    return getAccentPreference()
  } catch {
    return 'gb'
  }
}

export default function TenseExplorer() {
  const { lang, t } = useLanguage()
  const [stored] = useState(loadSettings)
  const [boxes, setBoxes] = useState(emptyBoxes)
  const [visible, setVisible] = useState<Set<TenseId>>(() => new Set(stored.visible ?? TENSE_IDS))
  const [subjectMode, setSubjectMode] = useState<SubjectMode>(stored.subjectMode ?? 'vary')
  const [subjectSeed, setSubjectSeed] = useState(0)
  const [timeCue, setTimeCue] = useState(stored.timeCue ?? false)
  const [explainLang, setExplainLang] = useState<ExplainLang>(stored.explainLang ?? (lang === 'hu' ? 'hu' : 'en'))
  const [pinned, setPinned] = useState<TenseId[]>([])
  const [topInput, setTopInput] = useState('')
  const [topError, setTopError] = useState<MessageKey | null>(null)
  const lastRandomRef = useRef<string | undefined>(undefined)
  const [accent] = useState(readAccent)
  const synth = useSpeechSynthesis('female', accent)
  const speak = synth.supported ? synth.speak : undefined

  useEffect(() => {
    saveSettings({ visible: TENSE_IDS.filter((t) => visible.has(t)), subjectMode, timeCue, explainLang })
  }, [visible, subjectMode, timeCue, explainLang])

  const rotation = useMemo(() => assignSubjects(subjectSeed), [subjectSeed])
  const ownSubject = (tense: TenseId): Subject => (subjectMode === 'vary' ? rotation[tense] : subjectMode)
  // In Compare both pinned boxes use the first pinned box's subject.
  const subjectFor = (tense: TenseId): Subject =>
    pinned.length === MAX_PINNED && tense === pinned[1] ? ownSubject(pinned[0]) : ownSubject(tense)

  // Explanation labels follow the explanation language; English explanations keep German chrome in German.
  const label = useCallback(
    (key: MessageKey) => messageIn(explainLang === 'hu' ? 'hu' : lang === 'de' ? 'de' : 'en', key),
    [explainLang, lang],
  )

  function fillVisible(text: string) {
    setBoxes((prev) => {
      const next = { ...prev }
      for (const tense of TENSE_IDS) if (visible.has(tense)) next[tense] = { input: text }
      return next
    })
  }

  function setBoxInput(tense: TenseId, input: string) {
    setBoxes((prev) => ({ ...prev, [tense]: { input } }))
  }

  function handleApplyAll(e: FormEvent) {
    e.preventDefault()
    if (!topInput.trim()) {
      setTopError('tenseEmptyBox')
      return
    }
    const parsed = parsePhrase(topInput)
    if ('error' in parsed) {
      setTopError(parsed.error === 'too-long' ? 'tenseTooLong' : 'tenseNotEnglish')
      return
    }
    setTopError(null)
    fillVisible([parsed.verb, parsed.rest].filter(Boolean).join(' '))
  }

  function handleRandomAll() {
    const phrase = randomPhrase(lastRandomRef.current)
    lastRandomRef.current = phrase
    setTopInput(phrase)
    setTopError(null)
    fillVisible(phrase)
  }

  function handleRandomBox(tense: TenseId) {
    setBoxInput(tense, randomPhrase(phraseText(boxes[tense].input) ?? undefined))
  }

  function showOnly(tenses: TenseId[]) {
    setVisible(new Set(tenses))
    setPinned((prev) => prev.filter((p) => tenses.includes(p)))
  }

  function toggleVisible(tense: TenseId) {
    if (visible.has(tense)) {
      if (visible.size === 1) return
      const next = new Set(visible)
      next.delete(tense)
      setVisible(next)
      setPinned((prev) => prev.filter((p) => p !== tense))
    } else {
      setVisible(new Set([...visible, tense]))
    }
  }

  function togglePin(tense: TenseId) {
    if (pinned.includes(tense)) {
      setPinned(pinned.filter((p) => p !== tense))
      return
    }
    if (pinned.length >= MAX_PINNED) return
    // The second pinned box takes the first one's verb, so the pair compares like with like.
    if (pinned.length === 1) setBoxInput(tense, boxes[pinned[0]].input)
    setPinned([...pinned, tense])
  }

  function renderBox(tense: TenseId) {
    return (
      <TenseBox
        key={tense}
        tense={tense}
        input={boxes[tense].input}
        onInputChange={(value) => setBoxInput(tense, value)}
        onRandom={() => handleRandomBox(tense)}
        subject={subjectFor(tense)}
        timeCue={timeCue}
        explainLang={explainLang}
        label={label}
        onHide={() => toggleVisible(tense)}
        canHide={visible.size > 1}
        pinned={pinned.includes(tense)}
        pinDisabled={!pinned.includes(tense) && pinned.length >= MAX_PINNED}
        onTogglePin={() => togglePin(tense)}
        speak={speak}
      />
    )
  }

  const visibleInOrder = TENSE_IDS.filter((tense) => visible.has(tense))
  const columns = FRAMES.map((f) => ({ ...f, tenses: visibleInOrder.filter((t) => TENSE_CONTENT[t].frame === f.frame) })).filter(
    (c) => c.tenses.length > 0,
  )
  const toggleClass = (active: boolean) =>
    `rounded-md px-3 py-1 text-xs font-medium transition ${active ? 'bg-amber-100 text-amber-700' : 'text-slate-500 hover:bg-slate-50'}`

  return (
    <div className="space-y-4">
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <form onSubmit={handleApplyAll} className="flex flex-col gap-2 sm:flex-row">
          <div className="min-w-0 flex-1">
            <input
              type="text"
              value={topInput}
              onChange={(e) => {
                setTopInput(e.target.value)
                setTopError(null)
              }}
              placeholder={t('tenseVerbPlaceholder')}
              aria-label={t('tenseVerbPlaceholder')}
              aria-invalid={Boolean(topError)}
              aria-describedby={topError ? 'tense-top-error' : undefined}
              autoComplete="off"
              spellCheck={false}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
            />
            {topError && (
              <p id="tense-top-error" className="mt-1 text-xs text-rose-600">
                {t(topError)}
              </p>
            )}
          </div>
          <div className="flex shrink-0 gap-2 self-start">
            <button
              type="submit"
              className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-amber-600"
            >
              {t('tenseApplyAll')}
            </button>
            <button
              type="button"
              onClick={handleRandomAll}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-amber-50 hover:text-amber-700"
            >
              <Dices size={16} />
              {t('tenseRandom')}
            </button>
          </div>
        </form>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
            {t('tenseSubject')}
            <select
              value={subjectMode}
              onChange={(e) => setSubjectMode(e.target.value as SubjectMode)}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm text-slate-700 focus:border-amber-400 focus:outline-none"
            >
              <option value="vary">{t('tenseSubjectVary')}</option>
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          {subjectMode === 'vary' && (
            <button
              type="button"
              onClick={() => setSubjectSeed((s) => s + 1)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-amber-50 hover:text-amber-700"
            >
              <Shuffle size={14} />
              {t('tenseShuffleSubjects')}
            </button>
          )}

          <button
            type="button"
            role="switch"
            aria-checked={timeCue}
            onClick={() => setTimeCue((v) => !v)}
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-600"
          >
            <span
              aria-hidden="true"
              className={`relative inline-block h-5 w-9 rounded-full transition ${timeCue ? 'bg-amber-500' : 'bg-slate-200'}`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${timeCue ? 'left-[1.125rem]' : 'left-0.5'}`}
              />
            </span>
            {t('tenseTimeCue')}
          </button>

          <div role="group" aria-label={t('tenseExplainLang')} className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-600">{t('tenseExplainLang')}</span>
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm">
              {(['en', 'hu'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={explainLang === option}
                  onClick={() => setExplainLang(option)}
                  className={toggleClass(explainLang === option)}
                >
                  {option === 'en' ? 'English' : 'Magyar'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t('tensePresets')}>
          {PRESETS.map((preset) => {
            const active = sameSet(visible, preset.tenses)
            return (
              <button
                key={preset.id}
                type="button"
                aria-pressed={active}
                onClick={() => showOnly(preset.tenses)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  active
                    ? 'border-amber-300 bg-amber-100 text-amber-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {t(preset.label)}
              </button>
            )
          })}
          <BoxesPopover visible={visible} onToggle={toggleVisible} explainLang={explainLang} />
        </div>
      </div>

      {pinned.length === 2 && (
        <ComparePanel
          tenses={[pinned[0], pinned[1]]}
          input={boxes[pinned[0]].input}
          subject={subjectFor(pinned[0])}
          timeCue={timeCue}
          explainLang={explainLang}
          label={label}
          onClose={() => setPinned([])}
          speak={speak}
        />
      )}
      {pinned.length === 1 && <p className="text-center text-xs text-slate-500">{t('tenseComparePinHint')}</p>}

      {/* lg: one stack per time frame (Present | Past | Future), so hidden boxes leave no gap.
          Below lg the stacks dissolve (display: contents) and `order` puts the boxes back in
          grid order in a single column. */}
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-3 lg:items-start">
        {columns.map((column) => (
          <div key={column.frame} className="contents lg:flex lg:min-w-0 lg:flex-col lg:gap-4">
            <h2 className="hidden px-1 text-xs font-semibold uppercase tracking-wide text-slate-400 lg:block">{t(column.label)}</h2>
            {column.tenses.map((tense) => (
              <div key={tense} className="min-w-0" style={{ order: TENSE_IDS.indexOf(tense) }}>
                {renderBox(tense)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
