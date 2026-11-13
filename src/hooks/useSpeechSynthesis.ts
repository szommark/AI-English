import { useCallback, useEffect, useRef, useState } from 'react'
import type { VoiceGender } from '../lib/types'
import { accentToLangTag, getVoicesReliably, pickNativeVoice, resolveVoice, type AccentPreference } from '../lib/voiceSelection'

/**
 * Browser TTS in an English voice of the given gender and accent — or, with `nativeLocale`
 * (e.g. `de-DE` for the German speaking exams), the device's best voice of that language.
 */
export function useSpeechSynthesis(voiceGender: VoiceGender = 'female', accent: AccentPreference = 'us', nativeLocale?: string) {
  const [supported] = useState(() => typeof window !== 'undefined' && 'speechSynthesis' in window)
  const [speaking, setSpeaking] = useState(false)
  const voiceRef = useRef<SpeechSynthesisVoice | undefined>(undefined)
  const langTag = nativeLocale ?? accentToLangTag(accent)

  useEffect(() => {
    if (!supported) return
    let cancelled = false
    getVoicesReliably().then((voices) => {
      if (cancelled) return
      voiceRef.current = nativeLocale ? pickNativeVoice(voices, nativeLocale) : resolveVoice(voices, voiceGender, langTag)
    })
    return () => {
      cancelled = true
    }
  }, [supported, voiceGender, langTag, nativeLocale])

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
