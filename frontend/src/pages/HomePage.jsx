import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { productApi, categoryApi } from '../api/productApi'
import { discoveryApi } from '../api/discoveryApi'
import { useAuth } from '../context/AuthContext'
import ProductCard from '../components/common/ProductCard'
import SectionHeader from '../components/ui/SectionHeader'
import TrustStrip from '../components/ui/TrustStrip'
import { setSEO } from '../utils/seo'
import { resolveImageUrl, imageFallback } from '../utils/images'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function HomePage() {
  const { isAuthenticated } = useAuth()
  const [featured, setFeatured] = useState([])
  const [newArrivals, setNewArrivals] = useState([])
  const [recentlyViewed, setRecentlyViewed] = useState([])
  const [categories, setCategories] = useState([])
  const [banners, setBanners] = useState([])
  const [bannerIndex, setBannerIndex] = useState(0)

  useEffect(() => {
    setSEO('Home', "Shop sarees, ethnic wear, jewellery & beauty at Haritha Fashion World")
    productApi.featured().then((r) => setFeatured(r.data || [])).catch(() => {})
    productApi.newArrivals().then((r) => setNewArrivals(r.data || [])).catch(() => {})
    categoryApi.getTree().then((r) => setCategories(r.data || [])).catch(() => {})
    discoveryApi.banners().then((r) => setBanners(r.data || [])).catch(() => {})
    if (isAuthenticated) {
      discoveryApi.recentlyViewed().then((r) => setRecentlyViewed(r.data || [])).catch(() => {})
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (banners.length <= 1) return undefined
    const t = setInterval(() => setBannerIndex((i) => (i + 1) % banners.length), 6000)
    return () => clearInterval(t)
  }, [banners.length])

  const prevBanner = () => setBannerIndex((i) => (i - 1 + banners.length) % banners.length)
  const nextBanner = () => setBannerIndex((i) => (i + 1) % banners.length)

  return (
    <div className="animate-fade-in">
      {banners.length > 0 ? (
        <section className="relative bg-gray-900 text-white overflow-hidden">
          {banners.map((b, i) => (
            <BannerSlide key={b.id} banner={b} active={i === bannerIndex} />
          ))}
          {banners.length > 1 && (
            <>
              <button type="button" onClick={prevBanner} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 flex items-center justify-center transition-all z-10" aria-label="Previous">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button type="button" onClick={nextBanner} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 flex items-center justify-center transition-all z-10" aria-label="Next">
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {banners.map((_, i) => (
                  <button key={i} type="button" onClick={() => setBannerIndex(i)} className={`h-1.5 rounded-full transition-all duration-300 ${i === bannerIndex ? 'w-8 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'}`} aria-label={`Slide ${i + 1}`} />
                ))}
              </div>
            </>
          )}
        </section>
      ) : (
        <section className="relative bg-gradient-to-br from-brand-800 via-brand-600 to-brand-400 text-white overflow-hidden">
          <div className="absolute inset-0 bg-hero-shimmer" />
          <div className="max-w-7xl mx-auto px-4 py-20 md:py-32 relative">
            <p className="eyebrow text-gold-light mb-4">New Season</p>
            <h1 className="font-display text-5xl md:text-7xl font-semibold mb-6 max-w-2xl leading-tight">Discover Your Style</h1>
            <p className="text-lg md:text-xl text-white/90 mb-10 max-w-xl leading-relaxed">Sarees, ethnic wear, western clothing, fine jewellery & beauty — curated for the modern Indian woman.</p>
            <Link to="/products" className="inline-flex items-center gap-2 bg-white text-brand font-semibold px-8 py-4 rounded-xl hover:bg-cream-50 shadow-xl hover:-translate-y-0.5 transition-all">
              Shop Now →
            </Link>
          </div>
        </section>
      )}

      <TrustStrip compact />

      <section className="max-w-7xl mx-auto px-4 py-14 md:py-20">
        <SectionHeader eyebrow="Categories" title="Shop by Category" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-5">
          {categories.map((cat) => (
            <Link key={cat.id} to={`/products?category=${cat.slug}`} className="surface-card-hover flex flex-col items-center p-6 group">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-50 to-gold-light overflow-hidden mb-4 ring-2 ring-brand-100 group-hover:ring-brand/50 group-hover:scale-105 transition-all duration-300 shadow-sm">
                {cat.imageUrl ? (
                  <img src={resolveImageUrl(cat.imageUrl)} alt={cat.name} className="w-full h-full object-cover" onError={imageFallback} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-brand font-display text-2xl font-bold">{cat.name.charAt(0)}</div>
                )}
              </div>
              <span className="text-sm font-semibold text-center text-gray-700 group-hover:text-brand transition-colors">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {recentlyViewed.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-10 md:py-14">
          <SectionHeader eyebrow="For you" title="Recently Viewed" linkLabel="View all" linkTo="/products" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {recentlyViewed.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-10 md:py-14">
          <SectionHeader eyebrow="Curated picks" title="Trending Now" linkLabel="View all" linkTo="/products" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-10 md:py-20 pb-24">
          <SectionHeader eyebrow="Just dropped" title="New Arrivals" linkLabel="Explore" linkTo="/products?sort=NEWEST" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {newArrivals.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  )
}

function BannerSlide({ banner, active }) {
  const navigate = useNavigate()
  if (!active) return null
  return (
    <div
      className="relative min-h-[360px] md:min-h-[480px] flex items-center cursor-pointer animate-fade-in"
      onClick={() => banner.linkUrl && navigate(banner.linkUrl)}
      onKeyDown={(e) => e.key === 'Enter' && banner.linkUrl && navigate(banner.linkUrl)}
      role="button"
      tabIndex={0}
    >
      <img src={resolveImageUrl(banner.imageUrl)} alt={banner.title || ''} className="absolute inset-0 w-full h-full object-cover" onError={imageFallback} />
      <div className="hero-gradient-overlay" />
      <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24 w-full">
        <p className="text-gold-light text-sm uppercase tracking-[0.25em] mb-4 font-semibold animate-slide-up">New Collection</p>
        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-semibold mb-5 max-w-3xl leading-tight animate-slide-up">{banner.title}</h1>
        {banner.subtitle && <p className="text-lg md:text-xl text-white/90 mb-10 max-w-xl leading-relaxed animate-slide-up">{banner.subtitle}</p>}
        <Link to={banner.linkUrl || '/products'} onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-2 bg-white text-brand font-semibold px-8 py-4 rounded-xl hover:bg-cream-50 shadow-xl hover:-translate-y-0.5 transition-all animate-slide-up">
          Shop Now →
        </Link>
      </div>
    </div>
  )
}
