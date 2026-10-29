import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PageHeading from '../components/PageHeading'
import UnitForm, { EMPTY_UNIT, toUnitInput, unitFormReady, type UnitFormValue } from '../components/Courses/UnitForm'
import { cardClass, hintClass, inputClass, labelClass, primaryButtonClass } from '../components/TeacherTools/ui'
import { useCourseCopy } from '../data/courseCopy'
import { createCourse } from '../lib/courseApi'
import { COURSE_LEVELS, COURSE_TITLE_MAX, COURSE_TOPIC_MAX, EXPLAIN_LANGS, grammarAllowed, type CourseLevel, type ExplainLang } from '../lib/courses'

/**
 * /teacher/tools/courses/new: the course (title, level, explanation language) and its first
 * unit. Creating it opens the editor, which writes the outline and the modules with AI.
 */
export default function CourseNewPage() {
  const { c, lang } = useCourseCopy()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [topic, setTopic] = useState('')
  const [level, setLevel] = useState<CourseLevel>('B1')
  const [explainLang, setExplainLang] = useState<ExplainLang>(lang === 'hu' ? 'hu' : 'en')
  const [unit, setUnit] = useState<UnitFormValue>(EMPTY_UNIT)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function changeLevel(next: CourseLevel) {
    setLevel(next)
    // A lower level drops the grammar points above it.
    setUnit((u) => ({ ...u, grammarIds: u.grammarIds.filter((g) => grammarAllowed(g, next)) }))
  }

  const ready = title.trim().length > 0 && unitFormReady(unit)

  async function create() {
    setBusy(true)
    setError(null)
    try {
      const course = await createCourse({ title: title.trim(), topic: topic.trim(), level, explainLang, unit: toUnitInput(unit) })
      navigate(`/teacher/tools/courses/${course.id}?generate=1`)
    } catch {
      setError(c('createError'))
      setBusy(false)
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeading title={c('newCourse')} subtitle={c('newSubtitle')} />
      <Link to="/teacher/tools/courses" className="inline-block text-sm text-muted-foreground hover:underline">
        {c('backToList')}
      </Link>

      <section className={cardClass}>
        <h2 className="font-semibold text-foreground">{c('courseHeading')}</h2>
        <label className="block space-y-1">
          <span className={labelClass}>{c('courseTitle')}</span>
          <input className={inputClass} value={title} maxLength={COURSE_TITLE_MAX} placeholder={c('courseTitlePlaceholder')} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label className="block space-y-1">
          <span className={labelClass}>{c('courseTopic')}</span>
          <input className={inputClass} value={topic} maxLength={COURSE_TOPIC_MAX} placeholder={c('courseTopicPlaceholder')} onChange={(e) => setTopic(e.target.value)} />
          <span className={hintClass}>{c('courseTopicHint')}</span>
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1">
            <span className={labelClass}>{c('level')}</span>
            <select className={inputClass} value={level} onChange={(e) => changeLevel(e.target.value as CourseLevel)}>
              {COURSE_LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
            <span className={hintClass}>{c('levelFixedHint')}</span>
          </label>
          <label className="block space-y-1">
            <span className={labelClass}>{c('explainLang')}</span>
            <select className={inputClass} value={explainLang} onChange={(e) => setExplainLang(e.target.value as ExplainLang)}>
              {EXPLAIN_LANGS.map((l) => (
                <option key={l} value={l}>
                  {c(`lang_${l}`)}
                </option>
              ))}
            </select>
            <span className={hintClass}>{c('explainLangHint')}</span>
          </label>
        </div>
      </section>

      <section className={cardClass}>
        <h2 className="font-semibold text-foreground">{c('unitN', { n: 1 })}</h2>
        <UnitForm level={level} value={unit} onChange={setUnit} />
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="button" className={primaryButtonClass} disabled={!ready || busy} onClick={() => void create()}>
        {busy ? c('creating') : c('createAndWrite')}
      </button>
    </div>
  )
}
