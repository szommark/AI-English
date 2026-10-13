import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Maximize, X } from 'lucide-react'
import {
  answersMatch,
  buildGapGroups,
  buildWordBank,
  choiceOptions,
  defaultInstructions,
  gapHint,
  groupsByWord,
  lineSegments,
  tokenizeLyrics,
  youTubeId,
  type GapGroup,
  type LyricsActivityInput,
} from '../../../lib/lyricsGapFill'
import { useLanguage } from '../../../lib/i18n'
import { secondaryButtonClass } from '../ui'

const TEXT_SIZES = ['text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl']

/**
 * Projector view of the activity: the class listens, the teacher reveals gaps one by one
 * (or all at once), or types the class's answers in and checks them.
 */
export default function ClassMode({ activity, onClose }: { activity: LyricsActivityInput; onClose: () => void }) {
  const { t } = useLanguage()
  const rootRef = useRef<HTMLDivElement>(null)
  const { content } = activity
  const { sheet } = content
  const seed = content.auto.seed

  const doc = useMemo(() => tokenizeLyrics(content.lyrics), [content.lyrics])
  const groups = useMemo(() => buildGapGroups(doc, content.gaps, sheet.phraseGaps), [doc, content.gaps, sheet.phraseGaps])
  const byWord = useMemo(() => groupsByWord(groups), [groups])
  const bank = useMemo(() => (sheet.answerMode === 'wordBank' ? buildWordBank(groups, sheet, seed) : []), [groups, sheet, seed])
  const videoId = youTubeId(activity.videoUrl)

  const [revealed, setRevealed] = useState<Set<number>>(new Set())
  const [typing, setTyping] = useState(false)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [checked, setChecked] = useState(false)
  const [size, setSize] = useState(1)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !document.fullscreenElement) onClose()
    }
    window.addEventListener('keydown', onKey)
    // The page behind shouldn't scroll while the overlay is open.
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
    }
  }, [onClose])

  const toggle = (n: number) =>
    setRevealed((r) => {
      const next = new Set(r)
      if (next.has(n)) next.delete(n)
      else next.add(n)
      return next
    })
  // Reads the latest state, so quick repeated clicks reveal one more gap each.
  const revealNext = () =>
    setRevealed((r) => {
      const next = groups.find((g) => !r.has(g.number))
      return next ? new Set(r).add(next.number) : r
    })
  const correctCount = groups.filter((g) => answersMatch(answers[g.number] ?? '', g.answer)).length

  function gapView(g: GapGroup) {
    const number = sheet.numberGaps ? <sup className="mr-1 text-[0.55em] font-bold">{g.number}</sup> : null
    if (typing) {
      const right = checked && answersMatch(answers[g.number] ?? '', g.answer)
      const wrong = checked && !right
      return (
        <span className="mx-1 inline-flex items-baseline">
          {number}
          <input
            value={answers[g.number] ?? ''}
            onChange={(e) => {
              setAnswers((a) => ({ ...a, [g.number]: e.target.value }))
              setChecked(false)
            }}
            aria-label={`${g.number}`}
            style={{ width: `${Math.max(4, g.answer.length + 2)}ch` }}
            className={`rounded-md border-2 bg-card px-1 text-center outline-none focus:border-[var(--teal-accent)] ${
              right ? 'border-emerald-500' : wrong ? 'border-red-400' : 'border-border'
            }`}
          />
          {wrong && <span className="ml-1 text-[0.6em] text-red-600">{g.answer}</span>}
        </span>
      )
    }
    const shown = revealed.has(g.number)
    const options = sheet.answerMode === 'choice' ? choiceOptions(g, groups, content.distractors, sheet.choiceCount, seed) : null
    return (
      <button
        type="button"
        onClick={() => toggle(g.number)}
        className={`mx-1 rounded-lg border-2 px-2 align-baseline ${
          shown
            ? 'border-[var(--teal-accent-border)] bg-[var(--teal-accent-soft)] font-semibold text-[var(--teal-accent-strong)]'
            : 'border-dashed border-border text-muted-foreground hover:bg-secondary'
        }`}
      >
        {number}
        {options
          ? options.map((o, i) => (
              <span key={i} className={shown && o === g.answer ? 'underline decoration-2' : shown ? 'opacity-40' : ''}>
                {i > 0 && ' / '}
                {o}
              </span>
            ))
          : shown
            ? g.answer
            : gapHint(g.answer, sheet.hintStyle)}
      </button>
    )
  }

  // Portalled to <body>: outside the page's layout (space-y margins) and above the sticky header.
  return createPortal(
    <div ref={rootRef} role="dialog" aria-modal="true" aria-label={t('lyClassMode')} className="fixed inset-0 z-50 overflow-y-auto bg-background">
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-2 border-b border-border bg-background px-4 py-3">
        <h2 className="mr-auto font-semibold text-foreground">
          {activity.title}
          {activity.artist && <span className="font-normal text-muted-foreground"> — {activity.artist}</span>}
        </h2>
        {typing ? (
          <>
            <button type="button" onClick={() => setChecked(true)} className={secondaryButtonClass}>
              {t('lyClassCheck')}
            </button>
            {checked && <span className="text-sm font-medium text-foreground">{t('lyClassScore', { n: correctCount, total: groups.length })}</span>}
          </>
        ) : (
          <>
            <button type="button" onClick={revealNext} className={secondaryButtonClass}>
              {t('lyClassReveal')}
            </button>
            <button type="button" onClick={() => setRevealed(new Set(groups.map((g) => g.number)))} className={secondaryButtonClass}>
              {t('lyClassRevealAll')}
            </button>
            <button type="button" onClick={() => setRevealed(new Set())} className={secondaryButtonClass}>
              {t('lyClassHideAll')}
            </button>
          </>
        )}
        <label className="flex items-center gap-1.5 text-sm text-foreground">
          <input
            type="checkbox"
            checked={typing}
            onChange={(e) => {
              setTyping(e.target.checked)
              setChecked(false)
            }}
          />
          {t('lyClassTyping')}
        </label>
        <span className="flex items-center gap-1" role="group" aria-label={t('lyClassTextSize')}>
          <button type="button" onClick={() => setSize((s) => Math.max(0, s - 1))} className={secondaryButtonClass} aria-label={`${t('lyClassTextSize')} −`}>
            A−
          </button>
          <button
            type="button"
            onClick={() => setSize((s) => Math.min(TEXT_SIZES.length - 1, s + 1))}
            className={secondaryButtonClass}
            aria-label={`${t('lyClassTextSize')} +`}
          >
            A+
          </button>
        </span>
        <button
          type="button"
          onClick={() => rootRef.current?.requestFullscreen?.().catch(() => {})}
          className={secondaryButtonClass}
          aria-label={t('lyClassFullscreen')}
          title={t('lyClassFullscreen')}
        >
          <Maximize className="h-4 w-4" />
        </button>
        <button type="button" onClick={onClose} className={secondaryButtonClass} aria-label={t('lyClassClose')} title={t('lyClassClose')}>
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {sheet.instructions.trim() || defaultInstructions(sheet.answerMode)} {!typing && t('lyClassHint')}
          </p>
          {bank.length > 0 && (
            <div className="flex flex-wrap gap-x-5 gap-y-1 rounded-xl border-2 border-foreground px-4 py-3 text-lg font-medium text-foreground">
              {bank.map((w) => (
                <span key={w}>{w}</span>
              ))}
            </div>
          )}
          <div className={`${TEXT_SIZES[size]} leading-[2.1] text-foreground`}>
            {doc.lines.map((line, i) => {
              if (line.kind === 'blank') return <div key={i} className="h-4" />
              if (line.kind === 'header') {
                return (
                  <div key={i} className="text-[0.7em] font-semibold italic text-muted-foreground">
                    {line.tokens[0].text}
                  </div>
                )
              }
              return (
                <div key={i}>
                  {lineSegments(line, byWord).map((s, k) =>
                    s.kind === 'gap' ? <span key={k}>{gapView(s.group)}</span> : <span key={k} className="whitespace-pre-wrap">{s.text}</span>,
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {(videoId || activity.videoUrl) && (
          <div className="lg:sticky lg:top-20 lg:self-start">
            {videoId ? (
              <div className="aspect-video overflow-hidden rounded-xl border border-border bg-black">
                <iframe
                  className="h-full w-full"
                  src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                  title={activity.title}
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <a href={activity.videoUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline break-all">
                {activity.videoUrl}
              </a>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
