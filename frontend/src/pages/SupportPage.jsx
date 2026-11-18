import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Headphones, MessageCircle, Mail, Clock, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supportApi } from '../api/supportApi'
import { setSEO } from '../utils/seo'
import PageHeader from '../components/ui/PageHeader'
import EmptyState from '../components/common/EmptyState'

const FAQ = [
  { q: 'How long does delivery take?', a: 'Most orders arrive in 3–5 business days across India.' },
  { q: 'Can I return an item?', a: 'Yes — 7-day easy returns on most products. Visit Returns from your profile.' },
  { q: 'Is COD available?', a: 'Cash on Delivery is available on eligible products at checkout.' }
]

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
    <div className="page-shell max-w-5xl">
      <PageHeader
        eyebrow="We're here to help"
        title="Customer Support"
        subtitle="Track tickets, get answers, or reach our team — we respond within 24 hours"
      />

      <div className="grid md:grid-cols-3 gap-4 mb-10">
        {[
          { icon: Clock, label: 'Response time', value: 'Under 24 hrs' },
          { icon: MessageCircle, label: 'Live chat', value: 'Coming soon' },
          { icon: Mail, label: 'Email', value: 'support@harithafashion.com' }
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="surface-card p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 text-brand" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
              <p className="font-semibold text-gray-900 text-sm mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          {!isAuthenticated ? (
            <EmptyState icon="🔐" title="Login to submit a ticket" message="Sign in to create support tickets and track responses." actionLabel="Login" actionTo="/login" />
          ) : (
            <>
              {submitted && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  Ticket submitted successfully. We will respond within 24 hours.
                </div>
              )}
              <form onSubmit={handleSubmit} className="surface-card p-6 md:p-8 space-y-4 shadow-card">
                <div className="flex items-center gap-2 mb-2">
                  <Headphones className="w-5 h-5 text-brand" />
                  <h2 className="font-display text-xl font-semibold">Submit a ticket</h2>
                </div>
                <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  <option>Order Issue</option>
                  <option>Payment</option>
                  <option>Returns</option>
                  <option>Product Quality</option>
                  <option>Other</option>
                </select>
                <input className="input-field" placeholder="Subject" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
                <textarea className="input-field min-h-[140px]" placeholder="Describe your issue in detail..." required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                <button type="submit" disabled={submitting} className="btn-primary w-full py-3">
                  {submitting ? 'Submitting…' : 'Submit Ticket'}
                </button>
              </form>

              {tickets.length > 0 && (
                <div className="mt-8">
                  <h2 className="font-display text-xl font-semibold mb-4">Your tickets</h2>
                  <div className="space-y-3">
                    {tickets.map((t) => (
                      <div key={t.id} className="surface-card p-5 hover:shadow-card transition-shadow">
                        <div className="flex justify-between items-start gap-3">
                          <div>
                            <p className="font-semibold text-gray-900">{t.subject}</p>
                            <p className="text-sm text-gray-500 mt-1">{t.category}</p>
                          </div>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${t.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{t.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="surface-card p-6">
            <h2 className="font-display text-lg font-semibold mb-4">FAQs</h2>
            <div className="space-y-4">
              {FAQ.map(({ q, a }) => (
                <div key={q} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <p className="font-medium text-sm text-gray-900">{q}</p>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="section-band-light p-6">
            <p className="eyebrow mb-2">Quick links</p>
            <div className="space-y-2 text-sm">
              <Link to="/orders" className="block text-brand hover:underline">Track my order →</Link>
              <Link to="/returns" className="block text-brand hover:underline">Start a return →</Link>
              <Link to="/legal/return-policy" className="block text-brand hover:underline">Return policy →</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
