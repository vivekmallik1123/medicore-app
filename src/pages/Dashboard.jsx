import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { IndianRupee, Users, BedDouble, UserCheck, TriangleAlert as AlertTriangle, CircleAlert as AlertCircle, Info, CircleCheck as CheckCircle2, ChevronRight } from 'lucide-react'
import StatusBadge from '../components/StatusBadge.jsx'
import { KPIS, WEEKLY_OPD, ALERTS, DEPARTMENTS } from '../data/mockData.js'

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatRupees(n) {
  return 'Rs.' + n.toLocaleString('en-IN')
}

const ALERT_CONFIG = {
  warning: {
    border: 'border-l-[#CA6F1E]',
    bg:     'bg-orange-50',
    icon:   <AlertTriangle className="w-4 h-4 text-[#CA6F1E] flex-shrink-0" />,
  },
  danger: {
    border: 'border-l-[#C0392B]',
    bg:     'bg-red-50',
    icon:   <AlertCircle className="w-4 h-4 text-[#C0392B] flex-shrink-0" />,
  },
  info: {
    border: 'border-l-blue-500',
    bg:     'bg-blue-50',
    icon:   <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />,
  },
  success: {
    border: 'border-l-[#1E8449]',
    bg:     'bg-green-50',
    icon:   <CheckCircle2 className="w-4 h-4 text-[#1E8449] flex-shrink-0" />,
  },
}

const DEPT_BADGE_COLORS = {
  Cardiology:  'bg-red-100 text-red-700',
  Orthopedics: 'bg-orange-100 text-orange-700',
  General:     'bg-blue-100 text-blue-700',
  Gynecology:  'bg-pink-100 text-pink-700',
  Neurology:   'bg-purple-100 text-purple-700',
}

// Custom tooltip for the bar chart
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg shadow-md px-3 py-2">
      <p className="text-xs font-semibold text-gray-700">{label}</p>
      <p className="text-sm font-bold text-[#1A5276] mt-0.5">
        {payload[0].value} patients
      </p>
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function BedProgressBar({ occupied, total }) {
  const pct = Math.round((occupied / total) * 100)
  return (
    <div className="mt-2">
      <div className="flex justify-between text-[10px] text-gray-500 mb-1">
        <span>{pct}% occupied</span>
        <span>{total - occupied} free</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-[#CA6F1E] transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function AlertsCard() {
  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm flex flex-col h-full">
      <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Recent Alerts</h3>
        <span className="text-[10px] font-semibold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
          {ALERTS.length} new
        </span>
      </div>
      <ul className="flex-1 divide-y divide-[#F3F4F6] overflow-y-auto">
        {ALERTS.map((alert) => {
          const cfg = ALERT_CONFIG[alert.type] || ALERT_CONFIG.info
          return (
            <li
              key={alert.id}
              className={`flex items-start gap-3 px-4 py-3.5 border-l-4 ${
                cfg.border
              } ${
                cfg.bg
              }`}
            >
              {cfg.icon}
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-800 leading-snug">
                  {alert.message}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">{alert.timeAgo}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function WeeklyChart() {
  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm flex flex-col h-full">
      <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Weekly OPD Patients</h3>
          <p className="text-xs text-gray-500 mt-0.5">Mon – Sun · current week</p>
        </div>
        <span className="text-xs text-gray-400">Total: {WEEKLY_OPD.reduce((s, d) => s + d.patients, 0)}</span>
      </div>
      <div className="flex-1 px-4 py-4 overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={WEEKLY_OPD}
            height={300}
            barSize={28}
            margin={{ top: 4, right: 4, left: -20, bottom: 16 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#6B7280' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: '#F3F4F6', radius: 4 }} />
            <Bar dataKey="patients" radius={[4, 4, 0, 0]}>
              {WEEKLY_OPD.map((entry) => (
                <Cell
                  key={entry.day}
                  fill={entry.day === 'Sat' ? '#2E86C1' : '#1A5276'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function DepartmentTable() {
  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-[#E5E7EB]">
        <h3 className="text-sm font-semibold text-gray-900">Department Summary</h3>
        <p className="text-xs text-gray-500 mt-0.5">Today’s activity across all departments</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E5E7EB] bg-[#F8F9FA]">
              {['Department', 'Doctor', 'Patients Today', 'Revenue', 'Status'].map((h) => (
                <th
                  key={h}
                  className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wide px-5 py-3"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DEPARTMENTS.map((dept, i) => (
              <tr
                key={dept.name}
                className={`border-b border-[#F3F4F6] last:border-0 hover:bg-[#F8F9FA] transition-colors ${
                  i % 2 === 0 ? 'bg-white' : 'bg-[#F8F9FA]'
                }`}
              >
                {/* Department badge */}
                <td className="px-5 py-3.5">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      DEPT_BADGE_COLORS[dept.name] || 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {dept.name}
                  </span>
                </td>

                {/* Doctor */}
                <td className="px-5 py-3.5 text-sm text-gray-700 font-medium">
                  {dept.doctor}
                </td>

                {/* Patients */}
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">{dept.patients}</span>
                    <div className="flex-1 max-w-[60px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#1A5276] rounded-full"
                        style={{
                          width: `${Math.round((dept.patients / 35) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </td>

                {/* Revenue */}
                <td className="px-5 py-3.5 text-sm font-semibold text-gray-900">
                  {formatRupees(dept.revenue)}
                </td>

                {/* Status */}
                <td className="px-5 py-3.5">
                  <StatusBadge status="Available" size="sm" />
                </td>
              </tr>
            ))}
          </tbody>

          {/* Totals footer */}
          <tfoot>
            <tr className="bg-[#F8F9FA] border-t-2 border-[#E5E7EB]">
              <td className="px-5 py-3 text-xs font-bold text-gray-700" colSpan={2}>
                Total
              </td>
              <td className="px-5 py-3 text-sm font-bold text-gray-900">
                {DEPARTMENTS.reduce((s, d) => s + d.patients, 0)}
              </td>
              <td className="px-5 py-3 text-sm font-bold text-[#1A5276]">
                {formatRupees(DEPARTMENTS.reduce((s, d) => s + d.revenue, 0))}
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

// ─── Urgent Action Box ────────────────────────────────────────────────────────────────

const ROLE_OPTIONS = ['Admin', 'Doctor', 'Receptionist', 'Lab', 'Pharmacy']

const ROLE_FILTER = {
  Admin:        [1, 2, 3, 4, 5],
  Doctor:       [1, 2, 5],
  Pharmacy:     [3],
  Reception:    [1, 4],
  Receptionist: [1, 4],
  Lab:          [1, 2],
}

const URGENT_CARDS = [
  {
    id: 1, border: '#C0392B', badge: 'ALL STAFF', badgeBg: 'bg-red-100 text-red-700',
    title: 'ICU Bed 1 critical', detail: 'Arjun Singh — vitals dropping', action: 'View Patient',
  },
  {
    id: 2, border: '#C0392B', badge: 'LAB', badgeBg: 'bg-red-100 text-red-700',
    title: 'Critical lab result', detail: 'CBC Vikram Desai — unacknowledged', action: 'View Result',
  },
  {
    id: 3, border: '#CA6F1E', badge: 'PHARMACY', badgeBg: 'bg-orange-100 text-orange-700',
    title: 'Stock critical', detail: 'Metformin — 1 day supply left', action: 'Order Now',
  },
  {
    id: 4, border: '#CA6F1E', badge: 'RECEPTION', badgeBg: 'bg-orange-100 text-orange-700',
    title: 'Queue alert', detail: '3 patients waiting 45+ mins', action: 'View Queue',
  },
  {
    id: 5, border: '#C0392B', badge: 'DOCTOR', badgeBg: 'bg-red-100 text-red-700',
    title: 'Unacknowledged results', detail: 'Dr. Mehta — 2 critical lab results pending', action: 'View Results',
  },
]

function UrgentActionBox() {
  const [role, setRole] = useState('Admin')
  const visibleIds = ROLE_FILTER[role] || []
  const cards = URGENT_CARDS.filter((c) => visibleIds.includes(c.id))

  return (
    <div
      className="rounded-lg border flex-shrink-0"
      style={{ borderColor: '#C0392B', backgroundColor: '#FEF2F2', borderRadius: '8px', padding: '16px' }}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="font-bold" style={{ color: '#C0392B', fontSize: '16px' }}>
          🚨 Requires Immediate Action
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Viewing as:</span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="text-xs font-semibold border border-[#E5E7EB] rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30"
          >
            {ROLE_OPTIONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex overflow-x-auto gap-3 pb-1">
        {cards.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-lg shadow-sm flex-shrink-0"
            style={{
              borderLeft: `4px solid ${c.border}`,
              padding: '12px',
              minWidth: '260px',
            }}
          >
            <span
              className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${c.badgeBg}`}
            >
              {c.badge}
            </span>
            <p className="text-sm font-bold text-gray-900 mt-2">{c.title}</p>
            <p className="text-xs text-gray-500 mt-0.5">{c.detail}</p>
            <button className="mt-3 text-xs font-semibold border border-[#E5E7EB] text-gray-700 px-3 py-1.5 rounded-lg hover:bg-[#F8F9FA] hover:border-[#1A5276] hover:text-[#1A5276] transition-all">
              {c.action}
            </button>
          </div>
        ))}
        {cards.length === 0 && (
          <p className="text-xs text-gray-400 py-4">No urgent actions for this role</p>
        )}
      </div>
    </div>
  )
}

// ─── Clickable KPI Tile ────────────────────────────────────────────────────────────────

function ClickableTile({ children, onClick }) {
  return (
    <div
      onClick={onClick}
      className="relative bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
    >
      {children}
      <div className="flex items-center justify-between mt-2">
        <p className="text-[10px] text-gray-400">Click to view details</p>
        <ChevronRight className="w-3 h-3" style={{ color: '#9CA3AF' }} />
      </div>
    </div>
  )
}

function TileInner({ title, value, subtitle, icon: Icon, iconBg, iconColor, trend }) {
  return (
    <div className="flex items-start justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide truncate">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1.5 leading-none">{value}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1.5">{subtitle}</p>}
        {trend && (
          <div className="flex items-center gap-1 mt-2 text-xs font-medium text-green-600">
            <span>{trend} vs yesterday</span>
          </div>
        )}
      </div>
      {Icon && (
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ml-3"
          style={{ backgroundColor: iconBg, color: iconColor }}
        >
          <Icon className="w-5 h-5" />
        </div>
      )}
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { revenue, opd, beds, staff } = KPIS
  const navigate = useNavigate()

  return (
    <div className="space-y-5">
      {/* Page title */}
      <div>
        <h2 className="text-lg font-bold text-gray-900">Dashboard</h2>
        <p className="text-xs text-gray-500 mt-0.5">Live overview of today's hospital activity</p>
      </div>

      {/* Urgent Action Box */}
      <UrgentActionBox />

      {/* ROW 1 — 3 KPI Tiles */}
      <div className="grid grid-cols-3 gap-4">
        <ClickableTile onClick={() => navigate('/billing')}>
          <TileInner
            title="Today Revenue"
            value={formatRupees(revenue.value)}
            subtitle="Across all departments"
            icon={IndianRupee}
            iconBg="rgb(209 250 229)"
            iconColor="#1E8449"
            trend={revenue.trend}
          />
        </ClickableTile>

        <ClickableTile onClick={() => navigate('/reception')}>
          <TileInner
            title="OPD Patients"
            value={opd.value}
            subtitle={`${opd.waiting} waiting · ${opd.inConsult} in consultation`}
            icon={Users}
            iconBg="rgb(219 234 254)"
            iconColor="#1A5276"
          />
        </ClickableTile>

        <ClickableTile onClick={() => navigate('/ipd')}>
          <TileInner
            title="IPD Patients"
            value={54}
            subtitle="3 new today · 1 discharged"
            icon={BedDouble}
            iconBg="rgb(243 233 246)"
            iconColor="#6C3483"
          />
        </ClickableTile>
      </div>

      {/* ROW 2 — 2 wider KPI Tiles */}
      <div className="grid grid-cols-2 gap-4">
        <ClickableTile onClick={() => navigate('/ipd')}>
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide truncate">Beds Occupied</p>
              <p className="text-2xl font-bold text-gray-900 mt-1.5 leading-none">
                {beds.occupied}
                <span className="text-base font-medium text-gray-400">/{beds.total}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1.5">{beds.total - beds.occupied} beds available</p>
              <BedProgressBar occupied={beds.occupied} total={beds.total} />
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ml-3 bg-orange-100 text-orange-600">
              <BedDouble className="w-5 h-5" />
            </div>
          </div>
        </ClickableTile>

        <ClickableTile onClick={() => navigate('/hr')}>
          <TileInner
            title="Staff Present"
            value={`${staff.present}/${staff.total}`}
            subtitle={`${staff.onLeave} on leave today`}
            icon={UserCheck}
            iconBg="rgb(209 250 229)"
            iconColor="#1E8449"
          />
        </ClickableTile>
      </div>

      {/* ROW 2 — Chart + Alerts (60/40) */}
      <div className="grid grid-cols-5 gap-4 h-80 overflow-hidden mt-6">
        <div className="col-span-3 h-full">
          <WeeklyChart />
        </div>
        <div className="col-span-2 h-full">
          <AlertsCard />
        </div>
      </div>

      {/* ROW 3 — Department Table */}
      <div className="mt-8">
        <DepartmentTable />
      </div>
    </div>
  )
}
