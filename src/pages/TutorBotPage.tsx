import { Link } from 'react-router-dom'
import TutorBotSession from '../components/TutorBotSession'

export default function TutorBotPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-sm text-indigo-600 hover:underline">
            ← Back to home
          </Link>
          <Link to="/settings/voice" className="text-sm text-indigo-600 hover:underline">
            Voice settings
          </Link>
        </div>
        <TutorBotSession />
      </main>
    </div>
  )
}
