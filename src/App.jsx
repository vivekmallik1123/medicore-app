import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar.jsx'
import Header from './components/Header.jsx'

// Pages
import Dashboard  from './pages/Dashboard.jsx'
import Reception  from './pages/Reception.jsx'
import OPDDoctor  from './pages/OPDDoctor.jsx'
import Lab        from './pages/Lab.jsx'
import Pharmacy   from './pages/Pharmacy.jsx'
import IPD        from './pages/IPD.jsx'
import Billing    from './pages/Billing.jsx'
import HR         from './pages/HR.jsx'
import Profile    from './pages/Profile.jsx'
import Notifications from './pages/Notifications.jsx'

export default function App() {
  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#F8F9FA', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/"          element={<Dashboard />} />
            <Route path="/reception" element={<Reception />} />
            <Route path="/opd"       element={<OPDDoctor />} />
            <Route path="/lab"       element={<Lab />}       />
            <Route path="/pharmacy"  element={<Pharmacy />}  />
            <Route path="/ipd"       element={<IPD />}       />
            <Route path="/billing"   element={<Billing />}   />
            <Route path="/hr"        element={<HR />}        />
            <Route path="/profile"   element={<Profile />}   />
            <Route path="/notifications" element={<Notifications />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
