import { difficultTierPhonemes, straightforwardPhonemes } from '../../data/phonemes'
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis'
import type { AccentPreference } from '../../lib/voiceSelection'
import PhonemeTile from './PhonemeTile'

/** The Sound Bank tab of /pronunciation: the phoneme chart. */
export default function SoundBankTab({ accent }: { accent: AccentPreference }) {
  const { speak } = useSpeechSynthesis('female', accent)

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">
          Nehezebb hangok magyar anyanyelvűeknek
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {difficultTierPhonemes.map((phoneme) => (
            <PhonemeTile key={phoneme.id} phoneme={phoneme} onSpeak={speak} />
          ))}
        </div>
      </section>

      <div className="border-t border-border" />

      <section>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Könnyebben elsajátítható hangok</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {straightforwardPhonemes.map((phoneme) => (
            <PhonemeTile key={phoneme.id} phoneme={phoneme} onSpeak={speak} />
          ))}
        </div>
      </section>

      <p className="text-xs text-muted-foreground">
        Kattints egy hangra a részletes nézethez. Az öt kiemelt hanghoz (θ, ð, w, æ, ə) már elérhetők
        gyakorlatok is — ezt a "Exercises" jelzés mutatja.
      </p>
    </div>
  )
}
