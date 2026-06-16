import api from './axiosInstance'

export const reviewApi = {
  list: (productId, page = 0, size = 10) =>
    api.get(`/reviews/product/${productId}`, { params: { page, size } }),
  breakdown: (productId) => api.get(`/reviews/product/${productId}/breakdown`),
  create: (data) => api.post('/reviews', { ...data, body: data.body || data.comment }),
  helpful: (id) => api.post(`/reviews/${id}/helpful`)
}

export const qaApi = {
  list: (productId, page = 0) =>
    api.get(`/product-qa/products/${productId}/questions`, { params: { page } }),
  ask: (productId, question) =>
    api.post(`/product-qa/products/${productId}/questions`, { question }),
  answer: (questionId, answer) =>
    api.post(`/product-qa/questions/${questionId}/answers`, { answer })
}

export const stockAlertApi = {
  subscribe: (productId, variantId, email) =>
    api.post('/stock-alerts', { productId, variantId, email })
}
