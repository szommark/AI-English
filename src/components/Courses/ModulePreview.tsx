import { useState } from 'react'
import ModulePlayer from './ModulePlayer'
import { useCourseCopy } from '../../data/courseCopy'
import { previewFeedback, previewRoleplay } from '../../lib/courseApi'
import { scoreModule, type CourseModule } from '../../lib/courses'

/** A teacher's full-screen preview of one module: the real player, nothing saved. */
export default function ModulePreview({ module, onClose }: { module: CourseModule; onClose: () => void }) {
  const { c } = useCourseCopy()
  const [run, setRun] = useState(0)
  if (!module.content) return null
  const content = module.content

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-background px-4" role="dialog" aria-modal="true" aria-label={c('preview')}>
      <p className="mx-auto max-w-xl pt-3 text-center text-xs font-semibold uppercase tracking-wide text-[var(--teal-accent-strong)]">{c('previewBanner')}</p>
      <ModulePlayer
        key={run}
        title={module.title}
        content={content}
        seed={module.id}
        audioUrl={module.audioUrl}
        onEvaluate={(stepId, text) => previewFeedback(module.id, stepId, text)}
        onRoleplayTurn={(stepId, history) => previewRoleplay(module.id, stepId, history)}
        onFinish={async (answers) => scoreModule(content, answers)}
        onExit={onClose}
        resultActions={() => (
          <>
            <button type="button" className="rounded-xl bg-[var(--teal-accent)] px-5 py-3 font-semibold text-primary" onClick={() => setRun((r) => r + 1)}>
              {c('restart')}
            </button>
            <button type="button" className="rounded-xl border border-border px-5 py-3 font-semibold text-foreground" onClick={onClose}>
              {c('closePreview')}
            </button>
          </>
        )}
      />
    </div>
  )
}
