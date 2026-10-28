import { useEffect, useRef, useState, type DragEvent } from 'react'
import { useLocation } from 'react-router-dom'
import { ImagePlus, X } from 'lucide-react'
import { useLanguage, type MessageKey } from '../../lib/i18n'
import { FEEDBACK_KINDS, FEEDBACK_LIMITS, type FeedbackContext, type FeedbackKind } from '../../lib/feedback'
import { collectFeedbackContext } from '../../lib/feedbackContext'
import {
  FeedbackRateLimitError,
  prepareScreenshot,
  submitFeedbackReport,
  type PreparedScreenshot,
} from '../../lib/feedbackApi'

const KIND_LABEL: Record<FeedbackKind, MessageKey> = {
  bug: 'reportKindBug',
  display: 'reportKindDisplay',
  content: 'reportKindContent',
  idea: 'reportKindIdea',
}

const MIC_LABEL: Record<FeedbackContext['micPermission'], MessageKey> = {
  granted: 'reportMicGranted',
  denied: 'reportMicDenied',
  prompt: 'reportMicPrompt',
  unknown: 'reportMicUnknown',
}

type Phase = 'editing' | 'sending' | 'sent'

/**
 * "Report a problem": type, what happened, optional expectation and screenshot. The page,
 * browser, recent errors and failed requests are attached automatically and listed under
 * "What gets sent automatically?" so nothing is sent unseen. After a crash (CrashBoundary) the
 * description starts with "The page crashed while I was …" for the user to finish.
 */
export default function ReportProblemDialog({ onClose, crashed = false }: { onClose: () => void; crashed?: boolean }) {
  const { lang, t } = useLanguage()
  const { pathname } = useLocation()
  // The page the user was on when they opened the dialog, even if they navigate meanwhile.
  const [pagePath] = useState(pathname)
  const [context, setContext] = useState<FeedbackContext | null>(null)
  const [kind, setKind] = useState<FeedbackKind>('bug')
  const [description, setDescription] = useState(() => (crashed ? t('reportCrashDescription') : ''))
  const [expected, setExpected] = useState('')
  const [shot, setShot] = useState<PreparedScreenshot | null>(null)
  const [shotError, setShotError] = useState(false)
  const [phase, setPhase] = useState<Phase>('editing')
  const [error, setError] = useState<MessageKey | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const descriptionRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    collectFeedbackContext(lang).then(setContext)
    const field = descriptionRef.current
    field?.focus()
    // Caret after the crash prefill, ready to finish the sentence.
    field?.setSelectionRange(field.value.length, field.value.length)
    // Snapshot once on open: later errors (e.g. from the dialog itself) aren't part of the report.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  async function attach(file: Blob | null | undefined) {
    if (!file || !file.type.startsWith('image/')) return
    setShotError(false)
    try {
      setShot(await prepareScreenshot(file))
    } catch {
      setShotError(true)
    }
  }

  useEffect(() => {
    if (phase !== 'editing') return
    function onPaste(e: ClipboardEvent) {
      const item = Array.from(e.clipboardData?.items ?? []).find((i) => i.type.startsWith('image/'))
      if (!item) return
      e.preventDefault()
      attach(item.getAsFile())
    }
    document.addEventListener('paste', onPaste)
    return () => document.removeEventListener('paste', onPaste)
  }, [phase])

  function onDrop(e: DragEvent) {
    e.preventDefault()
    attach(e.dataTransfer.files[0])
  }

  async function send() {
    if (!context || !description.trim()) return
    setPhase('sending')
    setError(null)
    try {
      await submitFeedbackReport({
        kind,
        description: description.trim(),
        expected: kind === 'idea' ? undefined : expected.trim() || undefined,
        pagePath,
        context,
        screenshot: shot ? { contentType: shot.contentType, dataBase64: shot.dataBase64 } : undefined,
      })
      setPhase('sent')
    } catch (err) {
      setError(err instanceof FeedbackRateLimitError ? 'reportRateLimited' : 'reportError')
      setPhase('editing')
    }
  }

  const canSend = phase === 'editing' && !!context && description.trim().length > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-problem-title"
        className="relative max-h-full w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t('reportClose')}
          className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        {phase === 'sent' ? (
          <div className="py-4 text-center">
            <h2 id="report-problem-title" className="text-lg font-semibold text-foreground">
              {t('reportSentTitle')}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{t('reportSentBody')}</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              {t('reportClose')}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="pr-6">
              <h2 id="report-problem-title" className="text-lg font-semibold text-foreground">
                {t('reportProblem')}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{t('reportIntro')}</p>
            </div>

            <fieldset>
              <legend className="mb-2 text-sm font-medium text-foreground">{t('reportKindLabel')}</legend>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {FEEDBACK_KINDS.map((k) => (
                  <button
                    key={k}
                    type="button"
                    aria-pressed={kind === k}
                    onClick={() => setKind(k)}
                    className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                      kind === k
                        ? 'border-[var(--teal-accent-border)] bg-[var(--teal-accent-soft)] font-medium text-foreground'
                        : 'border-border text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }`}
                  >
                    {t(KIND_LABEL[k])}
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-foreground">
                {t(kind === 'idea' ? 'reportDescriptionIdeaLabel' : 'reportDescriptionLabel')}
              </span>
              <textarea
                ref={descriptionRef}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={FEEDBACK_LIMITS.description}
                rows={4}
                placeholder={kind === 'idea' ? undefined : t('reportDescriptionPlaceholder')}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-[var(--teal-accent)] focus:outline-none"
              />
              {crashed && <span className="mt-1 block text-xs text-muted-foreground">{t('reportCrashNote')}</span>}
            </label>

            {kind !== 'idea' && (
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-foreground">
                  {t(kind === 'content' ? 'reportExpectedContentLabel' : 'reportExpectedLabel')}
                </span>
                <textarea
                  value={expected}
                  onChange={(e) => setExpected(e.target.value)}
                  maxLength={FEEDBACK_LIMITS.expected}
                  rows={2}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-[var(--teal-accent)] focus:outline-none"
                />
              </label>
            )}

            <div>
              <span className="mb-1 block text-sm font-medium text-foreground">{t('reportScreenshotLabel')}</span>
              {shot ? (
                <div className="relative inline-block">
                  <img
                    src={shot.previewUrl}
                    alt=""
                    className="max-h-40 rounded-lg border border-border object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => setShot(null)}
                    aria-label={t('reportScreenshotRemove')}
                    title={t('reportScreenshotRemove')}
                    className="absolute -right-2 -top-2 rounded-full border border-border bg-card p-1 text-muted-foreground shadow-sm hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={onDrop}
                  className="flex flex-wrap items-center gap-3 rounded-lg border border-dashed border-border px-3 py-3"
                >
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-primary hover:bg-secondary"
                  >
                    <ImagePlus className="h-4 w-4" aria-hidden="true" />
                    {t('reportScreenshotChoose')}
                  </button>
                  <span className="text-xs text-muted-foreground">{t('reportScreenshotHint')}</span>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      attach(e.target.files?.[0])
                      e.target.value = ''
                    }}
                  />
                </div>
              )}
              {shotError && <p className="mt-1 text-xs text-red-600">{t('reportScreenshotError')}</p>}
            </div>

            <details className="rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground">
              <summary className="cursor-pointer font-medium text-foreground">{t('reportDetailsToggle')}</summary>
              <p className="mt-2">{t('reportDetailsIntro')}</p>
              {context && (
                <dl className="mt-2 grid grid-cols-[auto,1fr] gap-x-3 gap-y-1">
                  <dt>{t('reportDetailPage')}</dt>
                  <dd className="break-all text-foreground">{pagePath}</dd>
                  <dt>{t('reportDetailBrowser')}</dt>
                  <dd className="text-foreground">
                    {context.browser}, {context.os}
                  </dd>
                  <dt>{t('reportDetailScreen')}</dt>
                  <dd className="text-foreground">
                    {context.viewport.width} × {context.viewport.height}
                  </dd>
                  <dt>{t('reportDetailMic')}</dt>
                  <dd className="text-foreground">{t(MIC_LABEL[context.micPermission])}</dd>
                  <dt>{t('reportDetailVersion')}</dt>
                  <dd className="text-foreground">{context.appVersion}</dd>
                  <dd className="col-span-2 text-foreground">
                    {t('reportDetailLogs', { errors: context.errors.length, requests: context.requests.length })}
                  </dd>
                </dl>
              )}
            </details>

            {error && <p className="text-sm text-red-600">{t(error)}</p>}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                {t('reportCancel')}
              </button>
              <button
                type="button"
                onClick={send}
                disabled={!canSend}
                className="rounded-lg bg-[var(--teal-accent)] px-4 py-2 text-sm font-semibold text-primary hover:bg-[var(--teal-accent-strong)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {phase === 'sending' ? t('reportSending') : t('reportSend')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
