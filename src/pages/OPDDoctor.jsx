import { useState, useRef } from 'react'
import {
  ChevronDown, ChevronUp, Plus, Trash2, FlaskConical,
  CheckCircle2, MessageCircle, Save, X, Printer,
  Coffee, Play, ArrowRight, Bell,
} from 'lucide-react'
import { PATIENTS, DOCTORS } from '../data/mockData.js'

// ─── Constants ────────────────────────────────────────────────────────────────

const CURRENT_DOCTOR = DOCTORS.find((d) => d.name === 'Dr. Rajesh Kumar') || DOCTORS[2]

// Patients assigned to this doctor's department
const MY_PATIENTS = PATIENTS.filter(
  (p) => p.department === CURRENT_DOCTOR.specialty
).map((p, i) => ({
  ...p,
  // Normalise status names to match our queue flow
  status: p.status === 'InProgress' ? 'InConsultation' : p.status,
  registeredAt: ['09:05 AM', '09:22 AM', '09:48 AM', '10:10 AM'][i] || '10:30 AM',
}))

const PAST_VISITS = [
  { date: '12 May 2025', doctor: 'Dr. Rajesh Kumar', diagnosis: 'Sprained ankle',  rx: 'Ibuprofen 400mg',        notes: 'Rest for 1 week. Ice pack 3x daily.' },
  { date: '03 Jan 2025', doctor: 'Dr. Anita Patel',  diagnosis: 'Viral fever',      rx: 'Paracetamol 500mg, Rest', notes: 'Plenty of fluids. Follow up if fever persists.' },
  { date: '18 Sep 2024', doctor: 'Dr. Anita Patel',  diagnosis: 'Routine checkup',  rx: 'Multivitamins',          notes: 'All vitals normal.' },
]

const VITALS_FIELDS = [
  { key: 'bp',     label: 'BP',     unit: 'mmHg', placeholder: '120/80', last: '118/76' },
  { key: 'pulse',  label: 'Pulse',  unit: 'bpm',  placeholder: '72',     last: '74'     },
  { key: 'temp',   label: 'Temp',   unit: '°F',   placeholder: '98.6',   last: '98.4'   },
  { key: 'spo2',   label: 'SpO2',   unit: '%',    placeholder: '99',     last: '98'     },
  { key: 'weight', label: 'Weight', unit: 'kg',   placeholder: '58',     last: '57'     },
]

const COMPLAINT_CHIPS = [
  'Fever', 'Cough', 'Headache', 'Chest Pain', 'Knee Pain', 'Back Pain',
  'Nausea', 'Fatigue', 'Dizziness', 'Shortness of Breath',
]

const FREQUENCY_OPTIONS = [
  '1-0-1', '1-1-1', '0-0-1', '1-0-0', 'SOS', 'Once daily', 'Twice daily',
]

const LAB_TEST_CATALOG = [
  { name: 'CBC (Complete Blood Count)', price: 250, time: '4 hrs'  },
  { name: 'Lipid Profile',              price: 450, time: '6 hrs'  },
  { name: 'Blood Sugar (Fasting)',      price: 150, time: '2 hrs'  },
  { name: 'Urine Routine',             price: 120, time: '1 hr'   },
  { name: 'ECG',                       price: 300, time: '30 min' },
  { name: 'X-Ray',                     price: 400, time: '1 hr'   },
]

const EMPTY_RX_ROW = { medicine: '', dosage: '', frequency: '1-0-1', days: '', instructions: '' }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcAge(dob) {
  if (!dob) return null
  const today = new Date()
  const birth = new Date(dob)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

function todayStr() {
  return new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function initials(name) {
  return (name || '').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
}

// ─── Part 1: Left Queue Panel ──────────────────────────────────────────────────────

const STATUS_QUEUE_CFG = {
  Waiting:        { label: 'Waiting',         badge: 'bg-orange-100 text-orange-700', border: 'border-l-orange-400' },
  SentToOPD:      { label: 'Sent to OPD',     badge: 'bg-blue-100 text-blue-700',    border: 'border-l-blue-500',   ready: true },
  InConsultation: { label: 'In Consultation', badge: 'bg-blue-100 text-blue-700',    border: 'border-l-[#1A5276]',  active: true },
  Done:           { label: 'Done',            badge: 'bg-green-100 text-green-700',  border: 'border-l-green-400',  faded: true },
  OnHold:         { label: 'On Hold',         badge: 'bg-gray-100 text-gray-500',    border: 'border-l-gray-300',   faded: true },
}

const FILTER_TABS = ['All', 'Waiting', 'Done']

function QueuePanel({ patients, selectedId, onSelect, filter, onFilter }) {
  const filtered = patients.filter((p) => {
    if (filter === 'All') return true
    if (filter === 'Waiting') return ['Waiting', 'SentToOPD', 'InConsultation'].includes(p.status)
    if (filter === 'Done') return p.status === 'Done'
    return true
  })

  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#E5E7EB] flex-shrink-0">
        <p className="text-xs font-bold text-gray-900">My Patients Today</p>
        <p className="text-[10px] text-gray-400 mt-0.5">Showing patients assigned to {CURRENT_DOCTOR.name}</p>
      </div>

      {/* Filter tabs */}
      <div className="flex border-b border-[#E5E7EB] flex-shrink-0">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => onFilter(tab)}
            className={`flex-1 py-2 text-[11px] font-semibold transition-colors ${
              filter === tab
                ? 'border-b-2 border-[#1A5276] text-[#1A5276]'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Patient cards */}
      <div className="overflow-y-auto flex-1">
        {filtered.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-8">No patients</p>
        )}
        {filtered.map((p) => {
          const cfg = STATUS_QUEUE_CFG[p.status] || STATUS_QUEUE_CFG.Waiting
          const isActive = p.id === selectedId
          return (
            <button
              key={p.id}
              onClick={() => onSelect(p)}
              className={`w-full text-left px-3 py-3 border-b border-[#F3F4F6] last:border-0 border-l-4 transition-all ${
                isActive
                  ? 'bg-[#EBF5FB] border-l-[#1A5276]'
                  : `${cfg.border} hover:bg-[#F8F9FA]`
              } ${cfg.faded && !isActive ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {/* Token */}
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono flex-shrink-0 ${
                    p.status === 'Done' ? 'bg-green-100 text-green-700'
                    : p.status === 'InConsultation' ? 'bg-[#1A5276] text-white'
                    : 'bg-blue-100 text-blue-700'
                  }`}>{p.token}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">{p.name}</p>
                    <p className="text-[10px] text-gray-400">{p.age}y · {p.gender}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${cfg.badge}`}>
                    {cfg.label}
                  </span>
                  {cfg.ready && (
                    <span className="flex items-center gap-1 text-[9px] text-green-600 font-semibold">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      Ready
                    </span>
                  )}
                </div>
              </div>
              <p className="text-[9px] text-gray-400 mt-1.5">{p.registeredAt}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Part 2: Top Banner ───────────────────────────────────────────────────────────

function TopBanner({ patient, onBreak, onResume, isOnBreak, seenCount, waitingCount }) {
  const age = patient?.dob ? calcAge(patient.dob) : patient?.age
  const ini = patient ? initials(patient.name) : '?'

  if (isOnBreak) {
    return (
      <div className="rounded-xl overflow-hidden shadow-sm flex-shrink-0 bg-orange-500">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl">
              ☕
            </div>
            <div>
              <p className="text-[10px] font-semibold text-white/70 uppercase tracking-widest">Status</p>
              <p className="text-xl font-bold text-white">Doctor is on a break</p>
              <p className="text-xs text-white/70 mt-0.5">Queue is paused. Patients are waiting.</p>
            </div>
          </div>
          <button
            onClick={onResume}
            className="flex items-center gap-2 bg-white text-orange-600 text-sm font-bold px-4 py-2.5 rounded-lg hover:bg-orange-50 transition-colors shadow"
          >
            <Play className="w-4 h-4" /> Resume
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl overflow-hidden shadow-sm flex-shrink-0" style={{ backgroundColor: '#1A5276' }}>
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
            {ini}
          </div>
          <div>
            <p className="text-[10px] font-semibold text-white/60 uppercase tracking-widest">Now Seeing</p>
            <p className="text-xl font-bold text-white leading-tight mt-0.5">
              {patient?.name || 'No patient selected'}
              {patient && <span className="text-white/60 font-normal text-base ml-2">— Token {patient.token}</span>}
            </p>
            {patient?.uhid && (
              <p className="text-[11px] text-white/50 mt-0.5 font-mono">{patient.uhid}</p>
            )}
            {patient?.reason && (
              <p className="text-[11px] text-white/70 mt-0.5 italic">“{patient.reason}”</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {patient && (
            <span className="text-sm text-white/80 font-medium">
              {age}y · {patient.gender} · {patient.bloodGroup || '—'}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 bg-green-500/20 text-green-300 text-xs font-semibold px-3 py-1.5 rounded-full border border-green-400/30">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            In Consultation
          </span>
        </div>
      </div>

      {/* Stats strip */}
      <div className="flex items-center justify-between px-6 py-2.5 bg-black/20 border-t border-white/10">
        <div className="flex items-center gap-6">
          {[
            { label: 'Seen today',      value: String(seenCount) },
            { label: 'Waiting',         value: String(waitingCount) },
            { label: 'Avg per patient', value: '14 min' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="text-white/50 text-xs">{label}:</span>
              <span className="text-white font-semibold text-sm">{value}</span>
            </div>
          ))}
        </div>
        <button
          onClick={onBreak}
          className="flex items-center gap-2 border border-orange-400/60 text-orange-300 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-orange-500/20 transition-colors"
        >
          <Coffee className="w-3.5 h-3.5" /> Take a Break
        </button>
      </div>
    </div>
  )
}

// ─── Part 3: Patient Info Card ─────────────────────────────────────────────────────

function PatientInfoCard({ patient }) {
  if (!patient) {
    return (
      <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm p-6 flex items-center justify-center">
        <p className="text-xs text-gray-400">Select a patient from the queue</p>
      </div>
    )
  }

  const age = patient.dob ? calcAge(patient.dob) : patient.age
  const ini = initials(patient.name)

  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-[#E5E7EB]">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Patient Info</p>
      </div>
      <div className="p-4 space-y-3">
        {/* UHID */}
        {patient.uhid && (
          <p className="text-[10px] font-mono text-gray-400">{patient.uhid}</p>
        )}

        {/* Avatar + name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#1A5276] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
            {ini}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">{patient.name}</p>
            <p className="text-xs text-gray-500">{age} years · {patient.gender}</p>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-0 pt-1">
          {[
            { label: 'Contact',     value: patient.contact },
            { label: 'Blood Group', value: patient.bloodGroup || '—' },
            { label: 'Allergies',   value: patient.allergies || 'None known' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-1.5 border-b border-[#F3F4F6] last:border-0">
              <span className="text-[11px] text-gray-500 font-medium">{label}</span>
              <span className={`text-xs font-semibold ${
                label === 'Allergies' && value !== 'None known' ? 'text-orange-600' : 'text-gray-800'
              }`}>{value}</span>
            </div>
          ))}
        </div>

        {/* Chronic conditions */}
        {patient.chronicConditions?.length > 0 && (
          <div>
            <p className="text-[10px] text-gray-500 font-medium mb-1.5">Chronic Conditions</p>
            <div className="flex flex-wrap gap-1">
              {patient.chronicConditions.map((c) => (
                <span key={c} className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full font-medium">{c}</span>
              ))}
            </div>
          </div>
        )}

        {/* Reason for visit */}
        {patient.reason && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2.5">
            <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wide mb-1">Reason for Visit</p>
            <p className="text-xs text-blue-800 leading-relaxed">{patient.reason}</p>
          </div>
        )}
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

// ─── Vitals ────────────────────────────────────────────────────────────────────

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
              type="text" placeholder={placeholder} value={vitals[key] || ''}
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

// ─── Part 4: Presenting Complaints ────────────────────────────────────────────────

function ComplaintField({ value, onChange }) {
  const appendChip = (chip) => {
    const trimmed = value.trim()
    onChange(trimmed ? `${trimmed}, ${chip}` : chip)
  }
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Presenting Complaints</label>
      <textarea
        rows={2}
        placeholder="Describe the patient's current complaints and symptoms in detail..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276] resize-none"
      />
      <div className="flex flex-wrap gap-1.5 mt-2">
        {COMPLAINT_CHIPS.map((chip) => (
          <button key={chip} type="button" onClick={() => appendChip(chip)}
            className="text-[11px] font-medium px-2.5 py-1 rounded-full border border-[#E5E7EB] text-gray-600 hover:bg-[#EBF5FB] hover:border-[#1A5276] hover:text-[#1A5276] transition-colors">
            + {chip}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Prescription Table ───────────────────────────────────────────────────────────

function PrescriptionTable({ rows, onChange, onAdd, onRemove }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold text-gray-700">Prescription</label>
        <button type="button" onClick={onAdd}
          className="flex items-center gap-1 text-xs font-semibold text-[#1A5276] hover:underline">
          <Plus className="w-3.5 h-3.5" /> Add Medicine
        </button>
      </div>
      <div className="border border-[#E5E7EB] rounded-lg overflow-hidden">
        <div className="grid bg-[#F8F9FA] border-b border-[#E5E7EB]" style={{ gridTemplateColumns: '2fr 1fr 1.2fr 0.6fr 1.2fr 36px' }}>
          {['Medicine', 'Dosage', 'Frequency', 'Days', 'Instructions', ''].map((h) => (
            <div key={h} className="px-2 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">{h}</div>
          ))}
        </div>
        {rows.map((row, i) => (
          <div key={i} className="grid border-b border-[#F3F4F6] last:border-0 items-center"
            style={{ gridTemplateColumns: '2fr 1fr 1.2fr 0.6fr 1.2fr 36px' }}>
            <div className="px-2 py-1.5">
              <input type="text" placeholder="e.g. Paracetamol" value={row.medicine}
                onChange={(e) => onChange(i, 'medicine', e.target.value)}
                className="w-full border border-[#E5E7EB] rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#1A5276]/40 focus:border-[#1A5276]" />
            </div>
            <div className="px-2 py-1.5">
              <input type="text" placeholder="500mg" value={row.dosage}
                onChange={(e) => onChange(i, 'dosage', e.target.value)}
                className="w-full border border-[#E5E7EB] rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#1A5276]/40 focus:border-[#1A5276]" />
            </div>
            <div className="px-2 py-1.5">
              <select value={row.frequency} onChange={(e) => onChange(i, 'frequency', e.target.value)}
                className="w-full border border-[#E5E7EB] rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#1A5276]/40 focus:border-[#1A5276] bg-white">
                {FREQUENCY_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div className="px-2 py-1.5">
              <input type="number" placeholder="5" value={row.days}
                onChange={(e) => onChange(i, 'days', e.target.value)}
                className="w-full border border-[#E5E7EB] rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#1A5276]/40 focus:border-[#1A5276] text-center" />
            </div>
            <div className="px-2 py-1.5">
              <input type="text" placeholder="After meals" value={row.instructions || ''}
                onChange={(e) => onChange(i, 'instructions', e.target.value)}
                className="w-full border border-[#E5E7EB] rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#1A5276]/40 focus:border-[#1A5276]" />
            </div>
            <div className="flex items-center justify-center">
              {rows.length > 1 && (
                <button type="button" onClick={() => onRemove(i)}
                  className="p-1 text-gray-300 hover:text-[#C0392B] transition-colors">
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

// ─── Lab Test Dropdown ──────────────────────────────────────────────────────────

function LabTestDropdown({ selected, onToggle, onClose }) {
  return (
    <div className="absolute right-0 bottom-full mb-2 w-72 bg-white border border-[#E5E7EB] rounded-xl shadow-xl z-20 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB] bg-[#F8F9FA]">
        <p className="text-xs font-semibold text-gray-700">Order Lab Tests</p>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
      </div>
      <div className="divide-y divide-[#F3F4F6]">
        {LAB_TEST_CATALOG.map((test) => {
          const isSel = selected.includes(test.name)
          return (
            <button key={test.name} onClick={() => onToggle(test.name)}
              className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#F8F9FA] transition-colors ${isSel ? 'bg-[#EBF5FB]' : ''}`}>
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  isSel ? 'bg-[#1A5276] border-[#1A5276]' : 'border-[#D1D5DB]'
                }`}>
                  {isSel && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className={`text-xs font-medium ${isSel ? 'text-[#1A5276]' : 'text-gray-700'}`}>{test.name}</span>
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
          <button onClick={onClose}
            className="text-xs font-semibold text-white bg-[#1A5276] px-3 py-1.5 rounded-lg hover:bg-[#154360] transition-colors">
            Confirm Order
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Part 5: Mark Done Action Card ────────────────────────────────────────────────

function SavedActionCard({ patientName, onCallNext, onBreak }) {
  return (
    <div className="mx-5 mb-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
        <p className="text-xs font-semibold text-green-800">Consultation saved for {patientName}</p>
      </div>
      <div className="flex gap-2">
        <button onClick={onBreak}
          className="flex-1 flex items-center justify-center gap-1.5 border border-orange-400 text-orange-600 text-xs font-semibold py-2 rounded-lg hover:bg-orange-50 transition-colors">
          <Coffee className="w-3.5 h-3.5" /> Take a Break
        </button>
        <button onClick={onCallNext}
          className="flex-1 flex items-center justify-center gap-1.5 bg-[#1A5276] text-white text-xs font-semibold py-2 rounded-lg hover:bg-[#154360] transition-colors">
          <ArrowRight className="w-3.5 h-3.5" /> Call Next Patient
        </button>
      </div>
    </div>
  )
}

// ─── Toast ─────────────────────────────────────────────────────────────────────

function Toast({ message, onDone }) {
  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#1A5276] text-white text-sm font-semibold px-5 py-3.5 rounded-xl shadow-2xl"
      style={{ animation: 'fadeInUp 0.3s ease' }}
    >
      <Bell className="w-4 h-4 text-blue-300" />
      {message}
    </div>
  )
}

// ─── Part 6: Print Layout (screen-hidden, print-visible) ───────────────────────────

function PrintLayout({ patient, complaint, diagnosis, rxRows, selectedTests, notes }) {
  const age = patient?.dob ? calcAge(patient.dob) : patient?.age
  return (
    <div id="print-area" className="hidden print:block p-8 font-sans text-gray-900" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Hospital header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
        <div style={{ width: 200, height: 60, background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4 }}>
          <span style={{ color: '#9ca3af', fontSize: 12 }}>Hospital Logo</span>
        </div>
        <div>
          <p style={{ fontWeight: 700, fontSize: 18, margin: 0 }}>Shree Sai Multi-Specialty Hospital</p>
          <p style={{ fontSize: 12, color: '#6b7280', margin: '2px 0 0' }}>Ahmedabad, Gujarat | Ph: +91 98765 43210</p>
        </div>
      </div>
      <hr style={{ borderColor: '#d1d5db', margin: '12px 0' }} />

      {/* Patient section */}
      <div style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 13, margin: '4px 0' }}>
          <strong>Patient Name:</strong> {patient?.name || '—'} &nbsp;|&nbsp;
          <strong>UHID:</strong> {patient?.uhid || '—'}
        </p>
        <p style={{ fontSize: 13, margin: '4px 0' }}>
          <strong>Age:</strong> {age} &nbsp;|&nbsp;
          <strong>Gender:</strong> {patient?.gender} &nbsp;|&nbsp;
          <strong>Date:</strong> {todayStr()}
        </p>
        <p style={{ fontSize: 13, margin: '4px 0' }}>
          <strong>Doctor:</strong> {CURRENT_DOCTOR.name} &nbsp;|&nbsp;
          <strong>Dept:</strong> {CURRENT_DOCTOR.specialty}
        </p>
      </div>
      <hr style={{ borderColor: '#d1d5db', margin: '12px 0' }} />

      {/* Clinical section */}
      <div style={{ marginBottom: 12 }}>
        {patient?.reason && (
          <p style={{ fontSize: 13, margin: '4px 0' }}><strong>Reason for Visit:</strong> {patient.reason}</p>
        )}
        {complaint && (
          <p style={{ fontSize: 13, margin: '4px 0' }}><strong>Presenting Complaints:</strong> {complaint}</p>
        )}
        {diagnosis && (
          <p style={{ fontSize: 13, margin: '4px 0' }}><strong>Diagnosis:</strong> {diagnosis}</p>
        )}
      </div>
      <hr style={{ borderColor: '#d1d5db', margin: '12px 0' }} />

      {/* Prescription table */}
      <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>Prescription</p>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, marginBottom: 16 }}>
        <thead>
          <tr style={{ background: '#f3f4f6' }}>
            {['Medicine', 'Dosage', 'Frequency', 'Days', 'Instructions'].map((h) => (
              <th key={h} style={{ border: '1px solid #d1d5db', padding: '6px 8px', textAlign: 'left' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rxRows.filter((r) => r.medicine).map((r, i) => (
            <tr key={i}>
              <td style={{ border: '1px solid #d1d5db', padding: '6px 8px' }}>{r.medicine}</td>
              <td style={{ border: '1px solid #d1d5db', padding: '6px 8px' }}>{r.dosage}</td>
              <td style={{ border: '1px solid #d1d5db', padding: '6px 8px' }}>{r.frequency}</td>
              <td style={{ border: '1px solid #d1d5db', padding: '6px 8px' }}>{r.days}</td>
              <td style={{ border: '1px solid #d1d5db', padding: '6px 8px' }}>{r.instructions}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Lab tests */}
      {selectedTests.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Lab Tests Ordered</p>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13 }}>
            {selectedTests.map((t) => <li key={t}>{t}</li>)}
          </ul>
        </div>
      )}

      {/* Notes */}
      {notes && (
        <p style={{ fontSize: 13, margin: '8px 0' }}><strong>Additional Notes:</strong> {notes}</p>
      )}

      <hr style={{ borderColor: '#d1d5db', margin: '16px 0' }} />

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 24 }}>
        <p>Next Follow-up: ___________________________</p>
        <p>Doctor Signature: ___________________________</p>
      </div>
      <p style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center' }}>This is a computer generated prescription</p>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OPDDoctor() {
  // Queue state
  const [queuePatients, setQueuePatients] = useState(MY_PATIENTS)
  const [selectedPatient, setSelectedPatient] = useState(
    MY_PATIENTS.find((p) => p.status === 'InConsultation') || MY_PATIENTS[0] || null
  )
  const [queueFilter, setQueueFilter] = useState('All')

  // Break state
  const [isOnBreak, setIsOnBreak] = useState(false)

  // Consultation form state
  const [vitals,    setVitals]    = useState({ bp: '', pulse: '', temp: '', spo2: '', weight: '' })
  const [complaint, setComplaint] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [notes,     setNotes]     = useState('')
  const [whatsapp,  setWhatsapp]  = useState(true)
  const [rxRows,    setRxRows]    = useState([
    { medicine: 'Ibuprofen', dosage: '400mg', frequency: '1-0-1', days: '5', instructions: 'After meals' },
  ])
  const updateVital = (key, val) => setVitals((v) => ({ ...v, [key]: val }))
  const updateRx    = (i, field, val) => setRxRows((r) => r.map((row, idx) => idx === i ? { ...row, [field]: val } : row))
  const addRxRow    = () => setRxRows((r) => [...r, { ...EMPTY_RX_ROW }])
  const removeRx    = (i) => setRxRows((r) => r.filter((_, idx) => idx !== i))

  // Lab tests
  const [showLab,       setShowLab]       = useState(false)
  const [selectedTests, setSelectedTests] = useState([])
  const toggleTest = (name) =>
    setSelectedTests((t) => t.includes(name) ? t.filter((x) => x !== name) : [...t, name])

  // Save / done flow
  const [saved,     setSaved]     = useState(false)
  const [toast,     setToast]     = useState(null)

  const seenCount    = queuePatients.filter((p) => p.status === 'Done').length
  const waitingCount = queuePatients.filter((p) => ['Waiting', 'SentToOPD'].includes(p.status)).length

  // Select patient from queue
  const handleSelectPatient = (p) => {
    setSelectedPatient(p)
    setSaved(false)
    setComplaint('')
    setDiagnosis('')
    setNotes('')
    setRxRows([{ ...EMPTY_RX_ROW }])
    setSelectedTests([])
  }

  // Save & Mark Done
  const handleSave = () => {
    if (!selectedPatient) return
    setQueuePatients((prev) =>
      prev.map((p) => p.id === selectedPatient.id ? { ...p, status: 'Done' } : p)
    )
    setSaved(true)
  }

  // Call Next Patient
  const handleCallNext = () => {
    const nextPatient = queuePatients.find(
      (p) => ['Waiting', 'SentToOPD'].includes(p.status) && p.id !== selectedPatient?.id
    )
    if (nextPatient) {
      setQueuePatients((prev) =>
        prev.map((p) =>
          p.id === nextPatient.id ? { ...p, status: 'SentToOPD' } : p
        )
      )
      setSelectedPatient(nextPatient)
      setSaved(false)
      setComplaint('')
      setDiagnosis('')
      setNotes('')
      setRxRows([{ ...EMPTY_RX_ROW }])
      setSelectedTests([])
      showToast(`Next patient: ${nextPatient.name} (${nextPatient.token}) has been notified`)
    } else {
      showToast('No more patients in queue')
    }
  }

  // Break
  const handleBreak = () => {
    if (selectedPatient && !saved) {
      // Mark current done before break
      setQueuePatients((prev) =>
        prev.map((p) => p.id === selectedPatient.id ? { ...p, status: 'Done' } : p)
      )
    }
    setSaved(false)
    setIsOnBreak(true)
  }

  const handleResume = () => setIsOnBreak(false)

  // Toast helper
  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  // Print
  const handlePrint = () => window.print()

  return (
    <>
      {/* Print-only layout */}
      <PrintLayout
        patient={selectedPatient}
        complaint={complaint}
        diagnosis={diagnosis}
        rxRows={rxRows}
        selectedTests={selectedTests}
        notes={notes}
      />

      {/* Screen layout */}
      <div className="flex flex-col space-y-4 print:hidden">
        {/* Banner */}
        <TopBanner
          patient={selectedPatient}
          isOnBreak={isOnBreak}
          onBreak={handleBreak}
          onResume={handleResume}
          seenCount={seenCount}
          waitingCount={waitingCount}
        />

        {/* Three-column layout: Queue | Info+History | Consultation */}
        <div className="grid gap-4" style={{ gridTemplateColumns: '28% 22% 1fr', minHeight: 0 }}>

          {/* LEFT: Queue panel */}
          <div style={{ height: 'calc(100vh - 64px - 48px - 120px)' }}>
            <QueuePanel
              patients={queuePatients}
              selectedId={selectedPatient?.id}
              onSelect={handleSelectPatient}
              filter={queueFilter}
              onFilter={setQueueFilter}
            />
          </div>

          {/* MIDDLE: Patient info + past visits */}
          <div className="space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 64px - 48px - 120px)' }}>
            <PatientInfoCard patient={selectedPatient} />
            <PastVisitsCard />
          </div>

          {/* RIGHT: Consultation form */}
          <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm flex flex-col overflow-hidden"
            style={{ maxHeight: 'calc(100vh - 64px - 48px - 120px)' }}>
            <div className="px-5 py-4 border-b border-[#E5E7EB] flex-shrink-0">
              <h3 className="text-sm font-bold text-gray-900">Consultation</h3>
              <p className="text-xs text-gray-500 mt-0.5">{CURRENT_DOCTOR.name} · {CURRENT_DOCTOR.specialty} · {CURRENT_DOCTOR.room}</p>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
              <VitalsRow vitals={vitals} onChange={updateVital} />
              <div className="border-t border-[#F3F4F6]" />
              <ComplaintField value={complaint} onChange={setComplaint} />

              {/* Diagnosis */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Diagnosis</label>
                <input type="text" placeholder="Primary diagnosis..."
                  value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276]" />
              </div>

              <PrescriptionTable rows={rxRows} onChange={updateRx} onAdd={addRxRow} onRemove={removeRx} />

              {/* Ordered lab tests summary */}
              {selectedTests.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2 mb-2">
                    <FlaskConical className="w-3.5 h-3.5 text-blue-600" />
                    <p className="text-xs font-semibold text-blue-700">Ordered Lab Tests</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTests.map((t) => (
                      <span key={t} className="text-[11px] bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full font-medium">{t}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Notes */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Additional Notes</label>
                <textarea rows={2} placeholder="Follow-up instructions, diet advice, referrals..."
                  value={notes} onChange={(e) => setNotes(e.target.value)}
                  className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276] resize-none" />
              </div>

              {/* WhatsApp toggle */}
              <div className="flex items-center justify-between bg-[#F8F9FA] rounded-lg px-4 py-3">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  <div>
                    <p className="text-xs font-semibold text-gray-800">Share via WhatsApp</p>
                    <p className="text-[10px] text-gray-500">Send prescription to patient's mobile</p>
                  </div>
                </div>
                <button type="button" onClick={() => setWhatsapp((v) => !v)}
                  className={`relative rounded-full transition-colors flex-shrink-0 ${
                    whatsapp ? 'bg-[#1E8449]' : 'bg-gray-300'
                  }`}
                  style={{ height: '22px', width: '40px' }}>
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    whatsapp ? 'translate-x-5' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>

            {/* Part 5: Saved action card */}
            {saved && (
              <SavedActionCard
                patientName={selectedPatient?.name}
                onCallNext={handleCallNext}
                onBreak={handleBreak}
              />
            )}

            {/* Action buttons */}
            <div className="px-5 py-4 border-t border-[#E5E7EB] flex gap-3 flex-shrink-0">
              {/* Save & Mark Done */}
              {!saved && (
                <button onClick={handleSave}
                  disabled={!selectedPatient}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#1E8449] text-white text-sm font-bold py-3 rounded-lg hover:bg-[#196F3D] transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
                  <Save className="w-4 h-4" /> Save &amp; Mark Done
                </button>
              )}
              {saved && (
                <div className="flex-1 flex items-center justify-center gap-2 bg-green-100 text-green-700 text-sm font-bold py-3 rounded-lg">
                  <CheckCircle2 className="w-4 h-4" /> Saved
                </div>
              )}

              {/* Print button */}
              <button onClick={handlePrint}
                className="flex items-center gap-2 border border-[#1A5276] text-[#1A5276] text-sm font-semibold px-4 py-3 rounded-lg hover:bg-[#EBF5FB] transition-colors">
                <Printer className="w-4 h-4" /> Print
              </button>

              {/* Lab test dropdown */}
              <div className="relative">
                <button onClick={() => setShowLab((v) => !v)}
                  className="flex items-center gap-2 bg-[#1A5276] text-white text-sm font-semibold px-4 py-3 rounded-lg hover:bg-[#154360] transition-colors">
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
                  <LabTestDropdown selected={selectedTests} onToggle={toggleTest} onClose={() => setShowLab(false)} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && <Toast message={toast} />}

      {/* Print CSS */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </>
  )
}
