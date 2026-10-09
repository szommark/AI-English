import { useState } from 'react'
import { useLanguage } from '../../lib/i18n'
import type { WordlistDetail, WordlistRef, WordlistSummary, WordlistsResponse } from '../../lib/vocab'
import { fetchWordlist } from '../../lib/vocabPracticeApi'
import {
  CROSSWORD_MIN_WORDS,
  CROSSWORD_SIZES,
  createCrossword,
  crosswordEligibleWords,
  type ClueLanguage,
  type CrosswordPuzzle,
  type CrosswordSize,
} from '../../lib/vocabCrossword'
import CrosswordGame from './CrosswordGame'
import { useListTitle } from './wordlistLabels'

const keyOf = (l: WordlistRef) => `${l.kind}-${l.id}`

/** The biggest crossword a list has words for. */
const biggestSize = (l: WordlistSummary): CrosswordSize =>
  CROSSWORD_SIZES.filter((n) => l.wordCount >= n).at(-1) ?? CROSSWORD_SIZES[0]

/**
 * Crossword game setup: pick a list, how many words and which clues; the words are drawn at
 * random from the list and one of them is the solution. Nothing is saved.
 */
export default function CrosswordTab({ data }: { data: WordlistsResponse }) {
  const { t } = useLanguage()
  const listTitle = useListTitle()
  const playable = data.lists.filter((l) => l.wordCount >= CROSSWORD_MIN_WORDS)
  const [listKey, setListKey] = useState(() => (playable[0] ? keyOf(playable[0]) : ''))
  const [size, setSize] = useState<CrosswordSize>(() => (playable[0] && playable[0].wordCount < 9 ? biggestSize(playable[0]) : 9))
  const [clueLanguage, setClueLanguage] = useState<ClueLanguage>('en')
  const [detail, setDetail] = useState<WordlistDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [puzzle, setPuzzle] = useState<CrosswordPuzzle | null>(null)
  /** Remounts the game for a new puzzle with the same settings. */
  const [gameNo, setGameNo] = useState(0)

  const list = playable.find((l) => keyOf(l) === listKey) ?? null

  async function start() {
    if (!list) return
    setError(null)
    setLoading(true)
    try {
      const words = detail && keyOf(detail.list) === listKey ? detail : await fetchWordlist({ kind: list.kind, id: list.id })
      setDetail(words)
      const eligible = crosswordEligibleWords(words.words, clueLanguage)
      const next = createCrossword(eligible, size)
      if (next) {
        setPuzzle(next)
        setGameNo((n) => n + 1)
      } else {
        setError(t('cwNotEnough', { have: eligible.length, need: CROSSWORD_MIN_WORDS }))
      }
    } catch {
      setError(t('vcLoadFailed'))
    } finally {
      setLoading(false)
    }
  }

  const segment = (selected: boolean) =>
    `rounded-md px-4 py-1.5 text-sm disabled:opacity-40 ${
      selected ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
    }`

  return (
    <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground">{t('cwTitle')}</h2>
        {!puzzle && <p className="text-sm text-muted-foreground">{t('cwIntro')}</p>}
        {puzzle && list && <p className="break-words text-sm text-muted-foreground">{listTitle(list)}</p>}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {puzzle ? (
        <CrosswordGame
          key={gameNo}
          puzzle={puzzle}
          clueLanguage={clueLanguage}
          onPlayAgain={() => void start()}
          onQuit={() => setPuzzle(null)}
        />
      ) : playable.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('vgNoLists', { n: CROSSWORD_MIN_WORDS })}</p>
      ) : (
        <div className="space-y-4">
          <label className="block space-y-1">
            <span className="text-sm font-medium text-foreground">{t('vgList')}</span>
            <select
              value={listKey}
              onChange={(e) => {
                const next = playable.find((l) => keyOf(l) === e.target.value)
                setListKey(e.target.value)
                if (next && next.wordCount < size) setSize(biggestSize(next))
              }}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
            >
              {playable.map((l) => (
                <option key={keyOf(l)} value={keyOf(l)}>
                  {listTitle(l)} · {t('vcWordCount', { n: l.wordCount })}
                </option>
              ))}
            </select>
          </label>

          <fieldset className="space-y-1">
            <legend className="text-sm font-medium text-foreground">{t('vgSize')}</legend>
            <div className="inline-flex rounded-lg bg-secondary p-0.5" role="group">
              {CROSSWORD_SIZES.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setSize(n)}
                  disabled={list !== null && list.wordCount < n}
                  aria-pressed={size === n}
                  className={`${segment(size === n)} tabular-nums`}
                >
                  {t('cwSizeWords', { n })}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="space-y-1">
            <legend className="text-sm font-medium text-foreground">{t('cwClues')}</legend>
            <div className="inline-flex rounded-lg bg-secondary p-0.5" role="group">
              {(['en', 'hu'] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setClueLanguage(lang)}
                  aria-pressed={clueLanguage === lang}
                  className={segment(clueLanguage === lang)}
                >
                  {t(lang === 'en' ? 'cwCluesEn' : 'cwCluesHu')}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{t('cwCluesHint')}</p>
          </fieldset>

          <button
            type="button"
            onClick={() => void start()}
            disabled={loading || !list}
            className="rounded-lg bg-[var(--teal-accent)] px-5 py-2.5 text-sm font-semibold text-primary hover:bg-[var(--teal-accent-strong)] disabled:opacity-40"
          >
            {loading ? t('loading') : t('vgStart')}
          </button>
        </div>
      )}
    </section>
  )
}
