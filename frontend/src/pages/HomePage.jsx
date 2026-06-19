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
import { ChevronLeft, ChevronRight, Sparkles, Gift, Truck, ArrowRight } from 'lucide-react'

const OFFERS = [
  { title: 'Welcome Offer', desc: '10% off first order', code: 'WELCOME10', gradient: 'from-brand-600 to-brand-800', to: '/products' },
  { title: 'Gift Cards', desc: 'Perfect for every occasion', code: 'HFDEMO500', gradient: 'from-gold-dark to-amber-700', to: '/gift-cards' },
  { title: 'Free Shipping', desc: 'On orders above ₹499', code: 'AUTO', gradient: 'from-emerald-600 to-teal-700', to: '/products' }
]

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
              <button type="button" onClick={prevBanner} className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/25 flex items-center justify-center transition-all z-10 border border-white/10" aria-label="Previous">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button type="button" onClick={nextBanner} className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/25 flex items-center justify-center transition-all z-10 border border-white/10" aria-label="Next">
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {banners.map((_, i) => (
                  <button key={i} type="button" onClick={() => setBannerIndex(i)} className={`h-1.5 rounded-full transition-all duration-300 ${i === bannerIndex ? 'w-10 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'}`} aria-label={`Slide ${i + 1}`} />
                ))}
              </div>
            </>
          )}
        </section>
      ) : (
        <section className="relative bg-gradient-to-br from-brand-950 via-brand-700 to-brand-500 text-white overflow-hidden min-h-[420px] md:min-h-[520px] flex items-center">
          <div className="absolute inset-0 bg-hero-shimmer" />
          <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-gold/10 blur-3xl animate-float pointer-events-none" />
          <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-white/5 blur-3xl pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 relative w-full">
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-2 eyebrow text-gold-light mb-5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10">
                <Sparkles className="w-3.5 h-3.5" />
                New Season Collection
              </p>
              <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-semibold mb-6 leading-[1.05] text-balance">
                Discover Your Style
              </h1>
              <p className="text-lg md:text-xl text-white/85 mb-10 max-w-xl leading-relaxed">
                Sarees, ethnic wear, western clothing, fine jewellery & beauty — curated for the modern Indian woman.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/products" className="inline-flex items-center gap-2 bg-white text-brand font-semibold px-8 py-4 rounded-xl hover:bg-cream-50 shadow-xl hover:-translate-y-0.5 transition-all">
                  Shop Now
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/products?sort=NEWEST" className="inline-flex items-center gap-2 border-2 border-white/30 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-all">
                  New Arrivals
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <TrustStrip compact />

      {/* Offers row */}
      <section className="max-w-7xl mx-auto px-4 py-10 md:py-14">
        <div className="grid md:grid-cols-3 gap-4 md:gap-5">
          {OFFERS.map((o) => (
            <Link key={o.title} to={o.to} className={`offer-card bg-gradient-to-br ${o.gradient} text-white group`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-500" />
              <p className="text-xs uppercase tracking-widest text-white/70 font-semibold relative z-10">{o.code !== 'AUTO' ? `Code: ${o.code}` : o.code}</p>
              <h3 className="font-display text-2xl font-semibold mt-1 relative z-10">{o.title}</h3>
              <p className="text-sm text-white/80 mt-1 relative z-10">{o.desc}</p>
              <span className="inline-flex items-center gap-1 text-sm font-medium mt-4 relative z-10 group-hover:gap-2 transition-all">
                Explore <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-14 md:pb-20">
        <SectionHeader eyebrow="Categories" title="Shop by Category" subtitle="Handpicked collections for every occasion" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-5">
          {categories.map((cat) => (
            <Link key={cat.id} to={`/products?category=${cat.slug}`} className="group surface-card-hover p-4 md:p-5 text-center">
              <div className="relative aspect-square rounded-xl overflow-hidden mb-4 ring-2 ring-brand-100/80 group-hover:ring-brand/40 transition-all duration-300">
                {cat.imageUrl ? (
                  <img src={resolveImageUrl(cat.imageUrl)} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" onError={imageFallback} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-50 to-gold-light font-display text-4xl font-bold text-brand">{cat.name.charAt(0)}</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="text-sm font-semibold text-center block text-gray-800 group-hover:text-brand transition-colors">{cat.name}</span>
              {cat.description && (
                <span className="text-[11px] text-gray-500 text-center block mt-1 line-clamp-2 leading-relaxed">{cat.description}</span>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* Editorial split */}
      <section className="max-w-7xl mx-auto px-4 pb-14 md:pb-20">
        <div className="grid md:grid-cols-2 gap-5 md:gap-6">
          <Link to="/products?category=sarees-ethnic-wear" className="section-band-dark p-8 md:p-12 min-h-[280px] flex flex-col justify-end group">
            <p className="text-gold-light text-xs uppercase tracking-[0.2em] mb-3">Festive Edit</p>
            <h2 className="font-display text-3xl md:text-4xl font-semibold mb-3 group-hover:text-gold-light transition-colors">Sarees & Ethnic Wear</h2>
            <p className="text-white/70 text-sm max-w-sm mb-5">Silk, cotton & designer sarees for weddings, festivals & everyday elegance.</p>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-gold-light">Shop collection <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
          </Link>
          <Link to="/products?category=fine-jewellery" className="section-band-light p-8 md:p-12 min-h-[280px] flex flex-col justify-end group relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-brand-100/50 blur-2xl" />
            <p className="eyebrow mb-3 relative z-10">Sparkle</p>
            <h2 className="font-display text-3xl md:text-4xl font-semibold mb-3 relative z-10 group-hover:text-brand transition-colors">Fine Jewellery</h2>
            <p className="text-gray-500 text-sm max-w-sm mb-5 relative z-10">Earrings, necklaces & bangles to complete your look.</p>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-brand relative z-10">Discover <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
          </Link>
        </div>
      </section>

      {recentlyViewed.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-10 md:py-14 bg-white/40 border-y border-brand-100/30">
          <SectionHeader eyebrow="For you" title="Recently Viewed" linkLabel="View all" linkTo="/products" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {recentlyViewed.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12 md:py-16">
          <SectionHeader eyebrow="Curated picks" title="Trending Now" linkLabel="View all" linkTo="/products" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12 md:py-16">
          <SectionHeader eyebrow="Just dropped" title="New Arrivals" linkLabel="Explore" linkTo="/products?sort=NEWEST" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {newArrivals.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Social proof + CTA */}
      <section className="max-w-7xl mx-auto px-4 pb-20 md:pb-28">
        <div className="newsletter-box">
          <div className="relative z-10 max-w-xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-gold-light text-xs font-semibold uppercase tracking-wider mb-6">
              <Gift className="w-3.5 h-3.5" />
              Join 50,000+ happy shoppers
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-white mb-4">Style delivered to your inbox</h2>
            <p className="text-white/70 mb-8 text-sm md:text-base">Exclusive offers, new arrivals & styling tips — plus free delivery on your first order above ₹499.</p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-white/60 mb-8">
              <span className="inline-flex items-center gap-2"><Truck className="w-4 h-4 text-gold" /> Free delivery ₹499+</span>
              <span className="inline-flex items-center gap-2"><Sparkles className="w-4 h-4 text-gold" /> Authentic sellers</span>
            </div>
            <Link to="/register" className="inline-flex items-center gap-2 bg-white text-brand font-semibold px-8 py-4 rounded-xl hover:bg-cream-50 shadow-xl transition-all">
              Create free account
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function BannerSlide({ banner, active }) {
  const navigate = useNavigate()
  if (!active) return null
  return (
    <div
      className="relative min-h-[380px] md:min-h-[520px] lg:min-h-[580px] flex items-center cursor-pointer animate-fade-in"
      onClick={() => banner.linkUrl && navigate(banner.linkUrl)}
      onKeyDown={(e) => e.key === 'Enter' && banner.linkUrl && navigate(banner.linkUrl)}
      role="button"
      tabIndex={0}
    >
      <img src={resolveImageUrl(banner.imageUrl)} alt={banner.title || ''} className="absolute inset-0 w-full h-full object-cover scale-105 animate-[fadeIn_1s_ease-out]" onError={imageFallback} />
      <div className="hero-gradient-overlay" />
      <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-28 w-full">
        <p className="text-gold-light text-xs uppercase tracking-[0.3em] mb-4 font-semibold animate-slide-up">New Collection</p>
        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-semibold mb-5 max-w-3xl leading-[1.08] animate-slide-up">{banner.title}</h1>
        {banner.subtitle && <p className="text-lg md:text-xl text-white/90 mb-10 max-w-xl leading-relaxed animate-slide-up">{banner.subtitle}</p>}
        <Link to={banner.linkUrl || '/products'} onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-2 bg-white text-brand font-semibold px-8 py-4 rounded-xl hover:bg-cream-50 shadow-xl hover:-translate-y-0.5 transition-all animate-slide-up">
          Shop Now
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
