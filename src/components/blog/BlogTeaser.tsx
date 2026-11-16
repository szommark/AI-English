import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import BlogCard from './BlogCard'
import { DecoDivider, DecoFan } from '../club/Deco'
import { blogCopy } from '../../data/blogCopy'
import { fetchPublishedPosts, type BlogPost } from '../../lib/blogApi'
import { useLanguage } from '../../lib/i18n'

/** The three newest posts on the signed-out home page, with a link to /blog. Hidden when there are none. */
export default function BlogTeaser() {
  const { lang } = useLanguage()
  const copy = blogCopy[lang]
  const [posts, setPosts] = useState<BlogPost[]>([])

  useEffect(() => {
    fetchPublishedPosts(3)
      .then(setPosts)
      .catch(() => setPosts([]))
  }, [])

  if (posts.length === 0) return null

  return (
    <section id="blog" className="scroll-mt-24 space-y-6">
      <div className="text-center">
        <DecoFan className="mx-auto w-14" />
        <h2 className="mt-2 font-brand text-3xl font-semibold leading-tight text-[var(--club-green)] sm:text-4xl">{copy.latest}</h2>
        <DecoDivider className="mx-auto mt-3 max-w-xs" />
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {posts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
      <div className="text-center">
        <Link
          to="/blog"
          className="inline-flex items-center gap-1.5 bg-[var(--club-green)] px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--club-cream)] shadow-sm hover:bg-[var(--club-green-soft)]"
        >
          {copy.allPosts}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}
