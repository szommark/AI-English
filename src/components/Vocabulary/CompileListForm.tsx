import { useState, type FormEvent } from 'react'
import { useLanguage } from '../../lib/i18n'
import { VocabRequestError } from '../../lib/vocabListsApi'
import { compileWordlist } from '../../lib/vocabPracticeApi'
import { GRAMMAR_LEVELS as CEFR_LEVELS, type CefrLevel } from '../../data/grammarCurriculum'
import {
  COMPILES_PER_DAY,
  COMPILE_MAX_WORDS,
  COMPILE_MIN_WORDS,
  CUSTOM_TOPIC_MAX_LENGTH,
  VOCAB_TOPICS,
  type WordlistDetail,
  type WordlistsResponse,
} from '../../lib/vocab'
import { TOPIC_LABEL, useTopicLabel } from './wordlistLabels'

const OTHER_TOPIC = 'other'
const WORD_BANK_SOURCE_URL = 'https://www.cefr-j.org/download.html'
const CC_BY_SA_URL = 'https://creativecommons.org/licenses/by-sa/4.0/'
const DEFAULT_COUNT = 5

const fieldClass =
  'rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-[var(--teal-accent)] focus:outline-none'

/** Compile a new list (design §7.2): topic, level and size in one row, at the top of My wordlists. */
export default function CompileListForm({ data, onCompiled }: { data: WordlistsResponse; onCompiled: (detail: WordlistDetail) => void }) {
  const { t } = useLanguage()
  const topicLabel = useTopicLabel()
  const [topic, setTopic] = useState<string>(VOCAB_TOPICS[0])
  const [customTopic, setCustomTopic] = useState('')
  const [level, setLevel] = useState<CefrLevel>(data.learnerLevel)
  const [count, setCount] = useState(DEFAULT_COUNT)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const left = Math.max(0, COMPILES_PER_DAY - data.compiledToday)
  const chosenTopic = topic === OTHER_TOPIC ? customTopic.trim() : topic
  const canCompile = left > 0 && chosenTopic.length > 0 && !busy

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!canCompile) return
    setBusy(true)
    setError(null)
    try {
      const title = `${topicLabel(chosenTopic)} · ${level}`
      onCompiled(await compileWordlist({ topic: chosenTopic, cefrLevel: level, count, title }))
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
        <select value={topic} onChange={(e) => setTopic(e.target.value)} aria-label={t('vcCompileTopic')} className={`${fieldClass} w-44`}>
          {VOCAB_TOPICS.map((id) => (
            <option key={id} value={id}>
              {t(TOPIC_LABEL[id])}
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
          onChange={(e) => setLevel(e.target.value as CefrLevel)}
          aria-label={t('vcCompileLevel')}
          className={fieldClass}
        >
          {CEFR_LEVELS.map((l) => (
            <option key={l} value={l}>
              {t('vcLevelOption', { level: l })}
            </option>
          ))}
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
          className="rounded-lg bg-[var(--teal-accent)] px-4 py-2 text-sm font-semibold text-primary hover:bg-[var(--teal-accent-strong)] disabled:opacity-40"
        >
          {busy ? t('vcCompiling') : t('vcCompile')}
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {/* Required by the word bank's terms of use (design §5.3). */}
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
    </form>
  )
}
