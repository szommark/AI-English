import { useEffect, useState } from 'react'
import {
  fetchAdminPersonas,
  createAdminPersona,
  updateAdminPersona,
  fetchModelSettings,
  updateModelSettings,
  type AdminPersona,
  type ModelSettings,
} from '../lib/adminApi'
import { MODEL_FEATURES, MODEL_REGISTRY, type ModelFeature, type ModelId } from '../lib/models'

const FEATURE_LABELS: Record<ModelFeature, { title: string; covers: string }> = {
  rehearsal: { title: 'Rehearsal', covers: 'Scenario conversations and their feedback, learner profile updates' },
  grammarCoach: { title: 'Grammar Coach', covers: 'Grammar lessons, written practice, Past · Present · Future game' },
  tutorBot: { title: 'Tutor Bot', covers: 'Tutor Bot chat and feedback, speaking exam, mini course role-play' },
  vocabulary: { title: 'Vocabulary', covers: 'Word enrichment, topic word lists, lyrics gap-fill suggestions' },
  courses: { title: 'Mini courses', covers: 'Unit and module writing, gap check, answer marking, flag checks and fixes' },
  examTasks: { title: 'Exam task maker', covers: 'Listening task writing and revising, web source finder analysis' },
  compTests: { title: 'Comprehension tests', covers: 'Reading and listening test writing' },
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
  const [available, setAvailable] = useState<Set<ModelId>>(new Set())
  const [saving, setSaving] = useState<ModelFeature | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchModelSettings()
      .then((r) => {
        setSettings(r.settings)
        setAvailable(new Set(r.available))
      })
      .catch(() => setError('Failed to load model settings.'))
  }, [])

  async function handleChange(feature: ModelFeature, modelId: ModelId) {
    if (!settings) return
    const previous = settings
    setSettings({ ...settings, [feature]: modelId })
    setSaving(feature)
    setError(null)
    try {
      await updateModelSettings({ [feature]: modelId })
    } catch (err) {
      setSettings(previous)
      setError(err instanceof Error ? err.message : 'Failed to save model settings.')
    } finally {
      setSaving(null)
    }
  }

  if (!settings) return <p className="text-sm text-slate-400">{error ?? 'Loading model settings...'}</p>

  return (
    <section className="space-y-3">
      <h2 className="font-medium text-slate-700">Model settings</h2>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
        {MODEL_FEATURES.map((feature) => {
          const chosen = MODEL_REGISTRY.find((m) => m.id === settings[feature])
          return (
            <div key={feature} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-700">{FEATURE_LABELS[feature].title}</p>
                <p className="text-xs text-slate-500">{FEATURE_LABELS[feature].covers}</p>
              </div>
              <div className="sm:w-72 sm:shrink-0">
                <select
                  value={settings[feature]}
                  disabled={saving === feature}
                  onChange={(e) => handleChange(feature, e.target.value as ModelId)}
                  aria-label={`Model for ${FEATURE_LABELS[feature].title}`}
                  className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-700"
                >
                  {MODEL_REGISTRY.map((m) => (
                    <option key={m.id} value={m.id} disabled={!available.has(m.id) && m.id !== settings[feature]}>
                      {available.has(m.id) ? m.label : `${m.label} (no API key)`}
                    </option>
                  ))}
                </select>
                {chosen && <p className="mt-1 text-xs text-slate-500">{chosen.cost}</p>}
              </div>
            </div>
          )
        })}
      </div>
      <p className="text-xs text-slate-500">
        Course, exam task and comprehension test generation fall back to GPT-OSS 120B (or Gemini, when GPT-OSS is the chosen model) if the chosen model fails.
        A model shows "no API key" until its key is added to the Vercel environment.
      </p>
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
    <div className="max-w-4xl space-y-8">
        <h1 className="text-xl font-semibold text-slate-800">Tutor Bot Personas</h1>

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
    </div>
  )
}
