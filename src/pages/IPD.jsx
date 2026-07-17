import { useState } from 'react'
import {
  BedDouble, User, Calendar, Stethoscope, FileText,
  X, Settings, Plus, Pencil, Activity, Pill, ClipboardList, Receipt,
} from 'lucide-react'
import { BEDS, WARDS } from '../data/mockData.js'

// ─── Mock vitals / medications / notes / charges per bed ────────────────────────────────

const MOCK_VITALS = [
  { date: '09 Jul', time: '08:00 AM', bp: '128/82', pulse: '78', temp: '98.6', spo2: '97', weight: '72' },
  { date: '08 Jul', time: '08:00 AM', bp: '132/84', pulse: '82', temp: '99.1', spo2: '96', weight: '72' },
  { date: '07 Jul', time: '08:00 AM', bp: '138/88', pulse: '88', temp: '99.8', spo2: '95', weight: '73' },
]

const MOCK_MEDICATIONS = [
  { medicine: 'Aspirin 75mg',      dose: '75mg',  frequency: '1-0-0', route: 'Oral',  givenBy: 'Nurse Ravi',  time: '08:00 AM' },
  { medicine: 'Atorvastatin 10mg', dose: '10mg',  frequency: '0-0-1', route: 'Oral',  givenBy: 'Nurse Geeta', time: '09:00 PM' },
  { medicine: 'Amlodipine 5mg',    dose: '5mg',   frequency: '0-0-1', route: 'Oral',  givenBy: 'Nurse Ravi',  time: '09:00 PM' },
  { medicine: 'Normal Saline IV',  dose: '500ml', frequency: 'BD',    route: 'IV',    givenBy: 'Nurse Geeta', time: '10:00 AM' },
]

const MOCK_NOTES = [
  { date: '09 Jul 2026', time: '09:30 AM', author: 'Dr. Suresh Mehta', role: 'Doctor',  note: 'Patient stable. ECG shows improvement. Continue current medications. Review tomorrow.' },
  { date: '09 Jul 2026', time: '07:00 AM', author: 'Nurse Ravi Sharma', role: 'Nurse',  note: 'Morning vitals recorded. Patient comfortable. IV line patent. No complaints.' },
  { date: '08 Jul 2026', time: '06:00 PM', author: 'Dr. Suresh Mehta', role: 'Doctor',  note: 'Reviewed lab reports. Lipid profile elevated. Added Atorvastatin 10mg OD.' },
]

const MOCK_CHARGES = [
  { description: 'Room Charges (Ward A)',  rate: 1500, qty: 3, total: 4500 },
  { description: 'Doctor Visit',           rate: 500,  qty: 3, total: 1500 },
  { description: 'Medicines',              rate: null, qty: null, total: 1200 },
]

const WARD_FILTERS = ['All Wards', 'Ward A', 'Ward B', 'ICU']

const BED_STYLE = {
  Occupied:    { bg: 'bg-blue-50 border-blue-200 hover:border-blue-400',    label: 'text-blue-700',   dot: 'bg-blue-500'   },
  Critical:    { bg: 'bg-red-50 border-red-200 hover:border-red-400',       label: 'text-red-700',    dot: 'bg-red-500'    },
  Empty:       { bg: 'bg-green-50 border-green-200 hover:border-green-300', label: 'text-green-700',  dot: 'bg-green-500'  },
  Cleaning:    { bg: 'bg-orange-50 border-orange-200',                      label: 'text-orange-700', dot: 'bg-orange-400' },
  Maintenance: { bg: 'bg-gray-100 border-gray-200',                         label: 'text-gray-500',   dot: 'bg-gray-400'   },
}

// ─── Part 1: Ward Management Modal ─────────────────────────────────────────────────────────

const WARD_TYPES = ['General', 'Private', 'Semi-Private', 'ICU', 'NICU', 'HDU', 'Emergency']
const EMPTY_WARD_FORM = { name: '', type: 'General', beds: '', notes: '' }

function WardManagementModal({ wards, onClose, onAdd, onEdit }) {
  const [showForm, setShowForm] = useState(false)
  const [editWard, setEditWard] = useState(null)
  const [form, setForm]         = useState(EMPTY_WARD_FORM)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const valid = form.name && form.type && form.beds

  const openAdd  = () => { setForm(EMPTY_WARD_FORM); setEditWard(null); setShowForm(true) }
  const openEdit = (w) => { setForm({ name: w.name, type: w.type, beds: String(w.beds), notes: w.notes || '' }); setEditWard(w); setShowForm(true) }

  const handleSave = () => {
    if (!valid) return
    if (editWard) {
      onEdit({ ...editWard, ...form, beds: Number(form.beds) })
    } else {
      onAdd({ id: Date.now(), ...form, beds: Number(form.beds), active: true })
    }
    setShowForm(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
      onMouseDown={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full flex flex-col"
        style={{ maxWidth: 560, maxHeight: '90vh' }}
        onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] flex-shrink-0">
          <h3 className="text-base font-bold text-gray-900">Ward Management</h3>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>

        <div className="px-6 py-5 overflow-y-auto flex-1 space-y-4">
          {/* Ward list */}
          {!showForm && (
            <>
              <div className="space-y-2">
                {wards.map((w) => (
                  <div key={w.id} className="flex items-center justify-between bg-[#F8F9FA] rounded-xl px-4 py-3 border border-[#E5E7EB]">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{w.name}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{w.type} · {w.beds} beds</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        w.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>{w.active ? 'Active' : 'Inactive'}</span>
                      <button onClick={() => openEdit(w)}
                        className="p-1.5 text-gray-400 hover:text-[#1A5276] hover:bg-[#EBF5FB] rounded-lg transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={openAdd}
                className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-[#E5E7EB] text-gray-500 text-sm font-semibold py-3 rounded-xl hover:border-[#1A5276] hover:text-[#1A5276] transition-colors">
                <Plus className="w-4 h-4" /> Add New Ward
              </button>
            </>
          )}

          {/* Add / Edit form */}
          {showForm && (
            <div className="space-y-4">
              <p className="text-sm font-bold text-gray-800">{editWard ? 'Edit Ward' : 'Add New Ward'}</p>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Ward Name *</label>
                <input type="text" placeholder="e.g. Ward C" value={form.name} onChange={(e) => set('name', e.target.value)}
                  className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Ward Type *</label>
                <select value={form.type} onChange={(e) => set('type', e.target.value)}
                  className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276] bg-white">
                  {WARD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Number of Beds *</label>
                <input type="number" min="1" max="50" placeholder="e.g. 5" value={form.beds} onChange={(e) => set('beds', e.target.value)}
                  className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276]" />
                {form.name && form.beds && (
                  <p className="text-[10px] text-gray-400 mt-1">
                    Beds will be named: {form.name.replace(/\s/g, '')}{1}, {form.name.replace(/\s/g, '')}{2}…{form.name.replace(/\s/g, '')}{form.beds}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Notes <span className="text-gray-400 font-normal">(optional)</span></label>
                <input type="text" placeholder="e.g. Female-only ward" value={form.notes} onChange={(e) => set('notes', e.target.value)}
                  className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276]" />
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-[#E5E7EB] flex gap-3 flex-shrink-0">
          {showForm ? (
            <>
              <button onClick={() => setShowForm(false)}
                className="flex-1 border border-[#E5E7EB] text-gray-600 text-sm font-medium py-2.5 rounded-lg hover:bg-[#F8F9FA]">Back</button>
              <button onClick={handleSave} disabled={!valid}
                className="flex-1 flex items-center justify-center gap-2 bg-[#1A5276] text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-[#154360] disabled:opacity-40 disabled:cursor-not-allowed">
                {editWard ? 'Save Changes' : 'Create Ward'}
              </button>
            </>
          ) : (
            <button onClick={onClose}
              className="flex-1 bg-[#1A5276] text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-[#154360]">Done</button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Part 2: Bed Detail Panel (tabbed) ─────────────────────────────────────────────────────

const DETAIL_TABS = [
  { key: 'overview',     label: 'Overview',     icon: User         },
  { key: 'vitals',       label: 'Vitals',       icon: Activity     },
  { key: 'medications',  label: 'Medications',  icon: Pill         },
  { key: 'notes',        label: 'Notes',        icon: ClipboardList },
  { key: 'charges',      label: 'Charges',      icon: Receipt      },
]

function BedDetailPanel({ bed, onClose }) {
  const [activeTab, setActiveTab] = useState('overview')
  if (!bed) return null

  const initials = bed.patient ? bed.patient.split(' ').map((n) => n[0]).join('').slice(0, 2) : '?'
  const totalCharges = MOCK_CHARGES.reduce((s, c) => s + c.total, 0)

  return (
    <div className="fixed inset-0 z-40 flex justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }} onClick={onClose}>
      <div
        className="bg-white shadow-2xl flex flex-col h-full overflow-hidden"
        style={{ width: 420 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-5 py-4 border-b border-[#E5E7EB] flex-shrink-0 ${
          bed.status === 'Critical' ? 'bg-red-50' : 'bg-[#EBF5FB]'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${
                bed.status === 'Critical' ? 'bg-red-500' : 'bg-[#1A5276]'
              }`}>{initials}</div>
              <div>
                <h3 className="text-base font-bold text-gray-900">{bed.patient}</h3>
                <p className="text-[10px] font-mono text-gray-400 mt-0.5">{bed.uhid}</p>
                <p className="text-xs text-gray-500">{bed.id} · {bed.ward}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white/60 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#E5E7EB] flex-shrink-0 overflow-x-auto">
          {DETAIL_TABS.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-[11px] font-semibold whitespace-nowrap border-b-2 transition-all ${
                activeTab === key
                  ? 'border-[#1A5276] text-[#1A5276]'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}>
              <Icon className="w-3 h-3" />{label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">

          {/* Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-3">
              {[
                { label: 'Bed / Ward',          value: `${bed.id} · ${bed.ward}` },
                { label: 'Admission Date',       value: bed.admitDate || '—' },
                { label: 'Days Admitted',        value: `${bed.days} day${bed.days !== 1 ? 's' : ''}` },
                { label: 'Diagnosis',            value: bed.diagnosis || '—' },
                { label: 'Attending Doctor',     value: bed.doctor || '—' },
                { label: 'Expected Discharge',   value: bed.discharge || '—' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-[#F8F9FA] rounded-lg px-4 py-3">
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{value}</p>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  bed.status === 'Critical' ? 'bg-red-100 text-red-700'
                  : bed.status === 'Occupied' ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600'
                }`}>{bed.status}</span>
              </div>
            </div>
          )}

          {/* Vitals */}
          {activeTab === 'vitals' && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[#F8F9FA] border-b border-[#E5E7EB]">
                    {['Date', 'Time', 'BP', 'Pulse', 'Temp', 'SpO2', 'Wt'].map((h) => (
                      <th key={h} className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wide px-2 py-2">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6]">
                  {MOCK_VITALS.map((v, i) => (
                    <tr key={i}>
                      <td className="px-2 py-2 font-medium text-gray-700">{v.date}</td>
                      <td className="px-2 py-2 text-gray-500">{v.time}</td>
                      <td className="px-2 py-2 font-semibold text-gray-900">{v.bp}</td>
                      <td className="px-2 py-2 text-gray-700">{v.pulse}</td>
                      <td className="px-2 py-2 text-gray-700">{v.temp}°F</td>
                      <td className="px-2 py-2 text-gray-700">{v.spo2}%</td>
                      <td className="px-2 py-2 text-gray-700">{v.weight}kg</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Medications */}
          {activeTab === 'medications' && (
            <div className="space-y-2">
              {MOCK_MEDICATIONS.map((m, i) => (
                <div key={i} className="bg-[#F8F9FA] rounded-lg px-4 py-3 border border-[#E5E7EB]">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-gray-900">{m.medicine}</p>
                    <span className="text-[10px] font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{m.route}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-500">
                    <span>{m.dose}</span>
                    <span>·</span>
                    <span>{m.frequency}</span>
                    <span>·</span>
                    <span>{m.givenBy}</span>
                    <span>·</span>
                    <span>{m.time}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Notes */}
          {activeTab === 'notes' && (
            <div className="space-y-3">
              {MOCK_NOTES.map((n, i) => (
                <div key={i} className={`rounded-lg px-4 py-3 border ${
                  n.role === 'Doctor' ? 'bg-blue-50 border-blue-100' : 'bg-green-50 border-green-100'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-bold text-gray-900">{n.author}</p>
                    <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${
                      n.role === 'Doctor' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                    }`}>{n.role}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mb-1.5">{n.date} · {n.time}</p>
                  <p className="text-xs text-gray-700 leading-relaxed">{n.note}</p>
                </div>
              ))}
            </div>
          )}

          {/* Charges */}
          {activeTab === 'charges' && (
            <div className="space-y-3">
              <div className="border border-[#E5E7EB] rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#F8F9FA] border-b border-[#E5E7EB]">
                      {['Description', 'Rate', 'Qty', 'Total'].map((h) => (
                        <th key={h} className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wide px-3 py-2">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F4F6]">
                    {MOCK_CHARGES.map((c, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2.5 text-xs text-gray-800">{c.description}</td>
                        <td className="px-3 py-2.5 text-xs text-gray-600">{c.rate ? `Rs.${c.rate}` : '—'}</td>
                        <td className="px-3 py-2.5 text-xs text-gray-600">{c.qty || '—'}</td>
                        <td className="px-3 py-2.5 text-xs font-semibold text-gray-900">Rs.{c.total.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between bg-[#EBF5FB] border border-[#1A5276]/20 rounded-lg px-4 py-3">
                <span className="text-sm font-bold text-gray-800">Total So Far</span>
                <span className="text-lg font-black text-[#1A5276]">Rs.{totalCharges.toLocaleString('en-IN')}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Bed Card ────────────────────────────────────────────────────────────────────

function BedCard({ bed, isSelected, onClick }) {
  const style      = BED_STYLE[bed.status] || BED_STYLE.Empty
  const isOccupied = bed.status === 'Occupied' || bed.status === 'Critical'

  return (
    <div
      onClick={isOccupied ? onClick : undefined}
      className={`rounded-lg border-2 p-3 transition-all select-none ${
        style.bg
      } ${
        isOccupied ? 'cursor-pointer' : 'cursor-default'
      } ${
        isSelected ? 'ring-2 ring-[#1A5276] ring-offset-1' : ''
      }`}
      style={{ minHeight: '100px', width: '100%' }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">{bed.id}</span>
        <span className={`w-2 h-2 rounded-full ${style.dot}`} />
      </div>

      {isOccupied ? (
        <>
          <p className={`text-xs font-bold leading-tight ${style.label}`}>{bed.patient}</p>
          <p className="text-[10px] text-gray-500 mt-1">{bed.days} day{bed.days !== 1 ? 's' : ''} admitted</p>
          {bed.status === 'Critical' && (
            <span className="inline-block mt-1.5 text-[9px] font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full uppercase tracking-wide">Critical</span>
          )}
          <button className={`mt-2 text-[9px] font-semibold px-2 py-0.5 rounded transition-colors ${
            bed.status === 'Critical'
              ? 'bg-red-100 text-red-700 hover:bg-red-200'
              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          }`}>View Details</button>
        </>
      ) : bed.status === 'Empty' ? (
        <>
          <p className={`text-xs font-semibold ${style.label}`}>Available</p>
          <button className="mt-2 text-[10px] font-semibold text-green-700 bg-green-100 hover:bg-green-200 px-2 py-0.5 rounded transition-colors">Admit</button>
        </>
      ) : bed.status === 'Cleaning' ? (
        <p className={`text-xs font-semibold ${style.label}`}>Cleaning...</p>
      ) : (
        <p className={`text-xs font-semibold ${style.label}`}>Under Maintenance</p>
      )}
    </div>
  )
}

// ─── Ward Section ────────────────────────────────────────────────────────────────

function WardSection({ ward, beds, selectedBed, onSelect }) {
  const occupied = beds.filter((b) => b.status === 'Occupied' || b.status === 'Critical').length
  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <h3 className="text-sm font-bold text-gray-800">{ward}</h3>
        <span className="text-[10px] text-gray-500">{occupied}/{beds.length} occupied</span>
        <div className="flex-1 h-px bg-[#E5E7EB]" />
      </div>
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
        {beds.map((bed) => (
          <BedCard key={bed.id} bed={bed} isSelected={selectedBed?.id === bed.id} onClick={() => onSelect(bed)} />
        ))}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const STATS = [
  { label: 'Total Beds',  value: 80, color: 'text-gray-900'   },
  { label: 'Occupied',    value: 54, color: 'text-blue-600'   },
  { label: 'Available',   value: 26, color: 'text-green-600'  },
  { label: 'Cleaning',    value: 2,  color: 'text-orange-600' },
  { label: 'Maintenance', value: 1,  color: 'text-gray-500'   },
]

export default function IPD() {
  const [beds,         setBeds]         = useState(BEDS)
  const [wardList,     setWardList]     = useState(WARDS)
  const [wardFilter,   setWardFilter]   = useState('All Wards')
  const [selectedBed,  setSelectedBed]  = useState(null)
  const [showWardMgmt, setShowWardMgmt] = useState(false)
  const [detailBed,    setDetailBed]    = useState(null)

  const wards = [...new Set(beds.map((b) => b.ward))]
  const visibleWards = wardFilter === 'All Wards' ? wards : [wardFilter]
  const bedsForWard  = (ward) => beds.filter((b) => b.ward === ward)

  const handleSelectBed = (bed) => {
    if (selectedBed?.id === bed.id) {
      setSelectedBed(null)
      setDetailBed(null)
    } else {
      setSelectedBed(bed)
      setDetailBed(bed)
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">IPD — In-Patient Department</h2>
          <p className="text-xs text-gray-500 mt-0.5">Real-time bed occupancy across all wards</p>
        </div>
        <button onClick={() => setShowWardMgmt(true)}
          className="flex items-center gap-2 border border-[#E5E7EB] text-gray-600 text-xs font-semibold px-3 py-2 rounded-lg hover:bg-[#F8F9FA] transition-colors">
          <Settings className="w-3.5 h-3.5" /> Manage Wards
        </button>
      </div>

      {/* Stats strip */}
      <div className="flex gap-3">
        {STATS.map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm px-4 py-3 flex-1 text-center">
            <p className={`text-2xl font-black ${color}`}>{value}</p>
            <p className="text-[10px] text-gray-500 font-medium mt-0.5 uppercase tracking-wide">{label}</p>
          </div>
        ))}
      </div>

      {/* Ward filter tabs */}
      <div className="flex gap-1 bg-[#F8F9FA] border border-[#E5E7EB] rounded-lg p-1 w-fit">
        {WARD_FILTERS.map((f) => (
          <button key={f} onClick={() => { setWardFilter(f); setSelectedBed(null); setDetailBed(null) }}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
              wardFilter === f
                ? 'bg-white text-[#1A5276] shadow-sm border border-[#E5E7EB]'
                : 'text-gray-500 hover:text-gray-700'
            }`}>{f}</button>
        ))}
      </div>

      {/* Bed grid */}
      <div className="space-y-6">
        {visibleWards.map((ward) => (
          <WardSection key={ward} ward={ward} beds={bedsForWard(ward)}
            selectedBed={selectedBed} onSelect={handleSelectBed} />
        ))}
      </div>

      {/* Part 2: Bed detail side panel (fixed overlay) */}
      {detailBed && (
        <BedDetailPanel bed={detailBed} onClose={() => { setDetailBed(null); setSelectedBed(null) }} />
      )}

      {/* Part 1: Ward management modal */}
      {showWardMgmt && (
        <WardManagementModal
          wards={wardList}
          onClose={() => setShowWardMgmt(false)}
          onAdd={(w) => setWardList((prev) => [...prev, w])}
          onEdit={(w) => setWardList((prev) => prev.map((x) => x.id === w.id ? w : x))}
        />
      )}
    </div>
  )
}
