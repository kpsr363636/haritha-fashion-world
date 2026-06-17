import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { orderApi } from '../api/orderApi'
import { formatINR, formatDate } from '../utils/formatters'
import { setSEO } from '../utils/seo'

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
      <div className="text-center py-20">
        <Link to="/login" className="btn-primary">Login to request a return</Link>
      </div>
    )
  }

  if (success) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-green-600 mb-4">Return Request Submitted</h1>
        <p className="text-gray-600 mb-6">We will review your request and contact you within 24 hours.</p>
        <Link to="/orders" className="btn-primary">View Orders</Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Returns & Exchanges</h1>
      <p className="text-sm text-gray-500 mb-4">Only delivered orders within the return window are eligible.</p>

      <form onSubmit={submitReturn} className="space-y-4 border rounded-xl p-6">
        <div>
          <label className="block text-sm font-medium mb-1">Select order</label>
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
              <option key={o.id} value={o.id}>{o.orderNumber} — {formatDate(o.placedAt)} — {formatINR(o.totalAmount)} ({o.status})</option>
            ))}
          </select>
        </div>

        {selectedOrder?.items?.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-1">Select item</label>
            <select className="input-field" value={selectedItem?.id || ''} onChange={(e) => setSelectedItem(selectedOrder.items.find((i) => i.id === e.target.value) || null)} required>
              <option value="">Choose an item</option>
              {selectedOrder.items.map((item) => (
                <option key={item.id} value={item.id}>{item.productName} × {item.quantity}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Type</label>
          <select className="input-field" value={returnType} onChange={(e) => setReturnType(e.target.value)}>
            <option value="RETURN">Return for refund</option>
            <option value="EXCHANGE">Exchange</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Reason</label>
          <select className="input-field" value={reason} onChange={(e) => setReason(e.target.value)}>
            <option>Size issue</option>
            <option>Wrong item received</option>
            <option>Quality not as expected</option>
            <option>Changed my mind</option>
            <option>Damaged product</option>
          </select>
        </div>

        <textarea className="input-field h-24" placeholder="Additional details (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />

        <button type="submit" disabled={submitting || !selectedItem} className="btn-primary w-full">
          {submitting ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </div>
  )
}
