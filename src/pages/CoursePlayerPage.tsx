import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ModulePlayer from '../components/Courses/ModulePlayer'
import { useCourseCopy } from '../data/courseCopy'
import { completeModule, fetchMyCourse, markOpenStep, saveModuleProgress, startModule } from '../lib/courseApi'
import { mergeAwards } from '../lib/gamificationApi'
import { publishXpResult } from '../lib/gamification/xpEvents'
import type { ModuleAttempt, MyCourseModule, MyCourseNext } from '../lib/courses'

/** /my-courses/:enrollmentId/:moduleId: one module, resumed where the learner left it. */
export default function CoursePlayerPage() {
  const { enrollmentId = '', moduleId = '' } = useParams()
  // A new module (Next) starts a fresh player.
  return <Player key={moduleId} enrollmentId={enrollmentId} moduleId={moduleId} />
}

function Player({ enrollmentId, moduleId }: { enrollmentId: string; moduleId: string }) {
  const { c } = useCourseCopy()
  const navigate = useNavigate()
  const [attempt, setAttempt] = useState<ModuleAttempt | null>(null)
  const [module, setModule] = useState<MyCourseModule | null>(null)
  const [next, setNext] = useState<MyCourseNext | null>(null)
  const [error, setError] = useState<'load' | 'locked' | null>(null)
  const courseUrl = `/my-courses/${enrollmentId}`

  useEffect(() => {
    Promise.all([startModule(enrollmentId, moduleId), fetchMyCourse(enrollmentId)])
      .then(([a, course]) => {
        setAttempt(a)
        setModule(course.units.flatMap((u) => u.modules).find((m) => m.id === moduleId) ?? null)
      })
      .catch((err: { status?: number }) => setError(err?.status === 409 ? 'locked' : 'load'))
  }, [enrollmentId, moduleId])

  if (error)
    return (
      <div className="space-y-3">
        <p className="text-sm text-red-600">{error === 'locked' ? c('moduleLocked') : c('loadError')}</p>
        <Link to={courseUrl} className="text-sm text-muted-foreground hover:underline">
          {c('backToCourse')}
        </Link>
      </div>
    )
  if (!attempt) return <p className="text-sm text-muted-foreground">{c('loading')}</p>

  return (
    <ModulePlayer
      title={module?.title ?? ''}
      content={attempt.content}
      seed={attempt.id}
      initialStep={attempt.stepIndex}
      initialAnswers={attempt.answers}
      audioUrl={attempt.audioUrl}
      onEvaluate={async (stepId, text) => {
        const { text: _text, ...feedback } = await markOpenStep(attempt.id, stepId, text)
        return feedback
      }}
      onProgress={(stepIndex, answers) => void saveModuleProgress(attempt.id, stepIndex, answers)}
      onFinish={async (answers) => {
        const { completion, xp } = await completeModule(attempt.id, answers)
        publishXpResult(xp.length > 1 ? mergeAwards(xp[0], xp[1]) : xp[0])
        setNext(completion.next)
        return completion
      }}
      onExit={() => navigate(courseUrl)}
      resultActions={() => (
        <>
          {next && (
            <button
              type="button"
              onClick={() => navigate(`${courseUrl}/${next.moduleId}`)}
              className="rounded-xl bg-[var(--teal-accent)] px-5 py-3 font-semibold text-primary hover:bg-[var(--teal-accent-strong)]"
            >
              {c('nextModule', { title: next.title })}
            </button>
          )}
          <Link to={courseUrl} className="rounded-xl border border-border px-5 py-3 font-semibold text-foreground hover:bg-secondary">
            {c('backToCourse')}
          </Link>
        </>
      )}
    />
  )
}
