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
import {
  IndianRupee,
  Users,
  BedDouble,
  UserCheck,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
} from 'lucide-react'
import KPITile from '../components/KPITile.jsx'
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
            height={280}
            barSize={28}
            margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: '#6B7280' }}
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

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { revenue, opd, beds, staff } = KPIS

  return (
    <div className="space-y-5">
      {/* Page title */}
      <div>
        <h2 className="text-lg font-bold text-gray-900">Dashboard</h2>
        <p className="text-xs text-gray-500 mt-0.5">Live overview of today’s hospital activity</p>
      </div>

      {/* ROW 1 — KPI Tiles */}
      <div className="grid grid-cols-4 gap-4">
        {/* Revenue */}
        <KPITile
          title="Today Revenue"
          value={formatRupees(revenue.value)}
          trend={revenue.trend}
          subtitle="Across all departments"
          icon={IndianRupee}
          color="green"
        />

        {/* OPD */}
        <KPITile
          title="OPD Patients"
          value={opd.value}
          subtitle={`${opd.waiting} waiting \u00b7 ${opd.inConsult} in consultation`}
          icon={Users}
          color="blue"
        />

        {/* Beds — custom tile with progress bar */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Beds Occupied</p>
              <p className="text-2xl font-bold text-gray-900 mt-1.5 leading-none">
                {beds.occupied}
                <span className="text-base font-medium text-gray-400">/{beds.total}</span>
              </p>
              <BedProgressBar occupied={beds.occupied} total={beds.total} />
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ml-3 bg-orange-100 text-orange-600">
              <BedDouble className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Staff */}
        <KPITile
          title="Staff Present"
          value={`${staff.present}/${staff.total}`}
          subtitle={`${staff.onLeave} on leave today`}
          icon={UserCheck}
          color="green"
        />
      </div>

      {/* ROW 2 — Chart + Alerts (60/40) */}
      <div className="grid grid-cols-5 gap-4 h-72 overflow-hidden mt-6">
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
