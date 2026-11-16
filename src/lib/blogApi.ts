import { supabase } from './supabase'
import type { Lang } from './i18n'

/**
 * The Avalon blog (supabase/migrations/20261117120000_blog_posts.sql). Reads and admin writes go
 * straight to Supabase: RLS lets anyone read published posts and only admins write.
 */
export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  title_en: string | null
  excerpt_en: string | null
  content_en: string | null
  title_de: string | null
  excerpt_de: string | null
  content_de: string | null
  image_url: string | null
  /** Set: the card opens this address (an older post on tobbmintangol.hu). Empty: read on avln.hu. */
  external_url: string | null
  published: boolean
  published_at: string
  created_at: string
  updated_at: string
}

export type BlogPostInput = Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>

const COLUMNS =
  'id, slug, title, excerpt, content, title_en, excerpt_en, content_en, title_de, excerpt_de, content_de, image_url, external_url, published, published_at, created_at, updated_at'

type LocalizableField = 'title' | 'excerpt' | 'content'

/** The post's text in the UI language, falling back to the Hungarian base text. */
export function pickLocalized(post: BlogPost, field: LocalizableField, lang: Lang): string {
  if (lang === 'hu') return post[field]
  return post[`${field}_${lang}`] || post[field]
}

/** Where a card goes: the external address, or the post's page on avln.hu. */
export function postHref(post: Pick<BlogPost, 'slug' | 'external_url'>): string {
  return post.external_url || `/blog/${post.slug}`
}

export async function fetchPublishedPosts(limit?: number): Promise<BlogPost[]> {
  let query = supabase.from('blog_posts').select(COLUMNS).eq('published', true).order('published_at', { ascending: false })
  if (limit) query = query.limit(limit)
  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data ?? []) as BlogPost[]
}

export async function fetchPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase.from('blog_posts').select(COLUMNS).eq('slug', slug).maybeSingle()
  if (error) throw new Error(error.message)
  return data as BlogPost | null
}

// --- Admin -------------------------------------------------------------------------------

/** Every post, drafts included (RLS shows drafts to admins only). */
export async function adminListPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase.from('blog_posts').select(COLUMNS).order('published_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as BlogPost[]
}

export async function adminFetchPost(id: string): Promise<BlogPost | null> {
  const { data, error } = await supabase.from('blog_posts').select(COLUMNS).eq('id', id).maybeSingle()
  if (error) throw new Error(error.message)
  return data as BlogPost | null
}

function saveError(message: string): Error {
  if (/blog_posts_slug_key|duplicate key/i.test(message)) return new Error('This URL slug is already used by another post.')
  if (/blog_posts_has_body/i.test(message)) return new Error('A post read on avln.hu needs its text.')
  return new Error(message)
}

export async function adminSavePost(id: string | null, input: BlogPostInput): Promise<string> {
  if (id) {
    const { error } = await supabase.from('blog_posts').update(input).eq('id', id)
    if (error) throw saveError(error.message)
    return id
  }
  const { data, error } = await supabase.from('blog_posts').insert(input).select('id').single()
  if (error) throw saveError(error.message)
  return data.id as string
}

export async function adminDeletePost(id: string): Promise<void> {
  const { error } = await supabase.from('blog_posts').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

const IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}
export const MAX_BLOG_IMAGE_BYTES = 5 * 1024 * 1024

/** Uploads a post picture to the public blog-images bucket and returns its public URL. */
export async function adminUploadImage(file: File): Promise<string> {
  const ext = IMAGE_TYPES[file.type]
  if (!ext) throw new Error('Only JPG, PNG, WEBP or GIF pictures can be uploaded.')
  if (file.size > MAX_BLOG_IMAGE_BYTES) throw new Error('The picture can be at most 5 MB.')
  const path = `${crypto.randomUUID()}.${ext}`
  const bucket = supabase.storage.from('blog-images')
  const { error } = await bucket.upload(path, file, { contentType: file.type })
  if (error) throw new Error(error.message)
  return bucket.getPublicUrl(path).data.publicUrl
}

/** "Merre tovább?" → "merre-tovabb" */
export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200)
    .replace(/-+$/, '')
}
