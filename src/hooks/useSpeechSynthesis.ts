import { useCallback, useEffect, useRef, useState } from 'react'
import type { VoiceGender } from '../lib/types'
import { accentToLangTag, getVoicesReliably, resolveVoice, type AccentPreference } from '../lib/voiceSelection'

export function useSpeechSynthesis(voiceGender: VoiceGender = 'female', accent: AccentPreference = 'us') {
  const [supported] = useState(() => typeof window !== 'undefined' && 'speechSynthesis' in window)
  const [speaking, setSpeaking] = useState(false)
  const voiceRef = useRef<SpeechSynthesisVoice | undefined>(undefined)
  const langTag = accentToLangTag(accent)

  useEffect(() => {
    if (!supported) return
    let cancelled = false
    getVoicesReliably().then((voices) => {
      if (cancelled) return
      voiceRef.current = resolveVoice(voices, voiceGender, langTag)
    })
    return () => {
      cancelled = true
    }
  }, [supported, voiceGender, langTag])

  const speak = useCallback(
    /** onEnd fires when the utterance finishes, fails or is cancelled (or at once without TTS). */
    (text: string, options?: { rate?: number; onEnd?: () => void }) => {
      if (!supported) {
        options?.onEnd?.()
        return
      }
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = langTag
      utterance.rate = options?.rate ?? 1
      if (voiceRef.current) utterance.voice = voiceRef.current
      utterance.onstart = () => setSpeaking(true)
      utterance.onend = () => {
        setSpeaking(false)
        options?.onEnd?.()
      }
      utterance.onerror = () => {
        setSpeaking(false)
        options?.onEnd?.()
      }
      window.speechSynthesis.speak(utterance)
    },
    [supported, langTag],
  )

  const cancel = useCallback(() => {
    if (!supported) return
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }, [supported])

  return { supported, speaking, speak, cancel }
}
