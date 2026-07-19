/**
 * Reception.jsx
 * -------------
 * Reception module - connected to Supabase.
 *
 * CodeRabbit fixes applied in this file:
 * - Fix 5: Emergency form now collects date_of_birth (not age);
 *   Emergency appt type correctly sets is_emergency = true;
 *   queue sorted so emergency patients always appear first.
 * - Fix 6: Edit flow validates name, mobile, and DOB before enabling Save.
 * - Fix 7: Unique-violation error (code 23505) caught and shown as a
 *   friendly duplicate-mobile message. Duplicate check also runs on edits.
 * - Fix 8: Manual audit_logs INSERT removed - the Postgres trigger handles
 *   it atomically as part of the same transaction.
 * - Fix 9: After update, local state is replaced with the fresh Supabase
 *   row (from .select().single()) instead of a manual merge.
 */

import { useState, useEffect, useCallback } from 'react'
import {
  Plus, X, ChevronRight, Send, Pencil, CheckCircle2, MessageCircle,
  User, Phone, Stethoscope, Calendar, Clock,
  AlertTriangle, Search, ChevronDown, ChevronUp, AlertCircle,
} from 'lucide-react'
import {
  DOCTORS, SYMPTOM_TAGS, REFERRAL_SOURCES, DEPARTMENTS,
} from '../data/mockData.js'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../context/AuthContext.jsx'

// --- Constants ---------------------------------------------------------------

const TOKEN_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-teal-100 text-teal-700',
  'bg-indigo-100 text-indigo-700',
  'bg-cyan-100 text-cyan-700',
]

const DEPT_META = {
  Cardiology:         { color: 'bg-red-100 text-red-700',      icon: '\u2764\ufe0f' },
  Orthopedics:        { color: 'bg-orange-100 text-orange-700', icon: '\ud83e\uddb4' },
  'General Medicine': { color: 'bg-blue-100 text-blue-700',    icon: '\ud83c\udfe5' },
  Gynecology:         { color: 'bg-pink-100 text-pink-700',     icon: '\ud83c\udf38' },
  Neurology:          { color: 'bg-purple-100 text-purple-700', icon: '\ud83e\udde0' },
}

const DOCTOR_STATUS_DOT = {
  Available: 'bg-green-500',
  InConsult: 'bg-blue-500',
  OnBreak:   'bg-orange-400',
}

const PAST_VISITS = [
  { date: '12 May 2025', doctor: 'Dr. Rajesh Kumar', diagnosis: 'Sprained ankle', rx: 'Ibuprofen 400mg' },
  { date: '03 Jan 2025', doctor: 'Dr. Anita Patel',  diagnosis: 'Viral fever',     rx: 'Paracetamol 500mg, Rest' },
  { date: '18 Sep 2024', doctor: 'Dr. Anita Patel',  diagnosis: 'Routine checkup', rx: 'Multivitamins' },
]

const STATUS_CONFIG = {
  Waiting:        { label: 'Waiting',         cls: 'bg-orange-100 text-orange-700 border border-orange-200' },
  SentToOPD:      { label: 'Sent to OPD',     cls: 'bg-blue-100 text-blue-700 border border-blue-200' },
  InConsultation: { label: 'In Consultation', cls: 'bg-blue-100 text-blue-700 border border-blue-200', pulse: true },
  Done:           { label: 'Done',            cls: 'bg-green-100 text-green-700 border border-green-200' },
  OnHold:         { label: 'On Hold',         cls: 'bg-gray-100 text-gray-600 border border-gray-200' },
  Emergency:      { label: 'Emergency',       cls: 'bg-red-100 text-red-700 border border-red-200', pulse: true },
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

// --- Helpers -----------------------------------------------------------------

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
  const stripped = (raw || '').replace(/^\+91/, '').replace(/\s/g, '')
  if (!/^[6-9]\d{9}$/.test(stripped)) return { valid: false, stripped }
  return { valid: true, stripped }
}

function validateDob(dob) {
  if (!dob) return null
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const birth = new Date(dob)
  if (birth >= today) return 'Date of birth cannot be a future date'
  const minDate = new Date(today)
  minDate.setFullYear(minDate.getFullYear() - 120)
  if (birth < minDate) return 'Date of birth cannot be more than 120 years ago'
  return null
}

function sanitizeText(str) {
  if (!str) return ''
  return str.trim().replace(/\s+/g, ' ')
}

// Fix 7: Detect Postgres unique-violation error code
function isDuplicateMobileError(err) {
  return (
    err?.code === '23505' ||
    (err?.message || '').toLowerCase().includes('patients_hospital_mobile_unique')
  )
}

// Fix 5: Sort patients so emergency patients always appear first,
// then by created_at descending within each group.
function sortQueue(patients) {
  return [...patients].sort((a, b) => {
    const aEmerg = (a.is_emergency || a.status === 'Emergency') ? 0 : 1
    const bEmerg = (b.is_emergency || b.status === 'Emergency') ? 0 : 1
    if (aEmerg !== bEmerg) return aEmerg - bEmerg
    return new Date(b.created_at || 0) - new Date(a.created_at || 0)
  })
}

// --- Doctor Availability Strip -----------------------------------------------

function DoctorStrip() {
  const [expanded, setExpanded] = useState(false)
  const count     = DOCTORS.length
  const isCompact = count > 10
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
          <p className="text-[10px] text-gray-400 mt-0.5">{doc.specialty} - {doc.room}</p>
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
    <div className="flex gap-2 flex-wrap">
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
  )
}

// --- Queue List --------------------------------------------------------------

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
        {patients.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-8">No patients in queue today</p>
        )}
        {patients.map((p, i) => {
          const isSelected = selected?.id === p.id
          const isEmerg    = p.is_emergency || p.status === 'Emergency'
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
                    isEmerg ? 'bg-red-100 text-red-700' : TOKEN_COLORS[i % TOKEN_COLORS.length]
                  }`}>
                    {p.token || `T-${String(i + 1).padStart(3, '0')}`}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{p.full_name}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {QUEUE_TIMES[i] || '--'}
                    </p>
                  </div>
                </div>
                <QueueBadge status={isEmerg ? 'Emergency' : (p.status || 'Waiting')} />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// --- Patient Detail Panel ----------------------------------------------------

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

  const name     = patient.full_name || ''
  const mobile   = patient.mobile_number || ''
  const dob      = patient.date_of_birth || ''
  const gender   = patient.gender || ''
  const symptoms = patient.symptom_tags || []
  const referral = patient.referral_source || ''
  const isEmerg  = patient.is_emergency || patient.status === 'Emergency'
  const status   = isEmerg ? 'Emergency' : (patient.status || 'Waiting')

  const initials  = name.split(' ').map((n) => n[0]).join('').slice(0, 2)
  const deptMeta  = DEPT_META[patient.department] || { color: 'bg-gray-100 text-gray-700', icon: '\ud83c\udfe5' }
  const canSend   = status === 'Waiting'
  const sentAlready = status === 'SentToOPD'
  const age = dob ? calcAge(dob) : null

  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm flex flex-col h-full overflow-hidden">
      <div className="px-6 py-5 border-b border-[#E5E7EB] bg-gradient-to-r from-[#EBF5FB] to-white">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#1A5276] text-white flex items-center justify-center text-base font-bold flex-shrink-0">
              {initials}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{name}</h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {patient.token && (
                  <span className="text-xs font-mono font-bold text-[#1A5276] bg-blue-50 px-2 py-0.5 rounded">
                    {patient.token}
                  </span>
                )}
                <QueueBadge status={status} />
                {isEmerg && (
                  <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full animate-pulse">EMERGENCY</span>
                )}
              </div>
            </div>
          </div>
          {patient.department && (
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${deptMeta.color}`}>
              {deptMeta.icon} {patient.department}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Patient Information</p>
          <div className="grid grid-cols-2 gap-2">
            <InfoRow icon={User}        label="Age"        value={age !== null ? `${age} years` : '--'} />
            <InfoRow icon={User}        label="Gender"     value={gender || '--'} />
            <InfoRow icon={Phone}       label="Contact"    value={mobile || '--'} />
            <InfoRow icon={Stethoscope} label="Department" value={patient.department || '--'} />
          </div>
          {symptoms.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {symptoms.map((s) => (
                <span key={s} className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-medium">{s}</span>
              ))}
            </div>
          )}
        </div>

        {referral && (
          <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-lg px-4 py-3">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Referral Source</p>
            <p className="text-sm text-gray-700">{referral}</p>
            {patient.referring_doctor_name && (
              <p className="text-xs text-gray-500 mt-1">Referring Doctor: {patient.referring_doctor_name}</p>
            )}
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
          <button disabled className="flex-1 flex items-center justify-center gap-2 bg-green-100 text-green-700 text-sm font-semibold py-2.5 rounded-lg cursor-not-allowed">
            <CheckCircle2 className="w-4 h-4" />
            Sent
          </button>
        )}
        {!canSend && !sentAlready && <div className="flex-1" />}
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

// --- Progress Bar ------------------------------------------------------------

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

// --- Emergency Mini-Form (Fix 5: uses DOB instead of age) --------------------

function EmergencyForm({ onRegister, onCancel }) {
  const [f, setF] = useState({ name: '', mobile: '', dob: '', reason: '' })
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }))

  const dobError = f.dob ? validateDob(f.dob) : null
  const mobileOk = f.mobile ? validateMobile(f.mobile).valid : false
  const valid    = f.name && mobileOk && f.dob && !dobError && f.reason

  return (
    <div className="mt-4 border-2 border-red-300 rounded-xl p-4 bg-red-50 space-y-3">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-red-600" />
        <p className="text-sm font-bold text-red-700">Emergency Registration</p>
      </div>
      <input type="text" placeholder="Patient Name *" value={f.name}
        onChange={(e) => set('name', e.target.value)}
        className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 bg-white" />
      <input type="tel" placeholder="Mobile Number *" value={f.mobile}
        onChange={(e) => set('mobile', e.target.value)}
        className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 bg-white" />
      {/* Fix 5: collect DOB, not age */}
      <div>
        <input type="date" placeholder="Date of Birth *" value={f.dob}
          onChange={(e) => set('dob', e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 bg-white ${
            dobError ? 'border-red-400' : 'border-red-200'
          }`} />
        {dobError && <p className="text-xs text-red-600 mt-1">{dobError}</p>}
      </div>
      <textarea rows={2} placeholder="Emergency Reason *" value={f.reason}
        onChange={(e) => set('reason', e.target.value)}
        className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 bg-white resize-none" />
      <div className="flex gap-2">
        <button onClick={onCancel}
          className="flex-1 border border-gray-300 text-gray-600 text-sm font-medium py-2 rounded-lg hover:bg-gray-50">Cancel</button>
        <button disabled={!valid} onClick={() => onRegister(f)}
          className="flex-1 bg-red-600 text-white text-sm font-bold py-2 rounded-lg hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed">
          Register Emergency Patient
        </button>
      </div>
    </div>
  )
}

// --- Returning Patient Search ------------------------------------------------

function ReturningSearch({ allPatients, onSelect }) {
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState([])

  useEffect(() => {
    if (query.trim().length < 3) { setResults([]); return }
    const q = query.toLowerCase()
    setResults(
      allPatients.filter(
        (p) =>
          (p.full_name || '').toLowerCase().includes(q) ||
          (p.mobile_number || '').replace(/\s/g, '').includes(q.replace(/\s/g, ''))
      ).slice(0, 6)
    )
  }, [query, allPatients])

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Search by name or mobile number..."
          value={query} onChange={(e) => setQuery(e.target.value)}
          className="w-full border border-[#E5E7EB] rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276]" />
      </div>
      {query.length >= 3 && results.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-4">No patients found</p>
      )}
      {results.length > 0 && (
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {results.map((p) => (
            <button key={p.id} onClick={() => onSelect(p)}
              className="w-full text-left bg-[#F8F9FA] hover:bg-[#EBF5FB] border border-[#E5E7EB] hover:border-[#1A5276]/30 rounded-lg px-4 py-3 transition-all">
              <p className="text-sm font-semibold text-gray-900">{p.full_name}</p>
              <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-500">
                <span>{p.gender}</span>
                <span>-</span>
                <span>{p.mobile_number}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// --- Step 1: Patient Info Form -----------------------------------------------

function Step1Form({ form, setForm, isReturning, editMode }) {
  const [showEmergency, setShowEmergency] = useState(false)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const mobileResult = form.mobile ? validateMobile(form.mobile) : null
  const dobError     = form.dob ? validateDob(form.dob) : null
  const age          = form.dob && !dobError ? calcAge(form.dob) : null

  const appendSymptom = (tag) => {
    const cur = form.symptomTags || []
    if (!cur.includes(tag)) set('symptomTags', [...cur, tag])
  }
  const removeSymptom = (tag) => set('symptomTags', (form.symptomTags || []).filter((t) => t !== tag))

  return (
    <div className="space-y-4">
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

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Mobile Number *</label>
        <div className="relative">
          <input type="tel" placeholder="98765 43210" value={form.mobile}
            onChange={(e) => set('mobile', e.target.value)}
            className={`w-full border rounded-lg px-3 py-2.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 ${
              mobileResult
                ? mobileResult.valid ? 'border-green-400' : 'border-red-400'
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

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Date of Birth *</label>
        <input type="date" value={form.dob}
          onChange={(e) => set('dob', e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 ${
            dobError ? 'border-red-400' : 'border-[#E5E7EB] focus:border-[#1A5276]'
          }`} />
        {dobError && <p className="text-xs text-red-500 mt-1">{dobError}</p>}
        {age !== null && !dobError && <p className="text-xs text-gray-400 mt-1">Age: {age} years</p>}
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">Gender *</label>
        <div className="flex gap-3">
          {['Male', 'Female', 'Other'].map((g) => (
            <label key={g} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer text-sm font-medium transition-all ${
              form.gender === g ? 'border-[#1A5276] bg-[#EBF5FB] text-[#1A5276]' : 'border-[#E5E7EB] text-gray-600 hover:bg-[#F8F9FA]'
            }`}>
              <input type="radio" name="gender" value={g} checked={form.gender === g}
                onChange={() => set('gender', g)} className="sr-only" />
              {form.gender === g && <CheckCircle2 className="w-3.5 h-3.5" />}
              {g}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Symptom Tags <span className="text-gray-400 font-normal">(optional)</span></label>
        {(form.symptomTags || []).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {(form.symptomTags || []).map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 text-xs bg-[#EBF5FB] text-[#1A5276] border border-[#1A5276]/30 px-2.5 py-1 rounded-full font-medium">
                {tag}
                <button type="button" onClick={() => removeSymptom(tag)} className="hover:text-red-500"><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-1.5">
          {SYMPTOM_TAGS.filter((t) => !(form.symptomTags || []).includes(t)).map((tag) => (
            <button key={tag} type="button" onClick={() => appendSymptom(tag)}
              className="text-[10px] px-2.5 py-1 rounded-full border border-[#E5E7EB] text-gray-500 hover:bg-[#EBF5FB] hover:border-[#1A5276]/30 hover:text-[#1A5276] transition-all">
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">How did you hear about us? <span className="text-gray-400 font-normal">(optional)</span></label>
        <div className="flex flex-wrap gap-2">
          {REFERRAL_SOURCES.map((src) => {
            const sel = form.referralSource === src
            return (
              <button key={src} type="button"
                onClick={() => {
                  const next = sel ? '' : src
                  set('referralSource', next)
                  if (src === 'Doctor Referral' && sel) set('referringDoctorName', '')
                }}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                  sel ? 'border-[#1A5276] bg-[#EBF5FB] text-[#1A5276]' : 'border-[#E5E7EB] text-gray-600 hover:bg-[#F8F9FA]'
                }`}>
                {src}
              </button>
            )
          })}
        </div>
        {form.referralSource === 'Doctor Referral' && (
          <div className="mt-3">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Referring Doctor Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Dr. Mehta (Family Physician)"
              value={form.referringDoctorName || ''}
              onChange={(e) => set('referringDoctorName', e.target.value)}
              className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276]"
            />
            {!form.referringDoctorName?.trim() && (
              <p className="text-xs text-amber-600 mt-1">Required when Doctor Referral is selected</p>
            )}
          </div>
        )}
      </div>

      {!editMode && !showEmergency && (
        <button type="button" onClick={() => setShowEmergency(true)}
          className="text-xs text-red-500 hover:text-red-700 font-semibold underline underline-offset-2 mt-1">
          Emergency Registration
        </button>
      )}
      {showEmergency && (
        <EmergencyForm
          onCancel={() => setShowEmergency(false)}
          onRegister={(ef) => {
            // Fix 5: populate DOB from emergency form, set is_emergency = true
            setForm((f) => ({
              ...f,
              name:        ef.name,
              mobile:      ef.mobile,
              dob:         ef.dob,
              symptomTags: ef.reason ? [ef.reason] : [],
              isEmergency: true,
            }))
            setShowEmergency(false)
          }}
        />
      )}
    </div>
  )
}

// --- Step 2: Appointment Details ---------------------------------------------

function Step2Form({ form, setForm, isReturning }) {
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const deptDoctors = DOCTORS.filter((d) => !form.department || d.specialty === form.department)

  const apptTypes = [
    { key: 'OPD',       title: 'OPD Consultation', desc: 'Regular outpatient visit',                                   border: 'border-[#1A5276]', bg: 'bg-[#EBF5FB]', show: true },
    { key: 'Follow-up', title: 'Follow-up Visit',  desc: 'Returning for same condition.',                              border: 'border-[#1A5276]', bg: 'bg-[#EBF5FB]', show: isReturning },
    // Fix 5: selecting Emergency appt type sets is_emergency = true
    { key: 'Emergency', title: 'Emergency',         desc: 'Immediate attention required. Patient will be prioritized.', border: 'border-red-500',   bg: 'bg-red-50',    show: true, warning: 'Patient will skip queue' },
  ].filter((t) => t.show)

  return (
    <div className="space-y-5">
      <p className="text-[10px] text-gray-400 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
        This step is for reception staff only
      </p>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">Appointment Type</label>
        <div className="space-y-2">
          {apptTypes.map((t) => {
            const sel = form.apptType === t.key
            return (
              <button key={t.key} type="button"
                onClick={() => {
                  set('apptType', t.key)
                  // Fix 5: keep is_emergency in sync with the appt type selection
                  set('isEmergency', t.key === 'Emergency')
                }}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                  sel ? `${t.border} ${t.bg}` : 'border-[#E5E7EB] hover:bg-[#F8F9FA]'
                }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-semibold ${
                      sel ? t.key === 'Emergency' ? 'text-red-700' : 'text-[#1A5276]' : 'text-gray-800'
                    }`}>{t.title}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{t.desc}</p>
                    {sel && t.warning && <p className="text-[10px] text-red-600 font-semibold mt-1">Warning: {t.warning}</p>}
                  </div>
                  {sel && <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${t.key === 'Emergency' ? 'text-red-500' : 'text-[#1A5276]'}`} />}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">Department *</label>
        <div className="grid grid-cols-3 gap-2">
          {DEPARTMENTS.map((dept) => {
            const meta = DEPT_META[dept.name] || { icon: '\ud83c\udfe5', color: '' }
            const sel  = form.department === dept.name
            const docCount = DOCTORS.filter((d) => d.specialty === dept.name).length
            return (
              <button key={dept.name} type="button"
                onClick={() => { set('department', dept.name); set('doctor', '') }}
                className={`flex flex-col items-center gap-1 px-2 py-3 rounded-xl border-2 text-center transition-all ${
                  sel ? 'border-[#1A5276] bg-[#1A5276] shadow-sm' : 'border-[#E5E7EB] hover:bg-[#F8F9FA]'
                }`}>
                <span className="text-xl">{meta.icon}</span>
                <span className={`text-[10px] font-semibold leading-tight ${sel ? 'text-white' : 'text-gray-700'}`}>{dept.name}</span>
                <span className={`text-[9px] ${sel ? 'text-blue-200' : 'text-gray-400'}`}>{docCount} doctor{docCount !== 1 ? 's' : ''}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Assign Doctor</label>
        <div className="space-y-2">
          {deptDoctors.length === 0 && <p className="text-xs text-gray-400">Select a department first</p>}
          {deptDoctors.map((d) => {
            const sel = form.doctor === d.name
            return (
              <button key={d.id} type="button" onClick={() => set('doctor', d.name)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
                  sel ? 'border-[#1A5276] bg-[#EBF5FB]' : 'border-[#E5E7EB] hover:bg-[#F8F9FA]'
                }`}>
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${DOCTOR_STATUS_DOT[d.status] || 'bg-gray-400'}`} />
                <div className="flex-1 text-left">
                  <p className={`text-sm font-semibold ${sel ? 'text-[#1A5276]' : 'text-gray-800'}`}>{d.name}</p>
                  <p className="text-[10px] text-gray-400">{d.specialty} - Queue: {d.patients}</p>
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

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">Time Slot</label>
        <div className="grid grid-cols-2 gap-3">
          {[{ key: 'morning', label: 'Morning', sub: '9AM - 1PM' }, { key: 'evening', label: 'Evening', sub: '4PM - 8PM' }].map((slot) => {
            const sel = form.timeSlot === slot.key
            return (
              <button key={slot.key} type="button" onClick={() => set('timeSlot', slot.key)}
                className={`flex flex-col items-center py-3 rounded-xl border-2 transition-all ${
                  sel ? 'border-[#1A5276] bg-[#EBF5FB]' : 'border-[#E5E7EB] hover:bg-[#F8F9FA]'
                }`}>
                <span className="text-lg">{slot.key === 'morning' ? 'Morning' : 'Evening'}</span>
                <span className={`text-sm font-semibold mt-1 ${sel ? 'text-[#1A5276]' : 'text-gray-700'}`}>{slot.label}</span>
                <span className={`text-[10px] ${sel ? 'text-[#1A5276]/70' : 'text-gray-400'}`}>{slot.sub}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// --- Main Modal --------------------------------------------------------------

const EMPTY_FORM = {
  name: '', mobile: '', dob: '', gender: 'Male',
  symptomTags: [], referralSource: '', referringDoctorName: '',
  department: '', doctor: '', apptType: 'OPD', timeSlot: 'morning',
  isEmergency: false,
}

function PatientModal({ onClose, onAdd, onUpdate, editPatient, allPatients }) {
  // useAuth() called here directly — PatientModal is a named function component,
  // not a closure inside Reception(), so it cannot access Reception()'s profile
  // variable. handleNextStep needs profile.hospital_id for the duplicate-mobile
  // Supabase query. All other variables used in this component are either local
  // state, props, or module-level imports (supabase, validateMobile, etc.).
  const { profile } = useAuth()

  const isEditMode = !!editPatient

  const [mode, setMode]   = useState('new')
  const [step, setStep]   = useState(1)
  const [form, setForm]   = useState(
    isEditMode
      ? {
          ...EMPTY_FORM,
          name:                editPatient.full_name || '',
          mobile:              editPatient.mobile_number || '',
          dob:                 editPatient.date_of_birth || '',
          gender:              editPatient.gender || 'Male',
          symptomTags:         editPatient.symptom_tags || [],
          referralSource:      editPatient.referral_source || '',
          referringDoctorName: editPatient.referring_doctor_name || '',
          isEmergency:         editPatient.is_emergency || false,
        }
      : EMPTY_FORM
  )
  const [token, setToken]             = useState('')
  const [isReturning, setIsReturning] = useState(false)
  const [returnPatient, setReturnPatient] = useState(null)
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting]   = useState(false)
  // Step 1 → Step 2 transition: mobile duplicate check
  const [mobileCheckError, setMobileCheckError] = useState('')
  const [mobileChecking, setMobileChecking]     = useState(false)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSelectReturning = (p) => {
    setReturnPatient(p)
    setIsReturning(true)
    setForm({
      ...EMPTY_FORM,
      name:           p.full_name || '',
      mobile:         p.mobile_number || '',
      dob:            p.date_of_birth || '',
      gender:         p.gender || 'Male',
      symptomTags:    [],
      referralSource: p.referral_source || '',
      apptType:       'Follow-up',
      timeSlot:       'morning',
    })
    setStep(1)
  }

  // Fix 6: same validation rules for both create and edit flows
  const mobileOk   = form.mobile ? validateMobile(form.mobile).valid : false
  const dobErr     = form.dob ? validateDob(form.dob) : null
  // Referring doctor name is required when referral source is 'Doctor Referral'
  const doctorNameOk = form.referralSource !== 'Doctor Referral' || !!sanitizeText(form.referringDoctorName)
  const step1Valid = sanitizeText(form.name).length > 0 && mobileOk && !!form.dob && !dobErr && doctorNameOk

  // Run the Supabase duplicate-mobile check before advancing to Step 2.
  // Gives the user immediate feedback on Step 1 rather than waiting until
  // they submit the full form on Step 2.
  const handleNextStep = async () => {
    setMobileCheckError('')
    if (!isReturning) {
      const mobile = validateMobile(form.mobile).stripped
      setMobileChecking(true)
      try {
        const { count, error: dupError } = await supabase
          .from('patients')
          .select('id', { count: 'exact', head: true })
          .eq('hospital_id', profile?.hospital_id)
          .eq('mobile_number', mobile)
        if (dupError) throw dupError
        if (count > 0) {
          setMobileCheckError(
            `A patient with mobile number ${mobile} is already registered at this hospital. ` +
            'Use the "Returning Patient" tab to book a follow-up.'
          )
          return
        }
      } catch {
        setMobileCheckError('Could not verify mobile number uniqueness. Please try again.')
        return
      } finally {
        setMobileChecking(false)
      }
    }
    setStep(2)
  }

  const handleBook = async () => {
    setSubmitError('')
    setSubmitting(true)
    try {
      const tok = `T-${String(Math.floor(Math.random() * 900) + 11).padStart(3, '0')}`
      setToken(tok)
      if (isEditMode) {
        await onUpdate({ ...editPatient, ...form })
      } else {
        await onAdd({ ...form, token: tok, isReturning })
      }
      setStep(3)
    } catch (err) {
      setSubmitError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSaveEdit = async () => {
    setSubmitError('')
    setSubmitting(true)
    try {
      await onUpdate({ ...editPatient, ...form })
      onClose()
    } catch (err) {
      setSubmitError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] flex-shrink-0">
          <div>
            {isEditMode ? (
              <h3 className="text-base font-bold text-gray-900">Editing: {editPatient.full_name}</h3>
            ) : (
              <>
                <h3 className="text-base font-bold text-gray-900">Register Patient</h3>
                {step < 3 && <p className="text-xs text-gray-500 mt-0.5">Step {step} of {STEPS.length}</p>}
              </>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isEditMode && step === 1 && (
          <div className="flex border-b border-[#E5E7EB] px-6 flex-shrink-0">
            {['new', 'returning'].map((m) => (
              <button key={m} onClick={() => { setMode(m); setIsReturning(false); setReturnPatient(null); setForm(EMPTY_FORM) }}
                className={`py-3 px-4 text-sm font-semibold border-b-2 transition-all ${
                  mode === m ? 'border-[#1A5276] text-[#1A5276]' : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}>
                {m === 'new' ? 'New Patient' : 'Returning Patient'}
              </button>
            ))}
          </div>
        )}

        <div className="px-6 pt-5 pb-6 overflow-y-auto flex-1">
          {submitError && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{submitError}</p>
            </div>
          )}

          {!isEditMode && mode === 'returning' && step === 1 && !isReturning && (
            <ReturningSearch allPatients={allPatients} onSelect={handleSelectReturning} />
          )}

          {!isEditMode && isReturning && returnPatient && step === 1 && (
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold bg-green-100 text-green-700 border border-green-200 px-2.5 py-1 rounded-full">Returning Patient</span>
                <button onClick={() => { setIsReturning(false); setReturnPatient(null); setForm(EMPTY_FORM) }}
                  className="text-[10px] text-gray-400 hover:text-gray-600 underline">Change</button>
              </div>
            </div>
          )}

          {(mode === 'new' || isReturning || isEditMode) && (
            <>
              {!isEditMode && <ProgressBar step={step} />}

              {step === 1 && (
                <>
                  <p className="text-sm font-bold text-gray-800 mb-4">Patient Information</p>
                  <Step1Form form={form} setForm={setForm} isReturning={isReturning} editMode={isEditMode} />
                  {mobileCheckError && (
                    <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mt-3">
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700">{mobileCheckError}</p>
                    </div>
                  )}
                  <div className="mt-5">
                    {isEditMode ? (
                      <button onClick={handleSaveEdit} disabled={submitting || !step1Valid}
                        className="w-full flex items-center justify-center gap-2 bg-[#1A5276] text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-[#154360] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        {submitting ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        {submitting ? 'Saving...' : 'Save Changes'}
                      </button>
                    ) : (
                      <button
                        onClick={() => { setMobileCheckError(''); handleNextStep() }}
                        disabled={!step1Valid || mobileChecking}
                        className="w-full flex items-center justify-center gap-2 bg-[#1A5276] text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-[#154360] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                        {mobileChecking
                          ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Checking...</>
                          : <>Next Step <ChevronRight className="w-4 h-4" /></>}
                      </button>
                    )}
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <p className="text-sm font-bold text-gray-800 mb-4">Appointment Details</p>
                  <Step2Form form={form} setForm={setForm} isReturning={isReturning} />
                  <div className="flex gap-3 mt-5">
                    <button onClick={() => setStep(1)}
                      className="flex-1 border border-[#E5E7EB] text-gray-600 text-sm font-medium py-2.5 rounded-lg hover:bg-[#F8F9FA] transition-colors">
                      Back
                    </button>
                    <button onClick={handleBook} disabled={!form.department || submitting}
                      className="flex-1 flex items-center justify-center gap-2 bg-[#1A5276] text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-[#154360] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                      {submitting ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Calendar className="w-4 h-4" />}
                      {submitting ? 'Saving...' : 'Generate Token & Book'}
                    </button>
                  </div>
                </>
              )}

              {step === 3 && (
                <div className="flex flex-col items-center text-center py-4 space-y-5">
                  <div className={`w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center ${
                    form.isEmergency ? 'bg-red-50 border-red-500' : 'bg-[#EBF5FB] border-[#1A5276]'
                  }`}>
                    <p className={`text-[10px] font-semibold uppercase tracking-widest ${form.isEmergency ? 'text-red-600' : 'text-[#1A5276]'}`}>Token</p>
                    <p className={`text-3xl font-black leading-none mt-0.5 ${form.isEmergency ? 'text-red-600' : 'text-[#1A5276]'}`}>{token}</p>
                    {form.isEmergency && <span className="text-[9px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full mt-1 animate-pulse">EMERGENCY</span>}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">{form.name}</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {form.department} - {form.doctor || 'Doctor TBD'} - {form.timeSlot === 'morning' ? 'Morning 9AM-1PM' : 'Evening 4PM-8PM'}
                    </p>
                    {isReturning && (
                      <span className="inline-block mt-2 text-xs font-semibold bg-green-100 text-green-700 border border-green-200 px-2.5 py-1 rounded-full">Returning Patient</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-3 w-full">
                    <CheckCircle2 className="w-4 h-4 text-[#1E8449] flex-shrink-0" />
                    <div className="text-left">
                      <p className="text-xs font-semibold text-green-800">Registration successful - saved to Supabase</p>
                      <p className="text-[10px] text-green-600 mt-0.5">Patient record and audit log created atomically via DB trigger</p>
                    </div>
                    <MessageCircle className="w-4 h-4 text-[#25D366] ml-auto flex-shrink-0" />
                  </div>
                  <div className="flex gap-3 w-full">
                    <button
                      onClick={() => { setStep(1); setForm(EMPTY_FORM); setMode('new'); setIsReturning(false); setReturnPatient(null); setSubmitError('') }}
                      className="flex-1 bg-[#1A5276] text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-[#154360] transition-colors">
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

// --- Main Page ---------------------------------------------------------------

export default function Reception() {
  const { profile } = useAuth()

  const [patients, setPatients]       = useState([])
  const [selected, setSelected]       = useState(null)
  const [showModal, setShowModal]     = useState(false)
  const [editPatient, setEditPatient] = useState(null)
  const [loadError, setLoadError]     = useState('')
  const [loading, setLoading]         = useState(true)

  // Load patients - RLS auto-filters to this hospital
  // Fix 5: order by is_emergency DESC so emergency patients always load first
  const loadPatients = useCallback(async () => {
    setLoadError('')
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('is_emergency', { ascending: false })
        .order('created_at',   { ascending: false })

      if (error) throw error
      setPatients(data || [])
      if (data && data.length > 0) setSelected(data[0])
    } catch (err) {
      console.error('Failed to load patients:', err)
      setLoadError('Failed to load patients. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadPatients() }, [loadPatients])

  // -- Add new patient --------------------------------------------------------
  // Fix 8: manual audit_logs INSERT removed - the Postgres trigger handles it.
  // Fix 7: unique-violation (code 23505) caught and shown as friendly message.
  const handleAddPatient = useCallback(async (formData) => {
    if (!profile?.hospital_id) {
      throw new Error('Your account is not linked to a hospital. Contact your administrator.')
    }

    const fullName            = sanitizeText(formData.name)
    const mobile              = validateMobile(formData.mobile).stripped
    const dob                 = formData.dob
    const gender              = sanitizeText(formData.gender)
    const symptomTags         = (formData.symptomTags || []).map(sanitizeText).filter(Boolean)
    const referral            = sanitizeText(formData.referralSource)
    const referringDoctorName = referral === 'Doctor Referral'
      ? sanitizeText(formData.referringDoctorName) || null
      : null
    // Fix 5: is_emergency comes from both the emergency mini-form AND the appt type
    const isEmergency = !!formData.isEmergency || formData.apptType === 'Emergency'
    const patientType = formData.isReturning ? 'returning' : 'new'

    // App-side duplicate check for early UX feedback (not the authoritative check)
    if (patientType === 'new') {
      const { count, error: dupError } = await supabase
        .from('patients')
        .select('id', { count: 'exact', head: true })
        .eq('hospital_id', profile.hospital_id)
        .eq('mobile_number', mobile)

      if (dupError) throw new Error('Could not verify mobile number uniqueness. Please try again.')
      if (count > 0) {
        throw new Error(
          `A patient with mobile number ${mobile} is already registered at this hospital. ` +
          'Use the "Returning Patient" tab to book a follow-up.'
        )
      }
    }

    const { data: newPatient, error: insertError } = await supabase
      .from('patients')
      .insert({
        hospital_id:           profile.hospital_id,
        patient_type:          patientType,
        full_name:             fullName,
        mobile_number:         mobile,
        date_of_birth:         dob,
        gender,
        symptom_tags:          symptomTags,
        referral_source:       referral || null,
        referring_doctor_name: referringDoctorName,
        is_emergency:          isEmergency,
        registered_by:         profile.id,
      })
      .select()
      .single()

    if (insertError) {
      // Fix 7: catch DB-level unique constraint violation
      if (isDuplicateMobileError(insertError)) {
        throw new Error(
          `A patient with mobile number ${mobile} is already registered at this hospital. ` +
          'Use the "Returning Patient" tab to book a follow-up.'
        )
      }
      throw new Error(`Failed to register patient: ${insertError.message}`)
    }

    // Fix 8: audit log is written by the Postgres trigger - no manual insert needed.

    const patientWithToken = {
      ...newPatient,
      token:  formData.token,
      status: isEmergency ? 'Emergency' : 'Waiting',
    }

    // Fix 5: emergency patients sorted to front via sortQueue
    setPatients((prev) => sortQueue([patientWithToken, ...prev]))
    setSelected(patientWithToken)
  }, [profile])

  // -- Update existing patient ------------------------------------------------
  // Fix 9: replace local state with the fresh Supabase row from .select().single()
  // Fix 7: duplicate mobile check also runs on edits
  const handleUpdatePatient = useCallback(async (updated) => {
    const fullName            = sanitizeText(updated.name || updated.full_name)
    const mobile              = validateMobile(updated.mobile || updated.mobile_number || '').stripped
    const gender              = sanitizeText(updated.gender)
    const symptomTags         = (updated.symptomTags || updated.symptom_tags || []).map(sanitizeText).filter(Boolean)
    const referral            = sanitizeText(updated.referralSource || updated.referral_source)
    const referringDoctorName = referral === 'Doctor Referral'
      ? sanitizeText(updated.referringDoctorName || updated.referring_doctor_name) || null
      : null
    const isEmergency = !!updated.isEmergency
    const dob         = updated.dob || updated.date_of_birth

    // Fix 7: check for duplicate mobile on edit (exclude the patient's own row)
    const { count: dupCount, error: dupError } = await supabase
      .from('patients')
      .select('id', { count: 'exact', head: true })
      .eq('hospital_id', updated.hospital_id)
      .eq('mobile_number', mobile)
      .neq('id', updated.id)

    if (dupError) throw new Error('Could not verify mobile number uniqueness. Please try again.')
    if (dupCount > 0) {
      throw new Error(`Another patient with mobile number ${mobile} is already registered at this hospital.`)
    }

    // Fix 9: use .select().single() to get the canonical fresh row back
    const { data: freshRow, error } = await supabase
      .from('patients')
      .update({
        full_name:             fullName,
        mobile_number:         mobile,
        date_of_birth:         dob,
        gender,
        symptom_tags:          symptomTags,
        referral_source:       referral || null,
        referring_doctor_name: referringDoctorName,
        is_emergency:          isEmergency,
      })
      .eq('id', updated.id)
      .select()
      .single()

    if (error) {
      if (isDuplicateMobileError(error)) {
        throw new Error(`Another patient with mobile number ${mobile} is already registered at this hospital.`)
      }
      throw new Error(`Failed to update patient: ${error.message}`)
    }

    // Fix 9: replace with the authoritative fresh row - no manual field merging
    setPatients((prev) => sortQueue(prev.map((p) => p.id === freshRow.id ? { ...freshRow, token: p.token, status: p.status } : p)))
    setSelected((s) => s?.id === freshRow.id ? { ...freshRow, token: s.token, status: s.status } : s)
    setEditPatient(null)
    setShowModal(false)
  }, [])

  const handleSendToOPD = useCallback((id) => {
    setPatients((prev) => prev.map((p) => p.id === id ? { ...p, status: 'SentToOPD' } : p))
    setSelected((s) => s?.id === id ? { ...s, status: 'SentToOPD' } : s)
  }, [])

  const handleEdit       = (patient) => { setEditPatient(patient); setShowModal(true) }
  const handleCloseModal = ()        => { setShowModal(false); setEditPatient(null) }

  return (
    <>
      <div className="flex flex-col h-full space-y-4" style={{ height: 'calc(100vh - 64px - 48px)' }}>
        <div className="flex items-start justify-between flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Reception</h2>
            <p className="text-xs text-gray-500 mt-0.5">{patients.length} patients in queue today</p>
          </div>
          <button type="button" onClick={() => { setEditPatient(null); setShowModal(true) }}
            className="flex items-center gap-2 bg-[#1A5276] text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-[#154360] transition-colors shadow-sm flex-shrink-0">
            <Plus className="w-4 h-4" />
            New Patient
          </button>
        </div>

        {loadError && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex-shrink-0">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 flex-1">{loadError}</p>
            <button onClick={loadPatients} className="text-xs font-semibold text-red-600 hover:underline flex-shrink-0">Retry</button>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-8">
            <span className="w-5 h-5 border-2 border-gray-200 border-t-[#1A5276] rounded-full animate-spin" />
            <span className="ml-2 text-sm text-gray-400">Loading patients...</span>
          </div>
        )}

        {!loading && (
          <div className="flex-shrink-0"><DoctorStrip /></div>
        )}

        {!loading && (
          <div className="grid grid-cols-5 gap-4 flex-1 min-h-0">
            <div className="col-span-2 min-h-0">
              <QueueList patients={patients} selected={selected} onSelect={setSelected} />
            </div>
            <div className="col-span-3 min-h-0">
              <PatientDetail patient={selected} onEdit={handleEdit} onSendToOPD={handleSendToOPD} />
            </div>
          </div>
        )}
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
