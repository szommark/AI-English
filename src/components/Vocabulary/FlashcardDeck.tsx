import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useLanguage } from '../../lib/i18n'
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis'
import type { CefrLevel } from '../../data/grammarCurriculum'
import { speechLocaleFor, type DaArticle, type ReviewStatus, type TargetLanguage } from '../../lib/vocab'
import { SpeakerIcon } from '../icons/AudioIcons'
import { LevelBadge } from './wordlistLabels'

/** One word of a list, as the card view shows it. */
export interface Flashcard {
  id: string
  term: string
  meaningHu: string | null
  definitionEn: string | null
  exampleEn: string | null
  cefrLevel: CefrLevel | null
  /** Danish nouns: en/et, shown with the term ("et hus"). */
  article?: DaArticle | null
  /** Danish words: a respelling for a Hungarian reader, on the back. */
  pronunciationHint?: string | null
  /** Hungarian translation of the example, under it. */
  exampleHu?: string | null
  /** Danish verbs: infinitive, present, past, perfect. */
  verbForms?: string[] | null
  /** Generated words: needs_review until a teacher checks them. */
  reviewStatus?: ReviewStatus
}

/** The term as shown and spoken: Danish nouns with their article. */
export function displayTerm(c: { term: string; article?: DaArticle | null }): string {
  return c.article ? `${c.article} ${c.term}` : c.term
}

/** Small amber "needs review" pill for generated words a teacher hasn't checked yet. */
export function NeedsReviewBadge() {
  const { t } = useLanguage()
  return (
    <span
      title={t('vcNeedsReviewHint')}
      className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800"
    >
      {t('vcNeedsReview')}
    </span>
  )
}

/** Teacher/admin toggle of a generated word's review state (global: every learner sees it). */
export function ReviewToggle({
  reviewed,
  disabled,
  onChange,
}: {
  reviewed: boolean
  disabled?: boolean
  onChange: (reviewed: boolean) => void
}) {
  const { t } = useLanguage()
  return (
    <button
      type="button"
      aria-pressed={reviewed}
      disabled={disabled}
      title={t('vcReviewedToggleHint')}
      onClick={(e) => {
        e.stopPropagation()
        onChange(!reviewed)
      }}
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium disabled:opacity-40 ${
        reviewed
          ? 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
          : 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
      }`}
    >
      <span aria-hidden>{reviewed ? '☑' : '☐'}</span>
      {t('vcReviewedToggle')}
    </button>
  )
}

type Direction = 'en-hu' | 'hu-en'

interface DeckSettings {
  direction: Direction
  showDefinition: boolean
  showExample: boolean
}

const SETTINGS_KEY = 'ai-english:flashcards'
const DEFAULT_SETTINGS: DeckSettings = { direction: 'en-hu', showDefinition: true, showExample: true }
/** Horizontal finger travel (px) that counts as a swipe rather than a tap. */
const SWIPE_MIN = 50

function loadSettings(): DeckSettings {
  try {
    const data = JSON.parse(window.localStorage.getItem(SETTINGS_KEY) ?? '{}') as Record<string, unknown>
    return {
      direction: data.direction === 'hu-en' ? 'hu-en' : 'en-hu',
      showDefinition: typeof data.showDefinition === 'boolean' ? data.showDefinition : DEFAULT_SETTINGS.showDefinition,
      showExample: typeof data.showExample === 'boolean' ? data.showExample : DEFAULT_SETTINGS.showExample,
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

function saveSettings(settings: DeckSettings) {
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch {
    // Private mode or blocked storage: the settings just aren't remembered.
  }
}

function shuffled<T>(items: T[]): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export type WordsView = 'list' | 'cards'

/** List or card view of a list's words, remembered per page under `storageKey`. */
export function useWordsView(storageKey: string): [WordsView, (view: WordsView) => void] {
  const [view, setView] = useState<WordsView>(() => {
    try {
      return window.localStorage.getItem(storageKey) === 'cards' ? 'cards' : 'list'
    } catch {
      return 'list'
    }
  })
  function change(next: WordsView) {
    setView(next)
    try {
      window.localStorage.setItem(storageKey, next)
    } catch {
      // Not remembered; the switch still works.
    }
  }
  return [view, change]
}

const segment = (active: boolean) =>
  `rounded-md px-3 py-1 text-sm ${
    active ? 'bg-[var(--teal-accent-soft)] font-medium text-foreground' : 'text-muted-foreground hover:text-foreground'
  }`

/** Two-way switch between the page's list/table and the card view. */
export function WordsViewToggle({
  view,
  onChange,
  listLabel,
}: {
  view: WordsView
  onChange: (view: WordsView) => void
  listLabel: string
}) {
  const { t } = useLanguage()
  return (
    <div role="group" aria-label={t('fcViewLabel')} className="inline-flex rounded-lg border border-border bg-card p-0.5">
      <button type="button" onClick={() => onChange('list')} aria-pressed={view === 'list'} className={segment(view === 'list')}>
        {listLabel}
      </button>
      <button type="button" onClick={() => onChange('cards')} aria-pressed={view === 'cards'} className={segment(view === 'cards')}>
        {t('fcViewCards')}
      </button>
    </div>
  )
}

function SpeakButton({ label, onSpeak, hidden }: { label: string; onSpeak: () => void; hidden: boolean }) {
  return (
    <button
      type="button"
      tabIndex={hidden ? -1 : undefined}
      onClick={(e) => {
        e.stopPropagation()
        onSpeak()
      }}
      aria-label={label}
      title={label}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"
    >
      <SpeakerIcon className="h-4 w-4" />
    </button>
  )
}

const toolButton =
  'rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-40'
const chip = (on: boolean) =>
  `rounded-full border px-3 py-1 text-sm ${
    on
      ? 'border-[var(--teal-accent)] bg-[var(--teal-accent-soft)] text-foreground'
      : 'border-border text-muted-foreground hover:text-foreground'
  }`

/**
 * Flip cards for a word list: one card at a time, tap (or Space) to flip, swipe or arrow keys
 * to move on. Sorting a card into "I know it" / "Still learning" moves to the next one; at the
 * end of the deck the learner can go through just the words they're still learning.
 */
export default function FlashcardDeck({
  cards,
  targetLanguage = 'en',
  review,
}: {
  cards: Flashcard[]
  /** The list's language: Danish cards speak with a da-DK voice. */
  targetLanguage?: TargetLanguage
  /** Teacher/admin accounts on non-English lists: the review toggle on the back face. */
  review?: { busy: boolean; onChange: (id: string, reviewed: boolean) => void }
}) {
  const { t } = useLanguage()
  const speechLocale = speechLocaleFor(targetLanguage)
  const speech = useSpeechSynthesis('female', 'us', speechLocale)
  // No voice for the list's language: hide the speakers rather than play the wrong voice.
  const noVoice = speechLocale !== undefined && speech.hasVoice === false
  const canSpeak = speech.supported && !noVoice
  const [settings, setSettings] = useState<DeckSettings>(loadSettings)
  const ids = useMemo(() => cards.map((c) => c.id), [cards])
  const idsKey = ids.join('|')
  const byId = useMemo(() => new Map(cards.map((c) => [c.id, c])), [cards])
  const [round, setRound] = useState<string[]>(ids)
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [known, setKnown] = useState<Set<string>>(() => new Set())
  const [learning, setLearning] = useState<Set<string>>(() => new Set())
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const swiped = useRef(false)

  // Another set of words: start over.
  useEffect(() => {
    setRound(ids)
    setIndex(0)
    setFlipped(false)
    setKnown(new Set())
    setLearning(new Set())
  }, [idsKey])

  function update(patch: Partial<DeckSettings>) {
    setSettings((s) => {
      const next = { ...s, ...patch }
      saveSettings(next)
      return next
    })
  }

  const done = index >= round.length
  const card = done ? null : byId.get(round[index]) ?? null

  function goTo(i: number) {
    setIndex(i)
    setFlipped(false)
  }
  const next = () => goTo(Math.min(index + 1, round.length))
  const prev = () => index > 0 && goTo(index - 1)
  const flip = () => card && setFlipped((f) => !f)

  function mark(knowIt: boolean) {
    if (!card) return
    const id = card.id
    setKnown((s) => {
      const n = new Set(s)
      if (knowIt) n.add(id)
      else n.delete(id)
      return n
    })
    setLearning((s) => {
      const n = new Set(s)
      if (knowIt) n.delete(id)
      else n.add(id)
      return n
    })
    next()
  }

  function shuffle() {
    setRound((r) => shuffled(r))
    goTo(0)
  }

  const stillLearning = round.filter((id) => !known.has(id))

  function repeatLearning() {
    setRound(stillLearning)
    goTo(0)
  }

  function restartAll() {
    setRound(ids)
    setKnown(new Set())
    setLearning(new Set())
    goTo(0)
  }

  // The keyboard handler is registered once; it always calls this render's actions.
  const keys = useRef({ flip, next, prev, mark })
  keys.current = { flip, next, prev, mark }
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.altKey || e.ctrlKey || e.metaKey) return
      const el = e.target as HTMLElement | null
      if (el && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName))) return
      const k = keys.current
      if (e.key === ' ') k.flip()
      else if (e.key === 'ArrowRight') k.next()
      else if (e.key === 'ArrowLeft') k.prev()
      else if (e.key === '1') k.mark(false)
      else if (e.key === '2') k.mark(true)
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (cards.length === 0) return <p className="text-sm text-muted-foreground">{t('fcNoCards')}</p>

  const say = (text: string) => speech.speak(text)
  const hearWord = t('vlSpeak')

  /** Danish extras on the back: the respelling and a verb's four forms. */
  function backExtras(c: Flashcard): ReactNode {
    const forms = c.verbForms && c.verbForms.length > 0 ? c.verbForms : null
    if (!c.pronunciationHint && !forms) return null
    return (
      <>
        {c.pronunciationHint && (
          <p className="text-sm text-muted-foreground" title={t('fcPronunciation')}>
            <span className="sr-only">{t('fcPronunciation')}: </span>[{c.pronunciationHint}]
          </p>
        )}
        {forms && (
          <p className="text-sm text-foreground">
            <span className="text-muted-foreground">{t('fcVerbForms')}: </span>
            {forms.join(' · ')}
          </p>
        )}
      </>
    )
  }

  /** The two faces' contents for the current direction and options. */
  function faces(c: Flashcard): { front: ReactNode; back: ReactNode } {
    const meaning = c.meaningHu ?? c.definitionEn
    const meaningText = meaning ?? <em className="text-base text-muted-foreground">{t('vcMeaningPending')}</em>
    // The definition is its own line only when the Hungarian meaning is the main text.
    const definition = settings.showDefinition && c.meaningHu && c.definitionEn ? c.definitionEn : null
    const exampleLine = settings.showExample && c.exampleEn ? (
      <div className="flex items-start justify-center gap-2">
        <p className="text-sm italic text-muted-foreground">{c.exampleEn}</p>
        {canSpeak && <SpeakButton label={t('fcHearExample')} onSpeak={() => say(c.exampleEn!)} hidden={!flipped} />}
      </div>
    ) : null
    const example =
      exampleLine && c.exampleHu ? (
        <div className="space-y-1">
          {exampleLine}
          <p className="text-sm text-muted-foreground">{c.exampleHu}</p>
        </div>
      ) : (
        exampleLine
      )
    const term = displayTerm(c)
    const termLine = (big: boolean, hidden: boolean) => (
      <div className="flex items-center justify-center gap-3">
        <span className={big ? 'break-words text-3xl font-semibold text-foreground sm:text-4xl' : 'break-words text-sm font-medium text-muted-foreground'}>
          {term}
        </span>
        {canSpeak && <SpeakButton label={`${hearWord}: ${term}`} onSpeak={() => say(term)} hidden={hidden} />}
      </div>
    )

    if (settings.direction === 'en-hu') {
      return {
        front: termLine(true, flipped),
        back: (
          <>
            {termLine(false, !flipped)}
            {backExtras(c)}
            <p className="break-words text-2xl font-semibold text-foreground sm:text-3xl">{meaningText}</p>
            {definition && <p className="text-sm text-muted-foreground">{definition}</p>}
            {example}
          </>
        ),
      }
    }
    return {
      front: (
        <>
          <p className="break-words text-2xl font-semibold text-foreground sm:text-3xl">{meaningText}</p>
          {definition && <p className="text-sm text-muted-foreground">{definition}</p>}
        </>
      ),
      back: (
        <>
          {c.meaningHu && <p className="text-sm text-muted-foreground">{c.meaningHu}</p>}
          {termLine(true, !flipped)}
          {backExtras(c)}
          {example}
        </>
      ),
    }
  }

  const toolbar = (
    <div className="flex flex-wrap items-center gap-2">
      <div role="group" aria-label={t('fcDirectionLabel')} className="inline-flex rounded-lg border border-border bg-card p-0.5">
        <button
          type="button"
          onClick={() => update({ direction: 'en-hu' })}
          aria-pressed={settings.direction === 'en-hu'}
          title={t('fcDirEnHu')}
          className={segment(settings.direction === 'en-hu')}
        >
          EN → HU
        </button>
        <button
          type="button"
          onClick={() => update({ direction: 'hu-en' })}
          aria-pressed={settings.direction === 'hu-en'}
          title={t('fcDirHuEn')}
          className={segment(settings.direction === 'hu-en')}
        >
          HU → EN
        </button>
      </div>
      <button
        type="button"
        onClick={() => update({ showDefinition: !settings.showDefinition })}
        aria-pressed={settings.showDefinition}
        className={chip(settings.showDefinition)}
      >
        {t('fcShowDefinition')}
      </button>
      <button
        type="button"
        onClick={() => update({ showExample: !settings.showExample })}
        aria-pressed={settings.showExample}
        className={chip(settings.showExample)}
      >
        {t('fcShowExample')}
      </button>
      <button type="button" onClick={shuffle} disabled={round.length < 2} className={`${toolButton} ml-auto`}>
        ⤮ {t('fcShuffle')}
      </button>
      {noVoice && <p className="w-full text-xs text-muted-foreground">{t('vcNoDanishVoice')}</p>}
    </div>
  )

  const piles = (
    <p className="text-sm text-muted-foreground">
      <span className="text-emerald-700">✓ {t('fcKnow')}: {known.size}</span>
      {' · '}
      <span className="text-amber-700">↻ {t('fcLearning')}: {learning.size}</span>
    </p>
  )

  if (done || !card) {
    const knownInRound = round.length - stillLearning.length
    return (
      <div className="space-y-4">
        {toolbar}
        <div className="mx-auto max-w-xl space-y-4 rounded-2xl border border-border bg-background p-6 text-center">
          <p className="text-xl font-semibold text-foreground">{t('fcDoneTitle')}</p>
          <p className="text-sm text-muted-foreground">{t('fcDoneScore', { known: knownInRound, total: round.length })}</p>
          {piles}
          <div className="flex flex-wrap justify-center gap-2">
            {stillLearning.length > 0 ? (
              <button
                type="button"
                onClick={repeatLearning}
                className="rounded-lg bg-[var(--teal-accent)] px-5 py-2.5 text-sm font-semibold text-primary hover:bg-[var(--teal-accent-strong)]"
              >
                {t('fcRepeatLearning', { n: stillLearning.length })}
              </button>
            ) : (
              <p className="w-full text-sm text-foreground">{t('fcAllKnown')}</p>
            )}
            <button type="button" onClick={restartAll} className={toolButton}>
              {t('fcRestartAll')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const { front, back } = faces(card)

  return (
    <div className="space-y-4">
      {toolbar}

      <div className="mx-auto max-w-xl space-y-2">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm font-medium text-foreground">{t('fcCounter', { n: index + 1, total: round.length })}</p>
          {piles}
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-[var(--teal-accent)] transition-[width]" style={{ width: `${(index / round.length) * 100}%` }} />
        </div>
      </div>

      {/* Keyed by position so a new card starts face up instead of animating back. */}
      <div
        key={`${card.id}-${index}`}
        className="flashcard mx-auto max-w-xl cursor-pointer select-none"
        data-flipped={flipped || undefined}
        onClick={() => {
          if (swiped.current) {
            swiped.current = false
            return
          }
          flip()
        }}
        onTouchStart={(e) => {
          const p = e.touches[0]
          touchStart.current = { x: p.clientX, y: p.clientY }
          swiped.current = false
        }}
        onTouchEnd={(e) => {
          const s = touchStart.current
          touchStart.current = null
          if (!s) return
          const p = e.changedTouches[0]
          const dx = p.clientX - s.x
          const dy = p.clientY - s.y
          if (Math.abs(dx) < SWIPE_MIN || Math.abs(dx) < Math.abs(dy) * 1.5) return
          swiped.current = true
          if (dx < 0) next()
          else prev()
        }}
      >
        <div className="flashcard__inner">
          <div
            aria-hidden={flipped}
            className="flashcard__face flex min-h-[17rem] flex-col rounded-2xl border border-border bg-background p-5 text-center shadow-sm"
          >
            <div className="flex min-h-[1.5rem] justify-start">
              <LevelBadge level={card.cefrLevel} subtle />
            </div>
            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-4">{front}</div>
            <p className="text-xs text-muted-foreground">{t('fcTapToFlip')}</p>
          </div>
          <div
            aria-hidden={!flipped}
            className="flashcard__face flashcard__face--back flex min-h-[17rem] flex-col rounded-2xl border border-[var(--teal-accent)] bg-[var(--teal-accent-soft)] p-5 text-center shadow-sm"
          >
            <div className="flex min-h-[1.5rem] items-start justify-between gap-2">
              <LevelBadge level={card.cefrLevel} subtle />
              {targetLanguage !== 'en' &&
                card.reviewStatus &&
                (review ? (
                  <ReviewToggle
                    reviewed={card.reviewStatus === 'reviewed'}
                    disabled={review.busy || !flipped}
                    onChange={(reviewed) => review.onChange(card.id, reviewed)}
                  />
                ) : (
                  card.reviewStatus === 'needs_review' && <NeedsReviewBadge />
                ))}
            </div>
            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-4">{back}</div>
          </div>
        </div>
      </div>

      {/* Phones swipe instead of using the arrows, so the two sorting buttons get the whole row. */}
      <div className="mx-auto flex max-w-xl items-center justify-between gap-2">
        <button
          type="button"
          onClick={prev}
          disabled={index === 0}
          aria-label={t('fcPrev')}
          title={t('fcPrev')}
          className={`${toolButton} hidden sm:block`}
        >
          ←
        </button>
        <div className="grid flex-1 grid-cols-2 gap-2 sm:flex sm:flex-none sm:justify-center">
          <button
            type="button"
            onClick={() => mark(false)}
            className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100"
          >
            ↻ {t('fcLearning')}
          </button>
          <button
            type="button"
            onClick={() => mark(true)}
            className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-100"
          >
            ✓ {t('fcKnow')}
          </button>
        </div>
        <button type="button" onClick={next} aria-label={t('fcNext')} title={t('fcNext')} className={`${toolButton} hidden sm:block`}>
          →
        </button>
      </div>
      <p className="text-center text-xs text-muted-foreground sm:hidden">{t('fcSwipeHint')}</p>
      <p className="hidden text-center text-xs text-muted-foreground sm:block">{t('fcKeysHint')}</p>
    </div>
  )
}
