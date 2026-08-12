export function SpeakerIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path d="M4 9v6h4l5 4V5L8 9H4z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 8a5 5 0 0 1 0 8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19.5 5.5a9 9 0 0 1 0 13" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function MicIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" strokeLinecap="round" />
      <path d="M12 18v3" strokeLinecap="round" />
    </svg>
  )
}
