export const setSEO = (title, description, image, canonicalUrl) => {
  document.title = title ? `${title} | Haritha Fashion World` : 'Haritha Fashion World'
  const desc = document.querySelector('meta[name="description"]')
  if (desc) desc.content = description || ''
  const ogTitle = document.querySelector('meta[property="og:title"]')
  if (ogTitle) ogTitle.content = title || ''
  const ogDesc = document.querySelector('meta[property="og:description"]')
  if (ogDesc) ogDesc.content = description || ''
  const ogImage = document.querySelector('meta[property="og:image"]')
  if (ogImage && image) ogImage.content = image
  const canonical = document.querySelector('link[rel="canonical"]')
  if (canonical && canonicalUrl) canonical.href = canonicalUrl
}
