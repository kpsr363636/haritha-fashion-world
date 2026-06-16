import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, Smartphone, Building2, Banknote, MapPin, Tag, Gift, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { addressApi } from '../api/orderApi'
import { orderApi, paymentApi } from '../api/orderApi'
import { couponApi, giftCardApi } from '../api/giftCardApi'
import { formatINR } from '../utils/formatters'
import { openRazorpayCheckout } from '../utils/razorpay'
import { trackEvent } from '../utils/analytics'
import PageHeader from '../components/ui/PageHeader'
import CheckoutSteps from '../components/ui/CheckoutSteps'
import EmptyState from '../components/common/EmptyState'

const PAYMENT_METHODS = [
  { id: 'UPI', label: 'UPI', icon: Smartphone, desc: 'Google Pay, PhonePe, Paytm' },
  { id: 'Card', label: 'Credit / Debit Card', icon: CreditCard, desc: 'Visa, Mastercard, RuPay' },
  { id: 'Net Banking', label: 'Net Banking', icon: Building2, desc: 'All major banks' },
  { id: 'COD', label: 'Cash on Delivery', icon: Banknote, desc: 'Pay when you receive' }
]

export default function CheckoutPage() {
  const { isAuthenticated, user } = useAuth()
  const { cart, refreshCart } = useCart()
  const navigate = useNavigate()
  const [addresses, setAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [addressForm, setAddressForm] = useState({ label: 'Home', fullName: user?.name || '', mobile: user?.mobile || '', addressLine: '', city: '', state: '', pincode: '' })
  const [paymentMethod, setPaymentMethod] = useState('UPI')
  const [couponCode, setCouponCode] = useState('')
  const [giftCardCode, setGiftCardCode] = useState('')
  const [giftCardBalance, setGiftCardBalance] = useState(null)
  const [couponDiscount, setCouponDiscount] = useState(null)
  const [couponMsg, setCouponMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const loadAddresses = () => {
    addressApi.list().then((r) => {
      setAddresses(r.data || [])
      const def = (r.data || []).find((a) => a.isDefault)
      setSelectedAddress(def?.id || r.data?.[0]?.id)
    }).catch(() => {})
  }

  useEffect(() => {
    if (isAuthenticated) {
      refreshCart()
      loadAddresses()
    }
  }, [isAuthenticated, refreshCart])

  if (!isAuthenticated) {
    return (
      <div className="page-shell py-12">
        <EmptyState icon="🔐" title="Login to checkout" message="Sign in to complete your purchase securely." actionLabel="Login" actionTo="/login" />
      </div>
    )
  }

  const applyCoupon = async () => {
    setCouponMsg('')
    setCouponDiscount(null)
    if (!couponCode.trim() || !cart?.total) return
    try {
      const res = await couponApi.apply(couponCode.trim().toUpperCase(), cart.total)
      setCouponDiscount(res.data?.discount)
      setCouponMsg('Coupon applied successfully!')
    } catch (err) {
      setCouponMsg(err.message || 'Invalid coupon')
    }
  }

  const checkGiftCard = async () => {
    if (!giftCardCode.trim()) return
    try {
      const res = await giftCardApi.balance(giftCardCode.trim().toUpperCase())
      setGiftCardBalance(res.data?.balance)
    } catch {
      setGiftCardBalance(null)
      alert('Invalid gift card')
    }
  }

  const saveAddress = async (e) => {
    e.preventDefault()
    await addressApi.create(addressForm)
    setShowAddressForm(false)
    loadAddresses()
  }

  const estimatedTotal = cart ? Math.max(0, cart.total - (couponDiscount || 0)) : 0

  const placeOrder = async () => {
    if (!selectedAddress) return alert('Select or add an address')
    setLoading(true)
    try {
      trackEvent('begin_checkout', { value: cart?.total })
      const res = await orderApi.place({
        addressId: selectedAddress,
        paymentMethod: paymentMethod === 'COD' ? 'COD' : 'ONLINE',
        couponCode: couponCode.trim() || undefined,
        giftCardCode: giftCardCode.trim() || undefined
      })
      const order = res.data
      if (order.requiresPayment && order.razorpayOrderId) {
        const keyId = order.razorpayKeyId || import.meta.env.VITE_RAZORPAY_KEY_ID
        if (!keyId || order.razorpayOrderId.startsWith('order_dev_')) {
          await paymentApi.verify({
            razorpayOrderId: order.razorpayOrderId,
            razorpayPaymentId: `pay_dev_${order.orderId}`,
            signature: 'dev'
          })
          trackEvent('purchase', { transaction_id: order.orderNumber, value: order.totalAmount, currency: 'INR' })
          await refreshCart()
          navigate(`/orders/${order.orderId}`)
          return
        }
        trackEvent('add_payment_info', { payment_type: paymentMethod })
        openRazorpayCheckout({
          keyId: order.razorpayKeyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
          orderId: order.razorpayOrderId,
          amount: order.totalAmount,
          name: user?.name,
          email: user?.email,
          mobile: user?.mobile,
          onSuccess: async (response) => {
            await paymentApi.verify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature
            })
            trackEvent('purchase', { transaction_id: order.orderNumber, value: order.totalAmount, currency: 'INR' })
            navigate(`/orders/${order.orderId}`)
          },
          onFailure: (err) => alert(err.message || 'Payment failed')
        })
      } else {
        trackEvent('purchase', { transaction_id: order.orderNumber, value: order.totalAmount, currency: 'INR' })
        await refreshCart()
        navigate(order.requiresCodVerification ? `/orders/${order.orderId}` : '/orders')
      }
    } catch (err) {
      alert(err.message || 'Order failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-shell max-w-4xl">
      <CheckoutSteps current={2} />
      <PageHeader eyebrow="Secure checkout" title="Checkout" subtitle="Review your order and complete payment" />

      <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
        <div className="lg:col-span-3 space-y-6">
          <section className="surface-card p-6 md:p-7">
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand" />
                <h2 className="font-display text-xl font-semibold">Delivery Address</h2>
              </div>
              <button type="button" onClick={() => setShowAddressForm(!showAddressForm)} className="text-sm text-brand font-medium hover:underline">
                {showAddressForm ? 'Cancel' : '+ Add new'}
              </button>
            </div>
            {showAddressForm && (
              <form onSubmit={saveAddress} className="grid sm:grid-cols-2 gap-3 mb-5 pb-5 border-b border-gray-100 animate-slide-up">
                <input className="input-field" placeholder="Full name" required value={addressForm.fullName} onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })} />
                <input className="input-field" placeholder="Mobile" required value={addressForm.mobile} onChange={(e) => setAddressForm({ ...addressForm, mobile: e.target.value })} />
                <input className="input-field sm:col-span-2" placeholder="Address line" required value={addressForm.addressLine} onChange={(e) => setAddressForm({ ...addressForm, addressLine: e.target.value })} />
                <input className="input-field" placeholder="City" required value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} />
                <input className="input-field" placeholder="State" required value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} />
                <input className="input-field" placeholder="Pincode" required value={addressForm.pincode} onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })} />
                <button type="submit" className="btn-primary sm:col-span-2">Save & use address</button>
              </form>
            )}
            {addresses.length === 0 && !showAddressForm ? (
              <p className="text-gray-500 text-sm py-4">Add a delivery address to continue.</p>
            ) : (
              <div className="space-y-3">
                {addresses.map((a) => (
                  <label key={a.id} className={selectedAddress === a.id ? 'address-card-active' : 'address-card-inactive'}>
                    <input type="radio" name="address" checked={selectedAddress === a.id} onChange={() => setSelectedAddress(a.id)} className="sr-only" />
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${selectedAddress === a.id ? 'border-brand bg-brand' : 'border-gray-300'}`}>
                        {selectedAddress === a.id && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{a.fullName} {a.isDefault && <span className="text-xs text-brand font-normal">(Default)</span>}</p>
                        <p className="text-sm text-gray-500 mt-1">{a.addressLine}, {a.city} {a.pincode}</p>
                        <p className="text-sm text-gray-400 mt-0.5">+91 {a.mobile}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </section>

          <section className="surface-card p-6 md:p-7">
            <div className="flex items-center gap-2 mb-5">
              <CreditCard className="w-5 h-5 text-brand" />
              <h2 className="font-display text-xl font-semibold">Payment Method</h2>
            </div>
            <div className="space-y-3">
              {PAYMENT_METHODS.map(({ id, label, icon: Icon, desc }) => (
                <label key={id} className={paymentMethod === id ? 'payment-option-active' : 'payment-option-inactive'}>
                  <input type="radio" name="payment" checked={paymentMethod === id} onChange={() => setPaymentMethod(id)} className="sr-only" />
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${paymentMethod === id ? 'bg-brand text-white' : 'bg-gray-100 text-gray-500'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{label}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </section>

          <section className="surface-card p-6 md:p-7">
            <div className="flex items-center gap-2 mb-5">
              <Tag className="w-5 h-5 text-brand" />
              <h2 className="font-display text-xl font-semibold">Offers & Gift Cards</h2>
            </div>
            <div className="flex gap-2 mb-3">
              <input className="input-field flex-1" placeholder="Coupon code (e.g. WELCOME10)" value={couponCode} onChange={(e) => { setCouponCode(e.target.value); setCouponDiscount(null); setCouponMsg('') }} />
              <button type="button" onClick={applyCoupon} className="btn-outline whitespace-nowrap">Apply</button>
            </div>
            {couponMsg && <p className={`text-sm mb-4 ${couponDiscount ? 'text-emerald-600 font-medium' : 'text-red-500'}`}>{couponMsg}{couponDiscount ? ` — save ${formatINR(couponDiscount)}` : ''}</p>}
            <div className="flex gap-2">
              <input className="input-field flex-1" placeholder="Gift card code" value={giftCardCode} onChange={(e) => { setGiftCardCode(e.target.value); setGiftCardBalance(null) }} />
              <button type="button" onClick={checkGiftCard} className="btn-outline whitespace-nowrap flex items-center gap-1"><Gift className="w-4 h-4" /> Check</button>
            </div>
            {giftCardBalance != null && <p className="text-sm text-emerald-600 mt-2 font-medium">Gift card balance: {formatINR(giftCardBalance)}</p>}
          </section>
        </div>

        <div className="lg:col-span-2">
          <div className="surface-card p-6 md:p-7 sticky top-24 shadow-card">
            <h2 className="font-display text-xl font-semibold mb-5">Order Total</h2>
            {cart && (
              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatINR(cart.subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">GST</span><span>{formatINR(cart.gstAmount)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Delivery</span><span className={cart.freeDelivery ? 'text-emerald-600' : ''}>{cart.freeDelivery ? 'FREE' : formatINR(cart.deliveryCharge)}</span></div>
                {couponDiscount > 0 && <div className="flex justify-between text-emerald-600"><span>Coupon</span><span>−{formatINR(couponDiscount)}</span></div>}
                <div className="flex justify-between font-bold text-xl pt-4 border-t">
                  <span>Total</span>
                  <span className="text-brand">{formatINR(estimatedTotal)}</span>
                </div>
              </div>
            )}
            <button onClick={placeOrder} disabled={loading || !selectedAddress} className="btn-primary w-full py-4 text-base">
              {loading ? 'Processing...' : 'Place Order'}
            </button>
            <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-500">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Secure & encrypted checkout
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
