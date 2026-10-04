import { useEffect, useState, type FormEvent } from 'react'
import { MY_PROGRESS_COPY as C } from '../../data/myProgressCopy'
import {
  changeLeaderboardNickname,
  fetchClassRanking,
  fetchLeaderboard,
  joinLeaderboard,
  leaveLeaderboard,
} from '../../lib/gamificationApi'
import { NICKNAME_MAX, NICKNAME_MIN } from '../../lib/gamification/constants'
import type { ClassRankingView, LeaderboardEntry, LeaderboardView } from '../../lib/gamification/types'

// Phase 5 on "Az én fejlődésem" (design §8): the class ranking and the public leaderboard.
// Each loads on its own and renders nothing while its admin switch is off (or on any error),
// so the rest of the page never depends on them. Hungarian-only, like the page.

const rowClass = (isMe: boolean) =>
  `flex items-center justify-between gap-3 rounded-md px-3 py-1.5 text-sm ${isMe ? 'bg-[var(--teal-accent-soft)] font-semibold text-foreground' : 'text-foreground'}`

export function ClassRankingSection() {
  const [view, setView] = useState<ClassRankingView | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchClassRanking()
      .then((v) => !cancelled && setView(v))
      .catch(() => !cancelled && setView(null))
    return () => {
      cancelled = true
    }
  }, [])

  if (!view?.enabled || view.classes.length === 0) return null

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-base font-semibold text-foreground">{C.crHeading}</h3>
        <p className="text-sm text-muted-foreground">{C.crIntro}</p>
      </div>
      {view.classes.map((cls) => (
        <div key={cls.teacherLabel} className="space-y-1">
          {view.classes.length > 1 && <p className="text-sm text-muted-foreground">{C.crTeacher(cls.teacherLabel)}</p>}
          <ol className="space-y-0.5">
            {cls.entries.map((e, i) => (
              <li key={i} className={rowClass(e.isMe)}>
                <span className="min-w-0 truncate">
                  {e.rank}. {e.isMe ? C.crMe : e.nickname ?? C.crClassmate(e.classmateNo ?? 0)}
                </span>
                <span className="shrink-0">{e.xp} XP</span>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  )
}

export function LeaderboardSection() {
  const [view, setView] = useState<LeaderboardView | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchLeaderboard()
      .then((v) => !cancelled && setView(v))
      .catch(() => !cancelled && setView(null))
    return () => {
      cancelled = true
    }
  }, [])

  if (!view?.enabled) return null

  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold text-foreground">{C.lbHeading}</h3>
      {view.optedIn ? (
        <Standings view={view} onChange={setView} />
      ) : view.blockedByTeacher ? (
        <p className="text-sm text-muted-foreground">{C.lbBlocked}</p>
      ) : (
        <JoinForm onJoined={setView} />
      )}
    </div>
  )
}

function JoinForm({ onJoined }: { onJoined: (v: LeaderboardView) => void }) {
  const [nickname, setNickname] = useState('')
  const [age16, setAge16] = useState(false)
  const [consent, setConsent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!age16 || !consent) {
      setError(C.lbNeedBoth)
      return
    }
    setSending(true)
    setError(null)
    try {
      onJoined(await joinLeaderboard(nickname))
    } catch (err) {
      setError(err instanceof Error && err.message !== 'Request failed' ? err.message : C.lbError)
    } finally {
      setSending(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-lg border border-border p-4">
      <p className="text-sm text-foreground">{C.lbIntro}</p>
      <label className="block text-sm text-foreground">
        {C.lbNickname}
        <input
          value={nickname}
          minLength={NICKNAME_MIN}
          maxLength={NICKNAME_MAX}
          required
          onChange={(e) => {
            setNickname(e.target.value)
            setError(null)
          }}
          className="mt-1 block w-full max-w-xs rounded-lg border border-border bg-card px-3 py-2 text-base"
        />
        <span className="mt-1 block text-xs text-muted-foreground">{C.lbNicknameHint}</span>
      </label>
      <label className="flex items-start gap-2 text-sm text-foreground">
        <input type="checkbox" checked={age16} onChange={(e) => setAge16(e.target.checked)} className="mt-1" />
        <span>{C.lbAge}</span>
      </label>
      <label className="flex items-start gap-2 text-sm text-foreground">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
        <span>{C.lbConsent}</span>
      </label>
      <p className="text-xs text-muted-foreground">{C.lbUnder16}</p>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={sending}
        className="inline-flex min-h-11 items-center rounded-lg bg-primary px-5 py-2.5 text-base font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        {C.lbJoin}
      </button>
    </form>
  )
}

function Standings({ view, onChange }: { view: LeaderboardView; onChange: (v: LeaderboardView) => void }) {
  const [editing, setEditing] = useState(false)
  const [nickname, setNickname] = useState(view.nickname ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function run(action: () => Promise<LeaderboardView>) {
    setBusy(true)
    setError(null)
    try {
      onChange(await action())
      setEditing(false)
    } catch (err) {
      setError(err instanceof Error && err.message !== 'Request failed' ? err.message : C.lbError)
    } finally {
      setBusy(false)
    }
  }

  const row = (e: LeaderboardEntry) => (
    <li key={`${e.rank}-${e.nickname}`} className={rowClass(e.isMe)}>
      <span className="min-w-0 truncate">
        {e.rank}. {e.nickname}
        {e.isMe && ` (${C.lbYou})`} <span className="font-normal text-muted-foreground">· {C.lbLevel(e.level)}</span>
      </span>
      <span className="shrink-0">{e.xp} XP</span>
    </li>
  )

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-foreground">{C.lbLeague[view.league]}</p>
      {view.entries.length === 0 && !view.me ? (
        <p className="text-sm text-muted-foreground">{C.lbEmpty}</p>
      ) : (
        <ol className="space-y-0.5">
          {view.entries.map(row)}
          {view.me && (
            <>
              <li aria-hidden="true" className="px-3 text-sm text-muted-foreground">
                …
              </li>
              {row(view.me)}
            </>
          )}
        </ol>
      )}

      {editing ? (
        <form
          className="flex flex-wrap items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            void run(() => changeLeaderboardNickname(nickname))
          }}
        >
          <label className="text-sm text-foreground">
            {C.lbNickname}
            <input
              value={nickname}
              minLength={NICKNAME_MIN}
              maxLength={NICKNAME_MAX}
              required
              onChange={(e) => setNickname(e.target.value)}
              className="mt-1 block w-48 rounded-lg border border-border bg-card px-3 py-1.5 text-base"
            />
          </label>
          <button type="submit" disabled={busy} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
            {C.lbSave}
          </button>
          <button type="button" onClick={() => setEditing(false)} className="rounded-lg border border-border px-4 py-2 text-sm">
            {C.lbCancel}
          </button>
        </form>
      ) : (
        <div className="flex flex-wrap gap-4 text-sm">
          <button onClick={() => setEditing(true)} className="text-primary hover:underline">
            {C.lbChangeNickname}
          </button>
          <button
            disabled={busy}
            onClick={() => window.confirm(C.lbLeaveConfirm) && void run(leaveLeaderboard)}
            className="text-red-700 hover:underline disabled:opacity-50"
          >
            {C.lbLeave}
          </button>
        </div>
      )}
      {error && <p className="text-sm text-red-700">{error}</p>}
    </div>
  )
}
