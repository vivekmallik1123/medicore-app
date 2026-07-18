/**
 * App.jsx
 * -------
 * Root layout and route definitions.
 *
 * Route protection:
 * - While the auth session is being checked on load, a full-screen
 *   loading spinner is shown (prevents flash of unauthenticated content)
 * - If no active session exists, the user is redirected to /login
 * - All app routes are only reachable when authenticated
 */

import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import Sidebar from './components/Sidebar.jsx'
import Header  from './components/Header.jsx'
import Login   from './pages/Login.jsx'

// Pages
import Dashboard    from './pages/Dashboard.jsx'
import Reception    from './pages/Reception.jsx'
import OPDDoctor    from './pages/OPDDoctor.jsx'
import Lab          from './pages/Lab.jsx'
import LabSettings  from './pages/LabSettings.jsx'
import IPDAdmission from './pages/IPDAdmission.jsx'
import Pharmacy     from './pages/Pharmacy.jsx'
import IPD          from './pages/IPD.jsx'
import Billing      from './pages/Billing.jsx'
import HR           from './pages/HR.jsx'
import Profile      from './pages/Profile.jsx'
import Notifications from './pages/Notifications.jsx'

// ── Loading screen shown while Supabase checks the existing session ──────────
function LoadingScreen() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-4"
      style={{ backgroundColor: '#F0F4F8', fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      <div className="w-12 h-12 rounded-xl bg-[#1A5276] flex items-center justify-center shadow-lg">
        <span className="text-white text-xl font-black">M</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span className="w-4 h-4 border-2 border-gray-300 border-t-[#1A5276] rounded-full animate-spin" />
        Loading MediCore...
      </div>
    </div>
  )
}

// ── Protected layout — only rendered when user is authenticated ───────────────
function AppLayout() {
  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ backgroundColor: '#F8F9FA', fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/"               element={<Dashboard />}    />
            <Route path="/reception"      element={<Reception />}    />
            <Route path="/opd"            element={<OPDDoctor />}    />
            <Route path="/lab"            element={<Lab />}          />
            <Route path="/lab-settings"   element={<LabSettings />}  />
            <Route path="/ipd-admission"  element={<IPDAdmission />} />
            <Route path="/pharmacy"       element={<Pharmacy />}     />
            <Route path="/ipd"            element={<IPD />}          />
            <Route path="/billing"        element={<Billing />}      />
            <Route path="/hr"             element={<HR />}           />
            <Route path="/profile"        element={<Profile />}      />
            <Route path="/notifications"  element={<Notifications />}/>
            {/* Catch-all: redirect unknown paths to dashboard */}
            <Route path="*"               element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  const { user, loading } = useAuth()

  // Show spinner while Supabase restores the session from localStorage
  if (loading) return <LoadingScreen />

  // Not logged in → show login page
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* Redirect any other path to /login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  // Logged in → show the full app
  return <AppLayout />
}
