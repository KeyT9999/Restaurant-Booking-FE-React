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

export const getOwnerRestaurant = (restaurantId) => {
  return axiosInstance.get(`/owner/restaurants/${restaurantId}`);
};

export const getOwnerRestaurantDashboard = (restaurantId) => {
  return axiosInstance.get(`/owner/restaurants/${restaurantId}/dashboard`);
};

export const updateRestaurant = (restaurantId, data) => {
  return axiosInstance.put(`/owner/restaurants/${restaurantId}`, data);
};

// ─────────────────────────────────────────────
// Restaurant API — Public endpoints
// ─────────────────────────────────────────────

/**
 * Lấy danh sách nhà hàng công khai (đã duyệt, đang active)
 * GET /api/v1/restaurants
 */
export const getPublicRestaurants = (params = {}) => {
  return axiosInstance.get('/restaurants', { params });
};

/**
 * Lấy danh sách các loại hình ẩm thực
 * GET /api/v1/restaurants/cuisine-types
 */
export const getPublicCuisineTypes = () => {
  return axiosInstance.get('/restaurants/cuisine-types');
};

/**
 * Lấy chi tiết nhà hàng công khai
 * GET /api/v1/restaurants/:id
 */
export const getPublicRestaurantDetail = (restaurantId) => {
  return axiosInstance.get(`/restaurants/${restaurantId}`);
};

