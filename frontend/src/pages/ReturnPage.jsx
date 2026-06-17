import { useEffect, useState, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Upload, X, ImageIcon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { orderApi } from '../api/orderApi'
import { formatINR, formatDate } from '../utils/formatters'
import { setSEO } from '../utils/seo'
import { uploadApi } from '../api/uploadApi'

export default function ReturnPage() {
  const { isAuthenticated } = useAuth()
  const [searchParams] = useSearchParams()
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [returnType, setReturnType] = useState('RETURN')
  const [reason, setReason] = useState('Size issue')
  const [description, setDescription] = useState('')
  const [photos, setPhotos] = useState([]) // {file, previewUrl, s3Url}
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const photoInputRef = useRef()

  useEffect(() => {
    setSEO('Returns & Exchanges', 'Initiate a return or exchange for your Haritha Fashion World order')
    if (isAuthenticated) {
      orderApi.list().then((r) => {
        const list = (r.data?.content || []).filter((o) => o.status === 'DELIVERED')
        const orderId = searchParams.get('orderId')
        if (orderId) {
          orderApi.get(orderId).then((res) => {
            setSelectedOrder(res.data)
          }).catch(() => {})
        }
      }).catch(() => {})
    }
  }, [isAuthenticated, searchParams])

  const handlePhotoSelect = async (e) => {
    const files = Array.from(e.target.files).slice(0, 4 - photos.length)
    if (!files.length) return
    setUploadingPhotos(true)
    const newPhotos = []
    for (const file of files) {
      const previewUrl = URL.createObjectURL(file)
      try {
        const s3Url = await uploadApi.uploadToS3(file)
        newPhotos.push({ file, previewUrl, s3Url })
      } catch {
        newPhotos.push({ file, previewUrl, s3Url: null })
      }
    }
    setPhotos(p => [...p, ...newPhotos])
    setUploadingPhotos(false)
  }

  const removePhoto = (idx) => setPhotos(p => p.filter((_, i) => i !== idx))

  const submitReturn = async (e) => {
    e.preventDefault()
    if (!selectedOrder || !selectedItem) return
    setSubmitting(true)
    try {
      const imageUrls = photos.filter(p => p.s3Url).map(p => p.s3Url)
      await orderApi.initiateReturn(selectedOrder.id, selectedItem.id, {
        returnType,
        reason,
        description,
        images: imageUrls
      })
      setSuccess(true)
    } catch (err) {
      alert(err.message || 'Return request failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-20">
        <Link to="/login" className="btn-primary">Login to request a return</Link>
      </div>
    )
  }

  if (success) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-green-600 mb-4">Return Request Submitted</h1>
        <p className="text-gray-600 mb-6">We will review your request and contact you within 24 hours.</p>
        <Link to="/orders" className="btn-primary">View Orders</Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Returns & Exchanges</h1>
      <p className="text-sm text-gray-500 mb-4">Only delivered orders within the return window are eligible.</p>

      <form onSubmit={submitReturn} className="space-y-4 border rounded-xl p-6">
        <div>
          <label className="block text-sm font-medium mb-1">Select order</label>
          <select
            className="input-field"
            value={selectedOrder?.id || ''}
            onChange={(e) => {
              const id = e.target.value
              if (!id) { setSelectedOrder(null); setSelectedItem(null); return }
              orderApi.get(id).then((r) => { setSelectedOrder(r.data); setSelectedItem(null) }).catch(() => setSelectedOrder(null))
            }}
            required
          >
            <option value="">Choose an order</option>
            {orders.map((o) => (
              <option key={o.id} value={o.id}>{o.orderNumber} — {formatDate(o.placedAt)} — {formatINR(o.totalAmount)} ({o.status})</option>
            ))}
          </select>
        </div>

        {selectedOrder?.items?.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-1">Select item</label>
            <select className="input-field" value={selectedItem?.id || ''} onChange={(e) => setSelectedItem(selectedOrder.items.find((i) => i.id === e.target.value) || null)} required>
              <option value="">Choose an item</option>
              {selectedOrder.items.map((item) => (
                <option key={item.id} value={item.id}>{item.productName} × {item.quantity}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Type</label>
          <select className="input-field" value={returnType} onChange={(e) => setReturnType(e.target.value)}>
            <option value="RETURN">Return for refund</option>
            <option value="EXCHANGE">Exchange</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Reason</label>
          <select className="input-field" value={reason} onChange={(e) => setReason(e.target.value)}>
            <option>Size issue</option>
            <option>Wrong item received</option>
            <option>Quality not as expected</option>
            <option>Changed my mind</option>
            <option>Damaged product</option>
          </select>
        </div>

        <textarea className="input-field h-24" placeholder="Additional details (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />

        {/* Photo upload */}
        <div>
          <label className="block text-sm font-medium mb-2 flex items-center gap-1">
            <ImageIcon size={14} /> Photos (up to 4) — helps speed up your return
          </label>
          <div className="flex flex-wrap gap-2">
            {photos.map((p, i) => (
              <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200">
                <img src={p.previewUrl} alt="" className="w-full h-full object-cover" />
                {!p.s3Url && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-white text-xs">Uploading...</span>
                  </div>
                )}
                <button type="button" onClick={() => removePhoto(i)}
                  className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center">
                  <X size={10} />
                </button>
              </div>
            ))}
            {photos.length < 4 && (
              <button type="button" onClick={() => photoInputRef.current?.click()}
                disabled={uploadingPhotos}
                className="w-20 h-20 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-brand hover:text-brand transition-colors text-xs gap-1">
                <Upload size={18} />
                <span>Add photo</span>
              </button>
            )}
          </div>
          <input ref={photoInputRef} type="file" accept="image/*" multiple className="hidden"
            onChange={handlePhotoSelect} />
        </div>

        <button type="submit" disabled={submitting || !selectedItem || uploadingPhotos} className="btn-primary w-full">
          {submitting ? 'Submitting...' : uploadingPhotos ? 'Uploading photos...' : 'Submit Request'}
        </button>
      </form>
    </div>
  )
}
