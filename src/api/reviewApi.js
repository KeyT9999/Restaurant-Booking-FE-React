import axiosInstance from './axiosInstance';

// ─── Customer Review APIs ───
export const createReview = (data) =>
  axiosInstance.post('/reviews', data);

export const getRestaurantReviews = (restaurantId, params = {}) =>
  axiosInstance.get(`/reviews/restaurant/${restaurantId}`, { params });

export const getMyReviews = () =>
  axiosInstance.get('/reviews/my-reviews');

// ─── Owner Review APIs ───
export const replyReview = (id, comment) =>
  axiosInstance.patch(`/reviews/${id}/reply`, { comment });

// ─── Admin Review APIs ───
export const updateReviewStatus = (id, status) =>
  axiosInstance.patch(`/reviews/${id}/status`, { status });

export const adminGetReviews = (params = {}) =>
  axiosInstance.get('/reviews/admin/all', { params });
