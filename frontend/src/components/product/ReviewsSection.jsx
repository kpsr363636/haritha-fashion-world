import { useEffect, useState } from 'react'
import { reviewApi } from '../../api/reviewApi'
import { useAuth } from '../../context/AuthContext'

export default function ReviewsSection({ productId }) {
  const { isAuthenticated } = useAuth()
  const [reviews, setReviews] = useState([])
  const [breakdown, setBreakdown] = useState({})
  const [form, setForm] = useState({ rating: 5, title: '', comment: '' })
  const [msg, setMsg] = useState('')

  const load = () => {
    reviewApi.list(productId).then((r) => setReviews(r.data?.content || [])).catch(() => {})
    reviewApi.breakdown(productId).then((r) => setBreakdown(r.data || {})).catch(() => {})
  }

  useEffect(() => { load() }, [productId])

  const submit = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) return
    try {
      await reviewApi.create({ productId, ...form })
      setForm({ rating: 5, title: '', comment: '' })
      setMsg('Review submitted for approval')
      load()
    } catch (err) {
      setMsg(err.message || 'Could not submit review')
    }
  }

  return (
    <section className="mt-12 border-t pt-8">
      <h2 className="text-xl font-bold mb-4">Customer Reviews</h2>
      {Object.keys(breakdown).length > 0 && (
        <div className="flex flex-wrap gap-3 mb-6 text-sm">
          {Object.entries(breakdown).map(([star, count]) => (
            <span key={star} className="px-3 py-1 bg-gray-100 rounded-full">{star}★ · {count}</span>
          ))}
        </div>
      )}
      {isAuthenticated && (
        <form onSubmit={submit} className="border rounded-xl p-4 mb-6 space-y-3">
          <p className="font-medium text-sm">Write a review</p>
          <select className="input-field" value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}>
            {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} stars</option>)}
          </select>
          <input className="input-field" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <textarea className="input-field" rows={3} placeholder="Your experience" value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} required />
          {msg && <p className="text-sm text-brand">{msg}</p>}
          <button type="submit" className="btn-primary">Submit Review</button>
        </form>
      )}
      <div className="space-y-4">
        {reviews.length === 0 ? <p className="text-gray-500 text-sm">No reviews yet.</p> : reviews.map((r) => (
          <div key={r.id} className="border rounded-lg p-4">
            <div className="flex justify-between">
              <p className="font-medium">{r.title || 'Review'}</p>
              <span className="text-sm">{'★'.repeat(r.rating)}</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">{r.body || r.comment}</p>
            {r.sellerReply && <p className="text-sm mt-2 p-2 bg-brand-50 rounded">Seller: {r.sellerReply}</p>}
          </div>
        ))}
      </div>
    </section>
  )
}
