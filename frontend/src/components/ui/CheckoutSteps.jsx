import { Check } from 'lucide-react'

export default function CheckoutSteps({ current = 1 }) {
  const steps = [
    { num: 1, label: 'Cart' },
    { num: 2, label: 'Address' },
    { num: 3, label: 'Payment' },
    { num: 4, label: 'Confirm' }
  ]

  return (
    <div className="checkout-steps mb-8 md:mb-10">
      {steps.map((step, i) => (
        <div key={step.num} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1.5">
            <div className={`step-dot ${current > step.num ? 'step-done' : current === step.num ? 'step-active' : 'step-pending'}`}>
              {current > step.num ? <Check className="w-4 h-4" /> : step.num}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${current >= step.num ? 'text-brand' : 'text-gray-400'}`}>
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`step-line flex-1 mx-2 sm:mx-4 ${current > step.num ? 'step-line-done' : ''}`} />
          )}
        </div>
      ))}
    </div>
  )
}
