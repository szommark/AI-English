import { X } from 'lucide-react'
import { useLanguage, type MessageKey } from '../../../lib/i18n'
import { parsePhrase, type Subject, type TenseId } from '../../../lib/tenseEngine/index.ts'
import { TENSE_CONTENT, findComparePair } from '../../../data/tenseExplorerContent.ts'
import SentenceList from './SentenceList'
import type { ExplainLang } from './explorerSettings'

/** Two pinned tenses side by side with the same verb and subject, plus the contrast note. */
export default function ComparePanel({
  tenses,
  input,
  subject,
  timeCue,
  explainLang,
  label,
  onClose,
  speak,
}: {
  tenses: [TenseId, TenseId]
  input: string
  subject: Subject
  timeCue: boolean
  explainLang: ExplainLang
  label: (key: MessageKey) => string
  onClose: () => void
  speak?: (text: string) => void
}) {
  const { t } = useLanguage()
  const parsed = input.trim() ? parsePhrase(input) : null
  const phrase = parsed && !('error' in parsed) ? parsed : null
  const pair = findComparePair(tenses[0], tenses[1])

  return (
    <section className="rounded-2xl border border-amber-200 bg-white p-4 shadow-sm" aria-label={t('tenseCompare')}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-amber-700">{t('tenseCompare')}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('tenseCompareClose')}
          title={t('tenseCompareClose')}
          className="rounded-md p-1 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
        >
          <X size={16} />
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {tenses.map((tense) => {
          const content = TENSE_CONTENT[tense]
          return (
            <div key={tense} className="min-w-0 rounded-xl bg-slate-50 p-3">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-800">{content.nameEn}</h3>
                  {explainLang === 'hu' && <p className="text-xs text-slate-500">{content.nameHu}</p>}
                </div>
                <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                  {subject}
                </span>
              </div>
              {phrase ? (
                <SentenceList
                  tense={tense}
                  phrase={phrase}
                  subject={subject}
                  timeCue={timeCue}
                  label={label}
                  listenLabel={t('listen')}
                  speak={speak}
                />
              ) : (
                <p className="text-sm italic text-slate-400">{t('tenseEmptyBox')}</p>
              )}
            </div>
          )
        })}
      </div>
      {pair && (
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">{explainLang === 'hu' ? pair.hu : pair.en}</p>
      )}
    </section>
  )
}
