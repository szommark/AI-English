import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  getVoicesReliably,
  getVoiceOverrideName,
  setVoiceOverrideName,
  getAccentPreference,
  setAccentPreference,
  type AccentPreference,
} from '../lib/voiceSelection'

export default function VoiceSettingsPage() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selected, setSelected] = useState<string>(() => getVoiceOverrideName() ?? '')
  const [accent, setAccent] = useState<AccentPreference>(() => getAccentPreference())

  function handleAccentChange(next: AccentPreference) {
    setAccent(next)
    setAccentPreference(next)
  }

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

        <div className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Accent (Pronunciation Session)</span>
          <p className="text-xs text-slate-500">
            Controls both the practice audio and how your recordings are scored in the Pronunciation Session.
          </p>
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm">
            {(
              [
                { value: 'gb' as const, label: 'British English' },
                { value: 'us' as const, label: 'General American' },
              ]
            ).map((option) => (
              <button
                key={option.value}
                onClick={() => handleAccentChange(option.value)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  accent === option.value ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
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
