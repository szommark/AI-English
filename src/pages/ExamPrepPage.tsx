import { useState, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ChevronDown, ChevronRight, FileText, GraduationCap, Languages, MessagesSquare, type LucideIcon } from 'lucide-react'
import PageHeading from '../components/PageHeading'
import { getFeature } from '../data/features'
import { EXAM_LANGUAGES, EXAM_TYPES, examCatalog, getExamPaperMeta, type ExamCell } from '../data/exams/catalog'
import type { ExamTrack, ExamType } from '../data/exams/types'
import { examLanguageLabel, examLevelLabel, examTrackLabel, examTypeDescription, examTypeLabel } from '../lib/examLabels'
import { localizeFeature, useLanguage } from '../lib/i18n'

const TYPE_ICON = { erettsegi: GraduationCap, nyelvvizsga: Languages } as const

function PaperList({ ids }: { ids: string[] }) {
  const { t } = useLanguage()
  return (
    <ul className="space-y-2">
      {ids.map((id) => {
        const paper = getExamPaperMeta(id)!
        return (
          <li key={id}>
            <Link
              to={`/exams/${id}`}
              className="group flex min-h-12 items-center justify-between gap-3 rounded-xl border border-border px-4 py-2 transition-colors hover:border-sky-200 hover:bg-sky-50"
            >
              <span className="flex items-center gap-2 text-base text-foreground">
                {paper.speakingOnly ? <MessagesSquare className="h-5 w-5 text-sky-600" /> : <FileText className="h-5 w-5 text-sky-600" />}
                {paper.sittingLabelHu}
              </span>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-sky-700">
                {t('exStart')}
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

/** A bordered group that starts collapsed: its title and count, and the content once opened. */
function Collapsible({ title, count, icon: Icon, children }: { title: string; count: number; icon?: LucideIcon; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-xl border border-border">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-12 w-full items-center justify-between gap-3 px-4 py-2 text-left"
      >
        <span className="flex items-center gap-2 font-medium text-foreground">
          {Icon && <Icon className="h-5 w-5 text-sky-600" />}
          {title} <span className="text-sm font-normal text-muted-foreground">({count})</span>
        </span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`space-y-2 px-2 pb-2 ${open ? '' : 'hidden'}`}>{children}</div>
    </div>
  )
}

function YearGroup({ year, ids }: { year: string; ids: string[] }) {
  return (
    <Collapsible title={year} count={ids.length}>
      <PaperList ids={ids} />
    </Collapsible>
  )
}

/** Groups papers by the year at the start of their sitting label; papers without one (samples) stay ungrouped. */
function groupByYear(ids: string[]): { year: string | null; ids: string[] }[] {
  const groups: { year: string | null; ids: string[] }[] = []
  for (const id of ids) {
    const year = getExamPaperMeta(id)!.sittingLabelHu.match(/^([0-9]{4})/)?.[1] ?? null
    const last = groups[groups.length - 1]
    const g = year === null ? last?.year === null && last : groups.find((x) => x.year === year)
    if (g) g.ids.push(id)
    else groups.push({ year, ids: [id] })
  }
  return groups
}

const TRACK_ORDER: ExamTrack[] = ['general', 'business']

/** Nyelvvizsga papers grouped by track (general first); papers without a track form one unlabelled group. */
function groupByTrack(ids: string[]): { track: ExamTrack | null; ids: string[] }[] {
  const untracked = ids.filter((id) => !getExamPaperMeta(id)!.track)
  return [
    ...(untracked.length ? [{ track: null, ids: untracked }] : []),
    ...TRACK_ORDER.map((track) => ({ track, ids: ids.filter((id) => getExamPaperMeta(id)!.track === track) })).filter((g) => g.ids.length),
  ]
}

function PaperGroups({ ids }: { ids: string[] }) {
  return (
    <>
      {groupByYear(ids).map(({ year, ids }) =>
        year === null ? <PaperList key="other" ids={ids} /> : <YearGroup key={year} year={year} ids={ids} />,
      )}
    </>
  )
}

/**
 * Written papers and speaking exams in two collapsed groups, when a cell has both kinds (the
 * German érettségi oral sample sets next to the written papers); otherwise just the papers.
 */
function PartGroups({ ids }: { ids: string[] }) {
  const { t } = useLanguage()
  const speaking = ids.filter((id) => getExamPaperMeta(id)!.speakingOnly)
  const written = ids.filter((id) => !getExamPaperMeta(id)!.speakingOnly)
  if (!speaking.length || !written.length) return <PaperGroups ids={ids} />
  return (
    <>
      <Collapsible title={t('exWrittenPapers')} count={written.length} icon={FileText}>
        <PaperGroups ids={written} />
      </Collapsible>
      <Collapsible title={t('exSpeakingPapers')} count={speaking.length} icon={MessagesSquare}>
        <PaperGroups ids={speaking} />
      </Collapsible>
    </>
  )
}

function CellCard({ cell }: { cell: ExamCell }) {
  const { t } = useLanguage()
  const level = examLevelLabel(t, cell.level)
  const [open, setOpen] = useState(false)

  if (cell.paperIds.length === 0) {
    return (
      <div aria-disabled="true" className="rounded-2xl border border-dashed border-border bg-muted p-5 opacity-70">
        <div className="flex items-start justify-between gap-3">
          <h4 className="font-semibold text-muted-foreground">{level}</h4>
          <span className="rounded-full bg-card px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">{t('comingSoon')}</span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{t('exNoPaperYet')}</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <h4 className="font-semibold text-foreground">
          {level} <span className="text-sm font-normal text-muted-foreground">({cell.paperIds.length})</span>
        </h4>
        <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`mt-3 space-y-4 ${open ? '' : 'hidden'}`}>
        {groupByTrack(cell.paperIds).map(({ track, ids }) => (
          <div key={track ?? 'all'} className="space-y-2">
            {track && <h5 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{examTrackLabel(t, track)}</h5>}
            <PartGroups ids={ids} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ExamPrepPage() {
  const { lang, t } = useLanguage()
  const [params, setParams] = useSearchParams()
  const feature = getFeature('exam-prep')!
  const selected = EXAM_TYPES.find((x) => x === params.get('type'))

  function select(type: ExamType) {
    setParams(type === selected ? {} : { type }, { replace: true })
  }

  return (
    <div className="space-y-8">
      <PageHeading title={localizeFeature(lang, feature).title} subtitle={t('exSubtitle')} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {EXAM_TYPES.map((type) => {
          const Icon = TYPE_ICON[type]
          const active = type === selected
          return (
            <button
              key={type}
              type="button"
              aria-pressed={active}
              onClick={() => select(type)}
              className={`rounded-2xl border bg-card p-6 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)] ${
                active ? 'border-sky-400 ring-2 ring-sky-200' : 'border-border hover:border-sky-200'
              }`}
            >
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                <Icon className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-foreground">{examTypeLabel(t, type)}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{examTypeDescription(t, type)}</p>
            </button>
          )
        })}
      </div>

      {selected &&
        EXAM_LANGUAGES.map((language) => (
          <section key={language} className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">{examLanguageLabel(t, language)}</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {examCatalog
                .filter((c) => c.type === selected && c.language === language)
                .map((cell) => (
                  <CellCard key={cell.level} cell={cell} />
                ))}
            </div>
          </section>
        ))}
    </div>
  )
}
