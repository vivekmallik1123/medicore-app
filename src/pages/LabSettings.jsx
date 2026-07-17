import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, Pencil, X, ChevronLeft, CheckCircle2,
  FlaskConical, ToggleLeft, ToggleRight,
} from 'lucide-react'
import { LAB_TEST_MASTER } from '../data/mockData.js'

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  'Hematology', 'Biochemistry', 'Microbiology',
  'Radiology', 'Cardiology', 'Pathology', 'Other',
]

const TAT_UNITS = ['hours', 'minutes']

const CATEGORY_COLORS = {
  Hematology:   'bg-red-100 text-red-700',
  Biochemistry: 'bg-blue-100 text-blue-700',
  Microbiology: 'bg-green-100 text-green-700',
  Radiology:    'bg-purple-100 text-purple-700',
  Cardiology:   'bg-pink-100 text-pink-700',
  Pathology:    'bg-yellow-100 text-yellow-700',
  Other:        'bg-gray-100 text-gray-600',
}

const EMPTY_FORM = {
  name: '', category: 'Hematology', price: '',
  tatValue: '', tatUnit: 'hours',
  referenceRange: '', specialInstructions: '', status: 'Active',
}

// ─── Add / Edit Modal ─────────────────────────────────────────────────────────

function TestModal({ initial, onSave, onClose }) {
  const isEdit = !!initial
  const [form, setForm] = useState(
    initial
      ? { ...initial, price: String(initial.price), tatValue: String(initial.tatValue) }
      : EMPTY_FORM
  )
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const valid = form.name && form.category && form.price && form.tatValue

  const handleSave = () => {
    if (!valid) return
    onSave({
      ...form,
      price:    Number(form.price),
      tatValue: Number(form.tatValue),
      tat:      `${form.tatValue} ${form.tatUnit}`,
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
      onMouseDown={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full flex flex-col"
        style={{ maxWidth: 540, maxHeight: '90vh' }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] flex-shrink-0">
          <h3 className="text-base font-bold text-gray-900">
            {isEdit ? 'Edit Test' : 'Add New Test'}
          </h3>
          <button onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto flex-1 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Test Name *</label>
            <input type="text" placeholder="e.g. Complete Blood Count"
              value={form.name} onChange={(e) => set('name', e.target.value)}
              className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276]" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Category *</label>
            <select value={form.category} onChange={(e) => set('category', e.target.value)}
              className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276] bg-white">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Price *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-semibold">Rs.</span>
              <input type="number" min="0" placeholder="250"
                value={form.price} onChange={(e) => set('price', e.target.value)}
                className="w-full border border-[#E5E7EB] rounded-lg pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276]" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Turn-Around Time (TAT) *</label>
            <div className="flex gap-2">
              <input type="number" min="1" placeholder="4"
                value={form.tatValue} onChange={(e) => set('tatValue', e.target.value)}
                className="flex-1 border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276]" />
              <select value={form.tatUnit} onChange={(e) => set('tatUnit', e.target.value)}
                className="border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276] bg-white">
                {TAT_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Reference Range <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea rows={3} placeholder="e.g. RBC: 4.5–5.5 M/µL, WBC: 4000–11000 /µL"
              value={form.referenceRange} onChange={(e) => set('referenceRange', e.target.value)}
              className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276] resize-none" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Special Instructions <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input type="text" placeholder="e.g. 12-hour fasting required"
              value={form.specialInstructions} onChange={(e) => set('specialInstructions', e.target.value)}
              className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276]" />
          </div>

          <div className="flex items-center justify-between bg-[#F8F9FA] rounded-lg px-4 py-3">
            <div>
              <p className="text-xs font-semibold text-gray-800">Status</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Inactive tests won't appear in doctor's order list</p>
            </div>
            <button type="button"
              onClick={() => set('status', form.status === 'Active' ? 'Inactive' : 'Active')}
              className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                form.status === 'Active'
                  ? 'bg-green-50 border-green-300 text-green-700'
                  : 'bg-gray-50 border-gray-300 text-gray-500'
              }`}>
              {form.status === 'Active'
                ? <ToggleRight className="w-4 h-4" />
                : <ToggleLeft className="w-4 h-4" />}
              {form.status}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E5E7EB] flex gap-3 flex-shrink-0">
          <button onClick={onClose}
            className="flex-1 border border-[#E5E7EB] text-gray-600 text-sm font-medium py-2.5 rounded-lg hover:bg-[#F8F9FA] transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={!valid}
            className="flex-1 flex items-center justify-center gap-2 bg-[#1A5276] text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-[#154360] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            <CheckCircle2 className="w-4 h-4" />
            {isEdit ? 'Save Changes' : 'Save Test'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LabSettings() {
  const navigate = useNavigate()
  const [tests, setTests] = useState(LAB_TEST_MASTER)
  const [modal, setModal] = useState(null)   // null | 'add' | { ...editTest }

  const handleSave = (data) => {
    if (modal === 'add') {
      setTests((prev) => [...prev, { ...data, id: prev.length + 1 }])
    } else {
      setTests((prev) => prev.map((t) => t.id === modal.id ? { ...t, ...data } : t))
    }
    setModal(null)
  }

  const toggleStatus = (id) =>
    setTests((prev) =>
      prev.map((t) => t.id === id ? { ...t, status: t.status === 'Active' ? 'Inactive' : 'Active' } : t)
    )

  return (
    <div className="flex flex-col space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/lab')}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#1A5276] font-medium transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to Lab
          </button>
          <div className="w-px h-4 bg-gray-300" />
          <div>
            <h2 className="text-lg font-bold text-gray-900">Lab Test Master</h2>
            <p className="text-xs text-gray-500 mt-0.5">Manage available tests, prices and reference ranges</p>
          </div>
        </div>
        <button onClick={() => setModal('add')}
          className="flex items-center gap-2 bg-[#1A5276] text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-[#154360] transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Add New Test
        </button>
      </div>

      {/* Category summary chips */}
      <div className="flex gap-2 flex-wrap">
        {Object.keys(CATEGORY_COLORS).filter((c) => c !== 'Other').map((cat) => {
          const count = tests.filter((t) => t.category === cat).length
          if (count === 0) return null
          return (
            <span key={cat} className={`text-xs font-semibold px-3 py-1 rounded-full ${CATEGORY_COLORS[cat]}`}>
              {cat} ({count})
            </span>
          )
        })}
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-700">
          Active: {tests.filter((t) => t.status === 'Active').length}
        </span>
        {tests.filter((t) => t.status === 'Inactive').length > 0 && (
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-500">
            Inactive: {tests.filter((t) => t.status === 'Inactive').length}
          </span>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F8F9FA] border-b border-[#E5E7EB]">
                {['Test Name', 'Category', 'Price (Rs.)', 'TAT', 'Reference Range', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {tests.map((test) => (
                <tr key={test.id} className={`hover:bg-[#F8F9FA] transition-colors ${
                  test.status === 'Inactive' ? 'opacity-50' : ''
                }`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FlaskConical className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <span className="text-sm font-semibold text-gray-900">{test.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                      CATEGORY_COLORS[test.category] || 'bg-gray-100 text-gray-600'
                    }`}>
                      {test.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-bold text-gray-900">Rs.{test.price}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-600 font-medium">{test.tat}</span>
                  </td>
                  <td className="px-4 py-3 max-w-[220px]">
                    <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2">{test.referenceRange}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                      test.status === 'Active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {test.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setModal(test)}
                        className="p-1.5 text-gray-400 hover:text-[#1A5276] hover:bg-[#EBF5FB] rounded-lg transition-colors"
                        title="Edit">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => toggleStatus(test.id)}
                        className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                          test.status === 'Active'
                            ? 'border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-600 hover:bg-red-50'
                            : 'border-green-300 text-green-600 hover:bg-green-50'
                        }`}>
                        {test.status === 'Active'
                          ? <><ToggleRight className="w-3.5 h-3.5" /> Deactivate</>
                          : <><ToggleLeft className="w-3.5 h-3.5" /> Activate</>}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <TestModal
          initial={modal === 'add' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
