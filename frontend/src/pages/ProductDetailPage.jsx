import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { productApi, categoryApi } from '../api/productApi'
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
import ImageZoom from '../components/common/ImageZoom'
import EmiDisplay from '../components/product/EmiDisplay'
import VideoPlayer from '../components/common/VideoPlayer'
import { Heart, Star, Truck, RotateCcw, ShieldCheck, MapPin, Ruler, X } from 'lucide-react'

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
  const [selectedColor, setSelectedColor] = useState(null)
  const [sizeGuide, setSizeGuide] = useState(null)
  const [showSizeGuide, setShowSizeGuide] = useState(false)
  const { addToCart } = useCart()
  const { isAuthenticated, user } = useAuth()
  const { toggle, isWishlisted } = useWishlist()
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    productApi.getBySlug(slug).then((r) => {
      const p = r.data
      setSEO(p.name, p.description, resolveImageUrl(p.images?.[0]?.imageUrl))
      trackEvent('view_item', { item_id: p.id, item_name: p.name, price: p.finalPrice })
      if (p.variants?.length) {
        const firstAvail = p.variants.find((v) => v.stockQuantity > 0) || p.variants[0]
        setSelectedColor(firstAvail?.color || null)
        setSelectedVariant(firstAvail)
      }
      productApi.completeTheLook(p.id).then((res) => setRelated(res.data || [])).catch(() => {})
      // Fetch size guide for this product's category
      if (p.categoryId) {
        categoryApi.getSizeGuide(p.categoryId).then((r) => setSizeGuide(r.data)).catch(() => {})
      }
      setProduct(p)
    }).catch(() => setProduct(null)).finally(() => setLoading(false))
  }, [slug])

  useEffect(() => {
    if (selectedVariant?.stockQuantity != null) {
      setQty((q) => Math.min(q, Math.max(1, selectedVariant.stockQuantity)))
    }
  }, [selectedVariant])

  const handleAddToCart = async () => {
    if (!isAuthenticated) { navigate('/login'); return }
    if (!selectedVariant) return
    if (selectedVariant.stockQuantity > 0 && qty > selectedVariant.stockQuantity) {
      alert(`Only ${selectedVariant.stockQuantity} item(s) available in stock`)
      return
    }
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
    if (!isAuthenticated) { navigate('/login'); return }
    if (!selectedVariant) return
    try {
      await stockAlertApi.subscribe(product.id, selectedVariant.id, alertEmail || user?.email)
      alert('We will notify you when back in stock')
    } catch (err) {
      alert(err.message || 'Could not subscribe to stock alert')
    }
  }

  if (loading) return <LoadingScreen message="Loading product..." />
  if (!product) return (
    <div className="page-shell py-20 text-center">
      <p className="text-gray-500 mb-4">Product not found</p>
      <Link to="/products" className="btn-primary">Browse Products</Link>
    </div>
  )

  const discount = calcDiscount(product.mrp, product.finalPrice)
  const maxQty = selectedVariant ? Math.max(0, selectedVariant.stockQuantity) : 0
  const outOfStock = !selectedVariant || maxQty <= 0
  const wishlisted = isWishlisted(product.id)

  // Unique colours from variants
  const uniqueColors = [...new Map(
    product.variants?.filter(v => v.color).map(v => [v.color, { color: v.color, hex: v.colorHex }])
  ).values()]

  // Sizes available for selected colour
  const sizesForColor = product.variants?.filter(v =>
    !selectedColor || v.color === selectedColor || !v.color
  ) || []

  // JSON-LD schema for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images?.map(i => resolveImageUrl(i.imageUrl)) || [],
    brand: { '@type': 'Brand', name: product.sellerName || 'Haritha Fashion World' },
    offers: {
      '@type': 'Offer',
      price: product.finalPrice,
      priceCurrency: 'INR',
      availability: outOfStock ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      url: window.location.href
    },
    ...(product.avgRating > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.avgRating,
        reviewCount: product.reviewCount || 1
      }
    })
  }

  return (
    <div className="page-shell">
      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Size Guide Modal */}
      {showSizeGuide && sizeGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowSizeGuide(false)} />
          <div className="relative bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display text-xl font-semibold">Size Guide</h3>
              <button onClick={() => setShowSizeGuide(false)}><X size={20} /></button>
            </div>
            {sizeGuide.content ? (
              <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: sizeGuide.content }} />
            ) : (
              <p className="text-gray-500 text-sm">Size guide not available for this category.</p>
            )}
          </div>
        </div>
      )}

      <nav className="breadcrumb">
        <Link to="/">Home</Link>
        <span className="breadcrumb-sep">/</span>
        <Link to="/products">Products</Link>
        <span className="breadcrumb-sep">/</span>
        <span className="text-gray-700 truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-14">
        <div>
          <div className="aspect-[3/4] bg-gradient-to-br from-cream-100 to-brand-50 rounded-2xl overflow-hidden shadow-card relative">
            <ImageZoom
              src={resolveImageUrl(product.images?.[selectedImage]?.imageUrl)}
              alt={product.name}
              className="w-full h-full"
              zoomLevel={2.5}
            />
            {discount > 0 && <span className="discount-badge text-sm">{discount}% OFF</span>}
          </div>
          {(product.images?.length > 1 || product.videos?.length > 0) && (
            <div className="flex gap-3 mt-4 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button key={img.id || i} type="button" onClick={() => setSelectedImage(i)} className={selectedImage === i ? 'gallery-thumb-active' : 'gallery-thumb-inactive'}>
                  <img src={resolveImageUrl(img.imageUrl)} alt="" className="w-full h-full object-cover" onError={imageFallback} />
                </button>
              ))}
            </div>
          )}
          {product.videos?.length > 0 && (
            <div className="mt-4 space-y-3">
              {product.videos.map((v) => (
                <VideoPlayer key={v.id} src={v.videoUrl} className="w-full aspect-video" />
              ))}
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-28 lg:self-start space-y-6">
          <div className="surface-card p-6 md:p-7 shadow-card border-brand-100/50 space-y-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-brand font-semibold">{product.sellerName}</p>
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
            <div className="space-y-4">
              {/* Colour selector */}
              {uniqueColors.length > 0 && (
                <div>
                  <p className="font-semibold mb-2 text-sm uppercase tracking-wide text-gray-500">
                    Colour: <span className="text-gray-800 normal-case font-medium">{selectedColor || 'Select'}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {uniqueColors.map((c) => (
                      <button key={c.color} type="button"
                        onClick={() => {
                          setSelectedColor(c.color)
                          const firstAvail = product.variants.find(v => v.color === c.color && v.stockQuantity > 0)
                            || product.variants.find(v => v.color === c.color)
                          if (firstAvail) setSelectedVariant(firstAvail)
                        }}
                        title={c.color}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor === c.color ? 'border-brand scale-110 shadow-md ring-2 ring-brand/30' : 'border-gray-200 hover:scale-105'}`}
                        style={{ backgroundColor: c.hex || '#ccc' }}
                      />
                    ))}
                  </div>
                </div>
              )}
              {/* Size selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-sm uppercase tracking-wide text-gray-500">Size</p>
                  {sizeGuide && (
                    <button type="button" onClick={() => setShowSizeGuide(true)}
                      className="flex items-center gap-1 text-xs text-brand hover:underline">
                      <Ruler size={13} /> Size guide
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizesForColor.map((v) => {
                    const lowStock = v.stockQuantity > 0 && v.stockQuantity <= 5
                    return (
                      <button key={v.id} type="button"
                        onClick={() => setSelectedVariant(v)}
                        disabled={v.stockQuantity <= 0}
                        className={v.stockQuantity <= 0 ? 'variant-pill-disabled'
                          : selectedVariant?.id === v.id ? 'variant-pill-active' : 'variant-pill-inactive'}
                        title={lowStock ? `Only ${v.stockQuantity} left!` : ''}
                      >
                        {v.size || v.color}
                        {lowStock && <span className="ml-1 text-[10px] text-amber-500">•</span>}
                      </button>
                    )
                  })}
                </div>
                {selectedVariant && selectedVariant.stockQuantity > 0 && selectedVariant.stockQuantity <= 5 && (
                  <p className="text-amber-600 text-xs mt-1.5 font-medium">
                    ⚡ Only {selectedVariant.stockQuantity} left in stock!
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center gap-4">
            <div className="qty-control">
              <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} className="qty-btn">−</button>
              <span className="qty-value">{qty}</span>
              <button type="button" onClick={() => setQty(Math.min(maxQty, qty + 1))} className="qty-btn" disabled={qty >= maxQty}>+</button>
            </div>
            {!outOfStock && maxQty <= 5 && (
              <span className="text-xs text-amber-600">Only {maxQty} left</span>
            )}
            <button type="button" onClick={() => toggle(product)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all ${wishlisted ? 'border-brand bg-brand-50 text-brand' : 'border-gray-200 hover:border-brand-200 text-gray-600'}`}>
              <Heart className={`w-4 h-4 ${wishlisted ? 'fill-brand' : ''}`} />
              {wishlisted ? 'Saved' : 'Wishlist'}
            </button>
          </div>

          <EmiDisplay price={product.finalPrice} />

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
            <div className="surface-card p-5 md:p-6">
              <h3 className="font-display text-xl font-semibold mb-3">About this product</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Mobile sticky buy bar */}
      {!outOfStock && (
        <div className="mobile-buy-bar">
          <div className="flex items-center gap-3 max-w-7xl mx-auto">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 truncate">{product.name}</p>
              <p className="font-bold text-brand text-lg">{formatINR(product.finalPrice)}</p>
            </div>
            <button type="button" onClick={handleAddToCart} className="btn-outline py-3 px-5 text-sm shrink-0">Add</button>
            <button type="button" onClick={handleBuyNow} className="btn-primary py-3 px-6 text-sm shrink-0">Buy Now</button>
          </div>
        </div>
      )}

      <div className="mt-16 md:mt-20 pb-20 lg:pb-0">
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
