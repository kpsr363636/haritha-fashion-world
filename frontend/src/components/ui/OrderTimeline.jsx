import { Package, Truck, CheckCircle2, Clock, XCircle } from 'lucide-react'

const STEPS = [
  { key: 'PLACED', label: 'Order placed', icon: Clock },
  { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle2 },
  { key: 'SHIPPED', label: 'Shipped', icon: Package },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for delivery', icon: Truck },
  { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle2 }
]

const ORDER = ['PLACED', 'CONFIRMED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED']

export default function OrderTimeline({ status }) {
  if (status === 'CANCELLED') {
    return (
      <div className="timeline-cancelled">
        <XCircle className="w-5 h-5" />
        <span>Order cancelled</span>
      </div>
    )
  }

  const currentIdx = ORDER.indexOf(status)

  return (
    <div className="order-timeline">
      {STEPS.map((step, i) => {
        const done = currentIdx >= i
        const active = currentIdx === i
        const Icon = step.icon
        return (
          <div key={step.key} className={`timeline-step ${done ? 'timeline-done' : ''} ${active ? 'timeline-active' : ''}`}>
            <div className="timeline-icon">
              <Icon className="w-4 h-4" />
            </div>
            <span className="timeline-label">{step.label}</span>
          </div>
        )
      })}
    </div>
  )
}
