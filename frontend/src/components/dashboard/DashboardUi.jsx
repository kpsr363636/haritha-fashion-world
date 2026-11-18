import { Package, AlertCircle } from 'lucide-react'

export function DashboardTabBar({ tabs, active, onChange, counts = {} }) {
  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {tabs.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={active === id ? 'tab-pill-active capitalize' : 'tab-pill-inactive capitalize'}
        >
          {label}
          {counts[id] != null && (
            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${active === id ? 'bg-white/25' : 'bg-gray-200 text-gray-600'}`}>
              {counts[id]}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

export function DashboardStatGrid({ stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
      {stats.map((k) => (
        <div key={k.label} className="stat-card">
          <p className="text-sm text-gray-500 relative z-10">{k.label}</p>
          <p className="text-xl md:text-2xl font-bold relative z-10 mt-1">{k.value ?? '—'}</p>
        </div>
      ))}
    </div>
  )
}

export function DashboardEmpty({ icon: Icon = Package, title, message, action }) {
  return (
    <div className="surface-card p-10 md:p-12 text-center">
      <Icon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <p className="font-semibold text-gray-800">{title}</p>
      {message && <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">{message}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

export function DashboardAlert({ message, type = 'warning' }) {
  if (!message) return null
  const styles = type === 'error'
    ? 'text-red-800 bg-red-50 border-red-200'
    : 'text-amber-800 bg-amber-50 border-amber-200'
  return (
    <p className={`text-sm rounded-xl px-4 py-3 mb-6 border flex items-center gap-2 ${styles}`}>
      <AlertCircle className="w-4 h-4 shrink-0" />
      {message}
    </p>
  )
}

export function DashboardListItem({ children, className = '' }) {
  return (
    <div className={`surface-card p-4 md:p-5 hover:shadow-card transition-shadow ${className}`}>
      {children}
    </div>
  )
}
