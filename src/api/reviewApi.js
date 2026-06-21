import axiosInstance from './axiosInstance';

// ─── Customer Review APIs ───
export const createReview = (data) =>
  axiosInstance.post('/reviews', data);

export const updateReview = (id, data) =>
  axiosInstance.put(`/reviews/${id}`, data);

export const deleteReview = (id) =>
  axiosInstance.delete(`/reviews/${id}`);

export const getMyReviews = (params = {}) =>
  axiosInstance.get('/reviews/my-reviews', { params });

export const toggleHelpful = (id) =>
  axiosInstance.post(`/reviews/${id}/helpful`);

export const reportReview = (id) =>
  axiosInstance.post(`/reviews/${id}/report`);

// ─── Public Review APIs ───
export const getRestaurantReviews = (restaurantId, params = {}) =>
  axiosInstance.get(`/reviews/restaurant/${restaurantId}`, { params });

export const getRatingSummary = (restaurantId) =>
  axiosInstance.get(`/reviews/restaurant/${restaurantId}/rating-summary`);

// ─── Owner Review APIs ───
// Hỗ trợ cả hai hàm reply để tương thích ngược với các trang Owner cũ và mới
export const replyReview = (id, comment) =>
  axiosInstance.patch(`/reviews/${id}/reply`, { comment });

export const replyToReview = (id, comment) =>
  axiosInstance.patch(`/reviews/${id}/reply`, { comment });

// ─── Admin Review APIs ───
export const updateReviewStatus = (id, status, reason = '') =>
  axiosInstance.patch(`/reviews/${id}/status`, { status, reason });

export const adminGetReviews = (params = {}) =>
  axiosInstance.get('/reviews/admin/all', { params });

// Tương thích ngược với các trang Admin cũ
export const getReportedReviews = (params = {}) =>
  axiosInstance.get('/reviews/admin/all', { params: { ...params, status: 'reported' } });

export const hideReview = (id, reason) =>
  axiosInstance.patch(`/reviews/${id}/status`, { status: 'hidden', reason });

export const restoreReview = (id) =>
  axiosInstance.patch(`/reviews/${id}/status`, { status: 'approved' });
