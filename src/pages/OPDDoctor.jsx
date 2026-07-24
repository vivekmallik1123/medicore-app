/**
 * OPDDoctor.jsx
 * -------------
 * OPD Doctor module — Phase 2: connected to real Supabase data.
 *
 * - Queue reads from visits JOIN patients for the logged-in doctor.
 * - Consultation form saves vitals, complaint, diagnosis, prescriptions,
 *   lab tests, and notes to the visits row on "Save & Mark Done".
 * - Mock PATIENTS and DOCTORS arrays are no longer used in this file.
 */

import { useState, useEffect, useCallback } from 'react'
import {
  ChevronDown, ChevronUp, Plus, Trash2, FlaskConical,
  CheckCircle2, MessageCircle, Save, X, Printer,
  Coffee, Play, ArrowRight, Bell, BedDouble, AlertCircle,
} from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../context/AuthContext.jsx'

// ─── Constants ────────────────────────────────────────────────────────────────

const VITALS_FIELDS = [
  { key: 'bp',     label: 'BP',     unit: 'mmHg', placeholder: '120/80' },
  { key: 'pulse',  label: 'Pulse',  unit: 'bpm',  placeholder: '72'     },
  { key: 'temp',   label: 'Temp',   unit: '°F',   placeholder: '98.6'   },
  { key: 'spo2',   label: 'SpO2',   unit: '%',    placeholder: '99'     },
  { key: 'weight', label: 'Weight', unit: 'kg',   placeholder: '58'     },
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

// ─── IPD Recommendation Button ────────────────────────────────────────────────

function IPDRecommendButton({ patient }) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [sent,        setSent]        = useState(false)
  const [toast,       setToast]       = useState(false)

  const handleConfirm = () => {
    setSent(true)
    setShowConfirm(false)
    setToast(true)
    setTimeout(() => setToast(false), 3500)
  }

  if (sent) {
    return (
      <div className="mx-5 mb-3">
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5">
          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
          <p className="text-xs font-semibold text-green-800">IPD admission request sent to reception</p>
        </div>
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#1A5276] text-white text-sm font-semibold px-5 py-3.5 rounded-xl shadow-2xl">
            <BedDouble className="w-4 h-4" />
            IPD admission request sent to reception
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="mx-5 mb-3">
      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="w-full flex items-center justify-center gap-2 border-2 border-[#1A5276] text-[#1A5276] text-sm font-semibold py-2.5 rounded-lg hover:bg-[#EBF5FB] transition-colors"
        >
          <BedDouble className="w-4 h-4" /> 🏥 Recommend IPD Admission
        </button>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-4 space-y-3">
          <p className="text-xs font-semibold text-blue-800">
            Send IPD admission recommendation for <span className="font-bold">{patient?.full_name}</span> to reception staff?
          </p>
          <div className="flex gap-2">
            <button onClick={() => setShowConfirm(false)}
              className="flex-1 border border-gray-300 text-gray-600 text-xs font-semibold py-2 rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={handleConfirm}
              className="flex-1 bg-[#1A5276] text-white text-xs font-semibold py-2 rounded-lg hover:bg-[#154360]">
              Yes, Send Notification
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Queue Panel ──────────────────────────────────────────────────────────────

const STATUS_QUEUE_CFG = {
  Waiting:        { label: 'Waiting',         badge: 'bg-orange-100 text-orange-700', border: 'border-l-orange-400' },
  SentToOPD:      { label: 'Sent to OPD',     badge: 'bg-blue-100 text-blue-700',    border: 'border-l-blue-500',   ready: true },
  InConsultation: { label: 'In Consultation', badge: 'bg-blue-100 text-blue-700',    border: 'border-l-[#1A5276]',  active: true },
  Done:           { label: 'Done',            badge: 'bg-green-100 text-green-700',  border: 'border-l-green-400',  faded: true },
  OnHold:         { label: 'On Hold',         badge: 'bg-gray-100 text-gray-500',    border: 'border-l-gray-300',   faded: true },
}

const FILTER_TABS = ['All', 'Waiting', 'Done']

function QueuePanel({ visits, selectedId, onSelect, filter, onFilter, doctorName }) {
  const filtered = visits.filter((v) => {
    if (filter === 'All') return true
    if (filter === 'Waiting') return ['Waiting', 'SentToOPD', 'InConsultation'].includes(v.status)
    if (filter === 'Done') return v.status === 'Done'
    return true
  })

  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 border-b border-[#E5E7EB] flex-shrink-0">
        <p className="text-xs font-bold text-gray-900">My Patients Today</p>
        <p className="text-[10px] text-gray-400 mt-0.5">Showing visits assigned to {doctorName || 'you'}</p>
      </div>
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
      <div className="overflow-y-auto flex-1">
        {filtered.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-8">No patients</p>
        )}
        {filtered.map((v) => {
          const cfg      = STATUS_QUEUE_CFG[v.status] || STATUS_QUEUE_CFG.Waiting
          const isActive = v.id === selectedId
          const patient  = v.patients
          const age      = patient?.date_of_birth ? calcAge(patient.date_of_birth) : null
          return (
            <button
              key={v.id}
              onClick={() => onSelect(v)}
              className={`w-full text-left px-3 py-3 border-b border-[#F3F4F6] last:border-0 border-l-4 transition-all ${
                isActive
                  ? 'bg-[#EBF5FB] border-l-[#1A5276]'
                  : `${cfg.border} hover:bg-[#F8F9FA]`
              } ${cfg.faded && !isActive ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono flex-shrink-0 ${
                    v.status === 'Done' ? 'bg-green-100 text-green-700'
                    : v.status === 'InConsultation' ? 'bg-[#1A5276] text-white'
                    : 'bg-blue-100 text-blue-700'
                  }`}>{v.token || '—'}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">{patient?.full_name || '—'}</p>
                    <p className="text-[10px] text-gray-400">{age !== null ? `${age}y` : '—'} · {patient?.gender || '—'}</p>
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
              <p className="text-[9px] text-gray-400 mt-1.5">
                {v.created_at ? new Date(v.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Top Banner ───────────────────────────────────────────────────────────────

function TopBanner({ visit, doctorProfile, onBreak, onResume, isOnBreak, seenCount, waitingCount }) {
  const patient = visit?.patients
  const age     = patient?.date_of_birth ? calcAge(patient.date_of_birth) : null
  const ini     = patient ? initials(patient.full_name) : '?'

  if (isOnBreak) {
    return (
      <div className="rounded-xl overflow-hidden shadow-sm flex-shrink-0 bg-orange-500">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl">☕</div>
            <div>
              <p className="text-[10px] font-semibold text-white/70 uppercase tracking-widest">Status</p>
              <p className="text-xl font-bold text-white">Doctor is on a break</p>
              <p className="text-xs text-white/70 mt-0.5">Queue is paused. Patients are waiting.</p>
            </div>
          </div>
          <button onClick={onResume}
            className="flex items-center gap-2 bg-white text-orange-600 text-sm font-bold px-4 py-2.5 rounded-lg hover:bg-orange-50 transition-colors shadow">
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
              {patient?.full_name || 'No patient selected'}
              {visit && <span className="text-white/60 font-normal text-base ml-2">— Token {visit.token}</span>}
            </p>
            {patient?.mobile_number && (
              <p className="text-[11px] text-white/50 mt-0.5">{patient.mobile_number}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {patient && age !== null && (
            <span className="text-sm text-white/80 font-medium">
              {age}y · {patient.gender || '—'}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 bg-green-500/20 text-green-300 text-xs font-semibold px-3 py-1.5 rounded-full border border-green-400/30">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            In Consultation
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between px-6 py-2.5 bg-black/20 border-t border-white/10">
        <div className="flex items-center gap-6">
          {[
            { label: 'Seen today',  value: String(seenCount)    },
            { label: 'Waiting',     value: String(waitingCount) },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="text-white/50 text-xs">{label}:</span>
              <span className="text-white font-semibold text-sm">{value}</span>
            </div>
          ))}
        </div>
        <button onClick={onBreak}
          className="flex items-center gap-2 border border-orange-400/60 text-orange-300 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-orange-500/20 transition-colors">
          <Coffee className="w-3.5 h-3.5" /> Take a Break
        </button>
      </div>
    </div>
  )
}

// ─── Patient Info Card ────────────────────────────────────────────────────────

function PatientInfoCard({ visit }) {
  if (!visit) {
    return (
      <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm p-6 flex items-center justify-center">
        <p className="text-xs text-gray-400">Select a patient from the queue</p>
      </div>
    )
  }

  const patient = visit.patients
  const age     = patient?.date_of_birth ? calcAge(patient.date_of_birth) : null
  const ini     = initials(patient?.full_name)

  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-[#E5E7EB]">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Patient Info</p>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#1A5276] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
            {ini}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">{patient?.full_name || '—'}</p>
            <p className="text-xs text-gray-500">{age !== null ? `${age} years` : '—'} · {patient?.gender || '—'}</p>
          </div>
        </div>
        <div className="space-y-0 pt-1">
          {[
            { label: 'Contact',    value: patient?.mobile_number || '—' },
            { label: 'Department', value: visit.department || '—'       },
            { label: 'Appt Type', value: visit.appointment_type || '—' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-1.5 border-b border-[#F3F4F6] last:border-0">
              <span className="text-[11px] text-gray-500 font-medium">{label}</span>
              <span className="text-xs font-semibold text-gray-800">{value}</span>
            </div>
          ))}
        </div>
        {(patient?.symptom_tags || []).length > 0 && (
          <div>
            <p className="text-[10px] text-gray-500 font-medium mb-1.5">Symptom Tags</p>
            <div className="flex flex-wrap gap-1">
              {patient.symptom_tags.map((s) => (
                <span key={s} className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-medium">{s}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Vitals ───────────────────────────────────────────────────────────────────

function VitalsRow({ vitals, onChange }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-700 mb-2">Vitals</p>
      <div className="grid grid-cols-5 gap-2">
        {VITALS_FIELDS.map(({ key, label, unit, placeholder }) => (
          <div key={key} className="flex flex-col">
            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
              {label} <span className="text-gray-400 normal-case font-normal">({unit})</span>
            </label>
            <input
              type="text" placeholder={placeholder} value={vitals[key] || ''}
              onChange={(e) => onChange(key, e.target.value)}
              className="border border-[#E5E7EB] rounded-lg px-2.5 py-2 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276] text-center"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Presenting Complaints ────────────────────────────────────────────────────

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

// ─── Prescription Table ───────────────────────────────────────────────────────

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

// ─── Lab Test Dropdown ────────────────────────────────────────────────────────

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

// ─── Saved Action Card ────────────────────────────────────────────────────────

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

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message }) {
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

// ─── Print Layout ─────────────────────────────────────────────────────────────

function PrintLayout({ visit, doctorProfile, complaint, diagnosis, rxRows, selectedTests, notes }) {
  const patient = visit?.patients
  const age     = patient?.date_of_birth ? calcAge(patient.date_of_birth) : null
  return (
    <div id="print-area" className="hidden print:block p-8 font-sans text-gray-900" style={{ fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
        <div style={{ width: 200, height: 60, background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4 }}>
          <span style={{ color: '#9ca3af', fontSize: 12 }}>Hospital Logo</span>
        </div>
        <div>
          <p style={{ fontWeight: 700, fontSize: 18, margin: 0 }}>MediCore Hospital</p>
          <p style={{ fontSize: 12, color: '#6b7280', margin: '2px 0 0' }}>Hospital Management System</p>
        </div>
      </div>
      <hr style={{ borderColor: '#d1d5db', margin: '12px 0' }} />
      <div style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 13, margin: '4px 0' }}>
          <strong>Patient Name:</strong> {patient?.full_name || '—'} &nbsp;|&nbsp;
          <strong>Mobile:</strong> {patient?.mobile_number || '—'}
        </p>
        <p style={{ fontSize: 13, margin: '4px 0' }}>
          <strong>Age:</strong> {age !== null ? age : '—'} &nbsp;|&nbsp;
          <strong>Gender:</strong> {patient?.gender || '—'} &nbsp;|&nbsp;
          <strong>Date:</strong> {todayStr()}
        </p>
        <p style={{ fontSize: 13, margin: '4px 0' }}>
          <strong>Doctor:</strong> {doctorProfile?.full_name || '—'} &nbsp;|&nbsp;
          <strong>Dept:</strong> {visit?.department || '—'}
        </p>
      </div>
      <hr style={{ borderColor: '#d1d5db', margin: '12px 0' }} />
      <div style={{ marginBottom: 12 }}>
        {complaint && <p style={{ fontSize: 13, margin: '4px 0' }}><strong>Presenting Complaints:</strong> {complaint}</p>}
        {diagnosis  && <p style={{ fontSize: 13, margin: '4px 0' }}><strong>Diagnosis:</strong> {diagnosis}</p>}
      </div>
      <hr style={{ borderColor: '#d1d5db', margin: '12px 0' }} />
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
      {selectedTests.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Lab Tests Ordered</p>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13 }}>
            {selectedTests.map((t) => <li key={t}>{t}</li>)}
          </ul>
        </div>
      )}
      {notes && <p style={{ fontSize: 13, margin: '8px 0' }}><strong>Additional Notes:</strong> {notes}</p>}
      <hr style={{ borderColor: '#d1d5db', margin: '16px 0' }} />
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
  const { profile } = useAuth()

  // ── Data loading ────────────────────────────────────────────────────────────
  const [visits,       setVisits]       = useState([])
  const [loadError,    setLoadError]    = useState('')
  const [loadingQueue, setLoadingQueue] = useState(true)

  // Load today's visits for this doctor, joined with patient data
  const loadVisits = useCallback(async () => {
    if (!profile?.id) return
    setLoadError('')
    setLoadingQueue(true)
    try {
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)

      const { data, error } = await supabase
        .from('visits')
        .select(`
          id, hospital_id, patient_id, doctor_id, department,
          appointment_type, time_slot, token, status,
          vitals, presenting_complaint, diagnosis, notes,
          prescriptions, lab_tests_ordered, created_at, completed_at,
          patients (
            id, full_name, date_of_birth, gender, mobile_number,
            symptom_tags, referral_source
          )
        `)
        .eq('doctor_id', profile.id)
        .eq('hospital_id', profile.hospital_id)
        .gte('created_at', todayStart.toISOString())
        .order('created_at', { ascending: true })

      if (error) throw error
      setVisits(data || [])
    } catch (err) {
      console.error('Failed to load visits:', err)
      setLoadError('Failed to load patient queue. Please check your connection and try again.')
    } finally {
      setLoadingQueue(false)
    }
  }, [profile?.id, profile?.hospital_id])

  useEffect(() => { loadVisits() }, [loadVisits])

  // ── Queue / selection state ─────────────────────────────────────────────────
  const [selectedVisit, setSelectedVisit] = useState(null)
  const [queueFilter,   setQueueFilter]   = useState('All')
  const [isOnBreak,     setIsOnBreak]     = useState(false)

  // Auto-select first non-done visit on load
  useEffect(() => {
    if (visits.length > 0 && !selectedVisit) {
      const first = visits.find((v) => v.status !== 'Done') || visits[0]
      setSelectedVisit(first)
    }
  }, [visits, selectedVisit])

  // ── Consultation form state ─────────────────────────────────────────────────
  const [vitals,    setVitals]    = useState({ bp: '', pulse: '', temp: '', spo2: '', weight: '' })
  const [complaint, setComplaint] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [notes,     setNotes]     = useState('')
  const [whatsapp,  setWhatsapp]  = useState(true)
  const [rxRows,    setRxRows]    = useState([{ ...EMPTY_RX_ROW }])
  const [showLab,       setShowLab]       = useState(false)
  const [selectedTests, setSelectedTests] = useState([])

  // ── Save state ──────────────────────────────────────────────────────────────
  const [saved,      setSaved]      = useState(false)
  const [saving,     setSaving]     = useState(false)
  const [saveError,  setSaveError]  = useState('')
  const [toast,      setToast]      = useState(null)

  const updateVital = (key, val) => setVitals((v) => ({ ...v, [key]: val }))
  const updateRx    = (i, field, val) => setRxRows((r) => r.map((row, idx) => idx === i ? { ...row, [field]: val } : row))
  const addRxRow    = () => setRxRows((r) => [...r, { ...EMPTY_RX_ROW }])
  const removeRx    = (i) => setRxRows((r) => r.filter((_, idx) => idx !== i))
  const toggleTest  = (name) => setSelectedTests((t) => t.includes(name) ? t.filter((x) => x !== name) : [...t, name])

  const seenCount    = visits.filter((v) => v.status === 'Done').length
  const waitingCount = visits.filter((v) => ['Waiting', 'SentToOPD'].includes(v.status)).length

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  // Reset consultation form when a new patient is selected
  const handleSelectVisit = (v) => {
    setSelectedVisit(v)
    setSaved(false)
    setSaveError('')
    setComplaint(v.presenting_complaint || '')
    setDiagnosis(v.diagnosis || '')
    setNotes(v.notes || '')
    setVitals(v.vitals || { bp: '', pulse: '', temp: '', spo2: '', weight: '' })
    setRxRows(
      Array.isArray(v.prescriptions) && v.prescriptions.length > 0
        ? v.prescriptions
        : [{ ...EMPTY_RX_ROW }]
    )
    setSelectedTests(Array.isArray(v.lab_tests_ordered) ? v.lab_tests_ordered : [])
  }

  // Save & Mark Done — writes to Supabase visits row
  const handleSave = async () => {
    if (!selectedVisit) return
    setSaveError('')
    setSaving(true)
    try {
      const { error } = await supabase
        .from('visits')
        .update({
          vitals:               vitals,
          presenting_complaint: complaint || null,
          diagnosis:            diagnosis || null,
          notes:                notes || null,
          prescriptions:        rxRows.filter((r) => r.medicine.trim()),
          lab_tests_ordered:    selectedTests,
          status:               'Done',
          completed_at:         new Date().toISOString(),
        })
        .eq('id', selectedVisit.id)

      if (error) throw error

      // Update local state to reflect Done status
      const updatedVisit = {
        ...selectedVisit,
        vitals,
        presenting_complaint: complaint || null,
        diagnosis:            diagnosis || null,
        notes:                notes || null,
        prescriptions:        rxRows.filter((r) => r.medicine.trim()),
        lab_tests_ordered:    selectedTests,
        status:               'Done',
        completed_at:         new Date().toISOString(),
      }
      setVisits((prev) => prev.map((v) => v.id === selectedVisit.id ? updatedVisit : v))
      setSelectedVisit(updatedVisit)
      setSaved(true)
    } catch (err) {
      console.error('Failed to save consultation:', err)
      setSaveError(err.message || 'Failed to save. Please try again.')
      // Do NOT set saved=true — local queue state is not updated on failure
    } finally {
      setSaving(false)
    }
  }

  // Call Next Patient
  const handleCallNext = () => {
    const nextVisit = visits.find(
      (v) => ['Waiting', 'SentToOPD'].includes(v.status) && v.id !== selectedVisit?.id
    )
    if (nextVisit) {
      handleSelectVisit(nextVisit)
      showToast(`Next patient: ${nextVisit.patients?.full_name || '—'} (${nextVisit.token || '—'}) called`)
    } else {
      showToast('No more patients in queue')
    }
  }

  const handleBreak  = () => { setSaved(false); setIsOnBreak(true) }
  const handleResume = () => setIsOnBreak(false)
  const handlePrint  = () => window.print()

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <PrintLayout
        visit={selectedVisit}
        doctorProfile={profile}
        complaint={complaint}
        diagnosis={diagnosis}
        rxRows={rxRows}
        selectedTests={selectedTests}
        notes={notes}
      />

      <div className="flex flex-col space-y-4 print:hidden">
        {loadingQueue && (
          <div className="flex items-center justify-center py-8">
            <span className="w-5 h-5 border-2 border-gray-200 border-t-[#1A5276] rounded-full animate-spin" />
            <span className="ml-2 text-sm text-gray-400">Loading patient queue...</span>
          </div>
        )}
        {loadError && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 flex-1">{loadError}</p>
            <button onClick={loadVisits} className="text-xs font-semibold text-red-600 hover:underline flex-shrink-0">Retry</button>
          </div>
        )}

        {!loadingQueue && !loadError && (
          <>
            <TopBanner
              visit={selectedVisit}
              doctorProfile={profile}
              isOnBreak={isOnBreak}
              onBreak={handleBreak}
              onResume={handleResume}
              seenCount={seenCount}
              waitingCount={waitingCount}
            />

            <div className="grid gap-4" style={{ gridTemplateColumns: '28% 22% 1fr', minHeight: 0 }}>
              <div style={{ height: 'calc(100vh - 64px - 48px - 120px)' }}>
                <QueuePanel
                  visits={visits}
                  selectedId={selectedVisit?.id}
                  onSelect={handleSelectVisit}
                  filter={queueFilter}
                  onFilter={setQueueFilter}
                  doctorName={profile?.full_name}
                />
              </div>

              <div className="space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 64px - 48px - 120px)' }}>
                <PatientInfoCard visit={selectedVisit} />
              </div>

              <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm flex flex-col overflow-hidden"
                style={{ maxHeight: 'calc(100vh - 64px - 48px - 120px)' }}>
                <div className="px-5 py-4 border-b border-[#E5E7EB] flex-shrink-0">
                  <h3 className="text-sm font-bold text-gray-900">Consultation</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {profile?.full_name || 'Doctor'} · {profile?.specialty || selectedVisit?.department || '—'}
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
                  {saveError && (
                    <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700">{saveError}</p>
                    </div>
                  )}
                  <VitalsRow vitals={vitals} onChange={updateVital} />
                  <div className="border-t border-[#F3F4F6]" />
                  <ComplaintField value={complaint} onChange={setComplaint} />
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Diagnosis</label>
                    <input type="text" placeholder="Primary diagnosis..."
                      value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)}
                      className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276]" />
                  </div>
                  <PrescriptionTable rows={rxRows} onChange={updateRx} onAdd={addRxRow} onRemove={removeRx} />
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
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Additional Notes</label>
                    <textarea rows={2} placeholder="Follow-up instructions, diet advice, referrals..."
                      value={notes} onChange={(e) => setNotes(e.target.value)}
                      className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276] resize-none" />
                  </div>
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

                {saved && (
                  <SavedActionCard
                    patientName={selectedVisit?.patients?.full_name}
                    onCallNext={handleCallNext}
                    onBreak={handleBreak}
                  />
                )}
                {saved && selectedVisit && (
                  <IPDRecommendButton patient={selectedVisit?.patients} />
                )}

                <div className="px-5 py-4 border-t border-[#E5E7EB] flex gap-3 flex-shrink-0">
                  {!saved && (
                    <button onClick={handleSave} disabled={!selectedVisit || saving}
                      className="flex-1 flex items-center justify-center gap-2 bg-[#1E8449] text-white text-sm font-bold py-3 rounded-lg hover:bg-[#196F3D] transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
                      {saving
                        ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving...</>
                        : <><Save className="w-4 h-4" /> Save &amp; Mark Done</>}
                    </button>
                  )}
                  {saved && (
                    <div className="flex-1 flex items-center justify-center gap-2 bg-green-100 text-green-700 text-sm font-bold py-3 rounded-lg">
                      <CheckCircle2 className="w-4 h-4" /> Saved
                    </div>
                  )}
                  <button onClick={handlePrint}
                    className="flex items-center gap-2 border border-[#1A5276] text-[#1A5276] text-sm font-semibold px-4 py-3 rounded-lg hover:bg-[#EBF5FB] transition-colors">
                    <Printer className="w-4 h-4" /> Print
                  </button>
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
          </>
        )}
      </div>

      {toast && <Toast message={toast} />}

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
