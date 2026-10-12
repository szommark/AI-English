// Small timeline diagram for one Tense Explorer box. Shapes come from the tense's time frame
// and aspect (TENSE_CONTENT), not from per-tense drawings: time runs left to right with a
// "now" marker; past/future reference points are labelled R.
import { useId } from 'react'
import type { TenseContent } from '../../data/tenseExplorerContent.ts'

type Frame = TenseContent['frame']
type Aspect = TenseContent['aspect']

interface Props {
  frame: Frame
  aspect: Aspect
  lang: 'en' | 'hu'
}

const WIDTH = 280
const HEIGHT = 100
const AXIS_Y = 56
const AXIS_LEFT = 12
const AXIS_RIGHT = 268
const NOW_X = 140
const REF_X: Record<Frame, number> = { past: 85, present: NOW_X, future: 215 }
const PERFECT_GAP = 45 // how far before the reference point a perfect event sits
const CONTINUOUS_HALF = 25 // half-width of the solid part of a continuous bar
const FADE = 14 // length of a bar's faded open ends
const PERFECT_CONTINUOUS_LENGTH = 55 // solid part of a perfect-continuous bar

const LABELS = {
  en: { now: 'now', past: 'past', future: 'future', ref: 'R' },
  hu: { now: 'most', past: 'múlt', future: 'jövő', ref: 'ref.' },
}

const DESCRIPTIONS: Record<'en' | 'hu', Record<Aspect, Record<Frame, string>>> = {
  en: {
    simple: {
      present: 'Timeline: repeated events around now (a habit or routine).',
      past: 'Timeline: one finished event in the past, before now.',
      future: 'Timeline: one event in the future, after now.',
    },
    continuous: {
      present: 'Timeline: an action in progress around now.',
      past: 'Timeline: an action in progress around a moment in the past.',
      future: 'Timeline: an action in progress around a moment in the future.',
    },
    perfect: {
      present: 'Timeline: an earlier event connected by an arrow to now.',
      past: 'Timeline: an earlier event connected by an arrow to a reference point in the past.',
      future: 'Timeline: an event finished before a reference point in the future.',
    },
    'perfect-continuous': {
      present: 'Timeline: an activity that has been going on up to now.',
      past: 'Timeline: an activity that had been going on up to a reference point in the past.',
      future: 'Timeline: an activity that will have been going on up to a reference point in the future.',
    },
    'going-to': {
      present: 'Timeline: a plan or evidence now, pointing to a future event.',
      past: 'Timeline: a plan or evidence now, pointing to a future event.',
      future: 'Timeline: a plan or evidence now, pointing to a future event.',
    },
  },
  hu: {
    simple: {
      present: 'Idővonal: a jelen körül ismétlődő események (szokás).',
      past: 'Idővonal: egy befejezett esemény a múltban, a jelen előtt.',
      future: 'Idővonal: egy esemény a jövőben, a jelen után.',
    },
    continuous: {
      present: 'Idővonal: éppen most zajló cselekvés.',
      past: 'Idővonal: egy múltbeli pillanatban zajló cselekvés.',
      future: 'Idővonal: egy jövőbeli pillanatban zajló cselekvés.',
    },
    perfect: {
      present: 'Idővonal: egy korábbi esemény, amelyet nyíl köt a jelenhez.',
      past: 'Idővonal: egy korábbi esemény, amelyet nyíl köt egy múltbeli viszonyítási ponthoz.',
      future: 'Idővonal: egy esemény, amely egy jövőbeli viszonyítási pont előtt befejeződik.',
    },
    'perfect-continuous': {
      present: 'Idővonal: egy tevékenység, amely egészen mostanáig tart.',
      past: 'Idővonal: egy tevékenység, amely egy múltbeli viszonyítási pontig tartott.',
      future: 'Idővonal: egy tevékenység, amely egy jövőbeli viszonyítási pontig tart majd.',
    },
    'going-to': {
      present: 'Idővonal: egy most meglévő terv vagy jel, amely egy jövőbeli eseményre mutat.',
      past: 'Idővonal: egy most meglévő terv vagy jel, amely egy jövőbeli eseményre mutat.',
      future: 'Idővonal: egy most meglévő terv vagy jel, amely egy jövőbeli eseményre mutat.',
    },
  },
}

/** A thick event bar with optional faded ("open") ends. */
function Bar({ from, to, fadeStart, fadeEnd }: { from: number; to: number; fadeStart?: boolean; fadeEnd?: boolean }) {
  return (
    <g strokeWidth={8}>
      {fadeStart && <line x1={from - FADE} y1={AXIS_Y} x2={from} y2={AXIS_Y} className="stroke-amber-300" strokeOpacity={0.6} />}
      {fadeEnd && <line x1={to} y1={AXIS_Y} x2={to + FADE} y2={AXIS_Y} className="stroke-amber-300" strokeOpacity={0.6} />}
      <line x1={from} y1={AXIS_Y} x2={to} y2={AXIS_Y} className="stroke-amber-500" />
    </g>
  )
}

const Dot = ({ x, r = 6 }: { x: number; r?: number }) => <circle cx={x} cy={AXIS_Y} r={r} className="fill-amber-500" />

export default function TenseTimeline({ frame, aspect, lang }: Props) {
  const arrowId = `tense-arrow-${useId().replace(/:/g, '')}`
  const labels = LABELS[lang]
  const ref = REF_X[frame]
  // Past/future reference points get a marker and label; for simple forms the event is the point.
  const showRef = frame !== 'present' && aspect !== 'simple' && aspect !== 'going-to'

  let event: JSX.Element
  switch (aspect) {
    case 'simple':
      event =
        frame === 'present' ? (
          <>
            <Dot x={NOW_X - 32} r={4} />
            <Dot x={NOW_X} r={4} />
            <Dot x={NOW_X + 32} r={4} />
          </>
        ) : (
          <Dot x={ref} />
        )
      break
    case 'continuous':
      event = <Bar from={ref - CONTINUOUS_HALF} to={ref + CONTINUOUS_HALF} fadeStart fadeEnd />
      break
    case 'perfect':
      event = (
        <>
          <path
            d={`M ${ref - PERFECT_GAP} ${AXIS_Y} Q ${ref - PERFECT_GAP / 2} ${AXIS_Y - 30} ${ref - 3} ${AXIS_Y - 8}`}
            fill="none"
            strokeWidth={2}
            className="stroke-amber-600"
            markerEnd={`url(#${arrowId})`}
          />
          <Dot x={ref - PERFECT_GAP} />
        </>
      )
      break
    case 'perfect-continuous':
      event = <Bar from={ref - PERFECT_CONTINUOUS_LENGTH} to={ref} fadeStart />
      break
    case 'going-to':
      event = (
        <>
          <circle cx={NOW_X} cy={AXIS_Y} r={4} className="fill-white stroke-amber-600" strokeWidth={2} />
          <path
            d={`M ${NOW_X + 6} ${AXIS_Y - 6} Q ${(NOW_X + REF_X.future) / 2} ${AXIS_Y - 34} ${REF_X.future - 6} ${AXIS_Y - 8}`}
            fill="none"
            strokeWidth={2}
            strokeDasharray="5 4"
            className="stroke-amber-600"
            markerEnd={`url(#${arrowId})`}
          />
          <Dot x={REF_X.future} />
        </>
      )
      break
  }

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      width="100%"
      role="img"
      aria-label={DESCRIPTIONS[lang][aspect][frame]}
      className="block max-w-full"
    >
      <defs>
        <marker id={arrowId} viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6} markerHeight={6} orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" className="fill-amber-600" />
        </marker>
      </defs>

      {/* time axis */}
      <line x1={AXIS_LEFT} y1={AXIS_Y} x2={AXIS_RIGHT} y2={AXIS_Y} strokeWidth={2} className="stroke-slate-300" />
      <path d={`M ${AXIS_RIGHT} ${AXIS_Y - 5} L ${AXIS_RIGHT + 8} ${AXIS_Y} L ${AXIS_RIGHT} ${AXIS_Y + 5} z`} className="fill-slate-300" />
      <text x={AXIS_LEFT} y={AXIS_Y + 30} fontSize={11} className="fill-slate-400">{labels.past}</text>
      <text x={AXIS_RIGHT + 6} y={AXIS_Y + 30} fontSize={11} textAnchor="end" className="fill-slate-400">{labels.future}</text>

      {/* now marker */}
      <line x1={NOW_X} y1={AXIS_Y - 34} x2={NOW_X} y2={AXIS_Y + 14} strokeWidth={2} strokeDasharray="3 3" className="stroke-slate-500" />
      <text x={NOW_X} y={AXIS_Y + 30} fontSize={12} fontWeight={600} textAnchor="middle" className="fill-slate-600">{labels.now}</text>

      {/* reference point */}
      {showRef && (
        <>
          <line x1={ref} y1={AXIS_Y - 14} x2={ref} y2={AXIS_Y + 14} strokeWidth={2} className="stroke-slate-400" />
          <text x={ref} y={AXIS_Y + 30} fontSize={11} fontWeight={600} textAnchor="middle" className="fill-slate-500">{labels.ref}</text>
        </>
      )}

      {event}
    </svg>
  )
}
