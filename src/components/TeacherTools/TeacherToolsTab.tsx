import { Link } from 'react-router-dom'
import { BookOpen, ClipboardCheck, GraduationCap, ListChecks, Music, Sparkles, type LucideIcon } from 'lucide-react'
import { useLanguage, type MessageKey } from '../../lib/i18n'

/** One dashboard tool tile; without `to` it is shown as "coming soon" and is not a link. */
export type ToolTile = { key: string; to?: string; icon: LucideIcon; title: MessageKey; desc: MessageKey }

const TOOLS: ToolTile[] = [
  { key: 'vocab', to: '/teacher/tools/vocab', icon: BookOpen, title: 'wordLists', desc: 'ttVocabDesc' },
  { key: 'lyrics', to: '/teacher/tools/lyrics', icon: Music, title: 'ttLyricsTitle', desc: 'ttLyricsDesc' },
  { key: 'comp-tests', to: '/teacher/tools/comp-tests', icon: ListChecks, title: 'ttCompTitle', desc: 'ttCompDesc' },
  { key: 'courses', to: '/teacher/tools/courses', icon: GraduationCap, title: 'ttCoursesTitle', desc: 'ttCoursesDesc' },
  { key: 'exam-tasks', to: '/teacher/tools/exam-tasks', icon: ClipboardCheck, title: 'ttExamTasksTitle', desc: 'ttExamTasksDesc' },
]

/** The tile grid shared by the Tools and Language Coach tabs of /teacher. */
export function ToolTileGrid({ tiles, showMoreSoon = false }: { tiles: ToolTile[]; showMoreSoon?: boolean }) {
  const { t } = useLanguage()

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {tiles.map(({ key, to, icon: Icon, title, desc }) => {
        const body = (
          <>
            <div className="flex items-start justify-between gap-2">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--teal-accent-soft)] text-[var(--teal-accent-strong)]">
                <Icon className="h-6 w-6" />
              </div>
              {!to && (
                <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">{t('ttComingSoon')}</span>
              )}
            </div>
            <h2 className="mt-4 font-semibold text-foreground">{t(title)}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t(desc)}</p>
          </>
        )
        return to ? (
          <Link
            key={key}
            to={to}
            className="group block rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--teal-accent-border)] hover:shadow-[var(--shadow-card)]"
          >
            {body}
          </Link>
        ) : (
          <div key={key} aria-disabled="true" className="block rounded-2xl border border-dashed border-border bg-card p-6 opacity-80">
            {body}
          </div>
        )
      })}

      {showMoreSoon && (
        <div className="flex flex-col items-start justify-center rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
          <Sparkles className="mb-3 h-5 w-5" />
          {t('ttMoreSoon')}
        </div>
      )}
    </div>
  )
}

/** Teacher Toolkit (the Tools tab of /teacher): one tile per tool. Teacher role only. */
export default function TeacherToolsTab() {
  const { t } = useLanguage()

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">{t('ttSubtitle')}</p>
      <ToolTileGrid tiles={TOOLS} showMoreSoon />
    </div>
  )
}
