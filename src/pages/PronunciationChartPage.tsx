import { useEffect, useState } from 'react'
import { difficultTierPhonemes, straightforwardPhonemes } from '../data/phonemes'
import { getAccentPreference, setAccentPreference, type AccentPreference } from '../lib/voiceSelection'
import { fetchPronunciationProgress, type PronunciationProgressEntry } from '../lib/pronunciationProgressApi'
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis'
import AccentToggle from '../components/AccentToggle'
import PhonemeTile from '../components/Pronunciation/PhonemeTile'
import ResurfaceQueue from '../components/Pronunciation/ResurfaceQueue'
import PageHeading from '../components/PageHeading'
import { localizeFeature, useLanguage } from '../lib/i18n'
import { getFeature } from '../data/features'

const pronunciationFeature = getFeature('pronunciation-session')!

export default function PronunciationChartPage() {
  const { lang, t } = useLanguage()
  const [accent, setAccent] = useState<AccentPreference>(() => getAccentPreference())
  const [progress, setProgress] = useState<PronunciationProgressEntry[]>([])
  const { speak } = useSpeechSynthesis('female', accent)

  useEffect(() => {
    fetchPronunciationProgress().then(setProgress)
  }, [])

  function handleAccentChange(next: AccentPreference) {
    setAccent(next)
    setAccentPreference(next)
  }

  return (
    <div className="space-y-8">
      <PageHeading
        title={localizeFeature(lang, pronunciationFeature).title}
        subtitle={t('pronunciationSubtitle')}
        actions={<AccentToggle accent={accent} onChange={handleAccentChange} />}
      />

      <div className="space-y-8">
        <ResurfaceQueue progress={progress} />

        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">
            Nehezebb hangok magyar anyanyelvűeknek
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {difficultTierPhonemes.map((phoneme) => (
              <PhonemeTile key={phoneme.id} phoneme={phoneme} onHover={speak} />
            ))}
          </div>
        </section>

        <div className="border-t border-border" />

        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Könnyebben elsajátítható hangok</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {straightforwardPhonemes.map((phoneme) => (
              <PhonemeTile key={phoneme.id} phoneme={phoneme} onHover={speak} />
            ))}
          </div>
        </section>

        <p className="text-xs text-muted-foreground">
          Kattints egy hangra a részletes nézethez. Az öt kiemelt hanghoz (θ, ð, w, æ, ə) már elérhetők
          gyakorlatok is — ezt a "Exercises" jelzés mutatja.
        </p>
      </div>
    </div>
  )
}
