import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { wishlistApi } from '../api/orderApi'
import ProductCard from '../components/common/ProductCard'
import EmptyState from '../components/common/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import { Heart, ShoppingBag, Check } from 'lucide-react'

export default function WishlistPage() {
  const { items, refresh } = useWishlist()
  const { refreshCart } = useCart()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [movingId, setMovingId] = useState(null)
  const [movedId, setMovedId] = useState(null)

  const moveToCart = async (productId) => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    setMovingId(productId)
    setMovedId(null)
    try {
      await wishlistApi.moveToCart(productId)
      await Promise.all([refresh(), refreshCart()])
      setMovedId(productId)
      setTimeout(() => setMovedId(null), 2000)
    } catch (err) {
      alert(err?.message || 'Could not move item to cart. It may be out of stock.')
    } finally {
      setMovingId(null)
    }
  }

  const remove = async (productId) => {
    if (!isAuthenticated) {
      const next = items.filter((i) => i.id !== productId)
      localStorage.setItem('wishlist', JSON.stringify(next))
      await refresh()
      return
    }
    try {
      await wishlistApi.remove(productId)
      await refresh()
    } catch (err) {
      alert(err?.message || 'Could not remove item')
    }
  }

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Saved for later"
        title="My Wishlist"
        subtitle={items.length > 0 ? `${items.length} favourite${items.length !== 1 ? 's' : ''}` : 'Items you love, saved for later'}
        action={items.length > 0 ? (
          <Link to="/cart" className="btn-outline text-sm py-2 hidden sm:inline-flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            View cart
          </Link>
        ) : null}
      />

      {items.length === 0 ? (
        <EmptyState icon="💝" title="Wishlist is empty" message="Tap the heart on any product to save it here and shop when you're ready." actionLabel="Explore Products" actionTo="/products" />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {items.map((p) => (
            <div key={p.id} className="flex flex-col">
              <ProductCard product={p} />
              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => moveToCart(p.id)}
                  disabled={movingId === p.id || p.inStock === false}
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs btn-outline py-2.5 disabled:opacity-50"
                >
                  {movingId === p.id ? (
                    'Moving...'
                  ) : movedId === p.id ? (
                    <><Check className="w-3.5 h-3.5" /> Added!</>
                  ) : (
                    <><ShoppingBag className="w-3.5 h-3.5" /> Move to cart</>
                  )}
                </button>
                <button type="button" onClick={() => remove(p.id)} className="flex items-center justify-center gap-1 text-xs text-red-500 flex-1 border-2 border-red-200 rounded-xl py-2.5 hover:bg-red-50 transition-colors">
                  <Heart className="w-3.5 h-3.5" />
                  Remove
                </button>
              </div>
              {p.inStock === false && (
                <p className="text-xs text-red-500 text-center mt-1">Out of stock</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
