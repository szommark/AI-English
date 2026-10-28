// First: wraps fetch/console before anything else captures them (Report a problem context).
import './lib/feedbackContext'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { captureQrScan } from './lib/qrTracking'

captureQrScan()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
