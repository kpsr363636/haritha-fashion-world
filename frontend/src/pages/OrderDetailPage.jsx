import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Download, Package, MapPin, CreditCard, ArrowLeft } from 'lucide-react'
import { orderApi } from '../api/orderApi'
import { formatINR, formatDate } from '../utils/formatters'
import ProtectedRoute from '../components/common/ProtectedRoute'
import StatusBadge from '../components/ui/StatusBadge'
import OrderTimeline from '../components/ui/OrderTimeline'
import LoadingScreen from '../components/ui/LoadingScreen'

function OrderDetailContent() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [codOtp, setCodOtp] = useState('')
  const [codMsg, setCodMsg] = useState('')

  const load = () => {
    orderApi.get(id).then((r) => setOrder(r.data)).catch(() => setOrder(null)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [id])

  const downloadInvoice = async () => {
    try {
      const blob = await orderApi.invoice(id)
      if (blob?.type?.includes('application/json')) {
        const err = JSON.parse(await blob.text())
        throw new Error(err.message || 'Could not download invoice')
      }
      const pdfBlob = blob instanceof Blob ? blob : new Blob([blob], { type: 'application/pdf' })
      const url = URL.createObjectURL(pdfBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${order?.orderNumber || id}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert(err.message || 'Could not download invoice')
    }
  }

  const verifyCod = async (e) => {
    e.preventDefault()
    setCodMsg('')
    try {
      await orderApi.verifyCod(id, codOtp)
      setCodMsg('Delivery confirmed!')
      load()
    } catch (err) {
      setCodMsg(err.message || 'Invalid OTP')
    }
  }

  if (loading) return <LoadingScreen message="Loading order..." />
  if (!order) return (
    <div className="page-shell py-20 text-center">
      <p className="text-gray-500 mb-4">Order not found</p>
      <Link to="/orders" className="btn-primary">View all orders</Link>
    </div>
  )

  const address = order.addressDisplay || (typeof order.addressSnapshot === 'string'
    ? order.addressSnapshot
    : order.addressSnapshot
      ? `${order.addressSnapshot.fullName}, ${order.addressSnapshot.addressLine}, ${order.addressSnapshot.city} ${order.addressSnapshot.pincode}`
      : null)

  return (
    <div className="page-shell max-w-4xl">
      <Link to="/orders" className="inline-flex items-center gap-2 text-sm text-brand font-medium mb-6 hover:underline group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to orders
      </Link>

      <div className="surface-card p-6 md:p-8 mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <p className="eyebrow mb-2">Order details</p>
            <h1 className="font-display text-3xl font-semibold">{order.orderNumber}</h1>
            <p className="text-sm text-gray-500 mt-2">Placed on {formatDate(order.placedAt)}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>
      </div>

      <OrderTimeline status={order.status} />

      {order.requiresCodVerification && (
        <form onSubmit={verifyCod} className="surface-card p-5 md:p-6 mb-6 border-amber-200/60 bg-gradient-to-br from-amber-50/80 to-white">
          <p className="font-semibold mb-1">Confirm COD delivery</p>
          <p className="text-sm text-gray-500 mb-4">Enter the OTP sent to your mobile to confirm receipt.</p>
          <div className="flex gap-3">
            <input className="input-field flex-1" placeholder="6-digit OTP" maxLength={6} value={codOtp} onChange={(e) => setCodOtp(e.target.value)} required />
            <button type="submit" className="btn-primary shrink-0">Verify</button>
          </div>
          {codMsg && <p className={`text-sm mt-3 font-medium ${codMsg.includes('confirmed') ? 'text-emerald-600' : 'text-red-500'}`}>{codMsg}</p>}
        </form>
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="surface-card p-5 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-brand" />
            <h2 className="font-semibold">Items</h2>
          </div>
          <div className="space-y-4">
            {(order.items || []).map((item) => (
              <div key={item.id} className="flex justify-between items-start text-sm pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                <div>
                  <p className="font-medium text-gray-900">{item.productName}</p>
                  <p className="text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                </div>
                <span className="font-semibold">{formatINR(item.lineTotal || item.unitPrice * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-bold text-lg pt-4 mt-4 border-t">
            <span>Total</span>
            <span className="text-brand">{formatINR(order.totalAmount)}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="surface-card p-5 md:p-6">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-5 h-5 text-brand" />
              <h2 className="font-semibold">Payment</h2>
            </div>
            <p className="text-sm"><span className="text-gray-500">Status:</span> <StatusBadge status={order.paymentStatus} className="ml-2" /></p>
            <p className="text-sm mt-2 text-gray-600">Method: {order.paymentMethod}</p>
          </div>

          {address && (
            <div className="surface-card p-5 md:p-6">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-brand" />
                <h2 className="font-semibold">Delivery</h2>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{address}</p>
              {order.shipment?.trackingUrl && (
                <a href={order.shipment.trackingUrl} className="inline-flex items-center gap-1 text-sm text-brand font-medium mt-3 hover:underline" target="_blank" rel="noreferrer">
                  Track: {order.shipment.awbNumber || order.shipment.trackingNumber}
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={downloadInvoice} className="btn-outline flex items-center gap-2">
          <Download className="w-4 h-4" />
          Download Invoice
        </button>
        {(order.status === 'PLACED' || order.status === 'CONFIRMED') && (
          <button type="button" onClick={() => orderApi.cancel(order.id).then(load)} className="px-5 py-2.5 rounded-xl text-red-500 text-sm font-medium border-2 border-red-200 hover:bg-red-50 transition-colors">
            Cancel Order
          </button>
        )}
        {order.status === 'DELIVERED' && (
          <Link to={`/returns?orderId=${order.id}`} className="btn-primary">Return Item</Link>
        )}
      </div>
    </div>
  )
}

export default function OrderDetailPage() {
  return (
    <ProtectedRoute>
      <OrderDetailContent />
    </ProtectedRoute>
  )
}
