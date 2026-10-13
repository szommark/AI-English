import { useLanguage } from '../../../lib/i18n'
import type { TenseStory } from '../../../data/tenseStories'

/** The learner's role and fact card for a story; stays on screen while they answer. */
export default function FactCard({ story }: { story: TenseStory }) {
  const { t } = useLanguage()
  return (
    <aside className="relative pt-3" aria-label={t('tenseStoryFactCard')}>
      <div className="absolute top-0 left-1/2 h-5 w-16 -translate-x-1/2 rotate-[-3deg] border border-amber-200/70 bg-amber-100/80 shadow-sm" aria-hidden />
      <div className="rounded-lg border border-slate-200 bg-[#fffdf3] p-3 shadow-md space-y-2 sm:p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">{t('tenseStoryFactCard')}</p>
        <p className="text-xs text-slate-500">
          <span className="font-medium">{t('tenseStoryYouAre')}</span> {story.role}
        </p>
        <ul className="list-disc space-y-0.5 pl-4 text-[13px] leading-snug text-slate-700 sm:space-y-1 sm:text-sm sm:leading-normal">
          {story.facts.map((fact) => (
            <li key={fact}>{fact}</li>
          ))}
        </ul>
        <p className="text-xs italic text-slate-400">{t('tenseStoryFactHint')}</p>
      </div>
    </aside>
  )
}
