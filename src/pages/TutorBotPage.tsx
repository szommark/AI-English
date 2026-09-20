import { useState } from 'react'
import TutorBotSession from '../components/TutorBotSession'
import PersonaPicker from '../components/PersonaPicker'

export default function TutorBotPage() {
  const [personaId, setPersonaId] = useState<string | null>(null)

  return (
    <div className="max-w-2xl space-y-6">
        {personaId ? <TutorBotSession personaId={personaId} /> : <PersonaPicker onSelect={setPersonaId} />}
    </div>
  )
}
