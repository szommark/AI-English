import { categories } from '../data/categories'
import CategoryTile from '../components/CategoryTile'
import PageHeading from '../components/PageHeading'
import { localizeCategory, useLanguage } from '../lib/i18n'

export default function CategoryGridPage() {
  const { lang, t } = useLanguage()

  return (
    <div className="space-y-6">
      <PageHeading title={t('crumbConversational')} subtitle={t('pickCategory')} />

      <div className="grid gap-6 grid-cols-2 sm:grid-cols-3">
        {categories.map((c) => (
          <CategoryTile
            key={c.id}
            title={localizeCategory(lang, c)}
            photo={c.tilePhoto}
            to={c.status === 'active' ? `/conversational-english/${c.id}` : `/coming-soon/${c.id}`}
          />
        ))}
      </div>
    </div>
  )
}
