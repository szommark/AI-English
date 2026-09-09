import { Link } from 'react-router-dom'
import type { Category, Subcategory } from '../data/categories'

export default function CategoryBreadcrumb({
  category,
  subcategory,
}: {
  category: Category
  subcategory?: Subcategory
}) {
  return (
    <nav className="text-sm text-muted-foreground">
      <Link to="/conversational-english" className="hover:underline">
        Conversational English
      </Link>
      <span className="mx-1.5">›</span>
      {subcategory ? (
        <>
          <Link to={`/conversational-english/${category.id}`} className="hover:underline">
            {category.title}
          </Link>
          <span className="mx-1.5">›</span>
          <span className="text-foreground font-medium">{subcategory.title}</span>
        </>
      ) : (
        <span className="text-foreground font-medium">{category.title}</span>
      )}
    </nav>
  )
}
