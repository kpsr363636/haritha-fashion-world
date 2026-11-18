/** Client-side validation helpers for seller forms */

export function validateProductForm(form, { isEdit = false } = {}) {
  const errors = {}

  if (!form.categoryId && !isEdit) errors.categoryId = 'Please select a category'

  const name = (form.name || '').trim()
  if (!name) errors.name = 'Product name is required'
  else if (name.length < 3) errors.name = 'Name must be at least 3 characters'

  const desc = (form.description || '').trim()
  if (!desc) errors.description = 'Description is required'
  else if (desc.length < 20) errors.description = 'Description must be at least 20 characters'

  const base = Number(form.basePrice)
  const mrp = Number(form.mrp)
  if (!form.basePrice && form.basePrice !== 0) errors.basePrice = 'Selling price is required'
  else if (Number.isNaN(base) || base <= 0) errors.basePrice = 'Enter a valid selling price greater than 0'
  if (!form.mrp && form.mrp !== 0) errors.mrp = 'MRP is required'
  else if (Number.isNaN(mrp) || mrp <= 0) errors.mrp = 'Enter a valid MRP greater than 0'
  else if (!Number.isNaN(base) && mrp < base) errors.mrp = 'MRP must be greater than or equal to selling price'

  const variants = form.variants || []
  if (variants.length === 0) errors.variants = 'Add at least one size variant'
  else {
    variants.forEach((v, i) => {
      if (!v.size?.trim()) errors[`variant_${i}_size`] = 'Select or enter a size'
      const stock = Number(v.stockQuantity)
      if (v.stockQuantity === '' || Number.isNaN(stock) || stock < 0) {
        errors[`variant_${i}_stock`] = 'Stock must be 0 or more'
      }
    })
    const totalStock = variants.reduce((s, v) => s + (Number(v.stockQuantity) || 0), 0)
    if (totalStock === 0) errors.variants = 'At least one variant must have stock greater than 0'
  }

  return errors
}

export function validateImageFile(file) {
  if (!file) return 'No file selected'
  if (!file.type.startsWith('image/')) return 'Only image files (JPG, PNG, WebP) are allowed'
  if (file.size > 10 * 1024 * 1024) return 'Image must be under 10 MB'
  return null
}
