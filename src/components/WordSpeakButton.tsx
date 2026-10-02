import { SpeakerIcon } from './icons/AudioIcons'

/**
 * Small speaker icon for hearing a word's pronunciation in a list row. Presentational:
 * the list owns one useSpeechSynthesis instance and passes `onSpeak`, so a long list
 * doesn't resolve voices once per row.
 */
export default function WordSpeakButton({ label, onSpeak }: { label: string; onSpeak: () => void }) {
  return (
    <button
      type="button"
      onClick={onSpeak}
      aria-label={label}
      title={label}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
    >
      <SpeakerIcon className="h-4 w-4" />
    </button>
  )
}
