import api from './axiosInstance'

export const supportApi = {
  createTicket: (data) => api.post('/support/tickets', data),
  listTickets: (page = 0) => api.get('/support/tickets', { params: { page } })
}
