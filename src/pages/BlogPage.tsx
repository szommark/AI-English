import { useEffect, useState } from 'react'
import BlogCard from '../components/blog/BlogCard'
import { DecoDivider, DecoFan } from '../components/club/Deco'
import { blogCopy } from '../data/blogCopy'
import { fetchPublishedPosts, type BlogPost } from '../lib/blogApi'
import { useLanguage } from '../lib/i18n'

/** Public blog list, newest first. Linked from the footer and the signed-out home page. */
export default function BlogPage() {
  const { lang } = useLanguage()
  const copy = blogCopy[lang]
  const [posts, setPosts] = useState<BlogPost[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    const previous = document.title
    document.title = 'Blog · Avalon'
    fetchPublishedPosts()
      .then(setPosts)
      .catch(() => setError(true))
    return () => {
      document.title = previous
    }
  }, [])

  return (
    <div className="space-y-8 py-4">
      <header className="mx-auto max-w-2xl text-center">
        <DecoFan className="mx-auto w-14" />
        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--club-gold-dark)]">{copy.kicker}</p>
        <h1 className="mt-2 font-brand text-4xl font-semibold leading-tight text-[var(--club-green)] sm:text-5xl">{copy.title}</h1>
        <DecoDivider className="mx-auto mt-4 max-w-xs" />
        <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">{copy.intro}</p>
      </header>

      {error && <p className="text-center text-sm text-red-600">{copy.loadError}</p>}
      {!error && posts === null && <p className="text-center text-sm text-slate-400">…</p>}
      {posts && posts.length === 0 && <p className="text-center text-sm text-muted-foreground">{copy.empty}</p>}

      {posts && posts.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
