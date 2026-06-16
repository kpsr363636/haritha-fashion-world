import { Link } from 'react-router-dom'
import { Instagram, Mail, Sparkles } from 'lucide-react'

const SHOP_LINKS = [
  { to: '/products?category=sarees-ethnic-wear', label: 'Sarees & Ethnic' },
  { to: '/products?category=western-clothing', label: 'Western' },
  { to: '/products?category=fine-jewellery', label: 'Jewellery' },
  { to: '/products?category=beauty-skincare', label: 'Beauty' }
]

const SUPPORT_LINKS = [
  { to: '/support', label: 'Contact Us' },
  { to: '/legal/return-policy', label: 'Returns' },
  { to: '/legal/shipping-policy', label: 'Shipping' },
  { to: '/size-guide', label: 'Size Guide' }
]

const LEGAL_LINKS = [
  { to: '/legal/privacy-policy', label: 'Privacy Policy' },
  { to: '/legal/terms-and-conditions', label: 'Terms' },
  { to: '/seller/dashboard', label: 'Sell on Haritha' }
]

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-gray-900 via-gray-950 to-black text-gray-300 mt-auto relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(181,71,106,0.15),transparent_60%)] pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 py-14 md:py-16 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-gold" />
              <h3 className="font-display text-white text-2xl font-semibold">Haritha Fashion</h3>
            </div>
            <p className="text-sm leading-relaxed text-gray-400 mb-6 max-w-sm">
              India's favourite destination for women's fashion — sarees, ethnic wear, western clothing, fine jewellery & beauty. Curated with love.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-brand/20 flex items-center justify-center transition-colors" aria-label="Instagram">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="mailto:support@harithafashion.com" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-brand/20 flex items-center justify-center transition-colors" aria-label="Email">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Shop</h4>
            <ul className="space-y-2.5 text-sm">
              {SHOP_LINKS.map((l) => (
                <li key={l.to}><Link to={l.to} className="text-gray-400 hover:text-white hover:translate-x-0.5 inline-block transition-all">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Support</h4>
            <ul className="space-y-2.5 text-sm">
              {SUPPORT_LINKS.map((l) => (
                <li key={l.to}><Link to={l.to} className="text-gray-400 hover:text-white hover:translate-x-0.5 inline-block transition-all">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4">
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Stay in the loop</h4>
            <p className="text-sm text-gray-400 mb-4">Get exclusive offers, new arrivals & style tips.</p>
            <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
              <input type="email" placeholder="Your email" className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand/40" />
              <button type="submit" className="btn-primary py-2.5 px-5 text-sm shrink-0">Subscribe</button>
            </form>
            <div className="mt-6 flex flex-wrap gap-2">
              {['UPI', 'Cards', 'Net Banking', 'COD'].map((m) => (
                <span key={m} className="px-3 py-1 rounded-lg bg-white/5 text-xs text-gray-400 border border-white/5">{m}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Haritha Fashion World. All rights reserved.</p>
          <div className="flex gap-4">
            {LEGAL_LINKS.map((l) => (
              <Link key={l.to} to={l.to} className="hover:text-gray-300 transition-colors">{l.label}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
