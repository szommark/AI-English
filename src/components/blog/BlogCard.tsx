import { Link } from 'react-router-dom'
import { ArrowRight, ExternalLink } from 'lucide-react'
import { blogCopy, formatPostDate } from '../../data/blogCopy'
import { pickLocalized, postHref, type BlogPost } from '../../lib/blogApi'
import { useLanguage } from '../../lib/i18n'

/**
 * A post card in the club's cream-and-gold frame. A post with an external address (the older
 * posts on tobbmintangol.hu) opens there in a new tab; the others open on avln.hu.
 */
export default function BlogCard({ post }: { post: BlogPost }) {
  const { lang } = useLanguage()
  const copy = blogCopy[lang]
  const title = pickLocalized(post, 'title', lang)
  const excerpt = pickLocalized(post, 'excerpt', lang)
  const external = Boolean(post.external_url)

  const body = (
    <span className="flex h-full flex-col border border-[rgba(201,162,39,0.55)]">
      {post.image_url && (
        <span className="block aspect-[16/9] overflow-hidden border-b border-[rgba(201,162,39,0.55)] bg-[var(--club-cream)]">
          <img
            src={post.image_url}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </span>
      )}
      <span className="flex flex-1 flex-col p-5">
        <time dateTime={post.published_at} className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--club-gold-dark)]">
          {formatPostDate(post.published_at, lang)}
        </time>
        <span className="mt-2 font-brand text-2xl font-semibold leading-tight text-[var(--club-green)]">{title}</span>
        <span className="mt-2 line-clamp-3 text-[15px] leading-relaxed text-foreground">{excerpt}</span>
        <span className="mt-auto flex items-center gap-1.5 pt-4 text-sm font-semibold text-[var(--club-green)] group-hover:text-[var(--club-gold-dark)]">
          {copy.readMore}
          {external ? (
            <>
              <span className="font-normal text-muted-foreground">· {copy.externalNote}</span>
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </>
          ) : (
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          )}
        </span>
      </span>
    </span>
  )

  const className =
    'group block h-full border border-[var(--club-gold)] bg-[var(--club-paper)] p-1 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-12px_rgba(15,42,36,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--club-gold)] focus-visible:ring-offset-2'

  return external ? (
    <a href={postHref(post)} target="_blank" rel="noopener noreferrer" className={className}>
      {body}
    </a>
  ) : (
    <Link to={postHref(post)} className={className}>
      {body}
    </Link>
  )
}
