import axiosInstance from './axiosInstance';

// ─────────────────────────────────────────────
// Customer Review APIs
// ─────────────────────────────────────────────

export const createReview = (data) =>
  axiosInstance.post('/reviews', data);

export const updateReview = (id, data) =>
  axiosInstance.put(`/reviews/${id}`, data);

export const deleteReview = (id) =>
  axiosInstance.delete(`/reviews/${id}`);

export const getMyReviews = (params = {}) =>
  axiosInstance.get('/reviews/my', { params });

export const toggleHelpful = (id) =>
  axiosInstance.post(`/reviews/${id}/helpful`);

export const reportReview = (id) =>
  axiosInstance.post(`/reviews/${id}/report`);

// ─────────────────────────────────────────────
// Public Review APIs
// ─────────────────────────────────────────────

export const getRestaurantReviews = (restaurantId, params = {}) =>
  axiosInstance.get(`/restaurants/${restaurantId}/reviews`, { params });

export const getRatingSummary = (restaurantId) =>
  axiosInstance.get(`/restaurants/${restaurantId}/rating-summary`);

// ─────────────────────────────────────────────
// Owner Review APIs
// ─────────────────────────────────────────────

export const getOwnerReviews = (params = {}) =>
  axiosInstance.get('/owner/reviews', { params });

export const replyToReview = (id, content) =>
  axiosInstance.post(`/owner/reviews/${id}/reply`, { content });

// ─────────────────────────────────────────────
// Admin Review APIs
// ─────────────────────────────────────────────

export const getReportedReviews = (params = {}) =>
  axiosInstance.get('/admin/reviews/reported', { params });

export const hideReview = (id, reason) =>
  axiosInstance.put(`/admin/reviews/${id}/hide`, { reason });

export const restoreReview = (id) =>
  axiosInstance.put(`/admin/reviews/${id}/restore`);
