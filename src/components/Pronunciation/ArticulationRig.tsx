import type { Articulation } from '../../data/phonemes'

// One reusable, parametrized "how do I make this sound" diagram — a simplified mouth-cavity
// cross-section (profile) plus a front view, driven entirely by the phoneme's own
// articulation data (place/manner/voicing for consonants, tonguePosition/lipRounding for
// vowels). Not anatomically precise — a stylized teaching diagram, same "placeholder
// quality, needs review" spirit as the rest of the chart's content.
//
// Phase 3 prototypes this on the Critical tier (θ, ð, æ, ə, w, r, dark-l, ɜr, ŋ) per
// phonetic-sound-chart-design.md §6/§11; the component itself works for any entry with
// place/manner or tonguePosition set, so widening the rollout later is a gating change in
// PhonemeDetailPage, not a rebuild here.

type Place = NonNullable<Articulation['place']>
type TonguePosition = NonNullable<Articulation['tonguePosition']>

// Front (lips/opening) is toward low x, back of the mouth (throat) toward high x —
// matches the vowel trapezoid's own front/back convention.
const CONSONANT_PEAK: Record<Place, { x: number; y: number }> = {
  bilabial: { x: 68, y: 115 },
  labiodental: { x: 73, y: 113 },
  dental: { x: 55, y: 85 },
  alveolar: { x: 70, y: 65 },
  postalveolar: { x: 85, y: 58 },
  palatal: { x: 100, y: 50 },
  velar: { x: 128, y: 52 },
  glottal: { x: 100, y: 118 },
}

const VOWEL_PEAK: Record<TonguePosition, { x: number; y: number }> = {
  'high-front': { x: 60, y: 50 },
  'mid-front': { x: 63, y: 78 },
  'low-front': { x: 66, y: 106 },
  central: { x: 95, y: 86 },
  'high-back': { x: 135, y: 50 },
  'mid-back': { x: 132, y: 78 },
  'low-back': { x: 128, y: 106 },
}

// How far the tongue backs off from a full seal, by manner — 0 means "touches", larger
// means a narrow gap (fricative) or a loose approach (approximant). Vowels have no manner.
const MANNER_OPEN_OFFSET: Partial<Record<NonNullable<Articulation['manner']>, number>> = {
  stop: 0,
  nasal: 0,
  lateral: 3,
  affricate: 2,
  fricative: 7,
  approximant: 12,
}

const TONGUE_TIP = { x: 46, y: 122 }
const TONGUE_ROOT = { x: 158, y: 120 }
const TONGUE_THICKNESS = 16

function tonguePeak(articulation: Articulation): { x: number; y: number } {
  if (articulation.place) {
    const base = CONSONANT_PEAK[articulation.place]
    const offset = articulation.place === 'glottal' ? 0 : (MANNER_OPEN_OFFSET[articulation.manner ?? 'approximant'] ?? 6)
    return { x: base.x, y: base.y + offset }
  }
  if (articulation.tonguePosition) return VOWEL_PEAK[articulation.tonguePosition]
  return { x: 95, y: 100 }
}

// Two quadratic segments that pass exactly through the peak, with control points aligned
// to the tip/root x — this stays a smooth hump no matter how close the peak sits to either
// end (a fixed-offset bezier degenerates into a pinched wedge for a near peak, e.g. dental).
function tonguePath(peak: { x: number; y: number }): string {
  const { x: tx, y: ty } = TONGUE_TIP
  const { x: rx, y: ry } = TONGUE_ROOT
  const bottomY = peak.y + TONGUE_THICKNESS
  return `M ${tx} ${ty}
    Q ${tx} ${peak.y}, ${peak.x} ${peak.y}
    Q ${rx} ${peak.y}, ${rx} ${ry}
    L ${rx - 6} ${ry + 8}
    Q ${rx} ${bottomY}, ${peak.x} ${bottomY}
    Q ${tx} ${bottomY}, ${tx + 6} ${ty + 8}
    Z`
}

type MouthShape = 'closed' | 'rounded' | 'labiodental' | 'dental' | 'open'

function mouthShape(articulation: Articulation): MouthShape {
  if (articulation.place === 'dental') return 'dental'
  if (articulation.place === 'labiodental') return 'labiodental'
  if (articulation.place === 'bilabial' && (articulation.manner === 'stop' || articulation.manner === 'nasal')) {
    return 'closed'
  }
  if (articulation.lipRounding === 'rounded') return 'rounded'
  return 'open'
}

function Teeth({ cx, y, count = 5, width = 34 }: { cx: number; y: number; count?: number; width?: number }) {
  const step = width / count
  const start = cx - width / 2
  return (
    <g className="fill-foreground/60">
      {Array.from({ length: count }).map((_, i) => (
        <rect key={i} x={start + i * step} y={y} width={step * 0.7} height={7} rx={1} />
      ))}
    </g>
  )
}

function FrontMouth({ shape }: { shape: MouthShape }) {
  const cx = 70
  const cy = 96
  if (shape === 'closed') {
    return <rect x={cx - 24} y={cy - 3} width={48} height={6} rx={3} className="fill-rose-300 stroke-rose-400" />
  }
  if (shape === 'rounded') {
    return <circle cx={cx} cy={cy} r={13} className="fill-card stroke-rose-300" strokeWidth={3} />
  }
  if (shape === 'labiodental') {
    return (
      <g>
        <ellipse cx={cx} cy={cy} rx={20} ry={11} className="fill-card stroke-rose-300" strokeWidth={2.5} />
        <Teeth cx={cx} y={cy - 10} count={5} width={30} />
        <rect x={cx - 16} y={cy + 2} width={32} height={7} rx={3} className="fill-rose-300" />
      </g>
    )
  }
  if (shape === 'dental') {
    return (
      <g>
        <ellipse cx={cx} cy={cy} rx={21} ry={13} className="fill-card stroke-rose-300" strokeWidth={2.5} />
        <Teeth cx={cx} y={cy - 11} count={5} width={32} />
        <Teeth cx={cx} y={cy + 5} count={5} width={32} />
        <path d={`M ${cx - 5} ${cy + 2} Q ${cx} ${cy + 12} ${cx + 5} ${cy + 2} Z`} className="fill-rose-400" />
      </g>
    )
  }
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={22} ry={14} className="fill-card stroke-rose-300" strokeWidth={2.5} />
      <Teeth cx={cx} y={cy - 12} count={6} width={36} />
      <Teeth cx={cx} y={cy + 6} count={6} width={36} />
    </g>
  )
}

export default function ArticulationRig({ articulation }: { articulation: Articulation }) {
  const peak = tonguePeak(articulation)
  const d = tonguePath(peak)
  const isConsonant = Boolean(articulation.place)
  const isGlottal = articulation.place === 'glottal'
  const showAirflow = isConsonant && !isGlottal && (articulation.manner === 'fricative' || articulation.manner === 'affricate')
  const showNasal = articulation.manner === 'nasal'
  const shape = mouthShape(articulation)

  return (
    <div className="grid grid-cols-2 gap-4">
      <style>{`
        @keyframes rig-tongue-bob { from { transform: translateY(4px) scaleY(0.96); } to { transform: translateY(0) scaleY(1); } }
        @keyframes rig-airflow { from { stroke-dashoffset: 12; opacity: .3; } to { stroke-dashoffset: 0; opacity: .9; } }
        @keyframes rig-pulse { from { opacity: .25; transform: scale(0.85); } to { opacity: .9; transform: scale(1.1); } }
        .rig-tongue { animation: rig-tongue-bob 2.6s ease-in-out infinite alternate; transform-box: fill-box; transform-origin: center; }
        .rig-airflow { animation: rig-airflow 1s linear infinite alternate; }
        .rig-pulse { animation: rig-pulse 1.1s ease-in-out infinite alternate; transform-box: fill-box; transform-origin: center; }
        @media (prefers-reduced-motion: reduce) {
          .rig-tongue, .rig-airflow, .rig-pulse { animation: none !important; }
        }
      `}</style>

      <figure className="space-y-1">
        <svg viewBox="0 0 190 150" className="w-full h-auto">
          {/* Simplified mouth-cavity cross-section: a rounded head silhouette in profile,
              lips at the left, throat at the right. */}
          <path
            d="M 30 90 C 26 65, 45 35, 90 30 C 135 27, 165 45, 170 78
               C 173 100, 160 122, 130 134 C 100 144, 65 142, 42 122
               C 32 113, 29 101, 30 90 Z"
            className="fill-secondary stroke-border"
            strokeWidth={2}
          />
          {/* Palate reference line */}
          <path d="M 46 80 Q 95 42 150 70" className="fill-none stroke-muted-foreground/40" strokeWidth={2} />
          {/* Lips at the mouth opening */}
          <path d="M 34 88 Q 26 96 34 106" className="fill-none stroke-rose-400" strokeWidth={4} strokeLinecap="round" />
          <Teeth cx={44} y={82} count={3} width={14} />
          <Teeth cx={44} y={104} count={3} width={14} />

          {isGlottal ? (
            <circle cx={164} cy={100} r={7} className="fill-rose-300 stroke-rose-400" strokeWidth={1.5} />
          ) : (
            <>
              <path d={d} className="rig-tongue fill-rose-300 stroke-rose-400" strokeWidth={1.5} />
              {isConsonant && <circle cx={peak.x} cy={peak.y - 4} r={3} className="fill-rose-500" />}
            </>
          )}

          {showAirflow && (
            <path
              d={`M ${peak.x + 6} ${peak.y - 8} q 12 -6 22 -14`}
              className="rig-airflow fill-none stroke-rose-400"
              strokeWidth={2}
              strokeDasharray="3 3"
              strokeLinecap="round"
            />
          )}

          {showNasal && (
            <>
              <path d="M 140 40 q -6 -16 -18 -18" className="fill-none stroke-muted-foreground/40" strokeWidth={1.5} strokeDasharray="2 3" />
              <circle cx={120} cy={20} r={3} className="rig-pulse fill-rose-400" />
            </>
          )}

          {articulation.voicing === 'voiced' && (
            <g className="rig-pulse">
              <path d="M 174 88 q 5 6 0 12" className="fill-none stroke-rose-400" strokeWidth={1.5} strokeLinecap="round" />
              <path d="M 179 85 q 8 9 0 18" className="fill-none stroke-rose-400" strokeWidth={1.5} strokeLinecap="round" />
            </g>
          )}
        </svg>
        <figcaption className="text-center text-[11px] text-muted-foreground">Profil</figcaption>
      </figure>

      <figure className="space-y-1">
        <svg viewBox="0 0 140 140" className="w-full h-auto">
          <circle cx={70} cy={68} r={58} className="fill-card stroke-border" strokeWidth={2} />
          <circle cx={48} cy={44} r={4} className="fill-muted-foreground/60" />
          <circle cx={92} cy={44} r={4} className="fill-muted-foreground/60" />
          <path d="M 70 50 L 65 68 L 71 70" className="fill-none stroke-muted-foreground/50" strokeWidth={2} />
          <FrontMouth shape={shape} />
        </svg>
        <figcaption className="text-center text-[11px] text-muted-foreground">Elölnézet</figcaption>
      </figure>
    </div>
  )
}
