import { Link } from 'react-router-dom'
import { useLanguage } from '../lib/i18n'

/** Adult education registry line: its own element so it can be removed in one place. */
function RegistryLine() {
  const { t } = useLanguage()
  return <p>{t('legalRegistry')}</p>
}

/**
 * Legal footer on every page (rendered by AppLayout). The bottom padding keeps the last line
 * clear of the floating language pill / Report a problem button.
 */
export default function LegalFooter() {
  const { t } = useLanguage()
  const linkClass = 'underline-offset-2 decoration-[var(--club-gold)] hover:text-[var(--club-gold-light)] hover:underline'

  return (
    <footer className="border-t-2 border-[var(--club-gold)] bg-[var(--club-green)]">
      <div className="mx-auto max-w-6xl space-y-1.5 px-4 pt-6 pb-20 text-xs text-[rgba(246,236,210,0.75)] sm:pb-16">
        <h2 className="font-semibold uppercase tracking-[0.2em] text-[var(--club-gold-light)]">{t('legalHeading')}</h2>
        <RegistryLine />
        <nav aria-label={t('legalHeading')} className="flex flex-wrap gap-x-4 gap-y-1">
          <Link to="/privacy" className={linkClass}>
            {t('legalPrivacy')}
          </Link>
          <Link to="/impressum" className={linkClass}>
            {t('legalImpressum')}
          </Link>
        </nav>
        <p>{t('legalCopyright')}</p>
      </div>
    </footer>
  )
}
