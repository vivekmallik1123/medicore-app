import { Bell } from 'lucide-react'

export default function Header() {
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  return (
    <header
      className="flex items-center justify-between px-6 bg-white border-b border-[#E5E7EB] flex-shrink-0"
      style={{ height: '64px' }}
    >
      {/* Left: Hospital info */}
      <div>
        <p className="text-sm font-bold text-gray-900 leading-tight">
          Shree Sai Multi-Specialty Hospital, Ahmedabad
        </p>
        <p className="text-xs text-gray-500 mt-0.5">{today}</p>
      </div>

      {/* Right: Status + Bell + Avatar */}
      <div className="flex items-center gap-4">
        {/* System Online */}
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          System Online
        </span>

        {/* Bell with badge */}
        <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            3
          </span>
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-[#1A5276] text-white flex items-center justify-center text-sm font-bold select-none">
          A
        </div>
      </div>
    </header>
  )
}
