import { Link } from 'react-router-dom'

export default function EmptyState({ icon = '🛍️', title, message, actionLabel, actionTo, onAction }) {
  return (
    <div className="empty-state animate-slide-up">
      <div className="empty-state-icon">{icon}</div>
      {title && <h2 className="font-display text-2xl md:text-3xl font-semibold text-gray-900 mb-2 relative z-10">{title}</h2>}
      {message && <p className="text-gray-500 mb-8 max-w-sm mx-auto relative z-10 leading-relaxed">{message}</p>}
      {actionLabel && actionTo && (
        <Link to={actionTo} className="btn-primary inline-block relative z-10">{actionLabel}</Link>
      )}
      {actionLabel && onAction && !actionTo && (
        <button type="button" onClick={onAction} className="btn-primary relative z-10">{actionLabel}</button>
      )}
    </div>
  )
}
