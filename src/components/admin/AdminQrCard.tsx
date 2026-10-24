import { useEffect, useState, type FormEvent } from 'react'
import { Copy, Download, QrCode } from 'lucide-react'
import { createAdminQr, fetchAdminQr, type AdminQrCode, type AdminQrData } from '../../lib/adminApi'
import { qrLink } from '../../lib/qrTracking'

/**
 * Admin overview: QR codes that open avnl.hu, each with its own short slug so scans and the
 * accounts created after a scan can be counted per code (e.g. one per poster or flyer).
 */
export default function AdminQrCard() {
  const [data, setData] = useState<AdminQrData | null>(null)
  const [label, setLabel] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAdminQr()
      .then(setData)
      .catch(() => setError("Couldn't load the QR codes."))
  }, [])

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    if (!label.trim()) return
    setBusy(true)
    setError(null)
    try {
      setData(await createAdminQr(label.trim()))
      setLabel('')
    } catch {
      setError("Couldn't create the QR code. Please try again.")
    } finally {
      setBusy(false)
    }
  }

  const labelFor = (codeId: string) => data?.codes.find((c) => c.id === codeId)?.label ?? '—'

  return (
    <section className="space-y-3">
      <h2 className="font-medium text-slate-700">QR codes</h2>
      <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
        <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-2">
          <label className="min-w-[14rem] flex-1 text-sm text-slate-600">
            <span className="mb-1 block">New QR code for avnl.hu — where will it be shown?</span>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              maxLength={80}
              placeholder="e.g. Flyer, school hallway poster"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </label>
          <button
            type="submit"
            disabled={busy || !label.trim()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40"
          >
            <QrCode className="h-4 w-4" aria-hidden />
            Generate QR code
          </button>
        </form>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {!data ? (
          !error && <p className="text-sm text-slate-400">Loading...</p>
        ) : data.codes.length === 0 ? (
          <p className="text-sm text-slate-500">No QR codes yet. Give the first one a name above.</p>
        ) : (
          <ul className="space-y-3">
            {data.codes.map((code) => (
              <QrCodeRow key={code.id} code={code} />
            ))}
          </ul>
        )}

        {data && data.recentSignups.length > 0 && (
          <div className="space-y-2 border-t border-slate-100 pt-3">
            <h3 className="text-sm font-medium text-slate-700">Recent sign-ups from a scan</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
                    <th className="py-2 pr-4">Account</th>
                    <th className="py-2 pr-4">QR code</th>
                    <th className="py-2">When</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentSignups.map((s, i) => (
                    <tr key={i} className="border-b border-slate-100 last:border-0">
                      <td className="py-2 pr-4 text-slate-700">{s.email}</td>
                      <td className="py-2 pr-4 text-slate-500">{labelFor(s.codeId)}</td>
                      <td className="py-2 text-slate-500">{new Date(s.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function fileName(code: AdminQrCode, ext: string) {
  const base = code.label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'qr'
  return `avalon-qr-${base}-${code.slug}.${ext}`
}

function download(href: string, name: string) {
  const a = document.createElement('a')
  a.href = href
  a.download = name
  a.click()
}

function QrCodeRow({ code }: { code: AdminQrCode }) {
  const link = qrLink(code.slug)
  const [svg, setSvg] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let cancelled = false
    // Loaded on demand: only admins ever draw a QR code.
    import('qrcode')
      .then((QR) => QR.toString(link, { type: 'svg', margin: 2, errorCorrectionLevel: 'M' }))
      .then((s) => !cancelled && setSvg(s))
      .catch(() => !cancelled && setSvg(null))
    return () => {
      cancelled = true
    }
  }, [link])

  async function downloadPng() {
    const QR = await import('qrcode')
    download(await QR.toDataURL(link, { width: 1200, margin: 2, errorCorrectionLevel: 'M' }), fileName(code, 'png'))
  }

  function downloadSvg() {
    if (!svg) return
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))
    download(url, fileName(code, 'svg'))
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard blocked: the link is selectable on screen.
    }
  }

  const conversion = code.uniqueVisitors > 0 ? Math.round((code.signups / code.uniqueVisitors) * 100) : null
  const stats: [string, string | number][] = [
    ['Scans', code.scans],
    ['Unique visitors', code.uniqueVisitors],
    ['Scans (7 days)', code.scans7d],
    ['Sign-ups', code.signups],
    ['Confirmed', code.confirmedSignups],
    ['Conversion', conversion === null ? '—' : `${conversion}%`],
  ]

  return (
    <li className="flex flex-col gap-4 rounded-lg border border-slate-200 p-3 sm:flex-row">
      <div className="h-32 w-32 shrink-0 self-center rounded-md bg-white sm:self-start">
        {svg ? (
          <img src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`} alt={`QR code for ${link}`} className="h-full w-full" />
        ) : (
          <div className="h-full w-full animate-pulse rounded-md bg-slate-100" />
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-3">
        <div>
          <p className="font-medium text-slate-800">{code.label}</p>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="select-all break-all font-mono text-slate-500">{link}</span>
            <button type="button" onClick={copyLink} className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline">
              <Copy className="h-3.5 w-3.5" aria-hidden />
              {copied ? 'Copied' : 'Copy link'}
            </button>
          </div>
          <p className="text-xs text-slate-400">
            Created {new Date(code.createdAt).toLocaleDateString()}
            {code.lastScanAt && ` · last scan ${new Date(code.lastScanAt).toLocaleString()}`}
          </p>
        </div>
        <dl className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {stats.map(([name, value]) => (
            <div key={name} className="rounded-md bg-slate-50 px-2 py-1.5">
              <dt className="text-[11px] leading-tight text-slate-500">{name}</dt>
              <dd className="text-base font-semibold tabular-nums text-slate-800">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="flex flex-wrap gap-3 text-sm">
          <button type="button" onClick={() => void downloadPng()} className="inline-flex items-center gap-1 text-indigo-600 hover:underline">
            <Download className="h-4 w-4" aria-hidden />
            PNG (print)
          </button>
          <button type="button" onClick={downloadSvg} disabled={!svg} className="inline-flex items-center gap-1 text-indigo-600 hover:underline disabled:opacity-40">
            <Download className="h-4 w-4" aria-hidden />
            SVG
          </button>
        </div>
      </div>
    </li>
  )
}
