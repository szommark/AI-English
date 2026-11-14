import type { CSSProperties, ReactNode } from 'react'

/**
 * Art Deco pieces for the club (/club and the home banner), after the club poster: deep green,
 * gold double frames with stepped corners, a sunburst fan and diamond dividers.
 */

export const DECO = {
  green: '#0f2a24',
  gold: '#c9a227',
  goldLight: '#e9d28a',
  cream: '#f6ecd2',
}

const CORNER_ROTATION = [0, 90, 180, 270]
const CORNER_POSITION = ['left-1.5 top-1.5', 'right-1.5 top-1.5', 'right-1.5 bottom-1.5', 'left-1.5 bottom-1.5']

function Corner({ index, size }: { index: number; size: number }) {
  const style: CSSProperties = { transform: `rotate(${CORNER_ROTATION[index]}deg)`, width: size, height: size }
  return (
    <svg viewBox="0 0 28 28" className={`pointer-events-none absolute ${CORNER_POSITION[index]}`} style={style} aria-hidden="true">
      <g fill="none" stroke={DECO.gold} strokeWidth="1.5">
        <path d="M1 27V1h26" />
        <path d="M6 22V6h16" />
        <path d="M11 17v-6h6" />
      </g>
    </svg>
  )
}

/** Deep green panel in a gold double frame with stepped corners. */
export function DecoFrame({
  children,
  className = '',
  innerClassName = 'p-6 sm:p-10',
  cornerSize = 28,
}: {
  children: ReactNode
  className?: string
  innerClassName?: string
  cornerSize?: number
}) {
  return (
    <div className={`relative border border-[#c9a227] bg-[#0f2a24] p-1.5 text-[#f6ecd2] shadow-lg ${className}`}>
      <div className={`relative border border-[rgba(201,162,39,0.55)] ${innerClassName}`}>
        {CORNER_ROTATION.map((_, i) => (
          <Corner key={i} index={i} size={cornerSize} />
        ))}
        {children}
      </div>
    </div>
  )
}

/** The sunburst fan from the poster's crest. */
export function DecoFan({ className = '' }: { className?: string }) {
  const rays = Array.from({ length: 11 }, (_, i) => {
    const angle = Math.PI - (i + 1) * (Math.PI / 12)
    return { x: 60 + 54 * Math.cos(angle), y: 58 - 54 * Math.sin(angle) }
  })
  return (
    <svg viewBox="0 0 120 60" className={className} aria-hidden="true">
      <g stroke={DECO.gold} strokeWidth="2" fill="none">
        <path d="M4 58a56 56 0 0 1 112 0" />
        {rays.map((r, i) => (
          <line key={i} x1="60" y1="58" x2={r.x} y2={r.y} />
        ))}
      </g>
      <path d="M44 58a16 16 0 0 1 32 0z" fill={DECO.gold} />
    </svg>
  )
}

/** Gold line, diamond, gold line. */
export function DecoDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`} aria-hidden="true">
      <span className="h-px flex-1 bg-[#c9a227]" />
      <span className="h-2 w-2 rotate-45 bg-[#c9a227]" />
      <span className="h-px flex-1 bg-[#c9a227]" />
    </div>
  )
}
