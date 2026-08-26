import { useCallback, useEffect, useRef, useState } from 'react'
import type { GrammarSegment } from '../lib/types'
import { getVoicesReliably, resolveVoice } from '../lib/voiceSelection'

export type PlaybackRate = 0.75 | 1 | 1.25

/**
 * Drives narration playback across a lesson's segments using the browser's native
 * speechSynthesis. There's no real seek/duration here (see the Grammar Coach voice bar
 * "reality check") — progress is a stepped, one-dot-per-segment indicator, and
 * play/pause map to real speechSynthesis.pause()/resume().
 */
export function useSegmentPlayer(segments: GrammarSegment[], narrationLang: 'en-US' | 'hu-HU') {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [rate, setRate] = useState<PlaybackRate>(1)

  const voiceRef = useRef<SpeechSynthesisVoice | undefined>(undefined)
  const rateRef = useRef(rate)
  const indexRef = useRef(0)
  const isPlayingRef = useRef(false)
  const isPausedRef = useRef(false)

  useEffect(() => {
    rateRef.current = rate
  }, [rate])

  useEffect(() => {
    if (!supported || narrationLang !== 'en-US') return
    let cancelled = false
    getVoicesReliably().then((voices) => {
      if (!cancelled) voiceRef.current = resolveVoice(voices, 'female')
    })
    return () => {
      cancelled = true
    }
  }, [supported, narrationLang])

  useEffect(() => {
    return () => {
      if (supported) window.speechSynthesis.cancel()
    }
  }, [supported])

  const speak = useCallback(
    (index: number) => {
      if (!supported) return
      const segment = segments[index]
      if (!segment) return

      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(segment.narration)
      utterance.lang = narrationLang
      utterance.rate = rateRef.current
      if (narrationLang === 'en-US' && voiceRef.current) utterance.voice = voiceRef.current

      utterance.onend = () => {
        const next = index + 1
        if (next < segments.length) {
          indexRef.current = next
          setCurrentIndex(next)
          speak(next)
        } else {
          isPlayingRef.current = false
          setIsPlaying(false)
          setIsFinished(true)
        }
      }
      utterance.onerror = () => {
        isPlayingRef.current = false
        setIsPlaying(false)
      }

      window.speechSynthesis.speak(utterance)
    },
    [supported, segments, narrationLang],
  )

  const play = useCallback(() => {
    if (!supported || segments.length === 0) return
    const startIndex = isFinished ? 0 : indexRef.current
    indexRef.current = startIndex
    setCurrentIndex(startIndex)
    setIsFinished(false)
    isPlayingRef.current = true
    isPausedRef.current = false
    setIsPlaying(true)
    setIsPaused(false)
    speak(startIndex)
  }, [supported, segments, isFinished, speak])

  const pause = useCallback(() => {
    if (!supported) return
    window.speechSynthesis.pause()
    isPlayingRef.current = false
    isPausedRef.current = true
    setIsPlaying(false)
    setIsPaused(true)
  }, [supported])

  const resume = useCallback(() => {
    if (!supported) return
    window.speechSynthesis.resume()
    isPlayingRef.current = true
    isPausedRef.current = false
    setIsPlaying(true)
    setIsPaused(false)
  }, [supported])

  const goToSegment = useCallback(
    (index: number) => {
      if (segments.length === 0) return
      const clamped = Math.max(0, Math.min(segments.length - 1, index))
      indexRef.current = clamped
      setCurrentIndex(clamped)
      setIsFinished(false)
      if (isPlayingRef.current || isPausedRef.current) {
        isPlayingRef.current = true
        isPausedRef.current = false
        setIsPlaying(true)
        setIsPaused(false)
        speak(clamped)
      }
    },
    [segments, speak],
  )

  const reset = useCallback(() => {
    if (supported) window.speechSynthesis.cancel()
    indexRef.current = 0
    isPlayingRef.current = false
    isPausedRef.current = false
    setCurrentIndex(0)
    setIsPlaying(false)
    setIsPaused(false)
    setIsFinished(false)
  }, [supported])

  return {
    supported,
    currentIndex,
    isPlaying,
    isPaused,
    isFinished,
    rate,
    setRate,
    play,
    pause,
    resume,
    goToSegment,
    reset,
  }
}
