import { useEffect, useRef, useState, type ClipboardEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ImagePlus, Loader2, Trash2 } from 'lucide-react'
import BlogContentField from '../components/blog/BlogContentField'
import {
  adminDeletePost,
  adminFetchPost,
  adminSavePost,
  adminUploadImage,
  slugify,
  type BlogPostInput,
} from '../lib/blogApi'

type TextLang = 'hu' | 'en' | 'de'
const LANG_LABELS: Record<TextLang, string> = { hu: 'Magyar (main)', en: 'English', de: 'Deutsch' }

interface Texts {
  title: string
  excerpt: string
  content: string
}

const EMPTY_TEXTS: Texts = { title: '', excerpt: '', content: '' }

/** "2026-10-31T21:26" in the admin's own time zone, for <input type="datetime-local">. */
function toLocalInput(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** A summary from the text when the excerpt is left empty: whole sentences up to ~220 characters. */
function excerptFromContent(content: string): string {
  // Paragraphs only: headings and list items don't read well on a card.
  const prose = content.replace(/^\s*#+\s.*$/gm, '').replace(/^\s*(?:[-*+•]|\d+[.)])\s.*$/gm, '')
  const plain = (prose.trim() ? prose : content)
    .replace(/[*_`>#[\]]|\(https?:[^)]*\)/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (plain.length <= 220) return plain
  const sentences = plain.match(/[^.!?…]+[.!?…]+/g) ?? []
  let out = ''
  for (const s of sentences) {
    if ((out + s).length > 220) break
    out += s
  }
  return (out || `${plain.slice(0, 217)}…`).trim()
}

const inputClass = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm'
const labelClass = 'text-sm font-medium text-slate-700'

/** Admin: write or edit one blog post (/admin/blog/new, /admin/blog/:postId). */
export default function AdminBlogEditorPage() {
  const { postId } = useParams()
  const isNew = !postId || postId === 'new'
  const navigate = useNavigate()

  const [loading, setLoading] = useState(!isNew)
  const [texts, setTexts] = useState<Record<TextLang, Texts>>({ hu: EMPTY_TEXTS, en: EMPTY_TEXTS, de: EMPTY_TEXTS })
  const [tab, setTab] = useState<TextLang>('hu')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(!isNew)
  const [imageUrl, setImageUrl] = useState('')
  const [externalUrl, setExternalUrl] = useState('')
  const [published, setPublished] = useState(false)
  const [publishedAt, setPublishedAt] = useState(toLocalInput(new Date().toISOString()))
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isNew) return
    adminFetchPost(postId as string)
      .then((post) => {
        if (!post) {
          setMessage({ kind: 'error', text: 'Post not found.' })
          return
        }
        setTexts({
          hu: { title: post.title, excerpt: post.excerpt, content: post.content },
          en: { title: post.title_en ?? '', excerpt: post.excerpt_en ?? '', content: post.content_en ?? '' },
          de: { title: post.title_de ?? '', excerpt: post.excerpt_de ?? '', content: post.content_de ?? '' },
        })
        setSlug(post.slug)
        setImageUrl(post.image_url ?? '')
        setExternalUrl(post.external_url ?? '')
        setPublished(post.published)
        setPublishedAt(toLocalInput(post.published_at))
      })
      .catch((e: Error) => setMessage({ kind: 'error', text: e.message }))
      .finally(() => setLoading(false))
  }, [isNew, postId])

  function setText(lang: TextLang, field: keyof Texts, value: string) {
    setTexts((prev) => ({ ...prev, [lang]: { ...prev[lang], [field]: value } }))
    if (lang === 'hu' && field === 'title' && !slugTouched) setSlug(slugify(value))
  }

  async function upload(file: File) {
    setUploading(true)
    setMessage(null)
    try {
      setImageUrl(await adminUploadImage(file))
    } catch (e) {
      setMessage({ kind: 'error', text: (e as Error).message })
    } finally {
      setUploading(false)
    }
  }

  // A picture copied to the clipboard (a screenshot, "Copy image" in a browser) can be pasted here.
  function onImagePaste(e: ClipboardEvent<HTMLDivElement>) {
    const file = Array.from(e.clipboardData.files).find((f) => f.type.startsWith('image/'))
    if (!file) return
    e.preventDefault()
    void upload(file)
  }

  async function save() {
    const hu = texts.hu
    const external = externalUrl.trim()
    if (!hu.title.trim()) return setMessage({ kind: 'error', text: 'The Hungarian title is required.' })
    if (!external && !hu.content.trim()) return setMessage({ kind: 'error', text: 'The Hungarian text is required.' })
    if (external && !/^https:\/\//.test(external)) {
      return setMessage({ kind: 'error', text: 'The "opens elsewhere" address must start with https://' })
    }
    const finalSlug = slug.trim() || slugify(hu.title)
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(finalSlug)) {
      return setMessage({ kind: 'error', text: 'The URL slug can only have lowercase letters, numbers and hyphens.' })
    }

    const excerpt = (lang: TextLang) => texts[lang].excerpt.trim() || excerptFromContent(texts[lang].content)
    const orNull = (s: string) => s.trim() || null
    const input: BlogPostInput = {
      slug: finalSlug,
      title: hu.title.trim(),
      excerpt: excerpt('hu') || hu.title.trim(),
      content: hu.content.trim(),
      title_en: orNull(texts.en.title),
      excerpt_en: texts.en.title.trim() ? orNull(excerpt('en')) : null,
      content_en: orNull(texts.en.content),
      title_de: orNull(texts.de.title),
      excerpt_de: texts.de.title.trim() ? orNull(excerpt('de')) : null,
      content_de: orNull(texts.de.content),
      image_url: orNull(imageUrl),
      external_url: external || null,
      published,
      published_at: new Date(publishedAt).toISOString(),
    }

    setSaving(true)
    setMessage(null)
    try {
      const id = await adminSavePost(isNew ? null : (postId ?? null), input)
      setSlug(finalSlug)
      setTexts((prev) => ({
        hu: { ...prev.hu, excerpt: input.excerpt },
        en: { ...prev.en, excerpt: input.excerpt_en ?? '' },
        de: { ...prev.de, excerpt: input.excerpt_de ?? '' },
      }))
      setMessage({ kind: 'ok', text: published ? 'Saved and published.' : 'Saved as a draft.' })
      if (isNew) navigate(`/admin/blog/${id}`, { replace: true })
    } catch (e) {
      setMessage({ kind: 'error', text: (e as Error).message })
    } finally {
      setSaving(false)
    }
  }

  async function remove() {
    if (isNew || !window.confirm('Delete this post? This cannot be undone.')) return
    try {
      await adminDeletePost(postId as string)
      navigate('/admin/blog', { replace: true })
    } catch (e) {
      setMessage({ kind: 'error', text: (e as Error).message })
    }
  }

  if (loading) return <p className="text-sm text-slate-400">Loading...</p>

  const current = texts[tab]

  return (
    <div className="max-w-4xl space-y-6 pb-12">
      <div>
        <Link to="/admin/blog" className="text-sm text-indigo-600 hover:underline">
          ← Blog posts
        </Link>
        <h1 className="mt-1 text-xl font-semibold text-slate-800">{isNew ? 'New post' : 'Edit post'}</h1>
      </div>

      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Language">
          {(Object.keys(LANG_LABELS) as TextLang[]).map((l) => (
            <button
              key={l}
              type="button"
              role="tab"
              aria-selected={tab === l}
              onClick={() => setTab(l)}
              className={`rounded-full border px-3 py-1 text-sm ${tab === l ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
            >
              {LANG_LABELS[l]}
              {l !== 'hu' && texts[l].title.trim() && ' ✓'}
            </button>
          ))}
        </div>
        {tab !== 'hu' && (
          <p className="text-xs text-slate-500">
            Optional. Readers using the site in this language see it; anything left empty shows the Hungarian text.
          </p>
        )}

        <div className="space-y-1.5">
          <label htmlFor="post-title" className={labelClass}>
            Title
          </label>
          <input id="post-title" className={inputClass} value={current.title} onChange={(e) => setText(tab, 'title', e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="post-excerpt" className={labelClass}>
            Summary <span className="font-normal text-slate-400">(on the card; left empty, the first sentences are used)</span>
          </label>
          <textarea
            id="post-excerpt"
            rows={3}
            maxLength={500}
            className={inputClass}
            value={current.excerpt}
            onChange={(e) => setText(tab, 'excerpt', e.target.value)}
          />
        </div>

        <BlogContentField
          key={tab}
          id="post-content"
          label={externalUrl.trim() ? 'Text (not needed: the card opens the other address)' : 'Text'}
          value={current.content}
          onChange={(v) => setText(tab, 'content', v)}
        />
      </section>

      <section className="grid gap-5 rounded-xl border border-slate-200 bg-white p-5 md:grid-cols-2">
        <div className="space-y-1.5">
          <span className={labelClass}>Picture</span>
          <div
            tabIndex={0}
            onPaste={onImagePaste}
            className="flex aspect-[16/9] items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" aria-label="Uploading" />
            ) : imageUrl ? (
              <img src={imageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="px-4 text-center text-xs text-slate-400">Click here and paste a picture (Ctrl+V), or upload one.</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              <ImagePlus className="h-4 w-4" aria-hidden="true" />
              Upload
            </button>
            {imageUrl && (
              <button type="button" onClick={() => setImageUrl('')} className="text-sm text-slate-500 hover:text-red-600">
                Remove
              </button>
            )}
            <input
              ref={fileInput}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) void upload(file)
                e.target.value = ''
              }}
            />
          </div>
          <input
            aria-label="Picture address"
            className={`${inputClass} text-xs`}
            placeholder="…or a picture address (https://…)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="post-slug" className={labelClass}>
              URL slug
            </label>
            <input
              id="post-slug"
              className={`${inputClass} font-mono`}
              value={slug}
              onChange={(e) => {
                setSlugTouched(true)
                setSlug(e.target.value)
              }}
            />
            <p className="text-xs text-slate-500">avln.hu/blog/{slug || '…'}</p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="post-date" className={labelClass}>
              Date
            </label>
            <input
              id="post-date"
              type="datetime-local"
              className={inputClass}
              value={publishedAt}
              onChange={(e) => setPublishedAt(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="post-external" className={labelClass}>
              Opens elsewhere <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <input
              id="post-external"
              className={inputClass}
              placeholder="https://tobbmintangol.hu/blog/…"
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
            />
            <p className="text-xs text-slate-500">Empty: the post is read on avln.hu. Filled: the card opens this address.</p>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
            Published (visible on /blog)
          </label>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={save}
          disabled={saving || uploading}
          className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        {!isNew && published && !externalUrl.trim() && (
          <Link to={`/blog/${slug}`} className="text-sm text-indigo-600 hover:underline">
            View post
          </Link>
        )}
        {message && <p className={`text-sm ${message.kind === 'ok' ? 'text-emerald-700' : 'text-red-600'}`}>{message.text}</p>}
        {!isNew && (
          <button type="button" onClick={remove} className="ml-auto inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-600">
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Delete
          </button>
        )}
      </div>
    </div>
  )
}
