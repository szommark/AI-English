import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getVoicesReliably, getVoiceOverrideName, setVoiceOverrideName } from '../lib/voiceSelection'

export default function VoiceSettingsPage() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selected, setSelected] = useState<string>(() => getVoiceOverrideName() ?? '')

  useEffect(() => {
    getVoicesReliably().then((all) => {
      setVoices(all.filter((v) => v.lang.startsWith('en')))
    })
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value
    setSelected(value)
    setVoiceOverrideName(value || null)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-md mx-auto px-4 py-8 space-y-6">
        <Link to="/conversational-english" className="text-sm text-indigo-600 hover:underline">
          ← Back
        </Link>

        <div>
          <h1 className="text-xl font-semibold text-slate-800">Voice settings</h1>
          <p className="mt-1 text-sm text-slate-500">
            By default, AI-English picks a voice that matches each character's gender. You can override that here.
          </p>
        </div>

        {voices.length === 0 ? (
          <p className="text-sm text-slate-400">No English voices found on this device.</p>
        ) : (
          <label className="block space-y-1">
            <span className="text-sm font-medium text-slate-700">Voice</span>
            <select
              value={selected}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
            >
              <option value="">Automatic (match character)</option>
              {voices.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </label>
        )}
      </main>
    </div>
  )
}
