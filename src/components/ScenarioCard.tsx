import { Link } from 'react-router-dom'
import type { Scenario } from '../lib/types'
import { scenarioPhotos } from '../assets/scenarioPhotos'

export default function ScenarioCard({ scenario }: { scenario: Scenario }) {
  const photo = scenarioPhotos[scenario.id]

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden transition hover:shadow-lg hover:-translate-y-0.5">
      <div className="h-44 overflow-hidden">
        {photo && (
          <img
            src={photo}
            alt={scenario.title}
            className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
          />
        )}
      </div>

      <div className="p-5">
        <h2 className="font-semibold text-slate-800">{scenario.title}</h2>
        <p className="text-sm text-slate-500 mt-1">{scenario.description}</p>
        <div className="mt-4 flex gap-2">
          <Link
            to={`/scenario/${scenario.id}/rehearsal`}
            className="flex-1 text-center rounded-lg border border-indigo-600 text-indigo-600 text-sm py-2 hover:bg-indigo-50"
          >
            Rehearsal
          </Link>
          <Link
            to={`/scenario/${scenario.id}/test`}
            className="flex-1 text-center rounded-lg bg-indigo-600 text-white text-sm py-2 hover:bg-indigo-700"
          >
            Test mode
          </Link>
        </div>
      </div>
    </div>
  )
}
