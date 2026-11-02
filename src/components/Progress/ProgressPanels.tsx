import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import CefrHistoryLine from './CefrHistoryLine'
import MistakeAreaList, { visibleAreas } from './MistakeAreaList'
import { PROGRESS_LOCALE, pickTitle, useMyProgressCopy, type MyProgressCopy } from '../../data/myProgressCopy'
import { getGrammarItem } from '../../data/grammarCurriculum'
import { getTenseStory } from '../../data/tenseStories'
import { useLanguage } from '../../lib/i18n'
import type {
  AreaOverview,
  CefrHistoryPoint,
  CourseProgressItem,
  GrammarActivity,
  GrammarPracticeItem,
  MistakeSessionMix,
  ProgressListRef,
  PronunciationProgressItem,
  VocabActivity,
  VocabularyCounts,
} from '../../lib/progressTypes'

// The progress sections shared by "Az én fejlődésem" (the learner) and the teacher's student
// page, in the same format on both. `teacher` only changes wording and hides the learner's
// own shortcuts (practise / open buttons); it never adds or hides data.

export const BUTTON_PRIMARY =
  'inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-base font-medium text-primary-foreground hover:opacity-90'
export const BUTTON_SECONDARY =
  'inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-card px-5 py-2.5 text-base font-medium text-primary hover:bg-secondary'

export function ProgressCard({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-sm">
      {title && <h2 className="text-lg font-semibold text-foreground">{title}</h2>}
      {children}
    </section>
  )
}

function SubHeading({ children }: { children: ReactNode }) {
  return <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{children}</h3>
}

function useDate() {
  const { lang } = useLanguage()
  const f = new Intl.DateTimeFormat(PROGRESS_LOCALE[lang], { year: 'numeric', month: 'short', day: 'numeric' })
  return (iso: string) => f.format(new Date(iso))
}

// --- Level and conversations -----------------------------------------------------------------

export function ProgressHeader({
  cefrCurrent,
  history,
  last30Days,
  total,
  teacher = false,
}: {
  cefrCurrent: string | null
  history: CefrHistoryPoint[]
  last30Days: number
  total: number
  teacher?: boolean
}) {
  const C = useMyProgressCopy()
  const { lang } = useLanguage()
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <ProgressCard>
        <p className="text-sm text-muted-foreground">{teacher ? C.cefrHeadingTeacher : C.cefrHeading}</p>
        {cefrCurrent ? (
          <p className="text-4xl font-semibold tracking-tight text-foreground">{cefrCurrent}</p>
        ) : (
          <>
            <p className="text-xl font-semibold text-foreground">{C.cefrNotYet}</p>
            <p className="text-sm text-muted-foreground">{C.cefrNotYetHint}</p>
          </>
        )}
        {history.length > 1 && (
          <p className="text-sm text-muted-foreground">
            {C.cefrHistoryLabel} <CefrHistoryLine history={history} locale={PROGRESS_LOCALE[lang]} />
          </p>
        )}
      </ProgressCard>
      <ProgressCard>
        <p className="text-4xl font-semibold tracking-tight text-foreground">{last30Days}</p>
        <p className="text-base text-foreground">{C.sessionsLast30Label}</p>
        <p className="text-sm text-muted-foreground">{C.sessionsTotal(total)}</p>
      </ProgressCard>
    </div>
  )
}

// --- Mistake types ---------------------------------------------------------------------------

/** "Based on: 3 Tutor Bot conversations · 2 scenarios"; scenarios are highlighted. */
function MistakeSources({ mix }: { mix: MistakeSessionMix }) {
  const C = useMyProgressCopy()
  if (mix.tutor + mix.scenario === 0) return null
  return (
    <div className="space-y-1">
      <p className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted-foreground">{C.mistakesBasedOn}</span>
        {mix.tutor > 0 && <span className="rounded-full bg-secondary px-2.5 py-0.5 text-foreground">{C.mistakesSrcTutor(mix.tutor)}</span>}
        {mix.scenario > 0 && (
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 font-medium text-amber-800">{C.mistakesSrcScenario(mix.scenario)}</span>
        )}
      </p>
      <p className="text-xs text-muted-foreground">{C.mistakesSrcNote}</p>
    </div>
  )
}

export function MistakesPanel({ areas, mix, teacher = false }: { areas: AreaOverview[]; mix: MistakeSessionMix; teacher?: boolean }) {
  const C = useMyProgressCopy()
  const windowSize = areas[0]?.windowSize ?? 0
  return (
    <ProgressCard title={C.mistakesHeading}>
      {visibleAreas(areas).length === 0 ? (
        <p className="text-base text-muted-foreground">{teacher ? C.mistakesEmptyTeacher : C.mistakesEmpty}</p>
      ) : (
        <>
          {windowSize > 0 && (
            <p className="text-sm text-muted-foreground">{teacher ? C.mistakesIntroTeacher(windowSize) : C.mistakesIntro(windowSize)}</p>
          )}
          <MistakeSources mix={mix} />
          <MistakeAreaList areas={areas} showTotals={teacher} />
        </>
      )}
    </ProgressCard>
  )
}

// --- Pronunciation ---------------------------------------------------------------------------

function ScoreBar({ label, score }: { label: string; score: number | null }) {
  const C = useMyProgressCopy()
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-16 shrink-0 text-muted-foreground">{label}</span>
      <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-secondary" aria-hidden="true">
        {score !== null && (
          <span className="block h-full rounded-full bg-[var(--teal-accent)]" style={{ width: `${Math.max(0, Math.min(100, score))}%` }} />
        )}
      </span>
      <span className="w-12 shrink-0 text-right font-medium text-foreground">
        {score !== null ? `${Math.round(score)}%` : <span className="font-normal text-muted-foreground">{C.pronNoScore}</span>}
      </span>
    </div>
  )
}

export function PronunciationPanel({ items, teacher = false }: { items: PronunciationProgressItem[]; teacher?: boolean }) {
  const C = useMyProgressCopy()
  const { lang } = useLanguage()
  return (
    <ProgressCard title={C.pronHeading}>
      {items.length === 0 ? (
        <>
          <p className="text-base text-muted-foreground">{teacher ? C.pronEmptyTeacher : C.pronEmpty}</p>
          {!teacher && (
            <Link to="/pronunciation" className={BUTTON_SECONDARY}>
              {C.pronEmptyLink}
            </Link>
          )}
        </>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">{C.pronIntro}</p>
          <ul className="divide-y divide-border">
            {items.map((p) => (
              <li key={p.soundItemId} className="py-3 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-lg font-semibold text-foreground">{p.symbol}</p>
                    <p className="text-sm text-muted-foreground">
                      {pickTitle(lang, p)} · {C.pronAttempts(p.attempts)}
                    </p>
                  </div>
                  {!teacher && p.route && (
                    <Link to={p.route} className={`${BUTTON_SECONDARY} shrink-0 text-sm px-4`}>
                      {C.pronOpen} →
                    </Link>
                  )}
                </div>
                <ScoreBar label={C.pronPerception} score={p.perceptionScore} />
                <ScoreBar label={C.pronProduction} score={p.productionScore} />
              </li>
            ))}
          </ul>
        </>
      )}
    </ProgressCard>
  )
}

// --- Vocabulary ------------------------------------------------------------------------------

function listName(list: ProgressListRef | null, C: MyProgressCopy): string {
  if (!list) return C.listMixed
  if (list.kind === 'conversations') return C.listConversations
  return list.title ?? C.listDeleted
}

function ListName({ list }: { list: ProgressListRef | null }) {
  const C = useMyProgressCopy()
  return (
    <span className="min-w-0 break-words font-medium text-foreground">
      {listName(list, C)}
      {list && list.kind !== 'conversations' && <span className="font-normal text-muted-foreground"> · {C.listKind[list.kind]}</span>}
    </span>
  )
}

function Tag({ children, strong }: { children: ReactNode; strong?: boolean }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs ${strong ? 'bg-amber-100 font-medium text-amber-800' : 'bg-secondary text-muted-foreground'}`}>
      {children}
    </span>
  )
}

export function VocabularyPanel({
  counts,
  activity,
  teacher = false,
}: {
  counts: VocabularyCounts
  activity: VocabActivity
  teacher?: boolean
}) {
  const C = useMyProgressCopy()
  const date = useDate()
  const stats = [
    { label: C.vocabNew, value: counts.new },
    { label: C.vocabPracticing, value: counts.practicing },
    { label: C.vocabMastered, value: counts.mastered },
  ]
  return (
    <ProgressCard title={C.vocabHeading}>
      <div className="space-y-2">
        <SubHeading>{C.vocabSrsHeading}</SubHeading>
        <div className="grid grid-cols-3 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-lg bg-secondary px-3 py-3 text-center">
              <p className="text-2xl font-semibold text-foreground">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-1 pt-2">
        <SubHeading>{C.vocabFastHeading}</SubHeading>
        {activity.fastPractice.length === 0 ? (
          <p className="text-sm text-muted-foreground">{C.vocabFastEmpty}</p>
        ) : (
          <ul className="divide-y divide-border">
            {activity.fastPractice.map((r, i) => (
              <li key={i} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-2 text-sm">
                <span className="flex min-w-0 flex-wrap items-center gap-2">
                  <ListName list={r.list} />
                  {r.list?.wordCount != null && (r.reduced ? <Tag strong>{C.vocabReduced}</Tag> : <Tag>{C.vocabFullList}</Tag>)}
                  {!r.finished && <Tag>{C.vocabUnfinished}</Tag>}
                </span>
                <span className="text-muted-foreground">
                  {r.reduced && r.list?.wordCount != null ? C.vocabWordsOf(r.wordCount, r.list.wordCount) : C.vocabWords(r.wordCount)}
                  {r.accuracy !== null && ` · ${C.vocabAccuracy(r.accuracy)}`} · {date(r.startedAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-1 pt-2">
        <SubHeading>{C.vocabTestsHeading}</SubHeading>
        {activity.tests.length === 0 ? (
          <p className="text-sm text-muted-foreground">{C.vocabTestsEmpty}</p>
        ) : (
          <ul className="divide-y divide-border">
            {activity.tests.map((t, i) => (
              <li key={i} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-2 text-sm">
                <ListName list={t.list} />
                <span className="text-muted-foreground">
                  <span className="font-semibold text-foreground">{t.percent}%</span> · {C.vocabWordsOf(t.correct, t.wordCount)} ·{' '}
                  {date(t.finishedAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-1 pt-2">
        <SubHeading>{C.vocabGamesHeading}</SubHeading>
        {activity.gameCounts.started === 0 ? (
          <p className="text-sm text-muted-foreground">{C.vocabGamesEmpty}</p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">{C.practiceCounts(activity.gameCounts.started, activity.gameCounts.finished)}</p>
            <ul className="divide-y divide-border">
              {activity.games.map((g, i) => (
                <li key={i} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-2 text-sm">
                  <span className="flex min-w-0 flex-wrap items-center gap-2">
                    <span className="font-medium text-foreground">{C.gameName[g.game ?? 'unknown']}</span>
                    {g.list ? <ListName list={g.list} /> : <span className="text-muted-foreground">{C.listUnknown}</span>}
                    {!g.finished && <Tag>{C.vocabUnfinished}</Tag>}
                  </span>
                  <span className="text-muted-foreground">
                    {g.wordCount !== null && `${C.vocabWords(g.wordCount)} · `}
                    {date(g.startedAt)}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="space-y-1 pt-2">
        <SubHeading>{C.vocabOwnHeading}</SubHeading>
        {activity.ownLists.length === 0 ? (
          <p className="text-sm text-muted-foreground">{C.vocabOwnEmpty}</p>
        ) : (
          <ul className="divide-y divide-border">
            {activity.ownLists.map((l) => (
              <li key={l.id} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-2 text-sm">
                <span className="min-w-0 break-words font-medium text-foreground">{l.title}</span>
                <span className="text-muted-foreground">
                  {C.vocabWords(l.wordCount)} · {C.vocabOwnPractice(l.practiceCount)}
                  {l.lastTest !== null && l.bestTest !== null && ` · ${C.vocabOwnTests(l.lastTest, l.bestTest)}`} · {date(l.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {!teacher && (
        <Link to="/vocabulary" className={BUTTON_SECONDARY}>
          {C.vocabLink} →
        </Link>
      )}
    </ProgressCard>
  )
}

// --- Grammar ---------------------------------------------------------------------------------

function GrammarList({
  heading,
  empty,
  block,
  name,
}: {
  heading: string
  empty: string
  block: GrammarActivity['written']
  name: (item: GrammarPracticeItem) => string
}) {
  const C = useMyProgressCopy()
  const date = useDate()
  return (
    <div className="space-y-1">
      <SubHeading>{heading}</SubHeading>
      {block.counts.started === 0 ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">{C.practiceCounts(block.counts.started, block.counts.finished)}</p>
          <ul className="divide-y divide-border">
            {block.items.map((item, i) => (
              <li key={i} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-2 text-sm">
                <span className="flex min-w-0 flex-wrap items-center gap-2">
                  <span className="break-words font-medium text-foreground">{name(item)}</span>
                  {!item.finished && <Tag>{C.vocabUnfinished}</Tag>}
                </span>
                <span className="text-muted-foreground">
                  {item.score !== null && (
                    <>
                      <span className="font-semibold text-foreground">{Math.round(item.score)}%</span> ·{' '}
                    </>
                  )}
                  {date(item.startedAt)}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

/** Grammar Coach written practice and the Past · Present · Future game, starts included. */
export function GrammarPanel({ grammar, teacher = false }: { grammar: GrammarActivity; teacher?: boolean }) {
  const C = useMyProgressCopy()
  const { lang } = useLanguage()
  const lessonName = (item: GrammarPracticeItem) => {
    const lesson = item.itemRef ? getGrammarItem(item.itemRef) : undefined
    return lesson ? `${pickTitle(lang, lesson.item)} (${lesson.level})` : (item.itemRef ?? '')
  }
  const gameName = (item: GrammarPracticeItem) => {
    if (item.variant === 'story') {
      const story = item.itemRef ? getTenseStory(item.itemRef) : undefined
      return story ? `${C.timeGameStory} · ${story.title}` : C.timeGameStory
    }
    return C.timeGameRound(item.itemRef ?? '')
  }
  const any = grammar.written.counts.started + grammar.timeGame.counts.started > 0
  return (
    <ProgressCard title={C.grammarHeading}>
      <GrammarList heading={C.grammarWrittenHeading} empty={C.grammarWrittenEmpty} block={grammar.written} name={lessonName} />
      <div className="pt-2">
        <GrammarList heading={C.grammarTimeGameHeading} empty={C.grammarTimeGameEmpty} block={grammar.timeGame} name={gameName} />
      </div>
      {any && <p className="text-xs text-muted-foreground">{C.practiceStartsNote}</p>}
      {!teacher && (
        <Link to="/grammar-coach" className={BUTTON_SECONDARY}>
          {C.grammarLink} →
        </Link>
      )}
    </ProgressCard>
  )
}

// --- Mini courses ----------------------------------------------------------------------------

export function CoursesPanel({ courses, teacher = false }: { courses: CourseProgressItem[]; teacher?: boolean }) {
  const C = useMyProgressCopy()
  const date = useDate()
  return (
    <ProgressCard title={C.coursesHeading}>
      {teacher && <p className="text-sm text-muted-foreground">{C.coursesTeacherNote}</p>}
      {courses.length === 0 ? (
        <p className="text-base text-muted-foreground">{teacher ? C.coursesEmptyTeacher : C.coursesEmpty}</p>
      ) : (
        <ul className="divide-y divide-border">
          {courses.map((c) => {
            const pct = c.modulesTotal ? Math.round((c.modulesDone / c.modulesTotal) * 100) : 0
            return (
              <li key={c.enrollmentId} className="space-y-2 py-3">
                <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                  <div className="min-w-0">
                    <p className="break-words text-base font-medium text-foreground">{c.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {c.level}
                      {!teacher && ` · ${c.source === 'self' ? C.courseSelf : C.courseAssigned}`}
                    </p>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {c.completedAt ? (
                      <span className="font-medium text-foreground">
                        {C.courseDone} · {date(c.completedAt)}
                      </span>
                    ) : (
                      C.courseInProgress
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span aria-hidden="true" className="h-2.5 flex-1 overflow-hidden rounded-full bg-secondary">
                    <span className="block h-full rounded-full bg-[var(--teal-accent)]" style={{ width: `${pct}%` }} />
                  </span>
                  <span className="shrink-0 text-muted-foreground">{C.courseModules(c.modulesDone, c.modulesTotal)}</span>
                </div>
              </li>
            )
          })}
        </ul>
      )}
      {!teacher && courses.length > 0 && (
        <Link to="/my-courses" className={BUTTON_SECONDARY}>
          {C.coursesLink} →
        </Link>
      )}
    </ProgressCard>
  )
}
