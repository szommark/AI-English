import { useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { getScenario } from '../data/scenarios'
import ConversationSession from '../components/ConversationSession'
import MouthBubbleLayer from '../components/SpeechBubble/MouthBubbleLayer'
import TranscriptLines from '../components/SpeechBubble/TranscriptLines'
import PracticeSentence from '../components/PracticeSentence'
import { scenarioPhotos } from '../assets/scenarioPhotos'

export default function RehearsalPage() {
  const { scenarioId } = useParams()
  const scenario = scenarioId ? getScenario(scenarioId) : undefined
  const [started, setStarted] = useState(false)
  const [revealedIndex, setRevealedIndex] = useState(0)
  const photoContainerRef = useRef<HTMLDivElement>(null)

  if (!scenario) return <Navigate to="/" replace />

  const photo = scenarioPhotos[scenario.id]
  const script = scenario.rehearsalScript
  const revealed = script.slice(0, revealedIndex)
  const revealedCharacterLines = revealed.filter((l) => l.speaker !== 'You')
  const revealedYouLines = revealed.filter((l) => l.speaker === 'You')
  const lastCharacterLine = revealedCharacterLines.at(-1)?.line ?? null
  const allTurns = revealed.map((l) => ({
    role: (l.speaker === 'You' ? 'user' : 'assistant') as 'user' | 'assistant',
    text: l.line,
  }))
  const isEnded = script.length > 0 && revealedIndex >= script.length

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <Link to="/" className="text-sm text-indigo-600 hover:underline">
          ← Vissza a forgatókönyvekhez
        </Link>

        {!started ? (
          <>
            <div>
              <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide">
                Holiday English (Nyaralási angol)
              </p>
              <h1 className="text-xl font-semibold text-slate-800">
                {scenario.title} ({scenario.titleHu})
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Nézd át ezeket a hasznos kifejezéseket és egy minta beszélgetést, majd kezdd el, amikor készen
                állsz. Utána saját, élő beszélgetést folytatsz a szereplővel. A hangszóró gombbal meghallgathatod
                a mondatot, a mikrofon gombbal elmondhatod és azonnali visszajelzést kapsz.
              </p>
            </div>

            <Link
              to={`/scenario/${scenario.id}/pronunciation`}
              className="block w-full text-center rounded-lg border border-indigo-600 text-indigo-600 text-sm font-medium py-2.5 hover:bg-indigo-50"
            >
              Pronunciation Centre (Kiejtésközpont) — valódi kiejtéselemzés
            </Link>

            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
              <h2 className="font-medium text-slate-700">Hasznos kifejezések</h2>
              {scenario.rehearsalPhrases.map((p, i) => (
                <PracticeSentence key={i} en={p.en} hu={p.hu} scenarioId={scenario.id} />
              ))}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
              <h2 className="font-medium text-slate-700">Minta beszélgetés</h2>

              {photo && (
                <div ref={photoContainerRef} className="relative mx-auto w-full max-w-xs">
                  <img
                    src={photo}
                    alt={scenario.title}
                    className="block h-auto w-full rounded-2xl shadow-sm"
                  />
                  <MouthBubbleLayer
                    containerRef={photoContainerRef}
                    mouth={scenario.mouth}
                    latestText={lastCharacterLine}
                    messageKey={revealedCharacterLines.length}
                    allTurns={allTurns}
                    isEnded={isEnded}
                  />
                </div>
              )}

              {/* On desktop, "You" lines now appear as bubbles on the photo too. */}
              <div className="md:hidden space-y-2 text-sm">
                {revealedYouLines.map((line, i) => (
                  <p key={i}>
                    <span className="font-medium text-slate-700">{line.speaker}: </span>
                    <span className="text-slate-600">{line.line}</span>
                  </p>
                ))}
              </div>

              {/* z-10 keeps the Next button clickable above the live bubble exchange. */}
              <div className="relative z-10">
                {revealedIndex < script.length ? (
                  <button
                    onClick={() => setRevealedIndex((i) => i + 1)}
                    className="rounded-lg border border-indigo-600 text-indigo-600 text-sm px-4 py-2 hover:bg-indigo-50"
                  >
                    Következő
                  </button>
                ) : (
                  <p className="text-xs text-slate-400">Vége a minta beszélgetésnek.</p>
                )}
              </div>

              {/* Desktop: once the sample script ends, bubbles stop and the full transcript shows here instead. */}
              {isEnded && <TranscriptLines turns={allTurns} aiLabel={scenario.aiRole} className="hidden md:block" />}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
              <div>
                <h2 className="font-medium text-slate-700">Gyakorold a beszélgetést</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Minden sort meghallgathatsz és elmondhatsz, akár a szereplő, akár a saját mondataidat.
                </p>
              </div>
              {script.map((line, i) => (
                <PracticeSentence
                  key={i}
                  en={line.line}
                  hu={line.lineHu}
                  scenarioId={scenario.id}
                  speakerLabel={line.speaker}
                />
              ))}
            </div>

            <button
              onClick={() => setStarted(true)}
              className="relative z-10 w-full rounded-lg bg-indigo-600 text-white py-2.5 text-sm font-medium hover:bg-indigo-700"
            >
              Kezdem a saját próbámat
            </button>
          </>
        ) : (
          <ConversationSession scenario={scenario} mode="rehearsal" />
        )}
      </main>
    </div>
  )
}
