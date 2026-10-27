import { useState, type FormEvent } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { MIN_PASSWORD, useAuth } from '../lib/AuthContext'

type Mode = 'signin' | 'signup' | 'forgot'

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400'

const headings: Record<Mode, { title: string; subtitle: string }> = {
  signin: { title: 'Sign in', subtitle: 'Jelentkezz be a gyakorláshoz' },
  signup: { title: 'Create account', subtitle: 'Hozz létre egy fiókot a kezdéshez' },
  forgot: { title: 'Reset password', subtitle: 'Küldünk egy linket az új jelszó beállításához' },
}

export default function AuthPanel({ initialMode = 'signin' }: { initialMode?: Mode }) {
  const { signIn, signUp, requestPasswordReset } = useAuth()
  const [mode, setMode] = useState<Mode>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const isSignup = mode === 'signup'
  const isForgot = mode === 'forgot'

  function switchMode(next: Mode) {
    if (next === mode) return
    setMode(next)
    // Start each mode with empty fields so sign-in credentials never carry over into sign-up.
    // The email typed on sign-in is kept for a reset request, since it's the same account.
    if (next !== 'forgot') setEmail('')
    setPassword('')
    setShowPassword(false)
    setError(null)
    setInfo(null)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setBusy(true)
    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password)
        if (error) setError(error)
      } else if (mode === 'signup') {
        const { error } = await signUp(email, password)
        if (error) setError(error)
        else setInfo('Account created! Check your email if confirmation is required, then sign in.')
      } else {
        const { error } = await requestPasswordReset(email)
        if (error) setError(error)
        // Supabase answers the same for unknown addresses, so the message can't confirm the account exists.
        else setInfo('If this email has an account, a reset link is on its way. Check your spam folder too. The link works for 24 hours.')
      }
    } finally {
      setBusy(false)
    }
  }

  const tabClass = (active: boolean) =>
    `flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
      active ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
    }`

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-800">{headings[mode].title}</h2>
      <p className="text-sm text-slate-500 mb-4">{headings[mode].subtitle}</p>

      {!isForgot && (
        <div role="tablist" aria-label="Sign in or create account" className="mb-5 flex gap-1 rounded-lg bg-slate-100 p-1">
          <button type="button" role="tab" aria-selected={!isSignup} onClick={() => switchMode('signin')} className={tabClass(!isSignup)}>
            Sign in
          </button>
          <button type="button" role="tab" aria-selected={isSignup} onClick={() => switchMode('signup')} className={tabClass(isSignup)}>
            Create account
          </button>
        </div>
      )}

      {/* key remounts the form per mode so browser autofill state doesn't leak between them */}
      <form key={mode} onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="auth-email" className="block text-sm text-slate-600 mb-1">Email</label>
          <input
            id="auth-email"
            type="email"
            required
            autoComplete={isSignup ? 'email' : 'username'}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>
        {!isForgot && (
          <div>
            <label htmlFor="auth-password" className="block text-sm text-slate-600 mb-1">
              {isSignup ? 'Choose a password' : 'Password'}
            </label>
            <div className="relative">
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={MIN_PASSWORD}
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                aria-describedby={isSignup ? 'auth-password-hint' : undefined}
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
            {isSignup ? (
              <p
                id="auth-password-hint"
                className={`mt-1 text-xs ${password.length >= MIN_PASSWORD ? 'text-emerald-600' : 'text-slate-500'}`}
              >
                {password.length >= MIN_PASSWORD ? '✓ ' : ''}At least {MIN_PASSWORD} characters
              </p>
            ) : (
              <div className="mt-1 text-right">
                <button
                  type="button"
                  onClick={() => switchMode('forgot')}
                  className="text-xs font-medium text-indigo-600 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
        {info && <p className="text-sm text-emerald-600">{info}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-indigo-600 text-white py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {isForgot ? 'Send reset link' : isSignup ? 'Create account' : 'Sign in'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-500">
        {isForgot ? 'Remembered it? ' : isSignup ? 'Already have an account? ' : "Don't have an account? "}
        <button
          type="button"
          onClick={() => switchMode(isForgot || isSignup ? 'signin' : 'signup')}
          className="font-medium text-indigo-600 hover:underline"
        >
          {isForgot ? 'Back to sign in' : isSignup ? 'Sign in' : 'Create one'}
        </button>
      </p>
    </div>
  )
}
