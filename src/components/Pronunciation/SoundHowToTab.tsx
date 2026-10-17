import { useEffect, useState } from 'react'
import { Loader2, Mic, Volume2 } from 'lucide-react'
import type { Phoneme } from '../../data/phonemes'
import { anchorHighlight, type PhonemePractice } from '../../data/phonemePractice'
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis'
import { useLanguage } from '../../lib/i18n'
import { playSoundClip, stopSoundClip } from '../../lib/soundClip'
import { PRODUCTION_ASSESSMENT_ACCENT, type AccentPreference } from '../../lib/voiceSelection'
import { HighlightedWord } from './PhonemeTile'
import { useSoundCheck } from './useSoundCheck'

/**
 * The sheet's How to make it tab: the word card (the lone sound, the anchor word in large type and
 * the mic that checks the sound in it), then the articulation text, example words and minimal pairs.
 */
export default function SoundHowToTab({
  phoneme,
  practice,
  accent,
  onNext,
}: {
  phoneme: Phoneme
  practice?: PhonemePractice
  accent: AccentPreference
  /** Opens the Listening tab. */
  onNext: () => void
}) {
  const { lang, t } = useLanguage()
  const synth = useSpeechSynthesis('female', accent)

  const articulation =
    lang === 'hu'
      ? (phoneme.articulation.descriptionHu ?? phoneme.articulation.description)
      : lang === 'de'
        ? (practice?.descriptionDe ?? phoneme.articulation.description)
        : (practice?.descriptionEn ?? phoneme.articulation.description)

  return (
    <div className="space-y-6">
      {practice && <WordCard phoneme={phoneme} practice={practice} />}

      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div>
          <h2 className="text-sm font-medium text-foreground mb-1">{t('sndHowMouth')}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{articulation}</p>
        </div>

        <div>
          <h2 className="text-sm font-medium text-foreground mb-2">{t('sndExampleWords')}</h2>
          <ul className="flex flex-wrap gap-2">
            {phoneme.exampleWords.map((ex) => (
              <li key={ex.word}>
                <button
                  onClick={() => synth.speak(ex.word)}
                  aria-label={t('sndPlayWord', { word: ex.word })}
                  className="group inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-1.5 text-sm text-foreground hover:border-rose-200"
                >
                  {/* Wrapped so the flex gap doesn't split the word at the highlight. */}
                  <span>
                    <HighlightedWord word={ex.word} highlight={ex.highlight} />
                  </span>
                  <Volume2 className="h-3.5 w-3.5 text-muted-foreground group-hover:text-rose-600" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {phoneme.minimalPairs && phoneme.minimalPairs.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-foreground mb-2">{t('sndMinimalPairs')}</h2>
            <ul className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              {phoneme.minimalPairs.map((pair) => (
                <li key={`${pair.a}-${pair.b}`} className="rounded-lg bg-secondary px-3 py-1.5">
                  {pair.a} / {pair.b}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <button
        type="button"
        onClick={onNext}
        className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
      >
        {t('sndStageNext', { stage: t('sndHearingTab') })}
      </button>
    </div>
  )
}

/**
 * The sound and its anchor word, both playable, with the word shown large before the mic starts.
 * Both play in en-US, the accent the mic is assessed in (the lone-sound clip is en-US anyway).
 */
function WordCard({ phoneme, practice }: { phoneme: Phoneme; practice: PhonemePractice }) {
  const { t } = useLanguage()
  const wordSynth = useSpeechSynthesis('female', PRODUCTION_ASSESSMENT_ACCENT)
  const soundCheck = useSoundCheck(phoneme.id, practice.anchorWord)
  const [clipState, setClipState] = useState<'idle' | 'loading' | 'playing' | 'error'>('idle')
  const highlight = anchorHighlight(practice, phoneme.exampleWords.map((ex) => ex.highlight))

  useEffect(() => () => stopSoundClip(), [])

  async function playSound() {
    setClipState('loading')
    try {
      await playSoundClip(phoneme.id, () => setClipState('playing'))
      setClipState('idle')
    } catch (err) {
      console.error('Sound clip failed:', err)
      setClipState('error')
    }
  }

  const speakerButton =
    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground hover:bg-secondary disabled:opacity-50'
  const recording = soundCheck.status === 'recording'

  return (
    <section
      className={`rounded-2xl border bg-card p-6 text-center shadow-[var(--shadow-card)] sm:p-8 ${
        recording ? 'border-rose-400' : 'border-rose-200'
      }`}
    >
      <h2 className="text-left text-sm font-medium text-muted-foreground">{t('sndTryIt')}</h2>

      <div className="mt-2 flex items-center justify-center gap-3">
        <span className="text-3xl font-semibold text-foreground">/{phoneme.ipaSymbol}/</span>
        <button
          type="button"
          onClick={playSound}
          disabled={clipState === 'loading' || clipState === 'playing' || soundCheck.busy}
          aria-label={t('sndPlaySound')}
          title={t('sndPlaySound')}
          className={speakerButton}
        >
          {clipState === 'loading' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Volume2 className={`h-4 w-4 ${clipState === 'playing' ? 'text-rose-600' : ''}`} />
          )}
        </button>
      </div>

      <div className="mt-4 flex items-center justify-center gap-3">
        <span lang="en" className="text-5xl font-semibold tracking-tight text-foreground sm:text-6xl">
          <HighlightedWord word={practice.anchorWord} highlight={highlight} />
        </span>
        <button
          type="button"
          onClick={() => wordSynth.speak(practice.anchorWord, { rate: 0.9 })}
          disabled={soundCheck.busy}
          aria-label={t('sndPlayWord', { word: practice.anchorWord })}
          title={t('sndPlayWord', { word: practice.anchorWord })}
          className={speakerButton}
        >
          <Volume2 className="h-4 w-4" />
        </button>
      </div>

      <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground">
        {t('sndSayAnchor', { word: practice.anchorWord, ipa: phoneme.ipaSymbol })}
      </p>

      <button
        type="button"
        onClick={() => {
          window.speechSynthesis?.cancel()
          stopSoundClip()
          soundCheck.run()
        }}
        disabled={soundCheck.busy}
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-60"
      >
        <Mic className="h-4 w-4" />
        {soundCheck.status === 'done' || soundCheck.status === 'error' ? t('sndRecordAgain') : t('sndRecord')}
      </button>

      {clipState === 'error' && <p className="mt-3 text-sm text-red-600">{t('sndClipError')}</p>}
      {soundCheck.panel && <div className="mx-auto mt-5 max-w-md text-left">{soundCheck.panel}</div>}
    </section>
  )
}
