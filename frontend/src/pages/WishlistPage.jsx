import { Link, useNavigate } from 'react-router-dom'
import { useState, useMemo } from 'react'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { wishlistApi } from '../api/orderApi'
import { formatINR } from '../utils/formatters'
import ProductCard from '../components/common/ProductCard'
import EmptyState from '../components/common/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import { Heart, ShoppingBag, Check, TrendingDown, Share2 } from 'lucide-react'

const COLLECTIONS = ['All', 'Sarees', 'Ethnic Wear', 'Western', 'Jewellery', 'Beauty', 'Bags']

export default function WishlistPage() {
  const { items, refresh } = useWishlist()
  const { refreshCart } = useCart()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [movingId, setMovingId] = useState(null)
  const [movedId, setMovedId] = useState(null)
  const [activeCollection, setActiveCollection] = useState('All')

  const priceDropItems = useMemo(() =>
    items.filter(p => p.priceDropped && p.currentPrice < p.priceAtAdd), [items])

  const filteredItems = useMemo(() => {
    if (activeCollection === 'All') return items
    return items.filter(p =>
      p.categoryName?.toLowerCase().includes(activeCollection.toLowerCase())
    )
  }, [items, activeCollection])

  const shareWishlist = () => {
    const url = `${window.location.origin}/wishlist/share/${Math.random().toString(36).slice(2)}`
    if (navigator.share) {
      navigator.share({ title: 'My Haritha Fashion Wishlist', url })
    } else {
      navigator.clipboard.writeText(url)
      alert('Link copied!')
    }
  }

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

      {/* Price drop alert */}
      {priceDropItems.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <TrendingDown className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-emerald-800 text-sm">
              Prices dropped on {priceDropItems.length} item{priceDropItems.length !== 1 ? 's' : ''} in your wishlist!
            </p>
            <p className="text-xs text-emerald-600 mt-0.5">
              Save up to {formatINR(Math.max(...priceDropItems.map(p => (p.priceAtAdd || 0) - (p.currentPrice || 0))))} — grab them before they go up again.
            </p>
          </div>
        </div>
      )}

      {/* Collection tabs */}
      {items.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {COLLECTIONS.map((c) => (
            <button key={c} onClick={() => setActiveCollection(c)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border transition-all ${
                activeCollection === c ? 'bg-brand text-white border-brand' : 'border-gray-200 text-gray-600 hover:border-brand hover:text-brand'
              }`}>
              {c} {c === 'All' ? `(${items.length})` : ''}
            </button>
          ))}
          <button onClick={shareWishlist}
            className="ml-auto px-3 py-2 rounded-full border border-gray-200 text-gray-500 hover:text-brand hover:border-brand flex items-center gap-1 text-sm whitespace-nowrap">
            <Share2 size={13} /> Share
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState icon="💝" title="Wishlist is empty" message="Tap the heart on any product to save it here and shop when you're ready." actionLabel="Explore Products" actionTo="/products" />
      ) : filteredItems.length === 0 ? (
        <EmptyState icon="🔍" title="No items in this collection" message="Add items to this collection from the product page." />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {filteredItems.map((p) => (
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
              {p.priceDropped && p.currentPrice < p.priceAtAdd && (
                <div className="text-xs text-emerald-600 text-center mt-1 flex items-center justify-center gap-1">
                  <TrendingDown size={11} />
                  Price dropped! Was {formatINR(p.priceAtAdd)} → {formatINR(p.currentPrice)}
                </div>
              )}
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
