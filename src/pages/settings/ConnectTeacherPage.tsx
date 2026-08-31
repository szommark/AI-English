import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../lib/AuthContext'
import {
  redeemInviteCode,
  disconnectLink,
  fetchConnectedTeachers,
  type RedeemInviteCodeError,
  type ConnectedTeacher,
} from '../../lib/connectApi'

export default function ConnectTeacherPage() {
  const { user } = useAuth()
  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [teachers, setTeachers] = useState<ConnectedTeacher[]>([])
  const [teachersLoading, setTeachersLoading] = useState(true)
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null)

  async function loadTeachers() {
    if (!user) return
    setTeachersLoading(true)
    try {
      setTeachers(await fetchConnectedTeachers())
    } catch {
      setTeachers([])
    } finally {
      setTeachersLoading(false)
    }
  }

  useEffect(() => {
    loadTeachers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)
    if (!code.trim()) return

    setSubmitting(true)
    try {
      const { teacherEmail } = await redeemInviteCode(code)
      setCode('')
      setSuccessMessage(`You're now connected to ${teacherEmail}.`)
      await loadTeachers()
    } catch (err) {
      setError((err as RedeemInviteCodeError).message ?? 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDisconnect(teacherId: string) {
    setDisconnectingId(teacherId)
    try {
      await disconnectLink(teacherId)
      await loadTeachers()
    } catch {
      setError('Failed to disconnect. Please try again.')
    } finally {
      setDisconnectingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-md mx-auto px-4 py-8 space-y-6">
        <Link to="/" className="text-sm text-indigo-600 hover:underline">
          ← Back
        </Link>

        <div>
          <h1 className="text-xl font-semibold text-slate-800">Connect to a teacher</h1>
          <p className="mt-1 text-sm text-slate-500">
            Enter the invite code your teacher gave you to connect your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block space-y-1">
            <span className="text-sm font-medium text-slate-700">Invite code</span>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="XXXX-XXXX"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 uppercase tracking-wider"
            />
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {successMessage && <p className="text-sm text-emerald-600">{successMessage}</p>}

          <button
            type="submit"
            disabled={submitting || !code.trim()}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
          >
            {submitting ? 'Connecting...' : 'Connect'}
          </button>
        </form>

        <div className="space-y-3">
          <h2 className="text-sm font-medium text-slate-700">Connected teachers</h2>

          {teachersLoading ? (
            <p className="text-sm text-slate-400">Loading...</p>
          ) : teachers.length === 0 ? (
            <p className="text-sm text-slate-400">Not connected to a teacher yet.</p>
          ) : (
            <ul className="space-y-2">
              {teachers.map((teacher) => (
                <li
                  key={teacher.teacherId}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                >
                  <div>
                    <p className="text-slate-700">{teacher.email}</p>
                    <p className="text-xs text-slate-400">
                      Connected since {new Date(teacher.connectedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDisconnect(teacher.teacherId)}
                    disabled={disconnectingId === teacher.teacherId}
                    className="text-red-600 hover:underline disabled:opacity-40"
                  >
                    {disconnectingId === teacher.teacherId ? 'Disconnecting...' : 'Disconnect'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  )
}
