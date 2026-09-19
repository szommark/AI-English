import { LANGUAGES, useLanguage } from '../lib/i18n'

export default function LanguageSwitcher() {
  const { lang, setLang, t } = useLanguage()

  return (
    <div
      role="group"
      aria-label={t('language')}
      className="inline-flex rounded-lg border border-border bg-card p-0.5 shadow-sm"
    >
      {LANGUAGES.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => setLang(option.value)}
          aria-pressed={lang === option.value}
          title={option.name}
          className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
            lang === option.value
              ? 'bg-[var(--teal-accent)] text-primary'
              : 'text-muted-foreground hover:bg-secondary'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
