import { useState } from 'react'
import {
  Search, Package, Plus, CheckCircle2, AlertTriangle,
  X, Download, ChevronRight, Truck, Eye,
} from 'lucide-react'
import { MEDICINES, MEDICINE_DETAIL, SUPPLIERS, PURCHASE_ORDERS } from '../data/mockData.js'

// ─── Mock prescription queue ────────────────────────────────────────────────────────────

const PRESCRIPTIONS = [
  {
    id: 1, patient: 'Ramesh Patel', uhid: 'PT-000001', token: 'T001',
    doctor: 'Dr. Suresh Mehta', department: 'Cardiology', time: '09:45 AM',
    status: 'Pending', billingStatus: 'PRESCRIPTION_PENDING',
    instructions: 'Take medicines after meals. Avoid fatty foods. Follow up in 2 weeks.',
    medicines: [
      { name: 'Atorvastatin 10mg', dosage: '10mg', frequency: '0-0-1', days: 30, qty: 30, unit: 'tabs', stock: 85  },
      { name: 'Aspirin 75mg',      dosage: '75mg',  frequency: '1-0-0', days: 30, qty: 30, unit: 'tabs', stock: 120 },
      { name: 'Amlodipine 5mg',    dosage: '5mg',   frequency: '0-0-1', days: 30, qty: 30, unit: 'tabs', stock: 90  },
    ],
  },
  {
    id: 2, patient: 'Anjali Mehta', uhid: 'PT-000003', token: 'T003',
    doctor: 'Dr. Rajesh Kumar', department: 'Orthopedics', time: '10:30 AM',
    status: 'Pending', billingStatus: 'PRESCRIPTION_PENDING',
    instructions: 'Apply gel on affected area twice daily. Avoid strenuous activity.',
    medicines: [
      { name: 'Ibuprofen 400mg', dosage: '400mg', frequency: '1-0-1', days: 5, qty: 15, unit: 'tabs', stock: 8  },
      { name: 'Diclofenac Gel',  dosage: '1%',    frequency: 'BD',    days: 7, qty: 1,  unit: 'tube', stock: 22 },
    ],
  },
  {
    id: 3, patient: 'Vikram Desai', uhid: 'PT-000004', token: 'T004',
    doctor: 'Dr. Suresh Mehta', department: 'Cardiology', time: '10:50 AM',
    status: 'Dispensed', billingStatus: 'READY_TO_COLLECT',
    instructions: 'Take with meals. Monitor blood sugar daily. Avoid alcohol.',
    medicines: [
      { name: 'Metformin 500mg', dosage: '500mg', frequency: '1-1-1', days: 30, qty: 30, unit: 'tabs', stock: 8 },
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

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#1E8449] text-white text-sm font-semibold px-5 py-3.5 rounded-xl shadow-2xl">
      <CheckCircle2 className="w-4 h-4" />
      {message}
    </div>
  )
}

// ─── Part 1: Prescription Queue (split layout) ──────────────────────────────────────

function PrescriptionQueue() {
  const [rxList,   setRxList]   = useState(PRESCRIPTIONS)
  const [selected, setSelected] = useState(PRESCRIPTIONS[0])
  const [toast,    setToast]    = useState(null)

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const dispense = (id, partial = false) => {
    setRxList((prev) =>
      prev.map((rx) => rx.id === id ? { ...rx, status: 'Dispensed', billingStatus: 'READY_TO_COLLECT' } : rx)
    )
    setSelected((prev) => prev?.id === id ? { ...prev, status: 'Dispensed', billingStatus: 'READY_TO_COLLECT' } : prev)
    showToast(
      partial
        ? 'Partial dispense recorded. Bill updated — ready for collection'
        : 'Medicines dispensed. Bill updated — ready for collection'
    )
  }

  const selectedRx = rxList.find((r) => r.id === selected?.id) || rxList[0]

  return (
    <>
      <div className="grid gap-4" style={{ gridTemplateColumns: '40% 1fr', height: 'calc(100vh - 64px - 48px - 160px)' }}>

        {/* LEFT: prescription list */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-[#E5E7EB] flex items-center justify-between flex-shrink-0">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Prescriptions</p>
            <span className="text-[10px] font-bold bg-[#1A5276] text-white px-2 py-0.5 rounded-full">{rxList.length}</span>
          </div>
          <div className="overflow-y-auto flex-1">
            {rxList.map((rx) => {
              const isSelected  = selectedRx?.id === rx.id
              const isDispensed = rx.status === 'Dispensed'
              return (
                <button
                  key={rx.id}
                  onClick={() => setSelected(rx)}
                  className={`w-full text-left px-4 py-3.5 border-b border-[#F3F4F6] last:border-0 border-l-4 transition-all ${
                    isSelected
                      ? 'bg-[#EBF5FB] border-l-[#1A5276]'
                      : isDispensed
                      ? 'border-l-green-400 hover:bg-[#F8F9FA] opacity-70'
                      : 'border-l-orange-400 hover:bg-[#F8F9FA]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{rx.patient}</p>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">{rx.uhid}</p>
                      <p className="text-[10px] text-gray-500 mt-1">{rx.doctor} · {rx.time}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                        isDispensed ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}>{rx.token}</span>
                      <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${
                        isDispensed
                          ? 'bg-green-100 text-green-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {isDispensed ? 'Dispensed' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* RIGHT: prescription detail */}
        {selectedRx ? (
          <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-[#E5E7EB] bg-gradient-to-r from-[#EBF5FB] to-white flex-shrink-0">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900">{selectedRx.patient}</h3>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-[10px] font-mono text-gray-400">{selectedRx.uhid}</span>
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-mono">{selectedRx.token}</span>
                    <span className="text-[10px] text-gray-400">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Prescribed by: <span className="font-semibold">{selectedRx.doctor}</span></p>
                  <p className="text-xs text-gray-500">Department: {selectedRx.department}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  selectedRx.status === 'Dispensed'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {selectedRx.status}
                </span>
              </div>
            </div>

            {/* Medicine table */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              <div className="border border-[#E5E7EB] rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#F8F9FA] border-b border-[#E5E7EB]">
                      {['Medicine Name', 'Dosage', 'Frequency', 'Days', 'Qty', 'Available Stock'].map((h) => (
                        <th key={h} className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wide px-3 py-2.5">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRx.medicines.map((m, i) => {
                      const sufficient = m.stock >= m.qty
                      return (
                        <tr key={i} className={`border-b border-[#F3F4F6] last:border-0 ${
                          !sufficient ? 'bg-red-50' : i % 2 === 0 ? 'bg-white' : 'bg-[#F8F9FA]'
                        }`}>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-1.5">
                              {!sufficient && <AlertTriangle className="w-3 h-3 text-red-500 flex-shrink-0" />}
                              <span className="text-sm font-semibold text-gray-900">{m.name}</span>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-xs text-gray-600">{m.dosage}</td>
                          <td className="px-3 py-3 text-xs text-gray-600">{m.frequency}</td>
                          <td className="px-3 py-3 text-xs text-gray-600">{m.days}d</td>
                          <td className="px-3 py-3 text-xs font-semibold text-gray-800">{m.qty} {m.unit}</td>
                          <td className="px-3 py-3">
                            {sufficient ? (
                              <span className="text-xs font-semibold text-green-600">{m.stock} {m.unit}</span>
                            ) : (
                              <span className="text-xs font-semibold text-red-600">Only {m.stock} available</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Special instructions */}
              {selectedRx.instructions && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
                  <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wide mb-1">Patient Instructions from Doctor</p>
                  <p className="text-xs text-blue-800 leading-relaxed">{selectedRx.instructions}</p>
                </div>
              )}
            </div>

            {/* Action buttons */}
            {selectedRx.status !== 'Dispensed' && (
              <div className="px-5 py-4 border-t border-[#E5E7EB] flex gap-3 flex-shrink-0">
                {/* Check if any medicine has insufficient stock */}
                {(() => {
                  const hasShortage = selectedRx.medicines.some((m) => m.stock < m.qty)
                  return (
                    <>
                      <button
                        onClick={() => dispense(selectedRx.id, false)}
                        className="flex-1 flex items-center justify-center gap-2 bg-[#1E8449] text-white text-sm font-bold py-2.5 rounded-lg hover:bg-[#196F3D] transition-colors shadow-sm"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Dispense All
                      </button>
                      {hasShortage && (
                        <button
                          onClick={() => dispense(selectedRx.id, true)}
                          className="flex-1 flex items-center justify-center gap-2 border-2 border-orange-400 text-orange-600 text-sm font-bold py-2.5 rounded-lg hover:bg-orange-50 transition-colors"
                        >
                          <AlertTriangle className="w-4 h-4" /> Partial Dispense
                        </button>
                      )}
                    </>
                  )
                })()}
              </div>
            )}
            {selectedRx.status === 'Dispensed' && (
              <div className="px-5 py-4 border-t border-[#E5E7EB] flex-shrink-0">
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <p className="text-xs font-semibold text-green-800">Medicines dispensed — Bill updated and ready for collection</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm flex items-center justify-center">
            <p className="text-sm text-gray-400">Select a prescription</p>
          </div>
        )}
      </div>
      {toast && <Toast message={toast} />}
    </>
  )
}

// ─── Part 3: Inventory with detail panel ───────────────────────────────────────────────

const CATEGORY_COLORS = {
  Analgesic:    'bg-blue-100 text-blue-700',
  Antibiotic:   'bg-green-100 text-green-700',
  Antacid:      'bg-purple-100 text-purple-700',
  Antidiabetic: 'bg-orange-100 text-orange-700',
  'Antihypert.':'bg-pink-100 text-pink-700',
}

function daysRemaining(expiryDateStr) {
  const exp  = new Date(expiryDateStr)
  const now  = new Date()
  return Math.max(0, Math.round((exp - now) / (1000 * 60 * 60 * 24)))
}

function margin(purchase, selling) {
  return Math.round(((selling - purchase) / selling) * 100)
}

// Add Stock Modal
function AddStockModal({ medicine, onClose, onSave }) {
  const [form, setForm] = useState({ qty: '', batch: '', expiry: '', purchasePrice: '', supplier: '', invoice: '' })
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const valid = form.qty && form.batch && form.expiry && form.purchasePrice && form.supplier

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
      onMouseDown={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full flex flex-col"
        style={{ maxWidth: 480, maxHeight: '90vh' }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] flex-shrink-0">
          <h3 className="text-base font-bold text-gray-900">Add Stock — {medicine.name}</h3>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="px-6 py-5 overflow-y-auto flex-1 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Quantity to Add *</label>
            <input type="number" min="1" placeholder="e.g. 200" value={form.qty} onChange={(e) => set('qty', e.target.value)}
              className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276]" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Batch Number *</label>
            <input type="text" placeholder="e.g. PCM-2025-04" value={form.batch} onChange={(e) => set('batch', e.target.value)}
              className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276]" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Expiry Date *</label>
            <input type="date" value={form.expiry} onChange={(e) => set('expiry', e.target.value)}
              className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276]" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Purchase Price (Rs. per unit) *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-semibold">Rs.</span>
              <input type="number" min="0" step="0.01" placeholder="1.50" value={form.purchasePrice} onChange={(e) => set('purchasePrice', e.target.value)}
                className="w-full border border-[#E5E7EB] rounded-lg pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276]" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Supplier *</label>
            <select value={form.supplier} onChange={(e) => set('supplier', e.target.value)}
              className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276] bg-white">
              <option value="">Select supplier...</option>
              {SUPPLIERS.map((s) => <option key={s.id} value={s.name}>{s.name} — {s.city}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Invoice Number <span className="text-gray-400 font-normal">(optional)</span></label>
            <input type="text" placeholder="e.g. INV-SUP-2025-001" value={form.invoice} onChange={(e) => set('invoice', e.target.value)}
              className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276]" />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-[#E5E7EB] flex gap-3 flex-shrink-0">
          <button onClick={onClose} className="flex-1 border border-[#E5E7EB] text-gray-600 text-sm font-medium py-2.5 rounded-lg hover:bg-[#F8F9FA]">Cancel</button>
          <button onClick={() => { if (valid) { onSave(form); onClose() } }} disabled={!valid}
            className="flex-1 flex items-center justify-center gap-2 bg-[#1A5276] text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-[#154360] disabled:opacity-40 disabled:cursor-not-allowed">
            <CheckCircle2 className="w-4 h-4" /> Save Stock Entry
          </button>
        </div>
      </div>
    </div>
  )
}

// Medicine Detail Side Panel
function MedicineDetailPanel({ medicine, onClose, onAddStock }) {
  if (!medicine) return null
  const days    = daysRemaining(medicine.expiryDate)
  const mgn     = margin(medicine.purchasePrice, medicine.sellingPrice)
  const expiring = days <= 90
  const expDate  = new Date(medicine.expiryDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })

  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm flex flex-col overflow-hidden h-full">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-start justify-between flex-shrink-0">
        <div>
          <h3 className="text-base font-bold text-gray-900">{medicine.name} {medicine.dosage}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{medicine.genericName}</p>
          <span className={`inline-block mt-1.5 text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
            CATEGORY_COLORS[medicine.category] || 'bg-gray-100 text-gray-600'
          }`}>{medicine.category}</span>
        </div>
        <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {/* Stock Information */}
        <Section title="Stock Information">
          <Row label="Current Stock" value={
            <span className={medicine.status === 'Critical' ? 'text-red-600 font-bold' : medicine.status === 'Low' ? 'text-orange-600 font-bold' : 'text-green-600 font-bold'}>
              {medicine.stock} {medicine.unit}
            </span>
          } />
          <Row label="Unit" value={medicine.unit} />
          <Row label="Reorder Level" value={`${medicine.reorderLevel} ${medicine.unit}`} />
          <Row label="Reorder Quantity" value={`${medicine.reorderQty} ${medicine.unit}`} />
          <Row label="Days Remaining" value={`~${Math.round(medicine.stock / medicine.avgDailyUsage)} days`} />
        </Section>

        {/* Expiry */}
        <Section title="Expiry Information">
          <Row label="Current Batch Expiry" value={
            <span className={expiring ? 'text-orange-600 font-semibold' : 'text-gray-800'}>
              {expDate} {expiring && '⚠ Expiring soon'}
            </span>
          } />
          <Row label="Batch No." value={medicine.batchNo} />
        </Section>

        {/* Pricing */}
        <Section title="Pricing">
          <Row label="Purchase Price" value={`Rs.${medicine.purchasePrice} per ${medicine.unit.replace('s','')}`} />
          <Row label="Selling Price"  value={`Rs.${medicine.sellingPrice} per ${medicine.unit.replace('s','')}`} />
          <Row label="Margin" value={`${mgn}%`} />
        </Section>

        {/* Supplier */}
        <Section title="Supplier">
          <Row label="Supplier Name"   value={medicine.supplier} />
          <Row label="Contact"         value={medicine.supplierContact} />
          <Row label="Last Order Date" value={medicine.lastOrderDate} />
        </Section>

        {/* Consumption */}
        <Section title="Consumption">
          <Row label="Avg Daily Usage" value={`${medicine.avgDailyUsage} ${medicine.unit}/day`} />
          <Row label="Last 7 Days"     value={`${medicine.last7Days} ${medicine.unit} used`} />
        </Section>
      </div>

      {/* Actions */}
      <div className="px-5 py-4 border-t border-[#E5E7EB] flex gap-3 flex-shrink-0">
        <button onClick={onAddStock}
          className="flex-1 flex items-center justify-center gap-2 bg-[#1A5276] text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-[#154360] transition-colors">
          <Plus className="w-4 h-4" /> Add Stock
        </button>
        <button className="flex items-center justify-center gap-2 border border-[#E5E7EB] text-gray-600 text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-[#F8F9FA] transition-colors">
          Edit Details
        </button>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">{title}</p>
      <div className="bg-[#F8F9FA] rounded-lg divide-y divide-[#F3F4F6] overflow-hidden">
        {children}
      </div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between px-3 py-2.5">
      <span className="text-[11px] text-gray-500 font-medium">{label}</span>
      <span className="text-xs font-semibold text-gray-800">{value}</span>
    </div>
  )
}

function downloadCSV(medicines) {
  const headers = ['Medicine Name', 'Category', 'Current Stock', 'Unit', 'Expiry', 'Reorder Level', 'Status']
  const rows = medicines.map((m) => [
    `${m.name} ${m.dosage}`, m.category, m.stock, m.unit,
    EXPIRY_DATES[m.name] || '', REORDER_LEVELS[m.name] || '', m.status,
  ])
  const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = 'stock-report.csv'; a.click()
  URL.revokeObjectURL(url)
}

function Inventory() {
  const [query,       setQuery]       = useState('')
  const [filter,      setFilter]      = useState('All')
  const [selectedMed, setSelectedMed] = useState(null)
  const [showAddStock, setShowAddStock] = useState(false)

  const filtered = MEDICINES.filter((m) => {
    const matchQ = m.name.toLowerCase().includes(query.toLowerCase())
    if (!matchQ) return false
    if (filter === 'All')       return true
    if (filter === 'Low Stock') return m.status === 'Low'
    if (filter === 'Critical')  return m.status === 'Critical'
    if (filter === 'Expiring')  return ['Jun 2025', 'Aug 2025'].includes(EXPIRY_DATES[m.name])
    return true
  })

  const detailMed = selectedMed ? MEDICINE_DETAIL.find((d) => d.id === selectedMed.id) : null

  return (
    <div className="space-y-4">
      {/* Search + filters + download */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input type="text" placeholder="Search medicines..." value={query} onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276]" />
        </div>
        <div className="flex gap-2">
          {STOCK_FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                filter === f ? 'bg-[#1A5276] text-white border-[#1A5276]' : 'bg-white text-gray-600 border-[#E5E7EB] hover:bg-[#F8F9FA]'
              }`}>{f}</button>
          ))}
        </div>
        <button onClick={() => downloadCSV(MEDICINES)}
          className="flex items-center gap-2 border border-[#E5E7EB] text-gray-600 text-xs font-semibold px-3 py-2 rounded-lg hover:bg-[#F8F9FA] transition-colors whitespace-nowrap">
          <Download className="w-3.5 h-3.5" /> Download Stock Report
        </button>
      </div>

      {/* Split: table + detail panel */}
      <div className={`grid gap-4 ${selectedMed ? 'grid-cols-[1fr_360px]' : 'grid-cols-1'}`}>
        {/* Table */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8F9FA] border-b border-[#E5E7EB]">
                {['Medicine', 'Category', 'Stock', 'Unit', 'Expiry', 'Reorder Level', 'Status'].map((h) => (
                  <th key={h} className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((med, i) => {
                const isCritical = med.status === 'Critical'
                const isLow      = med.status === 'Low'
                const isSelected = selectedMed?.id === med.id
                return (
                  <tr key={med.id} onClick={() => setSelectedMed(isSelected ? null : med)}
                    className={`border-b border-[#F3F4F6] last:border-0 cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#EBF5FB]'
                      : isCritical ? 'bg-red-50 hover:bg-red-100'
                      : isLow ? 'bg-orange-50 hover:bg-orange-100'
                      : i % 2 === 0 ? 'bg-white hover:bg-[#F8F9FA]' : 'bg-[#F8F9FA] hover:bg-[#EBF5FB]'
                    }`}>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        {(isCritical || isLow) && (
                          <AlertTriangle className={`w-3.5 h-3.5 flex-shrink-0 ${isCritical ? 'text-red-500' : 'text-orange-500'}`} />
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
                      }`}>{med.stock}</span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-600">{med.unit}</td>
                    <td className="px-4 py-3.5 text-xs text-gray-600">{EXPIRY_DATES[med.name]}</td>
                    <td className="px-4 py-3.5 text-xs text-gray-600">{REORDER_LEVELS[med.name]}</td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isCritical ? 'bg-red-100 text-red-700'
                        : isLow ? 'bg-orange-100 text-orange-700'
                        : 'bg-green-100 text-green-700'
                      }`}>{med.status}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Detail panel */}
        {selectedMed && detailMed && (
          <MedicineDetailPanel
            medicine={detailMed}
            onClose={() => setSelectedMed(null)}
            onAddStock={() => setShowAddStock(true)}
          />
        )}
      </div>

      {showAddStock && detailMed && (
        <AddStockModal
          medicine={detailMed}
          onClose={() => setShowAddStock(false)}
          onSave={(data) => console.log('Stock added:', data)}
        />
      )}
    </div>
  )
}

// ─── Part 4: Purchase Orders ───────────────────────────────────────────────────────────

function POStatusBadge({ status }) {
  return (
    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${
      status === 'Received' ? 'bg-green-100 text-green-700'
      : status === 'Pending' ? 'bg-orange-100 text-orange-700'
      : 'bg-gray-100 text-gray-600'
    }`}>{status}</span>
  )
}

// Create PO Modal — 3-step wizard
function CreatePOModal({ onClose, onSubmit }) {
  const [step, setStep]     = useState(1)
  const [supplier, setSupplier] = useState('')
  const [items, setItems]   = useState([{ medicine: '', qty: '', note: '' }])

  const selectedSupplier = SUPPLIERS.find((s) => s.name === supplier)

  const addItem = () => setItems((prev) => [...prev, { medicine: '', qty: '', note: '' }])
  const updateItem = (i, k, v) => setItems((prev) => prev.map((it, idx) => idx === i ? { ...it, [k]: v } : it))
  const removeItem = (i) => setItems((prev) => prev.filter((_, idx) => idx !== i))

  const total = items.reduce((s, it) => {
    const med = MEDICINES.find((m) => m.name === it.medicine)
    return s + (med ? med.price * Number(it.qty || 0) : 0)
  }, 0)

  const handleSubmit = () => {
    const poNum = `PO-${String(PURCHASE_ORDERS.length + 1).padStart(3, '0')}`
    onSubmit({ id: poNum, supplier, items, amount: total, date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), status: 'Pending' })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
      onMouseDown={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full flex flex-col"
        style={{ maxWidth: 580, maxHeight: '92vh' }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] flex-shrink-0">
          <div>
            <h3 className="text-base font-bold text-gray-900">Create Purchase Order</h3>
            <p className="text-xs text-gray-500 mt-0.5">Step {step} of 3</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>

        <div className="px-6 py-5 overflow-y-auto flex-1">
          {/* Step 1: Select Supplier */}
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-800 mb-3">Select Supplier</p>
              {SUPPLIERS.map((s) => (
                <button key={s.id} onClick={() => setSupplier(s.name)}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                    supplier === s.name ? 'border-[#1A5276] bg-[#EBF5FB]' : 'border-[#E5E7EB] hover:bg-[#F8F9FA]'
                  }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-semibold ${supplier === s.name ? 'text-[#1A5276]' : 'text-gray-800'}`}>{s.name}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{s.city} · {s.speciality}</p>
                      <p className="text-[10px] text-gray-400">Last order: {s.lastOrderDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-500">{s.contact}</p>
                      {supplier === s.name && <CheckCircle2 className="w-4 h-4 text-[#1A5276] mt-1 ml-auto" />}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Add Medicines */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-gray-800">Add Medicines</p>
              <p className="text-xs text-gray-500">Supplier: <span className="font-semibold text-gray-700">{supplier}</span></p>
              {items.map((item, i) => (
                <div key={i} className="grid gap-2 items-end" style={{ gridTemplateColumns: '2fr 1fr 36px' }}>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 mb-1">Medicine</label>
                    <select value={item.medicine} onChange={(e) => updateItem(i, 'medicine', e.target.value)}
                      className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276] bg-white">
                      <option value="">Select medicine...</option>
                      {MEDICINES.map((m) => (
                        <option key={m.id} value={m.name}>{m.name} {m.dosage} (Stock: {m.stock})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 mb-1">Quantity</label>
                    <input type="number" min="1" placeholder="100" value={item.qty} onChange={(e) => updateItem(i, 'qty', e.target.value)}
                      className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276]" />
                  </div>
                  <button onClick={() => removeItem(i)} disabled={items.length === 1}
                    className="p-2 text-gray-300 hover:text-red-500 disabled:opacity-30"><X className="w-4 h-4" /></button>
                </div>
              ))}
              <button onClick={addItem} className="text-xs font-semibold text-[#1A5276] hover:underline flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Add Another Medicine
              </button>
              {total > 0 && (
                <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-lg px-4 py-3 flex items-center justify-between">
                  <span className="text-xs text-gray-600">Estimated Total</span>
                  <span className="text-sm font-bold text-[#1A5276]">Rs.{total.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-gray-800">Review & Submit</p>
              <div className="bg-[#F8F9FA] rounded-lg px-4 py-3 space-y-1">
                <p className="text-xs text-gray-600">Supplier: <span className="font-semibold text-gray-800">{supplier}</span></p>
                <p className="text-xs text-gray-600">Date: <span className="font-semibold text-gray-800">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span></p>
              </div>
              <div className="border border-[#E5E7EB] rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#F8F9FA] border-b border-[#E5E7EB]">
                      {['Medicine', 'Qty', 'Est. Amount'].map((h) => (
                        <th key={h} className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wide px-3 py-2">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.filter((it) => it.medicine && it.qty).map((it, i) => {
                      const med = MEDICINES.find((m) => m.name === it.medicine)
                      const amt = med ? med.price * Number(it.qty) : 0
                      return (
                        <tr key={i} className="border-b border-[#F3F4F6] last:border-0">
                          <td className="px-3 py-2.5 text-sm text-gray-800">{it.medicine}</td>
                          <td className="px-3 py-2.5 text-sm text-gray-600">{it.qty}</td>
                          <td className="px-3 py-2.5 text-sm font-semibold text-gray-900">Rs.{amt.toLocaleString('en-IN')}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between bg-[#EBF5FB] border border-[#1A5276]/20 rounded-lg px-4 py-3">
                <span className="text-sm font-bold text-gray-800">Estimated Total</span>
                <span className="text-lg font-black text-[#1A5276]">Rs.{total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-[#E5E7EB] flex gap-3 flex-shrink-0">
          {step > 1 && (
            <button onClick={() => setStep((s) => s - 1)}
              className="flex-1 border border-[#E5E7EB] text-gray-600 text-sm font-medium py-2.5 rounded-lg hover:bg-[#F8F9FA]">Back</button>
          )}
          {step < 3 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={step === 1 ? !supplier : items.every((it) => !it.medicine || !it.qty)}
              className="flex-1 flex items-center justify-center gap-2 bg-[#1A5276] text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-[#154360] disabled:opacity-40 disabled:cursor-not-allowed">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleSubmit}
              className="flex-1 flex items-center justify-center gap-2 bg-[#1A5276] text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-[#154360]">
              <CheckCircle2 className="w-4 h-4" /> Submit Purchase Order
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Receive Stock Modal
function ReceiveStockModal({ po, onClose, onConfirm }) {
  const [items, setItems] = useState(
    po.items.map((it) => ({ ...it, receivedQty: it.qty, batch: '', expiry: '' }))
  )
  const updateItem = (i, k, v) => setItems((prev) => prev.map((it, idx) => idx === i ? { ...it, [k]: v } : it))

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
      onMouseDown={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full flex flex-col"
        style={{ maxWidth: 600, maxHeight: '92vh' }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] flex-shrink-0">
          <h3 className="text-base font-bold text-gray-900">Receive Stock — {po.id}</h3>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="px-6 py-5 overflow-y-auto flex-1 space-y-4">
          <p className="text-xs text-gray-500">Supplier: <span className="font-semibold text-gray-700">{po.supplier}</span></p>
          {items.map((it, i) => (
            <div key={i} className="bg-[#F8F9FA] rounded-xl p-4 space-y-3">
              <p className="text-sm font-semibold text-gray-900">{it.medicine}</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-1">Qty Received</label>
                  <input type="number" value={it.receivedQty} onChange={(e) => updateItem(i, 'receivedQty', e.target.value)}
                    className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-1">Batch No.</label>
                  <input type="text" placeholder="e.g. B-2025-01" value={it.batch} onChange={(e) => updateItem(i, 'batch', e.target.value)}
                    className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-1">Expiry Date</label>
                  <input type="date" value={it.expiry} onChange={(e) => updateItem(i, 'expiry', e.target.value)}
                    className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30" />
                </div>
              </div>
            </div>
          ))}
          <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
            <p className="text-[10px] text-blue-600 font-semibold">Note: Inventory will be auto-updated after confirming receipt.</p>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-[#E5E7EB] flex gap-3 flex-shrink-0">
          <button onClick={onClose} className="flex-1 border border-[#E5E7EB] text-gray-600 text-sm font-medium py-2.5 rounded-lg hover:bg-[#F8F9FA]">Cancel</button>
          <button onClick={() => { onConfirm(po.id, items); onClose() }}
            className="flex-1 flex items-center justify-center gap-2 bg-[#1E8449] text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-[#196F3D]">
            <Truck className="w-4 h-4" /> Confirm Receipt
          </button>
        </div>
      </div>
    </div>
  )
}

function PurchaseOrders() {
  const [poList,    setPOList]    = useState(PURCHASE_ORDERS)
  const [showCreate, setShowCreate] = useState(false)
  const [receiveFor, setReceiveFor] = useState(null)
  const [viewPO,    setViewPO]    = useState(null)

  const totalAmount = poList.reduce((s, p) => s + p.amount, 0)
  const pending     = poList.filter((p) => p.status === 'Pending').length
  const received    = poList.filter((p) => p.status === 'Received').length
  const thisMonth   = poList.reduce((s, p) => s + p.amount, 0)

  const handleCreate = (po) => setPOList((prev) => [po, ...prev])
  const handleReceive = (id) => setPOList((prev) => prev.map((p) => p.id === id ? { ...p, status: 'Received' } : p))

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-900">Purchase Orders</h3>
          <p className="text-xs text-gray-500 mt-0.5">{poList.length} orders total</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-[#1A5276] text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-[#154360] transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Create Purchase Order
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total POs',   value: poList.length,                                  cls: 'text-gray-900' },
          { label: 'Pending',     value: pending,                                         cls: 'text-orange-600' },
          { label: 'Received',    value: received,                                        cls: 'text-green-600' },
          { label: 'This Month',  value: `Rs.${thisMonth.toLocaleString('en-IN')}`,       cls: 'text-[#1A5276]' },
        ].map(({ label, value, cls }) => (
          <div key={label} className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm px-4 py-3">
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">{label}</p>
            <p className={`text-xl font-black mt-1 ${cls}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* PO Table */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F8F9FA] border-b border-[#E5E7EB]">
              {['PO Number', 'Supplier', 'Items', 'Amount', 'Date', 'Status', 'Actions'].map((h) => (
                <th key={h} className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F3F4F6]">
            {poList.map((po) => (
              <tr key={po.id} className="hover:bg-[#F8F9FA] transition-colors">
                <td className="px-4 py-3.5">
                  <span className="text-sm font-bold text-[#1A5276] font-mono">{po.id}</span>
                </td>
                <td className="px-4 py-3.5">
                  <p className="text-sm font-semibold text-gray-900">{po.supplier}</p>
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-sm text-gray-600">{po.items.length} items</span>
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-sm font-bold text-gray-900">Rs.{po.amount.toLocaleString('en-IN')}</span>
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-xs text-gray-500">{po.date}</span>
                </td>
                <td className="px-4 py-3.5">
                  <POStatusBadge status={po.status} />
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setViewPO(po)}
                      className="flex items-center gap-1 text-[11px] font-semibold text-[#1A5276] border border-[#1A5276]/30 px-2.5 py-1 rounded-lg hover:bg-[#EBF5FB] transition-colors">
                      <Eye className="w-3 h-3" /> View
                    </button>
                    {po.status === 'Pending' && (
                      <button onClick={() => setReceiveFor(po)}
                        className="flex items-center gap-1 text-[11px] font-semibold text-green-700 border border-green-300 px-2.5 py-1 rounded-lg hover:bg-green-50 transition-colors">
                        <Truck className="w-3 h-3" /> Receive Stock
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View PO detail modal */}
      {viewPO && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
          onMouseDown={() => setViewPO(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full flex flex-col"
            style={{ maxWidth: 560, maxHeight: '90vh' }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] flex-shrink-0">
              <div>
                <h3 className="text-base font-bold text-gray-900">{viewPO.id}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{viewPO.supplier} · {viewPO.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <POStatusBadge status={viewPO.status} />
                <button onClick={() => setViewPO(null)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
              </div>
            </div>
            <div className="px-6 py-5 overflow-y-auto flex-1">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F8F9FA] border-b border-[#E5E7EB]">
                    {['Medicine', 'Qty', 'Unit', 'Rate', 'Total'].map((h) => (
                      <th key={h} className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wide px-3 py-2">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6]">
                  {viewPO.items.map((it, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2.5 text-sm text-gray-800">{it.medicine}</td>
                      <td className="px-3 py-2.5 text-sm text-gray-600">{it.qty}</td>
                      <td className="px-3 py-2.5 text-sm text-gray-600">{it.unit}</td>
                      <td className="px-3 py-2.5 text-sm text-gray-600">Rs.{it.rate}</td>
                      <td className="px-3 py-2.5 text-sm font-semibold text-gray-900">Rs.{it.total.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 flex items-center justify-between bg-[#EBF5FB] rounded-lg px-4 py-3">
                <span className="text-sm font-bold text-gray-800">Total Amount</span>
                <span className="text-lg font-black text-[#1A5276]">Rs.{viewPO.amount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreate && <CreatePOModal onClose={() => setShowCreate(false)} onSubmit={handleCreate} />}
      {receiveFor && <ReceiveStockModal po={receiveFor} onClose={() => setReceiveFor(null)} onConfirm={handleReceive} />}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'queue',     label: 'Prescription Queue' },
  { key: 'inventory', label: 'Inventory'           },
  { key: 'orders',    label: 'Purchase Orders'     },
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
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
              tab === key
                ? 'bg-white text-[#1A5276] shadow-sm border border-[#E5E7EB]'
                : 'text-gray-500 hover:text-gray-700'
            }`}>
            {label}
            {key === 'queue' && pendingCount > 0 && (
              <span className="ml-2 text-[10px] font-bold bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full">{pendingCount}</span>
            )}
            {key === 'inventory' && lowCount > 0 && (
              <span className="ml-2 text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">{lowCount}</span>
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
