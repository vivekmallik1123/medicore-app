import { useState, useRef, useEffect } from 'react'
import {
  Plus, X, ChevronRight, Send, Pencil, CheckCircle2, MessageCircle,
  User, Phone, Droplets, Stethoscope, Calendar, Clock, Lock,
  AlertTriangle, Search, ChevronDown, ChevronUp,
} from 'lucide-react'
import StatusBadge from '../components/StatusBadge.jsx'
import {
  PATIENTS, DOCTORS, BLOOD_GROUPS, CHRONIC_CONDITIONS,
  SYMPTOM_TAGS, REFERRAL_SOURCES, DEPARTMENTS,
} from '../data/mockData.js'

// ─── Constants ────────────────────────────────────────────────────────────────

const TOKEN_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-teal-100 text-teal-700',
  'bg-indigo-100 text-indigo-700',
  'bg-cyan-100 text-cyan-700',
]

const DEPT_META = {
  Cardiology:        { color: 'bg-red-100 text-red-700',      icon: '❤️' },
  Orthopedics:       { color: 'bg-orange-100 text-orange-700', icon: '🦴' },
  'General Medicine':{ color: 'bg-blue-100 text-blue-700',    icon: '🏥' },
  Gynecology:        { color: 'bg-pink-100 text-pink-700',     icon: '🌸' },
  Neurology:         { color: 'bg-purple-100 text-purple-700', icon: '🧠' },
}

const DOCTOR_STATUS_DOT = {
  Available: 'bg-green-500',
  InConsult: 'bg-blue-500',
  OnBreak:   'bg-orange-400',
}

const PAST_VISITS = [
  { date: '12 May 2025', doctor: 'Dr. Rajesh Kumar', diagnosis: 'Sprained ankle',  rx: 'Ibuprofen 400mg' },
  { date: '03 Jan 2025', doctor: 'Dr. Anita Patel',  diagnosis: 'Viral fever',      rx: 'Paracetamol 500mg, Rest' },
  { date: '18 Sep 2024', doctor: 'Dr. Anita Patel',  diagnosis: 'Routine checkup',  rx: 'Multivitamins' },
]

// ─── Status badge config ──────────────────────────────────────────────────────

const STATUS_CONFIG = {
  Waiting:         { label: 'Waiting',         cls: 'bg-orange-100 text-orange-700 border border-orange-200' },
  SentToOPD:       { label: 'Sent to OPD',     cls: 'bg-blue-100 text-blue-700 border border-blue-200' },
  InConsultation:  { label: 'In Consultation', cls: 'bg-blue-100 text-blue-700 border border-blue-200', pulse: true },
  Done:            { label: 'Done',             cls: 'bg-green-100 text-green-700 border border-green-200' },
  OnHold:          { label: 'On Hold',          cls: 'bg-gray-100 text-gray-600 border border-gray-200' },
  Emergency:       { label: 'Emergency',        cls: 'bg-red-100 text-red-700 border border-red-200', pulse: true },
}

function QueueBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Waiting
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.cls}`}>
      {cfg.pulse && (
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse ${
          status === 'Emergency' ? 'bg-red-500' : 'bg-green-500'
        }`} />
      )}
      {cfg.label}
    </span>
  )
}

// ─── Part 1: Doctor Availability Strip ───────────────────────────────────────

function DoctorStrip() {
  const [expanded, setExpanded] = useState(false)
  const count = DOCTORS.length
  const isCompact = count > 10
  const showTwo   = count >= 6 && count <= 10

  const visibleDocs = isCompact && !expanded ? DOCTORS.slice(0, 5) : DOCTORS

  const DoctorCard = ({ doc }) => (
    <div className={`flex items-center gap-2 bg-white border border-[#E5E7EB] rounded-lg shadow-sm ${
      isCompact ? 'px-2 py-1' : 'px-3 py-2'
    }`}>
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${DOCTOR_STATUS_DOT[doc.status] || 'bg-gray-400'}`} />
      {isCompact ? (
        <span className="text-xs font-semibold text-gray-800">{doc.name.replace('Dr. ', '')}</span>
      ) : (
        <div>
          <p className="text-xs font-semibold text-gray-800 leading-none">{doc.name}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">{doc.specialty} · {doc.room}</p>
        </div>
      )}
      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ml-1 ${
        doc.status === 'Available' ? 'bg-green-100 text-green-700'
        : doc.status === 'InConsult' ? 'bg-blue-100 text-blue-700'
        : 'bg-orange-100 text-orange-700'
      }`}>
        {doc.status === 'InConsult' ? 'In Consult' : doc.status === 'OnBreak' ? 'On Break' : 'Available'}
      </span>
    </div>
  )

  return (
    <div>
      <div className={`flex gap-2 ${
        showTwo ? 'flex-wrap' : isCompact ? 'flex-wrap' : 'flex-nowrap'
      }`}>
        {visibleDocs.map((doc) => <DoctorCard key={doc.id} doc={doc} />)}
        {isCompact && (
          <button
            onClick={() => setExpanded((e) => !e)}
            className="flex items-center gap-1 px-3 py-1 bg-[#EBF5FB] border border-[#1A5276]/30 text-[#1A5276] text-xs font-semibold rounded-lg hover:bg-[#D6EAF8] transition-colors"
          >
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {expanded ? 'Show less' : `Show all ${count} doctors`}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Queue List ───────────────────────────────────────────────────────────────

const QUEUE_TIMES = [
  '09:00 AM','09:15 AM','09:30 AM','09:45 AM',
  '10:00 AM','10:15 AM','10:30 AM','10:45 AM',
  '11:00 AM','11:15 AM',
]

function QueueList({ patients, selected, onSelect }) {
  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 border-b border-[#E5E7EB] flex items-center justify-between flex-shrink-0">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Patient Queue</p>
        <span className="text-[10px] font-semibold bg-[#1A5276] text-white px-2 py-0.5 rounded-full">
          {patients.length}
        </span>
      </div>
      <div className="overflow-y-auto flex-1">
        {patients.map((p, i) => {
          const isSelected = selected?.id === p.id
          return (
            <button
              key={p.id}
              onClick={() => onSelect(p)}
              className={`w-full text-left px-4 py-3.5 border-b border-[#F3F4F6] last:border-0 transition-all ${
                isSelected
                  ? 'bg-[#EBF5FB] border-l-4 border-l-[#1A5276]'
                  : 'hover:bg-[#F8F9FA] border-l-4 border-l-transparent'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono flex-shrink-0 ${
                    p.status === 'Emergency'
                      ? 'bg-red-100 text-red-700'
                      : TOKEN_COLORS[i % TOKEN_COLORS.length]
                  }`}>
                    {p.token}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {QUEUE_TIMES[i] || '—'}
                    </p>
                  </div>
                </div>
                <QueueBadge status={p.status} />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Patient Detail Panel ─────────────────────────────────────────────────────

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="bg-[#F8F9FA] rounded-lg p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="w-3 h-3 text-gray-400" />
        <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">{label}</p>
      </div>
      <p className="text-sm font-semibold text-gray-900">{value}</p>
    </div>
  )
}

function PatientDetail({ patient, onEdit, onSendToOPD }) {
  if (!patient) {
    return (
      <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm h-full flex items-center justify-center">
        <p className="text-sm text-gray-400">Select a patient to view details</p>
      </div>
    )
  }

  const initials  = patient.name.split(' ').map((n) => n[0]).join('').slice(0, 2)
  const deptMeta  = DEPT_META[patient.department] || { color: 'bg-gray-100 text-gray-700', icon: '🏥' }
  const doctor    = DOCTORS.find((d) => d.specialty === patient.department)
  const canSend   = patient.status === 'Waiting'
  const sentAlready = patient.status === 'SentToOPD'

  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[#E5E7EB] bg-gradient-to-r from-[#EBF5FB] to-white">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#1A5276] text-white flex items-center justify-center text-base font-bold flex-shrink-0">
              {initials}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{patient.name}</h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-xs font-mono font-bold text-[#1A5276] bg-blue-50 px-2 py-0.5 rounded">
                  {patient.token}
                </span>
                {patient.uhid && (
                  <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    {patient.uhid}
                  </span>
                )}
                <QueueBadge status={patient.status} />
              </div>
            </div>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${deptMeta.color}`}>
            {deptMeta.icon} {patient.department}
          </span>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Patient Information</p>
          <div className="grid grid-cols-2 gap-2">
            <InfoRow icon={User}        label="Age"         value={`${patient.age} years`} />
            <InfoRow icon={User}        label="Gender"      value={patient.gender} />
            <InfoRow icon={Phone}       label="Contact"     value={patient.contact} />
            <InfoRow icon={Droplets}    label="Blood Group" value={patient.bloodGroup || '—'} />
            <InfoRow icon={Stethoscope} label="Department"  value={patient.department} />
            <InfoRow icon={User}        label="Doctor"      value={doctor?.name || '—'} />
          </div>
          {patient.allergies && patient.allergies !== 'None' && (
            <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
              <p className="text-[10px] font-semibold text-yellow-700 uppercase tracking-wide">⚠ Allergies</p>
              <p className="text-xs text-yellow-800 mt-0.5">{patient.allergies}</p>
            </div>
          )}
          {patient.chronicConditions?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {patient.chronicConditions.map((c) => (
                <span key={c} className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full font-medium">{c}</span>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Reason for Visit</p>
          <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-lg px-4 py-3">
            <p className="text-sm text-gray-700 leading-relaxed">{patient.reason}</p>
          </div>
        </div>

        {patient.lastVisit && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
            <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wide mb-1">Last Visit</p>
            <p className="text-xs text-blue-800 font-medium">{patient.lastVisit.date}</p>
            <p className="text-[10px] text-blue-600 mt-0.5">{patient.lastVisit.doctor}</p>
          </div>
        )}

        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Past Visits</p>
          <div className="space-y-2">
            {PAST_VISITS.map((v, i) => (
              <div key={i} className="flex items-start gap-3 bg-[#F8F9FA] rounded-lg px-4 py-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#1A5276] mt-1.5 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-800">{v.date}</span>
                    <span className="text-[10px] text-gray-400">{v.doctor}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">{v.diagnosis}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{v.rx}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="px-6 py-4 border-t border-[#E5E7EB] flex gap-3 flex-shrink-0">
        {canSend && (
          <button
            onClick={() => onSendToOPD(patient.id)}
            className="flex-1 flex items-center justify-center gap-2 bg-[#1A5276] text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-[#154360] transition-colors shadow-sm"
          >
            <Send className="w-4 h-4" />
            Send to OPD
          </button>
        )}
        {sentAlready && (
          <button
            disabled
            className="flex-1 flex items-center justify-center gap-2 bg-green-100 text-green-700 text-sm font-semibold py-2.5 rounded-lg cursor-not-allowed"
          >
            <CheckCircle2 className="w-4 h-4" />
            Sent ✓
          </button>
        )}
        {!canSend && !sentAlready && (
          <div className="flex-1" />
        )}
        <button
          onClick={() => onEdit(patient)}
          className="flex items-center justify-center gap-2 border border-[#E5E7EB] text-gray-600 text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-[#F8F9FA] transition-colors"
        >
          <Pencil className="w-4 h-4" />
          Edit Details
        </button>
      </div>
    </div>
  )
}

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

function validateMobile(raw) {
  const stripped = raw.replace(/^\+91/, '').replace(/\s/g, '')
  if (!/^[6-9]\d{9}$/.test(stripped)) return { valid: false, stripped }
  return { valid: true, stripped }
}

function validateDob(dob) {
  if (!dob) return null
  const today = new Date(); today.setHours(0,0,0,0)
  const birth = new Date(dob)
  if (birth >= today) return 'Date of birth cannot be a future date'
  const minDate = new Date(today)
  minDate.setFullYear(minDate.getFullYear() - 120)
  if (birth < minDate) return 'Date of birth cannot be more than 120 years ago'
  return null
}

function generateUHID(existingCount) {
  return `PT-${String(existingCount + 1).padStart(6, '0')}`
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

const STEPS = ['Patient Info', 'Appointment', 'Confirmation']

function ProgressBar({ step }) {
  return (
    <div className="flex items-center gap-0 mb-6">
      {STEPS.map((label, i) => {
        const idx    = i + 1
        const done   = step > idx
        const active = step === idx
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                done   ? 'bg-[#1E8449] border-[#1E8449] text-white'
                : active ? 'bg-[#1A5276] border-[#1A5276] text-white'
                : 'bg-white border-[#E5E7EB] text-gray-400'
              }`}>
                {done ? <CheckCircle2 className="w-4 h-4" /> : idx}
              </div>
              <span className={`text-[10px] mt-1 font-medium whitespace-nowrap ${
                active ? 'text-[#1A5276]' : done ? 'text-[#1E8449]' : 'text-gray-400'
              }`}>{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mb-4 transition-all ${
                step > idx ? 'bg-[#1E8449]' : 'bg-[#E5E7EB]'
              }`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Emergency Mini-Form ──────────────────────────────────────────────────────

function EmergencyForm({ onRegister, onCancel }) {
  const [f, setF] = useState({ name: '', mobile: '', age: '', reason: '' })
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }))
  const valid = f.name && f.mobile && f.age && f.reason

  return (
    <div className="mt-4 border-2 border-red-300 rounded-xl p-4 bg-red-50 space-y-3">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-red-600" />
        <p className="text-sm font-bold text-red-700">Emergency Registration</p>
      </div>
      <input
        type="text" placeholder="Patient Name *"
        value={f.name} onChange={(e) => set('name', e.target.value)}
        className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 bg-white"
      />
      <input
        type="tel" placeholder="Mobile Number *"
        value={f.mobile} onChange={(e) => set('mobile', e.target.value)}
        className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 bg-white"
      />
      <input
        type="number" placeholder="Age *" min="0" max="120"
        value={f.age} onChange={(e) => set('age', e.target.value)}
        className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 bg-white"
      />
      <textarea
        rows={2} placeholder="Emergency Reason *"
        value={f.reason} onChange={(e) => set('reason', e.target.value)}
        className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 bg-white resize-none"
      />
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 border border-gray-300 text-gray-600 text-sm font-medium py-2 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          disabled={!valid}
          onClick={() => onRegister(f)}
          className="flex-1 bg-red-600 text-white text-sm font-bold py-2 rounded-lg hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Register Emergency Patient
        </button>
      </div>
    </div>
  )
}

// ─── Returning Patient Search ─────────────────────────────────────────────────

function ReturningSearch({ allPatients, onSelect }) {
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState([])

  useEffect(() => {
    if (query.trim().length < 3) { setResults([]); return }
    const q = query.toLowerCase()
    setResults(
      allPatients.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.contact.replace(/\s/g, '').includes(q.replace(/\s/g, '')) ||
          (p.uhid && p.uhid.toLowerCase().includes(q))
      ).slice(0, 6)
    )
  }, [query, allPatients])

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, mobile number, or Patient ID..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full border border-[#E5E7EB] rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276]"
        />
      </div>
      {query.length >= 3 && results.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-4">No patients found</p>
      )}
      {results.length > 0 && (
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {results.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelect(p)}
              className="w-full text-left bg-[#F8F9FA] hover:bg-[#EBF5FB] border border-[#E5E7EB] hover:border-[#1A5276]/30 rounded-lg px-4 py-3 transition-all"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                <span className="text-[10px] font-mono text-[#1A5276] bg-blue-50 px-2 py-0.5 rounded">{p.uhid}</span>
              </div>
              <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-500">
                <span>{p.age} yrs · {p.gender}</span>
                <span>·</span>
                <span>{p.contact}</span>
                {p.lastVisit && <><span>·</span><span>Last: {p.lastVisit.date}</span></>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Step 1: Patient Info Form ────────────────────────────────────────────────

function Step1Form({ form, setForm, isReturning, editMode }) {
  const [showEmergency, setShowEmergency] = useState(false)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const mobileResult = form.mobile ? validateMobile(form.mobile) : null
  const dobError     = form.dob ? validateDob(form.dob) : null
  const age          = form.dob && !dobError ? calcAge(form.dob) : null

  const toggleCondition = (c) => {
    const curr = form.chronicConditions || []
    if (c === 'None of the above') {
      set('chronicConditions', curr.includes(c) ? [] : ['None of the above'])
      return
    }
    const without = curr.filter((x) => x !== 'None of the above')
    set('chronicConditions', without.includes(c) ? without.filter((x) => x !== c) : [...without, c])
  }

  const appendSymptom = (tag) => {
    const cur = form.reason || ''
    set('reason', cur ? `${cur.trimEnd()}, ${tag}` : tag)
  }

  return (
    <div className="space-y-4">
      {/* Full Name */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Full Name *</label>
        {editMode && isReturning ? (
          <input type="text" value={form.name} readOnly
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
        ) : (
          <input type="text" placeholder="e.g. Ramesh Patel" value={form.name}
            onChange={(e) => set('name', e.target.value)}
            className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276]" />
        )}
      </div>

      {/* UHID (edit mode only) */}
      {editMode && (
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
            <Lock className="w-3 h-3" /> UHID (read-only)
          </label>
          <input type="text" value={form.uhid || ''} readOnly
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-100 text-gray-400 cursor-not-allowed font-mono" />
        </div>
      )}

      {/* Mobile */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Mobile Number *</label>
        <div className="relative">
          <input type="tel" placeholder="98765 43210" value={form.mobile}
            onChange={(e) => set('mobile', e.target.value)}
            className={`w-full border rounded-lg px-3 py-2.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 ${
              mobileResult
                ? mobileResult.valid ? 'border-green-400 focus:border-green-400' : 'border-red-400 focus:border-red-400'
                : 'border-[#E5E7EB] focus:border-[#1A5276]'
            }`} />
          {mobileResult?.valid && (
            <CheckCircle2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
          )}
        </div>
        {mobileResult && !mobileResult.valid && (
          <p className="text-xs text-red-500 mt-1">Please enter a valid 10-digit Indian mobile number</p>
        )}
      </div>

      {/* DOB */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Date of Birth *</label>
        <input type="date" value={form.dob}
          onChange={(e) => set('dob', e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 ${
            dobError ? 'border-red-400 focus:border-red-400' : 'border-[#E5E7EB] focus:border-[#1A5276]'
          }`} />
        {dobError && <p className="text-xs text-red-500 mt-1">{dobError}</p>}
        {age !== null && !dobError && (
          <p className="text-xs text-gray-400 mt-1">Age: {age} years</p>
        )}
      </div>

      {/* Gender */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">Gender *</label>
        <div className="flex gap-3">
          {['Male', 'Female', 'Other'].map((g) => (
            <label key={g} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer text-sm font-medium transition-all ${
              form.gender === g
                ? 'border-[#1A5276] bg-[#EBF5FB] text-[#1A5276]'
                : 'border-[#E5E7EB] text-gray-600 hover:bg-[#F8F9FA]'
            }`}>
              <input type="radio" name="gender" value={g} checked={form.gender === g}
                onChange={() => set('gender', g)} className="sr-only" />
              {form.gender === g && <CheckCircle2 className="w-3.5 h-3.5" />}
              {g}
            </label>
          ))}
        </div>
      </div>

      {/* Blood Group */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Blood Group <span className="text-gray-400 font-normal">(optional)</span></label>
        <select value={form.bloodGroup || ''} onChange={(e) => set('bloodGroup', e.target.value)}
          className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276] bg-white">
          <option value="">Select blood group...</option>
          {BLOOD_GROUPS.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      {/* Allergies */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Known Allergies <span className="text-gray-400 font-normal">(optional)</span></label>
        <input type="text" placeholder="e.g. Penicillin, Dust, Pollen"
          value={form.allergies || ''} onChange={(e) => set('allergies', e.target.value)}
          className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276]" />
      </div>

      {/* Chronic Conditions */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">Chronic Conditions <span className="text-gray-400 font-normal">(optional)</span></label>
        <div className="flex flex-wrap gap-2">
          {CHRONIC_CONDITIONS.map((c) => {
            const sel = (form.chronicConditions || []).includes(c)
            return (
              <button key={c} type="button" onClick={() => toggleCondition(c)}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                  sel ? 'border-[#1A5276] bg-[#EBF5FB] text-[#1A5276]' : 'border-[#E5E7EB] text-gray-600 hover:bg-[#F8F9FA]'
                }`}>
                {c}
              </button>
            )
          })}
        </div>
      </div>

      {/* Reason for Visit */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Reason for Visit *</label>
        <textarea rows={3} placeholder="Describe the reason for visit..."
          value={form.reason || ''} onChange={(e) => set('reason', e.target.value)}
          className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276] resize-none" />
        <div className="flex flex-wrap gap-1.5 mt-2">
          {SYMPTOM_TAGS.map((tag) => (
            <button key={tag} type="button" onClick={() => appendSymptom(tag)}
              className="text-[10px] px-2.5 py-1 rounded-full border border-[#E5E7EB] text-gray-500 hover:bg-[#EBF5FB] hover:border-[#1A5276]/30 hover:text-[#1A5276] transition-all">
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Referral Source */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-0.5">How did you hear about us? <span className="text-gray-400 font-normal">(optional)</span></label>
        <p className="text-[10px] text-gray-400 mb-2">Help us understand how patients find us</p>
        <div className="flex flex-wrap gap-2">
          {REFERRAL_SOURCES.map((src) => {
            const sel = form.referralSource === src
            return (
              <button key={src} type="button"
                onClick={() => set('referralSource', sel ? '' : src)}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                  sel ? 'border-[#1A5276] bg-[#EBF5FB] text-[#1A5276]' : 'border-[#E5E7EB] text-gray-600 hover:bg-[#F8F9FA]'
                }`}>
                {src}
              </button>
            )
          })}
        </div>
        {form.referralSource === 'Doctor Referral' && (
          <input type="text" placeholder="Referring Doctor Name"
            value={form.referringDoctor || ''} onChange={(e) => set('referringDoctor', e.target.value)}
            className="mt-2 w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276]" />
        )}
      </div>

      {/* Emergency Contact */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Emergency Contact <span className="text-gray-400 font-normal">(optional)</span></label>
        <div className="grid grid-cols-2 gap-3">
          <input type="text" placeholder="Contact Name"
            value={form.emergencyContact?.name || ''}
            onChange={(e) => set('emergencyContact', { ...form.emergencyContact, name: e.target.value })}
            className="border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276]" />
          <input type="tel" placeholder="Contact Number"
            value={form.emergencyContact?.number || ''}
            onChange={(e) => set('emergencyContact', { ...form.emergencyContact, number: e.target.value })}
            className="border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276]" />
        </div>
      </div>

      {/* Emergency mode toggle */}
      {!editMode && !showEmergency && (
        <button type="button" onClick={() => setShowEmergency(true)}
          className="text-xs text-red-500 hover:text-red-700 font-semibold underline underline-offset-2 mt-1">
          🚨 Emergency Registration
        </button>
      )}
      {showEmergency && (
        <EmergencyForm
          onCancel={() => setShowEmergency(false)}
          onRegister={(ef) => {
            setForm((f) => ({
              ...f,
              name: ef.name, mobile: ef.mobile,
              age: ef.age, reason: ef.reason,
              isEmergency: true,
            }))
            setShowEmergency(false)
          }}
        />
      )}
    </div>
  )
}

// ─── Step 2: Appointment Details ──────────────────────────────────────────────

function Step2Form({ form, setForm, isReturning }) {
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const deptDoctors = DOCTORS.filter(
    (d) => !form.department || d.specialty === form.department
  )

  const apptTypes = [
    {
      key: 'OPD',
      title: 'OPD Consultation',
      desc: 'Regular outpatient visit',
      border: 'border-[#1A5276]',
      bg: 'bg-[#EBF5FB]',
      show: true,
    },
    {
      key: 'Follow-up',
      title: 'Follow-up Visit',
      desc: 'Returning for same condition. Previous history will be shown to doctor.',
      border: 'border-[#1A5276]',
      bg: 'bg-[#EBF5FB]',
      show: isReturning,
    },
    {
      key: 'Emergency',
      title: 'Emergency',
      desc: 'Immediate attention required. Patient will be prioritized.',
      border: 'border-red-500',
      bg: 'bg-red-50',
      show: true,
      warning: 'Patient will skip queue',
    },
  ].filter((t) => t.show)

  return (
    <div className="space-y-5">
      <p className="text-[10px] text-gray-400 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
        ℹ This step is for reception staff only
      </p>

      {/* Appointment type cards */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">Appointment Type</label>
        <div className="space-y-2">
          {apptTypes.map((t) => {
            const sel = form.apptType === t.key
            return (
              <button key={t.key} type="button" onClick={() => set('apptType', t.key)}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                  sel
                    ? `${t.border} ${t.bg}`
                    : 'border-[#E5E7EB] hover:bg-[#F8F9FA]'
                }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-semibold ${
                      sel
                        ? t.key === 'Emergency' ? 'text-red-700' : 'text-[#1A5276]'
                        : 'text-gray-800'
                    }`}>{t.title}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{t.desc}</p>
                    {sel && t.warning && (
                      <p className="text-[10px] text-red-600 font-semibold mt-1">⚠ {t.warning}</p>
                    )}
                  </div>
                  {sel && <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${
                    t.key === 'Emergency' ? 'text-red-500' : 'text-[#1A5276]'
                  }`} />}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Department grid */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">Department *</label>
        <div className="grid grid-cols-3 gap-2">
          {DEPARTMENTS.map((dept) => {
            const meta = DEPT_META[dept.name] || { icon: '🏥', color: '' }
            const sel  = form.department === dept.name
            const docCount = DOCTORS.filter((d) => d.specialty === dept.name).length
            return (
              <button key={dept.name} type="button"
                onClick={() => { set('department', dept.name); set('doctor', '') }}
                className={`flex flex-col items-center gap-1 px-2 py-3 rounded-xl border-2 text-center transition-all ${
                  sel
                    ? 'border-[#1A5276] bg-[#1A5276] shadow-sm'
                    : 'border-[#E5E7EB] hover:bg-[#F8F9FA]'
                }`}>
                <span className="text-xl">{meta.icon}</span>
                <span className={`text-[10px] font-semibold leading-tight ${
                  sel ? 'text-white' : 'text-gray-700'
                }`}>{dept.name}</span>
                <span className={`text-[9px] ${
                  sel ? 'text-blue-200' : 'text-gray-400'
                }`}>{docCount} doctor{docCount !== 1 ? 's' : ''}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Doctor selector */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Assign Doctor</label>
        <div className="space-y-2">
          {deptDoctors.length === 0 && (
            <p className="text-xs text-gray-400">Select a department first</p>
          )}
          {deptDoctors.map((d) => {
            const sel = form.doctor === d.name
            return (
              <button key={d.id} type="button" onClick={() => set('doctor', d.name)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
                  sel ? 'border-[#1A5276] bg-[#EBF5FB]' : 'border-[#E5E7EB] hover:bg-[#F8F9FA]'
                }`}>
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${DOCTOR_STATUS_DOT[d.status] || 'bg-gray-400'}`} />
                <div className="flex-1 text-left">
                  <p className={`text-sm font-semibold ${
                    sel ? 'text-[#1A5276]' : 'text-gray-800'
                  }`}>{d.name}</p>
                  <p className="text-[10px] text-gray-400">{d.specialty} · Queue: {d.patients}</p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  d.status === 'Available' ? 'bg-green-100 text-green-700'
                  : d.status === 'InConsult' ? 'bg-blue-100 text-blue-700'
                  : 'bg-orange-100 text-orange-700'
                }`}>
                  {d.status === 'InConsult' ? 'In Consult' : d.status === 'OnBreak' ? 'On Break' : 'Available'}
                </span>
                {sel && <CheckCircle2 className="w-4 h-4 text-[#1A5276] flex-shrink-0" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Time slot */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">Time Slot</label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: 'morning', label: 'Morning', sub: '9AM – 1PM' },
            { key: 'evening', label: 'Evening', sub: '4PM – 8PM' },
          ].map((slot) => {
            const sel = form.timeSlot === slot.key
            return (
              <button key={slot.key} type="button" onClick={() => set('timeSlot', slot.key)}
                className={`flex flex-col items-center py-3 rounded-xl border-2 transition-all ${
                  sel ? 'border-[#1A5276] bg-[#EBF5FB]' : 'border-[#E5E7EB] hover:bg-[#F8F9FA]'
                }`}>
                <span className="text-lg">{slot.key === 'morning' ? '🌅' : '🌆'}</span>
                <span className={`text-sm font-semibold mt-1 ${
                  sel ? 'text-[#1A5276]' : 'text-gray-700'
                }`}>{slot.label}</span>
                <span className={`text-[10px] ${
                  sel ? 'text-[#1A5276]/70' : 'text-gray-400'
                }`}>{slot.sub}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  name: '', mobile: '', dob: '', gender: 'Male', reason: '',
  bloodGroup: '', allergies: '', chronicConditions: [],
  referralSource: '', referringDoctor: '',
  emergencyContact: { name: '', number: '' },
  department: '', doctor: '', apptType: 'OPD', timeSlot: 'morning',
  isEmergency: false,
}

function PatientModal({ onClose, onAdd, onUpdate, editPatient, allPatients }) {
  const isEditMode = !!editPatient

  const [mode, setMode]   = useState('new')   // 'new' | 'returning'
  const [step, setStep]   = useState(1)
  const [form, setForm]   = useState(
    isEditMode
      ? {
          ...EMPTY_FORM,
          ...editPatient,
          mobile: editPatient.contact || '',
          emergencyContact: editPatient.emergencyContact || { name: '', number: '' },
          chronicConditions: editPatient.chronicConditions || [],
        }
      : EMPTY_FORM
  )
  const [token, setToken]       = useState('')
  const [uhid, setUhid]         = useState('')
  const [isReturning, setIsReturning] = useState(false)
  const [returnPatient, setReturnPatient] = useState(null)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSelectReturning = (p) => {
    setReturnPatient(p)
    setIsReturning(true)
    setForm({
      ...EMPTY_FORM,
      name:              p.name,
      mobile:            p.contact,
      dob:               p.dob || '',
      gender:            p.gender,
      bloodGroup:        p.bloodGroup || '',
      allergies:         p.allergies || '',
      chronicConditions: p.chronicConditions || [],
      referralSource:    p.referralSource || '',
      referringDoctor:   p.referringDoctor || '',
      emergencyContact:  p.emergencyContact || { name: '', number: '' },
      uhid:              p.uhid,
      reason:            '',
      department:        '',
      doctor:            '',
      apptType:          'Follow-up',
      timeSlot:          'morning',
    })
    setStep(1)
  }

  const mobileOk = form.mobile ? validateMobile(form.mobile).valid : false
  const dobErr   = form.dob ? validateDob(form.dob) : null
  const step1Valid = form.name && mobileOk && form.dob && !dobErr && form.reason

  const handleBook = () => {
    const num = String(Math.floor(Math.random() * 900) + 11).padStart(3, '0')
    const tok = `T-${num}`
    const newUhid = isReturning
      ? (returnPatient?.uhid || form.uhid || '')
      : generateUHID(allPatients.length)
    setToken(tok)
    setUhid(newUhid)
    if (isEditMode) {
      onUpdate && onUpdate({ ...editPatient, ...form, contact: form.mobile })
    } else {
      onAdd && onAdd({
        ...form,
        token: tok,
        uhid: newUhid,
        contact: form.mobile,
        status: form.isEmergency ? 'Emergency' : 'Waiting',
        isReturning,
      })
    }
    setStep(3)
  }

  const handleSaveEdit = () => {
    onUpdate && onUpdate({ ...editPatient, ...form, contact: form.mobile })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)' }}
      onMouseDown={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full flex flex-col"
        style={{ maxWidth: '620px', maxHeight: '92vh' }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] flex-shrink-0">
          <div>
            {isEditMode ? (
              <>
                <h3 className="text-base font-bold text-gray-900">
                  Editing Patient: {editPatient.name}
                </h3>
                <p className="text-xs text-gray-400 font-mono mt-0.5">{editPatient.uhid}</p>
              </>
            ) : (
              <>
                <h3 className="text-base font-bold text-gray-900">Register Patient</h3>
                {step < 3 && (
                  <p className="text-xs text-gray-500 mt-0.5">Step {step} of {STEPS.length}</p>
                )}
              </>
            )}
          </div>
          <button onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode tabs (new registration only, step 1) */}
        {!isEditMode && step === 1 && (
          <div className="flex border-b border-[#E5E7EB] px-6 flex-shrink-0">
            {['new', 'returning'].map((m) => (
              <button key={m} onClick={() => { setMode(m); setIsReturning(false); setReturnPatient(null); setForm(EMPTY_FORM) }}
                className={`py-3 px-4 text-sm font-semibold border-b-2 transition-all ${
                  mode === m
                    ? 'border-[#1A5276] text-[#1A5276]'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}>
                {m === 'new' ? 'New Patient' : 'Returning Patient'}
              </button>
            ))}
          </div>
        )}

        <div className="px-6 pt-5 pb-6 overflow-y-auto flex-1">
          {/* Returning patient search */}
          {!isEditMode && mode === 'returning' && step === 1 && !isReturning && (
            <ReturningSearch allPatients={allPatients} onSelect={handleSelectReturning} />
          )}

          {/* Returning patient selected — show badge + last visit */}
          {!isEditMode && isReturning && returnPatient && step === 1 && (
            <div className="mb-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold bg-green-100 text-green-700 border border-green-200 px-2.5 py-1 rounded-full">
                  ✓ Returning Patient
                </span>
                <button onClick={() => { setIsReturning(false); setReturnPatient(null); setForm(EMPTY_FORM) }}
                  className="text-[10px] text-gray-400 hover:text-gray-600 underline">Change</button>
              </div>
              {returnPatient.lastVisit && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
                  <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wide">Last Visit Summary</p>
                  <p className="text-xs text-blue-800 font-medium mt-1">{returnPatient.lastVisit.date}</p>
                  <p className="text-[10px] text-blue-600">{returnPatient.lastVisit.doctor}</p>
                </div>
              )}
            </div>
          )}

          {/* Show form steps when: new mode, or returning + patient selected */}
          {(mode === 'new' || isReturning || isEditMode) && (
            <>
              {!isEditMode && <ProgressBar step={step} />}

              {/* Step 1 */}
              {step === 1 && (
                <>
                  <p className="text-sm font-bold text-gray-800 mb-4">Patient Information</p>
                  <Step1Form
                    form={form} setForm={setForm}
                    isReturning={isReturning} editMode={isEditMode}
                  />
                  <div className="mt-5 space-y-2">
                    {isEditMode ? (
                      <button onClick={handleSaveEdit}
                        className="w-full flex items-center justify-center gap-2 bg-[#1A5276] text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-[#154360] transition-colors">
                        <CheckCircle2 className="w-4 h-4" /> Save Changes
                      </button>
                    ) : (
                      <button
                        onClick={() => setStep(2)}
                        disabled={!step1Valid}
                        className="w-full flex items-center justify-center gap-2 bg-[#1A5276] text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-[#154360] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Next Step <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <>
                  <p className="text-sm font-bold text-gray-800 mb-4">Appointment Details</p>
                  <Step2Form form={form} setForm={setForm} isReturning={isReturning} />
                  <div className="flex gap-3 mt-5">
                    <button onClick={() => setStep(1)}
                      className="flex-1 border border-[#E5E7EB] text-gray-600 text-sm font-medium py-2.5 rounded-lg hover:bg-[#F8F9FA] transition-colors">
                      Back
                    </button>
                    <button
                      onClick={handleBook}
                      disabled={!form.department}
                      className="flex-1 flex items-center justify-center gap-2 bg-[#1A5276] text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-[#154360] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Calendar className="w-4 h-4" />
                      Generate Token &amp; Book
                    </button>
                  </div>
                </>
              )}

              {/* Step 3 — Confirmation */}
              {step === 3 && (
                <div className="flex flex-col items-center text-center py-4 space-y-5">
                  <div className={`w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center ${
                    form.isEmergency
                      ? 'bg-red-50 border-red-500'
                      : 'bg-[#EBF5FB] border-[#1A5276]'
                  }`}>
                    <p className={`text-[10px] font-semibold uppercase tracking-widest ${
                      form.isEmergency ? 'text-red-600' : 'text-[#1A5276]'
                    }`}>Token</p>
                    <p className={`text-3xl font-black leading-none mt-0.5 ${
                      form.isEmergency ? 'text-red-600' : 'text-[#1A5276]'
                    }`}>{token}</p>
                    {form.isEmergency && (
                      <span className="text-[9px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full mt-1 animate-pulse">EMERGENCY</span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-lg font-bold text-gray-900">{form.name}</h4>
                    <p className="text-xs font-mono text-gray-400 mt-0.5">{uhid}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {form.department} · {form.doctor || 'Doctor TBD'} · {form.timeSlot === 'morning' ? 'Morning 9AM–1PM' : 'Evening 4PM–8PM'}
                    </p>
                    {isReturning && (
                      <span className="inline-block mt-2 text-xs font-semibold bg-green-100 text-green-700 border border-green-200 px-2.5 py-1 rounded-full">
                        ✓ Returning Patient — No new UHID generated
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-3 w-full">
                    <CheckCircle2 className="w-4 h-4 text-[#1E8449] flex-shrink-0" />
                    <div className="text-left">
                      <p className="text-xs font-semibold text-green-800">Registration successful</p>
                      <p className="text-[10px] text-green-600 mt-0.5">
                        WhatsApp confirmation sent to {form.mobile || "patient's mobile"}
                      </p>
                    </div>
                    <MessageCircle className="w-4 h-4 text-[#25D366] ml-auto flex-shrink-0" />
                  </div>

                  <div className="flex gap-3 w-full">
                    <button
                      onClick={() => { setStep(1); setForm(EMPTY_FORM); setMode('new'); setIsReturning(false); setReturnPatient(null) }}
                      className="flex-1 bg-[#1A5276] text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-[#154360] transition-colors"
                    >
                      Register Another Patient
                    </button>
                    <button onClick={onClose}
                      className="flex-1 border border-[#E5E7EB] text-gray-600 text-sm font-medium py-2.5 rounded-lg hover:bg-[#F8F9FA] transition-colors">
                      Close
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const DEFAULT_PATIENT = PATIENTS.find((p) => p.name === 'Anjali Mehta') || PATIENTS[0]

export default function Reception() {
  const [patients, setPatients]   = useState(PATIENTS)
  const [selected, setSelected]   = useState(DEFAULT_PATIENT)
  const [showModal, setShowModal] = useState(false)
  const [editPatient, setEditPatient] = useState(null)

  const handleAddPatient = (formData) => {
    const age = formData.dob ? calcAge(formData.dob) : (parseInt(formData.age) || 0)
    const newPatient = {
      id:                patients.length + 1,
      token:             formData.token,
      uhid:              formData.uhid,
      name:              formData.name,
      age,
      dob:               formData.dob || '',
      gender:            formData.gender,
      department:        formData.department,
      status:            formData.status || 'Waiting',
      contact:           formData.contact || formData.mobile,
      reason:            formData.reason,
      bloodGroup:        formData.bloodGroup || '—',
      allergies:         formData.allergies || 'None',
      chronicConditions: formData.chronicConditions || [],
      referralSource:    formData.referralSource || '',
      referringDoctor:   formData.referringDoctor || '',
      emergencyContact:  formData.emergencyContact || { name: '', number: '' },
      lastVisit:         null,
    }
    // Emergency patients go to top of queue
    if (formData.status === 'Emergency') {
      setPatients((prev) => [newPatient, ...prev])
    } else {
      setPatients((prev) => [...prev, newPatient])
    }
    setSelected(newPatient)
  }

  const handleUpdatePatient = (updated) => {
    setPatients((prev) => prev.map((p) => p.id === updated.id ? { ...p, ...updated } : p))
    setSelected((s) => s?.id === updated.id ? { ...s, ...updated } : s)
    setEditPatient(null)
    setShowModal(false)
  }

  const handleSendToOPD = (id) => {
    setPatients((prev) => prev.map((p) => p.id === id ? { ...p, status: 'SentToOPD' } : p))
    setSelected((s) => s?.id === id ? { ...s, status: 'SentToOPD' } : s)
  }

  const handleEdit = (patient) => {
    setEditPatient(patient)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditPatient(null)
  }

  return (
    <>
      <div className="flex flex-col h-full space-y-4" style={{ height: 'calc(100vh - 64px - 48px)' }}>
        {/* Top bar */}
        <div className="flex items-start justify-between flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Reception</h2>
            <p className="text-xs text-gray-500 mt-0.5">{patients.length} patients in queue today</p>
          </div>
          <button
            type="button"
            onClick={() => { setEditPatient(null); setShowModal(true) }}
            className="flex items-center gap-2 bg-[#1A5276] text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-[#154360] transition-colors shadow-sm flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            New Patient
          </button>
        </div>

        {/* Doctor availability strip */}
        <div className="flex-shrink-0">
          <DoctorStrip />
        </div>

        {/* Split layout */}
        <div className="grid grid-cols-5 gap-4 flex-1 min-h-0">
          <div className="col-span-2 min-h-0">
            <QueueList patients={patients} selected={selected} onSelect={setSelected} />
          </div>
          <div className="col-span-3 min-h-0">
            <PatientDetail
              patient={selected}
              onEdit={handleEdit}
              onSendToOPD={handleSendToOPD}
            />
          </div>
        </div>
      </div>

      {showModal && (
        <PatientModal
          onClose={handleCloseModal}
          onAdd={handleAddPatient}
          onUpdate={handleUpdatePatient}
          editPatient={editPatient}
          allPatients={patients}
        />
      )}
    </>
  )
}
