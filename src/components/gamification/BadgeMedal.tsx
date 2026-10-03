import { badgeIcon } from './badgeIcons'

/**
 * A badge's round icon tile: teal when earned, a grey outline while locked, "?" for a hidden
 * badge not yet earned (icon null).
 */
export default function BadgeMedal({ icon, earned, size = 'md' }: { icon: string | null; earned: boolean; size?: 'sm' | 'md' | 'lg' }) {
  const Icon = badgeIcon(icon)
  const box = size === 'lg' ? 'h-14 w-14' : size === 'sm' ? 'h-7 w-7' : 'h-12 w-12'
  const glyph = size === 'lg' ? 'h-7 w-7' : size === 'sm' ? 'h-4 w-4' : 'h-6 w-6'
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full ${box} ${
        earned
          ? 'bg-[var(--teal-accent-soft)] text-primary ring-2 ring-[var(--teal-accent)]'
          : 'border-2 border-dashed border-border bg-card text-muted-foreground'
      }`}
    >
      <Icon className={glyph} />
    </span>
  )
}
