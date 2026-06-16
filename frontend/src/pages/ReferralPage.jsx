import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { referralApi } from '../api/orderApi'
import { setSEO } from '../utils/seo'

export default function ReferralPage() {
  const { isAuthenticated, user } = useAuth()
  const [info, setInfo] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setSEO('Refer & Earn', 'Invite friends and earn loyalty points at Haritha Fashion World')
    if (isAuthenticated) {
      referralApi.myCode().then((r) => setInfo(r.data)).catch(() => {})
    }
  }, [isAuthenticated])

  const shareWhatsApp = () => {
    const link = info?.link || `${window.location.origin}/register?ref=${user?.referralCode}`
    const text = encodeURIComponent(`Shop at Haritha Fashion World and get great deals! Use my referral link: ${link}`)
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer')
  }

  const copyLink = () => {
    const link = info?.link || `${window.location.origin}/register?ref=${user?.referralCode}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-4">Login to view your referral link</p>
        <Link to="/login" className="btn-primary">Login</Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Refer & Earn</h1>
      <p className="text-gray-600 mb-8">Share your link. When friends complete their first order, you earn 100 loyalty points.</p>

      <div className="border rounded-xl p-6 space-y-4 bg-brand-50/30">
        <div>
          <p className="text-sm text-gray-500">Your referral code</p>
          <p className="text-2xl font-bold text-brand">{info?.referralCode || user?.referralCode}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-2">Share link</p>
          <div className="flex gap-2">
            <input readOnly value={info?.link || `${window.location.origin}/register?ref=${user?.referralCode || ''}`} className="input-field flex-1 text-sm" />
            <button type="button" onClick={copyLink} className="btn-primary whitespace-nowrap">
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold">{info?.totalReferrals ?? 0}</p>
            <p className="text-xs text-gray-500">Total referrals</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{info?.credited ?? 0}</p>
            <p className="text-xs text-gray-500">Credited</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-600">{info?.pending ?? 0}</p>
            <p className="text-xs text-gray-500">Pending</p>
          </div>
        </div>
      </div>

      <button type="button" onClick={shareWhatsApp} className="btn-outline mt-6">
        Invite via WhatsApp
      </button>
    </div>
  )
}
