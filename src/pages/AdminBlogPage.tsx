import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { adminListPosts, postHref, type BlogPost } from '../lib/blogApi'

/** Admin: every blog post (drafts too), newest first. */
export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    adminListPosts()
      .then(setPosts)
      .catch((e: Error) => setError(e.message))
  }, [])

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/admin" className="text-sm text-indigo-600 hover:underline">
            ← Admin
          </Link>
          <h1 className="mt-1 text-xl font-semibold text-slate-800">Blog</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/blog" className="text-sm text-indigo-600 hover:underline">
            View the blog
          </Link>
          <Link to="/admin/blog/new" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            New post
          </Link>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {!error && posts === null && <p className="text-sm text-slate-400">Loading...</p>}
      {posts && posts.length === 0 && <p className="text-sm text-slate-500">No posts yet.</p>}

      {posts && posts.length > 0 && (
        <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
          {posts.map((post) => (
            <li key={post.id} className="flex items-center gap-4 px-4 py-3">
              {post.image_url ? (
                <img src={post.image_url} alt="" className="h-12 w-16 shrink-0 rounded object-cover" />
              ) : (
                <span className="h-12 w-16 shrink-0 rounded bg-slate-100" />
              )}
              <div className="min-w-0 flex-1">
                <Link to={`/admin/blog/${post.id}`} className="font-medium text-slate-800 hover:text-indigo-700 hover:underline">
                  {post.title}
                </Link>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                  <span>{new Date(post.published_at).toLocaleDateString('hu-HU')}</span>
                  {post.published ? (
                    <span className="rounded bg-emerald-50 px-1.5 py-0.5 font-medium text-emerald-700">Published</span>
                  ) : (
                    <span className="rounded bg-amber-50 px-1.5 py-0.5 font-medium text-amber-700">Draft</span>
                  )}
                  {post.external_url ? (
                    <span className="inline-flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                      opens {new URL(post.external_url).host}
                    </span>
                  ) : (
                    <span>read on avln.hu</span>
                  )}
                  {(post.title_en || post.title_de) && (
                    <span>
                      {[post.title_en && 'EN', post.title_de && 'DE'].filter(Boolean).join(' · ')}
                    </span>
                  )}
                </div>
              </div>
              {post.published && (
                post.external_url ? (
                  <a href={postHref(post)} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline">
                    Open
                  </a>
                ) : (
                  <Link to={postHref(post)} className="text-xs text-indigo-600 hover:underline">
                    Open
                  </Link>
                )
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
