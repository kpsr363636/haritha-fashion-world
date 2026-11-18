import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, Copy, Share2, Gift } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { referralApi } from '../api/orderApi'
import { setSEO } from '../utils/seo'
import PageHeader from '../components/ui/PageHeader'
import EmptyState from '../components/common/EmptyState'

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

  const shareLink = info?.link || `${window.location.origin}/register?ref=${user?.referralCode}`

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`Shop at Haritha Fashion World and get great deals! Use my referral link: ${shareLink}`)
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer')
  }

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isAuthenticated) {
    return (
      <div className="page-shell max-w-2xl">
        <EmptyState icon="🤝" title="Login to refer friends" message="Share your unique link and earn 100 loyalty points when friends complete their first order." actionLabel="Login" actionTo="/login" />
      </div>
    )
  }

  return (
    <div className="page-shell max-w-3xl">
      <PageHeader
        eyebrow="Share the love"
        title="Refer & Earn"
        subtitle="Invite friends — earn 100 loyalty points when they complete their first order"
      />

      <div className="section-band-light p-8 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center">
            <Gift className="w-6 h-6 text-brand" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Your referral code</p>
            <p className="font-display text-3xl font-bold text-brand tracking-wide">{info?.referralCode || user?.referralCode}</p>
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-2">Share link</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input readOnly value={shareLink} className="input-field flex-1 text-sm bg-white/80" />
          <button type="button" onClick={copyLink} className="btn-primary flex items-center justify-center gap-2 whitespace-nowrap">
            <Copy className="w-4 h-4" />
            {copied ? 'Copied!' : 'Copy link'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total referrals', value: info?.totalReferrals ?? 0, color: 'text-gray-900' },
          { label: 'Credited', value: info?.credited ?? 0, color: 'text-emerald-600' },
          { label: 'Pending', value: info?.pending ?? 0, color: 'text-amber-600' }
        ].map(({ label, value, color }) => (
          <div key={label} className="stat-card text-center">
            <p className={`text-3xl font-bold relative z-10 ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-1 relative z-10">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button type="button" onClick={shareWhatsApp} className="btn-primary flex-1 flex items-center justify-center gap-2 py-3">
          <Share2 className="w-4 h-4" />
          Invite via WhatsApp
        </button>
        <Link to="/profile" className="btn-outline flex-1 text-center py-3 flex items-center justify-center gap-2">
          <Users className="w-4 h-4" />
          My account
        </Link>
      </div>
    </div>
  )
}
