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
  type WordlistRef,
  type WordlistsResponse,
} from '../../lib/vocab'
import { KindBadge, TOPIC_LABEL, useListTitle, useTopicLabel } from './wordlistLabels'

const OTHER_TOPIC = 'other'
const WORD_BANK_SOURCE_URL = 'https://www.cefr-j.org/download.html'
const CC_BY_SA_URL = 'https://creativecommons.org/licenses/by-sa/4.0/'
const DEFAULT_COUNT = 5

const fieldClass =
  'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-[var(--teal-accent)] focus:outline-none'

/**
 * Fast practice (design §7.1): practise any of the student's lists, or compile a new one
 * by topic, level and size.
 */
export default function FastPracticeTab({
  data,
  onPractise,
  onCompiled,
}: {
  data: WordlistsResponse
  onPractise: (ref: WordlistRef) => void
  onCompiled: (detail: WordlistDetail) => void
}) {
  const { t } = useLanguage()
  const listTitle = useListTitle()
  const practisable = data.lists.filter((l) => l.wordCount > 0)

  return (
    <div className="space-y-4">
      <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-foreground">{t('vcFastTitle')}</h2>
          <p className="text-sm text-muted-foreground">{t('vcFastHint')}</p>
        </div>
        {practisable.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('vcFastNoLists')}</p>
        ) : (
          <ul className="divide-y divide-border rounded-xl border border-border">
            {practisable.map((l) => (
              <li key={`${l.kind}-${l.id}`} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <div className="min-w-0 space-y-0.5">
                  <p className="break-words text-sm font-medium text-foreground">{listTitle(l)}</p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <KindBadge kind={l.kind} />
                    <span>{t('vcWordCount', { n: l.wordCount })}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onPractise({ kind: l.kind, id: l.id })}
                  className="shrink-0 rounded-lg bg-[var(--teal-accent)] px-4 py-2 text-sm font-semibold text-primary hover:bg-[var(--teal-accent-strong)]"
                >
                  {t('vcPractise')}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <CompileForm data={data} onCompiled={onCompiled} />
    </div>
  )
}

function CompileForm({ data, onCompiled }: { data: WordlistsResponse; onCompiled: (detail: WordlistDetail) => void }) {
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
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-border bg-card p-5">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground">{t('vcCompileTitle')}</h2>
        <p className="text-sm text-muted-foreground">{t('vcCompileHint')}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block space-y-1 sm:col-span-3">
          <span className="text-sm font-medium text-foreground">{t('vcCompileTopic')}</span>
          <select value={topic} onChange={(e) => setTopic(e.target.value)} className={fieldClass}>
            {VOCAB_TOPICS.map((id) => (
              <option key={id} value={id}>
                {t(TOPIC_LABEL[id])}
              </option>
            ))}
            <option value={OTHER_TOPIC}>{t('vcTopicOther')}</option>
          </select>
        </label>
        {topic === OTHER_TOPIC && (
          <input
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            maxLength={CUSTOM_TOPIC_MAX_LENGTH}
            placeholder={t('vcTopicOtherPlaceholder')}
            aria-label={t('vcTopicOtherPlaceholder')}
            className={`${fieldClass} sm:col-span-3`}
            autoFocus
          />
        )}
        <label className="block space-y-1">
          <span className="text-sm font-medium text-foreground">{t('vcCompileLevel')}</span>
          <select value={level} onChange={(e) => setLevel(e.target.value as CefrLevel)} className={fieldClass}>
            {CEFR_LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium text-foreground">{t('vcCompileCount')}</span>
          <select value={count} onChange={(e) => setCount(Number(e.target.value))} className={fieldClass}>
            {Array.from({ length: COMPILE_MAX_WORDS - COMPILE_MIN_WORDS + 1 }, (_, i) => COMPILE_MIN_WORDS + i).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={!canCompile}
          className="rounded-lg bg-[var(--teal-accent)] px-5 py-2.5 text-sm font-semibold text-primary hover:bg-[var(--teal-accent-strong)] disabled:opacity-40"
        >
          {busy ? t('vcCompiling') : t('vcCompile')}
        </button>
        <span className="text-xs text-muted-foreground">{t('vcCompilesLeft', { n: left, max: COMPILES_PER_DAY })}</span>
      </div>

      {/* Required by the word bank's terms of use (design §5.3). */}
      <p className="border-t border-border pt-3 text-xs text-muted-foreground">
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
