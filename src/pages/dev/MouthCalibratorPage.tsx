import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react'
import { scenarios } from '../../data/scenarios'
import { scenarioPhotos } from '../../assets/scenarioPhotos'
import type { MouthAnchor } from '../../lib/types'

type Corner = 'tl' | 'tr' | 'bl' | 'br'

function clampPct(v: number): number {
  return Math.min(100, Math.max(0, Math.round(v * 10) / 10))
}

function formatSnippet(id: string, m: MouthAnchor): string {
  return `// ${id}\nmouth: { mouthX: ${m.mouthX.toFixed(1)}, mouthY: ${m.mouthY.toFixed(1)}, mouthBoxWidth: ${m.mouthBoxWidth.toFixed(1)}, mouthBoxHeight: ${m.mouthBoxHeight.toFixed(1)} },`
}

/**
 * Dev-only tool (see the `import.meta.env.DEV` guard in App.tsx): click a scenario photo's
 * mouth to set the anchor, drag a corner handle to size the exclusion box, then copy the
 * printed snippet into src/data/scenarios.ts. Not linked from app nav, not in production builds.
 */
export default function MouthCalibratorPage() {
  const [scenarioIndex, setScenarioIndex] = useState(0)
  const scenario = scenarios[scenarioIndex]
  const photo = scenarioPhotos[scenario.id]

  const [calibrations, setCalibrations] = useState<Record<string, MouthAnchor>>(() =>
    Object.fromEntries(scenarios.map((s) => [s.id, { ...s.mouth }]))
  )
  const current = calibrations[scenario.id]

  const imgRef = useRef<HTMLImageElement>(null)
  const [dragging, setDragging] = useState<Corner | null>(null)

  function update(patch: Partial<MouthAnchor>) {
    setCalibrations((prev) => ({ ...prev, [scenario.id]: { ...prev[scenario.id], ...patch } }))
  }

  function handleImageClick(e: ReactMouseEvent<HTMLImageElement>) {
    if (dragging || !imgRef.current) return
    const rect = imgRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    update({ mouthX: clampPct(x), mouthY: clampPct(y) })
  }

  useEffect(() => {
    if (!dragging) return

    function handleMove(e: globalThis.MouseEvent) {
      if (!imgRef.current) return
      const rect = imgRef.current.getBoundingClientRect()
      const mouthPx = { x: (current.mouthX / 100) * rect.width, y: (current.mouthY / 100) * rect.height }
      const px = e.clientX - rect.left
      const py = e.clientY - rect.top
      const halfW = Math.abs(px - mouthPx.x)
      const halfH = Math.abs(py - mouthPx.y)
      update({
        mouthBoxWidth: clampPct(((halfW * 2) / rect.width) * 100),
        mouthBoxHeight: clampPct(((halfH * 2) / rect.height) * 100),
      })
    }
    function handleUp() {
      setDragging(null)
    }
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }
    // Only re-subscribe when the drag starts/stops or the anchor point moves —
    // not on every box-size change, which would otherwise tear down mid-drag.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging, current.mouthX, current.mouthY])

  const snippet = formatSnippet(scenario.id, current)
  const allSnippet = scenarios.map((s) => formatSnippet(s.id, calibrations[s.id])).join('\n\n')

  const boxStyle = {
    left: `${current.mouthX - current.mouthBoxWidth / 2}%`,
    top: `${current.mouthY - current.mouthBoxHeight / 2}%`,
    width: `${current.mouthBoxWidth}%`,
    height: `${current.mouthBoxHeight}%`,
  }

  const cornerPositions: Record<Corner, { left: string; top: string; cursor: string }> = {
    tl: {
      left: `${current.mouthX - current.mouthBoxWidth / 2}%`,
      top: `${current.mouthY - current.mouthBoxHeight / 2}%`,
      cursor: 'nwse-resize',
    },
    tr: {
      left: `${current.mouthX + current.mouthBoxWidth / 2}%`,
      top: `${current.mouthY - current.mouthBoxHeight / 2}%`,
      cursor: 'nesw-resize',
    },
    bl: {
      left: `${current.mouthX - current.mouthBoxWidth / 2}%`,
      top: `${current.mouthY + current.mouthBoxHeight / 2}%`,
      cursor: 'nesw-resize',
    },
    br: {
      left: `${current.mouthX + current.mouthBoxWidth / 2}%`,
      top: `${current.mouthY + current.mouthBoxHeight / 2}%`,
      cursor: 'nwse-resize',
    },
  }

  return (
    <div className="min-h-screen space-y-6 bg-slate-900 p-6 text-slate-100">
      <div>
        <h1 className="text-xl font-semibold">Mouth calibrator (dev only)</h1>
        <p className="mt-1 text-sm text-slate-400">
          Click the character's mouth to set the anchor point. Drag a corner handle to size the exclusion
          box (it stays centered on the point). Use the sliders for fine adjustment, then copy the snippet
          into src/data/scenarios.ts.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setScenarioIndex((i) => (i - 1 + scenarios.length) % scenarios.length)}
          className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm hover:bg-slate-800"
        >
          ← Prev
        </button>
        <span className="text-sm font-medium">
          {scenario.title} ({scenarioIndex + 1}/{scenarios.length})
        </span>
        <button
          onClick={() => setScenarioIndex((i) => (i + 1) % scenarios.length)}
          className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm hover:bg-slate-800"
        >
          Next →
        </button>
      </div>

      <div className="relative w-full max-w-md select-none">
        {photo && (
          <img
            ref={imgRef}
            src={photo}
            alt={scenario.title}
            draggable={false}
            onClick={handleImageClick}
            className="block h-auto w-full cursor-crosshair rounded-lg"
          />
        )}
        <div className="pointer-events-none absolute border-2 border-red-500 bg-red-500/20" style={boxStyle} />
        <div
          className="pointer-events-none absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500"
          style={{ left: `${current.mouthX}%`, top: `${current.mouthY}%` }}
        />
        {(Object.keys(cornerPositions) as Corner[]).map((corner) => (
          <div
            key={corner}
            onMouseDown={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setDragging(corner)
            }}
            className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-red-500"
            style={{
              left: cornerPositions[corner].left,
              top: cornerPositions[corner].top,
              cursor: cornerPositions[corner].cursor,
            }}
          />
        ))}
      </div>

      <div className="grid max-w-md grid-cols-2 gap-4 text-sm">
        <label className="space-y-1">
          <span className="block text-slate-400">Box width % ({current.mouthBoxWidth.toFixed(1)})</span>
          <input
            type="range"
            min={2}
            max={80}
            step={0.5}
            value={current.mouthBoxWidth}
            onChange={(e) => update({ mouthBoxWidth: Number(e.target.value) })}
            className="w-full"
          />
        </label>
        <label className="space-y-1">
          <span className="block text-slate-400">Box height % ({current.mouthBoxHeight.toFixed(1)})</span>
          <input
            type="range"
            min={2}
            max={80}
            step={0.5}
            value={current.mouthBoxHeight}
            onChange={(e) => update({ mouthBoxHeight: Number(e.target.value) })}
            className="w-full"
          />
        </label>
      </div>

      <div className="max-w-md space-y-2">
        <pre className="overflow-x-auto rounded bg-slate-950 p-3 text-xs text-lime-300">{snippet}</pre>
        <button
          onClick={() => navigator.clipboard.writeText(snippet)}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm hover:bg-indigo-700"
        >
          Copy for {scenario.id}
        </button>
      </div>

      <div className="max-w-md space-y-2">
        <h2 className="text-sm font-medium text-slate-300">All {scenarios.length} scenarios</h2>
        <pre className="overflow-x-auto rounded bg-slate-950 p-3 text-xs text-lime-300">{allSnippet}</pre>
        <button
          onClick={() => navigator.clipboard.writeText(allSnippet)}
          className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm hover:bg-slate-800"
        >
          Copy all {scenarios.length}
        </button>
      </div>
    </div>
  )
}
