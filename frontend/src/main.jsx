import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import 'leaflet/dist/leaflet.css'

// Recover original path when redirected through static-host fallback (404.html).
try {
  const stored = sessionStorage.getItem('fresh:redirect')
  if (stored) {
    sessionStorage.removeItem('fresh:redirect')
    if (stored !== window.location.pathname + window.location.search + window.location.hash) {
      window.history.replaceState(null, '', stored)
    }
  }
} catch {
  // sessionStorage may be unavailable in restricted environments — safe to ignore.
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
