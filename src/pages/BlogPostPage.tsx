import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import BlogContent from '../components/blog/BlogContent'
import { DecoDivider } from '../components/club/Deco'
import { blogCopy, formatPostDate } from '../data/blogCopy'
import { fetchPostBySlug, pickLocalized, type BlogPost } from '../lib/blogApi'
import { useLanguage } from '../lib/i18n'

type State = { status: 'loading' } | { status: 'error' } | { status: 'missing' } | { status: 'ready'; post: BlogPost }

/** One post read on avln.hu. A post that lives elsewhere (tobbmintangol.hu) is forwarded there. */
export default function BlogPostPage() {
  const { slug = '' } = useParams()
  const { lang } = useLanguage()
  const copy = blogCopy[lang]
  const [state, setState] = useState<State>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    setState({ status: 'loading' })
    fetchPostBySlug(slug)
      .then((post) => {
        if (cancelled) return
        if (post?.external_url) {
          window.location.replace(post.external_url)
          return
        }
        setState(post ? { status: 'ready', post } : { status: 'missing' })
      })
      .catch(() => !cancelled && setState({ status: 'error' }))
    return () => {
      cancelled = true
    }
  }, [slug])

  const post = state.status === 'ready' ? state.post : null
  const title = post ? pickLocalized(post, 'title', lang) : ''

  // The tab shows the post's title while it's open, then the site title again.
  useEffect(() => {
    if (!title) return
    const previous = document.title
    document.title = `${title} · Avalon`
    return () => {
      document.title = previous
    }
  }, [title])

  const back = (
    <Link
      to="/blog"
      className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--club-gold-dark)] hover:underline"
    >
      <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
      {copy.back}
    </Link>
  )

  if (!post) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 py-8">
        {back}
        {state.status === 'loading' && <p className="text-sm text-slate-400">…</p>}
        {state.status === 'missing' && <p className="text-muted-foreground">{copy.notFound}</p>}
        {state.status === 'error' && <p className="text-sm text-red-600">{copy.loadError}</p>}
      </div>
    )
  }

  const localizedContent = lang === 'hu' ? post.content : post[`content_${lang}`]

  return (
    <article className="mx-auto max-w-3xl py-4">
      {back}
      <header className="mt-6 text-center">
        <time dateTime={post.published_at} className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--club-gold-dark)]">
          {formatPostDate(post.published_at, lang)}
        </time>
        <h1 className="mt-2 font-brand text-4xl font-semibold leading-tight text-[var(--club-green)] sm:text-5xl">{title}</h1>
        <DecoDivider className="mx-auto mt-4 max-w-xs" />
      </header>

      {post.image_url && (
        <div className="mt-8 border border-[var(--club-gold)] bg-[var(--club-paper)] p-1">
          <img src={post.image_url} alt="" className="block max-h-[28rem] w-full object-cover" />
        </div>
      )}

      {!localizedContent && (
        <p className="mt-6 border-l-2 border-[var(--club-gold)] pl-3 text-sm italic text-muted-foreground">{copy.onlyHungarian}</p>
      )}

      <BlogContent markdown={localizedContent || post.content} className="mt-8" />

      <div className="mt-12">
        <DecoDivider className="mx-auto max-w-xs" />
        <div className="mt-6 text-center">{back}</div>
      </div>
    </article>
  )
}
