import type { VoiceGender } from './types'

export const MALE_VOICE_NAMES = [
  'Google UK English Male',
  'Microsoft David',
  'Daniel',
  'Alex',
  'Fred',
]

export const FEMALE_VOICE_NAMES = [
  'Google UK English Female',
  'Google US English',
  'Microsoft Zira',
  'Samantha',
  'Victoria',
]

const VOICE_OVERRIDE_KEY = 'aiEnglish:voiceOverrideName'
const ACCENT_PREFERENCE_KEY = 'aiEnglish:accentPreference'

export type AccentPreference = 'us' | 'gb'

/** Default is British English, matching the Pronunciation Session brief's own sourcing (Nádasdy, BBC Learning English). */
export function getAccentPreference(): AccentPreference {
  if (typeof window === 'undefined') return 'gb'
  const stored = window.localStorage.getItem(ACCENT_PREFERENCE_KEY)
  return stored === 'us' ? 'us' : 'gb'
}

export function setAccentPreference(accent: AccentPreference): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(ACCENT_PREFERENCE_KEY, accent)
}

export function accentToLangTag(accent: AccentPreference): 'en-US' | 'en-GB' {
  return accent === 'us' ? 'en-US' : 'en-GB'
}

let cachedVoicesPromise: Promise<SpeechSynthesisVoice[]> | null = null

// Chrome (and some other browsers) load the voice list asynchronously — an immediate
// call to getVoices() right after page load can return []. This waits for
// `onvoiceschanged`, with a timeout fallback for browsers that never fire it.
// Cached at module scope so the async wait only ever happens once per session, no
// matter how many components call this.
export function getVoicesReliably(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return Promise.resolve([])
  }
  if (cachedVoicesPromise) return cachedVoicesPromise

  cachedVoicesPromise = new Promise((resolve) => {
    const synth = window.speechSynthesis
    const existing = synth.getVoices()
    if (existing.length > 0) {
      resolve(existing)
      return
    }

    const handleVoicesChanged = () => {
      const voices = synth.getVoices()
      if (voices.length === 0) return
      synth.removeEventListener('voiceschanged', handleVoicesChanged)
      clearTimeout(timeoutId)
      resolve(voices)
    }
    synth.addEventListener('voiceschanged', handleVoicesChanged)

    // Fallback for browsers that never fire voiceschanged (or have no voices at all).
    const timeoutId = setTimeout(() => {
      synth.removeEventListener('voiceschanged', handleVoicesChanged)
      resolve(synth.getVoices())
    }, 1000)
  })

  return cachedVoicesPromise
}

/**
 * Picks a voice matching the given gender from a preference-ordered list of known
 * voice names. Voice names aren't standardized across OS/browser versions, so this is
 * a best-effort match, not a guarantee — falls back to the first English voice, or to
 * undefined (browser default) if there are no English voices at all. Never throws.
 */
export function pickVoiceForGender(
  voices: SpeechSynthesisVoice[],
  gender: VoiceGender,
  langPrefix = 'en',
): SpeechSynthesisVoice | undefined {
  const accentVoices = voices.filter((v) => v.lang.startsWith(langPrefix))
  const englishVoices = accentVoices.length > 0 ? accentVoices : voices.filter((v) => v.lang.startsWith('en'))
  if (englishVoices.length === 0) return undefined

  const preferredNames = gender === 'male' ? MALE_VOICE_NAMES : FEMALE_VOICE_NAMES
  for (const name of preferredNames) {
    const match = englishVoices.find((v) => v.name === name)
    if (match) return match
  }

  return englishVoices[0]
}

export function getVoiceOverrideName(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(VOICE_OVERRIDE_KEY)
}

export function setVoiceOverrideName(voiceName: string | null): void {
  if (typeof window === 'undefined') return
  if (voiceName) {
    window.localStorage.setItem(VOICE_OVERRIDE_KEY, voiceName)
  } else {
    window.localStorage.removeItem(VOICE_OVERRIDE_KEY)
  }
}

/** Applies the learner's manual override (if set and still available), else falls back to gender matching. */
export function resolveVoice(
  voices: SpeechSynthesisVoice[],
  gender: VoiceGender,
  langPrefix = 'en',
): SpeechSynthesisVoice | undefined {
  const overrideName = getVoiceOverrideName()
  if (overrideName) {
    const override = voices.find((v) => v.name === overrideName)
    if (override) return override
  }
  return pickVoiceForGender(voices, gender, langPrefix)
}
