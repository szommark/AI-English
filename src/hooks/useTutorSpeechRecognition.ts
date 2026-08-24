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

// How long to wait for the learner to start speaking at all before treating the
// turn as silence. Generous, since thinking-before-speaking shouldn't feel rushed.
const NO_SPEECH_TIMEOUT_MS = 8000
// How long to wait, once speech has begun, before deciding the learner has finished
// their sentence. Short enough to feel responsive, long enough to survive a
// mid-sentence breath or thinking pause.
const END_OF_SPEECH_SILENCE_MS = 1800

// Toggle verbose per-result logging without a redeploy: localStorage.setItem('tutorBot:debugSpeech', '1')
const DEBUG_SPEECH = typeof window !== 'undefined' && window.localStorage.getItem('tutorBot:debugSpeech') === '1'

function logSpeechDebug(...args: unknown[]) {
  if (DEBUG_SPEECH) console.debug('[tutor-speech]', new Date().toISOString(), ...args)
}

/** Concatenates two transcript fragments, inserting a space between them if needed. */
function joinTranscript(a: string, b: string): string {
  if (!a) return b
  if (!b) return a
  return a.endsWith(' ') || b.startsWith(' ') ? a + b : `${a} ${b}`
}

export interface UseTutorSpeechRecognitionParams {
  /** Fired once silence follows a non-empty transcript. */
  onUtterance: (text: string) => void
  /** Fired once silence follows an empty listening window. */
  onSilenceTimeout: () => void
}

/**
 * Continuous, silence-based speech recognition for the Tutor Bot screen (as opposed to
 * useSpeechRecognition's tap-to-start/tap-to-stop model used by the scenario screens).
 *
 * Chrome's continuous mode frequently ends the recognizer on its own mid-utterance (its
 * own VAD deciding a phrase is "done", unrelated to `continuous`/`interimResults`); this
 * hook restarts it transparently for as long as `start()` hasn't been followed by `stop()`.
 * Because a restart resets the recognizer's own `results` list, the transcript built up
 * before the restart is carried forward in `committedRef` so it isn't lost.
 */
export function useTutorSpeechRecognition({ onUtterance, onSilenceTimeout }: UseTutorSpeechRecognitionParams) {
  const [supported] = useState(() => getSpeechRecognitionCtor() !== null)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [interimTranscript, setInterimTranscript] = useState('')

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const listeningRef = useRef(false)
  const transcriptRef = useRef('')
  // Transcript carried over from prior recognizer sessions within the same turn (see restart note above).
  const committedRef = useRef('')
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

  // hasSpeech picks which timeout governs this window: the generous "waiting for the
  // learner to start" one, or the shorter "did they just finish talking" one. Re-armed
  // on every interim result so a mid-sentence pause never ends the turn early.
  const armSilenceTimer = useCallback(
    (hasSpeech: boolean) => {
      clearSilenceTimer()
      const delay = hasSpeech ? END_OF_SPEECH_SILENCE_MS : NO_SPEECH_TIMEOUT_MS
      silenceTimerRef.current = setTimeout(() => {
        const text = transcriptRef.current.trim()
        transcriptRef.current = ''
        committedRef.current = ''
        setInterimTranscript('')
        listeningRef.current = false
        recognitionRef.current?.stop()

        logSpeechDebug('silence timeout fired', { hasSpeech, delay, text })

        if (text) {
          onUtteranceRef.current(text)
        } else {
          onSilenceTimeoutRef.current()
        }
      }, delay)
    },
    [clearSilenceTimer],
  )

  const startRecognizer = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor()
    if (!Ctor) return

    const recognition = new Ctor()
    recognition.lang = 'en-US'
    recognition.continuous = true
    recognition.interimResults = true

    // Per spec, .stop() doesn't end a session synchronously — a superseded or
    // already-finalized instance can still deliver a trailing onresult/onend. Since
    // transcriptRef/committedRef/listeningRef are shared across instances (not scoped
    // per recognizer), an unguarded late event from a stale instance can resurrect an
    // already-submitted transcript and re-arm the silence timer, firing onUtterance a
    // second time for the same speech. Every handler below checks it's still the
    // instance currently referenced (not superseded by a newer start()) and that we're
    // still meant to be listening (not already finalized) before touching shared state.
    const isActive = () => recognitionRef.current === recognition && listeningRef.current

    recognition.onresult = (event) => {
      if (!isActive()) return

      let sessionText = ''
      for (let i = 0; i < event.results.length; i++) {
        sessionText += event.results[i][0].transcript
      }
      const combined = joinTranscript(committedRef.current, sessionText)
      transcriptRef.current = combined
      setInterimTranscript(combined)

      if (DEBUG_SPEECH) {
        const lastResult = event.results[event.results.length - 1]
        logSpeechDebug('onresult', { isFinal: lastResult?.isFinal ?? false, cumulative: combined })
      }

      armSilenceTimer(combined.trim().length > 0)
    }
    recognition.onerror = (event) => {
      logSpeechDebug('onerror', event.error)
      if (recognitionRef.current !== recognition) return
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setPermissionDenied(true)
        listeningRef.current = false
      }
    }
    recognition.onend = () => {
      const stillCurrent = recognitionRef.current === recognition
      logSpeechDebug('onend', {
        stillCurrent,
        willRestart: stillCurrent && listeningRef.current,
        transcriptSoFar: transcriptRef.current,
      })
      if (stillCurrent && listeningRef.current) {
        // Preserve whatever we'd captured so far — the next session's `results` starts empty.
        committedRef.current = transcriptRef.current
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
    committedRef.current = ''
    setInterimTranscript('')
    listeningRef.current = true
    startRecognizer()
    armSilenceTimer(false)
  }, [supported, startRecognizer, armSilenceTimer])

  const stop = useCallback(() => {
    listeningRef.current = false
    clearSilenceTimer()
    recognitionRef.current?.stop()
    recognitionRef.current = null
    transcriptRef.current = ''
    committedRef.current = ''
    setInterimTranscript('')
  }, [clearSilenceTimer])

  useEffect(() => stop, [stop])

  return { supported, permissionDenied, interimTranscript, start, stop }
}
