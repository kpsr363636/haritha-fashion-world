import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminApi } from '../../api/adminApi'
import ProtectedRoute from '../../components/common/ProtectedRoute'
import { formatINR, formatDate } from '../../utils/formatters'

function AdminDashboardContent() {
  const [tab, setTab] = useState('overview')
  const [stats, setStats] = useState(null)
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])
  const [sellers, setSellers] = useState([])
  const [products, setProducts] = useState([])
  const [returns, setReturns] = useState([])
  const [tickets, setTickets] = useState([])
  const [banners, setBanners] = useState([])
  const [coupons, setCoupons] = useState([])
  const [pendingReviews, setPendingReviews] = useState([])
  const [pendingQuestions, setPendingQuestions] = useState([])
  const [salesReport, setSalesReport] = useState(null)
  const [sellerPayouts, setSellerPayouts] = useState([])
  const [fraudQueue, setFraudQueue] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [impersonateMsg, setImpersonateMsg] = useState({})
  const [bannerForm, setBannerForm] = useState({ title: '', imageUrl: '', linkUrl: '', position: 'HOME_HERO' })
  const [couponForm, setCouponForm] = useState({ code: '', discountType: 'PERCENT', discountValue: 10, minOrderAmount: 499 })

  const load = () => {
    adminApi.dashboard().then((r) => setStats(r.data)).catch(() => {})
    adminApi.orders().then((r) => setOrders(r.data?.content || [])).catch(() => {})
    adminApi.users().then((r) => setUsers(r.data?.content || [])).catch(() => {})
    adminApi.sellers().then((r) => setSellers(r.data?.content || [])).catch(() => {})
    adminApi.products().then((r) => setProducts(r.data?.content || [])).catch(() => {})
    adminApi.returns(0, 'REQUESTED').then((r) => setReturns(r.data?.content || [])).catch(() => {})
    adminApi.supportTickets().then((r) => setTickets(r.data?.content || [])).catch(() => {})
    adminApi.banners().then((r) => setBanners(r.data || [])).catch(() => {})
    adminApi.coupons().then((r) => setCoupons(r.data?.content || [])).catch(() => {})
    adminApi.pendingReviews().then((r) => setPendingReviews(r.data?.content || [])).catch(() => {})
    adminApi.pendingQuestions().then((r) => setPendingQuestions(r.data?.content || [])).catch(() => {})
  }

  useEffect(() => { load() }, [])

  const loadSalesReport = () => {
    const to = new Date().toISOString()
    const from = new Date(Date.now() - 30 * 86400000).toISOString()
    adminApi.salesReport(from, to).then((r) => setSalesReport(r.data)).catch(() => {})
  }

  const loadExtendedReports = () => {
    adminApi.sellerPayouts().then((r) => setSellerPayouts(r.data?.content || [])).catch(() => {})
    adminApi.fraudQueue().then((r) => setFraudQueue(r.data || [])).catch(() => {})
    adminApi.topProductsReport().then((r) => setTopProducts(r.data || [])).catch(() => {})
  }

  const impersonate = async (userId) => {
    try {
      const res = await adminApi.impersonateUser(userId)
      setImpersonateMsg((m) => ({ ...m, [userId]: 'Token: ' + res.data?.token?.slice(0, 30) + '...' }))
    } catch {
      setImpersonateMsg((m) => ({ ...m, [userId]: 'Failed' }))
    }
  }

  const tabs = ['overview', 'orders', 'users', 'sellers', 'products', 'returns', 'support', 'banners', 'coupons', 'moderation', 'payouts', 'fraud', 'reports']

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((t) => (
          <button key={t} type="button" onClick={() => {
            setTab(t)
            if (t === 'reports') { loadSalesReport(); loadExtendedReports() }
            if (t === 'payouts') loadExtendedReports()
            if (t === 'fraud') loadExtendedReports()
          }} className={`px-4 py-2 rounded-lg text-sm capitalize ${tab === t ? 'bg-brand text-white' : 'bg-gray-100'}`}>{t}</button>
        ))}
      </div>

      {tab === 'overview' && stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Orders', value: stats.totalOrders },
            { label: 'Revenue', value: formatINR(stats.totalRevenue || 0) },
            { label: 'Users', value: stats.totalUsers },
            { label: 'Pending Returns', value: stats.pendingReturns ?? 0 }
          ].map((k) => (
            <div key={k.label} className="border rounded-xl p-4 bg-gray-50">
              <p className="text-sm text-gray-500">{k.label}</p>
              <p className="text-2xl font-bold">{k.value}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'orders' && (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="border rounded-lg p-4 flex flex-wrap justify-between items-center gap-2">
              <div>
                <p className="font-medium">{o.orderNumber}</p>
                <p className="text-sm text-gray-500">{formatDate(o.placedAt)} · {formatINR(o.totalAmount)}</p>
              </div>
              <div className="flex gap-2 items-center flex-wrap">
                <span className="text-xs px-2 py-1 bg-brand-50 text-brand rounded">{o.status}</span>
                {(o.status === 'PLACED' || o.status === 'CONFIRMED') && (
                  <button type="button" className="text-sm text-brand" onClick={() => adminApi.shipOrder(o.id).then(load)}>Mark shipped</button>
                )}
                {o.status === 'SHIPPED' && (
                  <button type="button" className="text-sm text-brand" onClick={() => adminApi.deliverOrder(o.id).then(load)}>Mark delivered</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'users' && (
        <div className="space-y-3">
          {users.map((u) => (
            <div key={u.id} className="border rounded-lg p-4 flex justify-between items-center gap-2">
              <div>
                <p className="font-medium">{u.name || u.email}</p>
                <p className="text-sm text-gray-500">{u.role} · {u.email || u.mobile}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {(u.isBlocked || u.blocked) ? (
                  <button type="button" className="text-sm text-brand" onClick={() => adminApi.unblockUser(u.id).then(load)}>Unblock</button>
                ) : (
                  <button type="button" className="text-sm text-red-500" onClick={() => adminApi.blockUser(u.id).then(load)}>Block</button>
                )}
                {u.role !== 'ADMIN' && (
                  <select className="text-sm border rounded px-2 py-1" defaultValue={u.role} onChange={(e) => adminApi.updateRole(u.id, e.target.value).then(load)}>
                    <option value="CUSTOMER">Customer</option>
                    <option value="SELLER">Seller</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'sellers' && (
        <div className="space-y-3">
          {sellers.map((s) => (
            <div key={s.id} className="border rounded-lg p-4 flex justify-between">
              <div>
                <p className="font-medium">{s.businessName || s.user?.name}</p>
                <p className="text-sm text-gray-500">{s.status}</p>
              </div>
              <div className="flex gap-2">
                {s.status === 'PENDING' && (
                  <>
                    <button type="button" className="text-sm text-brand" onClick={() => adminApi.approveSeller(s.id).then(load)}>Approve</button>
                    <button type="button" className="text-sm text-red-500" onClick={() => adminApi.rejectSeller(s.id).then(load)}>Reject</button>
                  </>
                )}
                {s.status === 'APPROVED' && (
                  <button type="button" className="text-sm text-red-500" onClick={() => adminApi.suspendSeller(s.id).then(load)}>Suspend</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'products' && (
        <div className="space-y-3">
          {products.map((p) => (
            <div key={p.id} className="border rounded-lg p-4 flex justify-between items-center">
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-sm text-gray-500">{p.status} · {formatINR(p.finalPrice || p.basePrice)}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" className="text-sm text-brand" onClick={() => adminApi.toggleFeatured(p.id, !p.isFeatured).then(load)}>{p.isFeatured ? 'Unfeature' : 'Feature'}</button>
                <button type="button" className="text-sm" onClick={() => adminApi.updateProductStatus(p.id, p.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE').then(load)}>Toggle status</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'returns' && (
        <div className="space-y-3">
          {returns.length === 0 ? <p className="text-gray-500">No pending returns.</p> : returns.map((r) => (
            <div key={r.id} className="border rounded-lg p-4 flex justify-between">
              <div>
                <p className="font-medium">{r.reason}</p>
                <p className="text-sm text-gray-500">{r.status} · {r.returnType}</p>
              </div>
              {r.status === 'REQUESTED' && (
                <button type="button" className="text-sm text-brand" onClick={() => adminApi.processReturn(r.id).then(load)}>Process refund</button>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'support' && (
        <div className="space-y-3">
          {tickets.map((t) => (
            <div key={t.id} className="border rounded-lg p-4">
              <p className="font-medium">{t.subject}</p>
              <p className="text-sm text-gray-600">{t.message}</p>
              <div className="flex gap-2 mt-2">
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">{t.status}</span>
                {t.status === 'OPEN' && (
                  <button type="button" className="text-sm text-brand" onClick={() => adminApi.updateTicketStatus(t.id, 'RESOLVED').then(load)}>Resolve</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'banners' && (
        <div className="grid md:grid-cols-2 gap-6">
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); adminApi.createBanner(bannerForm).then(() => { setBannerForm({ title: '', imageUrl: '', linkUrl: '', position: 'HOME_HERO' }); load() }) }}>
            <h2 className="font-semibold">Add banner</h2>
            <input className="input-field" placeholder="Title" value={bannerForm.title} onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })} required />
            <input className="input-field" placeholder="Image URL" value={bannerForm.imageUrl} onChange={(e) => setBannerForm({ ...bannerForm, imageUrl: e.target.value })} required />
            <input className="input-field" placeholder="Link URL" value={bannerForm.linkUrl} onChange={(e) => setBannerForm({ ...bannerForm, linkUrl: e.target.value })} />
            <button type="submit" className="btn-primary">Add Banner</button>
          </form>
          <div className="space-y-2">
            {banners.map((b) => (
              <div key={b.id} className="border rounded p-3 flex justify-between items-center">
                <span className="text-sm">{b.title}</span>
                <button type="button" className="text-red-500 text-sm" onClick={() => adminApi.deleteBanner(b.id).then(load)}>Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'coupons' && (
        <div className="grid md:grid-cols-2 gap-6">
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); adminApi.createCoupon({ ...couponForm, discountValue: Number(couponForm.discountValue), minOrderAmount: Number(couponForm.minOrderAmount), active: true }).then(load) }}>
            <h2 className="font-semibold">Create coupon</h2>
            <input className="input-field" placeholder="Code" value={couponForm.code} onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })} required />
            <input className="input-field" type="number" placeholder="Discount value" value={couponForm.discountValue} onChange={(e) => setCouponForm({ ...couponForm, discountValue: e.target.value })} />
            <input className="input-field" type="number" placeholder="Min order" value={couponForm.minOrderAmount} onChange={(e) => setCouponForm({ ...couponForm, minOrderAmount: e.target.value })} />
            <button type="submit" className="btn-primary">Create Coupon</button>
          </form>
          <div className="space-y-2">
            {coupons.map((c) => (
              <div key={c.id} className="border rounded p-3 flex justify-between items-center">
                <span className="text-sm font-mono">{c.code}</span>
                <button type="button" className="text-red-500 text-sm" onClick={() => adminApi.deleteCoupon(c.id).then(load)}>Deactivate</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'moderation' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="font-semibold mb-3">Pending reviews</h2>
            {pendingReviews.length === 0 ? <p className="text-sm text-gray-500">None</p> : pendingReviews.map((r) => (
              <div key={r.id} className="border rounded p-3 mb-2">
                <p className="text-sm font-medium">{r.title}</p>
                <p className="text-xs text-gray-500">{r.body?.slice(0, 80)}</p>
                <button type="button" className="text-sm text-brand mt-1" onClick={() => adminApi.approveReview(r.id).then(load)}>Approve</button>
              </div>
            ))}
          </div>
          <div>
            <h2 className="font-semibold mb-3">Pending Q&A</h2>
            {pendingQuestions.length === 0 ? <p className="text-sm text-gray-500">None</p> : pendingQuestions.map((q) => (
              <div key={q.id} className="border rounded p-3 mb-2">
                <p className="text-sm">{q.question}</p>
                <button type="button" className="text-sm text-brand mt-1" onClick={() => adminApi.approveQuestion(q.id).then(load)}>Approve</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'payouts' && (
        <div className="space-y-3">
          <h2 className="font-semibold mb-4">Seller Payouts</h2>
          {sellerPayouts.length === 0 ? <p className="text-gray-500 text-sm">No payouts yet.</p> : sellerPayouts.map((p) => (
            <div key={p.id} className="border rounded-xl p-4 flex justify-between items-center">
              <div>
                <p className="font-medium text-sm">{p.sellerName || p.sellerId}</p>
                <p className="text-xs text-gray-500">{formatDate(p.processedAt)} · {p.notes}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">{formatINR(p.amount)}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === 'PROCESSED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{p.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'fraud' && (
        <div className="space-y-4">
          <h2 className="font-semibold mb-4">Fraud Queue</h2>
          {fraudQueue.length === 0 ? <p className="text-sm text-gray-500">No flagged users.</p> : fraudQueue.map((userId) => (
            <div key={userId} className="border rounded-xl p-4 flex justify-between items-center">
              <div>
                <p className="text-sm font-mono text-gray-700">{userId}</p>
                {impersonateMsg[userId] && <p className="text-xs text-green-600 mt-1">{impersonateMsg[userId]}</p>}
              </div>
              <div className="flex gap-2">
                <button type="button" className="text-sm text-brand border border-brand px-3 py-1.5 rounded-lg hover:bg-brand/5"
                  onClick={() => impersonate(userId)}>Impersonate</button>
                <button type="button" className="text-sm text-green-700 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-50"
                  onClick={() => adminApi.clearFraud(userId).then(loadExtendedReports)}>Clear Flag</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'reports' && (
        <div className="space-y-6">
          <div className="border rounded-xl p-6">
            <h2 className="font-semibold mb-4">Sales (last 30 days)</h2>
            {salesReport ? (
              <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div><dt className="text-gray-500">Total sales</dt><dd className="font-bold text-lg">{formatINR(salesReport.totalSales || salesReport.totalRevenue || 0)}</dd></div>
                <div><dt className="text-gray-500">Orders</dt><dd className="font-bold text-lg">{salesReport.orderCount ?? salesReport.totalOrders ?? '—'}</dd></div>
                <div><dt className="text-gray-500">Avg order value</dt><dd className="font-bold text-lg">{formatINR(salesReport.avgOrderValue || 0)}</dd></div>
                <div><dt className="text-gray-500">New users</dt><dd className="font-bold text-lg">{salesReport.newUsers ?? '—'}</dd></div>
              </dl>
            ) : <p className="text-gray-500">Loading report...</p>}
          </div>
          {topProducts.length > 0 && (
            <div className="border rounded-xl p-6">
              <h2 className="font-semibold mb-4">Top Products</h2>
              <div className="space-y-2">
                {topProducts.slice(0, 10).map((p, i) => (
                  <div key={p.id || i} className="flex justify-between text-sm">
                    <span className="text-gray-700">{i + 1}. {p.name || p.productName}</span>
                    <span className="font-medium">{p.totalSold || p.orderCount} sold · {formatINR(p.revenue || 0)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Link to="/" className="inline-block mt-8 text-sm text-brand">← Back to store</Link>
    </div>
  )
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute roles={['ADMIN']}>
      <AdminDashboardContent />
    </ProtectedRoute>
  )
}
