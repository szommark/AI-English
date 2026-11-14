import { useState } from 'react'
import { Check } from 'lucide-react'
import { useAuthPrompt } from '../AppLayout'
import { DecoDivider, DecoFan } from './Deco'
import type { ClubCopy } from '../../data/clubCopy'
import { CONTACT_EMAIL } from '../../data/landingCopy'
import { useAuth } from '../../lib/AuthContext'
import { formatClubDate, semesterNumber, useClubRegistration, type ClubKind } from '../../lib/club'
import { useLanguage, type Lang } from '../../lib/i18n'

const LOCALES: Record<Lang, string> = { hu: 'hu-HU', en: 'en-GB', de: 'de-DE' }

const goldButton =
  'bg-[#c9a227] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#0f2a24] hover:bg-[#e9d28a] disabled:opacity-50'
const outlineButton =
  'border border-[#c9a227] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#0f2a24] hover:bg-[#0f2a24] hover:text-[#f6ecd2] disabled:opacity-50'

function Done({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0f2a24]">
      <Check className="h-4 w-4 text-[#8a6d14]" aria-hidden="true" />
      {text}
    </span>
  )
}

/** Sign-up for one Wednesday or a whole semester; signed-out visitors are asked to sign in first. */
export default function ClubSignUp({ copy, id }: { copy: ClubCopy; id: string }) {
  const { user } = useAuth()
  const { lang, t } = useLanguage()
  const { promptSignIn, promptSignUp } = useAuthPrompt()
  const { sessions, semesters, busy, register, cancel } = useClubRegistration(user?.id ?? null)
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null)
  const locale = LOCALES[lang]

  async function join(kind: ClubKind, date: string) {
    if (!user) {
      promptSignIn('/club')
      return
    }
    const result = await register(kind, date)
    setMessage({ text: copy.results[result], ok: result === 'ok' })
  }

  async function leave(kind: ClubKind, date: string) {
    setMessage(null)
    if (!(await cancel(kind, date))) setMessage({ text: copy.results.error, ok: false })
  }

  const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(copy.mailSubject)}&body=${encodeURIComponent(copy.mailBody)}`
  const openSemesters = semesters?.filter((s) => s.sessionsLeft > 0) ?? []

  return (
    <section id={id} className="scroll-mt-24">
      <div className="text-center">
        <DecoFan className="mx-auto w-16" />
        <h2 className="mt-2 font-brand text-3xl font-semibold text-[#0f2a24] sm:text-4xl">{copy.signUpTitle}</h2>
        <DecoDivider className="mx-auto mt-3 max-w-xs" />
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">{copy.signUpIntro}</p>
      </div>

      {!user && (
        <div className="mx-auto mt-6 max-w-2xl border border-[#c9a227] bg-[#0f2a24] p-1 text-center">
          <div className="border border-[rgba(201,162,39,0.55)] px-5 py-5">
            <p className="font-brand text-xl text-[#f6ecd2]">{copy.needAccount}</p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <button type="button" onClick={promptSignUp} className={goldButton}>
                {copy.createAccount}
              </button>
              <button
                type="button"
                onClick={() => promptSignIn('/club')}
                className="border border-[#c9a227] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#e9d28a] hover:bg-[#c9a227] hover:text-[#0f2a24]"
              >
                {t('signIn')}
              </button>
            </div>
            {CONTACT_EMAIL && (
              <a href={mailto} className="mt-4 inline-block text-sm text-[#e9d28a] underline hover:text-[#f6ecd2]">
                {copy.noAccount}
              </a>
            )}
          </div>
        </div>
      )}

      {message && (
        <p
          role="status"
          className={`mx-auto mt-6 max-w-2xl border px-4 py-2 text-center text-sm font-semibold ${
            message.ok ? 'border-[#c9a227] bg-[#f6ecd2] text-[#0f2a24]' : 'border-red-300 bg-red-50 text-red-800'
          }`}
        >
          {message.text}
        </p>
      )}

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <div className="border border-[#c9a227] bg-[#fbf6e9] p-1">
          <div className="h-full border border-[rgba(201,162,39,0.55)] p-5">
            <h3 className="font-brand text-2xl font-semibold text-[#0f2a24]">{copy.semestersTitle}</h3>
            {semesters === null ? (
              <p className="mt-4 text-sm text-muted-foreground">{copy.loading}</p>
            ) : (
              <ul className="mt-4 space-y-4">
                {openSemesters.map((s) => (
                  <li key={s.start} className="border-t border-[rgba(201,162,39,0.55)] pt-4 first:border-t-0 first:pt-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8a6d14]">
                      {copy.semesterName.replace('{n}', String(semesterNumber(s.start)))}
                    </p>
                    <p className="mt-0.5 font-brand text-xl font-semibold text-[#0f2a24]">
                      {formatClubDate(s.start, locale, { year: 'numeric', month: 'long' })} –{' '}
                      {formatClubDate(s.end, locale, { year: 'numeric', month: 'long' })}
                    </p>
                    <p className="text-sm text-muted-foreground">{copy.sessionsLeft.replace('{n}', String(s.sessionsLeft))}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      {s.mine ? (
                        <>
                          <Done text={copy.registeredSemester} />
                          <button type="button" disabled={busy} onClick={() => leave('semester', s.start)} className={outlineButton}>
                            {copy.cancel}
                          </button>
                        </>
                      ) : s.anyFull ? (
                        <span className="text-sm font-semibold text-[#8a6d14]">{copy.semesterFull}</span>
                      ) : (
                        <button type="button" disabled={busy} onClick={() => join('semester', s.start)} className={goldButton}>
                          {copy.joinSemester}
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="border border-[#c9a227] bg-[#fbf6e9] p-1">
          <div className="h-full border border-[rgba(201,162,39,0.55)] p-5">
            <h3 className="font-brand text-2xl font-semibold text-[#0f2a24]">{copy.sessionsTitle}</h3>
            {sessions === null ? (
              <p className="mt-4 text-sm text-muted-foreground">{copy.loading}</p>
            ) : (
              <ul className="mt-2 divide-y divide-[rgba(201,162,39,0.55)]">
                {sessions.map((s) => (
                  <li key={s.date} className="flex flex-wrap items-center justify-between gap-2 py-3">
                    <span className="font-brand text-lg font-semibold text-[#0f2a24]">
                      {formatClubDate(s.date, locale, { month: 'long', day: 'numeric', weekday: 'long' })}
                    </span>
                    <span className="flex items-center gap-3">
                      {s.mine === 'semester' ? (
                        <Done text={copy.registeredSemester} />
                      ) : s.mine === 'session' ? (
                        <>
                          <Done text={copy.registered} />
                          <button type="button" disabled={busy} onClick={() => leave('session', s.date)} className={outlineButton}>
                            {copy.cancel}
                          </button>
                        </>
                      ) : s.full ? (
                        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8a6d14]">{copy.full}</span>
                      ) : (
                        <button type="button" disabled={busy} onClick={() => join('session', s.date)} className={outlineButton}>
                          {copy.joinSession}
                        </button>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
