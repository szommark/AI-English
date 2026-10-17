import { Mic, Volume2 } from 'lucide-react'
import type { Phoneme } from '../../data/phonemes'
import { anchorHighlight, type PhonemePractice } from '../../data/phonemePractice'
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis'
import { useLanguage } from '../../lib/i18n'
import { stopSoundClip } from '../../lib/soundClip'
import { PRODUCTION_ASSESSMENT_ACCENT, type AccentPreference } from '../../lib/voiceSelection'
import { HighlightedWord } from './PhonemeTile'
import SoundSheetCard, { SoundSymbol, speakerButtonClass } from './SoundSheetCard'
import { useSoundCheck } from './useSoundCheck'

/**
 * The sheet's How to make it tab: one card, split by a dim line. Left: the sound, the anchor word in
 * large type and the mic that checks the sound in it. Right: the articulation text and the minimal
 * pairs, each word playable. Stacked on narrow screens.
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
  // The sound and the anchor word play in en-US, the accent the mic is assessed in (the clip is en-US anyway).
  const anchorSynth = useSpeechSynthesis('female', PRODUCTION_ASSESSMENT_ACCENT)
  const soundCheck = useSoundCheck(phoneme.id, practice?.anchorWord ?? '')
  function record() {
    window.speechSynthesis?.cancel()
    stopSoundClip()
    soundCheck.run()
  }

  const articulation =
    lang === 'hu'
      ? (phoneme.articulation.descriptionHu ?? phoneme.articulation.description)
      : lang === 'de'
        ? (practice?.descriptionDe ?? phoneme.articulation.description)
        : (practice?.descriptionEn ?? phoneme.articulation.description)

  function wordButton(word: string) {
    return (
      <button
        type="button"
        onClick={() => synth.speak(word)}
        aria-label={t('sndPlayWord', { word })}
        className="group inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-foreground hover:bg-card"
      >
        {word}
        <Volume2 className="h-3.5 w-3.5 text-muted-foreground group-hover:text-rose-600" />
      </button>
    )
  }

  return (
    <div className="space-y-6">
      <SoundSheetCard
        active={soundCheck.status === 'recording'}
        className={`grid gap-6 md:gap-8 ${practice ? 'md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]' : ''}`}
      >
        {practice && (
          <div className="space-y-4">
            <h2 className="text-sm font-medium text-muted-foreground">{t('sndTryIt')}</h2>

            <SoundSymbol phonemeId={phoneme.id} ipaSymbol={phoneme.ipaSymbol} disabled={soundCheck.busy} />

            <div className="flex items-center gap-3">
              <span lang="en" className="text-5xl font-semibold tracking-tight text-foreground sm:text-6xl">
                <HighlightedWord
                  word={practice.anchorWord}
                  highlight={anchorHighlight(practice, phoneme.exampleWords.map((ex) => ex.highlight))}
                />
              </span>
              <button
                type="button"
                onClick={() => anchorSynth.speak(practice.anchorWord, { rate: 0.9 })}
                disabled={soundCheck.busy}
                aria-label={t('sndPlayWord', { word: practice.anchorWord })}
                title={t('sndPlayWord', { word: practice.anchorWord })}
                className={speakerButtonClass}
              >
                <Volume2 className="h-4 w-4" />
              </button>
            </div>

            <p className="max-w-xs text-sm text-muted-foreground">
              {t('sndSayAnchor', { word: practice.anchorWord, ipa: phoneme.ipaSymbol })}
            </p>

            <button
              type="button"
              onClick={record}
              disabled={soundCheck.busy}
              className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-60"
            >
              <Mic className="h-4 w-4" />
              {soundCheck.status === 'done' || soundCheck.status === 'error' ? t('sndRecordAgain') : t('sndRecord')}
            </button>

            {soundCheck.panel}
          </div>
        )}

        <div className={`space-y-5 ${practice ? 'border-t border-border pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0' : ''}`}>
          <div>
            <h2 className="mb-1 text-sm font-medium text-foreground">{t('sndHowMouth')}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{articulation}</p>
          </div>

          {phoneme.minimalPairs && phoneme.minimalPairs.length > 0 && (
            <div>
              <h2 className="mb-2 text-sm font-medium text-foreground">{t('sndMinimalPairs')}</h2>
              <ul className="flex flex-wrap gap-2 text-sm">
                {phoneme.minimalPairs.map((pair) => (
                  <li key={`${pair.a}-${pair.b}`} className="inline-flex items-center rounded-lg bg-secondary p-0.5">
                    {wordButton(pair.a)}
                    <span className="text-muted-foreground">/</span>
                    {wordButton(pair.b)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </SoundSheetCard>

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
