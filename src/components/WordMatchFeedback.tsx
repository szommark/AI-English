import { matchWords } from '../lib/wordMatch'
import { useLanguage } from '../lib/i18n'

export default function WordMatchFeedback({ target, heard }: { target: string; heard: string }) {
  const { t } = useLanguage()
  const words = matchWords(target, heard)

  return (
    <div className="mt-2 rounded-lg bg-slate-50 border border-slate-200 p-3 text-sm space-y-1.5">
      <p>
        {words.map((w, i) => (
          <span key={i} className={w.matched ? 'text-emerald-700' : 'text-red-600 font-medium'}>
            {w.word}
            {i < words.length - 1 ? ' ' : ''}
          </span>
        ))}
      </p>
      <p className="text-slate-500">
        <span className="font-medium">{t('heardLabel')}</span> {heard || '—'}
      </p>
      <p className="text-xs text-slate-400">
        {t('wordMatchNote')}
      </p>
    </div>
  )
}
