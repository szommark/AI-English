import { Navigate, useParams } from 'react-router-dom'
import { categories } from '../data/categories'
import CategoryTile from '../components/CategoryTile'
import PageHeading from '../components/PageHeading'
import { localizeCategory, localizeSubcategory, useLanguage } from '../lib/i18n'

export default function SubcategoryGridPage() {
  const { lang, t } = useLanguage()
  const { categoryId } = useParams()
  const category = categories.find((c) => c.id === categoryId)

  if (!category) return <Navigate to="/conversational-english" replace />

  return (
    <div className="space-y-6">
      <PageHeading title={localizeCategory(lang, category)} subtitle={t('pickSubcategory')} />

      <div className="grid gap-6 grid-cols-2 sm:grid-cols-3">
        {category.subcategories.map((sub) => (
          <CategoryTile
            key={sub.id}
            title={localizeSubcategory(lang, sub)}
            photo={sub.tilePhoto}
            to={`/conversational-english/${category.id}/${sub.id}`}
          />
        ))}
      </div>
    </div>
  )
}
