const STYLES = {
  PLACED: 'badge-info',
  CONFIRMED: 'badge-info',
  SHIPPED: 'badge-warning',
  OUT_FOR_DELIVERY: 'badge-warning',
  DELIVERED: 'badge-success',
  CANCELLED: 'badge-danger',
  RETURNED: 'badge-muted',
  PAID: 'badge-success',
  PENDING: 'badge-warning',
  FAILED: 'badge-danger'
}

export default function StatusBadge({ status, className = '' }) {
  const style = STYLES[status] || 'badge-muted'
  const label = status?.replace(/_/g, ' ') || 'Unknown'
  return (
    <span className={`badge ${style} ${className}`}>{label}</span>
  )
}
