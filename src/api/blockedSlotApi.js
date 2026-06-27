import axiosInstance from './axiosInstance';

// ─────────────────────────────────────────────
// Blocked Slots API — Owner endpoints
// ─────────────────────────────────────────────

export const getBlockedSlots = (restaurantId) =>
  axiosInstance.get(`/owner/restaurants/${restaurantId}/blocked-slots`);

export const createBlockedSlot = (restaurantId, data) =>
  axiosInstance.post(`/owner/restaurants/${restaurantId}/blocked-slots`, data);

export const deleteBlockedSlot = (restaurantId, id) =>
  axiosInstance.delete(`/owner/restaurants/${restaurantId}/blocked-slots/${id}`);
