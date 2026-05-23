import axiosInstance from './axiosInstance';

// ─────────────────────────────────────────────
// Table API — Owner endpoints
// ─────────────────────────────────────────────

export const getTables = (restaurantId, params = {}) =>
  axiosInstance.get(`/owner/restaurants/${restaurantId}/tables`, { params });

export const createTable = (restaurantId, data) =>
  axiosInstance.post(`/owner/restaurants/${restaurantId}/tables`, data);

export const updateTable = (tableId, data) =>
  axiosInstance.put(`/owner/tables/${tableId}`, data);

export const deleteTable = (tableId) =>
  axiosInstance.delete(`/owner/tables/${tableId}`);

export const updateTableStatus = (tableId, status) =>
  axiosInstance.patch(`/owner/tables/${tableId}/status`, { status });

// ─────────────────────────────────────────────
// Table API — Public endpoints
// ─────────────────────────────────────────────

export const getPublicTables = (restaurantId, params = {}) =>
  axiosInstance.get(`/restaurants/${restaurantId}/tables`, { params });
