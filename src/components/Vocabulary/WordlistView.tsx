import { useEffect, useState, type FormEvent } from 'react'
import { useLanguage } from '../../lib/i18n'
import { VocabRequestError } from '../../lib/vocabListsApi'
import {
  addListToSrs,
  addWordToList,
  deleteWordlist,
  fetchWordlist,
  regenerateWordlist,
  removeCard,
  removeWordFromList,
  renameWordlist,
  setCardSuspended,
} from '../../lib/vocabPracticeApi'
import { COMPILES_PER_DAY, LIST_TITLE_MAX_LENGTH, TERM_MAX_LENGTH, type WordlistDetail, type WordlistRef, type WordlistWord } from '../../lib/vocab'
import ListProgress from '../VocabLists/ListProgress'
import { CardBadge, KindBadge, useListTitle, useTopicLabel } from './wordlistLabels'

const inputClass =
  'min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-[var(--teal-accent)] focus:outline-none'
const smallButton =
  'rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground hover:bg-secondary disabled:opacity-40'
const actionButton =
  'rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground hover:bg-secondary disabled:opacity-40'

/**
 * One list (design §7.2): its words and where each stands in spaced repetition. Custom
 * lists are fully editable; teacher and conversation words can be paused, and
 * conversation words removed.
 */
export default function WordlistView({
  listRef,
  initial,
  compilesLeft,
  onBack,
  onPractise,
  onChanged,
}: {
  listRef: WordlistRef
  /** Already loaded (e.g. just compiled), so no fetch is needed. */
  initial: WordlistDetail | null
  compilesLeft: number
  onBack: () => void
  onPractise: (detail: WordlistDetail) => void
  /** Lists or cards changed: refresh the tabs' data. */
  onChanged: () => void
}) {
  const { t } = useLanguage()
  const listTitle = useListTitle()
  const topicLabel = useTopicLabel()
  const [detail, setDetail] = useState<WordlistDetail | null>(initial)
  const [loadFailed, setLoadFailed] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [renaming, setRenaming] = useState(false)
  const [title, setTitle] = useState('')
  const [newWord, setNewWord] = useState('')

  useEffect(() => {
    if (initial) return
    fetchWordlist(listRef)
      .then(setDetail)
      .catch((err) => {
        console.error('Failed to load word list', err)
        setLoadFailed(true)
      })
    // Once per opened list: the parent remounts this view for another list.
  }, [])

  /** Runs one edit; `apply` gets its result. Refreshes the tabs' data on success. */
  async function run<T>(key: string, action: () => Promise<T>, apply: (result: T) => void, errorFor?: (err: unknown) => string | null) {
    setBusy(key)
    setError(null)
    setNotice(null)
    try {
      apply(await action())
      onChanged()
    } catch (err) {
      console.error('Word list action failed', { key, err })
      setError(errorFor?.(err) ?? t('vcActionFailed'))
    } finally {
      setBusy(null)
    }
  }

  const reload = () => fetchWordlist(listRef).then(setDetail)

  if (loadFailed) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-red-600">{t('vcLoadFailed')}</p>
        <button type="button" onClick={onBack} className={actionButton}>
          {t('vcBackToOverview')}
        </button>
      </div>
    )
  }
  if (!detail) return <p className="text-sm text-muted-foreground">{t('loading')}</p>

  const { list, words } = detail
  const custom = list.kind === 'custom'
  const listId = list.id!
  const notInSrs = words.filter((w) => !w.card).length

  function saveTitle(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    void run('rename', () => renameWordlist(listId, title.trim()), (d) => {
      setDetail(d)
      setRenaming(false)
    })
  }

  function addWord(e: FormEvent) {
    e.preventDefault()
    const term = newWord.trim()
    if (!term) return
    void run(
      'add-word',
      () => addWordToList(listId, term),
      (d) => {
        setDetail(d)
        setNewWord('')
      },
      (err) => (err instanceof VocabRequestError && err.status === 409 ? t('vcWordExists', { term }) : null),
    )
  }

  function regenerate() {
    if (!window.confirm(t('vcConfirmRegenerate', { n: compilesLeft, max: COMPILES_PER_DAY }))) return
    void run('regenerate', () => regenerateWordlist(listId), setDetail, (err) =>
      err instanceof VocabRequestError && err.status === 429 ? t('vcCompileLimit', { n: COMPILES_PER_DAY }) : t('vcCompileFailed'),
    )
  }

  function remove() {
    if (!window.confirm(t('vcConfirmDeleteList', { title: list.title }))) return
    void run('delete', () => deleteWordlist(listId), onBack)
  }

  function addToSrs() {
    void run('srs', () => addListToSrs(listId), (r) => {
      setDetail(r.detail)
      setNotice(t('vcAddedToSrs', { n: r.cardsCreated }))
    })
  }

  function wordAction(w: WordlistWord) {
    const card = w.card
    const actions: { key: string; label: string; danger?: boolean; onClick: () => void }[] = []
    if (card) {
      actions.push({
        key: 'pause',
        label: card.suspended ? t('vcResumeWord') : t('vcPauseWord'),
        onClick: () => void run(`pause-${w.itemId}`, () => setCardSuspended(card.cardId, !card.suspended).then(reload), () => {}),
      })
    }
    if (custom) {
      actions.push({
        key: 'remove',
        label: t('vcRemoveFromList'),
        danger: true,
        onClick: () => void run(`remove-${w.itemId}`, () => removeWordFromList(listId, w.itemId), setDetail),
      })
    } else if (list.kind === 'conversations' && card) {
      actions.push({
        key: 'remove',
        label: t('vcRemoveWord'),
        danger: true,
        onClick: () => {
          if (!window.confirm(t('vcConfirmRemove', { term: w.term }))) return
          void run(`remove-${w.itemId}`, () => removeCard(card.cardId).then(reload), () => {})
        },
      })
    }
    return actions
  }

  return (
    <div className="space-y-4">
      <button type="button" onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground hover:underline">
        ← {t('vcBackToLists')}
      </button>

      <div className="space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="space-y-2">
          {renaming ? (
            <form onSubmit={saveTitle} className="flex flex-wrap gap-2">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={LIST_TITLE_MAX_LENGTH}
                aria-label={t('vcListTitle')}
                className={inputClass}
                autoFocus
              />
              <button type="submit" disabled={!title.trim() || busy !== null} className={actionButton}>
                {t('vcSave')}
              </button>
              <button type="button" onClick={() => setRenaming(false)} className={actionButton}>
                {t('vcCancel')}
              </button>
            </form>
          ) : (
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 className="min-w-0 break-words text-xl font-semibold text-foreground">{listTitle(list)}</h2>
              <div className="flex shrink-0 items-center gap-2">
                {list.cefrLevel && (
                  <span className="rounded-md bg-secondary px-1.5 py-0.5 text-xs font-medium text-secondary-foreground">{list.cefrLevel}</span>
                )}
                <KindBadge kind={list.kind} />
              </div>
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            {list.teacher && `${t('vcFromTeacherBy', { email: list.teacher.email })} · `}
            {custom && list.topic && `${topicLabel(list.topic)} · `}
            {t('vcWordCount', { n: list.wordCount })}
          </p>
          {list.teacher?.description && <p className="text-sm text-muted-foreground">{list.teacher.description}</p>}
          {list.teacher && <ListProgress progress={list.teacher.progress} completedAt={list.teacher.completedAt} />}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onPractise(detail)}
            disabled={words.length === 0}
            className="rounded-lg bg-[var(--teal-accent)] px-5 py-2.5 text-sm font-semibold text-primary hover:bg-[var(--teal-accent-strong)] disabled:opacity-40"
          >
            {t('vcFastPractise')}
          </button>
          {custom && (
            <button type="button" onClick={addToSrs} disabled={notInSrs === 0 || busy !== null} className={actionButton}>
              {busy === 'srs' ? t('vcSaving') : notInSrs === 0 ? t('vcAllInSrs') : t('vcAddToSrs', { n: notInSrs })}
            </button>
          )}
          {custom && (
            <>
              <button type="button" onClick={regenerate} disabled={compilesLeft === 0 || busy !== null} className={actionButton}>
                {busy === 'regenerate' ? t('vcCompiling') : t('vcRegenerate')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setTitle(list.title)
                  setRenaming(true)
                }}
                disabled={busy !== null}
                className={actionButton}
              >
                {t('vcRename')}
              </button>
              <button type="button" onClick={remove} disabled={busy !== null} className={`${actionButton} hover:text-red-600`}>
                {t('vcDeleteList')}
              </button>
            </>
          )}
        </div>
        {!custom && (
          <p className="text-xs text-muted-foreground">
            {list.kind === 'teacher' ? t('vcTeacherListSrsNote') : t('vcConversationsSrsNote')}
          </p>
        )}

        {notice && (
          <p className="rounded-xl bg-[var(--teal-accent-soft)] px-4 py-3 text-sm text-foreground" role="status">
            {notice}
          </p>
        )}
        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>

      {words.length === 0 ? (
        <p className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">{t('vcListNoWords')}</p>
      ) : (
        <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
          {words.map((w) => (
            <li key={w.itemId} className={`space-y-1 px-4 py-3 ${w.card?.suspended ? 'opacity-60' : ''}`}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="break-words font-medium text-foreground">{w.term}</span>
                  <span className="text-muted-foreground">
                    {' — '}
                    {w.meaningHu ?? <em className="text-xs">{t('vcMeaningPending')}</em>}
                  </span>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <CardBadge card={w.card} />
                  {wordAction(w).map((a) => (
                    <button
                      key={a.key}
                      type="button"
                      onClick={a.onClick}
                      disabled={busy !== null}
                      className={`${smallButton} ${a.danger ? 'hover:text-red-600' : ''}`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
              {w.contextOriginal ? (
                <p className="text-xs text-muted-foreground">
                  {t('vcYouSaid')} <span className="italic">{w.contextOriginal}</span>
                  {w.contextCorrected && (
                    <>
                      {' · '}
                      {t('vcBetter')} <span className="text-foreground">{w.contextCorrected}</span>
                    </>
                  )}
                </p>
              ) : (
                w.exampleEn && <p className="text-xs italic text-muted-foreground">{w.exampleEn}</p>
              )}
            </li>
          ))}
        </ul>
      )}

      {custom && (
        <form onSubmit={addWord} className="flex flex-wrap gap-2 rounded-2xl border border-border bg-card p-4">
          <input
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            maxLength={TERM_MAX_LENGTH}
            placeholder={t('vcAddWordPlaceholder')}
            aria-label={t('vcAddWordPlaceholder')}
            className={inputClass}
          />
          <button type="submit" disabled={!newWord.trim() || busy !== null} className={actionButton}>
            {busy === 'add-word' ? t('vcSaving') : t('vcAddWord')}
          </button>
        </form>
      )}
    </div>
  )
}
