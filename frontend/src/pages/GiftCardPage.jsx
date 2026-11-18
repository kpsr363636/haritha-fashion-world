import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Gift, Sparkles, CreditCard, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { giftCardApi } from '../api/giftCardApi'
import { formatINR, formatDate } from '../utils/formatters'
import { setSEO } from '../utils/seo'
import PageHeader from '../components/ui/PageHeader'
import EmptyState from '../components/common/EmptyState'

const AMOUNTS = [
  { value: '500', label: '₹500', tag: 'Popular' },
  { value: '1000', label: '₹1,000', tag: null },
  { value: '2000', label: '₹2,000', tag: 'Best value' },
  { value: '5000', label: '₹5,000', tag: null }
]

export default function GiftCardPage() {
  const { isAuthenticated } = useAuth()
  const [checkCode, setCheckCode] = useState('')
  const [balance, setBalance] = useState(null)
  const [purchaseAmount, setPurchaseAmount] = useState('500')
  const [purchased, setPurchased] = useState(null)
  const [myCards, setMyCards] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setSEO('Gift Cards', 'Buy or check Haritha Fashion World gift cards')
    if (isAuthenticated) {
      giftCardApi.mine().then((r) => setMyCards(r.data || [])).catch(() => {})
    }
  }, [isAuthenticated])

  const checkBalance = async (e) => {
    e.preventDefault()
    setError('')
    setBalance(null)
    try {
      const res = await giftCardApi.balance(checkCode.trim().toUpperCase())
      setBalance(res.data?.balance)
    } catch {
      setError('Invalid or expired gift card')
    }
  }

  const buyGiftCard = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) return
    setLoading(true)
    setError('')
    try {
      const amount = Number(purchaseAmount)
      await new Promise((res, rej) => {
        if (window.Razorpay) return res()
        const s = document.createElement('script')
        s.src = 'https://checkout.razorpay.com/v1/checkout.js'
        s.onload = res
        s.onerror = rej
        document.head.appendChild(s)
      })

      const { data: rzp } = await giftCardApi.createPayment?.(amount) || { data: { razorpayOrderId: `order_dev_gc_${Date.now()}` } }

      if (rzp?.razorpayOrderId?.startsWith('order_dev_')) {
        const res = await giftCardApi.purchase(amount)
        setPurchased(res.data)
      } else {
        await new Promise((resolve, reject) => {
          const rzpObj = new window.Razorpay({
            key: rzp.keyId,
            amount: amount * 100,
            currency: 'INR',
            order_id: rzp.razorpayOrderId,
            name: 'Haritha Fashion World',
            description: `Gift Card ₹${amount}`,
            handler: async () => {
              const res = await giftCardApi.purchase(amount)
              setPurchased(res.data)
              resolve()
            },
            modal: { ondismiss: () => reject(new Error('Payment cancelled')) }
          })
          rzpObj.open()
        })
      }

      const mine = await giftCardApi.mine()
      setMyCards(mine.data || [])
    } catch (err) {
      if (err?.message !== 'Payment cancelled') setError(err?.message || 'Could not purchase gift card')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-shell max-w-5xl">
      <PageHeader
        eyebrow="Perfect for every occasion"
        title="Gift Cards"
        subtitle="Send style — redeem on sarees, jewellery, beauty & more"
      />

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-8">
          {isAuthenticated && myCards.length > 0 && (
            <section>
              <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-brand" />
                My gift cards
              </h2>
              <div className="space-y-3">
                {myCards.map((c) => (
                  <div key={c.id} className="surface-card p-5 flex justify-between items-center hover:shadow-card transition-shadow">
                    <div>
                      <p className="font-mono font-bold text-lg tracking-wide">{c.code}</p>
                      <p className="text-sm text-gray-500 mt-1">{formatDate(c.createdAt)}</p>
                    </div>
                    <p className="font-display text-2xl font-semibold text-brand">{formatINR(c.remainingAmount)}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="surface-card p-6 md:p-8 shadow-card">
            <div className="flex items-center gap-2 mb-6">
              <Gift className="w-5 h-5 text-brand" />
              <h2 className="font-display text-xl font-semibold">Check balance</h2>
            </div>
            <form onSubmit={checkBalance} className="flex flex-col sm:flex-row gap-3">
              <input
                className="input-field flex-1 font-mono uppercase"
                placeholder="Enter gift card code"
                value={checkCode}
                onChange={(e) => setCheckCode(e.target.value)}
                required
              />
              <button type="submit" className="btn-primary px-8">Check</button>
            </form>
            {balance != null && (
              <div className="mt-6 p-4 rounded-xl bg-brand-50 border border-brand-100 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-brand shrink-0" />
                <p className="text-lg">Available balance: <span className="font-bold text-brand">{formatINR(balance)}</span></p>
              </div>
            )}
            <p className="text-sm text-gray-500 mt-4">
              Try demo code <code className="bg-cream-100 px-2 py-0.5 rounded font-mono text-brand">HFDEMO500</code> — ₹500 balance
            </p>
          </section>

          <section className="surface-card p-6 md:p-8 shadow-card">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-gold" />
              <h2 className="font-display text-xl font-semibold">Buy a gift card</h2>
            </div>
            {!isAuthenticated ? (
              <EmptyState icon="🎁" title="Login to purchase" message="Create an account or sign in to buy gift cards for friends and family." actionLabel="Login" actionTo="/login" />
            ) : (
              <form onSubmit={buyGiftCard} className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {AMOUNTS.map(({ value, label, tag }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setPurchaseAmount(value)}
                      className={`relative rounded-xl border-2 p-4 text-center transition-all ${
                        purchaseAmount === value
                          ? 'border-brand bg-brand-50 shadow-sm'
                          : 'border-gray-200 hover:border-brand-200 bg-white'
                      }`}
                    >
                      {tag && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-wider bg-gold text-white px-2 py-0.5 rounded-full font-medium">
                          {tag}
                        </span>
                      )}
                      <span className="font-display text-lg font-semibold">{label}</span>
                    </button>
                  ))}
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base">
                  {loading ? 'Processing…' : `Purchase ${formatINR(Number(purchaseAmount))} Gift Card`}
                </button>
              </form>
            )}
            {purchased && (
              <div className="mt-6 p-5 rounded-xl bg-emerald-50 border border-emerald-200">
                <p className="font-semibold text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Gift card created!
                </p>
                <p className="text-sm mt-2 text-emerald-700">Code: <span className="font-mono font-bold text-base">{purchased.code}</span></p>
                <p className="text-sm text-emerald-700">Amount: {formatINR(purchased.initialAmount || purchased.remainingAmount)}</p>
              </div>
            )}
          </section>

          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        <aside className="lg:col-span-2 space-y-6">
          <div className="offer-card bg-gradient-to-br from-brand via-brand-700 to-brand-950 text-white">
            <p className="eyebrow text-white/70 mb-2">Why gift cards?</p>
            <p className="font-display text-2xl font-semibold leading-tight">Let them choose their perfect look</p>
            <p className="text-sm text-white/80 mt-3 leading-relaxed">Valid on all categories — never expires. Instant digital delivery.</p>
          </div>
          <div className="surface-card p-6 space-y-4 text-sm text-gray-600">
            <p className="font-semibold text-gray-900">How it works</p>
            <ol className="space-y-3 list-decimal list-inside">
              <li>Purchase a gift card amount</li>
              <li>Share the unique code with someone special</li>
              <li>Apply at checkout — balance carries forward</li>
            </ol>
          </div>
        </aside>
      </div>
    </div>
  )
}
