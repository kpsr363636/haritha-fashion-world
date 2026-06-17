import api from './axiosInstance'

export const orderApi = {
  place: (data) => api.post('/orders', data),
  list: (page = 0) => api.get('/orders', { params: { page, size: 10 } }),
  get: (id) => api.get(`/orders/${id}`),
  cancel: (id) => api.post(`/orders/${id}/cancel`),
  invoice: (id) => api.get(`/orders/${id}/invoice`, { responseType: 'blob' }),
  initiateReturn: (orderId, itemId, data) => api.post(`/orders/${orderId}/items/${itemId}/return`, data),
  verifyCod: (orderId, otp) => api.post(`/orders/${orderId}/cod-verify`, { otp }),
  tracking: (id) => api.get(`/orders/${id}/tracking`)
}

export const paymentApi = {
  createOrder: (orderId) => api.post('/payments/create-order', { orderId }),
  verify: (data) => api.post('/payments/verify', data)
}

export const addressApi = {
  list: () => api.get('/addresses'),
  create: (data) => api.post('/addresses', data),
  update: (id, data) => api.put(`/addresses/${id}`, data),
  delete: (id) => api.delete(`/addresses/${id}`),
  setDefault: (id) => api.put(`/addresses/${id}/set-default`)
}

export const wishlistApi = {
  get: () => api.get('/wishlist'),
  add: (productId, collectionName) => api.post('/wishlist/items', { productId, collectionName }),
  remove: (productId) => api.delete(`/wishlist/items/${productId}`),
  moveToCart: (productId) => api.post(`/wishlist/items/${productId}/move-to-cart`)
}

export const referralApi = {
  myCode: () => api.get('/referral/my-code')
}
