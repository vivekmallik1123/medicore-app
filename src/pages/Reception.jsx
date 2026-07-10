import { useState } from 'react'
import {
  Plus,
  X,
  ChevronRight,
  Send,
  Pencil,
  CheckCircle2,
  MessageCircle,
  User,
  Phone,
  Droplets,
  Stethoscope,
  Calendar,
  Clock,
} from 'lucide-react'
import StatusBadge from '../components/StatusBadge.jsx'
import { PATIENTS, DOCTORS } from '../data/mockData.js'

// ─── Constants ────────────────────────────────────────────────────────────────

const TOKEN_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-teal-100 text-teal-700',
  'bg-indigo-100 text-indigo-700',
  'bg-cyan-100 text-cyan-700',
]

const DEPT_META = {
  Cardiology:  { color: 'bg-red-100 text-red-700',    icon: '❤️' },
  Orthopedics: { color: 'bg-orange-100 text-orange-700', icon: '🦴' },
  General:     { color: 'bg-blue-100 text-blue-700',   icon: '🏥' },
  Gynecology:  { color: 'bg-pink-100 text-pink-700',   icon: '🌸' },
  Neurology:   { color: 'bg-purple-100 text-purple-700', icon: '🧠' },
}

const DOCTOR_STATUS_DOT = {
  Available: 'bg-green-500',
  InConsult: 'bg-blue-500',
  OnBreak:   'bg-orange-400',
}

const PAST_VISITS = [
  { date: '12 May 2025', doctor: 'Dr. Rajesh Kumar',  diagnosis: 'Sprained ankle',   rx: 'Ibuprofen 400mg' },
  { date: '03 Jan 2025', doctor: 'Dr. Anita Patel',   diagnosis: 'Viral fever',       rx: 'Paracetamol 500mg, Rest' },
  { date: '18 Sep 2024', doctor: 'Dr. Anita Patel',   diagnosis: 'Routine checkup',   rx: 'Multivitamins' },
]

const APPT_TIMES = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM']

// ─── Doctor Availability Strip ──────────────────────────────────────────────────────

function DoctorStrip() {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      {DOCTORS.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center gap-2 bg-white border border-[#E5E7EB] rounded-lg px-3 py-2 shadow-sm"
        >
          <span
            className={`w-2 h-2 rounded-full flex-shrink-0 ${
              DOCTOR_STATUS_DOT[doc.status] || 'bg-gray-400'
            }`}
          />
          <div>
            <p className="text-xs font-semibold text-gray-800 leading-none">{doc.name}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              {doc.specialty} · {doc.room}
            </p>
          </div>
          <span
            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ml-1 ${
              doc.status === 'Available'
                ? 'bg-green-100 text-green-700'
                : doc.status === 'InConsult'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-orange-100 text-orange-700'
            }`}
          >
            {doc.status === 'InConsult' ? 'In Consult' : doc.status === 'OnBreak' ? 'On Break' : 'Available'}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Queue List ────────────────────────────────────────────────────────────────────

const QUEUE_TIMES = [
  '09:00 AM', '09:15 AM', '09:30 AM', '09:45 AM',
  '10:00 AM', '10:15 AM', '10:30 AM', '10:45 AM',
  '11:00 AM', '11:15 AM',
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
                  {/* Token badge */}
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono flex-shrink-0 ${
                      TOKEN_COLORS[i % TOKEN_COLORS.length]
                    }`}
                  >
                    {p.token}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {QUEUE_TIMES[i]}
                    </p>
                  </div>
                </div>
                <StatusBadge status={p.status} size="sm" />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Patient Detail Panel ──────────────────────────────────────────────────────────

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

function PatientDetail({ patient }) {
  if (!patient) {
    return (
      <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm h-full flex items-center justify-center">
        <p className="text-sm text-gray-400">Select a patient to view details</p>
      </div>
    )
  }

  const initials = patient.name.split(' ').map((n) => n[0]).join('').slice(0, 2)
  const deptMeta = DEPT_META[patient.department] || { color: 'bg-gray-100 text-gray-700', icon: '🏥' }
  const doctor = DOCTORS.find((d) => d.specialty === patient.department)

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
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-mono font-bold text-[#1A5276] bg-blue-50 px-2 py-0.5 rounded">
                  {patient.token}
                </span>
                <StatusBadge status={patient.status} size="sm" />
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
        {/* Info grid */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Patient Information</p>
          <div className="grid grid-cols-2 gap-2">
            <InfoRow icon={User}       label="Age"        value={`${patient.age} years`} />
            <InfoRow icon={User}       label="Gender"     value={patient.gender} />
            <InfoRow icon={Phone}      label="Contact"    value={patient.contact} />
            <InfoRow icon={Droplets}   label="Blood Group" value={patient.bloodGroup} />
            <InfoRow icon={Stethoscope} label="Department" value={patient.department} />
            <InfoRow icon={User}       label="Doctor"     value={doctor?.name || '—'} />
          </div>
        </div>

        {/* Reason */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Reason for Visit</p>
          <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-lg px-4 py-3">
            <p className="text-sm text-gray-700 leading-relaxed">{patient.reason}</p>
          </div>
        </div>

        {/* Past visits */}
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
        <button className="flex-1 flex items-center justify-center gap-2 bg-[#1A5276] text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-[#154360] transition-colors shadow-sm">
          <Send className="w-4 h-4" />
          Send to OPD
        </button>
        <button className="flex items-center justify-center gap-2 border border-[#E5E7EB] text-gray-600 text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-[#F8F9FA] transition-colors">
          <Pencil className="w-4 h-4" />
          Edit Details
        </button>
      </div>
    </div>
  )
}

// ─── New Patient Modal ──────────────────────────────────────────────────────────────

const STEPS = ['Patient Info', 'Appointment', 'Confirmation']

function ProgressBar({ step }) {
  return (
    <div className="flex items-center gap-0 mb-6">
      {STEPS.map((label, i) => {
        const idx = i + 1
        const done    = step > idx
        const active  = step === idx
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            {/* Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                  done
                    ? 'bg-[#1E8449] border-[#1E8449] text-white'
                    : active
                    ? 'bg-[#1A5276] border-[#1A5276] text-white'
                    : 'bg-white border-[#E5E7EB] text-gray-400'
                }`}
              >
                {done ? <CheckCircle2 className="w-4 h-4" /> : idx}
              </div>
              <span
                className={`text-[10px] mt-1 font-medium whitespace-nowrap ${
                  active ? 'text-[#1A5276]' : done ? 'text-[#1E8449]' : 'text-gray-400'
                }`}
              >
                {label}
              </span>
            </div>
            {/* Connector */}
            {i < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 mb-4 transition-all ${
                  step > idx ? 'bg-[#1E8449]' : 'bg-[#E5E7EB]'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

const EMPTY_FORM = {
  name: '', mobile: '', dob: '', gender: 'Male', reason: '',
  department: '', doctor: '', apptType: 'OPD', apptTime: APPT_TIMES[0],
}

function NewPatientModal({ onClose, onAdd }) {
  const [step, setStep]   = useState(1)
  const [form, setForm]   = useState(EMPTY_FORM)
  const [token, setToken] = useState('')

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleBook = () => {
    const num = String(Math.floor(Math.random() * 5) + 11).padStart(3, '0')
    setToken(`T${num}`)
    onAdd && onAdd({ ...form, token: `T${num}` })
    setStep(3)
  }

  const doctorsForDept = DOCTORS.filter(
    (d) => !form.department || d.specialty === form.department
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Card */}
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full mx-4 overflow-hidden"
        style={{ maxWidth: '600px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <div>
            <h3 className="text-base font-bold text-gray-900">Register New Patient</h3>
            <p className="text-xs text-gray-500 mt-0.5">Step {step} of {STEPS.length}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pt-5 pb-6">
          <ProgressBar step={step} />

          {/* ── STEP 1: Patient Info ── */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Patel"
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                    className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Mobile Number *</label>
                  <input
                    type="tel"
                    placeholder="98765 43210"
                    value={form.mobile}
                    onChange={(e) => set('mobile', e.target.value)}
                    className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Date of Birth</label>
                  <input
                    type="date"
                    value={form.dob}
                    onChange={(e) => set('dob', e.target.value)}
                    className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276]"
                  />
                </div>
              </div>

              {/* Gender radio */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Gender *</label>
                <div className="flex gap-3">
                  {['Male', 'Female', 'Other'].map((g) => (
                    <label
                      key={g}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer text-sm font-medium transition-all ${
                        form.gender === g
                          ? 'border-[#1A5276] bg-[#EBF5FB] text-[#1A5276]'
                          : 'border-[#E5E7EB] text-gray-600 hover:bg-[#F8F9FA]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="gender"
                        value={g}
                        checked={form.gender === g}
                        onChange={() => set('gender', g)}
                        className="sr-only"
                      />
                      {form.gender === g && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {g}
                    </label>
                  ))}
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Reason for Visit *</label>
                <textarea
                  rows={3}
                  placeholder="Describe symptoms or reason for visit..."
                  value={form.reason}
                  onChange={(e) => set('reason', e.target.value)}
                  className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276] resize-none"
                />
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!form.name || !form.mobile || !form.reason}
                className="w-full flex items-center justify-center gap-2 bg-[#1A5276] text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-[#154360] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next Step <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ── STEP 2: Appointment ── */}
          {step === 2 && (
            <div className="space-y-5">
              {/* Department grid */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Select Department *</label>
                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(DEPT_META).map(([name, meta]) => (
                    <button
                      key={name}
                      onClick={() => { set('department', name); set('doctor', '') }}
                      className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-lg border text-center transition-all ${
                        form.department === name
                          ? 'border-[#1A5276] bg-[#EBF5FB] shadow-sm'
                          : 'border-[#E5E7EB] hover:bg-[#F8F9FA]'
                      }`}
                    >
                      <span className="text-xl">{meta.icon}</span>
                      <span
                        className={`text-[10px] font-semibold leading-tight ${
                          form.department === name ? 'text-[#1A5276]' : 'text-gray-600'
                        }`}
                      >
                        {name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Doctor selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Assign Doctor</label>
                <select
                  value={form.doctor}
                  onChange={(e) => set('doctor', e.target.value)}
                  className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276] bg-white"
                >
                  <option value="">Select a doctor...</option>
                  {doctorsForDept.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name} — {d.specialty} ({d.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Appointment type toggle */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Appointment Type</label>
                <div className="flex gap-2">
                  {['OPD', 'Emergency', 'Follow-up'].map((t) => (
                    <button
                      key={t}
                      onClick={() => set('apptType', t)}
                      className={`flex-1 py-2 rounded-lg border text-xs font-semibold transition-all ${
                        form.apptType === t
                          ? 'bg-[#1A5276] border-[#1A5276] text-white'
                          : 'border-[#E5E7EB] text-gray-600 hover:bg-[#F8F9FA]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time slots */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Preferred Time Slot</label>
                <div className="grid grid-cols-3 gap-2">
                  {APPT_TIMES.map((t) => (
                    <button
                      key={t}
                      onClick={() => set('apptTime', t)}
                      className={`py-2 rounded-lg border text-xs font-medium transition-all ${
                        form.apptTime === t
                          ? 'bg-[#EBF5FB] border-[#1A5276] text-[#1A5276] font-semibold'
                          : 'border-[#E5E7EB] text-gray-600 hover:bg-[#F8F9FA]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 border border-[#E5E7EB] text-gray-600 text-sm font-medium py-2.5 rounded-lg hover:bg-[#F8F9FA] transition-colors"
                >
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
            </div>
          )}

          {/* ── STEP 3: Confirmation ── */}
          {step === 3 && (
            <div className="flex flex-col items-center text-center py-4 space-y-5">
              {/* Token display */}
              <div className="w-28 h-28 rounded-full bg-[#EBF5FB] border-4 border-[#1A5276] flex flex-col items-center justify-center">
                <p className="text-[10px] font-semibold text-[#1A5276] uppercase tracking-widest">Token</p>
                <p className="text-3xl font-black text-[#1A5276] leading-none mt-0.5">{token}</p>
              </div>

              <div>
                <h4 className="text-lg font-bold text-gray-900">{form.name}</h4>
                <p className="text-sm text-gray-500 mt-1">
                  {form.department} · {form.doctor || 'Doctor TBD'} · {form.apptTime}
                </p>
              </div>

              {/* WhatsApp sent */}
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-3 w-full">
                <CheckCircle2 className="w-4 h-4 text-[#1E8449] flex-shrink-0" />
                <div className="text-left">
                  <p className="text-xs font-semibold text-green-800">WhatsApp Confirmation Sent</p>
                  <p className="text-[10px] text-green-600 mt-0.5">
                    Token {token} sent to {form.mobile || 'patient\'s mobile'}
                  </p>
                </div>
                <MessageCircle className="w-4 h-4 text-[#25D366] ml-auto flex-shrink-0" />
              </div>

              <button
                onClick={onClose}
                className="w-full bg-[#1A5276] text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-[#154360] transition-colors"
              >
                Close &amp; Return to Queue
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

const DEFAULT_PATIENT = PATIENTS.find((p) => p.name === 'Anjali Mehta') || PATIENTS[0]

export default function Reception() {
  const [patients, setPatients]     = useState(PATIENTS)
  const [selected, setSelected]     = useState(DEFAULT_PATIENT)
  const [showModal, setShowModal]   = useState(false)

  const handleAddPatient = (formData) => {
    const newPatient = {
      id:         patients.length + 1,
      token:      formData.token,
      name:       formData.name,
      age:        formData.dob ? new Date().getFullYear() - new Date(formData.dob).getFullYear() : 0,
      gender:     formData.gender,
      department: formData.department,
      status:     'Waiting',
      contact:    formData.mobile,
      reason:     formData.reason,
      bloodGroup: '—',
      allergies:  'None',
    }
    setPatients((prev) => [...prev, newPatient])
    setSelected(newPatient)
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
            onClick={() => setShowModal(true)}
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
          {/* Left 40% — Queue */}
          <div className="col-span-2 min-h-0">
            <QueueList
              patients={patients}
              selected={selected}
              onSelect={setSelected}
            />
          </div>

          {/* Right 60% — Detail */}
          <div className="col-span-3 min-h-0">
            <PatientDetail patient={selected} />
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <NewPatientModal
          onClose={() => setShowModal(false)}
          onAdd={handleAddPatient}
        />
      )}
    </>
  )
}
