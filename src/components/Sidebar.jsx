import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  FlaskConical,
  Pill,
  BedDouble,
  Receipt,
  UserCog,
  Heart,
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/',          label: 'Dashboard',   icon: LayoutDashboard },
  { to: '/reception', label: 'Reception',   icon: Users           },
  { to: '/opd',       label: 'OPD Doctor',  icon: Stethoscope     },
  { to: '/lab',       label: 'Lab',         icon: FlaskConical    },
  { to: '/pharmacy',  label: 'Pharmacy',    icon: Pill            },
  { to: '/ipd',       label: 'IPD',         icon: BedDouble       },
  { to: '/billing',   label: 'Billing',     icon: Receipt         },
  { to: '/hr',        label: 'HR',          icon: UserCog         },
]

export default function Sidebar() {
  return (
    <aside
      className="flex flex-col flex-shrink-0 h-screen"
      style={{ width: '240px', backgroundColor: '#1A5276' }}
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <Heart className="w-4 h-4 text-white" fill="white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">MediCore</span>
        </div>
        <p className="text-[10px] text-white/40 mt-1 ml-10.5">Shree Sai Hospital</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-white text-[#1A5276] shadow-sm'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#1A5276]' : 'text-white/70'}`} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/10">
        <p className="text-[10px] text-white/30 text-center">MediCore v2.0 · MVP Demo</p>
      </div>
    </aside>
  )
}
