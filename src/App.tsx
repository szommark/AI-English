import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider, hasTeacherAccess, useAuth, type UserRole } from './lib/AuthContext'
import { LanguageProvider } from './lib/i18n'
import AppLayout from './components/AppLayout'
import LandingPage from './pages/LandingPage'
import CategoryGridPage from './pages/CategoryGridPage'
import SubcategoryGridPage from './pages/SubcategoryGridPage'
import ScenarioSelectPage from './pages/ScenarioSelectPage'
import ComingSoonPage from './pages/ComingSoonPage'
import RehearsalPage from './pages/RehearsalPage'
import TestModePage from './pages/TestModePage'
import TutorBotPage from './pages/TutorBotPage'
import GrammarCoachPage from './pages/GrammarCoachPage'
import PronunciationHubPage from './pages/PronunciationHubPage'
import LessonSessionPage from './pages/LessonSessionPage'
import { stressPatterns } from './data/pronunciationLessons/stressPatterns'
import { connectedSpeech } from './data/pronunciationLessons/connectedSpeech'
import PhonemeDetailPage from './pages/PhonemeDetailPage'
import VoiceSettingsPage from './pages/VoiceSettingsPage'
import MissionPage from './pages/MissionPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import ConnectTeacherPage from './pages/settings/ConnectTeacherPage'
import TeacherDashboardPage from './pages/TeacherDashboardPage'
import StudentProgressPage from './pages/StudentProgressPage'
import MyProgressPage from './pages/MyProgressPage'
import AdminOverviewPage from './pages/AdminOverviewPage'
import AdminPersonasPage from './pages/AdminPersonasPage'
import AdminUsagePage from './pages/AdminUsagePage'
import MouthCalibratorPage from './pages/dev/MouthCalibratorPage'

// Teacher-only and sizeable: loaded on demand so it doesn't grow the main bundle.
const TeacherVocabListPage = lazy(() => import('./pages/TeacherVocabListPage'))
const VocabularyPage = lazy(() => import('./pages/VocabularyPage'))
const ExamPrepPage = lazy(() => import('./pages/ExamPrepPage'))
const ExamPaperPage = lazy(() => import('./pages/ExamPaperPage'))
const ExamSpeakingPage = lazy(() => import('./pages/ExamSpeakingPage'))
const LyricsActivitiesPage = lazy(() => import('./pages/LyricsActivitiesPage'))
const LyricsEditorPage = lazy(() => import('./pages/LyricsEditorPage'))
const ExamTasksPage = lazy(() => import('./pages/ExamTasksPage'))
const ExamTaskEditorPage = lazy(() => import('./pages/ExamTaskEditorPage'))
const TeacherVocabListsPage = lazy(() => import('./pages/TeacherVocabListsPage'))

/** Word lists moved into the Teacher Toolkit: old /teacher/lists/... links still work. */
function LegacyListRedirect() {
  const { pathname } = useLocation()
  return <Navigate to={pathname.replace('/teacher/lists', '/teacher/tools/vocab')} replace />
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <div className="flex items-center justify-center py-24 text-slate-400">Loading...</div>
  if (!user) return <Navigate to="/" state={{ from: location.pathname }} replace />
  return <>{children}</>
}

function RoleProtectedRoute({ role, children }: { role: UserRole; children: React.ReactNode }) {
  const { user, loading, role: userRole } = useAuth()
  const location = useLocation()
  if (loading || (user && userRole === null)) {
    return <div className="flex items-center justify-center py-24 text-slate-400">Loading...</div>
  }
  if (!user) return <Navigate to="/" state={{ from: location.pathname }} replace />
  const allowed = role === 'teacher' ? hasTeacherAccess(userRole) : userRole === role
  if (!allowed) return <Navigate to="/" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/conversational-english"
        element={
          <ProtectedRoute>
            <CategoryGridPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/conversational-english/:categoryId"
        element={
          <ProtectedRoute>
            <SubcategoryGridPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/conversational-english/:categoryId/:subcategoryId"
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
        path="/vocabulary"
        element={
          <ProtectedRoute>
            <Suspense fallback={<div className="flex items-center justify-center py-24 text-slate-400">Loading...</div>}>
              <VocabularyPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/exams"
        element={
          <ProtectedRoute>
            <Suspense fallback={<div className="flex items-center justify-center py-24 text-slate-400">Loading...</div>}>
              <ExamPrepPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/exams/:paperId"
        element={
          <ProtectedRoute>
            <Suspense fallback={<div className="flex items-center justify-center py-24 text-slate-400">Loading...</div>}>
              <ExamPaperPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/exams/:paperId/written"
        element={
          <ProtectedRoute>
            <Suspense fallback={<div className="flex items-center justify-center py-24 text-slate-400">Loading...</div>}>
              <ExamPaperPage part="written" />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/exams/:paperId/speaking"
        element={
          <ProtectedRoute>
            <Suspense fallback={<div className="flex items-center justify-center py-24 text-slate-400">Loading...</div>}>
              <ExamSpeakingPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pronunciation"
        element={
          <ProtectedRoute>
            <PronunciationHubPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pronunciation/sound-bank"
        element={<Navigate to="/pronunciation?tab=sound-bank" replace />}
      />
      <Route
        path="/pronunciation/stress-patterns"
        element={
          <ProtectedRoute>
            <LessonSessionPage session={stressPatterns} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pronunciation/stress-patterns/:unitId"
        element={
          <ProtectedRoute>
            <LessonSessionPage session={stressPatterns} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pronunciation/connected-speech"
        element={
          <ProtectedRoute>
            <LessonSessionPage session={connectedSpeech} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pronunciation/connected-speech/:unitId"
        element={
          <ProtectedRoute>
            <LessonSessionPage session={connectedSpeech} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pronunciation/sounds/:phonemeId"
        element={
          <ProtectedRoute>
            <PhonemeDetailPage />
          </ProtectedRoute>
        }
      />
      <Route path="/mission" element={<MissionPage />} />
      {/* Not protected: the reset email's link signs the user in here, and an expired link must still render. */}
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route
        path="/my-progress"
        element={
          <ProtectedRoute>
            <MyProgressPage />
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
      <Route path="/teacher/lists/*" element={<LegacyListRedirect />} />
      <Route
        path="/teacher/tools/vocab"
        element={
          <RoleProtectedRoute role="teacher">
            <Suspense fallback={<div className="flex items-center justify-center py-24 text-slate-400">Loading...</div>}>
              <TeacherVocabListsPage />
            </Suspense>
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/teacher/tools/vocab/new"
        element={
          <RoleProtectedRoute role="teacher">
            <Suspense fallback={<div className="flex items-center justify-center py-24 text-slate-400">Loading...</div>}>
              <TeacherVocabListPage />
            </Suspense>
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/teacher/tools/vocab/:listId"
        element={
          <RoleProtectedRoute role="teacher">
            <Suspense fallback={<div className="flex items-center justify-center py-24 text-slate-400">Loading...</div>}>
              <TeacherVocabListPage />
            </Suspense>
          </RoleProtectedRoute>
        }
      />
      <Route path="/teacher/tools" element={<Navigate to="/teacher?tab=tools" replace />} />
      <Route
        path="/teacher/tools/lyrics"
        element={
          <RoleProtectedRoute role="teacher">
            <Suspense fallback={<div className="flex items-center justify-center py-24 text-slate-400">Loading...</div>}>
              <LyricsActivitiesPage />
            </Suspense>
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/teacher/tools/lyrics/new"
        element={
          <RoleProtectedRoute role="teacher">
            <Suspense fallback={<div className="flex items-center justify-center py-24 text-slate-400">Loading...</div>}>
              <LyricsEditorPage />
            </Suspense>
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/teacher/tools/lyrics/:activityId"
        element={
          <RoleProtectedRoute role="teacher">
            <Suspense fallback={<div className="flex items-center justify-center py-24 text-slate-400">Loading...</div>}>
              <LyricsEditorPage />
            </Suspense>
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/teacher/tools/exam-tasks"
        element={
          <RoleProtectedRoute role="teacher">
            <Suspense fallback={<div className="flex items-center justify-center py-24 text-slate-400">Loading...</div>}>
              <ExamTasksPage />
            </Suspense>
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/teacher/tools/exam-tasks/new"
        element={
          <RoleProtectedRoute role="teacher">
            <Suspense fallback={<div className="flex items-center justify-center py-24 text-slate-400">Loading...</div>}>
              <ExamTaskEditorPage />
            </Suspense>
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/teacher/tools/exam-tasks/:taskId"
        element={
          <RoleProtectedRoute role="teacher">
            <Suspense fallback={<div className="flex items-center justify-center py-24 text-slate-400">Loading...</div>}>
              <ExamTaskEditorPage />
            </Suspense>
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
      <Route
        path="/admin/personas"
        element={
          <RoleProtectedRoute role="admin">
            <AdminPersonasPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/usage"
        element={
          <RoleProtectedRoute role="admin">
            <AdminUsagePage />
          </RoleProtectedRoute>
        }
      />
      </Route>
      {import.meta.env.DEV && <Route path="/dev/mouth-calibrator" element={<MouthCalibratorPage />} />}
    </Routes>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  )
}
