import { Clock, Info } from 'lucide-react'
import type { SpeakingCard, SpeakingTask } from '../../data/exams/speaking'
import { useLanguage } from '../../lib/i18n'

const images = import.meta.glob<string>('../../assets/exams/*', { eager: true, import: 'default' })

function imageUrl(asset: string): string | undefined {
  return images[`../../assets/exams/${asset}`]
}

export function RoleCard({ card, tone = 'sky' }: { card: SpeakingCard; tone?: 'sky' | 'muted' }) {
  return (
    <div className={`space-y-2 rounded-xl border p-4 text-base leading-relaxed ${tone === 'sky' ? 'border-sky-200 bg-sky-50/60' : 'border-border bg-muted'}`}>
      {card.heading && <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{card.heading}</p>}
      {card.text.map((p) => (
        <p key={p} className="text-foreground">
          {p}
        </p>
      ))}
      {card.points && (
        <ul className="list-disc space-y-1 pl-6 text-foreground">
          {card.points.map((p) => (
            <li key={p.text}>
              {p.text}
              {p.sub && (
                <ul className="mt-1 list-[circle] space-y-1 pl-6">
                  {p.sub.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
      {card.after?.map((p) => (
        <p key={p} className="font-semibold text-foreground">
          {p}
        </p>
      ))}
    </div>
  )
}

/**
 * What the learner sees for one speaking task: its title, instructions, role card and
 * picture or chart. `compact` is the overview's version, with a smaller image.
 */
export default function SpeakingTaskSheet({
  task,
  language,
  compact,
  headingLevel = 'h2',
}: {
  task: SpeakingTask
  language: string
  compact?: boolean
  headingLevel?: 'h2' | 'h3'
}) {
  const { t } = useLanguage()
  const Heading = headingLevel
  const src = task.image && imageUrl(task.image.asset)
  const sourceNote = task.source === 'added' ? t('exSpkSourceAdded') : task.source === 'title-only' ? t('exSpkSourceTitleOnly') : null

  return (
    <section className="space-y-4 rounded-2xl border border-border bg-card p-4 sm:p-6">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <Heading className="text-lg font-semibold text-foreground">
          {task.label}
          <span lang={language} className="ml-2">
            {task.title}
          </span>
        </Heading>
        <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          {t('exSpkAbout', { n: task.minutes })}
        </span>
      </header>

      {sourceNote && (
        <p className="flex items-start gap-2 text-sm text-muted-foreground">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          {sourceNote}
        </p>
      )}

      <div lang={language} className="space-y-4">
        {task.instructions?.map((p) => (
          <p key={p} className="text-base font-medium leading-relaxed text-foreground">
            {p}
          </p>
        ))}
        {task.examineeCard && <RoleCard card={task.examineeCard} />}
        {src && task.image && (
          <img
            src={src}
            alt={task.image.alt}
            className={`mx-auto w-full rounded-xl border border-border bg-white object-contain ${compact ? 'max-h-56' : 'max-h-[28rem]'}`}
          />
        )}
      </div>
    </section>
  )
}
