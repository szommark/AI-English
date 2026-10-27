import { Link } from 'react-router-dom'
import { BookOpen, ClipboardCheck, Music, Sparkles, Target, type LucideIcon } from 'lucide-react'
import { useLanguage, type MessageKey } from '../../lib/i18n'

const TOOLS: { to: string; icon: LucideIcon; title: MessageKey; desc: MessageKey }[] = [
  { to: '/teacher/tools/goals', icon: Target, title: 'ttGoalsTitle', desc: 'ttGoalsDesc' },
  { to: '/teacher/tools/vocab', icon: BookOpen, title: 'wordLists', desc: 'ttVocabDesc' },
  { to: '/teacher/tools/lyrics', icon: Music, title: 'ttLyricsTitle', desc: 'ttLyricsDesc' },
  { to: '/teacher/tools/exam-tasks', icon: ClipboardCheck, title: 'ttExamTasksTitle', desc: 'ttExamTasksDesc' },
]

/** Teacher Toolkit (the Tools tab of /teacher): one tile per tool. Teacher role only. */
export default function TeacherToolsTab() {
  const { t } = useLanguage()

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">{t('ttSubtitle')}</p>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map(({ to, icon: Icon, title, desc }) => (
          <Link
            key={to}
            to={to}
            className="group block rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--teal-accent-border)] hover:shadow-[var(--shadow-card)]"
          >
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--teal-accent-soft)] text-[var(--teal-accent-strong)]">
              <Icon className="h-6 w-6" />
            </div>
            <h2 className="mt-4 font-semibold text-foreground">{t(title)}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t(desc)}</p>
          </Link>
        ))}

        <div className="flex flex-col items-start justify-center rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
          <Sparkles className="mb-3 h-5 w-5" />
          {t('ttMoreSoon')}
        </div>
      </div>
    </div>
  )
}
