import { Link } from 'react-router-dom'
import { Heart, Star, Eye, ShoppingBag } from 'lucide-react'
import { formatINR, calcDiscount } from '../../utils/formatters'
import { useWishlist } from '../../context/WishlistContext'
import { resolveImageUrl, imageFallback } from '../../utils/images'

export default function ProductCard({ product, showQuickView = true }) {
  const { toggle, isWishlisted } = useWishlist()
  const price = product.finalPrice || product.basePrice
  const discount = calcDiscount(product.mrp, price)
  const wishlisted = isWishlisted(product.id)
  const isNew = product.isNew || product.createdRecently

  return (
    <div className="product-card group">
      {discount > 0 && (
        <span className="discount-badge">{discount}% OFF</span>
      )}
      {isNew && (
        <span className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-gold text-white shadow-md">
          New
        </span>
      )}
      <button
        onClick={(e) => { e.preventDefault(); toggle(product) }}
        className={`absolute top-3 right-3 z-10 p-2.5 rounded-xl backdrop-blur-md shadow-sm transition-all duration-300 hover:scale-110 ${
          wishlisted ? 'bg-brand text-white shadow-brand/30' : 'bg-white/95 text-gray-400 hover:text-brand hover:bg-white'
        }`}
        aria-label="Add to wishlist"
      >
        <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
      </button>

      <Link to={`/products/${product.slug}`} className="block">
        <div className="product-card-image">
          <img
            src={resolveImageUrl(product.primaryImageUrl)}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            loading="lazy"
            onError={imageFallback}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {showQuickView && (
            <div className="product-card-overlay">
              <span className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white text-gray-900 text-sm font-semibold shadow-lg">
                <Eye className="w-4 h-4" />
                Quick View
              </span>
            </div>
          )}
        </div>
        <div className="p-4 md:p-5">
          {product.categoryName && (
            <p className="text-[10px] uppercase tracking-[0.15em] text-brand/80 font-semibold truncate">{product.categoryName}</p>
          )}
          <h3 className="font-medium text-gray-900 line-clamp-2 mt-1 leading-snug group-hover:text-brand transition-colors min-h-[2.5rem]">{product.name}</h3>
          <div className="flex items-baseline gap-2 mt-2.5 flex-wrap">
            <span className="font-bold text-lg text-gray-900">{formatINR(price)}</span>
            {discount > 0 && (
              <>
                <span className="text-sm text-gray-400 line-through">{formatINR(product.mrp)}</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">SAVE {formatINR(product.mrp - price)}</span>
              </>
            )}
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100/80">
            {product.avgRating > 0 ? (
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 ring-1 ring-amber-100">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  <span className="text-xs font-semibold">{product.avgRating}</span>
                </div>
                <span className="text-xs text-gray-400">({product.reviewCount})</span>
              </div>
            ) : (
              <span className="text-xs text-gray-400">Premium quality</span>
            )}
            <span className="inline-flex items-center gap-1 text-xs font-medium text-brand opacity-0 group-hover:opacity-100 transition-opacity">
              <ShoppingBag className="w-3 h-3" />
              Shop
            </span>
          </div>
        </div>
      </Link>
    </div>
  )
}
