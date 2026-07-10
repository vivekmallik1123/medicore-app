import { useState } from 'react'
import { Search, Package, Plus, CheckCircle2, AlertTriangle } from 'lucide-react'
import StatusBadge from '../components/StatusBadge.jsx'
import { MEDICINES } from '../data/mockData.js'

// ─── Mock prescription queue ────────────────────────────────────────────────────────────

const PRESCRIPTIONS = [
  {
    id: 1,
    patient: 'Ramesh Patel',
    token: 'T001',
    doctor: 'Dr. Suresh Mehta',
    time: '09:45 AM',
    status: 'Pending',
    medicines: [
      { name: 'Atorvastatin 10mg', qty: 30, unit: 'tabs' },
      { name: 'Aspirin 75mg',      qty: 30, unit: 'tabs' },
      { name: 'Amlodipine 5mg',    qty: 30, unit: 'tabs' },
    ],
  },
  {
    id: 2,
    patient: 'Anjali Mehta',
    token: 'T003',
    doctor: 'Dr. Rajesh Kumar',
    time: '10:30 AM',
    status: 'Pending',
    medicines: [
      { name: 'Ibuprofen 400mg',  qty: 15, unit: 'tabs' },
      { name: 'Diclofenac Gel',   qty: 1,  unit: 'tube' },
    ],
  },
  {
    id: 3,
    patient: 'Vikram Desai',
    token: 'T004',
    doctor: 'Dr. Suresh Mehta',
    time: '10:50 AM',
    status: 'Dispensed',
    medicines: [
      { name: 'Metformin 500mg',  qty: 30, unit: 'tabs' },
    ],
  },
]

const STOCK_FILTERS = ['All', 'Low Stock', 'Critical', 'Expiring']

const EXPIRY_DATES = {
  Paracetamol: 'Mar 2026',
  Amoxicillin: 'Aug 2025',
  Omeprazole:  'Jan 2027',
  Metformin:   'Jun 2025',
  Amlodipine:  'Nov 2026',
}

const REORDER_LEVELS = {
  Paracetamol: 50,
  Amoxicillin: 100,
  Omeprazole:  80,
  Metformin:   50,
  Amlodipine:  40,
}

// ─── Tab 1: Prescription Queue ──────────────────────────────────────────────────────────

function PrescriptionQueue() {
  const [rxList, setRxList] = useState(PRESCRIPTIONS)

  const dispense = (id) => {
    setRxList((prev) =>
      prev.map((rx) => rx.id === id ? { ...rx, status: 'Dispensed' } : rx)
    )
  }

  return (
    <div className="space-y-3">
      {rxList.map((rx) => {
        const isDispensed = rx.status === 'Dispensed'
        return (
          <div
            key={rx.id}
            className={`bg-white rounded-lg border shadow-sm overflow-hidden ${
              isDispensed ? 'border-green-200 opacity-75' : 'border-[#E5E7EB]'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#F3F4F6]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#1A5276] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {rx.patient.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{rx.patient}</p>
                  <p className="text-[11px] text-gray-500">
                    {rx.token} · {rx.doctor} · {rx.time}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">
                  {rx.medicines.length} medicine{rx.medicines.length > 1 ? 's' : ''}
                </span>
                {isDispensed ? (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-100 px-3 py-1.5 rounded-lg">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Dispensed
                  </span>
                ) : (
                  <button
                    onClick={() => dispense(rx.id)}
                    className="flex items-center gap-1.5 bg-[#1A5276] text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-[#154360] transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Dispense
                  </button>
                )}
              </div>
            </div>

            {/* Medicine list */}
            <div className="px-5 py-3 flex flex-wrap gap-2">
              {rx.medicines.map((m, i) => (
                <span
                  key={i}
                  className="text-[11px] font-medium bg-[#F8F9FA] border border-[#E5E7EB] text-gray-700 px-2.5 py-1 rounded-lg"
                >
                  {m.name} × {m.qty} {m.unit}
                </span>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Tab 2: Inventory ────────────────────────────────────────────────────────────────────

function Inventory() {
  const [query,  setQuery]  = useState('')
  const [filter, setFilter] = useState('All')

  const filtered = MEDICINES.filter((m) => {
    const matchQ = m.name.toLowerCase().includes(query.toLowerCase())
    if (!matchQ) return false
    if (filter === 'All')       return true
    if (filter === 'Low Stock') return m.status === 'Low'
    if (filter === 'Critical')  return m.status === 'Critical'
    if (filter === 'Expiring')  return ['Jun 2025', 'Aug 2025'].includes(EXPIRY_DATES[m.name])
    return true
  })

  return (
    <div className="space-y-4">
      {/* Search + filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search medicines..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276]"
          />
        </div>
        <div className="flex gap-2">
          {STOCK_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                filter === f
                  ? 'bg-[#1A5276] text-white border-[#1A5276]'
                  : 'bg-white text-gray-600 border-[#E5E7EB] hover:bg-[#F8F9FA]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F8F9FA] border-b border-[#E5E7EB]">
              {['Medicine', 'Category', 'Stock', 'Unit', 'Expiry', 'Reorder Level', 'Status'].map((h) => (
                <th key={h} className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((med, i) => {
              const isCritical = med.status === 'Critical'
              const isLow      = med.status === 'Low'
              return (
                <tr
                  key={med.id}
                  className={`border-b border-[#F3F4F6] last:border-0 ${
                    isCritical ? 'bg-red-50' : isLow ? 'bg-orange-50' : i % 2 === 0 ? 'bg-white' : 'bg-[#F8F9FA]'
                  }`}
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      {(isCritical || isLow) && (
                        <AlertTriangle className={`w-3.5 h-3.5 flex-shrink-0 ${ isCritical ? 'text-red-500' : 'text-orange-500' }`} />
                      )}
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{med.name}</p>
                        <p className="text-[10px] text-gray-400">{med.dosage}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-gray-600">{med.category}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-sm font-bold ${
                      isCritical ? 'text-red-600' : isLow ? 'text-orange-600' : 'text-gray-900'
                    }`}>
                      {med.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-gray-600">{med.unit}</td>
                  <td className="px-4 py-3.5 text-xs text-gray-600">{EXPIRY_DATES[med.name]}</td>
                  <td className="px-4 py-3.5 text-xs text-gray-600">{REORDER_LEVELS[med.name]}</td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={med.status} size="sm" />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Tab 3: Purchase Orders ─────────────────────────────────────────────────────────────

function PurchaseOrders() {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <div className="w-16 h-16 rounded-full bg-[#F8F9FA] border border-[#E5E7EB] flex items-center justify-center">
        <Package className="w-7 h-7 text-gray-300" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-gray-700">No purchase orders yet</p>
        <p className="text-xs text-gray-400 mt-1">Create a new order to restock medicines</p>
      </div>
      <button className="flex items-center gap-2 bg-[#1A5276] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#154360] transition-colors shadow-sm">
        <Plus className="w-4 h-4" /> Create Purchase Order
      </button>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

const TABS = [
  { key: 'queue',    label: 'Prescription Queue' },
  { key: 'inventory', label: 'Inventory'          },
  { key: 'orders',   label: 'Purchase Orders'    },
]

export default function Pharmacy() {
  const [tab, setTab] = useState('queue')

  const pendingCount = PRESCRIPTIONS.filter((r) => r.status === 'Pending').length
  const lowCount     = MEDICINES.filter((m) => m.status !== 'OK').length

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-gray-900">Pharmacy</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          {pendingCount} prescriptions pending · {lowCount} medicines need attention
        </p>
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
            {key === 'queue' && pendingCount > 0 && (
              <span className="ml-2 text-[10px] font-bold bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
            {key === 'inventory' && lowCount > 0 && (
              <span className="ml-2 text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
                {lowCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'queue'     && <PrescriptionQueue />}
      {tab === 'inventory' && <Inventory />}
      {tab === 'orders'    && <PurchaseOrders />}
    </div>
  )
}
