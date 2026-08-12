import { Link, Navigate, useParams } from 'react-router-dom'
import { getScenario } from '../data/scenarios'
import ConversationSession from '../components/ConversationSession'

export default function TestModePage() {
  const { scenarioId } = useParams()
  const scenario = scenarioId ? getScenario(scenarioId) : undefined

  if (!scenario) return <Navigate to="/" replace />

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <Link to="/" className="text-sm text-indigo-600 hover:underline">
          ← Back to scenarios
        </Link>
        <p className="text-sm text-slate-500">
          Test mode — no example phrases this time. Have the conversation as best you can.
        </p>
        <ConversationSession scenario={scenario} mode="test" />
      </main>
    </div>
  )
}
