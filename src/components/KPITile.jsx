import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function KPITile({ title, value, subtitle, icon: Icon, trend, color = 'blue' }) {
  const colorMap = {
    blue:   { icon: 'bg-blue-100 text-blue-600',   border: 'border-blue-100'   },
    green:  { icon: 'bg-green-100 text-green-600', border: 'border-green-100'  },
    orange: { icon: 'bg-orange-100 text-orange-600', border: 'border-orange-100' },
    red:    { icon: 'bg-red-100 text-red-600',     border: 'border-red-100'    },
  }
  const c = colorMap[color] || colorMap.blue

  const trendIsPositive = trend && trend.startsWith('+')
  const trendIsNegative = trend && trend.startsWith('-')

  return (
    <div className={`bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide truncate">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1.5 leading-none">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1.5">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${
              trendIsPositive ? 'text-green-600' : trendIsNegative ? 'text-red-600' : 'text-gray-500'
            }`}>
              {trendIsPositive ? <TrendingUp className="w-3 h-3" /> :
               trendIsNegative ? <TrendingDown className="w-3 h-3" /> :
               <Minus className="w-3 h-3" />}
              <span>{trend} vs yesterday</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ml-3 ${c.icon}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  )
}
