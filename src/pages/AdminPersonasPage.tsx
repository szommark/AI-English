import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  fetchAdminPersonas,
  createAdminPersona,
  updateAdminPersona,
  fetchModelSettings,
  updateModelSettings,
  type AdminPersona,
  type ModelSettings,
} from '../lib/adminApi'
import { MODEL_REGISTRY, type ModelFeature, type ModelId } from '../lib/models'

const FEATURE_LABELS: Record<ModelFeature, string> = {
  rehearsal: 'Rehearsal',
  grammarCoach: 'Grammar Coach',
  tutorBot: 'Tutor Bot',
}

function PersonaRow({ persona, onSaved }: { persona: AdminPersona; onSaved: (updated: AdminPersona) => void }) {
  const [saving, setSaving] = useState<'students' | 'teachers' | null>(null)

  async function toggle(field: 'enabledForStudents' | 'enabledForTeachers', current: boolean) {
    setSaving(field === 'enabledForStudents' ? 'students' : 'teachers')
    try {
      const updated = await updateAdminPersona(persona.id, { [field]: !current })
      onSaved(updated)
    } catch {
      // Leave the row as-is; the toggle below reflects the last-known saved state.
    } finally {
      setSaving(null)
    }
  }

  return (
    <tr className="border-b border-slate-100 last:border-0">
      <td className="px-4 py-2 text-slate-700">
        {persona.display_name}
        {persona.is_builtin && <span className="ml-2 text-xs text-slate-400">(built-in)</span>}
      </td>
      <td className="px-4 py-2 text-slate-500">{persona.description}</td>
      <td className="px-4 py-2">
        <input
          type="checkbox"
          checked={persona.enabled_for_students}
          disabled={saving === 'students'}
          onChange={() => toggle('enabledForStudents', persona.enabled_for_students)}
        />
      </td>
      <td className="px-4 py-2">
        <input
          type="checkbox"
          checked={persona.enabled_for_teachers}
          disabled={saving === 'teachers'}
          onChange={() => toggle('enabledForTeachers', persona.enabled_for_teachers)}
        />
      </td>
    </tr>
  )
}

function AddPersonaForm({ onCreated }: { onCreated: (persona: AdminPersona) => void }) {
  const [displayName, setDisplayName] = useState('')
  const [description, setDescription] = useState('')
  const [promptText, setPromptText] = useState('')
  const [enabledForStudents, setEnabledForStudents] = useState(false)
  const [enabledForTeachers, setEnabledForTeachers] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPromptText(String(reader.result ?? ''))
    reader.readAsText(file)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!displayName.trim() || !promptText.trim()) {
      setError('Display name and persona text are required.')
      return
    }
    setSubmitting(true)
    try {
      const persona = await createAdminPersona({
        displayName,
        description,
        promptText,
        enabledForStudents,
        enabledForTeachers,
      })
      onCreated(persona)
      setDisplayName('')
      setDescription('')
      setPromptText('')
      setEnabledForStudents(false)
      setEnabledForTeachers(false)
    } catch {
      setError('Failed to create the persona. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
      <h3 className="font-medium text-slate-700">Add persona</h3>

      <div>
        <label className="block text-xs text-slate-500 mb-1">Display name</label>
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm"
        />
      </div>

      <div>
        <label className="block text-xs text-slate-500 mb-1">Description (shown to learners in the picker)</label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm"
        />
      </div>

      <div>
        <label className="block text-xs text-slate-500 mb-1">Persona text (.txt file)</label>
        <input type="file" accept=".txt" onChange={handleFile} className="text-sm" />
        {promptText && (
          <textarea
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            rows={6}
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-1.5 text-xs font-mono"
          />
        )}
      </div>

      <div className="flex items-center gap-4 text-sm text-slate-600">
        <label className="inline-flex items-center gap-1.5">
          <input type="checkbox" checked={enabledForStudents} onChange={(e) => setEnabledForStudents(e.target.checked)} />
          Enabled for students
        </label>
        <label className="inline-flex items-center gap-1.5">
          <input type="checkbox" checked={enabledForTeachers} onChange={(e) => setEnabledForTeachers(e.target.checked)} />
          Enabled for teachers
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {submitting ? 'Adding...' : 'Add persona'}
      </button>
    </form>
  )
}

function ModelSettingsSection() {
  const [settings, setSettings] = useState<ModelSettings | null>(null)
  const [saving, setSaving] = useState<ModelFeature | null>(null)

  useEffect(() => {
    fetchModelSettings().then(setSettings)
  }, [])

  async function handleChange(feature: ModelFeature, modelId: ModelId) {
    if (!settings) return
    const previous = settings
    setSettings({ ...settings, [feature]: modelId })
    setSaving(feature)
    try {
      await updateModelSettings({ [feature]: modelId })
    } catch {
      setSettings(previous)
    } finally {
      setSaving(null)
    }
  }

  if (!settings) return <p className="text-sm text-slate-400">Loading model settings...</p>

  return (
    <section className="space-y-3">
      <h2 className="font-medium text-slate-700">Model settings</h2>
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
        {(Object.keys(FEATURE_LABELS) as ModelFeature[]).map((feature) => (
          <div key={feature} className="flex items-center justify-between">
            <span className="text-sm text-slate-600">{FEATURE_LABELS[feature]}</span>
            <select
              value={settings[feature]}
              disabled={saving === feature}
              onChange={(e) => handleChange(feature, e.target.value as ModelId)}
              className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-700"
            >
              {MODEL_REGISTRY.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function AdminPersonasPage() {
  const [personas, setPersonas] = useState<AdminPersona[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAdminPersonas()
      .then(setPersonas)
      .catch(() => setError('Failed to load personas. Please try again.'))
  }, [])

  function handlePersonaSaved(updated: AdminPersona) {
    setPersonas((prev) => (prev ? prev.map((p) => (p.id === updated.id ? updated : p)) : prev))
  }

  function handlePersonaCreated(persona: AdminPersona) {
    setPersonas((prev) => (prev ? [...prev, persona] : [persona]))
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-800">Tutor Bot Personas</h1>
          <div className="flex items-center gap-4">
            <Link to="/admin" className="text-sm text-indigo-600 hover:underline">
              ← Admin overview
            </Link>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <section className="space-y-3">
          <h2 className="font-medium text-slate-700">Personas</h2>
          {!personas ? (
            <p className="text-sm text-slate-400">Loading...</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Description</th>
                    <th className="px-4 py-2">Students</th>
                    <th className="px-4 py-2">Teachers</th>
                  </tr>
                </thead>
                <tbody>
                  {personas.map((persona) => (
                    <PersonaRow key={persona.id} persona={persona} onSaved={handlePersonaSaved} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <AddPersonaForm onCreated={handlePersonaCreated} />

        <ModelSettingsSection />
      </main>
    </div>
  )
}
