import { useEffect, useState, type ReactNode } from 'react'
import { Check, Loader2, Volume2 } from 'lucide-react'
import { getPhonemePractice } from '../../data/phonemePractice'
import { useLanguage } from '../../lib/i18n'
import { playSoundClip, stopSoundClip } from '../../lib/soundClip'
import ScoreBar from '../PronunciationPractice/ScoreBar'

// The shared look of the sound sheet's tabs (How to make it, Listening, Pronunciation): every tab
// sits on one SoundSheetCard, headed by the SoundSymbol, with StepMarkers for the tabs that have steps
// and ResultBars for their overall result.

/** The card every sound-sheet tab sits on; `active` darkens the border (e.g. while the mic records). */
export default function SoundSheetCard({
  active = false,
  className = '',
  children,
}: {
  active?: boolean
  className?: string
  children: ReactNode
}) {
  return (
    <section
      className={`rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)] sm:p-8 ${
        active ? 'border-rose-400' : 'border-rose-200'
      } ${className}`}
    >
      {children}
    </section>
  )
}

export const speakerButtonClass =
  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground hover:bg-secondary disabled:opacity-50'

/** The sound's symbol in large type with a speaker that plays the lone-sound clip (when the sound has one). */
export function SoundSymbol({
  phonemeId,
  ipaSymbol,
  disabled = false,
}: {
  phonemeId: string
  ipaSymbol: string
  disabled?: boolean
}) {
  const { t } = useLanguage()
  const [clipState, setClipState] = useState<'idle' | 'loading' | 'playing' | 'error'>('idle')
  const hasClip = Boolean(getPhonemePractice(phonemeId))

  useEffect(() => () => stopSoundClip(), [])

  async function playSound() {
    setClipState('loading')
    try {
      await playSoundClip(phonemeId, () => setClipState('playing'))
      setClipState('idle')
    } catch (err) {
      console.error('Sound clip failed:', err)
      setClipState('error')
    }
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-3">
        <span className="text-3xl font-semibold text-foreground">/{ipaSymbol}/</span>
        {hasClip && (
          <button
            type="button"
            onClick={playSound}
            disabled={disabled || clipState === 'loading' || clipState === 'playing'}
            aria-label={t('sndPlaySound')}
            title={t('sndPlaySound')}
            className={speakerButtonClass}
          >
            {clipState === 'loading' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Volume2 className={`h-4 w-4 ${clipState === 'playing' ? 'text-rose-600' : ''}`} />
            )}
          </button>
        )}
      </div>
      {clipState === 'error' && <p className="text-sm text-red-600">{t('sndClipError')}</p>}
    </div>
  )
}

export interface StepMarker {
  label: string
  done?: boolean
  /** Shown after the label once there is something to show, e.g. "67%" or "2/3". */
  detail?: string
}

/**
 * The rounded step markers: numbered steps, then an unnumbered final one (the overall result),
 * which is current when `current === steps.length`.
 */
export function StepMarkers({ steps, current, finalLabel }: { steps: StepMarker[]; current: number; finalLabel: string }) {
  const showingFinal = current >= steps.length
  return (
    <ol className="flex flex-wrap items-center gap-2 text-sm">
      {steps.map((step, i) => {
        const active = i === current
        return (
          <li
            key={i}
            aria-current={active ? 'step' : undefined}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 ${
              active
                ? 'border-rose-300 bg-rose-50 font-medium text-rose-700'
                : step.done
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-border text-muted-foreground'
            }`}
          >
            {step.done && !active && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
            {i + 1}. {step.label}
            {step.detail && <span className="tabular-nums">· {step.detail}</span>}
          </li>
        )
      })}
      <li
        aria-current={showingFinal ? 'step' : undefined}
        className={`rounded-full border px-3 py-1 ${
          showingFinal ? 'border-rose-300 bg-rose-50 font-medium text-rose-700' : 'border-border text-muted-foreground'
        }`}
      >
        {finalLabel}
      </li>
    </ol>
  )
}

export interface ResultRow {
  label: string
  /** 0–100; null leaves the row without a bar. */
  score: number | null
  /** Shown under the bar, e.g. the sounds that went wrong in that step. */
  below?: ReactNode
}

/** The overall result: each step's percentage bar, then the overall bar, then `children` (buttons). */
export function ResultBars({ rows, overall, children }: { rows: ResultRow[]; overall: number | null; children?: ReactNode }) {
  const { t } = useLanguage()
  return (
    <div className="space-y-5 border-t border-border pt-5">
      <h3 className="text-base font-semibold text-foreground">{t('sndOverall')}</h3>
      <ul className="space-y-2">
        {rows.map((row, i) => (
          <li key={i} className="grid grid-cols-[8rem_1fr] items-center gap-x-3 gap-y-1.5 text-sm sm:grid-cols-[10rem_1fr]">
            <span className="text-foreground">
              {i + 1}. {row.label}
            </span>
            <div className="max-w-sm">{row.score !== null && <ScoreBar score={row.score} label={row.label} />}</div>
            {row.below && <div className="col-start-2">{row.below}</div>}
          </li>
        ))}
        {overall !== null && (
          <li className="grid grid-cols-[8rem_1fr] items-center gap-3 border-t border-border pt-2 text-sm font-semibold sm:grid-cols-[10rem_1fr]">
            <span className="text-foreground">{t('sndOverallScore')}</span>
            <div className="max-w-sm">
              <ScoreBar score={overall} label={t('sndOverallScore')} />
            </div>
          </li>
        )}
      </ul>
      {children}
    </div>
  )
}
