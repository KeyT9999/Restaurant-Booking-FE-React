import axiosInstance from './axiosInstance';

export const createWaitlist = (data) =>
  axiosInstance.post('/waitlists', data);

export const getMyWaitlists = (params = {}) =>
  axiosInstance.get('/waitlists/my', { params });

export const getWaitlistById = (id) =>
  axiosInstance.get(`/waitlists/${id}`);

export const updateWaitlist = (id, data) =>
  axiosInstance.patch(`/waitlists/${id}`, data);

export const cancelWaitlist = (id, reason) =>
  axiosInstance.delete(`/waitlists/${id}/cancel`, { data: { reason } });

export const getOwnerWaitlists = (params = {}) =>
  axiosInstance.get('/owner/waitlists', { params });

export const getOwnerWaitlistStats = (params = {}) =>
  axiosInstance.get('/owner/waitlists/stats', { params });

export const getOwnerWaitlistById = (id) =>
  axiosInstance.get(`/owner/waitlists/${id}`);

export const getAvailableTablesForWaitlist = (id) =>
  axiosInstance.get(`/owner/waitlists/${id}/available-tables`);

export const assignTablesToWaitlist = (id, tableIds) =>
  axiosInstance.put(`/owner/waitlists/${id}/assign-tables`, { tableIds });

export const confirmWaitlist = (id, tableIds, ownerNote = '') =>
  axiosInstance.put(`/owner/waitlists/${id}/confirm`, { tableIds, ownerNote });

export const ownerCancelWaitlist = (id, reason) =>
  axiosInstance.put(`/owner/waitlists/${id}/cancel`, { reason });

export const expireWaitlist = (id, reason) =>
  axiosInstance.put(`/owner/waitlists/${id}/expire`, { reason });

export const updateWaitlistPriority = (id, priorityNumber, reason = '') =>
  axiosInstance.patch(`/owner/waitlists/${id}/priority`, { priorityNumber, reason });

export const addWaitlistInternalNote = (id, content) =>
  axiosInstance.post(`/owner/waitlists/${id}/internal-notes`, { content });

export const deleteWaitlistInternalNote = (id, noteId) =>
  axiosInstance.delete(`/owner/waitlists/${id}/internal-notes/${noteId}`);

export const getAdminWaitlists = (params = {}) =>
  axiosInstance.get('/admin/waitlists', { params });

export const getAdminWaitlistStats = () =>
  axiosInstance.get('/admin/waitlists/stats');

export const getAdminWaitlistById = (id) =>
  axiosInstance.get(`/admin/waitlists/${id}`);

export const updateAdminWaitlistStatus = (id, data) =>
  axiosInstance.patch(`/admin/waitlists/${id}/status`, data);
