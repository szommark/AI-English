import { useState } from 'react'
import { useLanguage } from '../../lib/i18n'
import { DA_ARTICLES, withArticle, type DaArticle, type WordlistDetail, type WordlistRef, type WordlistsResponse } from '../../lib/vocab'
import { fetchWordlist } from '../../lib/vocabPracticeApi'
import { ARTICLE_GAME_MIN_WORDS, articleGame, articleGameWords, type ArticleRound } from '../../lib/vocabArticleGame'
import { useListTitle } from './wordlistLabels'

const keyOf = (l: WordlistRef) => `${l.kind}-${l.id}`

const primaryButton =
  'rounded-lg bg-[var(--teal-accent)] px-5 py-2.5 text-sm font-semibold text-primary hover:bg-[var(--club-gold-light)] disabled:opacity-40'
const secondaryButton = 'rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground hover:bg-secondary'

/**
 * "en or et?": a Danish list's nouns one at a time; two buttons pick the article. Shown only
 * when the learner has a Danish list (GamesTab). Nothing is saved.
 */
export default function ArticleGame({ data }: { data: WordlistsResponse }) {
  const { t } = useLanguage()
  const listTitle = useListTitle()
  const lists = data.lists.filter((l) => l.targetLanguage === 'da' && l.wordCount >= ARTICLE_GAME_MIN_WORDS)
  const [listKey, setListKey] = useState(() => (lists[0] ? keyOf(lists[0]) : ''))
  const [detail, setDetail] = useState<WordlistDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rounds, setRounds] = useState<ArticleRound[] | null>(null)
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState<DaArticle | null>(null)
  const [score, setScore] = useState(0)
  /** The nouns missed this game, to list at the end. */
  const [missed, setMissed] = useState<ArticleRound[]>([])

  const list = lists.find((l) => keyOf(l) === listKey) ?? null

  async function start() {
    if (!list) return
    setError(null)
    setLoading(true)
    try {
      const words = detail && keyOf(detail.list) === listKey ? detail : await fetchWordlist({ kind: list.kind, id: list.id })
      setDetail(words)
      const next = articleGame(words.words)
      if (next) {
        setRounds(next)
        setIndex(0)
        setAnswer(null)
        setScore(0)
        setMissed([])
      } else {
        setError(t('agNotEnough', { have: articleGameWords(words.words).length, need: ARTICLE_GAME_MIN_WORDS }))
      }
    } catch {
      setError(t('vcLoadFailed'))
    } finally {
      setLoading(false)
    }
  }

  function pick(article: DaArticle) {
    if (!rounds || answer) return
    const round = rounds[index]
    setAnswer(article)
    if (article === round.article) setScore((s) => s + 1)
    else setMissed((m) => [...m, round])
  }

  const finished = rounds !== null && index >= rounds.length
  const round = rounds && !finished ? rounds[index] : null

  return (
    <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground" lang="da">
          {t('agTitle')}
        </h2>
        {!rounds && <p className="text-sm text-muted-foreground">{t('agIntro')}</p>}
        {rounds && list && <p className="break-words text-sm text-muted-foreground">{listTitle(list)}</p>}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {round ? (
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground tabular-nums">{t('agProgress', { n: index + 1, total: rounds!.length })}</p>
          <div className="space-y-1 text-center">
            <p className="text-3xl font-semibold text-foreground" lang="da">
              {answer ? withArticle(round.term, round.article) : `___ ${round.term}`}
            </p>
            {round.meaningHu && <p className="text-sm text-muted-foreground">{round.meaningHu}</p>}
          </div>
          <div className="flex justify-center gap-3" role="group" aria-label={t('agPick')}>
            {DA_ARTICLES.map((a) => {
              const tone = !answer
                ? 'border-border bg-card hover:border-[var(--teal-accent)] hover:bg-[var(--teal-accent-soft)]'
                : a === round.article
                  ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
                  : a === answer
                    ? 'border-red-300 bg-red-50 text-red-700'
                    : 'border-border bg-card opacity-50'
              return (
                <button
                  key={a}
                  type="button"
                  lang="da"
                  onClick={() => pick(a)}
                  disabled={answer !== null}
                  className={`w-28 rounded-xl border-2 px-4 py-3 text-xl font-semibold ${tone}`}
                >
                  {a}
                </button>
              )
            })}
          </div>
          {answer && (
            <div className="space-y-3 text-center" aria-live="polite">
              <p className={`text-sm font-medium ${answer === round.article ? 'text-emerald-700' : 'text-red-700'}`}>
                {answer === round.article ? t('vcCorrect') : t('agWrong', { word: withArticle(round.term, round.article) })}
              </p>
              <button type="button" onClick={() => { setIndex((i) => i + 1); setAnswer(null) }} className={primaryButton} autoFocus>
                {t('next')}
              </button>
            </div>
          )}
        </div>
      ) : finished ? (
        <div className="space-y-4">
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-800">
            {t('agScore', { correct: score, total: rounds!.length })}
          </p>
          {missed.length > 0 && (
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">{t('agMissed')}</h3>
              <ul className="space-y-0.5 text-sm" lang="da">
                {missed.map((m) => (
                  <li key={m.id}>
                    <span className="font-semibold">{withArticle(m.term, m.article)}</span>
                    {m.meaningHu && <span className="text-muted-foreground"> — {m.meaningHu}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => void start()} disabled={loading} className={primaryButton}>
              {t('cwPlayAgain')}
            </button>
            <button type="button" onClick={() => setRounds(null)} className={secondaryButton}>
              {t('vgQuit')}
            </button>
          </div>
        </div>
      ) : lists.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('agNoLists', { n: ARTICLE_GAME_MIN_WORDS })}</p>
      ) : (
        <div className="space-y-4">
          <label className="block space-y-1">
            <span className="text-sm font-medium text-foreground">{t('vgList')}</span>
            <select
              value={listKey}
              onChange={(e) => setListKey(e.target.value)}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
            >
              {lists.map((l) => (
                <option key={keyOf(l)} value={keyOf(l)}>
                  {listTitle(l)} · {t('vcWordCount', { n: l.wordCount })}
                </option>
              ))}
            </select>
          </label>
          <button type="button" onClick={() => void start()} disabled={loading || !list} className={primaryButton}>
            {loading ? t('loading') : t('vgStart')}
          </button>
        </div>
      )}
    </section>
  )
}
