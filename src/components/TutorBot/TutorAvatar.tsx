import type { MouthAnchor, VoiceGender } from '../../lib/types'
import tutorPhoto from '../../assets/tutor-avatar.jpg'

/**
 * Calibrated by eye against tutor-avatar.jpg (a square 1254x1254 source rendered with
 * object-cover into this component's aspect-[3/4] box, which crops ~12.5% off each side).
 * Re-check with a click-through tool like /dev/mouth-calibrator if the photo changes.
 */
export const TUTOR_MOUTH_ANCHOR: MouthAnchor = {
  mouthX: 49,
  mouthY: 47,
  mouthBoxWidth: 18,
  mouthBoxHeight: 14,
}

// Set by hand against tutor-avatar.jpg — never inferred from the image or filename.
export const TUTOR_VOICE_GENDER: VoiceGender = 'male' // TODO: confirm against photo

export default function TutorAvatar() {
  return (
    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-gradient-to-b from-violet-100 to-violet-200 shadow-sm">
      <img src={tutorPhoto} alt="Tutor Bot" className="h-full w-full object-cover" />
    </div>
  )
}
