import { useState } from 'react'
import { useLanguage } from '../../lib/i18n'
import type { WordlistDetail, WordlistRef, WordlistSummary, WordlistsResponse } from '../../lib/vocab'
import { fetchWordlist } from '../../lib/vocabPracticeApi'
import {
  GRID_MIN_WORDS,
  GRID_SIZES,
  createGridPuzzle,
  gridEligibleWords,
  gridWordCount,
  type GridPuzzle,
  type GridSize,
} from '../../lib/vocabGrid'
import CrosswordTab from './CrosswordTab'
import GridGame from './GridGame'
import { useListTitle } from './wordlistLabels'

const keyOf = (l: WordlistRef) => `${l.kind}-${l.id}`

/** Whether a list has enough words for this size, with or without decoys. */
const fits = (l: WordlistSummary, size: number, decoys: boolean) => l.wordCount >= gridWordCount(size, decoys)

type Game = 'grid' | 'crossword'

/**
 * Games tab: the word grid and the crossword, picked with a switch. Both stay mounted, so
 * switching doesn't lose a game in progress.
 */
export default function GamesTab({ data }: { data: WordlistsResponse }) {
  const { t } = useLanguage()
  const [game, setGame] = useState<Game>('grid')
  return (
    <div className="space-y-3">
      <div className="inline-flex rounded-lg bg-secondary p-0.5" role="group" aria-label={t('vgPickGame')}>
        {(['grid', 'crossword'] as const).map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setGame(g)}
            aria-pressed={game === g}
            className={`rounded-md px-4 py-1.5 text-sm ${
              game === g ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t(g === 'grid' ? 'vgTitle' : 'cwTitle')}
          </button>
        ))}
      </div>
      <div hidden={game !== 'grid'}>
        <WordGridGame data={data} />
      </div>
      <div hidden={game !== 'crossword'}>
        <CrosswordTab data={data} />
      </div>
    </div>
  )
}

/**
 * The word grid game. Pick a list, a size and whether a row of decoys is mixed in; the
 * words are drawn at random from the list. Nothing is saved.
 */
function WordGridGame({ data }: { data: WordlistsResponse }) {
  const { t } = useLanguage()
  const listTitle = useListTitle()
  const playable = data.lists.filter((l) => l.wordCount >= GRID_MIN_WORDS)
  const [listKey, setListKey] = useState(() => (playable[0] ? keyOf(playable[0]) : ''))
  const [size, setSize] = useState<GridSize>(3)
  /** One extra row of words that belong nowhere; on by default when the first list has the words. */
  const [decoys, setDecoys] = useState(() => !playable[0] || fits(playable[0], GRID_SIZES[0], true))
  const [detail, setDetail] = useState<WordlistDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [puzzle, setPuzzle] = useState<GridPuzzle | null>(null)
  /** Remounts the game for a new puzzle with the same settings. */
  const [gameNo, setGameNo] = useState(0)

  const list = playable.find((l) => keyOf(l) === listKey) ?? null
  /** Turning decoys on needs size more words than the list has (turning them off is always fine). */
  const decoysUnavailable = !decoys && list !== null && !fits(list, size, true)

  async function start() {
    if (!list) return
    setError(null)
    setLoading(true)
    try {
      const words = detail && keyOf(detail.list) === listKey ? detail : await fetchWordlist({ kind: list.kind, id: list.id })
      setDetail(words)
      const next = createGridPuzzle(words.words, size, decoys)
      if (next) {
        setPuzzle(next)
        setGameNo((n) => n + 1)
      } else {
        setError(t('vgNotEnough', { have: gridEligibleWords(words.words).length, size, need: gridWordCount(size, decoys) }))
      }
    } catch {
      setError(t('vcLoadFailed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground">{t('vgTitle')}</h2>
        {!puzzle && <p className="text-sm text-muted-foreground">{t('vgIntro')}</p>}
        {puzzle && list && <p className="break-words text-sm text-muted-foreground">{listTitle(list)}</p>}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {puzzle ? (
        <GridGame
          key={gameNo}
          puzzle={puzzle}
          onPlayAgain={() => void start()}
          onQuit={() => setPuzzle(null)}
        />
      ) : playable.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('vgNoLists', { n: GRID_MIN_WORDS })}</p>
      ) : (
        <div className="space-y-4">
          <label className="block space-y-1">
            <span className="text-sm font-medium text-foreground">{t('vgList')}</span>
            <select
              value={listKey}
              onChange={(e) => {
                const next = playable.find((l) => keyOf(l) === e.target.value)
                setListKey(e.target.value)
                // Keep the game playable: the biggest size the new list has words for, with
                // decoys if it has the words for them at all.
                if (next && !fits(next, size, decoys)) {
                  const withDecoys = decoys && fits(next, GRID_SIZES[0], true)
                  setDecoys(withDecoys)
                  setSize(GRID_SIZES.filter((n) => fits(next, n, withDecoys)).at(-1) ?? GRID_SIZES[0])
                }
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
              {GRID_SIZES.map((n) => {
                const tooBig = list !== null && !fits(list, n, decoys)
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setSize(n)}
                    disabled={tooBig}
                    aria-pressed={size === n}
                    title={tooBig ? t('vgNotEnough', { have: list.wordCount, size: n, need: gridWordCount(n, decoys) }) : undefined}
                    className={`rounded-md px-4 py-1.5 text-sm tabular-nums disabled:opacity-40 ${
                      size === n ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {n}×{n}
                  </button>
                )
              })}
            </div>
          </fieldset>

          <label
            className={`flex items-start gap-2 text-sm text-foreground ${decoysUnavailable ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            title={decoysUnavailable && list ? t('vgNotEnough', { have: list.wordCount, size, need: gridWordCount(size, true) }) : undefined}
          >
            <input
              type="checkbox"
              checked={decoys}
              disabled={decoysUnavailable}
              onChange={(e) => setDecoys(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[var(--teal-accent)]"
            />
            <span>
              {t('vgDecoys', { n: size })}
              <span className="block text-xs text-muted-foreground">{t('vgDecoysHint')}</span>
            </span>
          </label>

          <button
            type="button"
            onClick={() => void start()}
            disabled={loading || !list || !fits(list, size, decoys)}
            className="rounded-lg bg-[var(--teal-accent)] px-5 py-2.5 text-sm font-semibold text-primary hover:bg-[var(--teal-accent-strong)] disabled:opacity-40"
          >
            {loading ? t('loading') : t('vgStart')}
          </button>
        </div>
      )}
    </section>
  )
}
