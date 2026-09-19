import { Navigate, useParams } from 'react-router-dom'
import { getScenario } from '../data/scenarios'
import ConversationSession from '../components/ConversationSession'

export default function TestModePage() {
  const { scenarioId } = useParams()
  const scenario = scenarioId ? getScenario(scenarioId) : undefined

  if (!scenario) return <Navigate to="/" replace />

  return (
    <div className="max-w-2xl space-y-6">
        <p className="text-sm text-slate-500">
          Test mode — no example phrases this time. Have the conversation as best you can.
        </p>
        <ConversationSession scenario={scenario} mode="test" />
    </div>
  )
}
