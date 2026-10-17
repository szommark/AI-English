import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { useLanguage } from '../lib/i18n'
import { letterStyle, WORDMARK_LETTERS } from './Wordmark'

const SEEN_KEY = 'avalon:intro-seen'
/** When the overlay starts fading out, from the moment the letters are measured (ms). */
const HOLD_MS = 4600
const HOLD_REDUCED_MS = 1800
const FADE_MS = 600

/**
 * The wordmark starts as the consonant skeleton "AVLN"; the letters part and the missing a and o
 * (`added` in WORDMARK_LETTERS) fade into the gaps to spell AVaLoN, spaced exactly like the header.
 */
const LETTERS = WORDMARK_LETTERS

/** True once per browser session: the intro plays on the first visit to the home page only. */
export function shouldShowBrandIntro(): boolean {
  try {
    return sessionStorage.getItem(SEEN_KEY) !== '1'
  } catch {
    return false
  }
}

function markSeen() {
  try {
    sessionStorage.setItem(SEEN_KEY, '1')
  } catch {
    // Private mode etc.: the intro just plays again next time.
  }
}

/** Full-screen Avalon intro shown over the home page; click, Enter, Space or Escape skips it. */
export default function BrandIntro({ onDone }: { onDone: () => void }) {
  const { t } = useLanguage()
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([])
  /** Per-letter start offset (px) so the four skeleton letters begin closed up and centred. */
  const [shifts, setShifts] = useState<number[] | null>(null)
  const [leaving, setLeaving] = useState(false)

  const leave = useCallback(() => setLeaving(true), [])

  // Measure once the brand font is in, so the closed-up start position matches the real glyphs.
  useLayoutEffect(() => {
    let cancelled = false
    const fontReady = document.fonts?.load('600 1em "EB Garamond"').catch(() => undefined) ?? Promise.resolve()
    fontReady.then(() => {
      if (cancelled) return
      // Final (laid-out) boxes; transforms are not applied yet, so these are the AVaLoN positions.
      const r = letterRefs.current.map((el) => el!.getBoundingClientRect())
      // Closed up, V is followed straight by L and L by N (the font has no V–L or L–N kerning).
      const startL = r[1].right
      const startN = startL + r[3].width
      const centre = (r[5].right - (startN + r[5].width)) / 2
      setShifts([centre, centre, 0, startL - r[3].left + centre, 0, startN - r[5].left + centre])
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    markSeen()
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        setLeaving(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  useEffect(() => {
    if (!shifts) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const id = window.setTimeout(leave, reduced ? HOLD_REDUCED_MS : HOLD_MS)
    return () => window.clearTimeout(id)
  }, [shifts, leave])

  useEffect(() => {
    if (!leaving) return
    const id = window.setTimeout(onDone, FADE_MS)
    return () => window.clearTimeout(id)
  }, [leaving, onDone])

  return (
    <div
      className="brand-intro"
      data-ready={shifts ? '' : undefined}
      data-leaving={leaving ? '' : undefined}
      onClick={leave}
    >
      <div className="brand-intro__stage">
        <h1 className="brand-intro__word" aria-label="AVaLoN">
          {LETTERS.map((l, i) => (
            <span
              key={i}
              ref={(el) => {
                letterRefs.current[i] = el
              }}
              aria-hidden="true"
              className={l.added ? 'brand-intro__letter brand-intro__letter--added' : 'brand-intro__letter'}
              style={{ ...letterStyle(l.kern), '--shift': `${shifts?.[i] ?? 0}px`, '--i': i } as CSSProperties}
            >
              {l.ch}
            </span>
          ))}
        </h1>
        <div className="brand-intro__rule" aria-hidden="true" />
        <p className="brand-intro__subtitle">{t('introSubtitle')}</p>
        <p className="brand-intro__slogan">English is a tool. The goal is to connect.</p>
      </div>

      <button
        type="button"
        autoFocus
        className="brand-intro__skip"
        onClick={(e) => {
          e.stopPropagation()
          leave()
        }}
      >
        {t('introSkip')}
      </button>
    </div>
  )
}
