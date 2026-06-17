import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Trash2, ShoppingBag, Tag, Gift, AlertCircle } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { formatINR } from '../utils/formatters'
import { resolveImageUrl, imageFallback } from '../utils/images'
import { cartApi } from '../api/cartApi'
import api from '../api/axiosInstance'
import EmptyState from '../components/common/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import CheckoutSteps from '../components/ui/CheckoutSteps'
import LoadingScreen from '../components/ui/LoadingScreen'
import TrustStrip from '../components/ui/TrustStrip'

export default function CartPage() {
  const { cart, refreshCart, setCart, itemCount, loading } = useCart()
  const { isAuthenticated } = useAuth()

  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponError, setCouponError] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [giftCode, setGiftCode] = useState('')
  const [appliedGift, setAppliedGift] = useState(null)
  const [giftError, setGiftError] = useState('')
  const [giftLoading, setGiftLoading] = useState(false)

  useEffect(() => { if (isAuthenticated) refreshCart() }, [isAuthenticated, refreshCart])

  if (!isAuthenticated) {
    return (
      <div className="page-shell py-12">
        <EmptyState icon="🔐" title="Login required" message="Please sign in to view your shopping cart." actionLabel="Login" actionTo="/login" />
      </div>
    )
  }

  if (loading) return <LoadingScreen message="Loading your cart..." />

  if (!cart || itemCount === 0) {
    return (
      <div className="page-shell py-12">
        <EmptyState icon="🛒" title="Your cart is empty" message="Discover sarees, kurtas, jewellery and more." actionLabel="Continue Shopping" actionTo="/products" />
      </div>
    )
  }

  const removeItem = async (id) => {
    const res = await cartApi.removeItem(id)
    setCart(res.data)
  }

  const updateQty = async (id, quantity) => {
    if (quantity < 1) return
    const res = await cartApi.updateItem(id, { quantity })
    setCart(res.data)
  }

  const applyCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponLoading(true); setCouponError('')
    try {
      const res = await api.post('/coupons/apply', {
        code: couponCode.trim().toUpperCase(),
        orderAmount: cart.subtotal
      })
      setAppliedCoupon(res.data)
    } catch (err) {
      setCouponError(err.message || 'Invalid coupon')
    } finally {
      setCouponLoading(false)
    }
  }

  const applyGiftCard = async () => {
    if (!giftCode.trim()) return
    setGiftLoading(true); setGiftError('')
    try {
      const res = await api.post('/gift-cards/apply', {
        code: giftCode.trim().toUpperCase(),
        orderTotal: cart.total
      })
      setAppliedGift(res.data)
    } catch (err) {
      setGiftError(err.message || 'Invalid gift card')
    } finally {
      setGiftLoading(false)
    }
  }

  const couponDiscount = appliedCoupon?.discountAmount || 0
  const giftDiscount = appliedGift?.appliedAmount || 0
  const finalTotal = Math.max(0, (cart.total || 0) - couponDiscount - giftDiscount)
  const totalSavings = (cart.subtotal - (cart.total - cart.deliveryCharge)) + couponDiscount + giftDiscount

  return (
    <div className="page-shell">
      <CheckoutSteps current={1} />
      <PageHeader eyebrow="Your bag" title="Shopping Cart" subtitle={`${itemCount} item${itemCount !== 1 ? 's' : ''} ready for checkout`} />

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div key={item.id} className="surface-card p-4 md:p-5 flex gap-4 md:gap-5 group hover:shadow-card transition-shadow">
              <div className="w-24 h-28 md:w-28 md:h-32 bg-gradient-to-br from-cream-100 to-brand-50 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                <img src={resolveImageUrl(item.productImage)} alt={item.productName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={imageFallback} />
              </div>
              <div className="flex-1 min-w-0 flex flex-col">
                <h3 className="font-semibold text-gray-900 leading-snug">{item.productName}</h3>
                <p className="text-sm text-gray-500 mt-1">{item.variantInfo}</p>
                {item.priceChanged && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full w-fit">
                    <AlertCircle size={11} /> Price updated
                  </div>
                )}
                <p className="font-bold text-brand mt-2 text-lg">{formatINR(item.unitPrice)}</p>
                <div className="flex items-center justify-between mt-auto pt-3">
                  <div className="qty-control">
                    <button type="button" onClick={() => updateQty(item.id, item.quantity - 1)} className="qty-btn">−</button>
                    <span className="qty-value">{item.quantity}</span>
                    <button type="button" onClick={() => updateQty(item.id, item.quantity + 1)} className="qty-btn">+</button>
                  </div>
                  <button type="button" onClick={() => removeItem(item.id)} className="flex items-center gap-1.5 text-red-500 text-sm hover:text-red-600 transition-colors px-2 py-1 rounded-lg hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Remove</span>
                  </button>
                </div>
              </div>
              <div className="hidden md:flex flex-col items-end justify-between">
                <p className="font-bold text-gray-900">{formatINR(item.lineTotal || item.unitPrice * item.quantity)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="surface-card p-6 md:p-7 sticky top-24 bg-gradient-to-b from-white to-brand-50/20 shadow-card">
            <div className="flex items-center gap-2 mb-6">
              <ShoppingBag className="w-5 h-5 text-brand" />
              <h2 className="font-display text-xl font-semibold">Order Summary</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="font-medium">{formatINR(cart.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">GST</span><span>{formatINR(cart.gstAmount)}</span></div>
              <div className="flex justify-between">
                <span className="text-gray-500">Delivery</span>
                <span className={cart.freeDelivery ? 'text-emerald-600 font-semibold' : ''}>{cart.freeDelivery ? 'FREE ✓' : formatINR(cart.deliveryCharge)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span className="flex items-center gap-1"><Tag size={13} />Coupon ({appliedCoupon.code})</span>
                  <span>−{formatINR(couponDiscount)}</span>
                </div>
              )}
              {giftDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span className="flex items-center gap-1"><Gift size={13} />Gift card</span>
                  <span>−{formatINR(giftDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-xl pt-3 border-t border-gray-100">
                <span>Total</span>
                <span className="text-brand">{formatINR(finalTotal)}</span>
              </div>
              {totalSavings > 0 && (
                <p className="text-emerald-600 text-xs font-medium text-center bg-emerald-50 py-1.5 rounded-lg">
                  🎉 You save {formatINR(totalSavings)} on this order!
                </p>
              )}
            </div>

            {/* Coupon */}
            <div className="mt-4 border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1"><Tag size={12} /> Have a coupon?</p>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-50 px-3 py-2 rounded-xl text-sm">
                  <span className="text-emerald-700 font-medium">{appliedCoupon.code} applied!</span>
                  <button onClick={() => setAppliedCoupon(null)} className="text-gray-400 hover:text-red-500 text-xs">Remove</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input className="input-field flex-1 py-2 text-sm uppercase" placeholder="COUPON CODE"
                    value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} />
                  <button onClick={applyCoupon} disabled={couponLoading}
                    className="btn-outline text-sm py-2 px-3 whitespace-nowrap">
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </div>
              )}
              {couponError && <p className="text-red-500 text-xs mt-1">{couponError}</p>}
            </div>

            {/* Gift card */}
            <div className="mt-3 border-t border-gray-100 pt-3">
              <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1"><Gift size={12} /> Gift card?</p>
              {appliedGift ? (
                <div className="flex items-center justify-between bg-emerald-50 px-3 py-2 rounded-xl text-sm">
                  <span className="text-emerald-700 font-medium">−{formatINR(giftDiscount)} applied</span>
                  <button onClick={() => setAppliedGift(null)} className="text-gray-400 hover:text-red-500 text-xs">Remove</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input className="input-field flex-1 py-2 text-sm uppercase" placeholder="GIFT-XXXX-XXXX"
                    value={giftCode} onChange={(e) => setGiftCode(e.target.value.toUpperCase())} />
                  <button onClick={applyGiftCard} disabled={giftLoading}
                    className="btn-outline text-sm py-2 px-3 whitespace-nowrap">
                    {giftLoading ? '...' : 'Apply'}
                  </button>
                </div>
              )}
              {giftError && <p className="text-red-500 text-xs mt-1">{giftError}</p>}
            </div>

            <Link to={`/checkout?coupon=${appliedCoupon?.code || ''}&gift=${appliedGift?.code || ''}`}
              className="btn-primary w-full mt-5 block text-center py-3.5">Proceed to Checkout</Link>
            <Link to="/products" className="block text-center text-sm text-brand mt-4 hover:underline">Continue shopping</Link>
            <button type="button" onClick={async () => { await cartApi.clear(); refreshCart() }} className="text-sm text-red-500/80 hover:text-red-600 mt-4 w-full py-2 rounded-lg hover:bg-red-50 transition-colors">Clear cart</button>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <TrustStrip compact />
      </div>
    </div>
  )
}
