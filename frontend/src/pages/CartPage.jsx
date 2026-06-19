import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Trash2, ShoppingBag } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { formatINR } from '../utils/formatters'
import { resolveImageUrl, imageFallback } from '../utils/images'
import { cartApi } from '../api/cartApi'
import EmptyState from '../components/common/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import CheckoutSteps from '../components/ui/CheckoutSteps'
import LoadingScreen from '../components/ui/LoadingScreen'
import TrustStrip from '../components/ui/TrustStrip'

export default function CartPage() {
  const { cart, refreshCart, setCart, itemCount, loading } = useCart()
  const { isAuthenticated } = useAuth()

  useEffect(() => { if (isAuthenticated) refreshCart() }, [isAuthenticated, refreshCart])

  if (!isAuthenticated) {
    return (
      <div className="page-shell py-12">
        <EmptyState icon="🔐" title="Login required" message="Please sign in to view your shopping cart and saved items." actionLabel="Login" actionTo="/login" />
      </div>
    )
  }

  if (loading) return <LoadingScreen message="Loading your cart..." />

  if (!cart || itemCount === 0) {
    return (
      <div className="page-shell py-12">
        <EmptyState icon="🛒" title="Your cart is empty" message="Discover sarees, kurtas, jewellery and more from our curated collection." actionLabel="Continue Shopping" actionTo="/products" />
      </div>
    )
  }

  const removeItem = async (id) => {
    try {
      const res = await cartApi.removeItem(id)
      setCart(res.data)
    } catch (err) {
      alert(err?.message || 'Could not remove item')
      refreshCart()
    }
  }

  const updateQty = async (id, quantity) => {
    if (quantity < 1) {
      await removeItem(id)
      return
    }
    const item = cart.items.find((i) => i.id === id)
    if (item?.maxQuantity && quantity > item.maxQuantity) {
      alert(`Only ${item.maxQuantity} item(s) available in stock`)
      return
    }
    try {
      const res = await cartApi.updateItem(id, { quantity })
      setCart(res.data)
    } catch (err) {
      alert(err?.message || 'Could not update quantity — insufficient stock')
    }
  }

  return (
    <div className="page-shell">
      <CheckoutSteps current={1} />
      <PageHeader eyebrow="Your bag" title="Shopping Cart" subtitle={`${itemCount} item${itemCount !== 1 ? 's' : ''} ready for checkout`} />

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <p className="text-sm text-gray-500 mb-2">{itemCount} item{itemCount !== 1 ? 's' : ''} in your bag</p>
          {cart.items.map((item) => (
            <div key={item.id} className="surface-card p-4 md:p-5 flex gap-4 md:gap-5 group hover:shadow-card hover:border-brand-100/80 transition-all duration-300 border border-transparent">
              <div className="w-24 h-28 md:w-28 md:h-32 bg-gradient-to-br from-cream-100 to-brand-50 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                <img src={resolveImageUrl(item.productImage)} alt={item.productName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={imageFallback} />
              </div>
              <div className="flex-1 min-w-0 flex flex-col">
                <h3 className="font-semibold text-gray-900 leading-snug">{item.productName}</h3>
                <p className="text-sm text-gray-500 mt-1">{item.variantInfo}</p>
                {item.maxQuantity > 0 && item.maxQuantity <= 5 && (
                  <p className="text-xs text-amber-600 mt-0.5">Only {item.maxQuantity} left in stock</p>
                )}
                <p className="font-bold text-brand mt-2 text-lg">{formatINR(item.unitPrice)}</p>
                <div className="flex items-center justify-between mt-auto pt-3">
                  <div className="qty-control">
                    <button type="button" onClick={() => updateQty(item.id, item.quantity - 1)} className="qty-btn">−</button>
                    <span className="qty-value">{item.quantity}</span>
                    <button type="button" onClick={() => updateQty(item.id, item.quantity + 1)} className="qty-btn" disabled={item.maxQuantity && item.quantity >= item.maxQuantity}>+</button>
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
            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="font-medium">{formatINR(cart.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">GST</span><span>{formatINR(cart.gstAmount)}</span></div>
              <div className="flex justify-between">
                <span className="text-gray-500">Delivery</span>
                <span className={cart.freeDelivery ? 'text-emerald-600 font-semibold' : ''}>{cart.freeDelivery ? 'FREE ✓' : formatINR(cart.deliveryCharge)}</span>
              </div>
              <div className="flex justify-between font-bold text-xl pt-4 border-t border-gray-100">
                <span>Total</span>
                <span className="text-brand">{formatINR(cart.total)}</span>
              </div>
            </div>
            <Link to="/checkout" className="btn-primary w-full mt-6 block text-center py-3.5">Proceed to Checkout</Link>
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
