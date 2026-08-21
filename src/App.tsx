import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/AuthContext'
import LoginPage from './pages/LoginPage'
import LandingPage from './pages/LandingPage'
import ScenarioSelectPage from './pages/ScenarioSelectPage'
import ComingSoonPage from './pages/ComingSoonPage'
import RehearsalPage from './pages/RehearsalPage'
import PronunciationCenterPage from './pages/PronunciationCenterPage'
import TestModePage from './pages/TestModePage'
import MouthCalibratorPage from './pages/dev/MouthCalibratorPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <LandingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/conversational-english"
        element={
          <ProtectedRoute>
            <ScenarioSelectPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/coming-soon/:featureId"
        element={
          <ProtectedRoute>
            <ComingSoonPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/scenario/:scenarioId/rehearsal"
        element={
          <ProtectedRoute>
            <RehearsalPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/scenario/:scenarioId/pronunciation"
        element={
          <ProtectedRoute>
            <PronunciationCenterPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/scenario/:scenarioId/test"
        element={
          <ProtectedRoute>
            <TestModePage />
          </ProtectedRoute>
        }
      />
      {import.meta.env.DEV && <Route path="/dev/mouth-calibrator" element={<MouthCalibratorPage />} />}
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
