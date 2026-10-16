import type { ReactNode } from 'react'
import { boardFontClass, boardThemes, type BoardFont, type BoardTheme } from './boardTheme'
import { useLanguage } from '../../lib/i18n'

export default function ChalkBoard({
  theme,
  font,
  status,
  title,
  titleGloss,
  step,
  children,
}: {
  theme: BoardTheme
  font: BoardFont
  status: 'idle' | 'loading' | 'content'
  title?: string
  /** Translation of the title in the UI language, when there is one. */
  titleGloss?: string
  /** Where the lesson is, e.g. "3 / 8" — shown in the board's corner while it plays. */
  step?: string
  children?: ReactNode
}) {
  const { t: tr } = useLanguage()
  const t = boardThemes[theme]

  return (
    <div className="rounded-3xl p-2.5 sm:p-4 bg-gradient-to-b from-[#8a5a34] via-[#6b4322] to-[#4d2f18] shadow-lg">
      <div
        className={`relative rounded-2xl ${t.board} ${boardFontClass[font]} shadow-[inset_0_2px_12px_rgba(0,0,0,0.5)] overflow-hidden min-h-[320px] sm:min-h-[420px] flex flex-col`}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-screen"
          style={{
            backgroundImage:
              'radial-gradient(rgba(255,255,255,0.7) 0.5px, transparent 0.6px), radial-gradient(rgba(255,255,255,0.5) 0.5px, transparent 0.6px)',
            backgroundSize: '3px 3px, 7px 7px',
            backgroundPosition: '0 0, 3px 4px',
          }}
        />

        {status === 'content' && (title || step) && (
          <div className={`relative flex items-baseline justify-between gap-3 px-4 sm:px-6 pt-3 text-sm sm:text-base ${t.chalkDim}`}>
            <span className="truncate">{title}</span>
            {step && <span className="shrink-0 tabular-nums">{step}</span>}
          </div>
        )}

        <div className="relative flex-1 w-full flex items-center justify-center px-4 py-6 sm:px-10 sm:py-8">
          {status === 'idle' && (
            <div className="text-center space-y-3">
              {title && (
                <p className={`text-xl sm:text-2xl ${t.chalkDim}`}>
                  {title}
                  {titleGloss && <span className="opacity-80"> — {titleGloss}</span>}
                </p>
              )}
              <p className={`text-3xl sm:text-4xl ${t.chalk}`}>{tr('pressPlay')}</p>
            </div>
          )}

          {status === 'loading' && (
            <div className="text-center">
              <p className={`text-xl sm:text-2xl ${t.chalkDim} animate-pulse`}>{tr('writingLesson')}</p>
            </div>
          )}

          {status === 'content' && children}
        </div>
      </div>
    </div>
  )
}
