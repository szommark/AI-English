import { useEffect, useRef, useState } from 'react'
import { Volume2 } from 'lucide-react'
import type { Phoneme } from '../../data/phonemes'
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis'
import type { AccentPreference } from '../../lib/voiceSelection'
import DrillCard from '../PronunciationSession/DrillCard'

const DECK_SIZE = 6
const ADVANCE_DELAY_MS = 900
const SWIPE_THRESHOLD = 80

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/**
 * The chart's "idea 2" exercise (phonetic-sound-chart-design.md §7) — a lighter,
 * faster-to-author alternative to the full 4-stage funnel, for the ~35 tiles that don't
 * have curriculumId content. Learner hears a word and swipes (or taps) to say whether it
 * contains the tile's target sound. Purely local — no mic, no Azure, no persisted score,
 * same "no need for anything smarter yet" MVP spirit as the funnel's own session composer.
 */
export default function SwipeCardExercise({
  phoneme,
  accent,
  onComplete,
}: {
  phoneme: Phoneme
  accent: AccentPreference
  onComplete: (score: number, total: number) => void
}) {
  const synth = useSpeechSynthesis('female', accent)
  const [deck] = useState(() => shuffle(phoneme.swipeWords ?? []).slice(0, DECK_SIZE))
  const [index, setIndex] = useState(0)
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null)
  const [dragX, setDragX] = useState(0)
  const scoreRef = useRef(0)
  const draggingRef = useRef(false)
  const startXRef = useRef(0)

  const current = deck[index]
  const finished = index >= deck.length

  useEffect(() => {
    if (!finished && current) synth.speak(current.word)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])

  useEffect(() => {
    if (finished) onComplete(scoreRef.current, deck.length)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished])

  function decide(saysTarget: boolean) {
    if (feedback || !current) return
    const isCorrect = saysTarget === current.isTarget
    if (isCorrect) scoreRef.current += 1
    setFeedback(isCorrect ? 'correct' : 'incorrect')
    setTimeout(() => {
      setFeedback(null)
      setDragX(0)
      setIndex((i) => i + 1)
    }, ADVANCE_DELAY_MS)
  }

  function handlePointerDown(e: React.PointerEvent) {
    if (feedback) return
    draggingRef.current = true
    startXRef.current = e.clientX
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  function handlePointerMove(e: React.PointerEvent) {
    if (!draggingRef.current) return
    setDragX(e.clientX - startXRef.current)
  }
  function handlePointerUp() {
    if (!draggingRef.current) return
    draggingRef.current = false
    if (dragX > SWIPE_THRESHOLD) decide(true)
    else if (dragX < -SWIPE_THRESHOLD) decide(false)
    else setDragX(0)
  }

  if (finished || !current) return null

  const tilt = Math.max(-12, Math.min(12, dragX / 8))
  const leanYes = dragX > 24
  const leanNo = dragX < -24

  return (
    <DrillCard title={`Kártyás gyakorlat — /${phoneme.ipaSymbol}/`} titleHu="Halld meg és döntsd el">
      <div className="space-y-4">
        <p className="text-sm text-slate-500">
          Kártya {index + 1}/{deck.length} — hallod benne a(z) /{phoneme.ipaSymbol}/ hangot?
        </p>

        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{ transform: `translateX(${dragX}px) rotate(${tilt}deg)` }}
          className={`select-none touch-none rounded-2xl border-2 px-6 py-10 text-center transition-colors cursor-grab active:cursor-grabbing ${
            feedback === 'correct'
              ? 'border-emerald-400 bg-emerald-50'
              : feedback === 'incorrect'
                ? 'border-red-400 bg-red-50'
                : leanYes
                  ? 'border-emerald-300 bg-emerald-50/60'
                  : leanNo
                    ? 'border-red-300 bg-red-50/60'
                    : 'border-rose-200 bg-white'
          }`}
        >
          <button
            onClick={() => synth.speak(current.word)}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600 hover:bg-rose-200"
            aria-label="Lejátszás"
          >
            <Volume2 className="h-7 w-7" />
          </button>
          {feedback && <p className="mt-4 text-lg font-medium text-slate-800">{current.word}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => decide(false)}
            disabled={feedback !== null}
            className="rounded-lg border-2 border-red-200 text-red-700 text-sm font-medium py-2.5 hover:bg-red-50 disabled:opacity-40"
          >
            ✗ Nem ez a hang
          </button>
          <button
            onClick={() => decide(true)}
            disabled={feedback !== null}
            className="rounded-lg border-2 border-emerald-200 text-emerald-700 text-sm font-medium py-2.5 hover:bg-emerald-50 disabled:opacity-40"
          >
            ✓ Ez a hang
          </button>
        </div>
      </div>
    </DrillCard>
  )
}
