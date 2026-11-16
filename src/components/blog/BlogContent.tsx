import { useMemo } from 'react'
import { renderBlogHtml } from '../../lib/blogFormat'

/**
 * A post's Markdown body. Shared by the post page and the editor's preview, so the preview always
 * matches what gets published. renderBlogHtml escapes raw HTML and drops unsafe links.
 */
export default function BlogContent({ markdown, className = '' }: { markdown: string; className?: string }) {
  const html = useMemo(() => renderBlogHtml(markdown), [markdown])
  return <div className={`blog-prose ${className}`} dangerouslySetInnerHTML={{ __html: html }} />
}
