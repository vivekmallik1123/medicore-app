import { useState } from 'react'
import { BedDouble, User, Calendar, Stethoscope, FileText } from 'lucide-react'
import { BEDS } from '../data/mockData.js'

// ─── Mock extended bed data ────────────────────────────────────────────────────────────

const BED_DETAILS = {
  Bed1:  { diagnosis: 'Acute Chest Pain',       doctor: 'Dr. Suresh Mehta',  discharge: '12 Jul 2025' },
  Bed2:  { diagnosis: 'Migraine — Observation', doctor: 'Dr. Priya Nair',    discharge: '10 Jul 2025' },
  Bed6:  { diagnosis: 'Diabetes Management',    doctor: 'Dr. Anita Patel',   discharge: '14 Jul 2025' },
  Bed10: { diagnosis: 'Lumbar Disc Herniation', doctor: 'Dr. Rajesh Kumar',  discharge: '15 Jul 2025' },
  ICU1:  { diagnosis: 'Post-op Monitoring',     doctor: 'Dr. Vikash Shah',   discharge: 'TBD' },
}

const WARD_FILTERS = ['All Wards', 'Ward A', 'Ward B', 'ICU']

// ─── Bed card styles ────────────────────────────────────────────────────────────────────

const BED_STYLE = {
  Occupied:    { bg: 'bg-blue-50 border-blue-200 hover:border-blue-400',    label: 'text-blue-700',  dot: 'bg-blue-500'   },
  Critical:    { bg: 'bg-red-50 border-red-200 hover:border-red-400',       label: 'text-red-700',   dot: 'bg-red-500'    },
  Empty:       { bg: 'bg-green-50 border-green-200 hover:border-green-300', label: 'text-green-700', dot: 'bg-green-500'  },
  Cleaning:    { bg: 'bg-orange-50 border-orange-200',                      label: 'text-orange-700', dot: 'bg-orange-400' },
  Maintenance: { bg: 'bg-gray-100 border-gray-200',                         label: 'text-gray-500',  dot: 'bg-gray-400'   },
}

// ─── Bed Card ───────────────────────────────────────────────────────────────────────

function BedCard({ bed, isSelected, onClick }) {
  const style   = BED_STYLE[bed.status] || BED_STYLE.Empty
  const isOccupied = bed.status === 'Occupied' || bed.status === 'Critical'
  const clickable  = isOccupied

  return (
    <div
      onClick={clickable ? onClick : undefined}
      className={`rounded-lg border-2 p-3 transition-all select-none ${
        style.bg
      } ${
        clickable ? 'cursor-pointer' : 'cursor-default'
      } ${
        isSelected ? 'ring-2 ring-[#1A5276] ring-offset-1' : ''
      }`}
      style={{ minHeight: '100px', width: '100%' }}
    >
      {/* Bed ID */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">{bed.id}</span>
        <span className={`w-2 h-2 rounded-full ${style.dot}`} />
      </div>

      {/* Content */}
      {isOccupied ? (
        <>
          <p className={`text-xs font-bold leading-tight ${style.label}`}>{bed.patient}</p>
          <p className="text-[10px] text-gray-500 mt-1">{bed.days} day{bed.days !== 1 ? 's' : ''} admitted</p>
          {bed.status === 'Critical' && (
            <span className="inline-block mt-1.5 text-[9px] font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full uppercase tracking-wide">
              Critical
            </span>
          )}
        </>
      ) : bed.status === 'Empty' ? (
        <>
          <p className={`text-xs font-semibold ${style.label}`}>Available</p>
          <button className="mt-2 text-[10px] font-semibold text-green-700 bg-green-100 hover:bg-green-200 px-2 py-0.5 rounded transition-colors">
            Admit
          </button>
        </>
      ) : bed.status === 'Cleaning' ? (
        <p className={`text-xs font-semibold ${style.label}`}>Cleaning...</p>
      ) : (
        <p className={`text-xs font-semibold ${style.label}`}>Under Maintenance</p>
      )}
    </div>
  )
}

// ─── Patient Side Panel ────────────────────────────────────────────────────────────────

function PatientPanel({ bed }) {
  if (!bed) {
    return (
      <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm h-full flex flex-col items-center justify-center text-center p-6">
        <BedDouble className="w-10 h-10 text-gray-200 mb-3" />
        <p className="text-sm font-medium text-gray-400">Select an occupied bed</p>
        <p className="text-xs text-gray-300 mt-1">to view patient details</p>
      </div>
    )
  }

  const details = BED_DETAILS[bed.id] || {}
  const initials = bed.patient ? bed.patient.split(' ').map((n) => n[0]).join('').slice(0, 2) : '?'

  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className={`px-5 py-4 border-b border-[#E5E7EB] ${ bed.status === 'Critical' ? 'bg-red-50' : 'bg-[#EBF5FB]' }`}>
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${ bed.status === 'Critical' ? 'bg-red-500' : 'bg-[#1A5276]' }`}>
            {initials}
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">{bed.patient}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{bed.id} · {bed.ward}</p>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {[
          { icon: Calendar,    label: 'Admitted',           value: `${bed.days} day${bed.days !== 1 ? 's' : ''} ago` },
          { icon: Stethoscope, label: 'Diagnosis',          value: details.diagnosis || '—' },
          { icon: User,        label: 'Attending Doctor',   value: details.doctor    || '—' },
          { icon: Calendar,    label: 'Expected Discharge', value: details.discharge || '—' },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-[#F8F9FA] rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Icon className="w-3 h-3 text-gray-400" />
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
            </div>
            <p className="text-sm font-semibold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Action */}
      <div className="px-5 py-4 border-t border-[#E5E7EB] flex-shrink-0">
        <button className="w-full flex items-center justify-center gap-2 bg-[#1A5276] text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-[#154360] transition-colors">
          <FileText className="w-4 h-4" /> View Full Chart
        </button>
      </div>
    </div>
  )
}

// ─── Ward Section ─────────────────────────────────────────────────────────────────────

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
          <BedCard
            key={bed.id}
            bed={bed}
            isSelected={selectedBed?.id === bed.id}
            onClick={() => onSelect(bed)}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

const STATS = [
  { label: 'Total Beds',   value: 80,  color: 'text-gray-900'   },
  { label: 'Occupied',     value: 54,  color: 'text-blue-600'   },
  { label: 'Available',    value: 26,  color: 'text-green-600'  },
  { label: 'Cleaning',     value: 2,   color: 'text-orange-600' },
  { label: 'Maintenance',  value: 1,   color: 'text-gray-500'   },
]

export default function IPD() {
  const [wardFilter,   setWardFilter]   = useState('All Wards')
  const [selectedBed,  setSelectedBed]  = useState(null)

  const wards = ['Ward A', 'Ward B', 'ICU']

  const visibleWards = wardFilter === 'All Wards'
    ? wards
    : [wardFilter]

  const bedsForWard = (ward) =>
    BEDS.filter((b) => b.ward === ward)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-gray-900">IPD — In-Patient Department</h2>
        <p className="text-xs text-gray-500 mt-0.5">Real-time bed occupancy across all wards</p>
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
          <button
            key={f}
            onClick={() => { setWardFilter(f); setSelectedBed(null) }}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
              wardFilter === f
                ? 'bg-white text-[#1A5276] shadow-sm border border-[#E5E7EB]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Main content: bed grid + side panel */}
      <div className="grid gap-4" style={{ gridTemplateColumns: selectedBed ? '1fr 280px' : '1fr' }}>
        {/* Bed grid */}
        <div className="space-y-6">
          {visibleWards.map((ward) => (
            <WardSection
              key={ward}
              ward={ward}
              beds={bedsForWard(ward)}
              selectedBed={selectedBed}
              onSelect={(bed) => setSelectedBed((prev) => prev?.id === bed.id ? null : bed)}
            />
          ))}
        </div>

        {/* Side panel */}
        {selectedBed && (
          <div style={{ height: 'fit-content', position: 'sticky', top: 0 }}>
            <PatientPanel bed={selectedBed} />
          </div>
        )}
      </div>
    </div>
  )
}
