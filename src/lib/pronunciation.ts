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
  PronunciationAssessment?: { AccuracyScore?: number }
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

// How long to wait for Azure's final result after the mic is force-stopped at maxSeconds.
const FINALIZE_GRACE_MS = 5000

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
  pronunciationConfig.enableProsodyAssessment = true

  const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput()
  const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig)
  pronunciationConfig.applyTo(recognizer)

  // Azure normally ends the utterance itself once it hears trailing silence, but background
  // noise can keep that from ever triggering. Hitting maxSeconds therefore doesn't discard the
  // attempt: close() turns the mic off and flushes the final audio, and Azure then finalizes
  // what it heard and delivers it through the same recognizeOnceAsync callback. Only if that
  // flush also stalls do we give up.
  let closed = false
  const closeRecognizer = () => {
    if (closed) return
    closed = true
    recognizer.close()
  }
  const timers: ReturnType<typeof setTimeout>[] = []
  const recognized = await new Promise<SpeechSDKTypes.SpeechRecognitionResult>((resolve, reject) => {
    recognizer.recognizeOnceAsync(resolve, (err) => reject(new Error(err)))
    timers.push(
      setTimeout(() => {
        closeRecognizer()
        timers.push(setTimeout(() => reject(new Error('deep_check_timeout')), FINALIZE_GRACE_MS))
      }, params.maxSeconds * 1000),
    )
  }).finally(() => {
    timers.forEach(clearTimeout)
    closeRecognizer()
  })

  if (recognized.reason !== SpeechSDK.ResultReason.RecognizedSpeech) {
    throw new Error('No speech was recognized. Please try again.')
  }

  const assessment = SpeechSDK.PronunciationAssessmentResult.fromResult(recognized)
  const detail = assessment.detailResult
  const audioSeconds = Math.min(params.maxSeconds, recognized.duration / 1e7)

  return {
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
        })),
        prosodyFlags: extractProsodyFlags(raw.PronunciationAssessment?.Feedback?.Prosody),
      }
    }),
    audioSeconds,
  }
}
