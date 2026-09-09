import { type AccentPreference } from '../lib/voiceSelection'

const OPTIONS: { value: AccentPreference; label: string }[] = [
  { value: 'gb', label: 'British English' },
  { value: 'us', label: 'General American' },
]

export default function AccentToggle({
  accent,
  onChange,
}: {
  accent: AccentPreference
  onChange: (next: AccentPreference) => void
}) {
  return (
    <div className="inline-flex rounded-lg border border-border bg-card p-0.5 shadow-sm">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
            accent === option.value ? 'bg-rose-100 text-rose-700' : 'text-muted-foreground hover:bg-secondary'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
