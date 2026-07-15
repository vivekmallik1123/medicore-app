import { useState } from 'react'
import { Lock, Monitor } from 'lucide-react'

const TABS = [
  { key: 'personal',    label: 'Personal Info' },
  { key: 'work',        label: 'Work Info' },
  { key: 'security',    label: 'Security' },
  { key: 'preferences', label: 'Preferences' },
]

function Field({ label, value, full }) {
  return (
    <div className={full ? 'col-span-2' : ''}>
      <label className="block text-gray-500 uppercase tracking-wide mb-1.5" style={{ fontSize: '12px' }}>
        {label}
      </label>
      <input
        type="text"
        defaultValue={value}
        className="w-full bg-white border border-[#E5E7EB] rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#1A5276] transition-colors"
        style={{ padding: '8px 12px', borderRadius: '6px' }}
      />
    </div>
  )
}

function LockedField({ label, value }) {
  return (
    <div className="relative group">
      <label className="block text-gray-500 uppercase tracking-wide mb-1.5" style={{ fontSize: '12px' }}>
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          value={value}
          disabled
          className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-md px-3 py-2 text-sm text-gray-500 cursor-not-allowed pr-9"
          style={{ padding: '8px 12px', borderRadius: '6px' }}
        />
        <Lock className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ width: '14px', height: '14px' }} />
      </div>
      <div className="absolute z-10 left-0 bottom-full mb-1 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap pointer-events-none">
        Contact admin to edit this field
      </div>
    </div>
  )
}

function Toggle({ on, onClick, color }) {
  return (
    <button
      onClick={onClick}
      className="relative w-10 h-5 rounded-full transition-colors duration-200 flex-shrink-0"
      style={{ backgroundColor: on ? (color || '#1E8449') : '#D1D5DB' }}
    >
      <span
        className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200"
        style={{ left: on ? '22px' : '2px' }}
      />
    </button>
  )
}

function PersonalInfo() {
  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm" style={{ padding: '24px' }}>
      <h3 className="font-bold text-gray-900" style={{ fontSize: '18px' }}>Personal Information</h3>
      <p className="text-sm text-gray-500 mt-1">Update your personal details below</p>
      <hr className="my-4 border-[#E5E7EB]" />
      <div className="grid grid-cols-2 gap-4">
        <Field label="Full Name" value="Mitesh Paghdal" />
        <Field label="Email" value="miteshpaghdal1999@gmail.com" />
        <Field label="Phone" value="+91 98765 43210" />
        <Field label="Date of Birth" value="15 Jan 1999" />
        <Field label="Address" value="Surat, Gujarat, India — 395001" full />
        <Field label="Emergency Contact" value="+91 98765 43211" full />
      </div>
      <button
        className="mt-6 text-white font-semibold hover:opacity-90 transition-opacity"
        style={{ backgroundColor: '#1A5276', padding: '10px 24px', borderRadius: '6px', fontSize: '14px' }}
      >
        Save Changes
      </button>
    </div>
  )
}

function WorkInfo() {
  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm" style={{ padding: '24px' }}>
      <h3 className="font-bold text-gray-900" style={{ fontSize: '18px' }}>Work Information</h3>
      <p className="text-sm text-gray-500 mt-1">These details can only be edited by Admin</p>
      <hr className="my-4 border-[#E5E7EB]" />
      <div className="grid grid-cols-2 gap-4">
        <LockedField label="Employee ID" value="EMP-001" />
        <LockedField label="Role" value="Administrator" />
        <LockedField label="Department" value="Hospital Management" />
        <LockedField label="Joining Date" value="08 Jul 2026" />
        <LockedField label="Reporting To" value="Board of Directors" />
        <LockedField label="Access Level" value="Full Access" />
      </div>
    </div>
  )
}

function Security() {
  const [tfa, setTfa] = useState(false)
  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm" style={{ padding: '24px' }}>
      <h3 className="font-bold text-gray-900" style={{ fontSize: '18px' }}>Security Settings</h3>

      <div className="mt-4 space-y-4">
        <div>
          <label className="block text-gray-500 uppercase tracking-wide mb-1.5" style={{ fontSize: '12px' }}>Current Password</label>
          <input type="password" placeholder="••••••••" className="w-full bg-white border border-[#E5E7EB] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#1A5276]" style={{ padding: '8px 12px', borderRadius: '6px' }} />
        </div>
        <div>
          <label className="block text-gray-500 uppercase tracking-wide mb-1.5" style={{ fontSize: '12px' }}>New Password</label>
          <input type="password" placeholder="••••••••" className="w-full bg-white border border-[#E5E7EB] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#1A5276]" style={{ padding: '8px 12px', borderRadius: '6px' }} />
        </div>
        <div>
          <label className="block text-gray-500 uppercase tracking-wide mb-1.5" style={{ fontSize: '12px' }}>Confirm New Password</label>
          <input type="password" placeholder="••••••••" className="w-full bg-white border border-[#E5E7EB] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#1A5276]" style={{ padding: '8px 12px', borderRadius: '6px' }} />
        </div>
        <button className="text-white font-semibold hover:opacity-90 transition-opacity" style={{ backgroundColor: '#1A5276', padding: '10px 24px', borderRadius: '6px', fontSize: '14px' }}>Update Password</button>
      </div>

      <hr className="my-6 border-[#E5E7EB]" />
      <p className="text-sm font-semibold text-gray-700 mb-3">Account Security</p>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900">Two-Factor Authentication</p>
          <p className="text-xs text-gray-500 mt-0.5">Add extra security to your account</p>
        </div>
        <Toggle on={tfa} onClick={() => setTfa(!tfa)} />
      </div>

      <hr className="my-6 border-[#E5E7EB]" />
      <p className="text-sm font-bold text-gray-900 mb-3">Active Sessions</p>

      <div className="flex items-center justify-between border border-[#E5E7EB] rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#F8F9FA] rounded-lg flex items-center justify-center">
            <Monitor className="w-5 h-5 text-gray-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Windows PC</p>
            <p className="text-xs text-gray-500 mt-0.5">Surat, Gujarat, India</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              <span className="text-xs text-green-600 font-medium">Active now</span>
            </div>
          </div>
        </div>
        <button className="text-sm text-red-600 font-medium hover:underline">Sign out this device</button>
      </div>
    </div>
  )
}

function Preferences() {
  const [emailNotif, setEmailNotif] = useState(true)
  const [waNotif, setWaNotif] = useState(true)
  const [criticalOnly, setCriticalOnly] = useState(false)

  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm" style={{ padding: '24px' }}>
      <h3 className="font-bold text-gray-900" style={{ fontSize: '18px' }}>Preferences</h3>

      <div className="mt-5">
        <p className="text-sm font-semibold text-gray-900">Interface Language</p>
        <p className="text-xs text-gray-500 mt-0.5">Choose your preferred language</p>
        <select className="mt-2 w-full max-w-xs bg-white border border-[#E5E7EB] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#1A5276]" style={{ padding: '8px 12px', borderRadius: '6px' }}>
          <option>English</option>
          <option>Hindi</option>
          <option>Gujarati</option>
          <option>Marathi</option>
        </select>
      </div>

      <hr className="my-6 border-[#E5E7EB]" />
      <p className="text-sm font-semibold text-gray-900 mb-3">Notifications</p>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">Email Notifications</p>
            <p className="text-xs text-gray-500 mt-0.5">Receive notifications via email</p>
          </div>
          <Toggle on={emailNotif} onClick={() => setEmailNotif(!emailNotif)} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">WhatsApp Notifications</p>
            <p className="text-xs text-gray-500 mt-0.5">Receive notifications via WhatsApp</p>
          </div>
          <Toggle on={waNotif} onClick={() => setWaNotif(!waNotif)} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">Critical Alerts Only</p>
            <p className="text-xs text-gray-500 mt-0.5">Only show critical priority alerts</p>
          </div>
          <Toggle on={criticalOnly} onClick={() => setCriticalOnly(!criticalOnly)} />
        </div>
      </div>

      <hr className="my-6 border-[#E5E7EB]" />
      <div>
        <p className="text-sm font-semibold text-gray-900">Theme</p>
        <p className="text-xs text-gray-500 mt-0.5">Choose your preferred theme</p>
        <select className="mt-2 w-full max-w-xs bg-white border border-[#E5E7EB] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#1A5276]" style={{ padding: '8px 12px', borderRadius: '6px' }}>
          <option>Light</option>
          <option disabled>Dark (Coming Soon)</option>
        </select>
      </div>

      <button
        className="mt-6 text-white font-semibold hover:opacity-90 transition-opacity"
        style={{ backgroundColor: '#1A5276', padding: '10px 24px', borderRadius: '6px', fontSize: '14px' }}
      >
        Save Preferences
      </button>
    </div>
  )
}

export default function Profile() {
  const [activeTab, setActiveTab] = useState('personal')

  return (
    <div className="flex gap-6" style={{ minHeight: '100%' }}>
      {/* Left sidebar */}
      <div className="flex-shrink-0" style={{ width: '30%' }}>
        <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm sticky top-6" style={{ padding: '24px' }}>
          <div className="flex flex-col items-center text-center">
            <div
              className="w-20 h-20 rounded-full bg-[#1A5276] text-white flex items-center justify-center font-bold"
              style={{ width: '80px', height: '80px', fontSize: '28px' }}
            >
              MP
            </div>
            <p className="font-bold text-[#2C3E50] mt-3" style={{ fontSize: '20px' }}>Mitesh Paghdal</p>
            <span
              className="mt-2 inline-block font-semibold rounded-full"
              style={{ backgroundColor: '#EBF5FB', color: '#1A5276', fontSize: '12px', padding: '4px 12px' }}
            >
              Administrator
            </span>
            <p className="text-gray-500 mt-2" style={{ fontSize: '14px' }}>Hospital Management</p>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-green-600 font-medium" style={{ fontSize: '13px' }}>Active</span>
            </div>
            <p className="text-gray-400 italic mt-2" style={{ fontSize: '12px' }}>Last login: Today, 10:23 AM</p>
          </div>

          <hr className="my-4 border-[#E5E7EB]" />

          <div className="flex flex-col gap-1">
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className="text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: activeTab === key ? '#1A5276' : 'transparent',
                  color: activeTab === key ? '#FFFFFF' : '#6B7280',
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== key) e.currentTarget.style.backgroundColor = '#F8F9FA'
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== key) e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right content */}
      <div className="flex-1" style={{ width: '70%' }}>
        {activeTab === 'personal' && <PersonalInfo />}
        {activeTab === 'work' && <WorkInfo />}
        {activeTab === 'security' && <Security />}
        {activeTab === 'preferences' && <Preferences />}
      </div>
    </div>
  )
}
