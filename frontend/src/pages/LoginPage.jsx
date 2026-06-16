import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../api/authApi'
import { useAuth } from '../context/AuthContext'
import { trackEvent } from '../utils/analytics'
import AuthLayout from '../components/common/AuthLayout'

export default function LoginPage() {
  const [mode, setMode] = useState('otp')
  const [mobile, setMobile] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSendOtp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await authApi.sendOtp(mobile)
      setOtpSent(true)
    } catch (err) {
      setError(err.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authApi.verifyOtp(mobile, otp)
      login(res.data)
      trackEvent('login', { method: 'otp' })
      navigate('/')
    } catch (err) {
      setError(err.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleEmailLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authApi.login({ email, password })
      login(res.data)
      trackEvent('login', { method: 'email' })
      navigate('/')
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Welcome Back" subtitle="Login to Haritha Fashion World">
      <div className="flex gap-2 mb-6 p-1 bg-cream-100 rounded-xl">
        <button type="button" onClick={() => setMode('otp')} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === 'otp' ? 'bg-white text-brand shadow-sm' : 'text-gray-500'}`}>OTP Login</button>
        <button type="button" onClick={() => setMode('email')} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === 'email' ? 'bg-white text-brand shadow-sm' : 'text-gray-500'}`}>Email Login</button>
      </div>

      {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-4 border border-red-100">{error}</div>}

      {mode === 'otp' ? (
        !otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <input type="tel" placeholder="Mobile number" value={mobile} onChange={(e) => setMobile(e.target.value)} className="input-field" maxLength={10} required />
            <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Sending...' : 'Send OTP'}</button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <p className="text-sm text-gray-500">OTP sent to +91 {mobile}</p>
            <input type="text" placeholder="Enter 6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} className="input-field" maxLength={6} required />
            <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Verifying...' : 'Verify & Login'}</button>
            <button type="button" onClick={() => setOtpSent(false)} className="text-sm text-brand w-full">Change number</button>
          </form>
        )
      ) : (
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" required />
          <div className="text-right">
            <Link to="/forgot-password" className="text-sm text-brand">Forgot password?</Link>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Logging in...' : 'Login'}</button>
        </form>
      )}

      <p className="text-center text-sm text-gray-500 mt-8 pt-6 border-t border-gray-100">
        New here? <Link to="/register" className="text-brand font-medium">Create account</Link>
      </p>
    </AuthLayout>
  )
}
