import { useEffect, useState } from 'react'
import { fetchPersonas, type TutorPersonaSummary } from '../lib/tutorBotApi'

export default function PersonaPicker({ onSelect }: { onSelect: (personaId: string) => void }) {
  const [personas, setPersonas] = useState<TutorPersonaSummary[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPersonas()
      .then(setPersonas)
      .catch(() => setError('Failed to load tutor personas. Please try again.'))
  }, [])

  if (error) return <p className="text-sm text-red-600">{error}</p>
  if (!personas) return <p className="text-sm text-slate-400">Loading personas...</p>
  if (personas.length === 0) return <p className="text-sm text-slate-500">No tutor personas are available right now.</p>

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-800">Choose your tutor</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {personas.map((persona) => (
          <button
            key={persona.id}
            onClick={() => onSelect(persona.id)}
            className="text-left rounded-xl border border-slate-200 bg-white p-4 hover:border-indigo-400 hover:shadow-sm transition"
          >
            <p className="font-medium text-slate-800">{persona.displayName}</p>
            <p className="mt-1 text-sm text-slate-500">{persona.description}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
