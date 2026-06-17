import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { sellerApi } from '../../api/adminApi'
import { categoryApi } from '../../api/productApi'
import { uploadApi } from '../../api/uploadApi'
import ProtectedRoute from '../../components/common/ProtectedRoute'
import BulkUploadModal from '../../components/seller/BulkUploadModal'
import { useAuth } from '../../context/AuthContext'
import { formatINR, formatDate } from '../../utils/formatters'
import { Upload, Image } from 'lucide-react'

function SellerRegisterForm({ onDone }) {
  const { login, user, token } = useAuth()
  const [form, setForm] = useState({ businessName: '', gstNumber: '', bankAccountNumber: '', ifscCode: '', panNumber: '' })
  const [done, setDone] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    await sellerApi.register(form)
    login({ token, user: { ...user, role: 'SELLER' } })
    setDone(true)
    onDone?.()
  }

  if (done) return <p className="text-brand">Application submitted. Admin will review your seller account. You can now access the seller dashboard.</p>

  return (
    <form onSubmit={submit} className="grid sm:grid-cols-2 gap-3 max-w-2xl">
      <input className="input-field sm:col-span-2" placeholder="Business name" required value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} />
      <input className="input-field" placeholder="GST number" value={form.gstNumber} onChange={(e) => setForm({ ...form, gstNumber: e.target.value })} />
      <input className="input-field" placeholder="PAN" value={form.panNumber} onChange={(e) => setForm({ ...form, panNumber: e.target.value })} />
      <input className="input-field" placeholder="Bank account" value={form.bankAccountNumber} onChange={(e) => setForm({ ...form, bankAccountNumber: e.target.value })} />
      <input className="input-field" placeholder="IFSC" value={form.ifscCode} onChange={(e) => setForm({ ...form, ifscCode: e.target.value })} />
      <button type="submit" className="btn-primary sm:col-span-2">Apply as Seller</button>
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
  const [productForm, setProductForm] = useState({
    categoryId: '', name: '', description: '', basePrice: '', mrp: '', variants: [{ size: 'M', stockQuantity: 10 }]
  })
  const [showBulkUpload, setShowBulkUpload] = useState(false)
  const [uploadingImages, setUploadingImages] = useState({})
  const [uploadProgress, setUploadProgress] = useState({})

  const load = () => {
    sellerApi.dashboard().then((r) => setStats(r.data)).catch(() => {})
    sellerApi.products().then((r) => setProducts(r.data?.content || [])).catch(() => {})
    sellerApi.orders().then((r) => setOrders(r.data?.content || [])).catch(() => {})
    sellerApi.payouts().then((r) => setPayouts(r.data?.content || [])).catch(() => {})
    categoryApi.getTree().then((r) => setCategories(r.data || [])).catch(() => {})
  }

  useEffect(() => { if (user?.role === 'SELLER' || user?.role === 'ADMIN') load() }, [user?.role])

  const flatCategories = (nodes, out = []) => {
    nodes.forEach((n) => { out.push(n); if (n.children) flatCategories(n.children, out) })
    return out
  }

  const createProduct = async (e) => {
    e.preventDefault()
    const payload = {
      categoryId: productForm.categoryId,
      name: productForm.name,
      description: productForm.description,
      basePrice: Number(productForm.basePrice),
      mrp: Number(productForm.mrp),
      isCodAvailable: true,
      isReturnable: true,
      returnWindowDays: 7,
      variants: productForm.variants.map((v) => ({ size: v.size, stockQuantity: Number(v.stockQuantity), sku: `${productForm.name}-${v.size}`.slice(0, 40) }))
    }
    await sellerApi.createProduct(payload)
    setProductForm({ categoryId: '', name: '', description: '', basePrice: '', mrp: '', variants: [{ size: 'M', stockQuantity: 10 }] })
    load()
    setTab('products')
  }

  const startEdit = async (id) => {
    const res = await sellerApi.getProduct(id)
    const p = res.data
    setEditing(id)
    setProductForm({
      categoryId: p.category?.id || '',
      name: p.name,
      description: p.description || '',
      basePrice: p.basePrice,
      mrp: p.mrp,
      variants: p.variants?.length ? p.variants.map((v) => ({ id: v.id, size: v.size, stockQuantity: v.stockQuantity })) : [{ size: 'M', stockQuantity: 10 }]
    })
    setTab('edit-product')
  }

  const updateProduct = async (e) => {
    e.preventDefault()
    await sellerApi.updateProduct(editing, {
      name: productForm.name,
      description: productForm.description,
      basePrice: Number(productForm.basePrice),
      mrp: Number(productForm.mrp)
    })
    for (const v of productForm.variants) {
      if (v.id) await sellerApi.updateStock(editing, v.id, Number(v.stockQuantity))
      else await sellerApi.addVariant(editing, { size: v.size, stockQuantity: Number(v.stockQuantity), sku: `${productForm.name}-${v.size}`.slice(0, 40) })
    }
    setEditing(null)
    load()
    setTab('products')
  }

  if (user?.role === 'CUSTOMER') {
    return (
      <div className="page-shell max-w-2xl">
        <div className="surface-card p-8 md:p-10">
          <p className="text-xs uppercase tracking-[0.15em] text-brand font-medium mb-2">Partner with us</p>
          <h1 className="page-title mb-2">Become a Seller</h1>
          <p className="page-subtitle mb-8">Start selling sarees, ethnic wear and more on Haritha Fashion.</p>
          <SellerRegisterForm onDone={() => window.location.reload()} />
        </div>
      </div>
    )
  }

  const handleImageUpload = async (productId, e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadingImages((prev) => ({ ...prev, [productId]: true }))
    try {
      const url = await uploadApi.uploadToS3(file, (pct) =>
        setUploadProgress((prev) => ({ ...prev, [productId]: pct }))
      )
      await sellerApi.addProductImage?.(productId, url)
      load()
    } catch (err) {
      alert('Image upload failed: ' + (err.message || 'Unknown error'))
    } finally {
      setUploadingImages((prev) => ({ ...prev, [productId]: false }))
      setUploadProgress((prev) => ({ ...prev, [productId]: 0 }))
    }
  }

  const tabs = ['overview', 'products', 'add-product', ...(editing ? ['edit-product'] : []), 'orders', 'payouts']

  return (
    <div className="page-shell">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.15em] text-brand font-medium mb-1">Seller Hub</p>
        <h1 className="page-title">Seller Dashboard</h1>
        <p className="page-subtitle">Manage your boutique on Haritha Fashion</p>
      </div>
      <div className="flex flex-wrap gap-2 mb-8">
        {tabs.map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} className={tab === t ? 'tab-pill-active capitalize' : 'tab-pill-inactive capitalize'}>{t.replace('-', ' ')}</button>
        ))}
      </div>

      {tab === 'overview' && stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
          {[
            { label: 'Sales', value: formatINR(stats.totalSales || 0) },
            { label: 'Orders', value: stats.orderCount },
            { label: 'Products', value: stats.productCount },
            { label: 'Pending Payout', value: formatINR(stats.pendingPayout || 0) }
          ].map((k) => (
            <div key={k.label} className="stat-card">
              <p className="text-sm text-gray-500 relative z-10">{k.label}</p>
              <p className="text-xl md:text-2xl font-bold relative z-10 mt-1">{k.value ?? '—'}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'products' && (
        <div className="space-y-3">
          <div className="flex gap-3 mb-4">
            <button type="button" onClick={() => setShowBulkUpload(true)}
              className="flex items-center gap-2 px-4 py-2 border border-brand text-brand rounded-xl text-sm hover:bg-brand/5">
              <Upload className="w-4 h-4" /> Bulk Upload
            </button>
          </div>
          {products.map((p) => (
            <div key={p.id} className="surface-card p-4 md:p-5">
              <div className="flex justify-between items-center gap-2">
                <div className="flex items-center gap-3">
                  {p.images?.[0]?.imageUrl ? (
                    <img src={p.images[0].imageUrl} alt={p.name} className="w-12 h-12 rounded-xl object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                      <Image className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-sm text-gray-500">{p.status} · {formatINR(p.finalPrice || p.basePrice)}</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap items-center">
                  <label className="cursor-pointer text-sm text-indigo-600 hover:underline flex items-center gap-1">
                    <Image className="w-3.5 h-3.5" />
                    {uploadingImages[p.id] ? `${uploadProgress[p.id] || 0}%` : 'Add image'}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(p.id, e)} />
                  </label>
                  <button type="button" className="text-sm text-brand" onClick={() => startEdit(p.id)}>Edit</button>
                  <button type="button" className="text-sm text-brand" onClick={() => sellerApi.updateStatus(p.id, p.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE').then(load)}>
                    {p.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                  </button>
                  <button type="button" className="text-sm text-red-500" onClick={() => sellerApi.deleteProduct(p.id).then(load)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'add-product' && (
        <form onSubmit={createProduct} className="surface-card max-w-xl p-6 md:p-8 space-y-3">
          <select className="input-field" required value={productForm.categoryId} onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}>
            <option value="">Category</option>
            {flatCategories(categories).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input className="input-field" placeholder="Product name" required value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} />
          <textarea className="input-field" placeholder="Description" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} />
          <input className="input-field" type="number" placeholder="Selling price" required value={productForm.basePrice} onChange={(e) => setProductForm({ ...productForm, basePrice: e.target.value })} />
          <input className="input-field" type="number" placeholder="MRP" required value={productForm.mrp} onChange={(e) => setProductForm({ ...productForm, mrp: e.target.value })} />
          <button type="submit" className="btn-primary">Create Product (Draft — activate to publish)</button>
        </form>
      )}

      {tab === 'edit-product' && editing && (
        <form onSubmit={updateProduct} className="surface-card max-w-xl p-6 md:p-8 space-y-3">
          <input className="input-field" placeholder="Product name" required value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} />
          <textarea className="input-field" placeholder="Description" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} />
          <input className="input-field" type="number" placeholder="Selling price" required value={productForm.basePrice} onChange={(e) => setProductForm({ ...productForm, basePrice: e.target.value })} />
          <input className="input-field" type="number" placeholder="MRP" required value={productForm.mrp} onChange={(e) => setProductForm({ ...productForm, mrp: e.target.value })} />
          <p className="text-sm font-medium">Variants / stock</p>
          {productForm.variants.map((v, i) => (
            <div key={i} className="flex gap-2">
              <input className="input-field flex-1" placeholder="Size" value={v.size} onChange={(e) => { const vs = [...productForm.variants]; vs[i] = { ...vs[i], size: e.target.value }; setProductForm({ ...productForm, variants: vs }) }} />
              <input className="input-field w-24" type="number" placeholder="Stock" value={v.stockQuantity} onChange={(e) => { const vs = [...productForm.variants]; vs[i] = { ...vs[i], stockQuantity: e.target.value }; setProductForm({ ...productForm, variants: vs }) }} />
            </div>
          ))}
          <button type="submit" className="btn-primary">Save Changes</button>
        </form>
      )}

      {tab === 'orders' && (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="surface-card p-4 md:p-5">
              <p className="font-medium">{o.orderNumber}</p>
              <p className="text-sm text-gray-500">{o.productName} · Qty {o.quantity} · {formatINR(o.totalPrice)}</p>
              <p className="text-xs text-gray-400">{formatDate(o.placedAt)} · {o.status}</p>
            </div>
          ))}
        </div>
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
