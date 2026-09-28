import { type AccentPreference } from '../lib/voiceSelection'

const OPTIONS: { value: AccentPreference; label: string }[] = [
  { value: 'gb', label: 'British English' },
  { value: 'us', label: 'General American' },
]

export default function AccentToggle({
  accent,
  onChange,
  disabled = false,
}: {
  accent: AccentPreference
  onChange: (next: AccentPreference) => void
  /** Locks the toggle on its current value (shown dimmed); clicks never reach onChange. */
  disabled?: boolean
}) {
  return (
    <div
      aria-disabled={disabled || undefined}
      className={`inline-flex rounded-lg border border-border bg-card p-0.5 shadow-sm ${disabled ? 'opacity-60' : ''}`}
    >
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          onClick={() => {
            if (!disabled) onChange(option.value)
          }}
          disabled={disabled}
          aria-disabled={disabled || undefined}
          aria-pressed={accent === option.value}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
            accent === option.value
              ? 'bg-rose-100 text-rose-700'
              : disabled
                ? 'text-muted-foreground cursor-not-allowed'
                : 'text-muted-foreground hover:bg-secondary'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
