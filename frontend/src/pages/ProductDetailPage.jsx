import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { productApi } from '../api/productApi'
import { formatINR, calcDiscount } from '../utils/formatters'
import { setSEO } from '../utils/seo'
import { resolveImageUrl, imageFallback } from '../utils/images'
import { trackEvent } from '../utils/analytics'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useWishlist } from '../context/WishlistContext'
import { stockAlertApi } from '../api/reviewApi'
import ProductCard from '../components/common/ProductCard'
import ReviewsSection from '../components/product/ReviewsSection'
import QASection from '../components/product/QASection'
import LoadingScreen from '../components/ui/LoadingScreen'
import TrustStrip from '../components/ui/TrustStrip'
import { Heart, Star, Truck, RotateCcw, ShieldCheck, MapPin } from 'lucide-react'

export default function ProductDetailPage() {
  const { slug } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [related, setRelated] = useState([])
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [qty, setQty] = useState(1)
  const [pincode, setPincode] = useState('')
  const [serviceable, setServiceable] = useState(null)
  const [alertEmail, setAlertEmail] = useState('')
  const { addToCart } = useCart()
  const { isAuthenticated, user } = useAuth()
  const { toggle, isWishlisted } = useWishlist()
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    productApi.getBySlug(slug).then((r) => {
      const p = r.data
      setProduct(p)
      setSEO(p.name, p.description, resolveImageUrl(p.images?.[0]?.imageUrl))
      trackEvent('view_item', { item_id: p.id, item_name: p.name, price: p.finalPrice })
      if (p.variants?.length) setSelectedVariant(p.variants.find((v) => v.stockQuantity > 0) || p.variants[0])
      productApi.completeTheLook(p.id).then((res) => setRelated(res.data || [])).catch(() => {})
    }).catch(() => setProduct(null)).finally(() => setLoading(false))
  }, [slug])

  const handleAddToCart = async () => {
    if (!isAuthenticated) { navigate('/login'); return }
    if (!selectedVariant) return
    try {
      await addToCart(product.id, selectedVariant.id, qty)
      trackEvent('add_to_cart', { item_id: product.id, quantity: qty })
      return true
    } catch (err) {
      alert(err?.message || 'Could not add item to cart')
      return false
    }
  }

  const handleBuyNow = async () => {
    const ok = await handleAddToCart()
    if (ok) navigate('/checkout')
  }

  const checkPincode = async () => {
    if (pincode.length !== 6) return
    const r = await productApi.pincodeCheck(pincode)
    setServiceable(r.data?.serviceable ?? r.data)
  }

  const notifyStock = async () => {
    if (!selectedVariant) return
    await stockAlertApi.subscribe(product.id, selectedVariant.id, alertEmail || user?.email)
    alert('We will notify you when back in stock')
  }

  if (loading) return <LoadingScreen message="Loading product..." />
  if (!product) return (
    <div className="page-shell py-20 text-center">
      <p className="text-gray-500 mb-4">Product not found</p>
      <Link to="/products" className="btn-primary">Browse Products</Link>
    </div>
  )

  const discount = calcDiscount(product.mrp, product.finalPrice)
  const outOfStock = selectedVariant && selectedVariant.stockQuantity <= 0
  const wishlisted = isWishlisted(product.id)

  return (
    <div className="page-shell">
      <nav className="breadcrumb">
        <Link to="/">Home</Link>
        <span className="breadcrumb-sep">/</span>
        <Link to="/products">Products</Link>
        <span className="breadcrumb-sep">/</span>
        <span className="text-gray-700 truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-14">
        <div>
          <div className="aspect-[3/4] bg-gradient-to-br from-cream-100 to-brand-50 rounded-2xl overflow-hidden shadow-card relative group">
            <img
              src={resolveImageUrl(product.images?.[selectedImage]?.imageUrl)}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              onError={imageFallback}
            />
            {discount > 0 && <span className="discount-badge text-sm">{discount}% OFF</span>}
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-3 mt-4 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button key={img.id || i} type="button" onClick={() => setSelectedImage(i)} className={`w-20 h-24 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${selectedImage === i ? 'border-brand shadow-md ring-2 ring-brand/20' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                  <img src={resolveImageUrl(img.imageUrl)} alt="" className="w-full h-full object-cover" onError={imageFallback} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start space-y-6">
          <div>
            <p className="text-sm text-brand font-medium">{product.sellerName}</p>
            <h1 className="font-display text-3xl md:text-4xl font-semibold mt-2 leading-tight">{product.name}</h1>
            {product.avgRating > 0 && (
              <div className="flex items-center gap-2 mt-3">
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span className="font-semibold text-amber-800">{product.avgRating}</span>
                </div>
                <span className="text-sm text-gray-500">{product.reviewCount} reviews</span>
              </div>
            )}
          </div>

          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-3xl font-bold text-gray-900">{formatINR(product.finalPrice)}</span>
            {discount > 0 && (
              <>
                <span className="text-xl text-gray-400 line-through">{formatINR(product.mrp)}</span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-semibold">{discount}% off</span>
              </>
            )}
          </div>

          {product.variants?.length > 0 && (
            <div>
              <p className="font-semibold mb-3 text-sm uppercase tracking-wide text-gray-500">Select Size</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariant(v)}
                    disabled={v.stockQuantity <= 0}
                    className={
                      v.stockQuantity <= 0 ? 'variant-pill-disabled'
                        : selectedVariant?.id === v.id ? 'variant-pill-active' : 'variant-pill-inactive'
                    }
                  >
                    {v.size || v.color}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-4">
            <div className="qty-control">
              <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} className="qty-btn">−</button>
              <span className="qty-value">{qty}</span>
              <button type="button" onClick={() => setQty(qty + 1)} className="qty-btn">+</button>
            </div>
            <button type="button" onClick={() => toggle(product)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all ${wishlisted ? 'border-brand bg-brand-50 text-brand' : 'border-gray-200 hover:border-brand-200 text-gray-600'}`}>
              <Heart className={`w-4 h-4 ${wishlisted ? 'fill-brand' : ''}`} />
              {wishlisted ? 'Saved' : 'Wishlist'}
            </button>
          </div>

          <div className="flex gap-3">
            {!outOfStock ? (
              <>
                <button type="button" onClick={handleAddToCart} className="btn-primary flex-1 py-3.5">Add to Cart</button>
                <button type="button" onClick={handleBuyNow} className="btn-outline flex-1 py-3.5">Buy Now</button>
              </>
            ) : (
              <div className="flex-1 space-y-3 surface-card p-5">
                <p className="text-red-500 font-medium">Out of stock</p>
                <input className="input-field" placeholder="Email for alert" value={alertEmail} onChange={(e) => setAlertEmail(e.target.value)} />
                <button type="button" onClick={notifyStock} className="btn-outline w-full">Notify me</button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Truck, label: 'Free delivery', sub: '₹499+' },
              { icon: RotateCcw, label: 'Easy returns', sub: '7 days' },
              { icon: ShieldCheck, label: 'Authentic', sub: 'Verified' }
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="text-center p-3 rounded-xl bg-brand-50/50 border border-brand-100/50">
                <Icon className="w-5 h-5 text-brand mx-auto mb-1" />
                <p className="text-xs font-semibold text-gray-800">{label}</p>
                <p className="text-[10px] text-gray-500">{sub}</p>
              </div>
            ))}
          </div>

          <div className="surface-card p-4">
            <div className="flex gap-2">
              <MapPin className="w-5 h-5 text-brand shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium mb-2">Check delivery</p>
                <div className="flex gap-2">
                  <input className="input-field flex-1 py-2 text-sm" placeholder="Enter pincode" maxLength={6} value={pincode} onChange={(e) => setPincode(e.target.value)} />
                  <button type="button" onClick={checkPincode} className="btn-outline py-2 px-4 text-sm">Check</button>
                </div>
                {serviceable != null && (
                  <p className={`text-sm mt-2 font-medium ${serviceable ? 'text-emerald-600' : 'text-red-500'}`}>
                    {serviceable ? '✓ Delivery available to your pincode' : '✗ Not serviceable yet'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {product.description && (
            <div className="surface-card p-5">
              <h3 className="font-display text-xl font-semibold mb-3">About this product</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-16 md:mt-20">
        <ReviewsSection productId={product.id} />
        <QASection productId={product.id} />
      </div>

      {related.length > 0 && (
        <section className="mt-16 md:mt-20">
          <h2 className="section-title mb-8">Complete the Look</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      <div className="mt-16">
        <TrustStrip compact />
      </div>
    </div>
  )
}
