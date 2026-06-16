import api from './axiosInstance'

export const discoveryApi = {
  banners: (position = 'HOME_HERO') => api.get('/banners', { params: { position } }),
  recentlyViewed: () => api.get('/recently-viewed')
}

export const searchApi = {
  search: (q, page = 0) => api.get('/search', { params: { q, page } }),
  suggestions: (q) => api.get('/search/suggestions', { params: { q } })
}
