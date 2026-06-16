import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, Heart, User, Search, Menu, X, Sparkles } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { searchApi } from '../../api/discoveryApi'

const NAV_LINKS = [
  { to: '/products?category=sarees-ethnic-wear', label: 'Sarees' },
  { to: '/products?category=western-clothing', label: 'Western' },
  { to: '/products?category=fine-jewellery', label: 'Jewellery' },
  { to: '/products?category=beauty-skincare', label: 'Beauty' }
]

export default function Navbar() {
  const { isAuthenticated, user } = useAuth()
  const { itemCount } = useCart()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const debounceRef = useRef(null)
  const wrapperRef = useRef(null)

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
    <header className="sticky top-0 z-50 glass-nav">
      <div className="max-w-7xl mx-auto px-4">
        <div className="h-16 flex items-center justify-between gap-3 md:gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <button type="button" onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden btn-icon -ml-1" aria-label="Menu">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link to="/" className="flex items-center gap-2 group">
              <Sparkles className="w-5 h-5 text-gold hidden sm:block group-hover:rotate-12 transition-transform" />
              <span className="font-display text-2xl md:text-3xl font-semibold text-brand tracking-tight">Haritha</span>
            </Link>
          </div>

          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((l) => (
              <Link key={l.to} to={l.to} className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-brand rounded-lg hover:bg-brand-50/60 transition-all">
                {l.label}
              </Link>
            ))}
          </nav>

          <form onSubmit={handleSearch} className="flex flex-1 max-w-md lg:max-w-lg" ref={wrapperRef}>
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="search"
                placeholder="Search sarees, kurtas, jewellery..."
                className="w-full pl-10 pr-4 py-2.5 bg-white/80 border border-gray-200/80 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand/25 focus:bg-white shadow-sm transition-all"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              />
              {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute top-full left-0 right-0 mt-2 bg-white/98 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-card overflow-hidden z-50 animate-slide-up">
                  {suggestions.map((s) => (
                    <li key={s}>
                      <button type="button" onClick={() => pickSuggestion(s)} className="w-full text-left px-4 py-3 text-sm hover:bg-brand-50 flex items-center gap-2 transition-colors">
                        <Search className="w-3.5 h-3.5 text-gray-400" />
                        {s}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </form>

          <nav className="flex items-center gap-1 sm:gap-2 shrink-0">
            <Link to="/wishlist" className="btn-icon hidden sm:flex" aria-label="Wishlist">
              <Heart className="w-5 h-5" />
            </Link>
            <Link to="/cart" className="btn-icon" aria-label="Cart">
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-br from-brand to-brand-700 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 shadow-sm">
                  {itemCount}
                </span>
              )}
            </Link>
            {isAuthenticated ? (
              <Link to="/profile" className="hidden sm:flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-brand-50 transition-all group">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand to-brand-600 text-white flex items-center justify-center text-sm font-semibold shadow-sm">
                  {(user?.name || 'U').charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-brand max-w-[80px] truncate hidden md:inline">{user?.name?.split(' ')[0]}</span>
              </Link>
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
        <div className="md:hidden border-t border-brand-100/50 bg-white/95 backdrop-blur-xl animate-slide-up">
          <div className="px-4 py-4 space-y-1">
            {NAV_LINKS.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl text-gray-700 font-medium hover:bg-brand-50 hover:text-brand transition-colors">
                {l.label}
              </Link>
            ))}
            <Link to="/wishlist" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl text-gray-700 font-medium hover:bg-brand-50 hover:text-brand transition-colors">Wishlist</Link>
            {!isAuthenticated && (
              <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-4 py-3 mt-2 btn-primary text-center">Login</Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
