import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Ear, Layers, Music } from 'lucide-react'
import { getFeature } from '../data/features'
import { isLessonProgressId, lessonSessionRoute, lessonSessions } from '../data/pronunciationLessons'
import { fetchPronunciationProgress, type PronunciationProgressEntry } from '../lib/pronunciationProgressApi'
import { localizeFeature, useLanguage } from '../lib/i18n'
import PageHeading from '../components/PageHeading'
import ResurfaceQueue from '../components/Pronunciation/ResurfaceQueue'

const pronunciationFeature = getFeature('pronunciation-session')!

/** /pronunciation: the three sessions. Sound Bank is the phoneme chart that used to live here. */
export default function PronunciationHubPage() {
  const { lang, t } = useLanguage()
  const [progress, setProgress] = useState<PronunciationProgressEntry[]>([])

  useEffect(() => {
    fetchPronunciationProgress().then(setProgress)
  }, [])

  const practiced = progress.filter((p) => p.attempts > 0)
  // Sound Bank progress = every practised item that isn't one of the lesson units.
  const soundBankPracticed = practiced.filter((p) => !isLessonProgressId(p.soundItemId)).length

  const cards = [
    {
      to: '/pronunciation/sound-bank',
      title: 'Sound Bank',
      titleHu: 'Hangok',
      descriptionHu: 'Az angol hangok térképe: a magyar fülnek nehéz hangok (th, w, æ, schwa…) hallgatása, minimálpárok és gyakorlatok.',
      status: soundBankPracticed > 0 ? `${soundBankPracticed} hang gyakorolva` : null,
      Icon: Ear,
    },
    ...lessonSessions.map((session) => {
      const done = session.units.filter((u) =>
        practiced.some((p) => p.soundItemId === (u.body.kind === 'funnel' ? u.body.soundItemId : u.id)),
      ).length
      return {
        to: lessonSessionRoute(session.id),
        title: session.title,
        titleHu: session.titleHu,
        descriptionHu: session.descriptionHu,
        status: done > 0 ? `${done}/${session.units.length} ${session.unitNoun.hu.toLowerCase()} gyakorolva` : `${session.units.length} ${session.unitNoun.hu.toLowerCase()}`,
        Icon: session.id === 'stress-patterns' ? Layers : Music,
      }
    }),
  ]

  return (
    <div className="space-y-8">
      <PageHeading title={localizeFeature(lang, pronunciationFeature).title} subtitle={t('pronunciationHubSubtitle')} />

      <ResurfaceQueue progress={progress} />

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map(({ to, title, titleHu, descriptionHu, status, Icon }) => (
          <Link
            key={to}
            to={to}
            className="group flex flex-col rounded-2xl border border-border bg-card p-5 transition-all hover:border-rose-200 hover:shadow-[var(--shadow-card)] hover:-translate-y-0.5"
          >
            <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
              <Icon className="h-5 w-5" />
            </span>
            <span className="text-lg font-semibold text-foreground">{title}</span>
            <span className="text-xs text-rose-500">{titleHu}</span>
            <span className="mt-2 flex-1 text-sm text-muted-foreground">{descriptionHu}</span>
            <span className="mt-4 flex items-center justify-between text-xs font-medium text-rose-700">
              <span>{status}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-rose-500" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
