import { useEffect, useState, type FormEvent } from 'react'
import { fetchStudentGamification, giveTeacherBonus } from '../../lib/gamificationApi'
import { TEACHER_BONUS_REASON_MAX, TEACHER_BONUS_REASON_MIN, TEACHER_BONUS_WEEKLY_CAP } from '../../lib/gamification/constants'
import type { StudentGamification } from '../../lib/gamification/types'
import GamificationSummary from './GamificationSummary'

/**
 * Teacher's view of one connected student's gamification (design §7.1) and the bonus XP
 * form (§7.2). The summary is the same block the student sees first on "Az én fejlődésem"
 * (in the UI language); the bonus form is English, like the teacher pages. Loads on its own
 * so a failure here never hides the rest of the student page.
 */
export default function StudentGamificationCard({ studentId }: { studentId: string }) {
  const [data, setData] = useState<StudentGamification | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchStudentGamification(studentId)
      .then((d) => !cancelled && setData(d))
      .catch(() => !cancelled && setError(true))
    return () => {
      cancelled = true
    }
  }, [studentId])

  if (error) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm text-slate-400">Couldn't load this student's points and badges.</p>
      </div>
    )
  }
  if (!data) return null

  return (
    <GamificationSummary me={data.me} xpBySection={data.xpBySection} badges={data.badges}>
      <BonusForm studentId={studentId} data={data} onGiven={setData} />
    </GamificationSummary>
  )
}

function BonusForm({
  studentId,
  data,
  onGiven,
}: {
  studentId: string
  data: StudentGamification
  onGiven: (next: StudentGamification) => void
}) {
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)
  const remaining = data.bonusRemaining

  async function submit(e: FormEvent) {
    e.preventDefault()
    const n = Number(amount)
    const trimmed = reason.trim()
    if (!Number.isInteger(n) || n < 1 || n > remaining) {
      setMessage({ kind: 'error', text: `Enter a whole number from 1 to ${remaining}.` })
      return
    }
    if (trimmed.length < TEACHER_BONUS_REASON_MIN) {
      setMessage({ kind: 'error', text: 'Add a short reason — your student will see it.' })
      return
    }

    setSending(true)
    setMessage(null)
    try {
      const result = await giveTeacherBonus(studentId, n, trimmed)
      if (!result.given) {
        setMessage({ kind: 'error', text: `Only ${result.bonusRemaining} XP left this week for this student. Nothing was given.` })
        onGiven({ ...data, bonusRemaining: result.bonusRemaining })
        return
      }
      setAmount('')
      setReason('')
      setMessage({ kind: 'ok', text: `Gave ${n} XP. Your student will see it with your reason.` })
      onGiven(await fetchStudentGamification(studentId))
    } catch {
      setMessage({ kind: 'error', text: "Couldn't give the bonus. Please try again." })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-3 border-t border-slate-100 pt-4">
      <div>
        <h3 className="text-sm font-medium text-slate-700">Give bonus XP</h3>
        <p className="text-xs text-slate-500">
          {remaining > 0
            ? `${remaining} XP left this week for this student (at most ${TEACHER_BONUS_WEEKLY_CAP} XP a week from all their teachers).`
            : `This student has had the maximum ${TEACHER_BONUS_WEEKLY_CAP} XP bonus this week. You can give more from Monday.`}
        </p>
      </div>

      {remaining > 0 && (
        <form onSubmit={submit} className="space-y-2">
          <div className="flex flex-wrap items-end gap-3">
            <label className="text-sm text-slate-600">
              XP
              <input
                type="number"
                min={1}
                max={remaining}
                step={1}
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value)
                  setMessage(null)
                }}
                className="mt-1 block w-24 rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
              />
            </label>
            <label className="min-w-0 flex-1 text-sm text-slate-600">
              Reason (your student sees this)
              <input
                type="text"
                maxLength={TEACHER_BONUS_REASON_MAX}
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value)
                  setMessage(null)
                }}
                placeholder="Great presentation in today's lesson"
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
              />
            </label>
            <button
              type="submit"
              disabled={sending}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {sending ? 'Giving…' : 'Give XP'}
            </button>
          </div>
          {message && (
            <p className={`text-sm ${message.kind === 'ok' ? 'text-emerald-700' : 'text-red-600'}`}>{message.text}</p>
          )}
        </form>
      )}

      {data.bonuses.length > 0 && (
        <ul className="space-y-1 text-sm text-slate-600">
          {data.bonuses.map((b) => (
            <li key={b.createdAt} className="flex justify-between gap-3">
              <span className="min-w-0">
                “{b.reason}” <span className="text-slate-400">· {new Date(b.createdAt).toLocaleDateString()}</span>
              </span>
              <span className="shrink-0 font-medium">+{b.amount} XP</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
