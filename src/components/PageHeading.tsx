import type { ReactNode } from 'react'

/** Consistent page title block: title + optional subtitle on the left, optional controls on the right. */
export default function PageHeading({
  title,
  subtitle,
  actions,
}: {
  title: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        {/* Club style, as on the home tiles: EB Garamond in club green over a short gold rule. */}
        <h1 className="font-brand text-3xl font-semibold leading-tight text-[var(--club-green)]">{title}</h1>
        <div className="mt-1.5 h-px w-12 bg-[var(--club-gold)]" aria-hidden="true" />
        {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-4">{actions}</div>}
    </div>
  )
}
