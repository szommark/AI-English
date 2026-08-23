import type { MouthAnchor } from '../../lib/types'

/**
 * Rough placeholder anchor for the placeholder avatar below. Recalibrate at
 * /dev/mouth-calibrator once a real tutor photo replaces this SVG.
 */
export const TUTOR_MOUTH_ANCHOR: MouthAnchor = {
  mouthX: 50,
  mouthY: 58,
  mouthBoxWidth: 22,
  mouthBoxHeight: 14,
}

export default function TutorAvatar() {
  return (
    <div className="relative flex aspect-[3/4] w-full items-center justify-center rounded-2xl bg-gradient-to-b from-violet-100 to-violet-200 shadow-sm">
      <svg viewBox="0 0 100 100" className="h-2/3 w-2/3 text-violet-500" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="8" r="4" fill="currentColor" />
        <rect x="46" y="10" width="8" height="10" rx="4" fill="currentColor" />
        <circle cx="50" cy="42" r="24" fill="currentColor" opacity="0.15" />
        <circle cx="50" cy="42" r="24" stroke="currentColor" strokeWidth="3" />
        <circle cx="40" cy="40" r="3.2" fill="currentColor" />
        <circle cx="60" cy="40" r="3.2" fill="currentColor" />
        <path d="M39 54c4 5 18 5 22 0" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  )
}
