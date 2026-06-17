import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../api/authApi'
import { trackEvent } from '../utils/analytics'
import AuthLayout from '../components/common/AuthLayout'
import OtpInput from '../components/common/OtpInput'
import { Smartphone, Mail } from 'lucide-react'

export default function RegisterPage() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const [tab, setTab] = useState('otp') // 'otp' | 'email'

  // OTP tab state
  const [mobile, setMobile] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [countdown, setCountdown] = useState(0)
  const timerRef = useRef(null)

  // Email tab state
  const [form, setForm] = useState({
    name: '', email: '', mobile: '', password: '', confirmPassword: '',
    referralCode: params.get('ref') || ''
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    return () => clearInterval(timerRef.current)
  }, [])

  useEffect(() => {
    if (otp.length === 6 && otpSent) handleVerifyOtp()
  }, [otp])

  if (isAuthenticated) {
    return (
      <div className="page-shell flex justify-center py-20">
        <div className="empty-state"><Link to="/" className="btn-primary">Go Home</Link></div>
      </div>
    )
  }

  const startCountdown = () => {
    setCountdown(60)
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(timerRef.current); return 0 }
        return c - 1
      })
    }, 1000)
  }

  const handleSendOtp = async (e) => {
    e?.preventDefault()
    if (mobile.length !== 10) { setError('Enter a valid 10-digit mobile number'); return }
    setLoading(true); setError('')
    try {
      await authApi.sendOtp(mobile)
      setOtpSent(true)
      startCountdown()
    } catch (err) {
      setError(err.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return
    setLoading(true); setError('')
    try {
      const res = await authApi.verifyOtp(mobile, otp)
      login(res.data)
      trackEvent('sign_up', { method: 'otp' })
      navigate(params.get('redirect') || '/')
    } catch (err) {
      setError(err.message || 'Invalid OTP')
      setOtp('')
    } finally {
      setLoading(false)
    }
  }

  const handleEmailRegister = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return }
    if (!/(?=.*[A-Z])(?=.*\d).{8,}/.test(form.password)) {
      setError('Password must be 8+ chars with 1 uppercase and 1 number'); return
    }
    setLoading(true); setError('')
    try {
      const res = await authApi.register(form)
      login(res.data)
      trackEvent('sign_up', { method: 'email' })
      navigate(params.get('redirect') || '/')
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Create Account" subtitle="Join Haritha Fashion World">
      {/* Tab switcher */}
      <div className="flex rounded-xl border border-gray-200 mb-6 overflow-hidden">
        <button
          onClick={() => { setTab('otp'); setError(''); setOtpSent(false); setOtp('') }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
            tab === 'otp' ? 'bg-brand text-white' : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <Smartphone size={15} /> Mobile OTP
        </button>
        <button
          onClick={() => { setTab('email'); setError('') }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
            tab === 'email' ? 'bg-brand text-white' : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <Mail size={15} /> Email & Password
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100 mb-4">
          {error}
        </div>
      )}

      {/* OTP tab */}
      {tab === 'otp' && (
        <div className="space-y-4">
          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Mobile Number</label>
                <div className="flex">
                  <span className="flex items-center px-3 bg-gray-50 border border-r-0 border-gray-300 rounded-l-xl text-sm text-gray-500">+91</span>
                  <input
                    className="input-field rounded-l-none flex-1"
                    type="tel"
                    placeholder="10-digit mobile"
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                </div>
              </div>
              <button type="submit" disabled={loading || mobile.length !== 10} className="btn-primary w-full">
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <div className="space-y-5">
              <p className="text-center text-sm text-gray-600">
                OTP sent to <span className="font-semibold">+91 {mobile}</span>
                <button onClick={() => { setOtpSent(false); setOtp('') }} className="ml-2 text-brand text-xs underline">Change</button>
              </p>
              <OtpInput value={otp} onChange={setOtp} disabled={loading} />
              <button
                onClick={handleVerifyOtp}
                disabled={loading || otp.length !== 6}
                className="btn-primary w-full"
              >
                {loading ? 'Verifying...' : 'Verify & Register'}
              </button>
              <div className="text-center text-sm text-gray-500">
                {countdown > 0 ? (
                  <span>Resend OTP in <span className="font-semibold text-brand">{countdown}s</span></span>
                ) : (
                  <button onClick={handleSendOtp} className="text-brand font-medium">Resend OTP</button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Email tab */}
      {tab === 'email' && (
        <form className="space-y-4" onSubmit={handleEmailRegister}>
          <input className="input-field" placeholder="Full name (min 2 chars)" minLength={2}
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="input-field" type="email" placeholder="Email address"
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <div className="flex">
            <span className="flex items-center px-3 bg-gray-50 border border-r-0 border-gray-300 rounded-l-xl text-sm text-gray-500">+91</span>
            <input className="input-field rounded-l-none flex-1" type="tel" placeholder="10-digit mobile"
              maxLength={10} value={form.mobile}
              onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/\D/g, '') })} required />
          </div>
          <input className="input-field" type="password" placeholder="Password (8+ chars, 1 uppercase, 1 number)"
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <input className="input-field" type="password" placeholder="Confirm password"
            value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required />
          <input className="input-field" placeholder="Referral code (optional)"
            value={form.referralCode} onChange={(e) => setForm({ ...form, referralCode: e.target.value })} />
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>
      )}

      <p className="text-center text-sm text-gray-500 pt-4">
        Already have an account? <Link to="/login" className="text-brand font-medium">Login</Link>
      </p>
    </AuthLayout>
  )
}
