import { useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { getScenario } from '../data/scenarios'
import ConversationSession from '../components/ConversationSession'
import MouthBubbleLayer from '../components/SpeechBubble/MouthBubbleLayer'
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
  const totalExchanges = script.filter((l) => l.speaker !== 'You').length

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <Link to="/" className="text-sm text-indigo-600 hover:underline">
          ← Back to scenarios
        </Link>

        {!started ? (
          <>
            <div>
              <h1 className="text-xl font-semibold text-slate-800">{scenario.title} — Rehearsal</h1>
              <p className="text-sm text-slate-500 mt-1">
                Review these example phrases and a sample conversation, then start when you're ready.
                You'll have your own live conversation with {scenario.aiRole} right after.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="font-medium text-slate-700 mb-2">Useful phrases</h2>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
                {scenario.rehearsalPhrases.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
              <h2 className="font-medium text-slate-700">Sample conversation</h2>

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
                    totalExchanges={totalExchanges}
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

              {/* z-10 keeps the Next button clickable above the desktop bubble cascade,
                  which is allowed to overflow well past the photo's bounds. */}
              <div className="relative z-10">
                {revealedIndex < script.length ? (
                  <button
                    onClick={() => setRevealedIndex((i) => i + 1)}
                    className="rounded-lg border border-indigo-600 text-indigo-600 text-sm px-4 py-2 hover:bg-indigo-50"
                  >
                    Next
                  </button>
                ) : (
                  <p className="text-xs text-slate-400">End of sample conversation.</p>
                )}
              </div>
            </div>

            <button
              onClick={() => setStarted(true)}
              className="relative z-10 w-full rounded-lg bg-indigo-600 text-white py-2.5 text-sm font-medium hover:bg-indigo-700"
            >
              Start my own attempt
            </button>
          </>
        ) : (
          <ConversationSession scenario={scenario} mode="rehearsal" />
        )}
      </main>
    </div>
  )
}
