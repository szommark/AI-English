import type { FeedbackResult } from '../lib/types'

export default function FeedbackCard({ feedback }: { feedback: FeedbackResult }) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
        <h3 className="font-semibold text-emerald-800 mb-2">What you did well</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-emerald-900">
          {feedback.strengths.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
        <h3 className="font-semibold text-amber-800 mb-3">Things to fix</h3>
        <div className="space-y-4">
          {feedback.corrections.map((c, i) => (
            <div key={i} className="text-sm">
              <p className="text-slate-500 line-through">{c.original}</p>
              <p className="text-emerald-700 font-medium">{c.corrected}</p>
              <p className="text-slate-600 mt-0.5">{c.note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
