import axiosInstance from './axiosInstance';

// ────────────────────────────────────────────────────────
// Admin API — Gọi các endpoint /api/v1/admin/*
// ────────────────────────────────────────────────────────

export const adminApi = {
  // ─── Dashboard ───
  async getDashboard() {
    return axiosInstance.get('/admin/dashboard');
  },

  // ─── Users CRUD ───
  async getUsers({ page = 1, limit = 20, search = '', role = '', status = '' } = {}) {
    const params = new URLSearchParams();
    params.set('page', page);
    params.set('limit', limit);
    if (search) params.set('search', search);
    if (role)   params.set('role', role);
    if (status) params.set('status', status);
    return axiosInstance.get(`/admin/users?${params.toString()}`);
  },

  async getUserById(id) {
    return axiosInstance.get(`/admin/users/${id}`);
  },

  async createUser(data) {
    return axiosInstance.post('/admin/users', data);
  },

  async updateUser(id, data) {
    return axiosInstance.put(`/admin/users/${id}`, data);
  },

  async toggleUserStatus(id, active) {
    return axiosInstance.patch(`/admin/users/${id}/status`, { active });
  },

  async deleteUser(id) {
    return axiosInstance.delete(`/admin/users/${id}`);
  },

  async resetUserPassword(id, newPassword) {
    return axiosInstance.patch(`/admin/users/${id}/password`, { newPassword });
  },

  // ─── Setup ───
  async setupAdmin(data) {
    return axiosInstance.post('/admin/setup', data);
  },

  // ─── Restaurants Management ───
  async getRestaurants({ page = 1, limit = 20, search = '', approvalStatus = '' } = {}) {
    const params = new URLSearchParams();
    params.set('page', page);
    params.set('limit', limit);
    if (search) params.set('search', search);
    if (approvalStatus) params.set('approvalStatus', approvalStatus);
    return axiosInstance.get(`/admin/restaurants?${params.toString()}`);
  },

  async getRestaurantById(id) {
    return axiosInstance.get(`/admin/restaurants/${id}`);
  },

  async approveRestaurant(id, commissionRate) {
    return axiosInstance.put(`/admin/restaurants/${id}/approve`, { commissionRate });
  },

  async rejectRestaurant(id, reason) {
    return axiosInstance.put(`/admin/restaurants/${id}/reject`, { reason });
  },

  async suspendRestaurant(id, reason) {
    return axiosInstance.put(`/admin/restaurants/${id}/suspend`, { reason });
  },

  // ─── Bookings Management ───
  async getBookings({ page = 1, limit = 20, search = '', status = '', fromDate = '', toDate = '' } = {}) {
    const params = new URLSearchParams();
    params.set('page', page);
    params.set('limit', limit);
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    if (fromDate) params.set('fromDate', fromDate);
    if (toDate) params.set('toDate', toDate);
    return axiosInstance.get(`/admin/bookings?${params.toString()}`);
  },

  async getBookingById(id) {
    return axiosInstance.get(`/admin/bookings/${id}`);
  },

  async updateBookingStatus(id, data) {
    return axiosInstance.patch(`/admin/bookings/${id}/status`, data);
  },
};
