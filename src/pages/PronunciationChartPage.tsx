import { Link } from 'react-router-dom'
import { useState } from 'react'
import { difficultTierPhonemes, straightforwardPhonemes } from '../data/phonemes'
import { getAccentPreference, setAccentPreference, type AccentPreference } from '../lib/voiceSelection'
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis'
import AccentToggle from '../components/AccentToggle'
import PhonemeTile from '../components/Pronunciation/PhonemeTile'

export default function PronunciationChartPage() {
  const [accent, setAccent] = useState<AccentPreference>(() => getAccentPreference())
  const { speak } = useSpeechSynthesis('female', accent)

  function handleAccentChange(next: AccentPreference) {
    setAccent(next)
    setAccentPreference(next)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="max-w-6xl mx-auto flex items-center justify-between px-4 py-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Pronunciation Chart</h1>
          <p className="text-sm text-muted-foreground">
            Kiejtési térkép — vidd az egeret egy hangra a meghallgatáshoz
          </p>
        </div>
        <div className="flex items-center gap-4">
          <AccentToggle accent={accent} onChange={handleAccentChange} />
          <Link to="/" className="text-sm text-primary hover:underline">
            ← Vissza a főoldalra
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pb-12 space-y-8">
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
          Az öt kiemelt hanghoz (θ, ð, w, æ, ə) már elérhetők gyakorlatok — ezt a "Exercises" jelzés mutatja. A
          részletes nézet és a gyakorlatok megnyitása a következő fejlesztési fázisban érkezik.
        </p>
      </main>
    </div>
  )
}
