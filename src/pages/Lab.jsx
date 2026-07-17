/**
 * Lab.jsx — Diagnostic Lab Kanban Board
 *
 * FLOW:
 *   1. ORDERED          — Doctor orders a test from OPD; card appears here.
 *   2. SAMPLE COLLECTED — Lab technician collects the patient's sample.
 *   3. PROCESSING       — Sample is loaded into the machine / being analysed.
 *                          A TAT (Turn-Around Time) timer is shown.
 *                          Colour: green < 50% elapsed, orange 50-75%,
 *                          red + ⚠ warning > 75% elapsed.
 *   4. REPORT READY     — Results entered by the technician.
 *   5. DELIVERED        — "Send Report" clicked; report sent to patient via
 *                          WhatsApp and card moves to this final teal column.
 *
 * Each card advances one step at a time via the "Update" button.
 * Priority filters (All / Urgent / Critical / Normal) apply across all columns.
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Eye, RefreshCw, Send, Clock, FlaskConical,
  Settings, AlertTriangle, CheckCircle2, MessageCircle,
} from 'lucide-react'
import { LAB_TESTS } from '../data/mockData.js'

// ─── Column definitions ───────────────────────────────────────────────────────

const COLUMNS = [
  { key: 'Ordered',         label: 'Ordered',         color: 'bg-orange-500', light: 'bg-orange-50', border: 'border-orange-200' },
  { key: 'SampleCollected', label: 'Sample Collected', color: 'bg-blue-500',   light: 'bg-blue-50',   border: 'border-blue-200'   },
  { key: 'Processing',      label: 'Processing',       color: 'bg-purple-500', light: 'bg-purple-50', border: 'border-purple-200' },
  { key: 'ReportReady',     label: 'Report Ready',     color: 'bg-green-500',  light: 'bg-green-50',  border: 'border-green-200'  },
  { key: 'Delivered',       label: 'Delivered',        color: 'bg-teal-500',   light: 'bg-teal-50',   border: 'border-teal-200'   },
]

const PRIORITY_BADGE = {
  Critical: 'bg-red-100 text-red-700',
  Urgent:   'bg-orange-100 text-orange-700',
  Normal:   'bg-gray-100 text-gray-600',
}

const STATUS_ORDER = ['Ordered', 'SampleCollected', 'Processing', 'ReportReady', 'Delivered']

function nextStatus(current) {
  const idx = STATUS_ORDER.indexOf(current)
  return idx < STATUS_ORDER.length - 1 ? STATUS_ORDER[idx + 1] : current
}

// ─── TAT Timer ────────────────────────────────────────────────────────────────

function TATTimer({ test }) {
  const [extraSecs, setExtraSecs] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setExtraSecs((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const tatMins     = test.tatMinutes || 60
  const elapsedMins = (test.elapsedMinutes || 0) + Math.floor(extraSecs / 60)
  const pct         = Math.min((elapsedMins / tatMins) * 100, 100)

  const timerCls =
    pct < 50  ? 'text-green-600'
    : pct < 75 ? 'text-orange-500'
    : 'text-red-600'

  const showWarning = pct >= 75

  const hrs   = Math.floor(elapsedMins / 60)
  const mins  = elapsedMins % 60
  const label = hrs > 0 ? `${hrs}h ${mins}m elapsed` : `${mins}m elapsed`

  const tatH = Math.floor(tatMins / 60)
  const tatM = tatMins % 60
  const tatLabel = tatH > 0 ? `${tatH}h${tatM > 0 ? ` ${tatM}m` : ''}` : `${tatM}m`

  return (
    <span className={`flex items-center gap-1 text-[10px] font-semibold ${timerCls}`}>
      {showWarning
        ? <AlertTriangle className="w-3 h-3" />
        : <Clock className="w-3 h-3" />}
      {label}
      <span className="text-gray-400 font-normal">/ TAT {tatLabel}</span>
    </span>
  )
}

// ─── Lab Card ─────────────────────────────────────────────────────────────────

function LabCard({ test, onMove, onDeliver }) {
  const isReady     = test.status === 'ReportReady'
  const isDelivered = test.status === 'Delivered'
  const [sent, setSent] = useState(false)

  const handleSend = () => {
    setSent(true)
    setTimeout(() => onDeliver(test.id), 1400)
  }

  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm p-4 space-y-3">
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate">{test.patient}</p>
          <p className="text-xs font-semibold text-gray-700 mt-0.5">{test.test}</p>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
          PRIORITY_BADGE[test.priority] || PRIORITY_BADGE.Normal
        }`}>
          {test.priority.toUpperCase()}
        </span>
      </div>

      {/* Doctor + time */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-gray-500">{test.orderedBy}</p>
        <p className="text-[11px] text-gray-500">{test.orderedAt}</p>
      </div>

      {/* TAT timer */}
      {!isDelivered && <TATTimer test={test} />}

      {/* Delivered state */}
      {isDelivered && (
        <div className="flex items-center gap-1.5 text-[10px] text-teal-600 font-semibold">
          <CheckCircle2 className="w-3 h-3" /> Delivered
        </div>
      )}

      {/* In-card WhatsApp confirmation */}
      {sent && !isDelivered && (
        <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-lg px-2.5 py-1.5">
          <MessageCircle className="w-3 h-3 text-green-600" />
          <span className="text-[10px] text-green-700 font-semibold">Report sent to patient via WhatsApp ✓</span>
        </div>
      )}

      {/* Actions */}
      {!isDelivered && (
        <div className="flex gap-2 pt-1">
          {isReady ? (
            <button
              onClick={handleSend}
              disabled={sent}
              className="flex-1 flex items-center justify-center gap-1.5 bg-[#1E8449] text-white text-xs font-semibold py-1.5 rounded-lg hover:bg-[#196F3D] transition-colors disabled:opacity-60"
            >
              <Send className="w-3 h-3" /> {sent ? 'Sending…' : 'Send Report'}
            </button>
          ) : (
            <>
              <button className="flex items-center gap-1 border border-[#E5E7EB] text-gray-600 text-xs font-medium px-2.5 py-1.5 rounded-lg hover:bg-[#F8F9FA] transition-colors">
                <Eye className="w-3 h-3" /> View
              </button>
              <button
                onClick={() => onMove(test.id)}
                className="flex-1 flex items-center justify-center gap-1 bg-[#1A5276] text-white text-xs font-semibold py-1.5 rounded-lg hover:bg-[#154360] transition-colors"
              >
                <RefreshCw className="w-3 h-3" /> Update
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Kanban Column ────────────────────────────────────────────────────────────

function KanbanColumn({ col, tests, onMove, onDeliver }) {
  return (
    <div className="flex flex-col min-h-0">
      <div className={`flex items-center justify-between px-3 py-2.5 rounded-t-lg ${col.color}`}>
        <span className="text-xs font-bold text-white uppercase tracking-wide">{col.label}</span>
        <span className="text-[10px] font-bold bg-white/30 text-white px-2 py-0.5 rounded-full">
          {tests.length}
        </span>
      </div>
      <div className={`flex-1 overflow-y-auto p-2 space-y-2 rounded-b-lg border border-t-0 ${col.border} ${col.light} min-h-[120px]`}>
        {tests.length === 0 && (
          <div className="flex items-center justify-center h-20">
            <p className="text-xs text-gray-400">No tests</p>
          </div>
        )}
        {tests.map((t) => (
          <LabCard key={t.id} test={t} onMove={onMove} onDeliver={onDeliver} />
        ))}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const FILTERS = ['All', 'Urgent', 'Critical', 'Normal']

export default function Lab() {
  const navigate = useNavigate()
  const [tests,  setTests]  = useState(LAB_TESTS)
  const [filter, setFilter] = useState('All')

  const filtered = filter === 'All'
    ? tests
    : tests.filter((t) => t.priority === filter)

  const moveTest    = (id) => setTests((prev) => prev.map((t) => t.id === id ? { ...t, status: nextStatus(t.status) } : t))
  const deliverTest = (id) => setTests((prev) => prev.map((t) => t.id === id ? { ...t, status: 'Delivered' } : t))

  return (
    <div className="flex flex-col space-y-4" style={{ height: 'calc(100vh - 64px - 48px)' }}>
      {/* Header */}
      <div className="flex items-start justify-between flex-shrink-0">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Diagnostic Lab</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {tests.length} tests today · {tests.filter((t) => t.status === 'ReportReady').length} reports ready
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500">Live board</span>
          </div>
          <button
            onClick={() => navigate('/lab-settings')}
            className="flex items-center gap-2 border border-[#E5E7EB] text-gray-600 text-xs font-semibold px-3 py-2 rounded-lg hover:bg-[#F8F9FA] transition-colors"
          >
            <Settings className="w-3.5 h-3.5" /> Manage Tests
          </button>
        </div>
      </div>

      {/* Priority filters */}
      <div className="flex gap-2 flex-shrink-0">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              filter === f
                ? 'bg-[#1A5276] text-white border-[#1A5276] shadow-sm'
                : 'bg-white text-gray-600 border-[#E5E7EB] hover:bg-[#F8F9FA]'
            }`}>
            {f}
            {f !== 'All' && (
              <span className="ml-1.5 text-[10px] opacity-70">
                ({tests.filter((t) => t.priority === f).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Kanban board — 5 columns */}
      <div className="grid gap-3 flex-1 min-h-0" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.key}
            col={col}
            tests={filtered.filter((t) => t.status === col.key)}
            onMove={moveTest}
            onDeliver={deliverTest}
          />
        ))}
      </div>
    </div>
  )
}
