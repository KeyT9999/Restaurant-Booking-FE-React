import axiosInstance from './axiosInstance';

// ─────────────────────────────────────────────
// Customer Booking APIs
// ─────────────────────────────────────────────

export const createBooking = (data) =>
  axiosInstance.post('/bookings', data);

export const getMyBookings = (params = {}) =>
  axiosInstance.get('/bookings/my', { params });

export const getBookingById = (id) =>
  axiosInstance.get(`/bookings/${id}`);

export const updateBooking = (id, data) =>
  axiosInstance.put(`/bookings/${id}`, data);

export const cancelBooking = (id, reason) =>
  axiosInstance.delete(`/bookings/${id}/cancel`, { data: { reason } });

export const checkAvailability = (data) =>
  axiosInstance.post('/bookings/availability-check', data);

// ─────────────────────────────────────────────
// Owner Booking APIs
// ─────────────────────────────────────────────

export const getRestaurantBookings = (params = {}) =>
  axiosInstance.get('/owner/bookings', { params });

export const getBookingStats = (params = {}) =>
  axiosInstance.get('/owner/bookings/stats', { params });

export const getBookingDetail = (id) =>
  axiosInstance.get(`/owner/bookings/${id}`);

export const confirmBooking = (id) =>
  axiosInstance.put(`/owner/bookings/${id}/confirm`);

export const ownerCancelBooking = (id, reason) =>
  axiosInstance.put(`/owner/bookings/${id}/cancel`, { reason });

export const completeBooking = (id, actualGuestCount) =>
  axiosInstance.put(`/owner/bookings/${id}/complete`, { actualGuestCount });

export const markNoShow = (id) =>
  axiosInstance.put(`/owner/bookings/${id}/no-show`);

export const changeTable = (id, newTableNumbers) =>
  axiosInstance.put(`/owner/bookings/${id}/change-table`, { newTableNumbers });

export const getAvailableTablesForBooking = (id) =>
  axiosInstance.get(`/owner/bookings/${id}/available-tables`);

export const addInternalNote = (id, content) =>
  axiosInstance.post(`/owner/bookings/${id}/internal-notes`, { content });

export const deleteInternalNote = (id) =>
  axiosInstance.delete(`/owner/bookings/${id}/internal-notes`);
