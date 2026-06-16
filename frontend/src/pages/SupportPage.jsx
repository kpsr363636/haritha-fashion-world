import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supportApi } from '../api/supportApi'
import { setSEO } from '../utils/seo'

export default function SupportPage() {
  const { isAuthenticated } = useAuth()
  const [tickets, setTickets] = useState([])
  const [form, setForm] = useState({ category: 'Order Issue', subject: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    setSEO('Customer Support', 'Get help with orders, payments, and returns')
    if (isAuthenticated) {
      supportApi.listTickets().then((r) => setTickets(r.data?.content || r.data || [])).catch(() => {})
    }
  }, [isAuthenticated])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) return
    setSubmitting(true)
    try {
      await supportApi.createTicket(form)
      setSubmitted(true)
      setForm({ category: 'Order Issue', subject: '', message: '' })
      const r = await supportApi.listTickets()
      setTickets(r.data?.content || r.data || [])
    } catch {
      alert('Could not submit ticket')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Customer Support</h1>

      {!isAuthenticated ? (
        <p className="text-gray-500 mb-6"><Link to="/login" className="text-brand">Login</Link> to submit a support ticket.</p>
      ) : (
        <>
          {submitted && (
            <div className="mb-4 p-3 bg-green-50 text-green-800 rounded-lg text-sm">
              Ticket submitted successfully. We will respond within 24 hours.
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4 border rounded-xl p-6 mb-8">
            <select
              className="input-field"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option>Order Issue</option>
              <option>Payment</option>
              <option>Returns</option>
              <option>Other</option>
            </select>
            <input
              className="input-field"
              placeholder="Subject"
              required
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            />
            <textarea
              className="input-field h-32"
              placeholder="Describe your issue..."
              required
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Submitting...' : 'Submit Ticket'}
            </button>
          </form>

          {tickets.length > 0 && (
            <div>
              <h2 className="font-semibold mb-3">Your tickets</h2>
              <div className="space-y-3">
                {tickets.map((t) => (
                  <div key={t.id} className="border rounded-lg p-4">
                    <div className="flex justify-between">
                      <p className="font-medium">{t.subject}</p>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100">{t.status}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{t.category}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
