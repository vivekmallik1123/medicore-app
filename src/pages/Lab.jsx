import { useState, useEffect } from 'react'
import { Eye, RefreshCw, Send, Clock, FlaskConical } from 'lucide-react'
import { LAB_TESTS } from '../data/mockData.js'

// ─── Constants ────────────────────────────────────────────────────────────────

const COLUMNS = [
  {
    key:    'Ordered',
    label:  'Ordered',
    color:  'bg-orange-500',
    light:  'bg-orange-50',
    border: 'border-orange-200',
    text:   'text-orange-700',
    count:  'bg-orange-100 text-orange-700',
  },
  {
    key:    'SampleCollected',
    label:  'Sample Collected',
    color:  'bg-blue-500',
    light:  'bg-blue-50',
    border: 'border-blue-200',
    text:   'text-blue-700',
    count:  'bg-blue-100 text-blue-700',
  },
  {
    key:    'Processing',
    label:  'Processing',
    color:  'bg-purple-500',
    light:  'bg-purple-50',
    border: 'border-purple-200',
    text:   'text-purple-700',
    count:  'bg-purple-100 text-purple-700',
  },
  {
    key:    'ReportReady',
    label:  'Report Ready',
    color:  'bg-green-500',
    light:  'bg-green-50',
    border: 'border-green-200',
    text:   'text-green-700',
    count:  'bg-green-100 text-green-700',
  },
]

const PRIORITY_BADGE = {
  Critical: 'bg-red-100 text-red-700',
  Urgent:   'bg-orange-100 text-orange-700',
  Normal:   'bg-gray-100 text-gray-600',
}

// Elapsed times (static mock)
const ELAPSED = {
  1: '45 min',
  2: '1 hr 30 min',
  3: '55 min',
  4: '30 min',
  5: '25 min',
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

function ElapsedTimer({ testId }) {
  const [secs, setSecs] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setSecs((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [])
  const base = ELAPSED[testId] || '0 min'
  return (
    <span className="flex items-center gap-1 text-[10px] text-gray-400">
      <Clock className="w-3 h-3" />
      {base} elapsed
    </span>
  )
}

// ─── Lab Card ─────────────────────────────────────────────────────────────────────

function LabCard({ test, onMove }) {
  const isReady = test.status === 'ReportReady'

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

      {/* Elapsed */}
      <ElapsedTimer testId={test.id} />

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        {isReady ? (
          <button className="flex-1 flex items-center justify-center gap-1.5 bg-[#1E8449] text-white text-xs font-semibold py-1.5 rounded-lg hover:bg-[#196F3D] transition-colors">
            <Send className="w-3 h-3" /> Send Report
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
    </div>
  )
}

// ─── Kanban Column ───────────────────────────────────────────────────────────────────

function KanbanColumn({ col, tests, onMove }) {
  return (
    <div className="flex flex-col min-h-0">
      {/* Column header */}
      <div className={`flex items-center justify-between px-3 py-2.5 rounded-t-lg ${col.color}`}>
        <span className="text-xs font-bold text-white uppercase tracking-wide">{col.label}</span>
        <span className="text-[10px] font-bold bg-white/30 text-white px-2 py-0.5 rounded-full">
          {tests.length}
        </span>
      </div>

      {/* Cards */}
      <div className={`flex-1 overflow-y-auto p-2 space-y-2 rounded-b-lg border border-t-0 ${col.border} ${col.light} min-h-[120px]`}>
        {tests.length === 0 && (
          <div className="flex items-center justify-center h-20">
            <p className="text-xs text-gray-400">No tests</p>
          </div>
        )}
        {tests.map((t) => (
          <LabCard key={t.id} test={t} onMove={onMove} />
        ))}
      </div>
    </div>
  )
}

// ─── Status progression ────────────────────────────────────────────────────────────────

const STATUS_ORDER = ['Ordered', 'SampleCollected', 'Processing', 'ReportReady']

function nextStatus(current) {
  const idx = STATUS_ORDER.indexOf(current)
  return idx < STATUS_ORDER.length - 1 ? STATUS_ORDER[idx + 1] : current
}

// ─── Main Page ───────────────────────────────────────────────────────────────

const FILTERS = ['All', 'Urgent', 'Critical', 'Normal']

export default function Lab() {
  const [tests,  setTests]  = useState(LAB_TESTS)
  const [filter, setFilter] = useState('All')

  const filtered = filter === 'All'
    ? tests
    : tests.filter((t) => t.priority === filter)

  const moveTest = (id) => {
    setTests((prev) =>
      prev.map((t) => t.id === id ? { ...t, status: nextStatus(t.status) } : t)
    )
  }

  return (
    <div className="flex flex-col space-y-4" style={{ height: 'calc(100vh - 64px - 48px)' }}>
      {/* Header */}
      <div className="flex items-start justify-between flex-shrink-0">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Diagnostic Lab</h2>
          <p className="text-xs text-gray-500 mt-0.5">{tests.length} tests today · {tests.filter(t => t.status === 'ReportReady').length} reports ready</p>
        </div>
        <div className="flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-500">Live board</span>
        </div>
      </div>

      {/* Filter buttons */}
      <div className="flex gap-2 flex-shrink-0">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              filter === f
                ? 'bg-[#1A5276] text-white border-[#1A5276] shadow-sm'
                : 'bg-white text-gray-600 border-[#E5E7EB] hover:bg-[#F8F9FA]'
            }`}
          >
            {f}
            {f !== 'All' && (
              <span className="ml-1.5 text-[10px] opacity-70">
                ({tests.filter(t => t.priority === f).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Kanban board */}
      <div className="grid grid-cols-4 gap-3 flex-1 min-h-0">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.key}
            col={col}
            tests={filtered.filter((t) => t.status === col.key)}
            onMove={moveTest}
          />
        ))}
      </div>
    </div>
  )
}
