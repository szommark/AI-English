import type { AwardResult } from './types'

// Tiny in-memory pub/sub: API clients publish every XP award result they receive, and the
// header level chip and the XP toast (src/components/gamification/) listen. Keeps the
// learning components themselves unaware of how XP is shown.

type Listener = (result: AwardResult) => void

const listeners = new Set<Listener>()

export function publishXpResult(result: AwardResult | null | undefined): void {
  if (!result) return
  for (const listener of listeners) {
    try {
      listener(result)
    } catch (err) {
      console.error('XP listener failed', err)
    }
  }
}

export function subscribeXpResults(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
