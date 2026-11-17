import { useState } from 'react'
import { Printer } from 'lucide-react'
import { getRoleCards } from '../data/roleCards'
import { printRoleCards } from '../lib/roleCardPrint'
import { useLanguage } from '../lib/i18n'

/** "Print role cards" for scenarios that come from a printable A/B card set; nothing otherwise. */
export default function PrintRoleCardsButton({ scenarioId, className = '' }: { scenarioId: string; className?: string }) {
  const { t } = useLanguage()
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  const set = getRoleCards(scenarioId)
  if (!set) return null

  async function handlePrint() {
    if (!set) return
    setBusy(true)
    setFailed(false)
    try {
      await printRoleCards(scenarioId, set)
    } catch {
      setFailed(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={`flex flex-wrap items-center justify-end gap-2 ${className}`}>
      {failed && <span className="text-xs text-red-600">{t('printRoleCardsFailed')}</span>}
      <button
        type="button"
        onClick={handlePrint}
        disabled={busy}
        title={t('printRoleCardsHint')}
        className="relative z-10 inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
      >
        <Printer className="h-4 w-4" aria-hidden />
        {t('printRoleCards')}
      </button>
    </div>
  )
}
