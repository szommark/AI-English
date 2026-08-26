import type { ReactNode } from 'react'
import { boardThemes, type BoardTheme } from './boardTheme'

export default function ChalkBoard({
  theme,
  status,
  title,
  titleHu,
  children,
}: {
  theme: BoardTheme
  status: 'idle' | 'loading' | 'content'
  title?: string
  titleHu?: string
  children?: ReactNode
}) {
  const t = boardThemes[theme]

  return (
    <div className="rounded-3xl p-3 sm:p-4 bg-gradient-to-b from-[#8a5a34] via-[#6b4322] to-[#4d2f18] shadow-lg">
      <div
        className={`relative rounded-2xl ${t.board} shadow-[inset_0_2px_12px_rgba(0,0,0,0.5)] overflow-hidden min-h-[380px] flex items-center justify-center p-8 sm:p-10`}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-screen"
          style={{
            backgroundImage:
              'radial-gradient(rgba(255,255,255,0.7) 0.5px, transparent 0.6px), radial-gradient(rgba(255,255,255,0.5) 0.5px, transparent 0.6px)',
            backgroundSize: '3px 3px, 7px 7px',
            backgroundPosition: '0 0, 3px 4px',
          }}
        />

        <div className="relative w-full flex items-center justify-center">
          {status === 'idle' && (
            <div className="text-center space-y-2">
              {title && (
                <p className={`font-hand text-xl ${t.chalkDim}`}>
                  {title}
                  {titleHu && <span className="opacity-70"> — {titleHu}</span>}
                </p>
              )}
              <p className={`font-hand text-4xl ${t.chalk}`}>Press play to begin</p>
            </div>
          )}

          {status === 'loading' && (
            <div className="text-center">
              <p className={`font-hand text-2xl ${t.chalkDim} animate-pulse`}>Writing the lesson on the board…</p>
            </div>
          )}

          {status === 'content' && children}
        </div>
      </div>
    </div>
  )
}
