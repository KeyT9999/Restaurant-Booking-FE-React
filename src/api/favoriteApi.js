import axiosInstance from './axiosInstance';

// ─── Customer Favorite APIs ───

// Lấy danh sách nhà hàng yêu thích (hỗ trợ phân trang và tìm kiếm q)
export const getMyFavorites = (params) =>
  axiosInstance.get('/customer/favorites', { params });

// Lấy danh sách ID nhà hàng yêu thích để check trạng thái nhanh
export const getFavoriteIds = () =>
  axiosInstance.get('/customer/favorites/ids');

// Thêm nhà hàng vào danh sách yêu thích
export const addFavorite = (restaurantId) =>
  axiosInstance.post('/customer/favorites', { restaurantId });

// Bỏ yêu thích nhà hàng
export const removeFavorite = (restaurantId) =>
  axiosInstance.delete(`/customer/favorites/${restaurantId}`);
