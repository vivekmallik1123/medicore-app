import { useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  FlaskConical,
  CheckCircle2,
  MessageCircle,
  Save,
  X,
} from 'lucide-react'

// ─── Static data ────────────────────────────────────────────────────────────────

const CURRENT_PATIENT = {
  name:       'Anjali Mehta',
  token:      'T003',
  age:        28,
  gender:     'Female',
  bloodGroup: 'B+',
  contact:    '99887 76655',
  allergies:  'None',
  chronic:    'None',
}

const PAST_VISITS = [
  {
    date:      '12 May 2025',
    doctor:    'Dr. Rajesh Kumar',
    diagnosis: 'Sprained ankle',
    rx:        'Ibuprofen 400mg',
    notes:     'Rest for 1 week. Ice pack 3x daily.',
  },
  {
    date:      '03 Jan 2025',
    doctor:    'Dr. Anita Patel',
    diagnosis: 'Viral fever',
    rx:        'Paracetamol 500mg, Rest',
    notes:     'Plenty of fluids. Follow up if fever persists.',
  },
  {
    date:      '18 Sep 2024',
    doctor:    'Dr. Anita Patel',
    diagnosis: 'Routine checkup',
    rx:        'Multivitamins',
    notes:     'All vitals normal.',
  },
]

const VITALS_FIELDS = [
  { key: 'bp',     label: 'BP',     unit: 'mmHg', placeholder: '120/80', last: '118/76' },
  { key: 'pulse',  label: 'Pulse',  unit: 'bpm',  placeholder: '72',     last: '74' },
  { key: 'temp',   label: 'Temp',   unit: '°F',   placeholder: '98.6',   last: '98.4' },
  { key: 'spo2',   label: 'SpO2',   unit: '%',    placeholder: '99',     last: '98' },
  { key: 'weight', label: 'Weight', unit: 'kg',   placeholder: '58',     last: '57' },
]

const COMPLAINT_CHIPS = [
  'Fever', 'Cough', 'Headache', 'Chest Pain', 'Knee Pain', 'Back Pain',
  'Nausea', 'Fatigue', 'Dizziness', 'Shortness of Breath',
]

const FREQUENCY_OPTIONS = [
  '1-0-1', '1-1-1', '0-0-1', '1-0-0', 'SOS', 'Once daily', 'Twice daily',
]

const LAB_TESTS = [
  { name: 'CBC (Complete Blood Count)', price: 250, time: '4 hrs' },
  { name: 'Lipid Profile',              price: 450, time: '6 hrs' },
  { name: 'Blood Sugar (Fasting)',       price: 150, time: '2 hrs' },
  { name: 'Urine Routine',              price: 120, time: '1 hr'  },
  { name: 'ECG',                        price: 300, time: '30 min' },
  { name: 'X-Ray',                      price: 400, time: '1 hr'  },
]

const EMPTY_RX_ROW = { medicine: '', dosage: '', frequency: '1-0-1', days: '' }

// ─── Sub-components ────────────────────────────────────────────────────────────────

function TopBanner() {
  return (
    <div className="rounded-xl overflow-hidden shadow-sm flex-shrink-0" style={{ backgroundColor: '#1A5276' }}>
      {/* Main banner row */}
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
            AM
          </div>
          <div>
            <p className="text-[10px] font-semibold text-white/60 uppercase tracking-widest">Now Seeing</p>
            <p className="text-xl font-bold text-white leading-tight mt-0.5">
              {CURRENT_PATIENT.name}
              <span className="text-white/60 font-normal text-base ml-2">— Token {CURRENT_PATIENT.token}</span>
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-white/80 font-medium">
            {CURRENT_PATIENT.age}y · {CURRENT_PATIENT.gender} · {CURRENT_PATIENT.bloodGroup}
          </span>
          <span className="inline-flex items-center gap-1.5 bg-green-500/20 text-green-300 text-xs font-semibold px-3 py-1.5 rounded-full border border-green-400/30">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            In Consultation
          </span>
        </div>
      </div>

      {/* Stats strip */}
      <div className="flex items-center gap-6 px-6 py-2.5 bg-black/20 border-t border-white/10">
        {[
          { label: 'Seen today',          value: '12' },
          { label: 'Waiting',             value: '8'  },
          { label: 'Avg per patient',     value: '14 min' },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center gap-2">
            <span className="text-white/50 text-xs">{label}:</span>
            <span className="text-white font-semibold text-sm">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function PatientInfoCard() {
  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-[#E5E7EB]">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Patient Info</p>
      </div>
      <div className="p-4 space-y-3">
        {/* Avatar + name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#1A5276] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
            AM
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">{CURRENT_PATIENT.name}</p>
            <p className="text-xs text-gray-500">{CURRENT_PATIENT.age}y · {CURRENT_PATIENT.gender}</p>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 pt-1">
          {[
            { label: 'Contact',    value: CURRENT_PATIENT.contact    },
            { label: 'Blood Group', value: CURRENT_PATIENT.bloodGroup },
            { label: 'Allergies',  value: CURRENT_PATIENT.allergies  },
            { label: 'Chronic',    value: CURRENT_PATIENT.chronic    },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-1.5 border-b border-[#F3F4F6] last:border-0">
              <span className="text-[11px] text-gray-500 font-medium">{label}</span>
              <span className="text-xs font-semibold text-gray-800">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function PastVisitsCard() {
  const [openIdx, setOpenIdx] = useState(null)

  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-[#E5E7EB]">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Past Visits</p>
      </div>
      <div className="divide-y divide-[#F3F4F6]">
        {PAST_VISITS.map((visit, i) => (
          <div key={i}>
            <button
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#F8F9FA] transition-colors text-left"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-800">{visit.date}</span>
                  <span className="text-[10px] text-gray-400">{visit.doctor}</span>
                </div>
                <p className="text-[11px] text-gray-600 mt-0.5 truncate">{visit.diagnosis}</p>
              </div>
              {openIdx === i
                ? <ChevronUp className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 ml-2" />
                : <ChevronDown className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 ml-2" />}
            </button>

            {openIdx === i && (
              <div className="px-4 pb-3 space-y-1.5 bg-[#F8F9FA]">
                <div className="flex gap-2">
                  <span className="text-[10px] font-semibold text-gray-500 w-16 flex-shrink-0">Rx:</span>
                  <span className="text-[11px] text-gray-700">{visit.rx}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-[10px] font-semibold text-gray-500 w-16 flex-shrink-0">Notes:</span>
                  <span className="text-[11px] text-gray-700">{visit.notes}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function VitalsRow({ vitals, onChange }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-700 mb-2">Vitals</p>
      <div className="grid grid-cols-5 gap-2">
        {VITALS_FIELDS.map(({ key, label, unit, placeholder, last }) => (
          <div key={key} className="flex flex-col">
            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
              {label} <span className="text-gray-400 normal-case font-normal">({unit})</span>
            </label>
            <input
              type="text"
              placeholder={placeholder}
              value={vitals[key] || ''}
              onChange={(e) => onChange(key, e.target.value)}
              className="border border-[#E5E7EB] rounded-lg px-2.5 py-2 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276] text-center"
            />
            <p className="text-[10px] text-gray-400 mt-1 text-center">Last: {last}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function ComplaintField({ value, onChange }) {
  const appendChip = (chip) => {
    const trimmed = value.trim()
    onChange(trimmed ? `${trimmed}, ${chip}` : chip)
  }

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Chief Complaint</label>
      <textarea
        rows={2}
        placeholder="Describe chief complaint..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276] resize-none"
      />
      <div className="flex flex-wrap gap-1.5 mt-2">
        {COMPLAINT_CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => appendChip(chip)}
            className="text-[11px] font-medium px-2.5 py-1 rounded-full border border-[#E5E7EB] text-gray-600 hover:bg-[#EBF5FB] hover:border-[#1A5276] hover:text-[#1A5276] transition-colors"
          >
            + {chip}
          </button>
        ))}
      </div>
    </div>
  )
}

function PrescriptionTable({ rows, onChange, onAdd, onRemove }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold text-gray-700">Prescription</label>
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-1 text-xs font-semibold text-[#1A5276] hover:underline"
        >
          <Plus className="w-3.5 h-3.5" /> Add Medicine
        </button>
      </div>

      <div className="border border-[#E5E7EB] rounded-lg overflow-hidden">
        {/* Header */}
        <div className="grid bg-[#F8F9FA] border-b border-[#E5E7EB]" style={{ gridTemplateColumns: '2fr 1.2fr 1.2fr 0.7fr 36px' }}>
          {['Medicine', 'Dosage', 'Frequency', 'Days', ''].map((h) => (
            <div key={h} className="px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
              {h}
            </div>
          ))}
        </div>

        {/* Rows */}
        {rows.map((row, i) => (
          <div
            key={i}
            className="grid border-b border-[#F3F4F6] last:border-0 items-center"
            style={{ gridTemplateColumns: '2fr 1.2fr 1.2fr 0.7fr 36px' }}
          >
            <div className="px-2 py-1.5">
              <input
                type="text"
                placeholder="e.g. Paracetamol"
                value={row.medicine}
                onChange={(e) => onChange(i, 'medicine', e.target.value)}
                className="w-full border border-[#E5E7EB] rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#1A5276]/40 focus:border-[#1A5276]"
              />
            </div>
            <div className="px-2 py-1.5">
              <input
                type="text"
                placeholder="500mg"
                value={row.dosage}
                onChange={(e) => onChange(i, 'dosage', e.target.value)}
                className="w-full border border-[#E5E7EB] rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#1A5276]/40 focus:border-[#1A5276]"
              />
            </div>
            <div className="px-2 py-1.5">
              <select
                value={row.frequency}
                onChange={(e) => onChange(i, 'frequency', e.target.value)}
                className="w-full border border-[#E5E7EB] rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#1A5276]/40 focus:border-[#1A5276] bg-white"
              >
                {FREQUENCY_OPTIONS.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            <div className="px-2 py-1.5">
              <input
                type="number"
                placeholder="5"
                value={row.days}
                onChange={(e) => onChange(i, 'days', e.target.value)}
                className="w-full border border-[#E5E7EB] rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#1A5276]/40 focus:border-[#1A5276] text-center"
              />
            </div>
            <div className="flex items-center justify-center">
              {rows.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemove(i)}
                  className="p-1 text-gray-300 hover:text-[#C0392B] transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function LabTestDropdown({ selected, onToggle, onClose }) {
  return (
    <div className="absolute right-0 bottom-full mb-2 w-72 bg-white border border-[#E5E7EB] rounded-xl shadow-xl z-20 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB] bg-[#F8F9FA]">
        <p className="text-xs font-semibold text-gray-700">Order Lab Tests</p>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="divide-y divide-[#F3F4F6]">
        {LAB_TESTS.map((test) => {
          const isSelected = selected.includes(test.name)
          return (
            <button
              key={test.name}
              onClick={() => onToggle(test.name)}
              className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#F8F9FA] transition-colors ${
                isSelected ? 'bg-[#EBF5FB]' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-[#1A5276] border-[#1A5276]'
                      : 'border-[#D1D5DB]'
                  }`}
                >
                  {isSelected && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className={`text-xs font-medium ${ isSelected ? 'text-[#1A5276]' : 'text-gray-700' }`}>
                  {test.name}
                </span>
              </div>
              <div className="text-right flex-shrink-0 ml-2">
                <p className="text-xs font-semibold text-gray-900">Rs.{test.price}</p>
                <p className="text-[10px] text-gray-400">{test.time}</p>
              </div>
            </button>
          )
        })}
      </div>
      {selected.length > 0 && (
        <div className="px-4 py-3 border-t border-[#E5E7EB] bg-[#F8F9FA] flex items-center justify-between">
          <span className="text-xs text-gray-600">{selected.length} test{selected.length > 1 ? 's' : ''} selected</span>
          <button
            onClick={onClose}
            className="text-xs font-semibold text-white bg-[#1A5276] px-3 py-1.5 rounded-lg hover:bg-[#154360] transition-colors"
          >
            Confirm Order
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function OPDDoctor() {
  // Vitals
  const [vitals, setVitals] = useState({ bp: '', pulse: '', temp: '', spo2: '', weight: '' })
  const updateVital = (key, val) => setVitals((v) => ({ ...v, [key]: val }))

  // Consultation fields
  const [complaint,  setComplaint]  = useState('')
  const [diagnosis,  setDiagnosis]  = useState('')
  const [notes,      setNotes]      = useState('')
  const [whatsapp,   setWhatsapp]   = useState(true)

  // Prescription rows
  const [rxRows, setRxRows] = useState([
    { medicine: 'Ibuprofen', dosage: '400mg', frequency: '1-0-1', days: '5' },
  ])
  const updateRx  = (i, field, val) => setRxRows((r) => r.map((row, idx) => idx === i ? { ...row, [field]: val } : row))
  const addRxRow  = () => setRxRows((r) => [...r, { ...EMPTY_RX_ROW }])
  const removeRx  = (i) => setRxRows((r) => r.filter((_, idx) => idx !== i))

  // Lab tests
  const [showLab,      setShowLab]      = useState(false)
  const [selectedTests, setSelectedTests] = useState([])
  const toggleTest = (name) =>
    setSelectedTests((t) => t.includes(name) ? t.filter((x) => x !== name) : [...t, name])

  // Save state
  const [saved, setSaved] = useState(false)
  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="flex flex-col space-y-4">
      {/* Banner */}
      <TopBanner />

      {/* Two-column layout */}
      <div className="grid gap-4" style={{ gridTemplateColumns: '35% 1fr' }}>

        {/* LEFT 35% */}
        <div className="space-y-4">
          <PatientInfoCard />
          <PastVisitsCard />
        </div>

        {/* RIGHT 65% */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E7EB]">
            <h3 className="text-sm font-bold text-gray-900">Consultation</h3>
            <p className="text-xs text-gray-500 mt-0.5">Dr. Rajesh Kumar · Orthopedics · Room 103</p>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
            {/* Vitals */}
            <VitalsRow vitals={vitals} onChange={updateVital} />

            <div className="border-t border-[#F3F4F6]" />

            {/* Chief Complaint */}
            <ComplaintField value={complaint} onChange={setComplaint} />

            {/* Diagnosis */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Diagnosis</label>
              <input
                type="text"
                placeholder="Primary diagnosis..."
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276]"
              />
            </div>

            {/* Prescription */}
            <PrescriptionTable
              rows={rxRows}
              onChange={updateRx}
              onAdd={addRxRow}
              onRemove={removeRx}
            />

            {/* Ordered lab tests summary */}
            {selectedTests.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                <div className="flex items-center gap-2 mb-2">
                  <FlaskConical className="w-3.5 h-3.5 text-blue-600" />
                  <p className="text-xs font-semibold text-blue-700">Ordered Lab Tests</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedTests.map((t) => (
                    <span key={t} className="text-[11px] bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full font-medium">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Notes */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Additional Notes</label>
              <textarea
                rows={2}
                placeholder="Follow-up instructions, diet advice, referrals..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276] resize-none"
              />
            </div>

            {/* WhatsApp toggle */}
            <div className="flex items-center justify-between bg-[#F8F9FA] rounded-lg px-4 py-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <div>
                  <p className="text-xs font-semibold text-gray-800">Share via WhatsApp</p>
                  <p className="text-[10px] text-gray-500">Send prescription to patient’s mobile</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setWhatsapp((v) => !v)}
                className={`relative w-10 h-5.5 rounded-full transition-colors flex-shrink-0 ${
                  whatsapp ? 'bg-[#1E8449]' : 'bg-gray-300'
                }`}
                style={{ height: '22px', width: '40px' }}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    whatsapp ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="px-5 py-4 border-t border-[#E5E7EB] flex gap-3 flex-shrink-0">
            {/* Save button */}
            <button
              onClick={handleSave}
              className={`flex-1 flex items-center justify-center gap-2 text-white text-sm font-bold py-3 rounded-lg transition-all shadow-sm ${
                saved
                  ? 'bg-[#1E8449] scale-[0.99]'
                  : 'bg-[#1E8449] hover:bg-[#196F3D]'
              }`}
            >
              {saved ? (
                <><CheckCircle2 className="w-4 h-4" /> Saved! Next Patient →</>
              ) : (
                <><Save className="w-4 h-4" /> Save &amp; Next Patient</>
              )}
            </button>

            {/* Lab test dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowLab((v) => !v)}
                className="flex items-center gap-2 bg-[#1A5276] text-white text-sm font-semibold px-4 py-3 rounded-lg hover:bg-[#154360] transition-colors"
              >
                <FlaskConical className="w-4 h-4" />
                Order Lab Test
                {selectedTests.length > 0 && (
                  <span className="bg-white text-[#1A5276] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {selectedTests.length}
                  </span>
                )}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showLab ? 'rotate-180' : ''}`} />
              </button>

              {showLab && (
                <LabTestDropdown
                  selected={selectedTests}
                  onToggle={toggleTest}
                  onClose={() => setShowLab(false)}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
