/**
 * App.jsx
 * -------
 * Root layout and route definitions.
 *
 * Route protection — three-stage gate:
 *
 * Stage 1 — loading is true:
 *   Supabase is restoring the session from localStorage.
 *   Show LoadingScreen. Nothing else renders.
 *
 * Stage 2 — loading is false, authReady is false:
 *   Either no session exists, OR a session exists but the
 *   is_active checks (staff + hospital) have not yet passed.
 *   Show login routes if there is no user, or LoadingScreen
 *   while the check is still in progress.
 *   AppLayout is NEVER rendered at this stage.
 *
 * Stage 3 — loading is false, authReady is true:
 *   Valid session + staff is_active + hospital is_active all
 *   confirmed. Only now is AppLayout rendered.
 *
 * This guarantees the dashboard is never visible, even for a
 * single frame, before authorization is fully confirmed.
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

// ── Loading screen ────────────────────────────────────────────────────────────
// Shown while Supabase restores the session OR while the is_active
// authorization check is in progress. The dashboard never renders here.
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

// ── Protected layout ──────────────────────────────────────────────────────────
// Only rendered when authReady is true (all checks passed).
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
            <Route path="*"               element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  // authReady is the critical gate — false until all checks pass.
  const { user, authReady, signingIn, loading } = useAuth()

  // Stage 1: initial session restore in progress
  if (loading) return <LoadingScreen />

  // Stage 2a: no session at all → show login
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  // Stage 2b: session exists but is_active checks not yet complete
  // (the window between setUser() and fetchProfile() resolving).
  // EXCEPTION: if signingIn is true, Login.jsx is already showing its own
  // inline spinner — do NOT replace it with LoadingScreen, which would
  // unmount the login page and cause a visible navigation flash.
  if (!authReady && !signingIn) return <LoadingScreen />

  // Stage 3: fully authorized → render the app
  return <AppLayout />
}
