import { Link } from 'react-router-dom'
import { Heart, Star } from 'lucide-react'
import { formatINR, calcDiscount } from '../../utils/formatters'
import { useWishlist } from '../../context/WishlistContext'
import { resolveImageUrl, imageFallback } from '../../utils/images'

export default function ProductCard({ product }) {
  const { toggle, isWishlisted } = useWishlist()
  const price = product.finalPrice || product.basePrice
  const discount = calcDiscount(product.mrp, price)
  const wishlisted = isWishlisted(product.id)

  return (
    <div className="group relative surface-card-hover overflow-hidden">
      {discount > 0 && (
        <span className="discount-badge">{discount}% OFF</span>
      )}
      <button
        onClick={(e) => { e.preventDefault(); toggle(product) }}
        className={`absolute top-3 right-3 z-10 p-2.5 rounded-xl backdrop-blur-md shadow-sm transition-all duration-300 hover:scale-110 ${
          wishlisted ? 'bg-brand text-white' : 'bg-white/90 text-gray-400 hover:text-brand'
        }`}
        aria-label="Add to wishlist"
      >
        <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
      </button>
      <Link to={`/products/${product.slug}`}>
        <div className="aspect-[3/4] bg-gradient-to-br from-cream-100 to-brand-50 overflow-hidden relative">
          <img
            src={resolveImageUrl(product.primaryImageUrl)}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
            loading="lazy"
            onError={imageFallback}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className="p-4 md:p-5">
          {product.categoryName && (
            <p className="text-[11px] uppercase tracking-wider text-brand/70 font-semibold truncate">{product.categoryName}</p>
          )}
          <h3 className="font-medium text-gray-900 line-clamp-2 mt-1 leading-snug group-hover:text-brand transition-colors min-h-[2.5rem]">{product.name}</h3>
          <div className="flex items-baseline gap-2 mt-2.5 flex-wrap">
            <span className="font-bold text-lg text-gray-900">{formatINR(price)}</span>
            {discount > 0 && (
              <span className="text-sm text-gray-400 line-through">{formatINR(product.mrp)}</span>
            )}
          </div>
          {product.avgRating > 0 && (
            <div className="flex items-center gap-1.5 mt-2">
              <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                <span className="text-xs font-semibold">{product.avgRating}</span>
              </div>
              <span className="text-xs text-gray-400">({product.reviewCount})</span>
            </div>
          )}
        </div>
      </Link>
    </div>
  )
}
