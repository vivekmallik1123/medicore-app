/**
 * main.jsx
 * --------
 * App entry point. Wraps the entire app in:
 * - BrowserRouter (for react-router-dom routing)
 * - AuthProvider (for Supabase auth state — must wrap App so all
 *   components can call useAuth())
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
