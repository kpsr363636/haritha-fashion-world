import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { addressApi } from '../api/orderApi'
import { authApi } from '../api/authApi'
import { userApi, loyaltyApi } from '../api/userApi'
import { formatDate } from '../utils/formatters'
import { setSEO } from '../utils/seo'

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth()
  const [tab, setTab] = useState('info')
  const [addresses, setAddresses] = useState([])
  const [form, setForm] = useState({ label: 'Home', fullName: '', mobile: '', addressLine: '', city: '', state: '', pincode: '' })
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [pwdMsg, setPwdMsg] = useState('')
  const [loyalty, setLoyalty] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [prefs, setPrefs] = useState(null)

  useEffect(() => {
    setSEO('My Account', 'Manage your Haritha Fashion World profile')
    if (isAuthenticated) {
      addressApi.list().then((r) => setAddresses(r.data || [])).catch(() => {})
      loyaltyApi.summary().then((r) => setLoyalty(r.data)).catch(() => {})
      loyaltyApi.transactions().then((r) => setTransactions(r.data?.content || [])).catch(() => {})
      userApi.getNotificationPreferences().then((r) => setPrefs(r.data)).catch(() => {})
    }
  }, [isAuthenticated])

  const saveAddress = async (e) => {
    e.preventDefault()
    try {
      await addressApi.create(form)
      const r = await addressApi.list()
      setAddresses(r.data || [])
      setForm({ label: 'Home', fullName: '', mobile: '', addressLine: '', city: '', state: '', pincode: '' })
    } catch {
      alert('Could not save address')
    }
  }

  const removeAddress = async (id) => {
    await addressApi.delete(id)
    setAddresses((prev) => prev.filter((a) => a.id !== id))
  }

  const setDefault = async (id) => {
    await addressApi.setDefault(id)
    const r = await addressApi.list()
    setAddresses(r.data || [])
  }

  const changePassword = async (e) => {
    e.preventDefault()
    setPwdMsg('')
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setPwdMsg('Passwords do not match')
      return
    }
    try {
      await authApi.changePassword({ currentPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword })
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setPwdMsg('Password updated successfully')
    } catch (err) {
      setPwdMsg(err.message || 'Could not update password')
    }
  }

  const togglePref = async (key) => {
    const next = { ...prefs, [key]: !prefs[key] }
    setPrefs(next)
    try {
      await userApi.updateNotificationPreferences(next)
    } catch {
      setPrefs(prefs)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="page-shell py-12">
        <div className="empty-state">
          <Link to="/login" className="btn-primary">Login</Link>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'info', label: 'Personal Info' },
    { id: 'addresses', label: 'Addresses' },
    { id: 'security', label: 'Security' },
    { id: 'loyalty', label: 'Loyalty' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'links', label: 'Quick Links' }
  ]

  const prefFields = [
    { key: 'orderUpdatesEmail', label: 'Order updates (Email)' },
    { key: 'orderUpdatesSms', label: 'Order updates (SMS)' },
    { key: 'orderUpdatesWhatsapp', label: 'Order updates (WhatsApp)' },
    { key: 'saleAlertsEmail', label: 'Sale alerts (Email)' },
    { key: 'newArrivalsEmail', label: 'New arrivals (Email)' },
    { key: 'priceDropEmail', label: 'Price drop alerts' },
    { key: 'backInStockEmail', label: 'Back in stock alerts' }
  ]

  return (
    <div className="page-shell max-w-5xl">
      <div className="surface-card p-6 md:p-8 mb-8 bg-gradient-to-br from-white via-brand-50/20 to-gold-light/10">
        <div className="flex items-center gap-5">
          <div className="profile-avatar">
            {(user?.name || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="eyebrow mb-1">Account</p>
            <h1 className="font-display text-3xl font-semibold">{user?.name}</h1>
            <p className="text-gray-500 text-sm mt-1">{user?.email} · +91 {user?.mobile}</p>
            {loyalty && (
              <div className="flex gap-2 mt-3">
                <span className="badge badge-info">{loyalty?.tier || user?.loyaltyTier}</span>
                <span className="badge badge-muted">{loyalty?.points ?? user?.loyaltyPoints} points</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="grid md:grid-cols-4 gap-6 md:gap-8">
      <aside className="surface-card p-3 space-y-1 h-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={tab === t.id ? 'tab-pill-active block w-full text-left' : 'tab-pill-inactive block w-full text-left'}
          >
            {t.label}
          </button>
        ))}
        <button type="button" onClick={logout} className="tab-pill-inactive block w-full text-left text-red-500 border-red-100 hover:bg-red-50 mt-4">
          Logout
        </button>
      </aside>

      <div className="md:col-span-3 surface-card p-6 md:p-8">
        {tab === 'info' && (
          <>
            <h2 className="font-display text-2xl font-semibold mb-4">Personal Information</h2>
            <dl className="space-y-3 text-sm">
              <div><dt className="text-gray-500">Name</dt><dd className="font-medium">{user?.name || '—'}</dd></div>
              <div><dt className="text-gray-500">Email</dt><dd className="font-medium">{user?.email || '—'}</dd></div>
              <div><dt className="text-gray-500">Mobile</dt><dd className="font-medium">+91 {user?.mobile}</dd></div>
              <div><dt className="text-gray-500">Loyalty Tier</dt><dd className="font-medium">{loyalty?.tier || user?.loyaltyTier} · {loyalty?.points ?? user?.loyaltyPoints} points</dd></div>
              <div><dt className="text-gray-500">Referral Code</dt><dd className="font-medium text-brand">{user?.referralCode}</dd></div>
            </dl>
            <Link to="/referral" className="btn-outline mt-6 inline-block">Refer & Earn</Link>
          </>
        )}

        {tab === 'addresses' && (
          <>
            <h1 className="text-xl font-bold mb-4">Saved Addresses</h1>
            <div className="space-y-3 mb-6">
              {addresses.map((a) => (
                <div key={a.id} className="surface-card-hover p-4 flex justify-between gap-4">
                  <div>
                    <p className="font-medium">{a.label} {a.isDefault && <span className="text-xs text-brand">(Default)</span>}</p>
                    <p className="text-sm text-gray-600">{a.fullName}, {a.mobile}</p>
                    <p className="text-sm text-gray-600">{a.addressLine}, {a.city}, {a.state} — {a.pincode}</p>
                  </div>
                  <div className="flex flex-col gap-2 text-sm">
                    {!a.isDefault && (
                      <button type="button" onClick={() => setDefault(a.id)} className="text-brand">Set default</button>
                    )}
                    <button type="button" onClick={() => removeAddress(a.id)} className="text-red-500">Delete</button>
                  </div>
                </div>
              ))}
            </div>
            <h2 className="font-semibold mb-3">Add new address</h2>
            <form onSubmit={saveAddress} className="grid sm:grid-cols-2 gap-3">
              <input className="input-field" placeholder="Label" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
              <input className="input-field" placeholder="Full name" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
              <input className="input-field" placeholder="Mobile" required value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
              <input className="input-field sm:col-span-2" placeholder="Address line" required value={form.addressLine} onChange={(e) => setForm({ ...form, addressLine: e.target.value })} />
              <input className="input-field" placeholder="City" required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              <input className="input-field" placeholder="State" required value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
              <input className="input-field" placeholder="Pincode" required value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
              <button type="submit" className="btn-primary sm:col-span-2">Save Address</button>
            </form>
          </>
        )}

        {tab === 'security' && (
          <>
            <h1 className="text-xl font-bold mb-4">Change Password</h1>
            <form onSubmit={changePassword} className="space-y-3 max-w-md">
              <input type="password" className="input-field" placeholder="Current password" required value={pwdForm.currentPassword} onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })} />
              <input type="password" className="input-field" placeholder="New password" required value={pwdForm.newPassword} onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })} />
              <input type="password" className="input-field" placeholder="Confirm new password" required value={pwdForm.confirmPassword} onChange={(e) => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })} />
              {pwdMsg && <p className={`text-sm ${pwdMsg.includes('success') ? 'text-green-600' : 'text-red-500'}`}>{pwdMsg}</p>}
              <button type="submit" className="btn-primary">Update Password</button>
            </form>
          </>
        )}

        {tab === 'loyalty' && (
          <>
            <h2 className="font-display text-2xl font-semibold mb-6">Loyalty Program</h2>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="stat-card text-center">
                <p className="text-3xl font-bold text-brand relative z-10">{loyalty?.points ?? user?.loyaltyPoints ?? 0}</p>
                <p className="text-xs text-gray-500 mt-1 relative z-10">Points balance</p>
              </div>
              <div className="stat-card text-center">
                <p className="text-3xl font-bold relative z-10">{loyalty?.tier || user?.loyaltyTier || '—'}</p>
                <p className="text-xs text-gray-500 mt-1 relative z-10">Current tier</p>
              </div>
              <div className="stat-card text-center">
                <p className="text-3xl font-bold relative z-10">{loyalty?.lifetimePoints ?? '—'}</p>
                <p className="text-xs text-gray-500 mt-1 relative z-10">Lifetime points</p>
              </div>
            </div>
            <h2 className="font-semibold mb-3">Recent activity</h2>
            {transactions.length === 0 ? (
              <p className="text-sm text-gray-500">No loyalty transactions yet.</p>
            ) : (
              <div className="space-y-2">
                {transactions.map((t) => (
                  <div key={t.id} className="flex justify-between text-sm border-b py-2">
                    <span>{t.description || t.type}</span>
                    <span className={t.points >= 0 ? 'text-green-600' : 'text-red-500'}>{t.points > 0 ? '+' : ''}{t.points}</span>
                    <span className="text-gray-400">{formatDate(t.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'notifications' && prefs && (
          <>
            <h2 className="font-display text-2xl font-semibold mb-2">Notification Preferences</h2>
            <p className="text-sm text-gray-500 mb-6">Choose how you want to hear from us</p>
            <div className="space-y-2">
              {prefFields.map(({ key, label }) => (
                <label key={key} className="flex items-center justify-between surface-card-hover p-4 cursor-pointer">
                  <span className="text-sm font-medium text-gray-800">{label}</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={!!prefs[key]}
                    onClick={() => togglePref(key)}
                    className={`toggle-switch ${prefs[key] ? 'toggle-switch-on' : ''}`}
                  >
                    <span className="toggle-switch-knob" />
                  </button>
                </label>
              ))}
            </div>
          </>
        )}

        {tab === 'links' && (
          <>
            <h2 className="font-display text-2xl font-semibold mb-6">Quick Links</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { to: '/orders', label: 'My Orders', desc: 'Track & manage orders' },
                { to: '/wishlist', label: 'Wishlist', desc: 'Saved favourites' },
                { to: '/returns', label: 'Returns', desc: 'Return or exchange' },
                { to: '/gift-cards', label: 'Gift Cards', desc: 'Buy or redeem' },
                { to: '/support', label: 'Support', desc: 'Get help' },
                ...(user?.role === 'SELLER' ? [{ to: '/seller/dashboard', label: 'Seller Dashboard', desc: 'Manage your store' }] : []),
                ...(user?.role === 'ADMIN' ? [{ to: '/admin/dashboard', label: 'Admin Dashboard', desc: 'Platform admin' }] : [])
              ].map((l) => (
                <Link key={l.to} to={l.to} className="quick-link-card">
                  <div>
                    <p className="font-semibold text-gray-900 group-hover:text-brand transition-colors">{l.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{l.desc}</p>
                  </div>
                  <span className="text-brand opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
      </div>
    </div>
  )
}
