import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronLeft, CheckCircle2, User, FileText,
  Shield, BedDouble, X,
} from 'lucide-react'
import { BEDS } from '../data/mockData.js'

// ─── Mock patient from OPD recommendation ─────────────────────────────────────────────────────

const RECOMMENDED_PATIENT = {
  name:       'Anjali Mehta',
  uhid:       'PT-000003',
  age:        28,
  gender:     'Female',
  dob:        '1997-11-05',
  contact:    '9988776655',
  bloodGroup: 'A+',
  allergies:  'None',
  chronicConditions: [],
  reason:     'Knee pain after fall — Dr. Rajesh Kumar recommends IPD admission for further evaluation and physiotherapy.',
  doctor:     'Dr. Rajesh Kumar',
  department: 'Orthopedics',
  token:      'T003',
}

const ID_TYPES = ['Aadhar Card', 'PAN Card', 'Passport', 'Voter ID', 'Driving License']
const GOVT_SCHEMES = ['PMJAY', 'CGHS', 'ESIC', 'State Scheme', 'Other']
const DURATION_OPTIONS = ['1-3 days', '3-7 days', '1-2 weeks', 'More than 2 weeks']
const RELATIONS = ['Spouse', 'Parent', 'Child', 'Sibling', 'Friend', 'Other']

const WARD_NAMES = ['Ward A', 'Ward B', 'ICU']

const TABS = [
  { key: 'patient',    label: 'Patient Details',          icon: User       },
  { key: 'documents',  label: 'Documents & ID',           icon: FileText   },
  { key: 'insurance',  label: 'Insurance & Schemes',      icon: Shield     },
  { key: 'admission',  label: 'Admission Details',        icon: BedDouble  },
]

export default function IPDAdmission() {
  const navigate = useNavigate()
  const [activeTab,   setActiveTab]   = useState('patient')
  const [beds,        setBeds]        = useState(BEDS)

  // Tab 2 state
  const [idType,   setIdType]   = useState('')
  const [idNumber, setIdNumber] = useState('')

  // Tab 3 state
  const [hasInsurance,  setHasInsurance]  = useState(false)
  const [insurance,     setInsurance]     = useState({ company: '', policy: '', tpa: '', preAuth: false })
  const [hasGovtScheme, setHasGovtScheme] = useState(false)
  const [govtScheme,    setGovtScheme]    = useState({ scheme: '', cardNo: '' })

  // Tab 4 state
  const [selectedWard, setSelectedWard] = useState('')
  const [selectedBed,  setSelectedBed]  = useState(null)
  const [duration,     setDuration]     = useState('')
  const [attendant,    setAttendant]    = useState({ name: '', contact: '', relation: '' })

  // Confirmation
  const [confirmed, setConfirmed] = useState(false)

  const availableBeds = beds.filter((b) => b.ward === selectedWard && b.status === 'Empty')

  const wardAvailability = WARD_NAMES.map((w) => ({
    name: w,
    available: beds.filter((b) => b.ward === w && b.status === 'Empty').length,
  }))

  const handleConfirm = () => {
    if (!selectedBed) return
    setBeds((prev) =>
      prev.map((b) =>
        b.id === selectedBed.id
          ? { ...b, status: 'Occupied', patient: RECOMMENDED_PATIENT.name, days: 0,
              uhid: RECOMMENDED_PATIENT.uhid, admitDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
              diagnosis: 'Knee pain — IPD admission', doctor: RECOMMENDED_PATIENT.doctor, discharge: 'TBD' }
          : b
      )
    )
    setConfirmed(true)
  }

  if (confirmed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900">Admission Confirmed!</h2>
          <p className="text-sm text-gray-600 mt-2">
            <span className="font-semibold">{RECOMMENDED_PATIENT.name}</span> admitted to{' '}
            <span className="font-semibold">{selectedWard}, Bed {selectedBed?.id}</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">UHID: {RECOMMENDED_PATIENT.uhid}</p>
          <p className="text-xs text-green-600 mt-1 font-semibold">Daily room charges have started</p>
        </div>
        <button onClick={() => navigate('/ipd')}
          className="flex items-center gap-2 bg-[#1A5276] text-white text-sm font-semibold px-6 py-3 rounded-lg hover:bg-[#154360] transition-colors shadow-sm">
          <BedDouble className="w-4 h-4" /> Go to IPD
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#1A5276] font-medium transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <div className="w-px h-4 bg-gray-300" />
        <div>
          <h2 className="text-lg font-bold text-gray-900">IPD Admission</h2>
          <p className="text-xs text-gray-500 mt-0.5">Recommended by {RECOMMENDED_PATIENT.doctor}</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-[#E5E7EB]">
        {TABS.map(({ key, label, icon: Icon }, i) => {
          const tabKeys = TABS.map((t) => t.key)
          const activeIdx = tabKeys.indexOf(activeTab)
          const thisIdx   = tabKeys.indexOf(key)
          const done = thisIdx < activeIdx
          return (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all ${
                activeTab === key
                  ? 'border-[#1A5276] text-[#1A5276]'
                  : done
                  ? 'border-transparent text-green-600'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}>
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{i + 1}</span>
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm">

        {/* Tab 1: Patient Details */}
        {activeTab === 'patient' && (
          <div className="px-6 py-5 space-y-4">
            <p className="text-sm font-bold text-gray-800">Patient Information</p>
            <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
              <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wide mb-1">IPD Recommendation</p>
              <p className="text-xs text-blue-800 leading-relaxed">{RECOMMENDED_PATIENT.reason}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Full Name',   value: RECOMMENDED_PATIENT.name       },
                { label: 'UHID',        value: RECOMMENDED_PATIENT.uhid       },
                { label: 'Age',         value: `${RECOMMENDED_PATIENT.age} years` },
                { label: 'Gender',      value: RECOMMENDED_PATIENT.gender     },
                { label: 'Contact',     value: RECOMMENDED_PATIENT.contact    },
                { label: 'Blood Group', value: RECOMMENDED_PATIENT.bloodGroup },
                { label: 'Allergies',   value: RECOMMENDED_PATIENT.allergies  },
                { label: 'Doctor',      value: RECOMMENDED_PATIENT.doctor     },
              ].map(({ label, value }) => (
                <div key={label} className="bg-[#F8F9FA] rounded-lg px-4 py-3">
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{value}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <button onClick={() => setActiveTab('documents')}
                className="flex items-center gap-2 bg-[#1A5276] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#154360] transition-colors">
                Next: Documents &rarr;
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Documents & ID */}
        {activeTab === 'documents' && (
          <div className="px-6 py-5 space-y-4">
            <p className="text-sm font-bold text-gray-800">Documents & ID Verification</p>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">ID Type *</label>
              <select value={idType} onChange={(e) => setIdType(e.target.value)}
                className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276] bg-white">
                <option value="">Select ID type...</option>
                {ID_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">ID Number *</label>
              <input type="text" placeholder="Enter ID number" value={idNumber} onChange={(e) => setIdNumber(e.target.value)}
                className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276]" />
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 flex items-start gap-2">
              <span className="text-gray-400 text-sm mt-0.5">ℹ</span>
              <p className="text-xs text-gray-500">Upload functionality coming soon. Please note the ID details manually for now.</p>
            </div>
            <div className="flex justify-between">
              <button onClick={() => setActiveTab('patient')}
                className="border border-[#E5E7EB] text-gray-600 text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-[#F8F9FA]">Back</button>
              <button onClick={() => setActiveTab('insurance')}
                className="flex items-center gap-2 bg-[#1A5276] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#154360] transition-colors">
                Next: Insurance &rarr;
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Insurance & Government Schemes */}
        {activeTab === 'insurance' && (
          <div className="px-6 py-5 space-y-5">
            <p className="text-sm font-bold text-gray-800">Insurance & Government Schemes</p>

            {/* Insurance toggle */}
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-[#F8F9FA] rounded-lg px-4 py-3">
                <p className="text-sm font-semibold text-gray-800">Patient has insurance?</p>
                <button onClick={() => setHasInsurance((v) => !v)}
                  className={`relative rounded-full transition-colors flex-shrink-0`}
                  style={{ height: 22, width: 40, background: hasInsurance ? '#1A5276' : '#D1D5DB' }}>
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    hasInsurance ? 'translate-x-5' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
              {hasInsurance && (
                <div className="space-y-3 pl-2">
                  {[
                    { label: 'Insurance Company', key: 'company', placeholder: 'e.g. Star Health' },
                    { label: 'Policy Number',     key: 'policy',  placeholder: 'e.g. SH-2024-001' },
                    { label: 'TPA Name',          key: 'tpa',     placeholder: 'e.g. Medi Assist'  },
                  ].map(({ label, key, placeholder }) => (
                    <div key={key}>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">{label}</label>
                      <input type="text" placeholder={placeholder}
                        value={insurance[key]} onChange={(e) => setInsurance((p) => ({ ...p, [key]: e.target.value }))}
                        className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276]" />
                    </div>
                  ))}
                  <div className="flex items-center justify-between bg-[#F8F9FA] rounded-lg px-4 py-3">
                    <p className="text-xs font-semibold text-gray-700">Pre-authorization required?</p>
                    <button onClick={() => setInsurance((p) => ({ ...p, preAuth: !p.preAuth }))}
                      className="relative rounded-full transition-colors flex-shrink-0"
                      style={{ height: 22, width: 40, background: insurance.preAuth ? '#1A5276' : '#D1D5DB' }}>
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        insurance.preAuth ? 'translate-x-5' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Govt scheme toggle */}
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-[#F8F9FA] rounded-lg px-4 py-3">
                <p className="text-sm font-semibold text-gray-800">Government health scheme?</p>
                <button onClick={() => setHasGovtScheme((v) => !v)}
                  className="relative rounded-full transition-colors flex-shrink-0"
                  style={{ height: 22, width: 40, background: hasGovtScheme ? '#1A5276' : '#D1D5DB' }}>
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    hasGovtScheme ? 'translate-x-5' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
              {hasGovtScheme && (
                <div className="space-y-3 pl-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Scheme</label>
                    <select value={govtScheme.scheme} onChange={(e) => setGovtScheme((p) => ({ ...p, scheme: e.target.value }))}
                      className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276] bg-white">
                      <option value="">Select scheme...</option>
                      {GOVT_SCHEMES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Card Number</label>
                    <input type="text" placeholder="e.g. PMJAY-GJ-001234" value={govtScheme.cardNo}
                      onChange={(e) => setGovtScheme((p) => ({ ...p, cardNo: e.target.value }))}
                      className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276]" />
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                    <p className="text-xs text-gray-500">ℹ Scheme verification will be added in a future update.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <button onClick={() => setActiveTab('documents')}
                className="border border-[#E5E7EB] text-gray-600 text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-[#F8F9FA]">Back</button>
              <button onClick={() => setActiveTab('admission')}
                className="flex items-center gap-2 bg-[#1A5276] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#154360] transition-colors">
                Next: Admission &rarr;
              </button>
            </div>
          </div>
        )}

        {/* Tab 4: Admission Details */}
        {activeTab === 'admission' && (
          <div className="px-6 py-5 space-y-5">
            <p className="text-sm font-bold text-gray-800">Admission Details</p>

            {/* Ward selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Select Ward *</label>
              <div className="grid grid-cols-3 gap-3">
                {wardAvailability.map(({ name, available }) => (
                  <button key={name} onClick={() => { setSelectedWard(name); setSelectedBed(null) }}
                    className={`flex flex-col items-center py-3 px-2 rounded-xl border-2 transition-all ${
                      selectedWard === name
                        ? 'border-[#1A5276] bg-[#EBF5FB]'
                        : 'border-[#E5E7EB] hover:bg-[#F8F9FA]'
                    }`}>
                    <BedDouble className={`w-5 h-5 mb-1 ${
                      selectedWard === name ? 'text-[#1A5276]' : 'text-gray-400'
                    }`} />
                    <p className={`text-xs font-bold ${
                      selectedWard === name ? 'text-[#1A5276]' : 'text-gray-700'
                    }`}>{name}</p>
                    <p className={`text-[10px] mt-0.5 ${
                      available === 0 ? 'text-red-500' : selectedWard === name ? 'text-[#1A5276]/70' : 'text-gray-400'
                    }`}>
                      {available === 0 ? 'Full' : `${available} bed${available !== 1 ? 's' : ''} available`}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Bed selector */}
            {selectedWard && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Select Bed *</label>
                {availableBeds.length === 0 ? (
                  <p className="text-xs text-red-500">No beds available in {selectedWard}</p>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {availableBeds.map((bed) => (
                      <button key={bed.id} onClick={() => setSelectedBed(bed)}
                        className={`py-3 rounded-xl border-2 text-sm font-bold transition-all ${
                          selectedBed?.id === bed.id
                            ? 'border-[#1A5276] bg-[#1A5276] text-white'
                            : 'border-[#E5E7EB] text-gray-700 hover:border-[#1A5276]/50 hover:bg-[#EBF5FB]'
                        }`}>{bed.id}</button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Expected duration */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Expected Duration</label>
              <div className="grid grid-cols-2 gap-2">
                {DURATION_OPTIONS.map((d) => (
                  <button key={d} onClick={() => setDuration(d)}
                    className={`py-2.5 rounded-lg border-2 text-xs font-semibold transition-all ${
                      duration === d
                        ? 'border-[#1A5276] bg-[#EBF5FB] text-[#1A5276]'
                        : 'border-[#E5E7EB] text-gray-600 hover:bg-[#F8F9FA]'
                    }`}>{d}</button>
                ))}
              </div>
            </div>

            {/* Attendant details */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Attendant Details <span className="text-gray-400 font-normal">(optional)</span></label>
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Attendant Name"
                  value={attendant.name} onChange={(e) => setAttendant((p) => ({ ...p, name: e.target.value }))}
                  className="border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276]" />
                <input type="tel" placeholder="Attendant Contact"
                  value={attendant.contact} onChange={(e) => setAttendant((p) => ({ ...p, contact: e.target.value }))}
                  className="border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276]" />
                <select value={attendant.relation} onChange={(e) => setAttendant((p) => ({ ...p, relation: e.target.value }))}
                  className="col-span-2 border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276] bg-white">
                  <option value="">Relation to patient...</option>
                  {RELATIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            <div className="flex justify-between">
              <button onClick={() => setActiveTab('insurance')}
                className="border border-[#E5E7EB] text-gray-600 text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-[#F8F9FA]">Back</button>
              <button
                onClick={handleConfirm}
                disabled={!selectedBed}
                className="flex items-center gap-2 bg-[#1E8449] text-white text-sm font-bold px-6 py-2.5 rounded-lg hover:bg-[#196F3D] transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
                <CheckCircle2 className="w-4 h-4" /> Confirm Admission
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
