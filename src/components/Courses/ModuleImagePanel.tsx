import { useRef, useState } from 'react'
import { ImagePlus, Loader2, RefreshCw, Trash2 } from 'lucide-react'
import { hintClass, inputClass, labelClass, secondaryButtonClass } from '../TeacherTools/ui'
import { useCourseCopy } from '../../data/courseCopy'
import { TeacherToolsError } from '../../lib/teacherToolsApi'
import { courseImageUrl, makeModuleImage, removeModuleImage, uploadModuleImage } from '../../lib/courseApi'
import type { Course, CourseModule } from '../../lib/courses'

/**
 * A module's picture in the editor: see it, make a new AI picture (from the AI's description or
 * the teacher's own), upload a picture of one's own, or remove it.
 */
export default function ModuleImagePanel({ module, onCourse, disabled }: { module: CourseModule; onCourse: (c: Course) => void; disabled: boolean }) {
  const { c } = useCourseCopy()
  const image = module.content?.image
  const [prompt, setPrompt] = useState(image?.prompt ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function act(action: () => Promise<Course>) {
    setBusy(true)
    setError(null)
    try {
      onCourse(await action())
    } catch (err) {
      setError(err instanceof TeacherToolsError && err.code === 'bad_image' ? c('imageBadFile') : c('imageError'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-2 rounded-lg border border-border bg-secondary/30 p-3">
      <p className={labelClass}>{c('imageTitle')}</p>
      {busy ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          {c('imageMaking')}
        </p>
      ) : image?.path ? (
        <img src={courseImageUrl(image.path)} alt={image.alt} className="aspect-[3/2] w-full max-w-sm rounded-lg border border-border object-cover" />
      ) : (
        <p className="text-sm text-muted-foreground">{c('imageNone')}</p>
      )}
      <label className="block space-y-1">
        <span className={hintClass}>{c('imagePromptLabel')}</span>
        <textarea className={`${inputClass} min-h-[3rem] text-sm`} value={prompt} maxLength={400} onChange={(e) => setPrompt(e.target.value)} />
      </label>
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          className={`${secondaryButtonClass} inline-flex items-center gap-1`}
          disabled={disabled || busy || !prompt.trim()}
          onClick={() => void act(() => makeModuleImage(module.id, prompt.trim()))}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          {c('imageNew')}
        </button>
        <button type="button" className={`${secondaryButtonClass} inline-flex items-center gap-1`} disabled={disabled || busy} onClick={() => fileRef.current?.click()}>
          <ImagePlus className="h-3.5 w-3.5" />
          {c('imageUpload')}
        </button>
        {image?.path && (
          <button type="button" className={`${secondaryButtonClass} inline-flex items-center gap-1 text-red-600`} disabled={disabled || busy} onClick={() => void act(() => removeModuleImage(module.id))}>
            <Trash2 className="h-3.5 w-3.5" />
            {c('imageRemove')}
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            e.target.value = ''
            if (file) void act(() => uploadModuleImage(module.id, file))
          }}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <p className={hintClass}>{c('imageLogoNote')}</p>
    </div>
  )
}
