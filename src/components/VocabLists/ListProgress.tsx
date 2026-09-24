import { useLanguage } from '../../lib/i18n'
import type { VocabListProgress } from '../../lib/vocab'
import ProgressBar from './ProgressBar'

/** "3 / 20 learned · 5 started" with a bar and, once set, a Completed badge (design §6.2). */
export default function ListProgress({
  progress,
  completedAt,
}: {
  progress: VocabListProgress
  completedAt: string | null
}) {
  const { t } = useLanguage()
  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
        <span>{t('vlProgressLearned', { learned: progress.learned, total: progress.total })}</span>
        <span>{t('vlProgressStarted', { n: progress.started })}</span>
        {completedAt && (
          <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-xs font-medium text-emerald-700">
            {t('vlCompleted')}
          </span>
        )}
      </div>
      <ProgressBar value={progress.learned} max={progress.total} />
    </div>
  )
}
