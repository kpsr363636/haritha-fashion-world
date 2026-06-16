export const trackEvent = (eventName, params = {}) => {
  if (window.gtag) window.gtag('event', eventName, params)
  if (window.fbq) window.fbq('track', eventName, params)
}

export const trackPurchase = (order) => {
  trackEvent('purchase', {
    transaction_id: order.orderNumber,
    value: order.totalAmount,
    currency: 'INR'
  })
}
