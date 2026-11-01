import { createHash, randomBytes } from 'node:crypto'
import { supabaseAdmin } from './supabaseAdmin.js'
import { IMAGE_BUCKET, IMAGE_PROMPT_MAX, type ModuleImage } from '../../src/lib/courses.js'

// Mini course pictures (one per module), kept in the public course-images bucket under the
// module's id. AI pictures come from Pollinations (free, no key; the free tier adds a small logo);
// a teacher may upload their own instead.

const POLLINATIONS = 'https://image.pollinations.ai/prompt/'
/** Added to every description: one look across a course, and never any lettering. */
const STYLE = 'friendly modern flat illustration, soft colours, clean, no text, no letters, no signs'
const AI_TIMEOUT_MS = 45_000
export const IMAGE_MAX_BYTES = 3 * 1024 * 1024
const TYPES: Record<string, 'jpg' | 'png' | 'webp'> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }

export class ImageError extends Error {}

async function store(moduleId: string, bytes: Buffer, contentType: string): Promise<string> {
  const ext = TYPES[contentType]
  if (!ext) throw new ImageError('unsupported image type')
  if (bytes.length === 0 || bytes.length > IMAGE_MAX_BYTES) throw new ImageError('image too large')
  const name = createHash('sha1').update(bytes).update(randomBytes(4)).digest('hex').slice(0, 12)
  const path = `${moduleId}/${name}.${ext}`
  const { error } = await supabaseAdmin.storage.from(IMAGE_BUCKET).upload(path, bytes, { contentType, upsert: true })
  if (error) throw error
  return path
}

/** Makes an AI picture from the description and stores it. */
export async function makeAiImage(moduleId: string, prompt: string, alt: string): Promise<ModuleImage> {
  const description = prompt.trim().slice(0, IMAGE_PROMPT_MAX)
  if (!description) throw new ImageError('a description is required')
  const seed = randomBytes(3).readUIntBE(0, 3)
  const url = `${POLLINATIONS}${encodeURIComponent(`${description}. ${STYLE}`)}?width=768&height=512&nologo=true&seed=${seed}`
  const res = await fetch(url, { signal: AbortSignal.timeout(AI_TIMEOUT_MS) })
  const type = (res.headers.get('content-type') ?? '').split(';')[0].trim()
  if (!res.ok || !TYPES[type]) throw new ImageError(`image service answered ${res.status} ${type}`)
  const path = await store(moduleId, Buffer.from(await res.arrayBuffer()), type)
  return { path, alt: alt.trim().slice(0, 200), prompt: description }
}

/** Stores a teacher's own picture (base64, already resized in the browser). */
export async function storeOwnImage(moduleId: string, base64: string, contentType: string, alt: string): Promise<ModuleImage> {
  const bytes = Buffer.from(base64.replace(/^data:[^,]*,/, ''), 'base64')
  const path = await store(moduleId, bytes, contentType)
  return { path, alt: alt.trim().slice(0, 200), prompt: '' }
}
