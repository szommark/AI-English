import { useCallback, useEffect, useRef, useState } from 'react'
import type { VoiceGender } from '../lib/types'
import { getVoicesReliably, resolveVoice } from '../lib/voiceSelection'

export function useSpeechSynthesis(voiceGender: VoiceGender = 'female') {
  const [supported] = useState(() => typeof window !== 'undefined' && 'speechSynthesis' in window)
  const [speaking, setSpeaking] = useState(false)
  const voiceRef = useRef<SpeechSynthesisVoice | undefined>(undefined)

  useEffect(() => {
    if (!supported) return
    let cancelled = false
    getVoicesReliably().then((voices) => {
      if (cancelled) return
      voiceRef.current = resolveVoice(voices, voiceGender)
    })
    return () => {
      cancelled = true
    }
  }, [supported, voiceGender])

  const speak = useCallback(
    (text: string) => {
      if (!supported) return
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      if (voiceRef.current) utterance.voice = voiceRef.current
      utterance.onstart = () => setSpeaking(true)
      utterance.onend = () => setSpeaking(false)
      utterance.onerror = () => setSpeaking(false)
      window.speechSynthesis.speak(utterance)
    },
    [supported],
  )

  const cancel = useCallback(() => {
    if (!supported) return
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }, [supported])

  return { supported, speaking, speak, cancel }
}
