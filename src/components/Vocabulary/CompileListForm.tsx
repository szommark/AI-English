import { useState, type FormEvent } from 'react'
import { useLanguage } from '../../lib/i18n'
import { VocabRequestError } from '../../lib/vocabListsApi'
import { compileWordlist } from '../../lib/vocabPracticeApi'
import { GRAMMAR_LEVELS as CEFR_LEVELS } from '../../data/grammarCurriculum'
import {
  COMPILES_PER_DAY,
  COMPILE_MAX_WORDS,
  COMPILE_MIN_WORDS,
  CUSTOM_TOPIC_MAX_LENGTH,
  DA_LEVELS,
  DA_TOPICS,
  DA_TOP_FREQUENCY_TOPIC,
  MIXED_LEVEL,
  VOCAB_TOPICS,
  mixedLevels,
  type ListLevel,
  type TargetLanguage,
  type WordlistDetail,
  type WordlistsResponse,
} from '../../lib/vocab'
import { useTopicLabel } from './wordlistLabels'

const OTHER_TOPIC = 'other'
const WORD_BANK_SOURCE_URL = 'https://www.cefr-j.org/download.html'
const CC_BY_SA_URL = 'https://creativecommons.org/licenses/by-sa/4.0/'
const DEFAULT_COUNT = 5

/** The language picker's options, each named in its own language. */
const LANGUAGE_OPTIONS: { value: TargetLanguage; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'da', label: 'Dansk' },
]
/** The topics offered per language: Danish lists also get "most common words". */
const TOPICS_BY_LANGUAGE: Record<TargetLanguage, readonly string[]> = {
  en: VOCAB_TOPICS,
  da: [DA_TOP_FREQUENCY_TOPIC, ...DA_TOPICS],
}
/** A new Danish list's level: a beginner's. */
const DA_DEFAULT_LEVEL = DA_LEVELS[0]
/** The last language picked, so a learner of Danish doesn't switch every time (per browser). */
const LANGUAGE_STORAGE_KEY = 'ai-english:compile-language'

function storedLanguage(): TargetLanguage {
  try {
    return window.localStorage.getItem(LANGUAGE_STORAGE_KEY) === 'da' ? 'da' : 'en'
  } catch {
    return 'en'
  }
}

const fieldClass =
  'rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-[var(--teal-accent)] focus:outline-none'

/**
 * Compile a new list (design §7.2): language, topic, level and size in one row, at the top of
 * My wordlists. Danish lists have their own topics and levels (A1–B1); English is unchanged.
 */
export default function CompileListForm({ data, onCompiled }: { data: WordlistsResponse; onCompiled: (detail: WordlistDetail) => void }) {
  const { t } = useLanguage()
  const topicLabel = useTopicLabel()
  const [language, setLanguage] = useState<TargetLanguage>(storedLanguage)
  const [topic, setTopic] = useState<string>(() => TOPICS_BY_LANGUAGE[language][0])
  const [customTopic, setCustomTopic] = useState('')
  const [level, setLevel] = useState<ListLevel>(() => defaultLevel(language))
  const [count, setCount] = useState(DEFAULT_COUNT)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const danish = language === 'da'
  const left = Math.max(0, COMPILES_PER_DAY - data.compiledToday)
  const levels: readonly ListLevel[] = danish ? DA_LEVELS : CEFR_LEVELS
  const mixed = danish ? DA_LEVELS : mixedLevels(data.learnerLevel)
  const mixedRange = `${mixed[0]}–${mixed[mixed.length - 1]}`
  const chosenTopic = topic === OTHER_TOPIC ? customTopic.trim() : topic
  const canCompile = left > 0 && chosenTopic.length > 0 && !busy

  /** The learner's level is their English one, so it says nothing about Danish. */
  function defaultLevel(lang: TargetLanguage): ListLevel {
    return lang === 'en' ? data.learnerLevel : DA_DEFAULT_LEVEL
  }

  function pickLanguage(next: TargetLanguage) {
    if (next === language) return
    setLanguage(next)
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, next)
    } catch {
      // Private mode or blocked storage: the choice just isn't remembered.
    }
    if (topic !== OTHER_TOPIC && !TOPICS_BY_LANGUAGE[next].includes(topic)) setTopic(TOPICS_BY_LANGUAGE[next][0])
    if (level !== MIXED_LEVEL) setLevel(defaultLevel(next))
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!canCompile) return
    setBusy(true)
    setError(null)
    try {
      const levelLabel = level === MIXED_LEVEL ? t('vcLevelMixed') : level
      const base = `${topicLabel(chosenTopic, language)} · ${levelLabel}`
      // A Danish list says so in its title too: game and practice pickers show titles only.
      const title = danish ? `${t('vcLanguageDanish')} · ${base}` : base
      // English sends exactly what it always did; the server defaults to English.
      const input = { topic: chosenTopic, cefrLevel: level, count, title }
      onCompiled(await compileWordlist(danish ? { ...input, targetLanguage: 'da' } : input))
    } catch (err) {
      console.error('Failed to compile word list', err)
      setError(err instanceof VocabRequestError && err.status === 429 ? t('vcCompileLimit', { n: COMPILES_PER_DAY }) : t('vcCompileFailed'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 className="text-base font-semibold text-foreground">{t('vcCompileTitle')}</h2>
        <span className="text-xs text-muted-foreground">{t('vcCompilesLeft', { n: left, max: COMPILES_PER_DAY })}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div role="group" aria-label={t('vcCompileLanguage')} className="inline-flex rounded-lg bg-secondary p-0.5">
          {LANGUAGE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              lang={option.value}
              onClick={() => pickLanguage(option.value)}
              aria-pressed={language === option.value}
              className={`rounded-md px-3 py-1.5 text-sm ${
                language === option.value ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <select value={topic} onChange={(e) => setTopic(e.target.value)} aria-label={t('vcCompileTopic')} className={`${fieldClass} w-44`}>
          {TOPICS_BY_LANGUAGE[language].map((id) => (
            <option key={id} value={id}>
              {topicLabel(id, language)}
            </option>
          ))}
          <option value={OTHER_TOPIC}>{t('vcTopicOther')}</option>
        </select>
        {topic === OTHER_TOPIC && (
          <input
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            maxLength={CUSTOM_TOPIC_MAX_LENGTH}
            placeholder={t('vcTopicOtherPlaceholder')}
            aria-label={t('vcTopicOtherPlaceholder')}
            className={`${fieldClass} w-56`}
            autoFocus
          />
        )}
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value as ListLevel)}
          aria-label={t('vcCompileLevel')}
          className={fieldClass}
        >
          {levels.map((l) => (
            <option key={l} value={l}>
              {t('vcLevelOption', { level: l })}
            </option>
          ))}
          <option value={MIXED_LEVEL}>{t('vcLevelMixedOption', { levels: mixedRange })}</option>
        </select>
        <select value={count} onChange={(e) => setCount(Number(e.target.value))} aria-label={t('vcCompileCount')} className={fieldClass}>
          {Array.from({ length: COMPILE_MAX_WORDS - COMPILE_MIN_WORDS + 1 }, (_, i) => COMPILE_MIN_WORDS + i).map((n) => (
            <option key={n} value={n}>
              {t('vcWordCount', { n })}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={!canCompile}
          className="rounded-lg bg-[var(--teal-accent)] px-4 py-2 text-sm font-semibold text-primary hover:bg-[var(--club-gold-light)] disabled:opacity-40"
        >
          {busy ? t('vcCompiling') : t('vcCompile')}
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {danish ? (
        <p className="text-xs text-muted-foreground">{t('vcDaCompileNote')}</p>
      ) : (
        /* Required by the word bank's terms of use (design §5.3). */
        <p className="text-xs text-muted-foreground">
          {t('vcWordBankCredit')}{' '}
          <a href={WORD_BANK_SOURCE_URL} target="_blank" rel="noreferrer" className="underline hover:text-foreground">
            CEFR-J
          </a>
          {' · '}
          <a href={CC_BY_SA_URL} target="_blank" rel="noreferrer" className="underline hover:text-foreground">
            CC BY-SA 4.0
          </a>
        </p>
      )}
    </form>
  )
}
