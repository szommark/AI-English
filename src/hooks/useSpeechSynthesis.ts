import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { VoiceGender } from '../lib/types'
import { accentToLangTag, getVoicesReliably, pickNativeVoice, resolveVoice, type AccentPreference } from '../lib/voiceSelection'

/**
 * Browser TTS in an English voice of the given gender and accent — or, with `nativeLocale`
 * (e.g. `de-DE` for the German speaking exams, `da-DK` for Danish word lists), the device's
 * best voice of that language.
 *
 * `hasVoice` is null until the device's voice list has loaded, then whether a voice for the
 * language was found (false without speech synthesis). Without one, speak() still runs with
 * the browser default, as before: callers that care (Danish lists) check it themselves.
 */
export function useSpeechSynthesis(voiceGender: VoiceGender = 'female', accent: AccentPreference = 'us', nativeLocale?: string) {
  const [supported] = useState(() => typeof window !== 'undefined' && 'speechSynthesis' in window)
  const [speaking, setSpeaking] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[] | null>(null)
  const voiceRef = useRef<SpeechSynthesisVoice | undefined>(undefined)
  const langTag = nativeLocale ?? accentToLangTag(accent)

  useEffect(() => {
    if (!supported) return
    let cancelled = false
    getVoicesReliably().then((list) => {
      if (!cancelled) setVoices(list)
    })
    return () => {
      cancelled = true
    }
  }, [supported])

  // Derived in render, so a new locale's hasVoice is right on the same render (a session
  // that mounts with it decides its exercises from it).
  const voice = useMemo(
    () => (voices ? (nativeLocale ? pickNativeVoice(voices, nativeLocale) : resolveVoice(voices, voiceGender, langTag)) : undefined),
    [voices, voiceGender, langTag, nativeLocale],
  )
  voiceRef.current = voice
  const hasVoice: boolean | null = !supported ? false : voices === null ? null : voice !== undefined

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

  return { supported, speaking, speak, cancel, hasVoice }
}
