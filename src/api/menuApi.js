import axiosInstance from './axiosInstance';

// ─────────────────────────────────────────────
// Menu API — Owner endpoints
// ─────────────────────────────────────────────

// ─── Menu Items ───
export const getMenuItems = (restaurantId, params = {}) =>
  axiosInstance.get(`/owner/restaurants/${restaurantId}/menu-items`, { params });

export const createMenuItem = (restaurantId, data) =>
  axiosInstance.post(`/owner/restaurants/${restaurantId}/menu-items`, data);

export const updateMenuItem = (itemId, data) =>
  axiosInstance.put(`/owner/menu-items/${itemId}`, data);

export const deleteMenuItem = (itemId) =>
  axiosInstance.delete(`/owner/menu-items/${itemId}`);

export const toggleMenuItemAvailability = (itemId, isAvailable) =>
  axiosInstance.patch(`/owner/menu-items/${itemId}/availability`, { isAvailable });

// ─── Menu Categories ───
export const getMenuCategories = (restaurantId) =>
  axiosInstance.get(`/owner/restaurants/${restaurantId}/menu-categories`);

export const createMenuCategory = (restaurantId, data) =>
  axiosInstance.post(`/owner/restaurants/${restaurantId}/menu-categories`, data);

export const updateMenuCategory = (categoryId, data) =>
  axiosInstance.put(`/owner/menu-categories/${categoryId}`, data);

export const deleteMenuCategory = (categoryId) =>
  axiosInstance.delete(`/owner/menu-categories/${categoryId}`);

// ─────────────────────────────────────────────
// Menu API — Public endpoints
// ─────────────────────────────────────────────

export const getPublicMenu = (restaurantId, params = {}) =>
  axiosInstance.get(`/restaurants/${restaurantId}/menu`, { params });

export const getPublicMenuCategories = (restaurantId) =>
  axiosInstance.get(`/restaurants/${restaurantId}/menu-categories`);
