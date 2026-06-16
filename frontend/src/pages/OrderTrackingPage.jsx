import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, ChevronRight } from 'lucide-react'
import { orderApi } from '../api/orderApi'
import { useAuth } from '../context/AuthContext'
import { formatINR, formatDate } from '../utils/formatters'
import PageHeader from '../components/ui/PageHeader'
import StatusBadge from '../components/ui/StatusBadge'
import LoadingScreen from '../components/ui/LoadingScreen'
import EmptyState from '../components/common/EmptyState'

export default function OrderTrackingPage() {
  const { isAuthenticated } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      orderApi.list(page).then((r) => {
        const content = r.data?.content || []
        setOrders((prev) => page === 0 ? content : [...prev, ...content])
        setHasMore((page + 1) * 10 < (r.data?.totalElements || 0))
      }).catch(() => {}).finally(() => setLoading(false))
    }
  }, [isAuthenticated, page])

  if (!isAuthenticated) {
    return (
      <div className="page-shell py-12">
        <EmptyState icon="🔐" title="Login required" message="Sign in to view your order history." actionLabel="Login" actionTo="/login" />
      </div>
    )
  }

  return (
    <div className="page-shell max-w-4xl">
      <PageHeader
        eyebrow="Order history"
        title="My Orders"
        subtitle={orders.length > 0 ? `${orders.length} order${orders.length !== 1 ? 's' : ''}` : undefined}
        action={<Link to="/returns" className="btn-outline text-sm py-2">Request Return</Link>}
      />

      {loading && page === 0 ? (
        <LoadingScreen message="Loading orders..." />
      ) : orders.length === 0 ? (
        <EmptyState icon="📦" title="No orders yet" message="When you place an order, it will appear here." actionLabel="Start Shopping" actionTo="/products" />
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="surface-card-hover p-5 md:p-6 group">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center shrink-0">
                    <Package className="w-6 h-6 text-brand" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{o.orderNumber}</p>
                    <p className="text-sm text-gray-500 mt-1">{formatDate(o.placedAt)}</p>
                    <p className="font-bold text-brand mt-2">{formatINR(o.totalAmount)}</p>
                  </div>
                </div>
                <StatusBadge status={o.status} />
              </div>
              <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-100 items-center">
                <Link to={`/orders/${o.id}`} className="inline-flex items-center gap-1 text-sm text-brand font-medium hover:underline group/link">
                  View details
                  <ChevronRight className="w-4 h-4 group-hover/link:translate-x-0.5 transition-transform" />
                </Link>
                {(o.status === 'PLACED' || o.status === 'CONFIRMED') && (
                  <button onClick={() => orderApi.cancel(o.id).then(() => window.location.reload())} className="text-sm text-red-500 hover:text-red-600 font-medium">
                    Cancel order
                  </button>
                )}
              </div>
            </div>
          ))}
          {hasMore && (
            <button type="button" onClick={() => setPage(page + 1)} className="btn-outline w-full mt-4">Load more orders</button>
          )}
        </div>
      )}
    </div>
  )
}
