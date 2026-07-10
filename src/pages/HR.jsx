import { useState } from 'react'
import { Search, Calendar, Plus, UserCheck, UserX } from 'lucide-react'
import { STAFF } from '../data/mockData.js'

// ─── Constants ────────────────────────────────────────────────────────────────

const DEPT_BADGE = {
  ICU:         'bg-red-100 text-red-700',
  'Ward A':    'bg-blue-100 text-blue-700',
  'Ward B':    'bg-indigo-100 text-indigo-700',
  Reception:   'bg-purple-100 text-purple-700',
  Laboratory:  'bg-teal-100 text-teal-700',
  Pharmacy:    'bg-green-100 text-green-700',
}

const AVATAR_COLORS = [
  'bg-[#1A5276]', 'bg-purple-600', 'bg-teal-600',
  'bg-orange-600', 'bg-green-700', 'bg-pink-600',
]

const ATTENDANCE_DATA = [
  { id: 1, name: 'Ravi Sharma',   dept: 'ICU',        checkIn: '07:55 AM', checkOut: '—',       status: 'Present', hours: '8h 30m' },
  { id: 2, name: 'Geeta Verma',   dept: 'Ward A',     checkIn: '08:02 AM', checkOut: '—',       status: 'Present', hours: '8h 23m' },
  { id: 3, name: 'Sunil Patil',   dept: 'Laboratory', checkIn: '08:10 AM', checkOut: '—',       status: 'Present', hours: '8h 15m' },
  { id: 4, name: 'Kavya Reddy',   dept: 'Reception',  checkIn: '—',       checkOut: '—',       status: 'Absent',  hours: '—'     },
  { id: 5, name: 'Mohan Das',     dept: 'Pharmacy',   checkIn: '08:30 AM', checkOut: '—',       status: 'Present', hours: '7h 55m' },
  { id: 6, name: 'Ananya Bose',   dept: 'Ward B',     checkIn: '02:00 PM', checkOut: '—',       status: 'Present', hours: '4h 25m' },
]

// ─── Tab 1: Staff Directory ────────────────────────────────────────────────────────────────

function StaffDirectory() {
  const [query, setQuery] = useState('')

  const filtered = STAFF.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.role.toLowerCase().includes(query.toLowerCase()) ||
      s.department.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Search staff by name, role, or department..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276]"
        />
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-3 gap-4">
        {filtered.map((member, i) => {
          const initials = member.name.split(' ').map((n) => n[0]).join('').slice(0, 2)
          const isPresent = member.status === 'Present'
          return (
            <div
              key={member.id}
              className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm p-5 flex flex-col items-center text-center space-y-3 hover:shadow-md transition-shadow"
            >
              {/* Avatar */}
              <div className="relative">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                  {initials}
                </div>
                {/* Status dot */}
                <span
                  className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${
                    isPresent ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
              </div>

              {/* Info */}
              <div>
                <p className="text-sm font-bold text-gray-900">{member.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{member.role}</p>
              </div>

              {/* Department badge */}
              <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                DEPT_BADGE[member.department] || 'bg-gray-100 text-gray-600'
              }`}>
                {member.department}
              </span>

              {/* Shift */}
              <p className="text-[10px] text-gray-400">{member.shift} Shift</p>

              {/* View Profile button */}
              <button className="w-full border border-[#E5E7EB] text-gray-600 text-xs font-semibold py-2 rounded-lg hover:bg-[#F8F9FA] hover:border-[#1A5276] hover:text-[#1A5276] transition-all">
                View Profile
              </button>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-sm text-gray-400">No staff found</div>
      )}
    </div>
  )
}

// ─── Tab 2: Attendance ────────────────────────────────────────────────────────────────────

function Attendance() {
  const presentCount = ATTENDANCE_DATA.filter((a) => a.status === 'Present').length
  const absentCount  = ATTENDANCE_DATA.filter((a) => a.status === 'Absent').length

  return (
    <div className="space-y-4">
      {/* Date + summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-semibold text-gray-700">09 July 2026</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-100 px-3 py-1.5 rounded-full">
            <UserCheck className="w-3.5 h-3.5" /> {presentCount} Present
          </span>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-100 px-3 py-1.5 rounded-full">
            <UserX className="w-3.5 h-3.5" /> {absentCount} Absent
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F8F9FA] border-b border-[#E5E7EB]">
              {['Name', 'Department', 'Check-in', 'Check-out', 'Status', 'Hours'].map((h) => (
                <th key={h} className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ATTENDANCE_DATA.map((row, i) => {
              const isAbsent = row.status === 'Absent'
              return (
                <tr
                  key={row.id}
                  className={`border-b border-[#F3F4F6] last:border-0 ${
                    isAbsent ? 'bg-red-50' : i % 2 === 0 ? 'bg-white' : 'bg-[#F8F9FA]'
                  }`}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 ${
                        AVATAR_COLORS[i % AVATAR_COLORS.length]
                      }`}>
                        {row.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{row.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      DEPT_BADGE[row.dept] || 'bg-gray-100 text-gray-600'
                    }`}>
                      {row.dept}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-700 font-medium">{row.checkIn}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-700 font-medium">{row.checkOut}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      isAbsent
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${ isAbsent ? 'bg-red-500' : 'bg-green-500' }`} />
                      {row.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-gray-900">{row.hours}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Tab 3: Leave Management ─────────────────────────────────────────────────────────────

function LeaveManagement() {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <div className="w-16 h-16 rounded-full bg-[#F8F9FA] border border-[#E5E7EB] flex items-center justify-center">
        <Calendar className="w-7 h-7 text-gray-300" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-gray-700">No pending leave requests</p>
        <p className="text-xs text-gray-400 mt-1">All leave requests will appear here for approval</p>
      </div>
      <button className="flex items-center gap-2 bg-[#1A5276] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#154360] transition-colors shadow-sm">
        <Plus className="w-4 h-4" /> Submit Leave Request
      </button>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

const TABS = [
  { key: 'directory',  label: 'Staff Directory'   },
  { key: 'attendance', label: 'Attendance'         },
  { key: 'leave',      label: 'Leave Management'  },
]

export default function HR() {
  const [tab, setTab] = useState('directory')

  const presentCount = STAFF.filter((s) => s.status === 'Present').length
  const absentCount  = STAFF.filter((s) => s.status === 'Absent').length

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Human Resources</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {STAFF.length} staff members · {presentCount} present · {absentCount} absent today
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-100 px-3 py-1.5 rounded-full">
            <UserCheck className="w-3.5 h-3.5" /> {presentCount} Present
          </span>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-100 px-3 py-1.5 rounded-full">
            <UserX className="w-3.5 h-3.5" /> {absentCount} Absent
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#F8F9FA] border border-[#E5E7EB] rounded-lg p-1 w-fit">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
              tab === key
                ? 'bg-white text-[#1A5276] shadow-sm border border-[#E5E7EB]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'directory'  && <StaffDirectory />}
      {tab === 'attendance' && <Attendance />}
      {tab === 'leave'      && <LeaveManagement />}
    </div>
  )
}
