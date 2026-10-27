import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import AuthPanel from '../components/AuthPanel'
import { MIN_PASSWORD, useAuth } from '../lib/AuthContext'

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400'

/** Supabase reports a used or expired link as `error_description` in the hash (or the query). */
function linkErrorFromUrl(): string | null {
  const params = new URLSearchParams(window.location.hash.slice(1) || window.location.search)
  return params.get('error_description')
}

/**
 * Landing page of the password reset email. Supabase signs the user in from the link,
 * so a session here means they may choose a new password; no session means the link
 * was used, expired or opened without one, and they can ask for a new link.
 */
export default function ResetPasswordPage() {
  const { user, loading, updatePassword } = useAuth()
  const [linkError] = useState(linkErrorFromUrl)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (password !== confirm) {
      setError('The two passwords are not the same.')
      return
    }
    setBusy(true)
    try {
      const { error } = await updatePassword(password)
      if (error) setError(error)
      else setDone(true)
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center py-24 text-slate-400">Loading...</div>

  return (
    <div className="mx-auto max-w-sm py-10">
      <div className="rounded-xl bg-white p-6 shadow-lg">
        {done ? (
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Password changed</h2>
            <p className="mt-1 text-sm text-slate-500">
              Your new password is saved and you're signed in. Next time, sign in with the new password.
            </p>
            <Link
              to="/"
              className="mt-5 block w-full rounded-lg bg-indigo-600 py-2 text-center text-sm font-medium text-white hover:bg-indigo-700"
            >
              Continue
            </Link>
          </div>
        ) : user ? (
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Choose a new password</h2>
            <p className="text-sm text-slate-500 mb-4">Adj meg egy új jelszót</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="reset-password" className="block text-sm text-slate-600 mb-1">New password</label>
                <div className="relative">
                  <input
                    id="reset-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={MIN_PASSWORD}
                    autoComplete="new-password"
                    aria-describedby="reset-password-hint"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${inputClass} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p
                  id="reset-password-hint"
                  className={`mt-1 text-xs ${password.length >= MIN_PASSWORD ? 'text-emerald-600' : 'text-slate-500'}`}
                >
                  {password.length >= MIN_PASSWORD ? '✓ ' : ''}At least {MIN_PASSWORD} characters
                </p>
              </div>
              <div>
                <label htmlFor="reset-confirm" className="block text-sm text-slate-600 mb-1">New password again</label>
                <input
                  id="reset-confirm"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className={inputClass}
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-lg bg-indigo-600 text-white py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                Save new password
              </button>
            </form>
          </div>
        ) : (
          <div>
            <p className="mb-5 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              This reset link has expired or was already used{linkError ? ` (${linkError})` : ''}. Ask for a new one below.
            </p>
            <AuthPanel initialMode="forgot" />
          </div>
        )}
      </div>
    </div>
  )
}
