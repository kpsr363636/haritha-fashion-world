import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Package, RotateCcw, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { orderApi } from '../api/orderApi'
import { formatINR, formatDate } from '../utils/formatters'
import { setSEO } from '../utils/seo'
import PageHeader from '../components/ui/PageHeader'
import EmptyState from '../components/common/EmptyState'

export default function ReturnPage() {
  const { isAuthenticated } = useAuth()
  const [searchParams] = useSearchParams()
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [returnType, setReturnType] = useState('RETURN')
  const [reason, setReason] = useState('Size issue')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    setSEO('Returns & Exchanges', 'Initiate a return or exchange for your Haritha Fashion World order')
    if (isAuthenticated) {
      orderApi.list().then((r) => {
        const list = (r.data?.content || []).filter((o) => o.status === 'DELIVERED')
        setOrders(list)
        const orderId = searchParams.get('orderId')
        if (orderId) {
          orderApi.get(orderId).then((res) => {
            setSelectedOrder(res.data)
          }).catch(() => {})
        }
      }).catch(() => {})
    }
  }, [isAuthenticated, searchParams])

  const submitReturn = async (e) => {
    e.preventDefault()
    if (!selectedOrder || !selectedItem) return
    setSubmitting(true)
    try {
      await orderApi.initiateReturn(selectedOrder.id, selectedItem.id, {
        returnType,
        reason,
        description
      })
      setSuccess(true)
    } catch (err) {
      alert(err.message || 'Return request failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="page-shell max-w-2xl">
        <EmptyState icon="🔐" title="Login required" message="Sign in to request a return or exchange for your delivered orders." actionLabel="Login" actionTo="/login" />
      </div>
    )
  }

  if (success) {
    return (
      <div className="page-shell max-w-xl text-center py-16">
        <div className="surface-card p-10">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h1 className="font-display text-2xl font-semibold text-gray-900 mb-3">Return Request Submitted</h1>
          <p className="text-gray-600 mb-8 leading-relaxed">We will review your request and contact you within 24 hours with pickup or exchange details.</p>
          <Link to="/orders" className="btn-primary">View Orders</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page-shell max-w-3xl">
      <PageHeader
        eyebrow="Hassle-free returns"
        title="Returns & Exchanges"
        subtitle="7-day easy returns on delivered orders — pick refund or exchange"
      />

      {orders.length === 0 ? (
        <EmptyState
          icon="📦"
          title="No eligible orders"
          message="Only delivered orders within the return window can be returned. Place an order and we'll help once it arrives."
          actionLabel="Browse products"
          actionTo="/products"
        />
      ) : (
        <form onSubmit={submitReturn} className="surface-card p-6 md:p-8 space-y-5 shadow-card">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <RotateCcw className="w-5 h-5 text-brand" />
            <h2 className="font-display text-lg font-semibold">Return details</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Select order</label>
            <select
              className="input-field"
              value={selectedOrder?.id || ''}
              onChange={(e) => {
                const id = e.target.value
                if (!id) { setSelectedOrder(null); setSelectedItem(null); return }
                orderApi.get(id).then((r) => { setSelectedOrder(r.data); setSelectedItem(null) }).catch(() => setSelectedOrder(null))
              }}
              required
            >
              <option value="">Choose an order</option>
              {orders.map((o) => (
                <option key={o.id} value={o.id}>{o.orderNumber} — {formatDate(o.placedAt)} — {formatINR(o.totalAmount)}</option>
              ))}
            </select>
          </div>

          {selectedOrder?.items?.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Select item</label>
              <select className="input-field" value={selectedItem?.id || ''} onChange={(e) => setSelectedItem(selectedOrder.items.find((i) => String(i.id) === e.target.value) || null)} required>
                <option value="">Choose an item</option>
                {selectedOrder.items.map((item) => (
                  <option key={item.id} value={item.id}>{item.productName} × {item.quantity}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
              <select className="input-field" value={returnType} onChange={(e) => setReturnType(e.target.value)}>
                <option value="RETURN">Return for refund</option>
                <option value="EXCHANGE">Exchange</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason</label>
              <select className="input-field" value={reason} onChange={(e) => setReason(e.target.value)}>
                <option>Size issue</option>
                <option>Wrong item received</option>
                <option>Quality not as expected</option>
                <option>Changed my mind</option>
                <option>Damaged product</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Additional details (optional)</label>
            <textarea className="input-field min-h-[100px]" placeholder="Tell us more about the issue…" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <button type="submit" disabled={submitting || !selectedItem} className="btn-primary w-full py-3">
            {submitting ? 'Submitting…' : 'Submit Return Request'}
          </button>
        </form>
      )}

      <div className="mt-8 section-band-light p-6 flex gap-4 items-start">
        <Package className="w-5 h-5 text-brand shrink-0 mt-0.5" />
        <div className="text-sm text-gray-600 leading-relaxed">
          <p className="font-medium text-gray-900 mb-1">Return policy highlights</p>
          <p>Items must be unused with tags attached. Refunds are processed within 5–7 business days after pickup. <Link to="/legal/return-policy" className="text-brand hover:underline">Read full policy →</Link></p>
        </div>
      </div>
    </div>
  )
}
