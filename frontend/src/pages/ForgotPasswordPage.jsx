import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authApi } from '../api/authApi'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await authApi.forgotPassword(email)
      setSent(true)
    } catch (err) {
      setError(err.message || 'Request failed')
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-2">Forgot Password</h1>
        {sent ? (
          <p className="text-center text-gray-600">If an account exists for that email, reset instructions were sent.</p>
        ) : (
          <form onSubmit={submit} className="space-y-4 mt-6">
            {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>}
            <input type="email" className="input-field" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <button type="submit" className="btn-primary w-full">Send Reset Link</button>
          </form>
        )}
        <p className="text-center text-sm mt-6"><Link to="/login" className="text-brand">Back to login</Link></p>
      </div>
    </div>
  )
}
