import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, X } from 'lucide-react'

const NOTIFICATIONS = [
  { id: 1, dot: '#C0392B', text: 'ICU Bed 1 — Arjun Singh vitals critical', time: '2 mins ago', badge: 'IPD', badgeColor: '#C0392B', unread: true, critical: true },
  { id: 2, dot: '#CA6F1E', text: 'Metformin 500mg stock critically low (8 units)', time: '10 mins ago', badge: 'Pharmacy', badgeColor: '#CA6F1E', unread: true, critical: false },
  { id: 3, dot: '#CA6F1E', text: 'Bed 12 Ward A needs cleaning', time: '18 mins ago', badge: 'IPD', badgeColor: '#CA6F1E', unread: true, critical: false },
  { id: 4, dot: '#3B82F6', text: 'Dr. Priya Nair OPD delayed — on break', time: '25 mins ago', badge: 'OPD', badgeColor: '#3B82F6', unread: false, critical: false },
  { id: 5, dot: '#1E8449', text: 'Lab report ready — Anjali Mehta X-Ray Knee', time: '42 mins ago', badge: 'Lab', badgeColor: '#1E8449', unread: false, critical: false },
  { id: 6, dot: '#C0392B', text: 'CBC result Vikram Desai — critical value unacknowledged', time: '1 hr ago', badge: 'Lab', badgeColor: '#C0392B', unread: true, critical: true },
  { id: 7, dot: '#CA6F1E', text: 'Invoice INV-2025-003 overdue 7 days — Rs.1,587 pending', time: '2 hrs ago', badge: 'Billing', badgeColor: '#CA6F1E', unread: false, critical: false },
  { id: 8, dot: '#1E8449', text: 'Priya Shah discharged successfully', time: '3 hrs ago', badge: 'IPD', badgeColor: '#1E8449', unread: false, critical: false },
]

const TAB_FILTERS = {
  All: () => true,
  Unread: (n) => n.unread,
  Critical: (n) => n.critical,
}

function NotificationPanel({ onClose, onNavigateAll }) {
  const [activeTab, setActiveTab] = useState('All')
  const filtered = NOTIFICATIONS.filter(TAB_FILTERS[activeTab])

  return (
    <div
      className="fixed right-0 top-0 h-screen bg-white shadow-2xl z-50 flex flex-col"
      style={{ width: '380px' }}
    >
      {/* Header row */}
      <div className="sticky top-0 bg-white border-b border-[#E5E7EB] px-4 py-3 flex items-center justify-between z-10">
        <p className="font-bold text-[#2C3E50]" style={{ fontSize: '18px' }}>Notifications</p>
        <div className="flex items-center gap-3">
          <button className="text-xs font-medium text-[#1A5276] hover:underline">Mark all read</button>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex border-b border-[#E5E7EB] px-4">
        {['All', 'Unread', 'Critical'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="text-sm font-medium px-3 py-2.5 transition-colors relative"
            style={{
              color: activeTab === tab ? '#1A5276' : '#6B7280',
              borderBottom: activeTab === tab ? '2px solid #1A5276' : '2px solid transparent',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Notification list */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        {filtered.map((n) => (
          <div
            key={n.id}
            className="flex items-start gap-3 px-4 hover:bg-[#F8F9FA] transition-colors"
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid #E5E7EB',
              backgroundColor: n.unread ? '#EBF5FB' : '#FFFFFF',
            }}
          >
            <span
              className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
              style={{ backgroundColor: n.dot }}
            />
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm text-gray-900 ${n.unread ? 'font-bold' : 'font-normal'}`}
              >
                {n.text}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <span className="text-[11px] text-gray-400">{n.time}</span>
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                style={{ backgroundColor: `${n.badgeColor}1A`, color: n.badgeColor }}
              >
                {n.badge}
              </span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-8">No notifications</p>
        )}
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 border-t border-[#E5E7EB]">
        <button
          onClick={onNavigateAll}
          className="w-full text-white font-medium hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#1A5276', fontSize: '14px', padding: '12px' }}
        >
          View All Notifications →
        </button>
      </div>
    </div>
  )
}

export default function Header() {
  const [showNotifications, setShowNotifications] = useState(false)
  const navigate = useNavigate()
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  return (
    <>
      <header
        className="flex items-center justify-between px-6 bg-white border-b border-[#E5E7EB] flex-shrink-0"
        style={{ height: '64px' }}
      >
        {/* Left: Hospital info */}
        <div>
          <p className="text-sm font-bold text-gray-900 leading-tight">
            Shree Sai Multi-Specialty Hospital, Ahmedabad
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{today}</p>
        </div>

        {/* Right: Status + Bell + Avatar */}
        <div className="flex items-center gap-4">
          {/* System Online */}
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            System Online
          </span>

          {/* Bell with badge */}
          <button
            onClick={() => setShowNotifications(true)}
            className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span
              className="absolute -top-1 -right-1 w-[18px] h-[18px] bg-red-500 text-white rounded-full flex items-center justify-center font-bold"
              style={{ fontSize: '10px' }}
            >
              5
            </span>
          </button>

          {/* Avatar */}
          <div
            onClick={() => navigate('/profile')}
            className="w-8 h-8 rounded-full bg-[#1A5276] text-white flex items-center justify-center text-sm font-bold select-none cursor-pointer hover:opacity-80 transition-opacity"
          >
            A
          </div>
        </div>
      </header>

      {/* Notification slide-in panel */}
      {showNotifications && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setShowNotifications(false)}
          />
          <div className="fixed right-0 top-0 h-screen z-50 transition-transform duration-300 translate-x-0">
            <NotificationPanel
              onClose={() => setShowNotifications(false)}
              onNavigateAll={() => {
                setShowNotifications(false)
                navigate('/notifications')
              }}
            />
          </div>
        </>
      )}
    </>
  )
}
