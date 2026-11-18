import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminApi } from '../../api/adminApi'
import ProtectedRoute from '../../components/common/ProtectedRoute'
import { DashboardTabBar, DashboardStatGrid, DashboardEmpty, DashboardAlert, DashboardListItem } from '../../components/dashboard/DashboardUi'
import LoadingScreen from '../../components/ui/LoadingScreen'
import { formatINR, formatDate } from '../../utils/formatters'
import { resolveImageUrl } from '../../utils/images'
import { ShoppingBag, Users, Package, Store } from 'lucide-react'

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
  const [couponForm, setCouponForm] = useState({ code: '', type: 'PERCENTAGE', discountValue: 10, minOrderAmount: 499 })
  const [editingProduct, setEditingProduct] = useState(null)
  const [productForm, setProductForm] = useState({ name: '', description: '', basePrice: '', mrp: '', variants: [] })
  const [productEditLoading, setProductEditLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const load = () => {
    setLoading(true)
    setLoadError('')
    const tasks = [
      adminApi.dashboard().then((r) => setStats(r.data)).catch(() => setLoadError('Dashboard stats failed to load')),
      adminApi.orders().then((r) => setOrders(r.data?.content || [])).catch(() => {}),
      adminApi.users().then((r) => setUsers(r.data?.content || [])).catch(() => {}),
      adminApi.sellers().then((r) => setSellers(r.data?.content || [])).catch(() => {}),
      adminApi.products().then((r) => setProducts(r.data?.content || [])).catch(() => setLoadError('Product list failed to load')),
      adminApi.returns(0, 'REQUESTED').then((r) => setReturns(r.data?.content || [])).catch(() => {}),
      adminApi.supportTickets().then((r) => setTickets(r.data?.content || [])).catch(() => {}),
      adminApi.banners().then((r) => setBanners(r.data || [])).catch(() => {}),
      adminApi.coupons().then((r) => setCoupons(r.data?.content || [])).catch(() => {}),
      adminApi.pendingReviews().then((r) => setPendingReviews(r.data?.content || [])).catch(() => {}),
      adminApi.pendingQuestions().then((r) => setPendingQuestions(r.data?.content || [])).catch(() => {})
    ]
    Promise.all(tasks).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const loadSalesReport = () => {
    const to = new Date().toISOString()
    const from = new Date(Date.now() - 30 * 86400000).toISOString()
    adminApi.salesReport(from, to).then((r) => setSalesReport(r.data)).catch(() => {})
  }

  const loadExtendedReports = () => {
    adminApi.sellerPayouts().then((r) => setSellerPayouts(r.data?.content || [])).catch(() => {})
    adminApi.fraudQueue().then((r) => setFraudQueue(r.data?.content || [])).catch(() => {})
    adminApi.topProductsReport().then((r) => setTopProducts(r.data?.products || [])).catch(() => {})
  }

  const impersonate = async (userId) => {
    try {
      const res = await adminApi.impersonateUser(userId)
      setImpersonateMsg((m) => ({ ...m, [userId]: 'Token: ' + res.data?.token?.slice(0, 30) + '...' }))
    } catch {
      setImpersonateMsg((m) => ({ ...m, [userId]: 'Failed' }))
    }
  }

  const startEditProduct = async (id) => {
    setProductEditLoading(true)
    try {
      const res = await adminApi.getProduct(id)
      const p = res.data
      setEditingProduct(id)
      setProductForm({
        name: p.name,
        description: p.description || '',
        basePrice: p.basePrice,
        mrp: p.mrp,
        variants: p.variants?.map((v) => ({ id: v.id, size: v.size || v.color, stockQuantity: v.stockQuantity })) || []
      })
      setTab('edit-product')
    } catch {
      alert('Could not load product details')
    } finally {
      setProductEditLoading(false)
    }
  }

  const saveProductEdit = async (e) => {
    e.preventDefault()
    if (!editingProduct) return
    try {
      await adminApi.updateProduct(editingProduct, {
        name: productForm.name,
        description: productForm.description,
        basePrice: Number(productForm.basePrice),
        mrp: Number(productForm.mrp)
      })
      for (const v of productForm.variants) {
        if (v.id) await adminApi.updateProductStock(editingProduct, v.id, Number(v.stockQuantity))
      }
      setEditingProduct(null)
      setTab('products')
      load()
    } catch (err) {
      alert(err?.message || 'Failed to save product')
    }
  }

  const tabDefs = [
    { id: 'overview', label: 'overview' },
    { id: 'orders', label: 'orders' },
    { id: 'users', label: 'users' },
    { id: 'sellers', label: 'sellers' },
    { id: 'products', label: 'products' },
    ...(editingProduct ? [{ id: 'edit-product', label: 'edit product' }] : []),
    { id: 'returns', label: 'returns' },
    { id: 'support', label: 'support' },
    { id: 'banners', label: 'banners' },
    { id: 'coupons', label: 'coupons' },
    { id: 'moderation', label: 'moderation' },
    { id: 'payouts', label: 'payouts' },
    { id: 'fraud', label: 'fraud' },
    { id: 'reports', label: 'reports' }
  ]
  const tabCounts = {
    orders: orders.length,
    users: users.length,
    sellers: sellers.length,
    products: products.length,
    returns: returns.length,
    support: tickets.length
  }

  if (loading && !stats) return <LoadingScreen message="Loading admin dashboard..." />

  return (
    <div className="page-shell">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.15em] text-brand font-medium mb-1">Platform Admin</p>
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Manage orders, users, sellers, and catalog</p>
      </div>
      <DashboardAlert message={loadError} type="error" />
      <DashboardTabBar
        tabs={tabDefs}
        active={tab}
        counts={tabCounts}
        onChange={(t) => {
          setTab(t)
          if (t === 'reports') { loadSalesReport(); loadExtendedReports() }
          if (t === 'payouts') loadExtendedReports()
          if (t === 'fraud') loadExtendedReports()
        }}
      />

      {tab === 'overview' && stats && (
        <DashboardStatGrid stats={[
          { label: 'Orders', value: stats.totalOrders },
          { label: 'Revenue', value: formatINR(stats.totalRevenue || 0) },
          { label: 'Users', value: stats.totalUsers },
          { label: 'Pending Returns', value: stats.pendingReturns ?? 0 }
        ]} />
      )}

      {tab === 'orders' && (
        orders.length === 0 ? (
          <DashboardEmpty icon={ShoppingBag} title="No orders yet" message="Orders will appear here when customers checkout." />
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <DashboardListItem key={o.id}>
                <div className="flex flex-wrap justify-between items-center gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">{o.orderNumber}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{formatDate(o.placedAt)} · {formatINR(o.totalAmount)}</p>
                  </div>
                  <div className="flex gap-2 items-center flex-wrap">
                    <span className="text-xs px-2.5 py-1 bg-brand/10 text-brand rounded-lg font-medium">{o.status}</span>
                    {(o.status === 'PLACED' || o.status === 'CONFIRMED') && (
                      <button type="button" className="text-sm px-3 py-1.5 rounded-lg bg-brand/10 text-brand hover:bg-brand/20" onClick={() => adminApi.shipOrder(o.id).then(load)}>Mark shipped</button>
                    )}
                    {o.status === 'SHIPPED' && (
                      <button type="button" className="text-sm px-3 py-1.5 rounded-lg bg-brand/10 text-brand hover:bg-brand/20" onClick={() => adminApi.deliverOrder(o.id).then(load)}>Mark delivered</button>
                    )}
                  </div>
                </div>
              </DashboardListItem>
            ))}
          </div>
        )
      )}

      {tab === 'users' && (
        users.length === 0 ? (
          <DashboardEmpty icon={Users} title="No users" message="Registered customers and staff will appear here." />
        ) : (
          <div className="space-y-3">
            {users.map((u) => (
              <DashboardListItem key={u.id}>
                <div className="flex flex-wrap justify-between items-center gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">{u.name || u.email}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{u.role} · {u.email || u.mobile}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {(u.isBlocked || u.blocked) ? (
                      <button type="button" className="text-sm px-3 py-1.5 rounded-lg text-brand hover:bg-brand/5" onClick={() => adminApi.unblockUser(u.id).then(load)}>Unblock</button>
                    ) : (
                      <button type="button" className="text-sm px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50" onClick={() => adminApi.blockUser(u.id).then(load)}>Block</button>
                    )}
                    {u.role !== 'ADMIN' && (
                      <select className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white" defaultValue={u.role} onChange={(e) => adminApi.updateRole(u.id, e.target.value).then(load)}>
                        <option value="CUSTOMER">Customer</option>
                        <option value="SELLER">Seller</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    )}
                  </div>
                </div>
              </DashboardListItem>
            ))}
          </div>
        )
      )}

      {tab === 'sellers' && (
        sellers.length === 0 ? (
          <DashboardEmpty icon={Store} title="No sellers" message="Seller applications will appear here for approval." />
        ) : (
          <div className="space-y-3">
            {sellers.map((s) => (
              <DashboardListItem key={s.id}>
                <div className="flex flex-wrap justify-between items-center gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">{s.businessName || s.userName}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{s.status} · {s.userEmail || ''}</p>
                  </div>
                  <div className="flex gap-2">
                    {s.status === 'PENDING' && (
                      <>
                        <button type="button" className="text-sm px-3 py-1.5 rounded-lg text-brand hover:bg-brand/5" onClick={() => adminApi.approveSeller(s.id).then(load)}>Approve</button>
                        <button type="button" className="text-sm px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50" onClick={() => adminApi.rejectSeller(s.id).then(load)}>Reject</button>
                      </>
                    )}
                    {s.status === 'APPROVED' && (
                      <button type="button" className="text-sm px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50" onClick={() => adminApi.suspendSeller(s.id).then(load)}>Suspend</button>
                    )}
                  </div>
                </div>
              </DashboardListItem>
            ))}
          </div>
        )
      )}

      {tab === 'products' && (
        products.length === 0 ? (
          <DashboardEmpty icon={Package} title="No products" message="Products from all sellers will appear here." />
        ) : (
          <div className="space-y-3">
            {products.map((p) => (
              <DashboardListItem key={p.id}>
                <div className="flex justify-between items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                      {p.primaryImageUrl ? (
                        <img src={resolveImageUrl(p.primaryImageUrl)} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400"><Package className="w-5 h-5" /></div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">{p.name}</p>
                      <p className="text-sm text-gray-500">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs mr-2 ${p.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100'}`}>{p.status}</span>
                        {formatINR(p.finalPrice || p.basePrice)}
                        {p.totalStock != null && ` · Stock ${p.totalStock}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button type="button" className="text-sm px-3 py-1.5 rounded-lg border border-indigo-200 text-indigo-700 hover:bg-indigo-50" onClick={() => startEditProduct(p.id)} disabled={productEditLoading}>Edit</button>
                    <button type="button" className="text-sm px-3 py-1.5 rounded-lg border border-brand/30 text-brand hover:bg-brand/5" onClick={() => adminApi.toggleFeatured(p.id, !p.isFeatured).then(load)}>{p.isFeatured ? 'Unfeature' : 'Feature'}</button>
                    <button type="button" className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50" onClick={() => adminApi.updateProductStatus(p.id, p.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE').then(load)}>Toggle status</button>
                  </div>
                </div>
              </DashboardListItem>
            ))}
          </div>
        )
      )}

      {tab === 'edit-product' && editingProduct && (
        <form onSubmit={saveProductEdit} className="border rounded-xl p-6 max-w-xl space-y-3 bg-white">
          <h2 className="font-semibold text-lg mb-2">Edit Product</h2>
          <input className="input-field" placeholder="Product name" required value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} />
          <textarea className="input-field" placeholder="Description" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} />
          <input className="input-field" type="number" placeholder="Selling price" required value={productForm.basePrice} onChange={(e) => setProductForm({ ...productForm, basePrice: e.target.value })} />
          <input className="input-field" type="number" placeholder="MRP" required value={productForm.mrp} onChange={(e) => setProductForm({ ...productForm, mrp: e.target.value })} />
          <p className="text-sm font-medium pt-2">Variants / inventory</p>
          {productForm.variants.map((v, i) => (
            <div key={v.id || i} className="flex gap-2 items-center">
              <span className="text-sm text-gray-600 w-16">{v.size || 'Variant'}</span>
              <input className="input-field flex-1" type="number" min="0" placeholder="Stock qty" value={v.stockQuantity} onChange={(e) => {
                const vs = [...productForm.variants]
                vs[i] = { ...vs[i], stockQuantity: e.target.value }
                setProductForm({ ...productForm, variants: vs })
              }} />
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <button type="submit" className="btn-primary">Save Changes</button>
            <button type="button" className="btn-outline" onClick={() => { setEditingProduct(null); setTab('products') }}>Cancel</button>
          </div>
        </form>
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
              <p className="text-sm text-gray-600">{t.message || 'No message'}</p>
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
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); adminApi.createCoupon({ code: couponForm.code, type: couponForm.type, discountValue: Number(couponForm.discountValue), minOrderAmount: Number(couponForm.minOrderAmount), isActive: true, description: `${couponForm.discountValue}% off` }).then(load) }}>
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">Seller Payouts</h2>
            <button type="button" className="text-sm btn-primary" onClick={() => adminApi.processPayouts().then(loadExtendedReports)}>Process monthly payouts</button>
          </div>
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
          {fraudQueue.length === 0 ? <p className="text-sm text-gray-500">No flagged users.</p> : fraudQueue.map((user) => (
            <div key={user.id} className="border rounded-xl p-4 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">{user.name || user.email || user.mobile}</p>
                <p className="text-xs text-gray-500">{user.email} · Flag: {user.fraudFlag}</p>
                {impersonateMsg[user.id] && <p className="text-xs text-green-600 mt-1">{impersonateMsg[user.id]}</p>}
              </div>
              <div className="flex gap-2">
                <button type="button" className="text-sm text-brand border border-brand px-3 py-1.5 rounded-lg hover:bg-brand/5"
                  onClick={() => impersonate(user.id)}>Impersonate</button>
                <button type="button" className="text-sm text-green-700 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-50"
                  onClick={() => adminApi.clearFraud(user.id).then(loadExtendedReports)}>Clear Flag</button>
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
                <div><dt className="text-gray-500">Total sales</dt><dd className="font-bold text-lg">{formatINR(salesReport.gmv || salesReport.totalSales || salesReport.totalRevenue || 0)}</dd></div>
                <div><dt className="text-gray-500">Orders</dt><dd className="font-bold text-lg">{salesReport.orderCount ?? salesReport.totalOrders ?? '—'}</dd></div>
                <div><dt className="text-gray-500">Avg order value</dt><dd className="font-bold text-lg">{salesReport.orderCount > 0 ? formatINR((salesReport.gmv || 0) / salesReport.orderCount) : formatINR(salesReport.avgOrderValue || 0)}</dd></div>
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
