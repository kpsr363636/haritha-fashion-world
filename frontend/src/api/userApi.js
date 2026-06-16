import api from './axiosInstance'

export const userApi = {
  getNotificationPreferences: () => api.get('/users/me/notification-preferences'),
  updateNotificationPreferences: (data) => api.put('/users/me/notification-preferences', data)
}

export const loyaltyApi = {
  summary: () => api.get('/loyalty/summary'),
  transactions: (page = 0) => api.get('/loyalty/transactions', { params: { page } })
}
