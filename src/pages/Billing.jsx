import { useState, useMemo } from 'react'
import {
  Search,
  Printer,
  MessageCircle,
  CheckCircle2,
  Banknote,
  Smartphone,
  CreditCard,
  ShieldCheck,
} from 'lucide-react'
import StatusBadge from '../components/StatusBadge.jsx'
import { BILLS, BILLING_STATUS } from '../data/mockData.js'

// ─── Constants ────────────────────────────────────────────────────────────────

const GST_RATE = 0.09

const CATEGORY_BADGE = {
  Consultation: 'bg-blue-100 text-blue-700',
  'Lab Test':   'bg-purple-100 text-purple-700',
  Medicine:     'bg-green-100 text-green-700',
}

const PAYMENT_MODES = [
  { key: 'Cash',      label: 'Cash',      icon: Banknote    },
  { key: 'UPI',       label: 'UPI',       icon: Smartphone  },
  { key: 'Card',      label: 'Card',      icon: CreditCard  },
  { key: 'Insurance', label: 'Insurance', icon: ShieldCheck },
]

// Extend BILLS with a 5th entry for Sunita Joshi
const ALL_BILLS = [
  ...BILLS,
  {
    id: 'INV-2025-005',
    patient: 'Sunita Joshi',
    token: 'T005',
    date: '09 Jul 2025',
    doctor: 'Dr. Priya Nair',
    department: 'Gynecology',
    status: 'Pending',
    items: [
      { description: 'OPD Consultation — Gynecology', category: 'Consultation', amount: 600 },
      { description: 'Urine Routine',                  category: 'Lab Test',     amount: 120 },
      { description: 'Sumatriptan 50mg (6 tabs)',       category: 'Medicine',     amount: 210 },
    ],
  },
]

// ─── Helpers ────────────────────────────────────────────────────────────────────

function fmt(n) {
  return 'Rs.' + n.toLocaleString('en-IN')
}

function calcTotals(items) {
  const subtotal = items.reduce((s, i) => s + i.amount, 0)
  const cgst     = Math.round(subtotal * GST_RATE)
  const sgst     = Math.round(subtotal * GST_RATE)
  const total    = subtotal + cgst + sgst
  return { subtotal, cgst, sgst, total }
}

// ─── Invoice List (Left panel) ────────────────────────────────────────────────────────

function InvoiceList({ bills, selected, onSelect }) {
  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#E5E7EB] flex items-center justify-between flex-shrink-0">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Invoices</p>
        <span className="text-[10px] font-bold bg-[#1A5276] text-white px-2 py-0.5 rounded-full">
          {bills.length}
        </span>
      </div>

      {/* List */}
      <div className="overflow-y-auto flex-1 divide-y divide-[#F3F4F6]">
        {bills.length === 0 && (
          <div className="flex items-center justify-center h-32">
            <p className="text-sm text-gray-400">No invoices found</p>
          </div>
        )}
        {bills.map((bill) => {
          const isSelected  = selected?.id === bill.id
          const { total }   = calcTotals(bill.items)
          const rxTag       = BILLING_STATUS[bill.id]
          return (
            <button
              key={bill.id}
              onClick={() => onSelect(bill)}
              className={`w-full text-left px-4 py-3.5 transition-all border-l-4 ${
                isSelected
                  ? 'bg-[#EBF5FB] border-l-[#1A5276]'
                  : 'hover:bg-[#F8F9FA] border-l-transparent'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-gray-900 truncate">{bill.patient}</p>
                    {rxTag === 'PRESCRIPTION_PENDING' && (
                      <span className="text-[9px] font-bold bg-yellow-100 text-yellow-700 border border-yellow-200 px-1.5 py-0.5 rounded-full whitespace-nowrap">Rx Pending</span>
                    )}
                    {rxTag === 'READY_TO_COLLECT' && (
                      <span className="text-[9px] font-bold bg-green-100 text-green-700 border border-green-200 px-1.5 py-0.5 rounded-full whitespace-nowrap">Ready</span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5 font-mono">
                    {bill.id} · {bill.token}
                  </p>
                  <p className="text-xs font-semibold text-gray-700 mt-1">{fmt(total)}</p>
                </div>
                <StatusBadge status={bill.status} size="sm" />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Invoice Detail (Right panel) ──────────────────────────────────────────────────────

function InvoiceDetail({ bill, onMarkPaid }) {
  const [payMode, setPayMode] = useState('Cash')
  const [paid,    setPaid]    = useState(false)

  if (!bill) {
    return (
      <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm h-full flex items-center justify-center">
        <p className="text-sm text-gray-400">Select an invoice to view details</p>
      </div>
    )
  }

  const { subtotal, cgst, sgst, total } = calcTotals(bill.items)
  const isPending = bill.status === 'Pending' && !paid

  const handleMarkPaid = () => {
    setPaid(true)
    onMarkPaid(bill.id)
  }

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(
      `*MediCore — Shree Sai Multi-Specialty Hospital*\n\n` +
      `Dear ${bill.patient},\n\n` +
      `Your invoice *${bill.id}* for *${fmt(total)}* has been generated.\n` +
      `Status: ${paid ? 'Paid' : bill.status} | Date: ${bill.date}\n\n` +
      `Thank you for choosing Shree Sai Hospital. 🏥`
    )
    window.open(`https://wa.me/?text=${msg}`, '_blank')
  }

  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm flex flex-col h-full overflow-hidden">

      {/* ── Invoice Header ── */}
      <div className="px-6 py-4 border-b border-[#E5E7EB] flex-shrink-0">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{bill.patient}</h3>
            <p className="text-xs text-gray-500 mt-0.5 font-mono">
              {bill.id} · {bill.date} · {bill.department}
            </p>
          </div>
          <StatusBadge status={paid ? 'Paid' : bill.status} size="md" />
        </div>

        {/* Patient meta row */}
        <div className="flex items-center gap-4 mt-3">
          {[
            { label: 'Age',    value: bill.patient === 'Anjali Mehta' ? '28y' : bill.patient === 'Ramesh Patel' ? '45y' : bill.patient === 'Priya Shah' ? '32y' : bill.patient === 'Vikram Desai' ? '60y' : '38y' },
            { label: 'Gender', value: ['Priya Shah', 'Anjali Mehta', 'Sunita Joshi'].includes(bill.patient) ? 'Female' : 'Male' },
            { label: 'Doctor', value: bill.doctor },
            { label: 'Token',  value: bill.token  },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center gap-1">
              <span className="text-[10px] text-gray-400 font-medium">{label}:</span>
              <span className="text-xs font-semibold text-gray-700">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto">

        {/* Items table */}
        <table className="w-full">
          <thead>
            <tr className="bg-[#F8F9FA] border-b border-[#E5E7EB]">
              {['Description', 'Category', 'Amount'].map((h) => (
                <th
                  key={h}
                  className={`text-[10px] font-semibold text-gray-500 uppercase tracking-wide px-5 py-3 ${
                    h === 'Amount' ? 'text-right' : 'text-left'
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bill.items.map((item, i) => (
              <tr
                key={i}
                className={`border-b border-[#F3F4F6] last:border-0 ${
                  i % 2 === 0 ? 'bg-white' : 'bg-[#F8F9FA]'
                }`}
              >
                <td className="px-5 py-3.5 text-sm text-gray-800">{item.description}</td>
                <td className="px-5 py-3.5">
                  <span
                    className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                      CATEGORY_BADGE[item.category] || 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {item.category}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-sm font-semibold text-gray-900 text-right">
                  {fmt(item.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* GST + Total summary */}
        <div className="mx-5 my-4 border border-[#E5E7EB] rounded-lg overflow-hidden">
          {/* Subtotal + GST rows */}
          <div className="divide-y divide-[#F3F4F6]">
            {[
              { label: 'Subtotal',  value: subtotal, muted: true  },
              { label: 'CGST (9%)', value: cgst,     muted: true  },
              { label: 'SGST (9%)', value: sgst,     muted: true  },
            ].map(({ label, value, muted }) => (
              <div key={label} className="flex items-center justify-between px-4 py-2.5 bg-[#F8F9FA]">
                <span className="text-xs text-gray-500">{label}</span>
                <span className="text-sm font-medium text-gray-700">{fmt(value)}</span>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="flex items-center justify-between px-4 py-4 bg-white border-t-2 border-[#E5E7EB]">
            <span className="text-sm font-bold text-gray-900">Total Amount</span>
            <span className="text-2xl font-black text-[#1A5276]">{fmt(total)}</span>
          </div>
        </div>

        {/* Payment mode */}
        <div className="px-5 pb-4">
          <p className="text-xs font-semibold text-gray-700 mb-2">Payment Mode</p>
          <div className="flex gap-2">
            {PAYMENT_MODES.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setPayMode(key)}
                className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-lg border text-xs font-semibold transition-all ${
                  payMode === key
                    ? 'bg-[#EBF5FB] border-[#1A5276] text-[#1A5276] shadow-sm'
                    : 'border-[#E5E7EB] text-gray-500 hover:bg-[#F8F9FA]'
                }`}
              >
                <Icon className={`w-4 h-4 ${ payMode === key ? 'text-[#1A5276]' : 'text-gray-400' }`} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Action buttons ── */}
      <div className="px-5 py-4 border-t border-[#E5E7EB] flex gap-3 flex-shrink-0">
        {/* Print */}
        <button
          onClick={() => window.print()}
          className="flex items-center justify-center gap-2 border border-[#E5E7EB] text-gray-700 text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-[#F8F9FA] transition-colors"
        >
          <Printer className="w-4 h-4" />
          Print Receipt
        </button>

        {/* WhatsApp */}
        <button
          onClick={handleWhatsApp}
          className="flex items-center justify-center gap-2 bg-[#25D366] text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-[#1ebe5d] transition-colors shadow-sm"
        >
          <MessageCircle className="w-4 h-4" />
          Send via WhatsApp
        </button>

        {/* Mark as Paid — only for pending */}
        {isPending && (
          <button
            onClick={handleMarkPaid}
            className="flex-1 flex items-center justify-center gap-2 bg-[#1A5276] text-white text-sm font-bold py-2.5 rounded-lg hover:bg-[#154360] transition-colors shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            Mark as Paid
          </button>
        )}

        {/* Paid confirmation */}
        {!isPending && (paid || bill.status === 'Paid') && (
          <div className="flex-1 flex items-center justify-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm font-semibold py-2.5 rounded-lg">
            <CheckCircle2 className="w-4 h-4" />
            Payment Received · {payMode}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

const DEFAULT_BILL = ALL_BILLS.find((b) => b.patient === 'Anjali Mehta') || ALL_BILLS[0]

export default function Billing() {
  const [bills,    setBills]    = useState(ALL_BILLS)
  const [selected, setSelected] = useState(DEFAULT_BILL)
  const [query,    setQuery]    = useState('')

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return bills
    return bills.filter(
      (b) =>
        b.patient.toLowerCase().includes(q) ||
        b.token.toLowerCase().includes(q)   ||
        b.id.toLowerCase().includes(q)
    )
  }, [bills, query])

  const handleMarkPaid = (id) => {
    setBills((prev) =>
      prev.map((b) => b.id === id ? { ...b, status: 'Paid' } : b)
    )
    setSelected((prev) => prev?.id === id ? { ...prev, status: 'Paid' } : prev)
  }

  return (
    <div className="flex flex-col space-y-4" style={{ height: 'calc(100vh - 64px - 48px)' }}>

      {/* Top bar */}
      <div className="flex-shrink-0">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Billing</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {bills.filter((b) => b.status === 'Paid').length} paid ·{' '}
              {bills.filter((b) => b.status === 'Pending').length} pending today
            </p>
          </div>

          {/* Summary chips */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold bg-green-100 text-green-700 px-3 py-1.5 rounded-full">
              Collected: {fmt(bills.filter((b) => b.status === 'Paid').reduce((s, b) => s + calcTotals(b.items).total, 0))}
            </span>
            <span className="text-xs font-semibold bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full">
              Pending: {fmt(bills.filter((b) => b.status === 'Pending').reduce((s, b) => s + calcTotals(b.items).total, 0))}
            </span>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by patient name, token, or invoice number..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1A5276]/30 focus:border-[#1A5276]"
          />
        </div>
      </div>

      {/* Split layout */}
      <div className="grid gap-4 flex-1 min-h-0" style={{ gridTemplateColumns: '38% 1fr' }}>

        {/* Left 38% — Invoice list */}
        <div className="min-h-0">
          <InvoiceList
            bills={filtered}
            selected={selected}
            onSelect={setSelected}
          />
        </div>

        {/* Right 62% — Invoice detail */}
        <div className="min-h-0">
          <InvoiceDetail
            key={selected?.id}
            bill={selected}
            onMarkPaid={handleMarkPaid}
          />
        </div>
      </div>
    </div>
  )
}
