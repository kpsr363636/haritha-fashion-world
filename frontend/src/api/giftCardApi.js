import api from './axiosInstance'

export const giftCardApi = {
  balance: (code) => api.get(`/gift-cards/${code}/balance`),
  purchase: (amount) => api.post('/gift-cards', { amount }),
  mine: () => api.get('/gift-cards/mine')
}

export const couponApi = {
  apply: (code, orderAmount) => api.post('/coupons/apply', { code, orderAmount })
}
