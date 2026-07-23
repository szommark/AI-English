import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { getScenario } from '../data/scenarios'
import ConversationSession from '../components/ConversationSession'

export default function RehearsalPage() {
  const { scenarioId } = useParams()
  const scenario = scenarioId ? getScenario(scenarioId) : undefined
  const [started, setStarted] = useState(false)

  if (!scenario) return <Navigate to="/" replace />

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

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="font-medium text-slate-700 mb-2">Sample conversation</h2>
              <div className="space-y-2 text-sm">
                {scenario.rehearsalScript.map((line, i) => (
                  <p key={i}>
                    <span className="font-medium text-slate-700">{line.speaker}: </span>
                    <span className="text-slate-600">{line.line}</span>
                  </p>
                ))}
              </div>
            </div>

            <button
              onClick={() => setStarted(true)}
              className="w-full rounded-lg bg-indigo-600 text-white py-2.5 text-sm font-medium hover:bg-indigo-700"
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
