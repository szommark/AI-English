import { useCallback, useEffect, useRef, useState } from 'react'

// Minimal typings for the Web Speech API, which TypeScript's DOM lib doesn't include.
interface SpeechRecognitionResultLike {
  isFinal: boolean
  0: { transcript: string }
}
interface SpeechRecognitionEventLike extends Event {
  resultIndex: number
  results: ArrayLike<SpeechRecognitionResultLike>
}
interface SpeechRecognitionErrorEventLike extends Event {
  error: string
}
interface SpeechRecognitionLike extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null
  onend: (() => void) | null
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike

function getSpeechRecognitionCtor(): SpeechRecognitionConstructor | null {
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

const SILENCE_MS = 1500

export interface UseTutorSpeechRecognitionParams {
  /** Fired once silence follows a non-empty transcript. */
  onUtterance: (text: string) => void
  /** Fired once silence follows an empty listening window. */
  onSilenceTimeout: () => void
}

/**
 * Continuous, silence-based speech recognition for the Tutor Bot screen (as opposed to
 * useSpeechRecognition's tap-to-start/tap-to-stop model used by the scenario screens).
 * Chrome sometimes ends a continuous recognizer on its own; this hook restarts it
 * transparently for as long as `start()` hasn't been followed by `stop()`.
 */
export function useTutorSpeechRecognition({ onUtterance, onSilenceTimeout }: UseTutorSpeechRecognitionParams) {
  const [supported] = useState(() => getSpeechRecognitionCtor() !== null)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [interimTranscript, setInterimTranscript] = useState('')

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const listeningRef = useRef(false)
  const transcriptRef = useRef('')
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onUtteranceRef = useRef(onUtterance)
  const onSilenceTimeoutRef = useRef(onSilenceTimeout)

  useEffect(() => {
    onUtteranceRef.current = onUtterance
  }, [onUtterance])
  useEffect(() => {
    onSilenceTimeoutRef.current = onSilenceTimeout
  }, [onSilenceTimeout])

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }
  }, [])

  const armSilenceTimer = useCallback(() => {
    clearSilenceTimer()
    silenceTimerRef.current = setTimeout(() => {
      const text = transcriptRef.current.trim()
      transcriptRef.current = ''
      setInterimTranscript('')
      listeningRef.current = false
      recognitionRef.current?.stop()

      if (text) {
        onUtteranceRef.current(text)
      } else {
        onSilenceTimeoutRef.current()
      }
    }, SILENCE_MS)
  }, [clearSilenceTimer])

  const startRecognizer = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor()
    if (!Ctor) return

    const recognition = new Ctor()
    recognition.lang = 'en-US'
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onresult = (event) => {
      let text = ''
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript
      }
      transcriptRef.current = text
      setInterimTranscript(text)
      armSilenceTimer()
    }
    recognition.onerror = (event) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setPermissionDenied(true)
        listeningRef.current = false
      }
    }
    recognition.onend = () => {
      if (listeningRef.current) {
        recognition.start()
      }
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [armSilenceTimer])

  const start = useCallback(() => {
    if (!supported || listeningRef.current) return
    setPermissionDenied(false)
    transcriptRef.current = ''
    setInterimTranscript('')
    listeningRef.current = true
    startRecognizer()
    armSilenceTimer()
  }, [supported, startRecognizer, armSilenceTimer])

  const stop = useCallback(() => {
    listeningRef.current = false
    clearSilenceTimer()
    recognitionRef.current?.stop()
    recognitionRef.current = null
    transcriptRef.current = ''
    setInterimTranscript('')
  }, [clearSilenceTimer])

  useEffect(() => stop, [stop])

  return { supported, permissionDenied, interimTranscript, start, stop }
}
