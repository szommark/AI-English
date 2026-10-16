import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { GrammarSegment } from '../lib/types'
import { narrationPieces, type NarrationPiece } from '../lib/narration'
import { getVoicesReliably, pickNativeVoice, resolveVoice } from '../lib/voiceSelection'

export type PlaybackRate = 0.75 | 0.9 | 1 | 1.25

export type NarrationLocale = 'en-US' | 'hu-HU' | 'de-DE'

/** Default is a calm teacher's pace: learners found the 1× narration too fast. */
const DEFAULT_RATE: PlaybackRate = 0.9
const RATE_KEY = 'aiEnglish:grammarNarrationRate'
export const PLAYBACK_RATES: PlaybackRate[] = [0.75, 0.9, 1, 1.25]

/** Pause after the board changes, so it can be read before the narration goes on. */
const SEGMENT_GAP_MS = 1500

function storedRate(): PlaybackRate {
  try {
    const value = Number(window.localStorage.getItem(RATE_KEY))
    return PLAYBACK_RATES.includes(value as PlaybackRate) ? (value as PlaybackRate) : DEFAULT_RATE
  } catch {
    return DEFAULT_RATE
  }
}

/**
 * Drives narration playback across a lesson's segments using the browser's native
 * speechSynthesis. There's no real seek/duration here (see the Grammar Coach voice bar
 * "reality check") — progress is a stepped, one-dot-per-segment indicator.
 *
 * Each narration is spoken as sentence-sized pieces (src/lib/narration.ts): in a Hungarian
 * or German explanation the <en>-tagged parts are read by an English voice and the rest by
 * a voice of the explanation language. Pause cancels speech and resume restarts the current
 * piece — more reliable across browsers than speechSynthesis.pause()/resume().
 */
export function useSegmentPlayer(segments: GrammarSegment[], narrationLocale: NarrationLocale) {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentPiece, setCurrentPiece] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [rate, setRateState] = useState<PlaybackRate>(() => (typeof window === 'undefined' ? DEFAULT_RATE : storedRate()))
  /** The explanation language has no voice on this device (it'd be read by some other voice). */
  const [nativeVoiceMissing, setNativeVoiceMissing] = useState(false)

  const allEnglish = narrationLocale === 'en-US'
  const pieces = useMemo(
    () => segments.map((segment) => narrationPieces(segment.narration, allEnglish)),
    [segments, allEnglish],
  )

  const englishVoiceRef = useRef<SpeechSynthesisVoice | undefined>(undefined)
  const nativeVoiceRef = useRef<SpeechSynthesisVoice | undefined>(undefined)
  const rateRef = useRef(rate)
  const indexRef = useRef(0)
  const pieceRef = useRef(0)
  const isPlayingRef = useRef(false)
  const isPausedRef = useRef(false)
  // Bumped on every start/stop, so events of a cancelled utterance or gap timer are ignored.
  const runRef = useRef(0)
  const gapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const setRate = useCallback((next: PlaybackRate) => {
    rateRef.current = next
    setRateState(next)
    try {
      window.localStorage.setItem(RATE_KEY, String(next))
    } catch {
      // Private mode etc.: the rate just isn't remembered.
    }
  }, [])

  useEffect(() => {
    if (!supported) return
    let cancelled = false
    getVoicesReliably().then((voices) => {
      if (cancelled) return
      englishVoiceRef.current = resolveVoice(voices, 'female')
      nativeVoiceRef.current = allEnglish ? undefined : pickNativeVoice(voices, narrationLocale)
      setNativeVoiceMissing(!allEnglish && voices.length > 0 && !nativeVoiceRef.current)
    })
    return () => {
      cancelled = true
    }
  }, [supported, narrationLocale, allEnglish])

  const stopSpeech = useCallback(() => {
    runRef.current++
    if (gapTimerRef.current) {
      clearTimeout(gapTimerRef.current)
      gapTimerRef.current = null
    }
    if (supported) window.speechSynthesis.cancel()
  }, [supported])

  useEffect(() => stopSpeech, [stopSpeech])

  const speakFrom = useCallback(
    (segmentIndex: number, pieceIndex: number) => {
      if (!supported) return
      const run = ++runRef.current
      window.speechSynthesis.cancel()

      const finish = () => {
        isPlayingRef.current = false
        setIsPlaying(false)
        setIsFinished(true)
      }

      const step = (seg: number, piece: number) => {
        if (runRef.current !== run) return
        const segmentPieces = pieces[seg]
        if (!segmentPieces) return finish()

        if (piece >= segmentPieces.length) {
          const next = seg + 1
          if (next >= pieces.length) return finish()
          // Show the next board straight away, then give the learner time to read it.
          indexRef.current = next
          pieceRef.current = 0
          setCurrentIndex(next)
          setCurrentPiece(0)
          gapTimerRef.current = setTimeout(() => {
            gapTimerRef.current = null
            step(next, 0)
          }, SEGMENT_GAP_MS)
          return
        }

        pieceRef.current = piece
        setCurrentPiece(piece)
        const current: NarrationPiece = segmentPieces[piece]
        if (!current.speakable) return step(seg, piece + 1)

        const utterance = new SpeechSynthesisUtterance(current.text)
        const voice = current.lang === 'en' ? englishVoiceRef.current : nativeVoiceRef.current
        if (voice) utterance.voice = voice
        utterance.lang = voice?.lang ?? (current.lang === 'en' ? 'en-US' : narrationLocale)
        utterance.rate = rateRef.current
        utterance.onend = () => step(seg, piece + 1)
        utterance.onerror = (event) => {
          if (runRef.current !== run || event.error === 'interrupted' || event.error === 'canceled') return
          isPlayingRef.current = false
          setIsPlaying(false)
        }
        window.speechSynthesis.speak(utterance)
      }

      step(segmentIndex, pieceIndex)
    },
    [supported, pieces, narrationLocale],
  )

  const startAt = useCallback(
    (segmentIndex: number, pieceIndex: number) => {
      indexRef.current = segmentIndex
      pieceRef.current = pieceIndex
      setCurrentIndex(segmentIndex)
      setCurrentPiece(pieceIndex)
      setIsFinished(false)
      isPlayingRef.current = true
      isPausedRef.current = false
      setIsPlaying(true)
      setIsPaused(false)
      speakFrom(segmentIndex, pieceIndex)
    },
    [speakFrom],
  )

  const play = useCallback(() => {
    if (!supported || segments.length === 0) return
    if (isFinished) startAt(0, 0)
    else startAt(indexRef.current, pieceRef.current)
  }, [supported, segments, isFinished, startAt])

  const pause = useCallback(() => {
    if (!supported) return
    stopSpeech()
    isPlayingRef.current = false
    isPausedRef.current = true
    setIsPlaying(false)
    setIsPaused(true)
  }, [supported, stopSpeech])

  const resume = useCallback(() => {
    if (!supported) return
    startAt(indexRef.current, pieceRef.current)
  }, [supported, startAt])

  const goToSegment = useCallback(
    (index: number) => {
      if (segments.length === 0) return
      const clamped = Math.max(0, Math.min(segments.length - 1, index))
      if (isPlayingRef.current || isPausedRef.current) {
        startAt(clamped, 0)
        return
      }
      indexRef.current = clamped
      pieceRef.current = 0
      setCurrentIndex(clamped)
      setCurrentPiece(0)
      setIsFinished(false)
    },
    [segments, startAt],
  )

  const reset = useCallback(() => {
    stopSpeech()
    indexRef.current = 0
    pieceRef.current = 0
    isPlayingRef.current = false
    isPausedRef.current = false
    setCurrentIndex(0)
    setCurrentPiece(0)
    setIsPlaying(false)
    setIsPaused(false)
    setIsFinished(false)
  }, [stopSpeech])

  return {
    supported,
    currentIndex,
    /** Pieces of the current segment's narration, and which one is being spoken (captions). */
    currentPieces: pieces[currentIndex] ?? [],
    currentPiece,
    isPlaying,
    isPaused,
    isFinished,
    rate,
    setRate,
    nativeVoiceMissing,
    play,
    pause,
    resume,
    goToSegment,
    reset,
  }
}
