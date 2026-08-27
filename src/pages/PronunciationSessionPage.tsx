import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { pronunciationCurriculum, getSoundItem } from '../data/pronunciationCurriculum'
import { getAccentPreference } from '../lib/voiceSelection'
import { fetchPronunciationProgress, type PronunciationProgressEntry } from '../lib/pronunciationProgressApi'
import SoundRail from '../components/PronunciationSession/SoundRail'
import DrillFunnel from '../components/PronunciationSession/DrillFunnel'
import SessionSummary, { type SessionResultEntry } from '../components/PronunciationSession/SessionSummary'

const SESSION_LENGTH = 5

function minScore(p: PronunciationProgressEntry): number {
  return Math.min(p.perceptionScore ?? 0, p.productionScore ?? 0)
}

export default function PronunciationSessionPage() {
  const [accent] = useState(() => getAccentPreference())
  const [progress, setProgress] = useState<PronunciationProgressEntry[]>([])
  const [queue, setQueue] = useState<string[] | null>(null)
  const [queueIndex, setQueueIndex] = useState(0)
  const [isSessionRun, setIsSessionRun] = useState(false)
  const [summaryResults, setSummaryResults] = useState<SessionResultEntry[] | null>(null)

  const progressByItemId = useMemo(
    () => Object.fromEntries(progress.map((p) => [p.soundItemId, p])),
    [progress],
  )

  useEffect(() => {
    fetchPronunciationProgress().then(setProgress)
  }, [])

  function buildSessionQueue(): string[] {
    const unattempted = pronunciationCurriculum.filter((item) => !progressByItemId[item.id]?.attempts)
    const attempted = pronunciationCurriculum
      .filter((item) => progressByItemId[item.id]?.attempts)
      .sort((a, b) => minScore(progressByItemId[a.id]) - minScore(progressByItemId[b.id]))
    return [...unattempted, ...attempted].slice(0, SESSION_LENGTH).map((item) => item.id)
  }

  function startSession() {
    setSummaryResults(null)
    setIsSessionRun(true)
    setQueue(buildSessionQueue())
    setQueueIndex(0)
  }

  function browseItem(itemId: string) {
    setSummaryResults(null)
    setIsSessionRun(false)
    setQueue([itemId])
    setQueueIndex(0)
  }

  async function handleItemComplete() {
    const freshProgress = await fetchPronunciationProgress()
    setProgress(freshProgress)

    if (!queue) return

    if (queueIndex < queue.length - 1) {
      setQueueIndex((i) => i + 1)
      return
    }

    if (isSessionRun) {
      const freshById = Object.fromEntries(freshProgress.map((p) => [p.soundItemId, p]))
      setSummaryResults(
        queue.map((itemId) => {
          const item = getSoundItem(itemId)!
          const p = freshById[itemId] as PronunciationProgressEntry | undefined
          return {
            itemId,
            title: item.title,
            titleHu: item.titleHu,
            perceptionScore: p?.perceptionScore ?? undefined,
            productionScore: p?.productionScore ?? 0,
          }
        }),
      )
    }
    setQueue(null)
  }

  const currentItemId = queue ? queue[queueIndex] : null

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="max-w-6xl mx-auto flex items-center justify-between px-4 py-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Pronunciation Session</h1>
          <p className="text-sm text-slate-500">Kiejtés gyakorlás — válassz egy hangot, vagy indítsd el a mai gyakorlást</p>
        </div>
        <Link to="/" className="text-sm text-indigo-600 hover:underline">
          ← Vissza a főoldalra
        </Link>
      </header>

      <div className="max-w-6xl mx-auto px-4 pb-4">
        <button
          onClick={startSession}
          disabled={queue !== null}
          className="rounded-lg bg-rose-600 text-white text-sm font-medium px-4 py-2.5 hover:bg-rose-700 disabled:opacity-40"
        >
          Mai gyakorlás indítása
        </button>
      </div>

      <main className="max-w-6xl mx-auto px-4 pb-12 grid gap-6 lg:grid-cols-[280px_1fr]">
        <SoundRail selectedItemId={currentItemId} progressByItemId={progressByItemId} onSelectItem={browseItem} />

        <div className="space-y-4 min-w-0">
          {summaryResults ? (
            <SessionSummary results={summaryResults} onDone={() => setSummaryResults(null)} />
          ) : currentItemId ? (
            <DrillFunnel
              key={currentItemId}
              soundItem={getSoundItem(currentItemId)!}
              accent={accent}
              hasPriorAttempt={Boolean(progressByItemId[currentItemId]?.attempts)}
              onItemComplete={handleItemComplete}
            />
          ) : (
            <p className="text-center text-sm text-slate-400">
              Válassz egy hangot a listából, vagy indítsd el a mai gyakorlást.
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
