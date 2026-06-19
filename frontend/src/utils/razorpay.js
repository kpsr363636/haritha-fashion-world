export const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })

/**
 * Opens Razorpay Checkout.
 * Redirect mode (UPI return) requires the site URL to be whitelisted in Razorpay Dashboard.
 * Set VITE_RAZORPAY_REDIRECT=true only after adding your domain in Razorpay → Website & App Settings.
 */
export const openRazorpayCheckout = async ({
  keyId,
  orderId,
  amount,
  name,
  email,
  mobile,
  callbackPath,
  onSuccess,
  onFailure,
}) => {
  const loaded = await loadRazorpay()
  if (!loaded) {
    onFailure?.({ message: 'Razorpay SDK failed to load' })
    return
  }

  const redirectEnabled = import.meta.env.VITE_RAZORPAY_REDIRECT === 'true'
  const useRedirect = redirectEnabled && Boolean(callbackPath && orderId && !orderId.startsWith('order_dev_'))
  let paymentCompleted = false

  const options = {
    key: keyId,
    currency: 'INR',
    name: 'Haritha Fashion World',
    description: 'Order Payment',
    prefill: { name, email, contact: mobile },
    theme: { color: '#B5476A' },
  }

  if (orderId) {
    options.order_id = orderId
  } else if (amount != null) {
    options.amount = Math.round(Number(amount) * 100)
  }

  if (useRedirect) {
    const siteOrigin = (import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/$/, '')
    options.callback_url = `${siteOrigin}${callbackPath}`
    options.redirect = true
  } else {
    options.handler = (response) => {
      paymentCompleted = true
      Promise.resolve(onSuccess?.(response)).catch((err) => {
        onFailure?.({ message: err?.message || 'Payment verification failed' })
      })
    }
    options.modal = {
      ondismiss: () => {
        if (!paymentCompleted) onFailure?.({ message: 'Payment cancelled' })
      },
    }
  }

  const rzp = new window.Razorpay(options)
  rzp.on('payment.failed', (response) => {
    onFailure?.({ message: response?.error?.description || 'Payment failed' })
  })
  rzp.open()
}
