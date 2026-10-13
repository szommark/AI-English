import { Volume2 } from 'lucide-react'
import { useLanguage } from '../../../lib/i18n'

/** A model answer with an optional listen button. */
export default function ModelAnswer({ text, onListen }: { text: string; onListen?: () => void }) {
  const { t } = useLanguage()
  return (
    <p className="flex items-center gap-2 text-sm font-medium text-slate-800">
      <span className="min-w-0 break-words">{text}</span>
      {onListen && (
        <button
          type="button"
          onClick={onListen}
          aria-label={t('tenseGameListenModel')}
          title={t('tenseGameListenModel')}
          className="shrink-0 rounded-full p-1 text-indigo-600 hover:bg-indigo-50"
        >
          <Volume2 className="h-4 w-4" aria-hidden />
        </button>
      )}
    </p>
  )
}
