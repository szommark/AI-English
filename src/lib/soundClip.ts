// Plays a Sound Bank sound on its own (Azure TTS clip from /api/pronunciation?action=sound).
// Lone fricatives come out of TTS very quiet (θ peaks around −41 dB), so the clip goes through
// Web Audio and is boosted to a normal peak level. Decoded clips are kept for the session.

/** Bump after changing the clip SSML in api/pronunciation.ts, so the CDN serves the new audio. */
const CLIP_VERSION = 1
const TARGET_PEAK = 0.9
const MAX_GAIN = 40

let context: AudioContext | null = null
const buffers = new Map<string, Promise<AudioBuffer>>()
let current: AudioBufferSourceNode | null = null

function audioContext(): AudioContext {
  context ??= new AudioContext()
  return context
}

function loadClip(phonemeId: string): Promise<AudioBuffer> {
  let pending = buffers.get(phonemeId)
  if (!pending) {
    pending = fetch(`/api/pronunciation?action=sound&id=${encodeURIComponent(phonemeId)}&v=${CLIP_VERSION}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Sound clip failed (${res.status})`)
        return res.arrayBuffer()
      })
      .then((data) => audioContext().decodeAudioData(data))
    // A failed load shouldn't stick: drop it so the next click retries.
    pending.catch(() => buffers.delete(phonemeId))
    buffers.set(phonemeId, pending)
  }
  return pending
}

function peakOf(buffer: AudioBuffer): number {
  let peak = 0
  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const data = buffer.getChannelData(c)
    for (let i = 0; i < data.length; i++) peak = Math.max(peak, Math.abs(data[i]))
  }
  return peak
}

export function stopSoundClip() {
  try {
    current?.stop()
  } catch {
    // Already stopped.
  }
  current = null
}

/**
 * Resolves when the clip has finished playing (or was stopped); rejects if it can't load.
 * `onStart` fires once the clip is loaded and starts playing.
 */
export async function playSoundClip(phonemeId: string, onStart?: () => void): Promise<void> {
  window.speechSynthesis?.cancel()
  stopSoundClip()
  const ctx = audioContext()
  if (ctx.state === 'suspended') await ctx.resume()
  const buffer = await loadClip(phonemeId)
  const peak = peakOf(buffer)
  const gain = ctx.createGain()
  gain.gain.value = peak > 0 ? Math.min(MAX_GAIN, TARGET_PEAK / peak) : 1
  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.connect(gain).connect(ctx.destination)
  current = source
  await new Promise<void>((resolve) => {
    source.onended = () => {
      if (current === source) current = null
      resolve()
    }
    source.start()
    onStart?.()
  })
}
