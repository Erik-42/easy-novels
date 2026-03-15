import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ErrorBoundary } from './ErrorBoundary'

const root = document.getElementById('root')
if (!root) {
  document.body.innerHTML = '<p style="padding:2rem;color:red;">Élément #root introuvable.</p>'
} else {
  try {
    createRoot(root).render(
      <StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </StrictMode>,
    )
  } catch (err) {
    root.innerHTML = `<div style="padding:2rem;color:#e2e8f0;font-family:system-ui;"><h2 style="color:#f87171">Erreur au chargement</h2><pre style="background:#1e293b;padding:1rem;overflow:auto">${String(err?.message ?? err)}</pre><p>Ouvre la console (F12) pour plus de détails.</p></div>`
  }
}
