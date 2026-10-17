import type { CSSProperties } from 'react'

/**
 * "AVaLoN" letter by letter: the four capitals of the "AVLN" skeleton, and the lowercase a and o
 * (`added`) that complete it. `kern` is the space before the letter in em, tuned for EB Garamond
 * 600 so the lowercase letters sit as close to their capitals as the capitals do to each other
 * (the font's own kerning only covers A–V and V–a). Shared with the intro (BrandIntro.tsx), which
 * draws each letter separately, so font kerning is switched off and these values apply instead.
 */
export const WORDMARK_LETTERS = [
  { ch: 'A', added: false, kern: 0 },
  { ch: 'V', added: false, kern: -0.13 },
  { ch: 'a', added: true, kern: -0.18 },
  { ch: 'L', added: false, kern: -0.01 },
  { ch: 'o', added: true, kern: -0.015 },
  { ch: 'N', added: false, kern: -0.07 },
] as const

export function letterStyle(kern: number): CSSProperties {
  return kern ? { marginLeft: `${kern}em` } : {}
}

/** The brand name as "AVaLoN": capitals in navy, the lowercase a and o in gold. */
export default function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span
      className={`font-brand font-semibold text-[var(--brand-navy)] [font-kerning:none] ${className}`}
    >
      {WORDMARK_LETTERS.map((l, i) => (
        <span
          key={i}
          className={l.added ? 'text-[var(--brand-gold)]' : undefined}
          style={letterStyle(l.kern)}
        >
          {l.ch}
        </span>
      ))}
    </span>
  )
}
