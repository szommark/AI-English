import { Link, Navigate, useParams } from 'react-router-dom'
import { categories } from '../data/categories'
import CategoryTile from '../components/CategoryTile'
import CategoryBreadcrumb from '../components/CategoryBreadcrumb'
import { useAuth } from '../lib/AuthContext'

export default function SubcategoryGridPage() {
  const { signOut, user } = useAuth()
  const { categoryId } = useParams()
  const category = categories.find((c) => c.id === categoryId)

  if (!category) return <Navigate to="/conversational-english" replace />

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2.5">
            <div
              className="h-8 w-8 rounded-md flex items-center justify-center text-white font-bold"
              style={{ background: 'var(--gradient-hero)' }}
            >
              A
            </div>
            <div>
              <span className="text-[15px] font-semibold tracking-tight text-foreground">AI-English</span>
              <p className="text-xs text-muted-foreground">{category.title} ({category.titleHu}) — válassz egy alkategóriát</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">{user?.email}</span>
            <Link to="/settings/voice" className="text-primary hover:underline">
              Voice settings
            </Link>
            <button onClick={signOut} className="text-primary hover:underline">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Link to="/" className="text-sm text-primary hover:underline">
            ← Vissza a főoldalra
          </Link>
          <CategoryBreadcrumb category={category} />
        </div>

        <div className="grid gap-6 grid-cols-2 sm:grid-cols-3">
          {category.subcategories.map((sub) => (
            <CategoryTile
              key={sub.id}
              title={sub.title}
              photo={sub.tilePhoto}
              to={`/conversational-english/${category.id}/${sub.id}`}
            />
          ))}
        </div>
      </main>
    </div>
  )
}
