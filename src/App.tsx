import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth, type UserRole } from './lib/AuthContext'
import LandingPage from './pages/LandingPage'
import ScenarioSelectPage from './pages/ScenarioSelectPage'
import ComingSoonPage from './pages/ComingSoonPage'
import RehearsalPage from './pages/RehearsalPage'
import PronunciationCenterPage from './pages/PronunciationCenterPage'
import TestModePage from './pages/TestModePage'
import TutorBotPage from './pages/TutorBotPage'
import GrammarCoachPage from './pages/GrammarCoachPage'
import PronunciationChartPage from './pages/PronunciationChartPage'
import VoiceSettingsPage from './pages/VoiceSettingsPage'
import ConnectTeacherPage from './pages/settings/ConnectTeacherPage'
import TeacherDashboardPage from './pages/TeacherDashboardPage'
import StudentProgressPage from './pages/StudentProgressPage'
import AdminOverviewPage from './pages/AdminOverviewPage'
import MouthCalibratorPage from './pages/dev/MouthCalibratorPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading...</div>
  if (!user) return <Navigate to="/" state={{ from: location.pathname }} replace />
  return <>{children}</>
}

function RoleProtectedRoute({ role, children }: { role: UserRole; children: React.ReactNode }) {
  const { user, loading, role: userRole } = useAuth()
  const location = useLocation()
  if (loading || (user && userRole === null)) {
    return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading...</div>
  }
  if (!user) return <Navigate to="/" state={{ from: location.pathname }} replace />
  if (userRole !== role) return <Navigate to="/" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
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
      <Route
        path="/tutor-bot"
        element={
          <ProtectedRoute>
            <TutorBotPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/grammar-coach"
        element={
          <ProtectedRoute>
            <GrammarCoachPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pronunciation"
        element={
          <ProtectedRoute>
            <PronunciationChartPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/voice"
        element={
          <ProtectedRoute>
            <VoiceSettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/teacher"
        element={
          <ProtectedRoute>
            <ConnectTeacherPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher"
        element={
          <RoleProtectedRoute role="teacher">
            <TeacherDashboardPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/teacher/students/:studentId"
        element={
          <RoleProtectedRoute role="teacher">
            <StudentProgressPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <RoleProtectedRoute role="admin">
            <AdminOverviewPage />
          </RoleProtectedRoute>
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
