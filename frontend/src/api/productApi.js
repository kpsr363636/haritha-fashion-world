import api from './axiosInstance'

export const productApi = {
  search: (params) => api.get('/products', { params }),
  featured: () => api.get('/products/featured'),
  newArrivals: () => api.get('/products/new-arrivals'),
  getBySlug: (slug) => api.get(`/products/${slug}`),
  completeTheLook: (id) => api.get(`/products/${id}/complete-the-look`),
  pincodeCheck: (pincode) => api.get(`/products/pincode/${pincode}/serviceability`)
}

export const categoryApi = {
  getTree: () => api.get('/categories'),
  getBySlug: (slug) => api.get(`/categories/${slug}`),
  getSizeGuide: (categoryId) => api.get(`/categories/${categoryId}/size-guide`),
  getVariantSizes: (categoryId) => api.get(`/categories/${categoryId}/variant-sizes`)
}
