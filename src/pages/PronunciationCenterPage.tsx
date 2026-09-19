import { Navigate, useParams } from 'react-router-dom'
import { getScenario } from '../data/scenarios'
import PracticeSentence from '../components/PracticeSentence'

export default function PronunciationCenterPage() {
  const { scenarioId } = useParams()
  const scenario = scenarioId ? getScenario(scenarioId) : undefined

  if (!scenario) return <Navigate to="/" replace />

  return (
    <div className="max-w-2xl space-y-6">
        <div>
          <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide">
            Holiday English (Nyaralási angol) · {scenario.title} ({scenario.titleHu})
          </p>
          <h1 className="text-xl font-semibold text-slate-800">Pronunciation Centre (Kiejtésközpont)</h1>
          <p className="text-sm text-slate-500 mt-1">
            Hallgasd meg a mondatot a hangszóró gombbal, majd nyomd meg a Kiejtésellenőrzés gombot, és mondd el
            hangosan. Valódi, Azure-alapú kiejtéselemzést kapsz pontossági, folyékonysági és teljességi
            pontszámmal.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
          {scenario.rehearsalPhrases.map((p, i) => (
            <PracticeSentence key={i} en={p.en} hu={p.hu} scenarioId={scenario.id} showDeepCheck />
          ))}
        </div>
    </div>
  )
}
