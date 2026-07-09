import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

const weeklyData = [
  { day: 'Mon', patients: 72 },
  { day: 'Tue', patients: 85 },
  { day: 'Wed', patients: 91 },
  { day: 'Thu', patients: 68 },
  { day: 'Fri', patients: 95 },
  { day: 'Sat', patients: 110 },
  { day: 'Sun', patients: 87 },
]

const departments = [
  { name: 'Cardiology', doctor: 'Dr. Suresh Mehta', patients: 24, color: 'bg-blue-100 text-blue-700' },
  { name: 'Orthopedics', doctor: 'Dr. Rajesh Kumar', patients: 18, color: 'bg-orange-100 text-orange-700' },
  { name: 'General', doctor: 'Dr. Anita Patel', patients: 31, color: 'bg-green-100 text-green-700' },
  { name: 'Pediatrics', doctor: 'Dr. Meena Iyer', patients: 14, color: 'bg-purple-100 text-purple-700' },
]

const alerts = [
  { id: 1, type: 'warning', message: 'Bed 12 needs cleaning', time: '10 mins ago' },
  { id: 2, type: 'info', message: 'Dr. Mehta OPD delayed 30 mins', time: '25 mins ago' },
  { id: 3, type: 'success', message: 'Lab reports for Priya Shah ready', time: '42 mins ago' },
]

const kpis = [
  {
    label: 'Today Revenue',
    value: '\u20b91,24,500',
    sub: '+12% vs yesterday',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    trend: 'up',
  },
  {
    label: 'OPD Patients',
    value: '87',
    sub: 'Today so far',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    trend: 'neutral',
  },
  {
    label: 'Beds Occupied',
    value: '54 / 80',
    sub: '26 beds available',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    trend: 'neutral',
  },
  {
    label: 'Staff Present',
    value: '42 / 48',
    sub: '6 on leave today',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    trend: 'up',
  },
]

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Dashboard</h2>
        <p className="text-sm text-gray-500 mt-0.5">Overview of today's hospital activity</p>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{kpi.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{kpi.value}</p>
                <p className="text-xs text-gray-500 mt-1">{kpi.sub}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg ${kpi.iconBg} ${kpi.iconColor} flex items-center justify-center flex-shrink-0`}>
                {kpi.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart + Alerts Row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Weekly OPD Chart */}
        <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Weekly OPD Patients</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px' }}
                cursor={{ fill: '#F3F4F6' }}
              />
              <Bar dataKey="patients" fill="#1A5276" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Recent Alerts</h3>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  alert.type === 'warning' ? 'bg-orange-400' :
                  alert.type === 'success' ? 'bg-green-400' : 'bg-blue-400'
                }`} />
                <div>
                  <p className="text-xs font-medium text-gray-800">{alert.message}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Department Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800">Department Summary</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left text-xs font-medium text-gray-500 px-5 py-3 uppercase tracking-wide">Department</th>
              <th className="text-left text-xs font-medium text-gray-500 px-5 py-3 uppercase tracking-wide">Doctor</th>
              <th className="text-left text-xs font-medium text-gray-500 px-5 py-3 uppercase tracking-wide">Patients Today</th>
              <th className="text-left text-xs font-medium text-gray-500 px-5 py-3 uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((dept, i) => (
              <tr key={dept.name} className={i < departments.length - 1 ? 'border-b border-gray-50' : ''}>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${dept.color}`}>
                    {dept.name}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-sm text-gray-700">{dept.doctor}</td>
                <td className="px-5 py-3.5">
                  <span className="text-sm font-semibold text-gray-900">{dept.patients}</span>
                  <span className="text-xs text-gray-400 ml-1">patients</span>
                </td>
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Active
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
