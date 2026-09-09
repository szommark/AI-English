const palettes = [
  { from: '#e0f2fe', to: '#bae6fd', accent: '#0284c7' },
  { from: '#fef3c7', to: '#fde68a', accent: '#d97706' },
  { from: '#dcfce7', to: '#bbf7d0', accent: '#16a34a' },
  { from: '#ede9fe', to: '#ddd6fe', accent: '#7c3aed' },
  { from: '#ffe4e6', to: '#fecdd3', accent: '#e11d48' },
]

const shapes: ((accent: string) => React.ReactNode)[] = [
  (accent) => <circle cx="50" cy="50" r="26" fill={accent} opacity="0.85" />,
  (accent) => <rect x="26" y="26" width="48" height="48" rx="12" fill={accent} opacity="0.85" />,
  (accent) => <path d="M50 22 L78 74 L22 74 Z" fill={accent} opacity="0.85" />,
  (accent) => <path d="M50 20 L80 50 L50 80 L20 50 Z" fill={accent} opacity="0.85" />,
]

function hashSeed(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

/** Deterministic per `seed` — the same title always renders the same placeholder. */
export default function PlaceholderTileArt({ seed }: { seed: string }) {
  const hash = hashSeed(seed)
  const palette = palettes[hash % palettes.length]
  const shape = shapes[Math.floor(hash / palettes.length) % shapes.length]
  const gradientId = `placeholder-tile-gradient-${hash}`

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={palette.from} />
          <stop offset="100%" stopColor={palette.to} />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#${gradientId})`} />
      {shape(palette.accent)}
    </svg>
  )
}
