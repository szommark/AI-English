// First: wrap fetch/console (Report a problem context) and start crash capture before anything else loads.
import './lib/feedbackContext'
import './lib/clientErrors'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { captureQrScan } from './lib/qrTracking'
import CrashBoundary, { RootCrashScreen } from './components/ReportProblem/CrashBoundary'

captureQrScan()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* Last resort for crashes outside the app frame (providers, router). */}
    <CrashBoundary fallback={() => <RootCrashScreen />}>
      <App />
    </CrashBoundary>
  </React.StrictMode>,
)
