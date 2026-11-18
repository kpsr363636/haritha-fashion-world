import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { paymentApi } from '../api/orderApi'
import { useCart } from '../context/CartContext'
import LoadingScreen from '../components/ui/LoadingScreen'

export default function PaymentReturnPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { refreshCart } = useCart()
  const [error, setError] = useState('')
  const orderId = params.get('orderId')

  useEffect(() => {
    const razorpayOrderId = params.get('razorpay_order_id')
    const razorpayPaymentId = params.get('razorpay_payment_id')
    const signature = params.get('razorpay_signature')

    if (!razorpayOrderId || !razorpayPaymentId || !signature) {
      setError('Payment details missing. If amount was deducted, check your orders or contact support.')
      return
    }

    paymentApi.verify({ razorpayOrderId, razorpayPaymentId, signature })
      .then(async () => {
        await refreshCart()
        navigate(orderId ? `/orders/${orderId}` : '/orders', { replace: true })
      })
      .catch((err) => {
        setError(err?.message || 'Payment verification failed. If amount was deducted, open your order and tap Pay now or contact support.')
      })
  }, [params, navigate, orderId, refreshCart])

  if (error) {
    return (
      <div className="page-shell max-w-lg py-20 text-center">
        <div className="surface-card p-8">
          <p className="text-red-600 font-medium mb-4">{error}</p>
          {orderId ? (
            <Link to={`/orders/${orderId}`} className="btn-primary">View order</Link>
          ) : (
            <Link to="/orders" className="btn-primary">My orders</Link>
          )}
        </div>
      </div>
    )
  }

  return <LoadingScreen message="Confirming your payment…" />
}
