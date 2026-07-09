import { useState } from 'react'

const initialQueue = [
  { id: 1, token: 'T001', name: 'Ramesh Patel', age: 45, gender: 'Male', contact: '98765 43210', reason: 'Chest pain and shortness of breath', time: '09:00 AM', status: 'Done' },
  { id: 2, token: 'T002', name: 'Priya Shah', age: 32, gender: 'Female', contact: '91234 56789', reason: 'Fever and body ache for 3 days', time: '09:15 AM', status: 'Done' },
  { id: 3, token: 'T003', name: 'Anjali Mehta', age: 28, gender: 'Female', contact: '99887 76655', reason: 'Knee pain after fall', time: '09:30 AM', status: 'In Progress' },
  { id: 4, token: 'T004', name: 'Vikram Desai', age: 60, gender: 'Male', contact: '97654 32109', reason: 'Routine diabetes checkup', time: '09:45 AM', status: 'Waiting' },
  { id: 5, token: 'T005', name: 'Sunita Joshi', age: 38, gender: 'Female', contact: '93456 78901', reason: 'Migraine and dizziness', time: '10:00 AM', status: 'Waiting' },
  { id: 6, token: 'T006', name: 'Kiran Rao', age: 52, gender: 'Male', contact: '90123 45678', reason: 'Back pain, lower spine', time: '10:15 AM', status: 'Waiting' },
  { id: 7, token: 'T007', name: 'Deepak Sharma', age: 41, gender: 'Male', contact: '88765 43210', reason: 'Skin rash and itching', time: '10:30 AM', status: 'Waiting' },
]

const statusConfig = {
  'Done': 'bg-green-100 text-green-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  'Waiting': 'bg-orange-100 text-orange-700',
}

function NewPatientModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ name: '', age: '', gender: 'Male', mobile: '', reason: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name || !form.age || !form.mobile || !form.reason) return
    onAdd(form)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">Register New Patient</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              type="text"
              placeholder="e.g. Ramesh Patel"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Age *</label>
              <input
                type="number"
                placeholder="e.g. 35"
                value={form.age}
                onChange={e => setForm({ ...form, age: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Gender</label>
              <select
                value={form.gender}
                onChange={e => setForm({ ...form, gender: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276]"
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Mobile Number *</label>
            <input
              type="tel"
              placeholder="e.g. 98765 43210"
              value={form.mobile}
              onChange={e => setForm({ ...form, mobile: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Reason for Visit *</label>
            <textarea
              placeholder="Describe symptoms or reason..."
              rows={3}
              value={form.reason}
              onChange={e => setForm({ ...form, reason: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276] resize-none"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-[#1A5276] text-white text-sm font-medium py-2 rounded-lg hover:bg-[#154360] transition-colors"
            >
              Register Patient
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Reception() {
  const [queue, setQueue] = useState(initialQueue)
  const [selected, setSelected] = useState(initialQueue[2])
  const [showModal, setShowModal] = useState(false)

  const handleAddPatient = (form) => {
    const newToken = `T${String(queue.length + 1).padStart(3, '0')}`
    const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    const newPatient = {
      id: queue.length + 1,
      token: newToken,
      name: form.name,
      age: parseInt(form.age),
      gender: form.gender,
      contact: form.mobile,
      reason: form.reason,
      time: now,
      status: 'Waiting',
    }
    setQueue([...queue, newPatient])
    setSelected(newPatient)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Reception</h2>
          <p className="text-sm text-gray-500 mt-0.5">{queue.length} patients in queue today</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#1A5276] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#154360] transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Patient
        </button>
      </div>

      <div className="grid grid-cols-5 gap-4 h-[calc(100vh-220px)]">
        {/* Queue List */}
        <div className="col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Patient Queue</p>
          </div>
          <div className="overflow-y-auto flex-1">
            {queue.map((patient) => (
              <button
                key={patient.id}
                onClick={() => setSelected(patient)}
                className={`w-full text-left px-4 py-3.5 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                  selected?.id === patient.id ? 'bg-blue-50 border-l-2 border-l-[#1A5276]' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-[#1A5276] bg-blue-50 px-2 py-0.5 rounded font-mono">
                      {patient.token}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{patient.name}</p>
                      <p className="text-xs text-gray-400">{patient.time}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusConfig[patient.status]}`}>
                    {patient.status}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Patient Detail */}
        <div className="col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {selected ? (
            <div className="h-full flex flex-col">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1A5276] text-white flex items-center justify-center text-sm font-bold">
                    {selected.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">{selected.name}</h3>
                    <p className="text-xs text-gray-500">{selected.token} · Registered at {selected.time}</p>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusConfig[selected.status]}`}>
                  {selected.status}
                </span>
              </div>

              <div className="p-6 space-y-5 flex-1">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Age', value: `${selected.age} years` },
                    { label: 'Gender', value: selected.gender },
                    { label: 'Contact', value: selected.contact },
                    { label: 'Token', value: selected.token },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                      <p className="text-sm font-semibold text-gray-900">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Reason for Visit</p>
                  <p className="text-sm text-gray-800">{selected.reason}</p>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 bg-[#1A5276] text-white text-sm font-medium py-2.5 rounded-lg hover:bg-[#154360] transition-colors">
                    Send to OPD
                  </button>
                  <button className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                    Edit Details
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              <p className="text-sm">Select a patient to view details</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <NewPatientModal
          onClose={() => setShowModal(false)}
          onAdd={handleAddPatient}
        />
      )}
    </div>
  )
}
