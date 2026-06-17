/** Send an event to GA4 and Meta Pixel */
export const trackEvent = (eventName, params = {}) => {
  if (typeof window === 'undefined') return
  if (window.gtag) window.gtag('event', eventName, params)
  // Map GA4 event names to Meta Standard Events where applicable
  const metaEventMap = {
    purchase: 'Purchase',
    add_to_cart: 'AddToCart',
    view_item: 'ViewContent',
    begin_checkout: 'InitiateCheckout',
    sign_up: 'CompleteRegistration',
    login: 'Lead',
    search: 'Search',
    add_to_wishlist: 'AddToWishlist'
  }
  const metaEvent = metaEventMap[eventName] || eventName
  if (window.fbq) window.fbq('track', metaEvent, params)
}

export const trackPageView = (path) => {
  if (window.gtag) window.gtag('event', 'page_view', { page_path: path })
  if (window.fbq) window.fbq('track', 'PageView')
}

export const trackPurchase = (order) => {
  const payload = {
    transaction_id: order.orderNumber,
    value: Number(order.totalAmount),
    currency: 'INR',
    items: (order.items || []).map((i) => ({
      item_id: i.productId,
      item_name: i.productName,
      quantity: i.quantity,
      price: Number(i.unitPrice)
    }))
  }
  if (window.gtag) window.gtag('event', 'purchase', payload)
  if (window.fbq) window.fbq('track', 'Purchase', { value: payload.value, currency: 'INR', content_ids: payload.items.map((i) => i.item_id) })
}

export const trackViewItem = (product) => {
  if (window.gtag) window.gtag('event', 'view_item', {
    currency: 'INR',
    value: Number(product.finalPrice || product.basePrice),
    items: [{ item_id: product.id, item_name: product.name, price: Number(product.finalPrice || product.basePrice) }]
  })
  if (window.fbq) window.fbq('track', 'ViewContent', { content_ids: [product.id], content_type: 'product', value: Number(product.finalPrice || product.basePrice), currency: 'INR' })
}
