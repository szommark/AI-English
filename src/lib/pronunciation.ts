import type * as SpeechSDKTypes from 'microsoft-cognitiveservices-speech-sdk'
import type { PronunciationCheckResult, ProsodyFlag } from './types'

// The SDK's own .d.ts for `detailResult` (PronunciationAssessmentResult.d.ts) under-models
// the actual Azure JSON response — it has no per-phoneme AccuracyScore and no
// Feedback.Prosody at all, even though the service returns both when phoneme granularity
// and enableProsodyAssessment are requested (as they are below). These interfaces describe
// the real response shape; reads are still defensive since none of it is contractually
// guaranteed by the SDK's types.
interface AzurePhonemeResult {
  Phoneme?: string
  PronunciationAssessment?: {
    AccuracyScore?: number
    NBestPhonemes?: { Phoneme?: string; Score?: number }[]
  }
}
interface AzureProsodyFeedback {
  Break?: { ErrorTypes?: string[] }
  Intonation?: { ErrorTypes?: string[] }
}
interface AzureWordResult {
  Word: string
  PronunciationAssessment?: {
    AccuracyScore?: number
    ErrorType?: string
    Feedback?: { Prosody?: AzureProsodyFeedback }
  }
  Phonemes?: AzurePhonemeResult[]
}

const PROSODY_FLAGS: ProsodyFlag[] = ['UnexpectedBreak', 'MissingBreak', 'Monotone']

// How far (0–100) the top NBest candidate must outscore the expected phoneme to count as a
// substitution. Tune against real recordings: raise if native-like speech gets flagged.
const SUBSTITUTION_MIN_MARGIN = 10

// Azure's per-phoneme AccuracyScore only measures closeness to the expected sound; the NBest
// list says what it actually heard. Returns that sound when it clearly beats the expected one.
function heardAs(p: AzurePhonemeResult): string | undefined {
  const nbest = p.PronunciationAssessment?.NBestPhonemes
  const top = nbest?.[0]
  if (!top?.Phoneme || !p.Phoneme || top.Phoneme === p.Phoneme) return undefined
  const expectedScore = nbest!.find((c) => c.Phoneme === p.Phoneme)?.Score ?? 0
  return (top.Score ?? 0) - expectedScore >= SUBSTITUTION_MIN_MARGIN ? top.Phoneme : undefined
}

// How long to wait for Azure's final result after recognition is stopped at maxSeconds.
const FINALIZE_GRACE_MS = 5000
// How long the mic + Azure connection may take before recognition counts as failed.
const CONNECT_TIMEOUT_MS = 10000

function extractProsodyFlags(prosody: AzureProsodyFeedback | undefined): ProsodyFlag[] | undefined {
  const raw = [...(prosody?.Break?.ErrorTypes ?? []), ...(prosody?.Intonation?.ErrorTypes ?? [])]
  const flags = raw.filter((f): f is ProsodyFlag => (PROSODY_FLAGS as string[]).includes(f))
  return flags.length > 0 ? flags : undefined
}

export async function runDeepCheck(params: {
  token: string
  region: string
  targetSentence: string
  maxSeconds: number
  locale?: 'en-US' | 'en-GB'
  /** Prosody feeds into the overall pronunciation score when on (the default). */
  prosody?: boolean
  /** Called once the microphone is live, i.e. when the learner should start speaking. */
  onListening?: () => void
}): Promise<PronunciationCheckResult> {
  const SpeechSDK = await import('microsoft-cognitiveservices-speech-sdk')

  const speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(params.token, params.region)
  speechConfig.speechRecognitionLanguage = params.locale ?? 'en-US'

  const pronunciationConfig = new SpeechSDK.PronunciationAssessmentConfig(
    params.targetSentence,
    SpeechSDK.PronunciationAssessmentGradingSystem.HundredMark,
    SpeechSDK.PronunciationAssessmentGranularity.Phoneme,
    true,
  )
  pronunciationConfig.enableProsodyAssessment = params.prosody ?? true
  // IPA labels match ipaSymbol in src/data/phonemes.ts; NBest is en-US only (we always assess in en-US).
  pronunciationConfig.phonemeAlphabet = 'IPA'
  pronunciationConfig.nbestPhonemeCount = 5

  const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput()
  const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig)
  pronunciationConfig.applyTo(recognizer)

  // Azure normally ends the utterance itself once it hears trailing silence, but background
  // noise can keep that from ever triggering. At maxSeconds, stopContinuousRecognitionAsync()
  // sends a proper end-of-audio so Azure finalizes the open segment (close() would abort it and
  // the final decode tends to come back NoMatch). First RecognizedSpeech segment wins; a NoMatch
  // is reported only if nothing better arrives before the session stops.
  // First segment only: a long mid-sentence pause splits the sentence and lowers Completeness;
  // concatenate segments if that shows up in the logs.
  let closed = false
  const closeRecognizer = () => {
    if (closed) return
    closed = true
    recognizer.close()
  }
  let lastHypothesis = ''
  const timers: ReturnType<typeof setTimeout>[] = []
  const recognized = await new Promise<SpeechSDKTypes.SpeechRecognitionResult>((resolve, reject) => {
    let noMatch: SpeechSDKTypes.SpeechRecognitionResult | undefined
    recognizer.recognizing = (_, e) => {
      lastHypothesis = e.result.text
    }
    recognizer.recognized = (_, e) => {
      if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) return resolve(e.result)
      if (e.result.reason !== SpeechSDK.ResultReason.NoMatch) return
      noMatch ??= e.result
      // Silence from the start: fail fast instead of waiting for the cap.
      const why = SpeechSDK.NoMatchDetails.fromResult(e.result).reason
      if (why === SpeechSDK.NoMatchReason.InitialSilenceTimeout) resolve(e.result)
    }
    recognizer.canceled = (_, e) => {
      if (e.reason !== SpeechSDK.CancellationReason.Error) return
      const info = {
        cancellationReason: SpeechSDK.CancellationReason[e.reason],
        errorCode: SpeechSDK.CancellationErrorCode[e.errorCode],
        errorDetails: e.errorDetails,
        targetSentence: params.targetSentence,
        locale: speechConfig.speechRecognitionLanguage,
      }
      console.error('[deep-check] canceled', info)
      reject(new Error(`No speech was recognized (Canceled: ${info.errorCode}: ${e.errorDetails}). Please try again.`))
    }
    recognizer.sessionStopped = () => {
      if (noMatch) resolve(noMatch)
      else reject(new Error('deep_check_timeout'))
    }
    // The speaking window runs from the moment the mic is live, so a slow connect doesn't eat into it.
    const startCap = () =>
      setTimeout(() => {
        recognizer.stopContinuousRecognitionAsync()
        timers.push(
          setTimeout(() => {
            console.error('[deep-check] no final result within grace period', {
              maxSeconds: params.maxSeconds,
              graceMs: FINALIZE_GRACE_MS,
            })
            reject(new Error('deep_check_timeout'))
          }, FINALIZE_GRACE_MS),
        )
      }, params.maxSeconds * 1000)
    const connectGuard = setTimeout(() => {
      console.error('[deep-check] recognition did not start', { connectMs: CONNECT_TIMEOUT_MS })
      reject(new Error('deep_check_timeout'))
    }, CONNECT_TIMEOUT_MS)
    timers.push(connectGuard)
    recognizer.startContinuousRecognitionAsync(
      () => {
        clearTimeout(connectGuard)
        timers.push(startCap())
        params.onListening?.()
      },
      (err) => {
        console.error('[deep-check] startContinuousRecognitionAsync error', err)
        reject(new Error(err))
      },
    )
  }).finally(() => {
    timers.forEach(clearTimeout)
    closeRecognizer()
  })

  if (recognized.reason !== SpeechSDK.ResultReason.RecognizedSpeech) {
    // Only NoMatch (silence/babble/unrecognized) lands here; Canceled rejects in the handler above.
    const reason = SpeechSDK.ResultReason[recognized.reason]
    const sub = SpeechSDK.NoMatchReason[SpeechSDK.NoMatchDetails.fromResult(recognized).reason]
    const info: Record<string, unknown> = { reason, noMatchReason: sub }
    Object.assign(info, {
      // Non-empty = Azure heard words in the partials but rejected the final decode.
      lastHypothesis,
      text: recognized.text,
      durationSec: recognized.duration / 1e7,
      offsetSec: recognized.offset / 1e7,
      targetSentence: params.targetSentence,
      locale: speechConfig.speechRecognitionLanguage,
      rawJson: recognized.properties.getProperty(SpeechSDK.PropertyId.SpeechServiceResponse_JsonResult),
    })
    console.error('[deep-check] not recognized', info)
    throw new Error(`No speech was recognized (${reason}${sub ? ': ' + sub : ''}). Please try again.`)
  }

  const assessment = SpeechSDK.PronunciationAssessmentResult.fromResult(recognized)
  const detail = assessment.detailResult
  const audioSeconds = Math.min(params.maxSeconds, recognized.duration / 1e7)

  const result: PronunciationCheckResult = {
    scores: {
      accuracy: assessment.accuracyScore,
      fluency: assessment.fluencyScore,
      completeness: assessment.completenessScore,
      pronunciation: assessment.pronunciationScore,
      prosody: assessment.prosodyScore,
    },
    words: (detail.Words ?? []).map((w) => {
      const raw = w as unknown as AzureWordResult
      return {
        word: raw.Word,
        accuracyScore: raw.PronunciationAssessment?.AccuracyScore ?? 0,
        errorType: raw.PronunciationAssessment?.ErrorType ?? 'None',
        phonemes: raw.Phonemes?.map((p) => ({
          phoneme: p.Phoneme ?? '',
          accuracyScore: p.PronunciationAssessment?.AccuracyScore ?? 0,
          heardAs: heardAs(p),
        })),
        prosodyFlags: extractProsodyFlags(raw.PronunciationAssessment?.Feedback?.Prosody),
      }
    }),
    audioSeconds,
  }

  console.groupCollapsed(`[deep-check] "${params.targetSentence}" — pron ${result.scores.pronunciation}`)
  console.log('scores', result.scores, 'audioSeconds', result.audioSeconds)
  console.table(
    result.words.flatMap((w) =>
      (w.phonemes ?? []).map((p) => ({
        word: w.word,
        wordScore: w.accuracyScore,
        errorType: w.errorType,
        phoneme: p.phoneme,
        score: p.accuracyScore,
        heardAs: p.heardAs ?? '',
      })),
    ),
  )
  console.log('raw detailResult', detail) // includes NBestPhonemes per phoneme
  console.groupEnd()
  return result
}
