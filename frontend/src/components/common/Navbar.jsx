import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, Heart, User, Search, Menu, X, Sparkles, Tag } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { searchApi } from '../../api/discoveryApi'

const NAV_LINKS = [
  { to: '/products?category=sarees-ethnic-wear', label: 'Sarees' },
  { to: '/products?category=western-clothing', label: 'Western' },
  { to: '/products?category=fine-jewellery', label: 'Jewellery' },
  { to: '/products?category=beauty-skincare', label: 'Beauty' },
  { to: '/products?sort=NEWEST', label: 'New In' }
]

export default function Navbar() {
  const { isAuthenticated, user } = useAuth()
  const { itemCount } = useCart()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const debounceRef = useRef(null)
  const wrapperRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setShowSuggestions(false)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  const handleQueryChange = (value) => {
    setQuery(value)
    clearTimeout(debounceRef.current)
    if (value.trim().length < 2) {
      setSuggestions([])
      return
    }
    debounceRef.current = setTimeout(() => {
      searchApi.suggestions(value.trim()).then((r) => {
        const items = r.data?.content || r.data || []
        setSuggestions(items.map((p) => (typeof p === 'string' ? p : p.name)).filter(Boolean))
        setShowSuggestions(true)
      }).catch(() => setSuggestions([]))
    }, 250)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      setShowSuggestions(false)
      setMobileOpen(false)
      navigate(`/products?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const pickSuggestion = (text) => {
    setQuery(text)
    setShowSuggestions(false)
    setMobileOpen(false)
    navigate(`/products?q=${encodeURIComponent(text)}`)
  }

  return (
    <header className={`sticky top-0 z-50 glass-nav transition-shadow duration-300 ${scrolled ? 'nav-scrolled' : ''}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="h-16 md:h-[4.25rem] flex items-center justify-between gap-3 md:gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <button type="button" onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden btn-icon -ml-1" aria-label="Menu">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand to-brand-700 flex items-center justify-center shadow-md shadow-brand/25 group-hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:block leading-tight">
                <span className="font-display text-xl md:text-2xl font-semibold text-brand tracking-tight block">Haritha</span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-medium">Fashion World</span>
              </div>
            </Link>
          </div>

          <nav className="hidden lg:flex items-center gap-0.5">
            {NAV_LINKS.map((l) => (
              <Link key={l.to} to={l.to} className="px-3.5 py-2 text-sm font-medium text-gray-600 hover:text-brand rounded-lg hover:bg-brand-50/70 transition-all relative group">
                {l.label}
                <span className="absolute bottom-1 left-3.5 right-3.5 h-0.5 bg-brand scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full" />
              </Link>
            ))}
          </nav>

          <form onSubmit={handleSearch} className="flex flex-1 max-w-md lg:max-w-xl mx-2" ref={wrapperRef}>
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="search"
                placeholder="Search sarees, kurtas, jewellery..."
                className="w-full pl-11 pr-4 py-2.5 md:py-3 bg-white/90 border border-gray-200/80 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 focus:bg-white shadow-sm transition-all"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              />
              {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute top-full left-0 right-0 mt-2 bg-white/98 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-card overflow-hidden z-50 animate-slide-up divide-y divide-gray-50">
                  {suggestions.map((s) => (
                    <li key={s}>
                      <button type="button" onClick={() => pickSuggestion(s)} className="w-full text-left px-4 py-3.5 text-sm hover:bg-brand-50 flex items-center gap-3 transition-colors">
                        <Search className="w-3.5 h-3.5 text-brand/60" />
                        {s}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </form>

          <nav className="flex items-center gap-0.5 sm:gap-1 shrink-0">
            <Link to="/products" className="btn-icon hidden xl:flex" aria-label="Offers" title="Offers">
              <Tag className="w-5 h-5" />
            </Link>
            <Link to="/wishlist" className="btn-icon hidden sm:flex" aria-label="Wishlist">
              <Heart className="w-5 h-5" />
            </Link>
            <Link to="/cart" className="btn-icon relative" aria-label="Cart">
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-br from-brand to-brand-700 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 shadow-md ring-2 ring-white">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>
            {isAuthenticated ? (
              <>
                {user?.role === 'ADMIN' && (
                  <Link to="/admin/dashboard" className="hidden md:inline-flex text-xs font-semibold text-gray-500 hover:text-brand px-2.5 py-2 rounded-lg hover:bg-brand-50 uppercase tracking-wide">
                    Admin
                  </Link>
                )}
                {user?.role === 'SELLER' && (
                  <Link to="/seller/dashboard" className="hidden md:inline-flex text-xs font-semibold text-gray-500 hover:text-brand px-2.5 py-2 rounded-lg hover:bg-brand-50 uppercase tracking-wide">
                    Seller
                  </Link>
                )}
                <Link to="/profile" className="hidden sm:flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-xl hover:bg-brand-50 transition-all group border border-transparent hover:border-brand-100">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand to-brand-600 text-white flex items-center justify-center text-sm font-semibold shadow-sm">
                    {(user?.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-brand max-w-[72px] truncate hidden md:inline">{user?.name?.split(' ')[0]}</span>
                </Link>
              </>
            ) : (
              <Link to="/login" className="btn-primary text-sm py-2 px-4 hidden sm:inline-flex">Login</Link>
            )}
            <Link to="/profile" className="btn-icon sm:hidden" aria-label="Account">
              <User className="w-5 h-5" />
            </Link>
          </nav>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-brand-100/50 bg-white/98 backdrop-blur-xl animate-slide-up shadow-lg">
          <div className="px-4 py-4 space-y-1 max-h-[70vh] overflow-y-auto">
            {NAV_LINKS.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)} className="block px-4 py-3.5 rounded-xl text-gray-700 font-medium hover:bg-brand-50 hover:text-brand transition-colors">
                {l.label}
              </Link>
            ))}
            <Link to="/wishlist" onClick={() => setMobileOpen(false)} className="block px-4 py-3.5 rounded-xl text-gray-700 font-medium hover:bg-brand-50 hover:text-brand transition-colors">Wishlist</Link>
            <Link to="/gift-cards" onClick={() => setMobileOpen(false)} className="block px-4 py-3.5 rounded-xl text-gray-700 font-medium hover:bg-brand-50 hover:text-brand transition-colors">Gift Cards</Link>
            {!isAuthenticated && (
              <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-4 py-3 mt-3 btn-primary text-center">Login / Sign up</Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
