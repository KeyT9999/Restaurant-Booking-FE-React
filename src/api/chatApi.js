import axiosInstance from './axiosInstance';

export const chatApi = {
  getConversations(params = {}) {
    return axiosInstance.get('/chat/conversations', { params });
  },

  getRestaurantConversations(restaurantId, params = {}) {
    return axiosInstance.get(`/chat/restaurants/${restaurantId}/conversations`, { params });
  },

  createConversation(data) {
    return axiosInstance.post('/chat/conversations', data);
  },

  getMessages(conversationId, params = {}) {
    return axiosInstance.get(`/chat/conversations/${conversationId}/messages`, { params });
  },

  searchMessages(conversationId, params = {}) {
    return axiosInstance.get(`/chat/conversations/${conversationId}/messages/search`, { params });
  },

  sendMessage(data) {
    return axiosInstance.post('/chat/messages', data);
  },

  uploadChatImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    return axiosInstance.post('/chat/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  markConversationRead(conversationId) {
    return axiosInstance.patch(`/chat/conversations/${conversationId}/read`);
  },

  markMessageRead(messageId) {
    return axiosInstance.patch(`/chat/messages/${messageId}/read`);
  },

  toggleMessageReaction(messageId, emoji) {
    return axiosInstance.patch(`/chat/messages/${messageId}/reaction`, { emoji });
  },

  getUnreadCount(params = {}) {
    return axiosInstance.get('/chat/unread-count', { params });
  },
};
