import { Truck, RotateCcw, ShieldCheck, Sparkles } from 'lucide-react'

const ITEMS = [
  { icon: Truck, label: 'Free delivery', sub: 'On orders ₹499+' },
  { icon: RotateCcw, label: 'Easy returns', sub: '7-day hassle free' },
  { icon: ShieldCheck, label: 'Secure checkout', sub: '100% protected' },
  { icon: Sparkles, label: 'Authentic quality', sub: 'Curated sellers' }
]

export default function TrustStrip({ compact = false }) {
  return (
    <section className={`trust-strip ${compact ? 'py-4' : ''}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className={`grid ${compact ? 'grid-cols-2 md:grid-cols-4 gap-4' : 'grid-cols-2 md:grid-cols-4 gap-6 md:gap-8'}`}>
          {ITEMS.map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-center gap-3 group">
              <div className="trust-icon">
                <Icon className="w-5 h-5 text-brand" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{label}</p>
                {!compact && <p className="text-xs text-gray-500">{sub}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
