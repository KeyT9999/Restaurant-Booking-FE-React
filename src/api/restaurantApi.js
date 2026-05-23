import axiosInstance from './axiosInstance';

// ─────────────────────────────────────────────
// Restaurant API — Owner endpoints
// ─────────────────────────────────────────────

/**
 * Tạo nhà hàng mới
 * POST /api/v1/owner/restaurants
 */
export const createRestaurant = (data) => {
  return axiosInstance.post('/owner/restaurants', data);
};

/**
 * Lấy danh sách nhà hàng của owner
 * GET /api/v1/owner/restaurants
 */
export const getMyRestaurants = (params = {}) => {
  return axiosInstance.get('/owner/restaurants', { params });
};
