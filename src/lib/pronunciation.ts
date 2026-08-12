import type * as SpeechSDKTypes from 'microsoft-cognitiveservices-speech-sdk'
import type { PronunciationCheckResult } from './types'

export async function runDeepCheck(params: {
  token: string
  region: string
  targetSentence: string
  maxSeconds: number
}): Promise<PronunciationCheckResult> {
  const SpeechSDK = await import('microsoft-cognitiveservices-speech-sdk')

  const speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(params.token, params.region)
  speechConfig.speechRecognitionLanguage = 'en-US'

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

  const recognized = await Promise.race<SpeechSDKTypes.SpeechRecognitionResult>([
    new Promise<SpeechSDKTypes.SpeechRecognitionResult>((resolve, reject) => {
      recognizer.recognizeOnceAsync(resolve, (err) => reject(new Error(err)))
    }),
    new Promise<SpeechSDKTypes.SpeechRecognitionResult>((_, reject) => {
      setTimeout(() => reject(new Error('deep_check_timeout')), params.maxSeconds * 1000)
    }),
  ]).finally(() => {
    recognizer.close()
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
    },
    words: (detail.Words ?? []).map((w) => ({
      word: w.Word,
      accuracyScore: w.PronunciationAssessment?.AccuracyScore ?? 0,
      errorType: w.PronunciationAssessment?.ErrorType ?? 'None',
    })),
    audioSeconds,
  }
}
