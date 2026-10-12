import { useEffect, useId, useRef, useState } from 'react'
import { ChevronDown, LayoutGrid } from 'lucide-react'
import { useLanguage } from '../../../lib/i18n'
import { TENSE_IDS, type TenseId } from '../../../lib/tenseEngine/index.ts'
import { TENSE_CONTENT } from '../../../data/tenseExplorerContent.ts'
import type { ExplainLang } from './explorerSettings'

/** "Boxes" button with a popover of checkboxes for turning single tense boxes on and off. */
export default function BoxesPopover({
  visible,
  onToggle,
  explainLang,
}: {
  visible: Set<TenseId>
  onToggle: (tense: TenseId) => void
  explainLang: ExplainLang
}) {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const panelId = useId()

  useEffect(() => {
    if (!open) return
    panelRef.current?.querySelector<HTMLInputElement>('input:not(:disabled)')?.focus()
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    function onPointerDown(e: MouseEvent) {
      const target = e.target as Node
      if (!panelRef.current?.contains(target) && !buttonRef.current?.contains(target)) setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('mousedown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('mousedown', onPointerDown)
    }
  }, [open])

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition hover:bg-slate-50"
      >
        <LayoutGrid size={14} />
        {t('tenseBoxes')} ({visible.size}/{TENSE_IDS.length})
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div
          ref={panelRef}
          id={panelId}
          role="group"
          aria-label={t('tenseBoxes')}
          className="absolute left-0 z-20 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white p-2 shadow-lg"
        >
          {TENSE_IDS.map((tense) => {
            const checked = visible.has(tense)
            const content = TENSE_CONTENT[tense]
            return (
              <label
                key={tense}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-50 has-[:disabled]:cursor-not-allowed"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  // At least one box stays visible.
                  disabled={checked && visible.size === 1}
                  onChange={() => onToggle(tense)}
                  className="h-4 w-4 accent-amber-500"
                />
                <span className="min-w-0">
                  {content.nameEn}
                  {explainLang === 'hu' && <span className="text-xs text-slate-400"> · {content.nameHu}</span>}
                </span>
              </label>
            )
          })}
        </div>
      )}
    </div>
  )
}
