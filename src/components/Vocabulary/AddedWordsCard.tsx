import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage, type MessageKey } from '../../lib/i18n'
import { removeCard } from '../../lib/vocabPracticeApi'
import type { AddedTutorWord } from '../../lib/vocab'

const REASON_LABEL: Record<AddedTutorWord['reason'], MessageKey> = {
  switched: 'vcReasonSwitched',
  asked: 'vcReasonAsked',
  lacked: 'vcReasonLacked',
}

/**
 * Tutor Bot feedback: the words this session added to the Vocabulary deck, each with a
 * one-tap undo (design §5.2) — the card is deleted, since it was only just created.
 */
export default function AddedWordsCard({ words }: { words: AddedTutorWord[] }) {
  const { t } = useLanguage()
  const [removed, setRemoved] = useState<Set<string>>(new Set())
  const [busy, setBusy] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  async function undo(cardId: string) {
    setBusy(cardId)
    setFailed(false)
    try {
      await removeCard(cardId)
      setRemoved((s) => new Set(s).add(cardId))
    } catch (err) {
      console.error('Failed to undo added word', err)
      setFailed(true)
    } finally {
      setBusy(null)
    }
  }

  if (words.length === 0) return null

  return (
    <div className="space-y-3 rounded-xl border border-[var(--teal-accent-border)] bg-[var(--teal-accent-soft)] p-5">
      <div>
        <h3 className="font-semibold text-foreground">{t('vcAddedTitle')}</h3>
        <p className="text-sm text-muted-foreground">{t('vcAddedHint')}</p>
      </div>
      <ul className="space-y-2">
        {words.map((w) => {
          const isRemoved = removed.has(w.cardId)
          return (
            <li key={w.cardId} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-card px-3 py-2">
              <div className={`min-w-0 ${isRemoved ? 'text-muted-foreground line-through' : ''}`}>
                <span className="font-medium text-foreground">{w.term}</span>
                {w.meaningHu && <span className="text-muted-foreground"> — {w.meaningHu}</span>}
                <span className="ml-2 text-xs text-muted-foreground">({t(REASON_LABEL[w.reason])})</span>
              </div>
              {isRemoved ? (
                <span className="text-xs text-muted-foreground">{t('vcUndone')}</span>
              ) : (
                <button
                  type="button"
                  onClick={() => undo(w.cardId)}
                  disabled={busy === w.cardId}
                  className="rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground hover:bg-secondary disabled:opacity-40"
                >
                  {t('vcUndo')}
                </button>
              )}
            </li>
          )
        })}
      </ul>
      {failed && <p className="text-sm text-red-600">{t('vcActionFailed')}</p>}
      <Link to="/vocabulary" className="inline-block text-sm font-medium text-[var(--teal-accent-strong)] hover:underline">
        {t('vcOpenVocabulary')}
      </Link>
    </div>
  )
}
