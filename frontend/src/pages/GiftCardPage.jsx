import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { giftCardApi } from '../api/giftCardApi'
import { formatINR, formatDate } from '../utils/formatters'
import { setSEO } from '../utils/seo'

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
      const res = await giftCardApi.purchase(Number(purchaseAmount))
      setPurchased(res.data)
      const mine = await giftCardApi.mine()
      setMyCards(mine.data || [])
    } catch {
      setError('Could not purchase gift card')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Gift Cards</h1>

      {isAuthenticated && myCards.length > 0 && (
        <section className="border rounded-xl p-6 mb-8">
          <h2 className="font-semibold mb-4">My gift cards</h2>
          <div className="space-y-3">
            {myCards.map((c) => (
              <div key={c.id} className="flex justify-between items-center border rounded-lg p-3 text-sm">
                <div>
                  <p className="font-mono font-bold">{c.code}</p>
                  <p className="text-gray-500">{formatDate(c.createdAt)}</p>
                </div>
                <p className="font-semibold text-brand">{formatINR(c.remainingAmount)}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="border rounded-xl p-6 mb-8">
        <h2 className="font-semibold mb-4">Check balance</h2>
        <form onSubmit={checkBalance} className="flex gap-2">
          <input
            className="input-field flex-1"
            placeholder="Enter gift card code"
            value={checkCode}
            onChange={(e) => setCheckCode(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary">Check</button>
        </form>
        {balance != null && (
          <p className="mt-4 text-lg">Balance: <span className="font-bold text-brand">{formatINR(balance)}</span></p>
        )}
        <p className="text-sm text-gray-500 mt-2">Demo code: <code className="bg-gray-100 px-1 rounded">HFDEMO500</code> (₹500)</p>
      </section>

      <section className="border rounded-xl p-6">
        <h2 className="font-semibold mb-4">Buy a gift card</h2>
        {!isAuthenticated ? (
          <p className="text-gray-500"><Link to="/login" className="text-brand">Login</Link> to purchase gift cards.</p>
        ) : (
          <form onSubmit={buyGiftCard} className="space-y-4">
            <select className="input-field" value={purchaseAmount} onChange={(e) => setPurchaseAmount(e.target.value)}>
              <option value="500">₹500</option>
              <option value="1000">₹1,000</option>
              <option value="2000">₹2,000</option>
              <option value="5000">₹5,000</option>
            </select>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Processing...' : 'Purchase Gift Card'}
            </button>
          </form>
        )}
        {purchased && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <p className="font-semibold text-green-800">Gift card created!</p>
            <p className="text-sm mt-1">Code: <span className="font-mono font-bold">{purchased.code}</span></p>
            <p className="text-sm">Amount: {formatINR(purchased.initialAmount || purchased.remainingAmount)}</p>
          </div>
        )}
      </section>

      {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
    </div>
  )
}
