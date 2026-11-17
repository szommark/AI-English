import { Navigate, useParams } from 'react-router-dom'
import { getScenario } from '../data/scenarios'
import ConversationSession from '../components/ConversationSession'
import PrintRoleCardsButton from '../components/PrintRoleCardsButton'

export default function TestModePage() {
  const { scenarioId } = useParams()
  const scenario = scenarioId ? getScenario(scenarioId) : undefined

  if (!scenario) return <Navigate to="/" replace />

  return (
    <div className="max-w-2xl space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <p className="text-sm text-slate-500">
            Test mode — no example phrases this time. Have the conversation as best you can.
          </p>
          <PrintRoleCardsButton scenarioId={scenario.id} />
        </div>
        <ConversationSession scenario={scenario} mode="test" />
    </div>
  )
}
