const PLACEHOLDER = '/images/placeholder-product.svg'

/** Resolve image URL from API — supports local /images paths and external URLs. */
export function resolveImageUrl(url) {
  if (!url) return PLACEHOLDER
  if (url.startsWith('/images/') || url.startsWith('http://') || url.startsWith('https://')) return url
  if (url.startsWith('images/')) return `/${url}`
  return url
}

export function imageFallback(e) {
  e.currentTarget.onerror = null
  e.currentTarget.src = PLACEHOLDER
}

export { PLACEHOLDER }
