import { useState } from 'react'

const STATS = [
  { label: 'Total Notifications', value: 24, color: '#2C3E50' },
  { label: 'Unread', value: 5, color: '#1A5276' },
  { label: 'Critical', value: 3, color: '#C0392B' },
  { label: 'Today', value: 8, color: '#1E8449' },
]

const TYPE_CONFIG = {
  CRITICAL: { dot: '#C0392B', bg: 'bg-red-100', text: 'text-red-700' },
  WARNING:  { dot: '#CA6F1E', bg: 'bg-orange-100', text: 'text-orange-700' },
  INFO:     { dot: '#3B82F6', bg: 'bg-blue-100', text: 'text-blue-700' },
  SUCCESS:  { dot: '#1E8449', bg: 'bg-green-100', text: 'text-green-700' },
}

const MODULE_COLORS = {
  IPD:       'bg-red-100 text-red-700',
  Pharmacy:  'bg-orange-100 text-orange-700',
  OPD:       'bg-blue-100 text-blue-700',
  Lab:       'bg-green-100 text-green-700',
  Billing:   'bg-orange-100 text-orange-700',
  Reception: 'bg-purple-100 text-purple-700',
  HR:        'bg-teal-100 text-teal-700',
}

const NOTIFICATIONS = [
  { id: 1, dot: '#C0392B', type: 'CRITICAL', message: 'ICU Bed 1 Arjun Singh vitals critical', module: 'IPD', time: '2 min ago', role: 'All Staff', unread: true },
  { id: 2, dot: '#CA6F1E', type: 'WARNING', message: 'Metformin 500mg stock critically low', module: 'Pharmacy', time: '10 min ago', role: 'Pharmacy', unread: true },
  { id: 3, dot: '#CA6F1E', type: 'WARNING', message: 'Bed 12 Ward A needs cleaning', module: 'IPD', time: '18 min ago', role: 'All Staff', unread: true },
  { id: 4, dot: '#3B82F6', type: 'INFO', message: 'Dr. Priya Nair OPD delayed on break', module: 'OPD', time: '25 min ago', role: 'Reception', unread: false },
  { id: 5, dot: '#1E8449', type: 'SUCCESS', message: 'Lab report ready Anjali Mehta X-Ray', module: 'Lab', time: '42 min ago', role: 'Lab', unread: false },
  { id: 6, dot: '#C0392B', type: 'CRITICAL', message: 'CBC result Vikram Desai critical value', module: 'Lab', time: '1 hr ago', role: 'Doctor', unread: true },
  { id: 7, dot: '#CA6F1E', type: 'WARNING', message: 'Invoice INV-003 overdue 7 days Rs.1587', module: 'Billing', time: '2 hr ago', role: 'Reception', unread: false },
  { id: 8, dot: '#1E8449', type: 'SUCCESS', message: 'Priya Shah discharged successfully', module: 'IPD', time: '3 hr ago', role: 'All Staff', unread: false },
  { id: 9, dot: '#3B82F6', type: 'INFO', message: 'New patient registered Kavita Iyer T010', module: 'Reception', time: '3 hr ago', role: 'Reception', unread: false },
  { id: 10, dot: '#CA6F1E', type: 'WARNING', message: 'OPD queue 8 patients waiting', module: 'Reception', time: '4 hr ago', role: 'Reception', unread: false },
  { id: 11, dot: '#C0392B', type: 'CRITICAL', message: 'ICU vitals check overdue 30 mins', module: 'IPD', time: '5 hr ago', role: 'Doctor', unread: false },
  { id: 12, dot: '#1E8449', type: 'SUCCESS', message: 'Pharmacy stock updated 5 medicines', module: 'Pharmacy', time: '6 hr ago', role: 'Pharmacy', unread: false },
  { id: 13, dot: '#3B82F6', type: 'INFO', message: 'Staff attendance marked 42 of 48', module: 'HR', time: '7 hr ago', role: 'Admin', unread: false },
  { id: 14, dot: '#CA6F1E', type: 'WARNING', message: 'Lab TAT exceeded Lipid Profile 3hr', module: 'Lab', time: '8 hr ago', role: 'Lab', unread: false },
  { id: 15, dot: '#1E8449', type: 'SUCCESS', message: 'Daily revenue target achieved Rs.1.24L', module: 'Billing', time: '9 hr ago', role: 'Admin', unread: false },
]

function FilterSelect({ label, options }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{label}</label>
      <select className="border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#1A5276]">
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  )
}

export default function Notifications() {
  const [currentPage, setCurrentPage] = useState(1)

  return (
    <div className="space-y-5">
      {/* Title */}
      <div>
        <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
        <p className="text-xs text-gray-500 mt-0.5">All system alerts and activity history</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm p-4">
            <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm flex flex-wrap gap-3" style={{ padding: '16px', marginBottom: '16px' }}>
        <div className="flex-1 min-w-48 flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Search</label>
          <input
            type="text"
            placeholder="Search notifications..."
            className="border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1A5276]"
          />
        </div>
        <FilterSelect label="Date" options={['Last 7 days', 'Last 30 days', 'Last 3 months', 'All time']} />
        <FilterSelect label="Module" options={['All Modules', 'Lab', 'IPD', 'Billing', 'Reception', 'Pharmacy', 'OPD', 'HR']} />
        <FilterSelect label="Type" options={['All Types', 'Critical', 'Warning', 'Info', 'Success']} />
        <FilterSelect label="Status" options={['All', 'Unread', 'Read', 'Acknowledged']} />
        <FilterSelect label="Role" options={['All Staff', 'Doctor', 'Receptionist', 'Lab', 'Pharmacy']} />
      </div>

      {/* Notifications table */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8F9FA] border-b border-[#E5E7EB]">
                <th className="px-4 py-3" style={{ width: '40px' }}></th>
                {['TYPE', 'MESSAGE', 'MODULE', 'TIME', 'ROLE', 'ACTIONS'].map((h) => (
                  <th key={h} className="text-left text-gray-500 uppercase tracking-wide px-4 py-3" style={{ fontSize: '12px' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {NOTIFICATIONS.map((n) => {
                const cfg = TYPE_CONFIG[n.type]
                return (
                  <tr
                    key={n.id}
                    className="border-b border-[#F3F4F6] last:border-0 hover:bg-[#F8F9FA] transition-colors"
                    style={{ backgroundColor: n.unread ? '#EBF5FB' : '#FFFFFF' }}
                  >
                    <td className="px-4 py-3.5">
                      <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: n.dot, width: '8px', height: '8px' }} />
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                        {n.type}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-sm text-gray-900 ${n.unread ? 'font-bold' : 'font-normal'}`}>
                        {n.message}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${MODULE_COLORS[n.module] || 'bg-gray-100 text-gray-600'}`}>
                        {n.module}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-gray-400">{n.time}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-gray-400">{n.role}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <button className="text-xs font-semibold border border-[#E5E7EB] text-gray-700 px-2.5 py-1 rounded hover:bg-[#F8F9FA] hover:border-[#1A5276] hover:text-[#1A5276] transition-all">
                          View
                        </button>
                        <button className="text-xs text-[#1A5276] font-medium hover:underline">
                          Mark Read
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">Showing 1-15 of 24 notifications</p>
        <div className="flex items-center gap-2">
          <button
            disabled
            className="px-3 py-1.5 text-sm font-medium border border-[#E5E7EB] rounded-lg text-gray-400 cursor-not-allowed bg-[#F8F9FA]"
          >
            Prev
          </button>
          {[1, 2].map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors"
              style={{
                backgroundColor: currentPage === page ? '#1A5276' : 'transparent',
                color: currentPage === page ? '#FFFFFF' : '#6B7280',
                border: currentPage === page ? '1px solid #1A5276' : '1px solid #E5E7EB',
              }}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(2)}
            className="px-3 py-1.5 text-sm font-medium border border-[#E5E7EB] rounded-lg text-gray-700 hover:bg-[#F8F9FA] hover:border-[#1A5276] hover:text-[#1A5276] transition-all"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
