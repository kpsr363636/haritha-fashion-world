import { useEffect, useState } from 'react'
import { Plus, Trash2, Upload, Image as ImageIcon, X, AlertCircle, CheckCircle2 } from 'lucide-react'
import { categoryApi } from '../../api/productApi'
import { sellerApi } from '../../api/adminApi'
import { uploadApi } from '../../api/uploadApi'
import { validateProductForm, validateImageFile } from '../../utils/formValidation'
import { resolveImageUrl } from '../../utils/images'

const EMPTY_VARIANT = { size: '', stockQuantity: '' }

const defaultForm = {
  categoryId: '',
  name: '',
  description: '',
  basePrice: '',
  mrp: '',
  variants: [{ ...EMPTY_VARIANT, size: '', stockQuantity: 10 }]
}

function FieldError({ message }) {
  if (!message) return null
  return <p className="text-xs text-red-600 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3 shrink-0" />{message}</p>
}

function Label({ children, required }) {
  return (
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  )
}

export default function ProductForm({
  mode = 'create',
  productId = null,
  categories = [],
  initialValues = null,
  onSuccess,
  onCancel
}) {
  const [form, setForm] = useState(initialValues || defaultForm)
  const [errors, setErrors] = useState({})
  const [sizeOptions, setSizeOptions] = useState([])
  const [sizeLabel, setSizeLabel] = useState('Size')
  const [pendingImages, setPendingImages] = useState([])
  const [existingImages, setExistingImages] = useState([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    if (initialValues) setForm(initialValues)
  }, [initialValues])

  useEffect(() => {
    if (mode === 'edit' && productId) {
      sellerApi.getProduct(productId).then((r) => {
        setExistingImages(r.data?.images || [])
      }).catch(() => {})
    }
  }, [mode, productId])

  useEffect(() => {
    const catId = form.categoryId
    if (!catId) {
      setSizeOptions([])
      return
    }
    categoryApi.getVariantSizes(catId).then((r) => {
      const d = r.data
      setSizeOptions(d?.sizes || [])
      setSizeLabel(d?.label || 'Size')
    }).catch(() => {
      setSizeOptions(['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size', 'One Size'])
      setSizeLabel('Size')
    })
  }, [form.categoryId])

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const onCategoryChange = (categoryId) => {
    setForm((f) => ({
      ...f,
      categoryId,
      variants: [{ size: '', stockQuantity: 10 }]
    }))
    setErrors({})
  }

  const addVariant = () => {
    setForm((f) => ({ ...f, variants: [...f.variants, { ...EMPTY_VARIANT }] }))
  }

  const removeVariant = (i) => {
    if (form.variants.length <= 1) return
    setForm((f) => ({ ...f, variants: f.variants.filter((_, idx) => idx !== i) }))
  }

  const updateVariant = (i, key, value) => {
    const vs = [...form.variants]
    vs[i] = { ...vs[i], [key]: value }
    setForm((f) => ({ ...f, variants: vs }))
    setErrors((e) => ({ ...e, [`variant_${i}_${key === 'size' ? 'size' : 'stock'}`]: undefined, variants: undefined }))
  }

  const onPickImages = (e) => {
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    const next = []
    for (const file of files) {
      const err = validateImageFile(file)
      if (err) {
        setMessage({ type: 'error', text: err })
        continue
      }
      next.push({ file, preview: URL.createObjectURL(file) })
    }
    setPendingImages((prev) => [...prev, ...next])
  }

  const removePending = (i) => {
    setPendingImages((prev) => {
      const copy = [...prev]
      URL.revokeObjectURL(copy[i].preview)
      copy.splice(i, 1)
      return copy
    })
  }

  const uploadImagesForProduct = async (pid, isFirstPrimary = false) => {
    for (let i = 0; i < pendingImages.length; i++) {
      const { file } = pendingImages[i]
      setUploadProgress(Math.round(((i) / pendingImages.length) * 100))
      const url = await uploadApi.uploadImage(file, (pct) => {
        setUploadProgress(Math.round(((i + pct / 100) / pendingImages.length) * 100))
      })
      await sellerApi.addProductImage(pid, url, isFirstPrimary && i === 0 && existingImages.length === 0)
    }
    setUploadProgress(100)
    pendingImages.forEach((p) => URL.revokeObjectURL(p.preview))
    setPendingImages([])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage(null)
    const validationErrors = validateProductForm(form, { isEdit: mode === 'edit' })
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      setMessage({ type: 'error', text: 'Please fix the highlighted fields below.' })
      return
    }

    setSubmitting(true)
    const skuBase = `${form.name}-${Date.now()}`.replace(/[^a-zA-Z0-9-]/g, '-').slice(0, 30)

    try {
      if (mode === 'create') {
        const payload = {
          categoryId: form.categoryId,
          name: form.name.trim(),
          description: form.description.trim(),
          basePrice: Number(form.basePrice),
          mrp: Number(form.mrp),
          isCodAvailable: true,
          isReturnable: true,
          returnWindowDays: 7,
          variants: form.variants.map((v, i) => ({
            size: v.size.trim(),
            stockQuantity: Number(v.stockQuantity),
            sku: `${skuBase}-${v.size}-${i}`.slice(0, 40)
          }))
        }
        const res = await sellerApi.createProduct(payload)
        const newId = res.data?.id
        if (newId && pendingImages.length > 0) {
          await uploadImagesForProduct(newId, true)
        }
        setMessage({ type: 'success', text: 'Product created as draft. Activate it from the Products tab to publish.' })
        onSuccess?.('create', res.data)
      } else {
        await sellerApi.updateProduct(productId, {
          name: form.name.trim(),
          description: form.description.trim(),
          basePrice: Number(form.basePrice),
          mrp: Number(form.mrp),
          categoryId: form.categoryId || undefined
        })
        for (const v of form.variants) {
          if (v.id) {
            await sellerApi.updateStock(productId, v.id, Number(v.stockQuantity))
          } else {
            await sellerApi.addVariant(productId, {
              size: v.size.trim(),
              stockQuantity: Number(v.stockQuantity),
              sku: `${skuBase}-${v.size}`.slice(0, 40)
            })
          }
        }
        if (pendingImages.length > 0) {
          await uploadImagesForProduct(productId, false)
        }
        setMessage({ type: 'success', text: 'Product updated successfully.' })
        onSuccess?.('edit')
      }
    } catch (err) {
      setMessage({ type: 'error', text: err?.message || 'Something went wrong. Please try again.' })
    } finally {
      setSubmitting(false)
      setUploadProgress(0)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="surface-card max-w-2xl p-6 md:p-8 space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-gray-900">
          {mode === 'create' ? 'Add New Product' : 'Edit Product'}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {mode === 'create'
            ? 'Fill in details below. Products start as drafts until you activate them.'
            : 'Update listing details, stock, and photos.'}
        </p>
      </div>

      {message && (
        <div className={`flex items-start gap-2 text-sm rounded-xl px-4 py-3 border ${
          message.type === 'success'
            ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
            : 'text-red-800 bg-red-50 border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> : <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {mode === 'create' && (
        <div>
          <Label required>Category</Label>
          <select
            className={`input-field ${errors.categoryId ? 'border-red-400 ring-red-100' : ''}`}
            value={form.categoryId}
            onChange={(e) => onCategoryChange(e.target.value)}
          >
            <option value="">Select category…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <FieldError message={errors.categoryId} />
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Label required>Product name</Label>
          <input
            className={`input-field ${errors.name ? 'border-red-400' : ''}`}
            placeholder="e.g. Embroidered Silk Clutch"
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
          />
          <FieldError message={errors.name} />
        </div>
        <div className="sm:col-span-2">
          <Label required>Description</Label>
          <textarea
            className={`input-field min-h-[100px] ${errors.description ? 'border-red-400' : ''}`}
            placeholder="Material, dimensions, care instructions, occasion… (min 20 characters)"
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
          />
          <p className="text-xs text-gray-400 mt-1">{(form.description || '').length} / 20 min characters</p>
          <FieldError message={errors.description} />
        </div>
        <div>
          <Label required>Selling price (₹)</Label>
          <input
            type="number"
            min="1"
            step="0.01"
            className={`input-field ${errors.basePrice ? 'border-red-400' : ''}`}
            value={form.basePrice}
            onChange={(e) => setField('basePrice', e.target.value)}
          />
          <FieldError message={errors.basePrice} />
        </div>
        <div>
          <Label required>MRP (₹)</Label>
          <input
            type="number"
            min="1"
            step="0.01"
            className={`input-field ${errors.mrp ? 'border-red-400' : ''}`}
            value={form.mrp}
            onChange={(e) => setField('mrp', e.target.value)}
          />
          <FieldError message={errors.mrp} />
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">Sizes &amp; inventory</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {form.categoryId
                ? `${sizeLabel} — options from category size guide`
                : 'Select a category first to load relevant sizes'}
            </p>
          </div>
          <button type="button" onClick={addVariant} className="text-sm text-brand flex items-center gap-1 hover:underline">
            <Plus className="w-4 h-4" /> Add size
          </button>
        </div>
        <FieldError message={errors.variants} />
        <div className="space-y-2">
          {form.variants.map((v, i) => (
            <div key={v.id || i} className="flex gap-2 items-start bg-gray-50/80 rounded-xl p-3">
              <div className="flex-1">
                {sizeOptions.length > 0 ? (
                  <select
                    className={`input-field text-sm ${errors[`variant_${i}_size`] ? 'border-red-400' : ''}`}
                    value={v.size}
                    onChange={(e) => updateVariant(i, 'size', e.target.value)}
                  >
                    <option value="">Select {sizeLabel.toLowerCase()}…</option>
                    {sizeOptions.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    className={`input-field text-sm ${errors[`variant_${i}_size`] ? 'border-red-400' : ''}`}
                    placeholder={sizeLabel}
                    value={v.size}
                    onChange={(e) => updateVariant(i, 'size', e.target.value)}
                  />
                )}
                <FieldError message={errors[`variant_${i}_size`]} />
              </div>
              <div className="w-28">
                <input
                  type="number"
                  min="0"
                  className={`input-field text-sm ${errors[`variant_${i}_stock`] ? 'border-red-400' : ''}`}
                  placeholder="Stock"
                  value={v.stockQuantity}
                  onChange={(e) => updateVariant(i, 'stockQuantity', e.target.value)}
                />
                <FieldError message={errors[`variant_${i}_stock`]} />
              </div>
              {form.variants.length > 1 && (
                <button type="button" onClick={() => removeVariant(i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg mt-0.5" aria-label="Remove variant">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6">
        <h3 className="font-semibold text-gray-900 mb-1">Product photos</h3>
        <p className="text-xs text-gray-500 mb-4">JPG, PNG or WebP · max 10 MB each · first image becomes the cover</p>

        {(existingImages.length > 0 || pendingImages.length > 0) && (
          <div className="flex flex-wrap gap-3 mb-4">
            {existingImages.map((img) => (
              <div key={img.id} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                <img src={resolveImageUrl(img.imageUrl)} alt="" className="w-full h-full object-cover" />
                {img.isPrimary && (
                  <span className="absolute bottom-0 inset-x-0 bg-brand/90 text-white text-[10px] text-center py-0.5">Cover</span>
                )}
              </div>
            ))}
            {pendingImages.map((p, i) => (
              <div key={p.preview} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-dashed border-brand/40">
                <img src={p.preview} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removePending(i)} className="absolute top-0.5 right-0.5 bg-black/50 text-white rounded-full p-0.5">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl p-8 cursor-pointer hover:border-brand/40 hover:bg-brand/5 transition-colors">
          <Upload className="w-8 h-8 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Click to upload photos</span>
          <span className="text-xs text-gray-400">or drag and drop</span>
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple className="hidden" onChange={onPickImages} />
        </label>
        {uploadProgress > 0 && submitting && (
          <div className="mt-3">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-brand transition-all" style={{ width: `${uploadProgress}%` }} />
            </div>
            <p className="text-xs text-gray-500 mt-1">Uploading images… {uploadProgress}%</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <button type="submit" className="btn-primary min-w-[160px]" disabled={submitting}>
          {submitting ? (uploadProgress > 0 ? `Uploading ${uploadProgress}%…` : 'Saving…') : mode === 'create' ? 'Create product (draft)' : 'Save changes'}
        </button>
        {mode === 'edit' && onCancel && (
          <button type="button" className="btn-outline" onClick={onCancel} disabled={submitting}>Cancel</button>
        )}
      </div>
    </form>
  )
}

export { defaultForm as productFormDefaults }
