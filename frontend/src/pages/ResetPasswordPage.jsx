import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { authApi } from '../api/authApi'

export default function ResetPasswordPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    try {
      await authApi.resetPassword({ token: params.get('token'), password })
      navigate('/login')
    } catch (err) {
      setError(err.message || 'Reset failed')
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Reset Password</h1>
        <form onSubmit={submit} className="space-y-4">
          {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>}
          <input type="password" className="input-field" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <input type="password" className="input-field" placeholder="Confirm password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          <button type="submit" className="btn-primary w-full">Update Password</button>
        </form>
        <p className="text-center text-sm mt-6"><Link to="/login" className="text-brand">Login</Link></p>
      </div>
    </div>
  )
}
