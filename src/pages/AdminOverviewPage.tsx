import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchAdminOverview, type AdminOverview } from '../lib/adminApi'

export default function AdminOverviewPage() {
  const [overview, setOverview] = useState<AdminOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAdminOverview()
      .then(setOverview)
      .catch(() => setError('Failed to load the admin overview. Please try again.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-800">Admin Overview</h1>
          <Link to="/" className="text-sm text-indigo-600 hover:underline">
            ← Back to home
          </Link>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {loading ? (
          <p className="text-sm text-slate-400">Loading...</p>
        ) : (
          overview && (
            <>
              <section className="space-y-3">
                <h2 className="font-medium text-slate-700">Connections</h2>
                {overview.connections.length === 0 ? (
                  <p className="text-sm text-slate-500">No connections yet.</p>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 text-left text-slate-500">
                          <th className="px-4 py-2">Teacher</th>
                          <th className="px-4 py-2">Student</th>
                          <th className="px-4 py-2">Status</th>
                          <th className="px-4 py-2">Since</th>
                        </tr>
                      </thead>
                      <tbody>
                        {overview.connections.map((c, i) => (
                          <tr key={i} className="border-b border-slate-100 last:border-0">
                            <td className="px-4 py-2 text-slate-700">{c.teacherEmail}</td>
                            <td className="px-4 py-2 text-slate-700">{c.studentEmail}</td>
                            <td className="px-4 py-2 text-slate-500">{c.status}</td>
                            <td className="px-4 py-2 text-slate-500">{new Date(c.createdAt).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <section className="space-y-3">
                <h2 className="font-medium text-slate-700">Failed attempts</h2>
                {overview.failedAttempts.length === 0 ? (
                  <p className="text-sm text-slate-500">No failed attempts yet.</p>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 text-left text-slate-500">
                          <th className="px-4 py-2">Attempted by</th>
                          <th className="px-4 py-2">Code</th>
                          <th className="px-4 py-2">Reason</th>
                          <th className="px-4 py-2">When</th>
                        </tr>
                      </thead>
                      <tbody>
                        {overview.failedAttempts.map((a, i) => (
                          <tr key={i} className="border-b border-slate-100 last:border-0">
                            <td className="px-4 py-2 text-slate-700">{a.attemptedByEmail}</td>
                            <td className="px-4 py-2 font-mono text-slate-500">{a.attemptedCode}</td>
                            <td className="px-4 py-2 text-slate-500">{a.reason.replace(/_/g, ' ')}</td>
                            <td className="px-4 py-2 text-slate-500">{new Date(a.createdAt).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )
        )}
      </main>
    </div>
  )
}
