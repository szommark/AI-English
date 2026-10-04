import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  createChallenge,
  deleteChallenge,
  endChallenge,
  fetchTeacherChallenges,
  updateChallengeText,
  type TeacherChallengeList,
} from '../../lib/gamificationApi'
import { fetchVocabLists } from '../../lib/vocabListsApi'
import type { VocabListSummary } from '../../lib/vocab'
import type { RosterEntry } from '../../lib/teacherApi'
import {
  CHALLENGE_DESCRIPTION_MAX,
  CHALLENGE_MAX_REWARD_XP,
  CHALLENGE_MAX_WEEKS,
  CHALLENGE_TITLE_MAX,
  CHALLENGE_TITLE_MIN,
} from '../../lib/gamification/constants'
import { addDays, budapestDate, nextMonday } from '../../lib/gamification/dates'
import type {
  ChallengeActivity,
  ChallengeKind,
  ChallengeTargetType,
  NewChallenge,
  TeacherChallenge,
} from '../../lib/gamification/types'

// Class challenges for teachers (design §7.3). English, like the teacher pages; the title
// and description are what students see, so the teacher writes those in Hungarian.

const ACTIVITY_LABELS: Record<ChallengeActivity, string> = {
  any: 'Any activity',
  'conversational-english': 'Conversational English scenarios',
  'tutor-bot': 'Tutor Bot conversations',
  'grammar-coach': 'Grammar Coach lessons',
  'pronunciation-session': 'Pronunciation drills',
  'exam-prep': 'Exam Prep: mock exam sections handed in',
  'vocabulary.fast_practice': 'Vocabulary: fast practice rounds',
  'vocabulary.game': 'Vocabulary: word games played',
  'vocabulary.own_list': 'Vocabulary: own word lists created',
}
const COLLECTIVE_ACTIVITIES: ChallengeActivity[] = [
  'any',
  'conversational-english',
  'tutor-bot',
  'grammar-coach',
  'pronunciation-session',
  'exam-prep',
]
const INDIVIDUAL_ACTIVITIES: ChallengeActivity[] = [
  ...COLLECTIVE_ACTIVITIES,
  'vocabulary.fast_practice',
  'vocabulary.game',
  'vocabulary.own_list',
]

const DATE = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
const fmt = (d: string) => DATE.format(new Date(`${d}T12:00:00`))

export function challengeTargetEn(c: Pick<TeacherChallenge, 'kind' | 'target'>): string {
  const { target } = c
  const each = c.kind === 'individual' ? ' each' : ' in total'
  switch (target.type) {
    case 'active_days':
      return `${target.value} practice days${each}`
    case 'xp':
      return `${target.value} XP${each}`
    case 'word_list': {
      const list = target.listTitle ? `“${target.listTitle}”` : 'a deleted list'
      return c.kind === 'individual' ? `Complete the word list ${list}` : `${target.value} students complete the word list ${list}`
    }
    default:
      return `${target.value} × ${ACTIVITY_LABELS[target.activity ?? 'any'].toLowerCase()}${each}`
  }
}

function statusText(c: TeacherChallenge): string {
  switch (c.status) {
    case 'upcoming':
      return `Starts ${fmt(c.startsOn)} · ends ${fmt(c.endsOn)}`
    case 'active':
      return `Running · ends ${fmt(c.endsOn)}`
    case 'ended':
      return `Ended ${fmt(c.endsOn)}`
    default:
      return 'Ended early'
  }
}

export default function ChallengesSection({ students }: { students: RosterEntry[] }) {
  const [data, setData] = useState<TeacherChallengeList | null>(null)
  const [lists, setLists] = useState<VocabListSummary[]>([])
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const emails = useMemo(() => new Map(students.map((s) => [s.studentId, s.email])), [students])

  function reload() {
    fetchTeacherChallenges()
      .then(setData)
      .catch(() => setError("Couldn't load your challenges."))
  }

  useEffect(() => {
    reload()
    fetchVocabLists()
      .then(setLists)
      .catch(() => setLists([]))
  }, [])

  if (!data) return error ? <p className="text-sm text-red-600">{error}</p> : null
  const full = data.openCount >= data.maxOpen

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-medium text-foreground">Class challenges</h2>
          <p className="text-xs text-muted-foreground">
            {data.openCount} of {data.maxOpen} running or scheduled. Students see their own progress and, for a shared
            challenge, the class total — never each other's.
          </p>
        </div>
        {!creating && (
          <button
            onClick={() => setCreating(true)}
            disabled={full || students.length === 0}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40"
          >
            New challenge
          </button>
        )}
      </div>
      {full && !creating && <p className="text-xs text-muted-foreground">End or wait for a challenge to finish before adding another.</p>}

      {creating && (
        <ChallengeForm
          students={students}
          lists={lists}
          onCancel={() => setCreating(false)}
          onCreated={() => {
            setCreating(false)
            reload()
          }}
        />
      )}

      {data.challenges.length === 0 ? (
        !creating && <p className="text-sm text-muted-foreground">No challenges yet.</p>
      ) : (
        <ul className="space-y-2">
          {data.challenges.map((c) => (
            <ChallengeRow key={c.id} challenge={c} emails={emails} onChanged={reload} />
          ))}
        </ul>
      )}
    </div>
  )
}

function ChallengeRow({ challenge: c, emails, onChanged }: { challenge: TeacherChallenge; emails: Map<string, string>; onChanged: () => void }) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(c.title)
  const [description, setDescription] = useState(c.description ?? '')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const target = c.target.type === 'word_list' && c.kind === 'individual' ? 1 : c.target.value
  const completedCount = c.participants.filter((p) => p.completed).length
  const percent = Math.min(100, (c.total / Math.max(1, target)) * 100)

  async function run(action: () => Promise<unknown>) {
    setBusy(true)
    setMessage(null)
    try {
      await action()
      onChanged()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <li className="rounded-lg border border-border bg-card px-4 py-3 space-y-2">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium text-foreground">{c.title}</p>
          <p className="text-xs text-muted-foreground">
            {c.kind === 'collective'
              ? 'Shared (whole class)'
              : c.audience === 'selected'
                ? `Individual · ${c.recipientIds.length} selected student${c.recipientIds.length === 1 ? '' : 's'}`
                : 'Individual · whole class'}
            {' · '}
            {statusText(c)}
            {c.rewardXp > 0 && ` · reward ${c.rewardXp} XP`}
          </p>
        </div>
        <div className="flex gap-2 text-xs">
          <button onClick={() => setEditing((e) => !e)} className="text-indigo-600 hover:underline">
            Edit text
          </button>
          {(c.status === 'active' || c.status === 'upcoming') && (
            <button
              disabled={busy}
              onClick={() => window.confirm('End this challenge now? Students who haven’t completed it won’t get the reward.') && run(() => endChallenge(c.id))}
              className="text-red-600 hover:underline disabled:opacity-40"
            >
              End now
            </button>
          )}
          {c.status === 'upcoming' && (
            <button
              disabled={busy}
              onClick={() => window.confirm('Delete this challenge?') && run(() => deleteChallenge(c.id))}
              className="text-red-600 hover:underline disabled:opacity-40"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {c.description && !editing && <p className="text-sm text-muted-foreground">{c.description}</p>}
      <p className="text-sm text-foreground">{challengeTargetEn(c)}</p>

      {editing && (
        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault()
            void run(async () => {
              await updateChallengeText(c.id, title.trim(), description.trim() || null)
              setEditing(false)
            })
          }}
        >
          <input value={title} maxLength={CHALLENGE_TITLE_MAX} onChange={(e) => setTitle(e.target.value)} className="block w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm" />
          <textarea value={description} maxLength={CHALLENGE_DESCRIPTION_MAX} onChange={(e) => setDescription(e.target.value)} rows={2} className="block w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm" />
          <button disabled={busy || title.trim().length < CHALLENGE_TITLE_MIN} className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm text-white disabled:opacity-40">
            Save
          </button>
        </form>
      )}

      {c.status !== 'upcoming' && (
        <>
          {c.kind === 'collective' ? (
            <>
              <span aria-hidden="true" className="block h-2 overflow-hidden rounded-full bg-secondary">
                <span className="block h-full rounded-full bg-[var(--teal-accent)]" style={{ width: `${percent}%` }} />
              </span>
              <p className="text-sm text-muted-foreground">
                Class total {c.total} / {target}
                {completedCount > 0 && ` · reward given to ${completedCount} student${completedCount === 1 ? '' : 's'}`}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              {completedCount} of {c.participants.length} student{c.participants.length === 1 ? '' : 's'} completed
            </p>
          )}
          {c.participants.length > 0 && (
            <button onClick={() => setOpen((o) => !o)} className="text-xs text-indigo-600 hover:underline">
              {open ? 'Hide students' : 'Show students'}
            </button>
          )}
          {open && (
            <ul className="space-y-1 text-sm text-slate-600">
              {[...c.participants]
                .sort((a, b) => b.value - a.value)
                .map((p) => (
                  <li key={p.studentId} className="flex justify-between gap-3">
                    <span className="min-w-0 truncate">{emails.get(p.studentId) ?? 'Student'}</span>
                    <span className="shrink-0">
                      {p.value}
                      {c.kind === 'individual' && ` / ${target}`}
                      {p.completed && ' ✓'}
                    </span>
                  </li>
                ))}
            </ul>
          )}
        </>
      )}
      {message && <p className="text-sm text-red-600">{message}</p>}
    </li>
  )
}

function ChallengeForm({
  students,
  lists,
  onCancel,
  onCreated,
}: {
  students: RosterEntry[]
  lists: VocabListSummary[]
  onCancel: () => void
  onCreated: () => void
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [kind, setKind] = useState<ChallengeKind>('collective')
  const [selectedOnly, setSelectedOnly] = useState(false)
  const [studentIds, setStudentIds] = useState<string[]>([])
  const [targetType, setTargetType] = useState<ChallengeTargetType>('active_days')
  const [activity, setActivity] = useState<ChallengeActivity>('any')
  const [listId, setListId] = useState('')
  const [value, setValue] = useState('3')
  const [start, setStart] = useState<'today' | 'next-monday'>('next-monday')
  const [weeks, setWeeks] = useState(1)
  const [reward, setReward] = useState('20')
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const today = budapestDate()
  const startsOn = start === 'today' ? today : nextMonday(today)
  const endsOn = addDays(startsOn, weeks * 7 - 1)
  const activities = kind === 'individual' ? INDIVIDUAL_ACTIVITIES : COLLECTIVE_ACTIVITIES
  const individualList = targetType === 'word_list' && kind === 'individual'
  const activeLists = lists.filter((l) => !l.archivedAt)

  function chooseKind(next: ChallengeKind) {
    setKind(next)
    if (next === 'collective') {
      setSelectedOnly(false)
      if (!COLLECTIVE_ACTIVITIES.includes(activity)) setActivity('any')
    }
  }

  const valueLabel =
    targetType === 'word_list'
      ? 'Students who complete it'
      : `${targetType === 'active_days' ? 'Practice days' : targetType === 'xp' ? 'XP' : 'Activities'} ${kind === 'individual' ? 'per student' : 'for the whole class'}`

  async function submit(e: FormEvent) {
    e.preventDefault()
    const body: NewChallenge = {
      title: title.trim(),
      description: description.trim() || null,
      kind,
      studentIds: kind === 'individual' && selectedOnly ? studentIds : [],
      targetType,
      targetActivity: targetType === 'activities' ? activity : null,
      targetListId: targetType === 'word_list' ? listId || null : null,
      targetValue: individualList ? 1 : Number(value),
      start,
      weeks,
      rewardXp: Number(reward),
    }
    if (kind === 'individual' && selectedOnly && studentIds.length === 0) {
      setMessage('Choose at least one student.')
      return
    }
    setSending(true)
    setMessage(null)
    try {
      await createChallenge(body)
      onCreated()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Couldn't create the challenge.")
    } finally {
      setSending(false)
    }
  }

  const field = 'mt-1 block w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm'
  return (
    <form onSubmit={submit} className="rounded-lg border border-border bg-card p-4 space-y-4">
      <label className="block text-sm text-slate-600">
        Title (students see this — write it in Hungarian)
        <input value={title} required minLength={CHALLENGE_TITLE_MIN} maxLength={CHALLENGE_TITLE_MAX} onChange={(e) => setTitle(e.target.value)} placeholder="Heti 4 nap gyakorlás" className={field} />
      </label>
      <label className="block text-sm text-slate-600">
        Description (optional)
        <textarea value={description} maxLength={CHALLENGE_DESCRIPTION_MAX} rows={2} onChange={(e) => setDescription(e.target.value)} className={field} />
      </label>

      <fieldset className="space-y-1 text-sm text-slate-600">
        <legend className="font-medium text-slate-700">Type</legend>
        <label className="flex items-center gap-2">
          <input type="radio" checked={kind === 'collective'} onChange={() => chooseKind('collective')} /> Shared: the whole class works towards one total
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" checked={kind === 'individual'} onChange={() => chooseKind('individual')} /> Individual: each student has their own target
        </label>
      </fieldset>

      {kind === 'individual' && (
        <fieldset className="space-y-1 text-sm text-slate-600">
          <legend className="font-medium text-slate-700">Who</legend>
          <label className="flex items-center gap-2">
            <input type="radio" checked={!selectedOnly} onChange={() => setSelectedOnly(false)} /> The whole class
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" checked={selectedOnly} onChange={() => setSelectedOnly(true)} /> Selected students
          </label>
          {selectedOnly && (
            <div className="ml-6 max-h-40 space-y-1 overflow-y-auto">
              {students.map((s) => (
                <label key={s.studentId} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={studentIds.includes(s.studentId)}
                    onChange={(e) =>
                      setStudentIds((ids) => (e.target.checked ? [...ids, s.studentId] : ids.filter((id) => id !== s.studentId)))
                    }
                  />
                  <span className="truncate">{s.email}</span>
                </label>
              ))}
            </div>
          )}
        </fieldset>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm text-slate-600">
          Target
          <select value={targetType} onChange={(e) => setTargetType(e.target.value as ChallengeTargetType)} className={field}>
            <option value="active_days">Practice days</option>
            <option value="activities">Finished activities</option>
            <option value="xp">XP earned</option>
            <option value="word_list">Word list completed</option>
          </select>
        </label>
        {targetType === 'activities' && (
          <label className="block text-sm text-slate-600">
            Which activities count
            <select value={activity} onChange={(e) => setActivity(e.target.value as ChallengeActivity)} className={field}>
              {activities.map((a) => (
                <option key={a} value={a}>
                  {ACTIVITY_LABELS[a]}
                </option>
              ))}
            </select>
          </label>
        )}
        {targetType === 'word_list' && (
          <label className="block text-sm text-slate-600">
            Word list
            <select value={listId} required onChange={(e) => setListId(e.target.value)} className={field}>
              <option value="">Choose a list…</option>
              {activeLists.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title}
                </option>
              ))}
            </select>
          </label>
        )}
        {!individualList && (
          <label className="block text-sm text-slate-600">
            {valueLabel}
            <input type="number" min={1} step={1} required value={value} onChange={(e) => setValue(e.target.value)} className={field} />
          </label>
        )}
      </div>
      {targetType === 'word_list' && (
        <p className="text-xs text-muted-foreground">Only students the list is assigned to can complete it.</p>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block text-sm text-slate-600">
          Start
          <select value={start} onChange={(e) => setStart(e.target.value as 'today' | 'next-monday')} className={field}>
            <option value="today">Today ({fmt(today)})</option>
            <option value="next-monday">Next Monday ({fmt(nextMonday(today))})</option>
          </select>
        </label>
        <label className="block text-sm text-slate-600">
          Duration
          <select value={weeks} onChange={(e) => setWeeks(Number(e.target.value))} className={field}>
            {Array.from({ length: CHALLENGE_MAX_WEEKS }, (_, i) => i + 1).map((w) => (
              <option key={w} value={w}>
                {w} week{w === 1 ? '' : 's'}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-slate-600">
          Reward (0–{CHALLENGE_MAX_REWARD_XP} XP)
          <input type="number" min={0} max={CHALLENGE_MAX_REWARD_XP} step={1} required value={reward} onChange={(e) => setReward(e.target.value)} className={field} />
        </label>
      </div>
      <p className="text-xs text-muted-foreground">
        Runs {fmt(startsOn)} – {fmt(endsOn)} (Budapest time). Completing students get the reward XP and count towards the challenge
        badges; a shared challenge rewards everyone who contributed once the class reaches the total.
      </p>

      {message && <p className="text-sm text-red-600">{message}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={sending} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
          {sending ? 'Creating…' : 'Create challenge'}
        </button>
        <button type="button" onClick={onCancel} className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-secondary">
          Cancel
        </button>
      </div>
    </form>
  )
}
