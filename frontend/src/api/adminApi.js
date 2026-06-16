import api from './axiosInstance'

export const adminApi = {
  dashboard: () => api.get('/admin/dashboard'),
  orders: (page = 0, size = 20) => api.get('/admin/orders', { params: { page, size } }),
  deliverOrder: (id) => api.put(`/admin/orders/${id}/deliver`),
  shipOrder: (id) => api.put(`/admin/orders/${id}/ship`),
  users: (page = 0) => api.get('/admin/users', { params: { page } }),
  blockUser: (id) => api.put(`/admin/users/${id}/block`),
  unblockUser: (id) => api.put(`/admin/users/${id}/unblock`),
  updateRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }),
  sellers: (page = 0, status) => api.get('/admin/sellers', { params: { page, status } }),
  approveSeller: (id) => api.put(`/admin/sellers/${id}/approve`),
  rejectSeller: (id) => api.put(`/admin/sellers/${id}/reject`),
  suspendSeller: (id) => api.put(`/admin/sellers/${id}/suspend`),
  products: (page = 0) => api.get('/admin/products', { params: { page } }),
  toggleFeatured: (id, featured) => api.patch(`/admin/products/${id}/featured`, { featured }),
  updateProductStatus: (id, status) => api.patch(`/admin/products/${id}/status`, { status }),
  banners: () => api.get('/admin/banners'),
  createBanner: (data) => api.post('/admin/banners', data),
  deleteBanner: (id) => api.delete(`/admin/banners/${id}`),
  coupons: () => api.get('/admin/coupons'),
  createCoupon: (data) => api.post('/admin/coupons', data),
  deleteCoupon: (id) => api.delete(`/admin/coupons/${id}`),
  supportTickets: (page = 0) => api.get('/admin/support/tickets', { params: { page } }),
  updateTicketStatus: (id, status) => api.put(`/admin/support/tickets/${id}/status`, { status }),
  processReturn: (id, body) => api.put(`/admin/returns/${id}/process`, body),
  returns: (page = 0, status) => api.get('/admin/returns', { params: { page, status } }),
  pendingReviews: (page = 0) => api.get('/admin/reviews/pending', { params: { page } }),
  pendingQuestions: (page = 0) => api.get('/admin/questions/pending', { params: { page } }),
  salesReport: (from, to) => api.get('/admin/reports/sales', { params: { from, to } }),
  approveReview: (id) => api.put(`/admin/reviews/${id}/approve`),
  approveQuestion: (id) => api.put(`/admin/questions/${id}/approve`)
}

export const sellerApi = {
  register: (data) => api.post('/seller/register', data),
  dashboard: () => api.get('/seller/dashboard'),
  products: (page = 0, size = 20, status) => api.get('/seller/products', { params: { page, size, status } }),
  getProduct: (id) => api.get(`/seller/products/${id}`),
  createProduct: (data) => api.post('/seller/products', data),
  updateProduct: (id, data) => api.put(`/seller/products/${id}`, data),
  updateStatus: (id, status) => api.patch(`/seller/products/${id}/status`, { status }),
  deleteProduct: (id) => api.delete(`/seller/products/${id}`),
  addVariant: (productId, data) => api.post(`/seller/products/${productId}/variants`, data),
  updateStock: (productId, variantId, quantity) =>
    api.patch(`/seller/products/${productId}/variants/${variantId}/stock`, { quantity }),
  orders: (page = 0) => api.get('/seller/orders', { params: { page } }),
  payouts: (page = 0) => api.get('/seller/payouts', { params: { page } }),
  replyReview: (reviewId, reply) => api.post(`/seller/reviews/${reviewId}/reply`, { reply }),
  answerQuestion: (questionId, answer) => api.post(`/seller/questions/${questionId}/answers`, { answer })
}
