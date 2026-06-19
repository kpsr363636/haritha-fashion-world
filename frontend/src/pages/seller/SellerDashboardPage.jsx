import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { sellerApi } from '../../api/adminApi'
import { categoryApi } from '../../api/productApi'
import { uploadApi } from '../../api/uploadApi'
import ProtectedRoute from '../../components/common/ProtectedRoute'
import BulkUploadModal from '../../components/seller/BulkUploadModal'
import ProductForm, { productFormDefaults } from '../../components/seller/ProductForm'
import { useAuth } from '../../context/AuthContext'
import { formatINR, formatDate } from '../../utils/formatters'
import { resolveImageUrl } from '../../utils/images'
import { validateImageFile } from '../../utils/formValidation'
import LoadingScreen from '../../components/ui/LoadingScreen'
import { DashboardTabBar, DashboardStatGrid, DashboardEmpty, DashboardAlert, DashboardListItem } from '../../components/dashboard/DashboardUi'
import { Upload, Image, Package, ShoppingBag, AlertCircle } from 'lucide-react'

function SellerRegisterForm({ onDone }) {
  const { login, user, token } = useAuth()
  const [form, setForm] = useState({ businessName: '', gstNumber: '', bankAccountNumber: '', ifscCode: '', panNumber: '' })
  const [errors, setErrors] = useState({})
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    const next = {}
    if (!form.businessName.trim()) next.businessName = 'Business name is required'
    if (Object.keys(next).length) { setErrors(next); return }
    setSubmitting(true)
    try {
      await sellerApi.register(form)
      login({ token, user: { ...user, role: 'SELLER' } })
      setDone(true)
      onDone?.()
    } catch (err) {
      setErrors({ form: err?.message || 'Registration failed' })
    } finally {
      setSubmitting(false)
    }
  }

  if (done) return <p className="text-brand">Application submitted. Admin will review your seller account.</p>

  return (
    <form onSubmit={submit} className="grid sm:grid-cols-2 gap-3 max-w-2xl">
      {errors.form && <p className="sm:col-span-2 text-sm text-red-600">{errors.form}</p>}
      <div className="sm:col-span-2">
        <input className={`input-field ${errors.businessName ? 'border-red-400' : ''}`} placeholder="Business name *" required value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} />
        {errors.businessName && <p className="text-xs text-red-600 mt-1">{errors.businessName}</p>}
      </div>
      <input className="input-field" placeholder="GST number" value={form.gstNumber} onChange={(e) => setForm({ ...form, gstNumber: e.target.value })} />
      <input className="input-field" placeholder="PAN" value={form.panNumber} onChange={(e) => setForm({ ...form, panNumber: e.target.value })} />
      <input className="input-field" placeholder="Bank account" value={form.bankAccountNumber} onChange={(e) => setForm({ ...form, bankAccountNumber: e.target.value })} />
      <input className="input-field" placeholder="IFSC" value={form.ifscCode} onChange={(e) => setForm({ ...form, ifscCode: e.target.value })} />
      <button type="submit" className="btn-primary sm:col-span-2" disabled={submitting}>{submitting ? 'Submitting…' : 'Apply as Seller'}</button>
    </form>
  )
}

function SellerDashboardContent() {
  const { user } = useAuth()
  const [tab, setTab] = useState('overview')
  const [stats, setStats] = useState(null)
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [payouts, setPayouts] = useState([])
  const [categories, setCategories] = useState([])
  const [editing, setEditing] = useState(null)
  const [editForm, setEditForm] = useState(null)
  const [showBulkUpload, setShowBulkUpload] = useState(false)
  const [uploadingImages, setUploadingImages] = useState({})
  const [uploadProgress, setUploadProgress] = useState({})
  const [uploadErrors, setUploadErrors] = useState({})
  const [reviews, setReviews] = useState([])
  const [questions, setQuestions] = useState([])
  const [replyDrafts, setReplyDrafts] = useState({})
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState('')

  const flatCategories = (nodes, out = []) => {
    nodes.forEach((n) => { out.push(n); if (n.children) flatCategories(n.children, out) })
    return out
  }

  const load = () => {
    if (user?.role !== 'SELLER') return
    setLoading(true)
    setLoadError('')
    Promise.all([
      sellerApi.dashboard().then((r) => setStats(r.data)).catch(() => {}),
      sellerApi.products().then((r) => setProducts(r.data?.content || [])).catch(() => setLoadError('Product list failed to load — refresh or restart backend')),
      sellerApi.orders().then((r) => setOrders(r.data?.content || [])).catch(() => {}),
      sellerApi.payouts().then((r) => setPayouts(r.data?.content || [])).catch(() => {}),
      sellerApi.sellerReviews().then((r) => setReviews(r.data?.content || [])).catch(() => {}),
      sellerApi.sellerQuestions().then((r) => setQuestions(r.data?.content || [])).catch(() => {}),
      categoryApi.getTree().then((r) => setCategories(r.data || [])).catch(() => {})
    ]).catch(() => setLoadError('Some dashboard data failed to load. Try refreshing.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { if (user?.role === 'SELLER') load() }, [user?.role])

  const startEdit = async (id) => {
    try {
      const res = await sellerApi.getProduct(id)
      const p = res.data
      setEditing(id)
      setEditForm({
        categoryId: p.categoryId || '',
        name: p.name,
        description: p.description || '',
        basePrice: p.basePrice,
        mrp: p.mrp,
        variants: p.variants?.length
          ? p.variants.map((v) => ({ id: v.id, size: v.size || v.color || '', stockQuantity: v.stockQuantity }))
          : [{ size: '', stockQuantity: 0 }]
      })
      setTab('edit-product')
    } catch (err) {
      alert(err?.message || 'Could not load product for editing')
    }
  }

  const handleImageUpload = async (productId, e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const validationErr = validateImageFile(file)
    if (validationErr) {
      setUploadErrors((prev) => ({ ...prev, [productId]: validationErr }))
      return
    }
    setUploadErrors((prev) => ({ ...prev, [productId]: null }))
    setUploadingImages((prev) => ({ ...prev, [productId]: true }))
    try {
      const url = await uploadApi.uploadImage(file, (pct) =>
        setUploadProgress((prev) => ({ ...prev, [productId]: pct }))
      )
      const isPrimary = !products.find((p) => p.id === productId)?.primaryImageUrl
      await sellerApi.addProductImage(productId, url, isPrimary)
      load()
    } catch (err) {
      setUploadErrors((prev) => ({ ...prev, [productId]: err?.message || 'Upload failed' }))
    } finally {
      setUploadingImages((prev) => ({ ...prev, [productId]: false }))
      setUploadProgress((prev) => ({ ...prev, [productId]: 0 }))
    }
  }

  const onProductFormSuccess = (action) => {
    load()
    if (action === 'create') {
      setTab('products')
    } else {
      setEditing(null)
      setEditForm(null)
      setTab('products')
    }
  }

  if (user?.role === 'ADMIN') {
    return (
      <div className="page-shell max-w-2xl">
        <div className="surface-card p-8 md:p-10">
          <p className="text-xs uppercase tracking-[0.15em] text-brand font-medium mb-2">Admin account</p>
          <h1 className="page-title mb-2">Seller Dashboard</h1>
          <p className="text-gray-600 mb-6">Log in as <strong>seller@harithafashion.com</strong> to manage products.</p>
          <Link to="/admin/dashboard" className="btn-primary">Go to Admin Dashboard</Link>
        </div>
      </div>
    )
  }

  if (user?.role === 'CUSTOMER') {
    return (
      <div className="page-shell max-w-2xl">
        <div className="surface-card p-8 md:p-10">
          <p className="text-xs uppercase tracking-[0.15em] text-brand font-medium mb-2">Partner with us</p>
          <h1 className="page-title mb-2">Become a Seller</h1>
          <p className="page-subtitle mb-8">Start selling on Haritha Fashion.</p>
          <SellerRegisterForm onDone={() => window.location.reload()} />
        </div>
      </div>
    )
  }

  const catList = flatCategories(categories)
  const tabDefs = [
    { id: 'overview', label: 'overview' },
    { id: 'products', label: 'products' },
    { id: 'add-product', label: 'add product' },
    ...(editing ? [{ id: 'edit-product', label: 'edit product' }] : []),
    { id: 'orders', label: 'orders' },
    { id: 'payouts', label: 'payouts' },
    { id: 'engagement', label: 'engagement' }
  ]
  const tabCounts = { products: products.length, orders: orders.length, payouts: payouts.length }

  return (
    <div className="page-shell">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.15em] text-brand font-medium mb-1">Seller Hub</p>
        <h1 className="page-title">Seller Dashboard</h1>
        <p className="page-subtitle">Manage your boutique on Haritha Fashion</p>
      </div>
      <DashboardAlert message={loadError} />
      <DashboardTabBar tabs={tabDefs} active={tab} onChange={setTab} counts={tabCounts} />
      {loading && tab === 'overview' && !stats && <LoadingScreen message="Loading seller dashboard..." />}

      {tab === 'overview' && stats && (
        <DashboardStatGrid stats={[
          { label: 'Sales', value: formatINR(stats.totalSales || 0) },
          { label: 'Orders', value: stats.orderCount },
          { label: 'Products', value: stats.productCount },
          { label: 'Pending Payout', value: formatINR(stats.pendingPayout || 0) }
        ]} />
      )}

      {tab === 'products' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 justify-between items-center">
            <p className="text-sm text-gray-500">{products.length} product{products.length !== 1 ? 's' : ''}</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setTab('add-product')} className="btn-primary text-sm py-2">+ Add product</button>
              <button type="button" onClick={() => setShowBulkUpload(true)} className="flex items-center gap-2 px-4 py-2 border border-brand text-brand rounded-xl text-sm hover:bg-brand/5">
                <Upload className="w-4 h-4" /> Bulk upload
              </button>
            </div>
          </div>
          {products.length === 0 && !loading && (
            <div className="surface-card p-10 text-center">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No products yet</p>
              <p className="text-sm text-gray-500 mt-1 mb-4">Create your first listing to start selling.</p>
              <button type="button" onClick={() => setTab('add-product')} className="btn-primary">Add product</button>
            </div>
          )}
          {products.map((p) => (
            <div key={p.id} className="surface-card p-4 md:p-5">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                    {p.primaryImageUrl ? (
                      <img src={resolveImageUrl(p.primaryImageUrl)} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Image className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{p.name}</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mr-2 ${p.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                        {p.status || 'DRAFT'}
                      </span>
                      {formatINR(p.finalPrice || p.basePrice)}
                      {p.totalStock != null && ` · Stock: ${p.totalStock}`}
                    </p>
                    {!p.primaryImageUrl && (
                      <p className="text-xs text-amber-600 mt-1">No photo — add one to improve visibility</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition-colors">
                    <Image className="w-3.5 h-3.5" />
                    {uploadingImages[p.id] ? `${uploadProgress[p.id] || 0}%` : 'Upload photo'}
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => handleImageUpload(p.id, e)} disabled={uploadingImages[p.id]} />
                  </label>
                  <button type="button" className="text-sm px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50" onClick={() => startEdit(p.id)}>Edit</button>
                  <button type="button" className="text-sm px-3 py-2 rounded-lg bg-brand/10 text-brand hover:bg-brand/20" onClick={() => sellerApi.updateStatus(p.id, p.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE').then(load)}>
                    {p.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                  </button>
                  <button type="button" className="text-sm px-3 py-2 rounded-lg text-red-600 hover:bg-red-50" onClick={() => { if (window.confirm('Delete this product?')) sellerApi.deleteProduct(p.id).then(load) }}>Delete</button>
                </div>
              </div>
              {uploadErrors[p.id] && (
                <p className="text-xs text-red-600 mt-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{uploadErrors[p.id]}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'add-product' && (
        <ProductForm
          mode="create"
          categories={catList}
          initialValues={productFormDefaults}
          onSuccess={onProductFormSuccess}
        />
      )}

      {tab === 'edit-product' && editing && editForm && (
        <ProductForm
          mode="edit"
          productId={editing}
          categories={catList}
          initialValues={editForm}
          onSuccess={onProductFormSuccess}
          onCancel={() => { setEditing(null); setEditForm(null); setTab('products') }}
        />
      )}

      {tab === 'orders' && (
        orders.length === 0 ? (
          <DashboardEmpty icon={ShoppingBag} title="No orders yet" message="When customers buy your products, orders will show here." />
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <DashboardListItem key={o.id}>
                <p className="font-semibold text-gray-900">{o.orderNumber}</p>
                <p className="text-sm text-gray-500 mt-1">{o.productName} · Qty {o.quantity} · {formatINR(o.totalPrice)}</p>
                <p className="text-xs text-gray-400 mt-1">{formatDate(o.placedAt)} · <span className="text-brand font-medium">{o.status}</span></p>
              </DashboardListItem>
            ))}
          </div>
        )
      )}

      {tab === 'payouts' && (
        <div className="space-y-3">
          {payouts.length === 0 ? <p className="text-gray-500">No payouts yet.</p> : payouts.map((p) => (
            <div key={p.id} className="surface-card p-4 flex justify-between">
              <span className="text-sm">{formatDate(p.createdAt)}</span>
              <span className="font-medium">{formatINR(p.amount)} · {p.status}</span>
            </div>
          ))}
        </div>
      )}

      {tab === 'engagement' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="font-semibold mb-3">Customer Reviews</h2>
            {reviews.length === 0 ? <p className="text-sm text-gray-500">No reviews yet.</p> : reviews.map((r) => (
              <div key={r.id} className="surface-card p-4 mb-3">
                <p className="font-medium text-sm">{r.title || 'Review'} · {r.rating}★</p>
                <p className="text-xs text-gray-500 mt-1">{r.body}</p>
                {r.sellerReply ? <p className="text-xs text-brand mt-2">Replied: {r.sellerReply}</p> : (
                  <div className="mt-2 flex gap-2">
                    <input className="input-field flex-1 text-sm" placeholder="Write a reply" value={replyDrafts[r.id] || ''} onChange={(e) => setReplyDrafts({ ...replyDrafts, [r.id]: e.target.value })} />
                    <button type="button" className="btn-primary text-sm" disabled={!replyDrafts[r.id]?.trim()} onClick={() => sellerApi.replyReview(r.id, replyDrafts[r.id]).then(load)}>Reply</button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div>
            <h2 className="font-semibold mb-3">Product Questions</h2>
            {questions.length === 0 ? <p className="text-sm text-gray-500">No questions yet.</p> : questions.map((q) => (
              <div key={q.id} className="surface-card p-4 mb-3">
                <p className="text-sm">{q.question}</p>
                <div className="mt-2 flex gap-2">
                  <input className="input-field flex-1 text-sm" placeholder="Your answer" value={replyDrafts[q.id] || ''} onChange={(e) => setReplyDrafts({ ...replyDrafts, [q.id]: e.target.value })} />
                  <button type="button" className="btn-primary text-sm" disabled={!replyDrafts[q.id]?.trim()} onClick={() => sellerApi.answerQuestion(q.id, replyDrafts[q.id]).then(load)}>Answer</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Link to="/" className="inline-block mt-8 text-sm text-brand">← Back to store</Link>
      {showBulkUpload && (
        <BulkUploadModal onClose={() => setShowBulkUpload(false)} onDone={() => { setShowBulkUpload(false); load() }} />
      )}
    </div>
  )
}

export default function SellerDashboardPage() {
  return (
    <ProtectedRoute roles={['SELLER', 'ADMIN', 'CUSTOMER']}>
      <SellerDashboardContent />
    </ProtectedRoute>
  )
}
