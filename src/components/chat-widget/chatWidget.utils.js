export const TYPE_LABEL = {
  ADMIN_RESTAURANT: 'Admin',
  CUSTOMER_RESTAURANT: 'Customer',
  ADMIN_USER: 'Admin',
};

const getTimeValue = (conversation) => new Date(
  conversation?.lastMessageAt || conversation?.updatedAt || conversation?.createdAt || 0
).getTime();

export const sortConversations = (items = []) => (
  [...items].sort((a, b) => getTimeValue(b) - getTimeValue(a))
);

export const getConversationTitle = (conversation, role) => {
  if (!conversation) return '';

  if (role === 'admin') {
    return conversation.restaurant?.name
      || conversation.customer?.fullName
      || conversation.customer?.email
      || 'Hộp thư';
  }

  if (role === 'restaurant_owner') {
    if (conversation.type === 'ADMIN_RESTAURANT') return 'BookEat Admin';
    return conversation.customer?.fullName || conversation.customer?.email || 'Khách hàng';
  }

  if (conversation.type === 'ADMIN_USER') return 'BookEat Admin';
  return conversation.restaurant?.name || 'Nhà hàng';
};

export const filterConversations = (items = [], keyword = '', role = '') => {
  const normalizedKeyword = keyword.trim().toLowerCase();
  if (!normalizedKeyword) return items;

  return items.filter((conversation) => [
    getConversationTitle(conversation, role),
    conversation.restaurant?.name,
    conversation.customer?.fullName,
    conversation.customer?.email,
    conversation.admin?.fullName,
    conversation.lastMessagePreview,
  ]
    .filter(Boolean)
    .some((value) => value.toLowerCase().includes(normalizedKeyword)));
};

export const getTotalUnread = (items = []) => items.reduce(
  (sum, conversation) => sum + (Number(conversation.unreadCount) || 0),
  0
);

export const getConversationSubtitle = (conversation, role) => {
  if (!conversation) return '';
  if (role === 'admin') return conversation.type === 'ADMIN_RESTAURANT' ? 'Nha hang' : 'Customer';
  if (role === 'restaurant_owner') return conversation.restaurant?.name || 'Inbox nhà hàng';
  return conversation.restaurant?.name || TYPE_LABEL[conversation.type] || 'BookEat';
};

export const formatChatTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};
