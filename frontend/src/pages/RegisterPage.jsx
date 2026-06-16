import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../api/authApi'
import { trackEvent } from '../utils/analytics'
import AuthLayout from '../components/common/AuthLayout'

export default function RegisterPage() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [form, setForm] = useState({ name: '', email: '', mobile: '', password: '', referralCode: params.get('ref') || '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    return (
      <div className="page-shell flex justify-center py-20">
        <div className="empty-state"><Link to="/" className="btn-primary">Go Home</Link></div>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await authApi.register(form)
      login(res.data)
      trackEvent('sign_up', { method: 'email' })
      navigate('/')
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Create Account" subtitle="Join Haritha Fashion World">
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100">{error}</div>}
        <input className="input-field" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input className="input-field" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input className="input-field" type="tel" placeholder="Mobile (10 digits)" maxLength={10} value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} required />
        <input className="input-field" type="password" placeholder="Password (min 8 chars)" minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <input className="input-field" placeholder="Referral code (optional)" value={form.referralCode} onChange={(e) => setForm({ ...form, referralCode: e.target.value })} />
        <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Creating...' : 'Register'}</button>
        <p className="text-center text-sm text-gray-500 pt-2">Already have an account? <Link to="/login" className="text-brand font-medium">Login</Link></p>
      </form>
    </AuthLayout>
  )
}
