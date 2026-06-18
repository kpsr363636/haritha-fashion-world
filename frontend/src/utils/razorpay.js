export const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })

export const openRazorpayCheckout = async ({ keyId, orderId, amount, name, email, mobile, onSuccess, onFailure }) => {
  const loaded = await loadRazorpay()
  if (!loaded) { onFailure?.({ message: 'Razorpay SDK failed to load' }); return }
  let paymentCompleted = false
  const options = {
    key: keyId,
    amount: amount * 100,
    currency: 'INR',
    name: 'Haritha Fashion World',
    description: 'Order Payment',
    order_id: orderId,
    prefill: { name, email, contact: mobile },
    theme: { color: '#B5476A' },
    handler: (response) => {
      paymentCompleted = true
      onSuccess?.(response)
    },
    modal: {
      ondismiss: () => {
        if (!paymentCompleted) onFailure?.({ message: 'Payment cancelled' })
      }
    }
  }
  new window.Razorpay(options).open()
}
