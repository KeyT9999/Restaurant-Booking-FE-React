import axiosInstance from './axiosInstance';

export const notificationApi = {
  getNotifications(params = {}) {
    return axiosInstance.get('/notifications', { params });
  },

  getUnreadCount() {
    return axiosInstance.get('/notifications/unread-count');
  },

  createNotification(data) {
    return axiosInstance.post('/notifications', data);
  },

  markAsRead(id) {
    return axiosInstance.patch(`/notifications/${id}/read`);
  },

  markAllAsRead() {
    return axiosInstance.patch('/notifications/read-all');
  },

  deleteNotification(id) {
    return axiosInstance.delete(`/notifications/${id}`);
  },
};
