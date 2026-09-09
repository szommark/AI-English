import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Volume2 } from 'lucide-react'
import { getPhoneme } from '../data/phonemes'
import { getSoundItem } from '../data/pronunciationCurriculum'
import { getAccentPreference, setAccentPreference, type AccentPreference } from '../lib/voiceSelection'
import { fetchPronunciationProgress, type PronunciationProgressEntry } from '../lib/pronunciationProgressApi'
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis'
import AccentToggle from '../components/AccentToggle'
import { HighlightedWord } from '../components/Pronunciation/PhonemeTile'
import ArticulationRig from '../components/Pronunciation/ArticulationRig'
import SwipeCardExercise from '../components/Pronunciation/SwipeCardExercise'
import DrillFunnel from '../components/PronunciationSession/DrillFunnel'

export default function PhonemeDetailPage() {
  const { phonemeId } = useParams<{ phonemeId: string }>()
  const phoneme = phonemeId ? getPhoneme(phonemeId) : undefined
  const soundItem = phoneme?.curriculumId ? getSoundItem(phoneme.curriculumId) : undefined

  const [accent, setAccent] = useState<AccentPreference>(() => getAccentPreference())
  const [progress, setProgress] = useState<PronunciationProgressEntry | null>(null)
  const [completed, setCompleted] = useState(false)
  const [swipeResult, setSwipeResult] = useState<{ score: number; total: number } | null>(null)
  const [attemptKey, setAttemptKey] = useState(0)
  const synth = useSpeechSynthesis('female', accent)

  useEffect(() => {
    if (!soundItem) return
    fetchPronunciationProgress().then((entries) => {
      setProgress(entries.find((p) => p.soundItemId === soundItem.id) ?? null)
    })
  }, [soundItem])

  function handleAccentChange(next: AccentPreference) {
    setAccent(next)
    setAccentPreference(next)
  }

  function handleItemComplete() {
    setCompleted(true)
    if (!soundItem) return
    fetchPronunciationProgress().then((entries) => {
      setProgress(entries.find((p) => p.soundItemId === soundItem.id) ?? null)
    })
  }

  function handleSwipeComplete(score: number, total: number) {
    setSwipeResult({ score, total })
    setCompleted(true)
  }

  function practiceAgain() {
    setCompleted(false)
    setSwipeResult(null)
    setAttemptKey((k) => k + 1)
  }

  if (!phoneme) {
    return (
      <div className="min-h-screen bg-background">
        <main className="max-w-2xl mx-auto px-4 py-12 text-center space-y-4">
          <p className="text-sm text-muted-foreground">Ez a hang nem található.</p>
          <Link to="/pronunciation" className="text-sm text-primary hover:underline">
            ← Vissza a kiejtési térképhez
          </Link>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="max-w-4xl mx-auto flex items-center justify-between px-4 py-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">/{phoneme.ipaSymbol}/</h1>
          <p className="text-sm text-muted-foreground">{phoneme.hungarianNoteHu}</p>
        </div>
        <div className="flex items-center gap-4">
          <AccentToggle accent={accent} onChange={handleAccentChange} />
          <Link to="/pronunciation" className="text-sm text-primary hover:underline">
            ← Vissza a térképhez
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pb-12 space-y-6">
        <section className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div>
            <h2 className="text-sm font-medium text-foreground mb-1">Képzés</h2>
            {phoneme.hungarianDifficulty === 'critical' && (
              <div className="max-w-sm mb-2">
                <ArticulationRig articulation={phoneme.articulation} />
              </div>
            )}
            <p className="text-sm text-muted-foreground">{phoneme.articulation.description}</p>
          </div>

          <div>
            <h2 className="text-sm font-medium text-foreground mb-2">Példaszavak</h2>
            <ul className="flex flex-wrap gap-2">
              {phoneme.exampleWords.map((ex) => (
                <li key={ex.word}>
                  <button
                    onClick={() => synth.speak(ex.word)}
                    className="group inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-1.5 text-sm text-foreground hover:border-rose-200"
                  >
                    <HighlightedWord word={ex.word} highlight={ex.highlight} />
                    <Volume2 className="h-3.5 w-3.5 text-muted-foreground group-hover:text-rose-600" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {phoneme.minimalPairs && phoneme.minimalPairs.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-foreground mb-2">Minimálpárok</h2>
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

        {completed ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center space-y-3">
            <p className="text-sm font-medium text-rose-700">
              {swipeResult
                ? `Szép munka! ${swipeResult.score}/${swipeResult.total} helyes válasz.`
                : 'Szép munka! Ezt a hangot most gyakoroltad.'}
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={practiceAgain}
                className="rounded-lg border border-rose-300 text-rose-700 text-sm font-medium px-4 py-2 hover:bg-rose-100"
              >
                Gyakorlás újra
              </button>
              <Link
                to="/pronunciation"
                className="rounded-lg bg-rose-600 text-white text-sm font-medium px-4 py-2 hover:bg-rose-700"
              >
                Vissza a térképhez
              </Link>
            </div>
          </div>
        ) : soundItem ? (
          <DrillFunnel
            key={attemptKey}
            soundItem={soundItem}
            accent={accent}
            hasPriorAttempt={Boolean(progress?.attempts)}
            onItemComplete={handleItemComplete}
          />
        ) : phoneme.swipeWords && phoneme.swipeWords.length > 0 ? (
          <SwipeCardExercise key={attemptKey} phoneme={phoneme} accent={accent} onComplete={handleSwipeComplete} />
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-card p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Ehhez a hanghoz még nincs gyakorlat — hamarosan érkezik.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
