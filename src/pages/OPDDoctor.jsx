import { useState } from 'react'

const currentPatient = {
  token: 'T003',
  name: 'Anjali Mehta',
  age: 28,
  gender: 'Female',
  contact: '99887 76655',
  bloodGroup: 'B+',
  allergies: 'None known',
}

const pastVisits = [
  { date: '12 May 2025', doctor: 'Dr. Rajesh Kumar', diagnosis: 'Sprained ankle', prescription: 'Ibuprofen 400mg' },
  { date: '03 Jan 2025', doctor: 'Dr. Anita Patel', diagnosis: 'Viral fever', prescription: 'Paracetamol 500mg, Rest' },
  { date: '18 Sep 2024', doctor: 'Dr. Anita Patel', diagnosis: 'Routine checkup', prescription: 'Multivitamins' },
]

const labTests = ['CBC (Complete Blood Count)', 'Blood Sugar (Fasting)', 'Urine Routine', 'X-Ray', 'ECG', 'Lipid Profile', 'Thyroid (TSH)']

const emptyPrescription = { medicine: '', dosage: '', days: '' }

export default function OPDDoctor() {
  const [symptoms, setSymptoms] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [notes, setNotes] = useState('')
  const [prescriptions, setPrescriptions] = useState([{ ...emptyPrescription }])
  const [showLabDropdown, setShowLabDropdown] = useState(false)
  const [selectedTests, setSelectedTests] = useState([])
  const [saved, setSaved] = useState(false)

  const addPrescriptionRow = () => {
    setPrescriptions([...prescriptions, { ...emptyPrescription }])
  }

  const updatePrescription = (index, field, value) => {
    const updated = [...prescriptions]
    updated[index][field] = value
    setPrescriptions(updated)
  }

  const removePrescription = (index) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index))
  }

  const toggleTest = (test) => {
    setSelectedTests(prev =>
      prev.includes(test) ? prev.filter(t => t !== test) : [...prev, test]
    )
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="space-y-4">
      {/* Current Patient Banner */}
      <div className="bg-[#1A5276] text-white rounded-xl px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold">
            {currentPatient.name.charAt(0)}
          </div>
          <div>
            <p className="text-xs text-blue-200 font-medium uppercase tracking-wide">Now Seeing</p>
            <p className="text-lg font-semibold">{currentPatient.name} — Token {currentPatient.token}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs bg-white/20 px-3 py-1 rounded-full">
            {currentPatient.age}y · {currentPatient.gender} · {currentPatient.bloodGroup}
          </span>
          <span className="inline-flex items-center gap-1.5 bg-green-400/20 text-green-200 text-xs font-medium px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
            In Consultation
          </span>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {/* Left Column */}
        <div className="col-span-2 space-y-4">
          {/* Patient Info Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Patient Information</h3>
            <div className="space-y-2">
              {[
                { label: 'Contact', value: currentPatient.contact },
                { label: 'Blood Group', value: currentPatient.bloodGroup },
                { label: 'Allergies', value: currentPatient.allergies },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-xs text-gray-500">{label}</span>
                  <span className="text-xs font-medium text-gray-800">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Past Visits */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800">Past Visits</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {pastVisits.map((visit, i) => (
                <div key={i} className="px-5 py-3.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-700">{visit.date}</span>
                    <span className="text-[10px] text-gray-400">{visit.doctor}</span>
                  </div>
                  <p className="text-xs text-gray-600">{visit.diagnosis}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{visit.prescription}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column — Consultation Form */}
        <div className="col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800">Consultation Notes</h3>
          </div>

          <div className="p-6 space-y-5">
            {/* Symptoms */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Symptoms</label>
              <textarea
                rows={2}
                placeholder="Describe patient symptoms..."
                value={symptoms}
                onChange={e => setSymptoms(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276] resize-none"
              />
            </div>

            {/* Diagnosis */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Diagnosis</label>
              <input
                type="text"
                placeholder="Primary diagnosis..."
                value={diagnosis}
                onChange={e => setDiagnosis(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276]"
              />
            </div>

            {/* Prescription */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-gray-700">Prescription</label>
                <button
                  onClick={addPrescriptionRow}
                  className="text-xs text-[#1A5276] font-medium hover:underline"
                >
                  + Add Medicine
                </button>
              </div>
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2 mb-1">
                  <span className="col-span-5 text-[10px] text-gray-400 font-medium uppercase">Medicine</span>
                  <span className="col-span-4 text-[10px] text-gray-400 font-medium uppercase">Dosage</span>
                  <span className="col-span-2 text-[10px] text-gray-400 font-medium uppercase">Days</span>
                </div>
                {prescriptions.map((rx, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center">
                    <input
                      type="text"
                      placeholder="e.g. Paracetamol"
                      value={rx.medicine}
                      onChange={e => updatePrescription(i, 'medicine', e.target.value)}
                      className="col-span-5 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276]"
                    />
                    <input
                      type="text"
                      placeholder="500mg 1-0-1"
                      value={rx.dosage}
                      onChange={e => updatePrescription(i, 'dosage', e.target.value)}
                      className="col-span-4 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276]"
                    />
                    <input
                      type="number"
                      placeholder="5"
                      value={rx.days}
                      onChange={e => updatePrescription(i, 'days', e.target.value)}
                      className="col-span-2 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276]"
                    />
                    {prescriptions.length > 1 && (
                      <button
                        onClick={() => removePrescription(i)}
                        className="col-span-1 text-gray-300 hover:text-red-400 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Additional Notes</label>
              <textarea
                rows={2}
                placeholder="Follow-up instructions, diet advice, etc."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276] resize-none"
              />
            </div>

            {/* Lab Tests */}
            {selectedTests.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs font-medium text-blue-700 mb-1.5">Ordered Lab Tests</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedTests.map(test => (
                    <span key={test} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{test}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={handleSave}
                className={`flex-1 text-white text-sm font-medium py-2.5 rounded-lg transition-colors shadow-sm ${
                  saved ? 'bg-green-600' : 'bg-[#1A5276] hover:bg-[#154360]'
                }`}
              >
                {saved ? '✓ Saved! Next Patient →' : 'Save & Next Patient'}
              </button>

              {/* Lab Test Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowLabDropdown(!showLabDropdown)}
                  className="flex items-center gap-2 border border-gray-200 text-gray-700 text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  Order Lab Test
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showLabDropdown && (
                  <div className="absolute right-0 bottom-full mb-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-10 py-1">
                    {labTests.map(test => (
                      <button
                        key={test}
                        onClick={() => { toggleTest(test); setShowLabDropdown(false) }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center justify-between ${
                          selectedTests.includes(test) ? 'text-[#1A5276] font-medium' : 'text-gray-700'
                        }`}
                      >
                        {test}
                        {selectedTests.includes(test) && (
                          <svg className="w-4 h-4 text-[#1A5276]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
