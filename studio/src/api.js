const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050'

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong. Please try again.')
  }
  return data
}

export const api = {
  getServices: () => request('/public/services'),
  getGallery: () => request('/public/gallery'),
  getReviews: () => request('/public/reviews'),
  submitReview: (payload) => request('/public/reviews', { method: 'POST', body: JSON.stringify(payload) }),
  createBooking: (payload) => request('/public/bookings', { method: 'POST', body: JSON.stringify(payload) }),
  findBookings: (payload) => request('/public/bookings/find', { method: 'POST', body: JSON.stringify(payload) }),
  rescheduleBooking: (id, payload) =>
    request(`/public/bookings/${id}/reschedule`, { method: 'PATCH', body: JSON.stringify(payload) }),
  cancelBooking: (id, payload) =>
    request(`/public/bookings/${id}/cancel`, { method: 'PATCH', body: JSON.stringify(payload) }),
}

export default api
