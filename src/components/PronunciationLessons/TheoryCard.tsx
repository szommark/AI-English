import { Volume2 } from 'lucide-react'
import type { TheoryBlock } from '../../data/pronunciationLessons'

/** The short theory shown before a unit's exercises. Example chips speak on click; `soundsLike` is text only. */
export default function TheoryCard({ blocks, speak }: { blocks: TheoryBlock[]; speak: (text: string) => void }) {
  return (
    <div className="space-y-5">
      {blocks.map((block, i) => (
        <section key={i} className="space-y-2">
          {block.headingHu && <h3 className="text-sm font-semibold text-slate-800">{block.headingHu}</h3>}
          <p className="text-sm leading-relaxed text-slate-600">{block.bodyHu}</p>
          {block.examples && block.examples.length > 0 && (
            <ul className="flex flex-wrap gap-2 pt-1">
              {block.examples.map((ex) => (
                <li key={ex.text}>
                  <button
                    onClick={() => speak(ex.audio ?? ex.text)}
                    className="group flex items-center gap-2 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-left hover:bg-rose-50"
                  >
                    <span>
                      <span className="block text-sm font-medium text-slate-800">{ex.text}</span>
                      {ex.soundsLike && <span className="block text-xs text-rose-600">{ex.soundsLike}</span>}
                    </span>
                    <Volume2 className="h-3.5 w-3.5 shrink-0 text-rose-400 group-hover:text-rose-600" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  )
}
