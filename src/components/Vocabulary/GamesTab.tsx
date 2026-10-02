import { useState } from 'react'
import { useLanguage } from '../../lib/i18n'
import type { WordlistDetail, WordlistRef, WordlistsResponse } from '../../lib/vocab'
import { fetchWordlist } from '../../lib/vocabPracticeApi'
import { GRID_SIZES, createGridPuzzle, gridEligibleWords, gridWordCount, type GridPuzzle, type GridSize } from '../../lib/vocabGrid'
import GridGame from './GridGame'
import { useListTitle } from './wordlistLabels'

const keyOf = (l: WordlistRef) => `${l.kind}-${l.id}`

/**
 * Games tab: the word grid game. Pick a list, a size and whether the cells show the
 * Hungarian meanings; the words are drawn at random from the list. Nothing is saved.
 */
export default function GamesTab({ data }: { data: WordlistsResponse }) {
  const { t } = useLanguage()
  const listTitle = useListTitle()
  const playable = data.lists.filter((l) => l.wordCount >= gridWordCount(GRID_SIZES[0]))
  const [listKey, setListKey] = useState(() => (playable[0] ? keyOf(playable[0]) : ''))
  const [size, setSize] = useState<GridSize>(3)
  const [hints, setHints] = useState(true)
  const [detail, setDetail] = useState<WordlistDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [puzzle, setPuzzle] = useState<GridPuzzle | null>(null)
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
      const next = createGridPuzzle(words.words, size, hints)
      if (next) {
        setPuzzle(next)
        setGameNo((n) => n + 1)
      } else {
        setError(t('vgNotEnough', { have: gridEligibleWords(words.words, hints).length, size, need: gridWordCount(size) }))
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
        <p className="text-sm text-muted-foreground">{t('vgNoLists', { n: gridWordCount(GRID_SIZES[0]) })}</p>
      ) : (
        <div className="space-y-4">
          <label className="block space-y-1">
            <span className="text-sm font-medium text-foreground">{t('vgList')}</span>
            <select
              value={listKey}
              onChange={(e) => {
                const next = playable.find((l) => keyOf(l) === e.target.value)
                setListKey(e.target.value)
                // Keep the size playable: the biggest one the new list has words for.
                if (next && next.wordCount < gridWordCount(size)) {
                  setSize(GRID_SIZES.filter((n) => gridWordCount(n) <= next.wordCount).at(-1) ?? GRID_SIZES[0])
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
                const tooBig = list !== null && list.wordCount < gridWordCount(n)
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setSize(n)}
                    disabled={tooBig}
                    aria-pressed={size === n}
                    title={tooBig ? t('vgNotEnough', { have: list.wordCount, size: n, need: gridWordCount(n) }) : undefined}
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

          <label className="flex cursor-pointer items-start gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={hints}
              onChange={(e) => setHints(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[var(--teal-accent)]"
            />
            <span>
              {t('vgHints')}
              <span className="block text-xs text-muted-foreground">{t(hints ? 'vgHintsOn' : 'vgHintsOff')}</span>
            </span>
          </label>

          <button
            type="button"
            onClick={() => void start()}
            disabled={loading || !list || list.wordCount < gridWordCount(size)}
            className="rounded-lg bg-[var(--teal-accent)] px-5 py-2.5 text-sm font-semibold text-primary hover:bg-[var(--teal-accent-strong)] disabled:opacity-40"
          >
            {loading ? t('loading') : t('vgStart')}
          </button>
        </div>
      )}
    </section>
  )
}
