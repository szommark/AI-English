let ctx: AudioContext | null = null

/** Creates the audio context; call from a click handler so the browser allows later beeps. */
export function primeBeep(): void {
  try {
    ctx ??= new AudioContext()
    if (ctx.state === 'suspended') void ctx.resume()
  } catch {
    // No Web Audio: the practice just runs without the beep.
  }
}

/** A short sine "your turn" tone. */
export function playBeep(): void {
  primeBeep()
  if (!ctx) return
  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.value = 880
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.25, now + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18)
  osc.connect(gain).connect(ctx.destination)
  osc.start(now)
  osc.stop(now + 0.2)
}
