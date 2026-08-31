import { Link } from 'react-router-dom'
import TutorBotSession from '../components/TutorBotSession'
import ModelPicker from '../components/ModelPicker'

export default function TutorBotPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-sm text-indigo-600 hover:underline">
            ← Back to home
          </Link>
          <div className="flex items-center gap-4">
            <ModelPicker feature="tutorBot" />
            <Link to="/settings/voice" className="text-sm text-indigo-600 hover:underline">
              Voice settings
            </Link>
          </div>
        </div>
        <TutorBotSession />
      </main>
    </div>
  )
}
