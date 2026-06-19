import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { authApi } from '../api/authApi'
import { useAuth } from '../context/AuthContext'
import { trackEvent } from '../utils/analytics'
import AuthLayout from '../components/common/AuthLayout'

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

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
  const location = useLocation()
  const googleBtnRef = useRef(null)

  const redirectAfterLogin = (authData, method) => {
    login(authData)
    trackEvent('login', { method })
    const from = location.state?.from
    if (from) {
      navigate(from)
      return
    }
    const role = authData.user?.role
    if (role === 'ADMIN') navigate('/admin/dashboard')
    else if (role === 'SELLER') navigate('/seller/dashboard')
    else navigate('/')
  }

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!clientId || !googleBtnRef.current) return

    const initGoogle = () => {
      if (!window.google?.accounts?.id || !googleBtnRef.current) return
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          setLoading(true)
          setError('')
          try {
            const res = await authApi.googleLogin(response.credential)
            redirectAfterLogin(res.data, 'google')
          } catch (err) {
            setError(err.message || 'Google login failed')
          } finally {
            setLoading(false)
          }
        },
      })
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: 'outline',
        size: 'large',
        width: googleBtnRef.current.offsetWidth || 360,
        text: 'continue_with',
      })
    }

    if (window.google?.accounts?.id) {
      initGoogle()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = initGoogle
    document.body.appendChild(script)
  }, [login, navigate, location.state?.from])

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
      redirectAfterLogin(res.data, 'otp')
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
      redirectAfterLogin(res.data, 'email')
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

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
        <div className="relative flex justify-center"><span className="px-4 bg-white text-xs text-gray-400">or continue with</span></div>
      </div>

      {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
        <>
          <div ref={googleBtnRef} className="w-full flex justify-center" />
          {import.meta.env.DEV && (
            <p className="mt-3 text-xs text-gray-400 text-center leading-relaxed">
              Google origin to register:{' '}
              <code className="text-gray-600">{window.location.origin}</code>
              <br />
              Open this page in Chrome/Safari (not an IDE preview). Client ID must be type{' '}
              <strong>Web application</strong>.
            </p>
          )}
        </>
      ) : (
        <button
          type="button"
          disabled
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-400"
        >
          <GoogleIcon />
          Google login not configured
        </button>
      )}

      <p className="text-center text-sm text-gray-500 mt-8 pt-6 border-t border-gray-100">
        New here? <Link to="/register" className="text-brand font-medium">Create account</Link>
      </p>
    </AuthLayout>
  )
}
