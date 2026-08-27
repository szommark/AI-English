import { useState } from 'react'
import { MODEL_REGISTRY, type ModelId } from '../lib/models'
import { getModelPreference, setModelPreference, type ModelFeature } from '../lib/modelSelection'

export default function ModelPicker({ feature }: { feature: ModelFeature }) {
  const [modelId, setModelId] = useState<ModelId>(() => getModelPreference(feature))

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value as ModelId
    setModelId(value)
    setModelPreference(feature, value)
  }

  return (
    <label className="inline-flex items-center gap-1.5 text-xs text-slate-500">
      <span>AI model</span>
      <select
        value={modelId}
        onChange={handleChange}
        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700"
      >
        {MODEL_REGISTRY.map((m) => (
          <option key={m.id} value={m.id}>
            {m.label}
          </option>
        ))}
      </select>
    </label>
  )
}
