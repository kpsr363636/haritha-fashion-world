import { Package, Truck, CheckCircle2, Clock, XCircle, CreditCard, RefreshCw } from 'lucide-react'

const STEPS = [
  { key: 'PLACED', label: 'Order placed', icon: Clock },
  { key: 'CONFIRMED', label: 'Payment confirmed', icon: CreditCard },
  { key: 'PACKED', label: 'Seller packing', icon: Package },
  { key: 'SHIPPED', label: 'Shipped', icon: Truck },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for delivery', icon: RefreshCw },
  { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle2 }
]

const ORDER = ['PLACED', 'CONFIRMED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED']

export default function OrderTimeline({ status, timestamps = {} }) {
  if (status === 'CANCELLED' || status === 'RETURNED') {
    return (
      <div className="flex items-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
        <XCircle className="w-5 h-5" />
        <span>Order {status === 'RETURNED' ? 'returned' : 'cancelled'}</span>
      </div>
    )
  }

  const currentIdx = ORDER.indexOf(status)

  return (
    <div className="relative">
      {/* Vertical connector line */}
      <div className="absolute left-5 top-6 bottom-6 w-0.5 bg-gray-100 z-0" />

      <div className="space-y-1">
        {STEPS.map((step, i) => {
          const done = currentIdx >= i
          const active = currentIdx === i
          const Icon = step.icon
          const ts = timestamps[step.key]
          return (
            <div key={step.key} className="relative flex items-start gap-4 z-10">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                done
                  ? active
                    ? 'bg-brand border-brand text-white shadow-lg shadow-brand/30 animate-pulse'
                    : 'bg-brand border-brand text-white'
                  : 'bg-white border-gray-200 text-gray-300'
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 pb-5">
                <p className={`text-sm font-semibold ${done ? 'text-gray-900' : 'text-gray-400'}`}>
                  {step.label}
                  {active && <span className="ml-2 text-xs font-medium text-brand bg-brand/10 px-2 py-0.5 rounded-full">Current</span>}
                </p>
                {ts && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(ts).toLocaleString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
