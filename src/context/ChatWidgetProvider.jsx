import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { adminApi } from '../api/adminApi';
import { chatApi } from '../api/chatApi';
import { getMyRestaurants } from '../api/restaurantApi';
import { useAuth } from './useAuth';
import { useChatSocket } from '../hooks/useChatSocket';
import ChatWidgetContext from './ChatWidgetContext';
import {
  filterConversations,
  getTotalUnread,
  sortConversations,
} from '../components/chat-widget/chatWidget.utils';
import { getMessageType } from '../components/chat-widget/chatImage.utils';
import { mergeReactionUpdate } from '../components/chat-widget/chatReaction.utils';

const OPEN_STORAGE_KEY = 'bookeat_mini_chat_open';
const CONVERSATION_STORAGE_KEY = 'bookeat_mini_chat_conversation_id';
const RESTAURANT_STORAGE_KEY = 'bookeat_mini_chat_restaurant_id';

const getStoredBoolean = (key) => localStorage.getItem(key) === 'true';

export function ChatWidgetProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const role = user?.role || '';
  const [isOpen, setIsOpen] = useState(() => getStoredBoolean(OPEN_STORAGE_KEY));
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeView, setActiveView] = useState('conversationList');
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(() => localStorage.getItem(CONVERSATION_STORAGE_KEY));
  const [messages, setMessages] = useState([]);
  const [inputDraft, setInputDraft] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [ownerRestaurants, setOwnerRestaurants] = useState([]);
  const [adminRestaurants, setAdminRestaurants] = useState([]);
  const [selectedRestaurantId, setSelectedRestaurantIdState] = useState(() => localStorage.getItem(RESTAURANT_STORAGE_KEY));
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadByRestaurant, setUnreadByRestaurant] = useState({});
  const [typingUsers, setTypingUsers] = useState({});
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedConversationId) || null,
    [conversations, selectedConversationId]
  );

  const filteredConversations = useMemo(
    () => filterConversations(conversations, searchKeyword, role),
    [conversations, role, searchKeyword]
  );

  const upsertConversation = useCallback((conversation) => {
    if (!conversation?.id) return;
    setConversations((current) => {
      const exists = current.some((item) => item.id === conversation.id);
      const next = exists
        ? current.map((item) => (item.id === conversation.id ? { ...item, ...conversation } : item))
        : [conversation, ...current];
      return sortConversations(next);
    });
  }, []);

  const refreshUnreadCount = useCallback(async (restaurantList = []) => {
    if (!isAuthenticated) return;

    try {
      const response = await chatApi.getUnreadCount();
      const total = response.data?.total ?? response.data?.unreadCount ?? 0;
      setUnreadCount(total);

      if (role !== 'restaurant_owner' || restaurantList.length === 0) {
        setUnreadByRestaurant({});
        return;
      }

      const counts = await Promise.all(
        restaurantList.map(async (restaurant) => {
          try {
            const item = await chatApi.getUnreadCount({ restaurantId: restaurant.id });
            return [restaurant.id, item.data?.total ?? item.data?.unreadCount ?? 0];
          } catch {
            return [restaurant.id, 0];
          }
        })
      );
      setUnreadByRestaurant(Object.fromEntries(counts));
    } catch {
      setUnreadCount(getTotalUnread(conversations));
    }
  }, [conversations, isAuthenticated, role]);

  const loadConversations = useCallback(async () => {
    if (!isAuthenticated) {
      setConversations([]);
      return;
    }

    if (role === 'restaurant_owner' && !selectedRestaurantId) {
      setConversations([]);
      setSelectedConversationId(null);
      return;
    }

    try {
      setLoadingConversations(true);
      setError(null);
      const params = {};
      if (searchKeyword.trim()) params.search = searchKeyword.trim();

      const response = role === 'restaurant_owner'
        ? await chatApi.getRestaurantConversations(selectedRestaurantId, params)
        : await chatApi.getConversations(params);

      const list = sortConversations(response.data?.conversations || []);
      setConversations(list);
      setSelectedConversationId((current) => (
        list.some((conversation) => conversation.id === current) ? current : null
      ));
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách chat');
    } finally {
      setLoadingConversations(false);
    }
  }, [isAuthenticated, role, searchKeyword, selectedRestaurantId]);

  const loadRoleRestaurants = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setLoadingRestaurants(true);
      if (role === 'restaurant_owner') {
        const response = await getMyRestaurants({ page: 1, limit: 100 });
        const list = response.data?.restaurants || [];
        setOwnerRestaurants(list);
        setAdminRestaurants([]);

        const savedId = localStorage.getItem(RESTAURANT_STORAGE_KEY);
        const validSavedId = list.some((restaurant) => restaurant.id === savedId) ? savedId : null;
        if (list.length === 1) {
          setSelectedRestaurantIdState(list[0].id);
        } else if (validSavedId) {
          setSelectedRestaurantIdState(validSavedId);
        } else if (!list.some((restaurant) => restaurant.id === selectedRestaurantId)) {
          setSelectedRestaurantIdState(null);
        }
        await refreshUnreadCount(list);
        return;
      }

      setOwnerRestaurants([]);
      if (role === 'admin') {
        const response = await adminApi.getRestaurants({ page: 1, limit: 100, sortBy: 'name', sortOrder: 'asc' });
        setAdminRestaurants(response.data?.restaurants || []);
      } else {
        setAdminRestaurants([]);
      }
      await refreshUnreadCount([]);
    } catch (err) {
      setError(err.message || 'Không thể tải dữ liệu chat');
    } finally {
      setLoadingRestaurants(false);
    }
  }, [isAuthenticated, refreshUnreadCount, role, selectedRestaurantId]);

  const handleSocketMessage = useCallback((message) => {
    if (!message?.conversationId) return;

    if (message.conversationId === selectedConversationId) {
      setMessages((current) => (
        current.some((item) => item.id === message.id) ? current : [...current, message]
      ));
      chatApi.markConversationRead(message.conversationId).catch(() => {});
    }

    refreshUnreadCount(ownerRestaurants).catch(() => {});
  }, [ownerRestaurants, refreshUnreadCount, selectedConversationId]);

  const handleConversationUpdated = useCallback((conversation) => {
    if (role === 'restaurant_owner' && selectedRestaurantId) {
      const restaurantId = conversation?.restaurant?.id || conversation?.restaurant;
      if (restaurantId && restaurantId !== selectedRestaurantId) return;
    }
    upsertConversation(conversation);
  }, [role, selectedRestaurantId, upsertConversation]);

  const handleTyping = useCallback((event, payload) => {
    if (payload.conversationId !== selectedConversationId) return;
    setTypingUsers((current) => ({
      ...current,
      [payload.userId]: event === 'start',
    }));
  }, [selectedConversationId]);

  const handleMessageRead = useCallback(() => {
    refreshUnreadCount(ownerRestaurants).catch(() => {});
  }, [ownerRestaurants, refreshUnreadCount]);

  const handleReactionUpdated = useCallback((payload) => {
    setMessages((current) => mergeReactionUpdate(current, payload));
  }, []);

  const handleBookingEvent = useCallback((eventName, payload) => {
    const messageByEvent = {
      'booking:created': 'Có yêu cầu đặt bàn mới',
      'booking:confirmed': 'Đặt bàn đã được xác nhận',
      'booking:cancelled': 'Đặt bàn đã bị hủy',
      'booking:completed': 'Đặt bàn đã hoàn thành',
      'booking:no_show': 'Đặt bàn được đánh dấu no-show',
    };

    toast(messageByEvent[eventName] || 'Booking đã được cập nhật');
    window.dispatchEvent(new CustomEvent('bookeat:booking-event', {
      detail: { eventName, payload },
    }));
  }, []);

  const socket = useChatSocket({
    enabled: isAuthenticated,
    onMessage: handleSocketMessage,
    onConversationUpdated: handleConversationUpdated,
    onTyping: handleTyping,
    onMessageRead: handleMessageRead,
    onReactionUpdated: handleReactionUpdated,
    onBookingEvent: handleBookingEvent,
  });

  useEffect(() => {
    localStorage.setItem(OPEN_STORAGE_KEY, isOpen ? 'true' : 'false');
  }, [isOpen]);

  useEffect(() => {
    if (selectedConversationId) {
      localStorage.setItem(CONVERSATION_STORAGE_KEY, selectedConversationId);
    } else {
      localStorage.removeItem(CONVERSATION_STORAGE_KEY);
    }
  }, [selectedConversationId]);

  useEffect(() => {
    if (selectedRestaurantId) {
      localStorage.setItem(RESTAURANT_STORAGE_KEY, selectedRestaurantId);
    } else {
      localStorage.removeItem(RESTAURANT_STORAGE_KEY);
    }
  }, [selectedRestaurantId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (!isAuthenticated) {
        setIsOpen(false);
        setConversations([]);
        setMessages([]);
        setSelectedConversationId(null);
        setOwnerRestaurants([]);
        setAdminRestaurants([]);
        setUnreadCount(0);
        setUnreadByRestaurant({});
        return;
      }

      loadRoleRestaurants();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [isAuthenticated, loadRoleRestaurants, user?.id]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadConversations();
    }, 120);
    return () => window.clearTimeout(timeoutId);
  }, [loadConversations]);

  useEffect(() => {
    if (!selectedRestaurantId || !socket.isConnected) return undefined;
    socket.joinRestaurant(selectedRestaurantId).catch((err) => setError(err.message));
    return undefined;
  }, [selectedRestaurantId, socket]);

  useEffect(() => {
    if (!selectedConversationId) {
      const timeoutId = window.setTimeout(() => {
        setMessages([]);
        setTypingUsers({});
      }, 0);
      return () => window.clearTimeout(timeoutId);
    }

    let ignore = false;
    const timeoutId = window.setTimeout(async () => {
      try {
        setLoadingMessages(true);
        setError(null);
        const response = await chatApi.getMessages(selectedConversationId);
        if (!ignore) {
          setMessages(response.data?.messages || []);
          setTypingUsers({});
          await chatApi.markConversationRead(selectedConversationId).catch(() => {});
          await refreshUnreadCount(ownerRestaurants).catch(() => {});
          if (socket.isConnected) {
            await socket.joinConversation(selectedConversationId).catch(() => {});
          }
        }
      } catch (err) {
        if (!ignore) setError(err.message || 'Không thể tải tin nhắn');
      } finally {
        if (!ignore) setLoadingMessages(false);
      }
    }, 0);

    return () => {
      ignore = true;
      window.clearTimeout(timeoutId);
      socket.leaveConversation(selectedConversationId).catch(() => {});
    };
  }, [ownerRestaurants, refreshUnreadCount, selectedConversationId, socket]);

  const setSelectedRestaurantId = useCallback((restaurantId) => {
    setSelectedRestaurantIdState(restaurantId || null);
    setSelectedConversationId(null);
    setMessages([]);
    setActiveView('conversationList');
  }, []);

  const openWidget = useCallback(() => {
    setIsOpen(true);
    setIsMinimized(false);
    setActiveView(selectedConversationId ? 'chatWindow' : 'conversationList');
  }, [selectedConversationId]);

  const closeWidget = useCallback(() => {
    setIsOpen(false);
    setIsMinimized(false);
  }, []);

  const minimizeWidget = useCallback(() => {
    setIsOpen(false);
    setIsMinimized(true);
  }, []);

  const showConversationList = useCallback(() => {
    setActiveView('conversationList');
    setSelectedConversationId(null);
  }, []);

  const selectConversation = useCallback((conversationId) => {
    setSelectedConversationId(conversationId);
    setActiveView('chatWindow');
    setIsOpen(true);
    setIsMinimized(false);
  }, []);

  const sendMessage = useCallback(async (content, attachments = []) => {
    const text = content.trim();
    if ((!text && attachments.length === 0) || !selectedConversationId) return null;

    try {
      setSending(true);
      setError(null);
      const payload = {
        conversationId: selectedConversationId,
        content: text,
        messageType: getMessageType(text, attachments),
        attachments,
      };
      const result = socket.isConnected
        ? await socket.sendMessage(payload)
        : await chatApi.sendMessage(payload).then((response) => response.data);

      if (result?.message) {
        setMessages((current) => (
          current.some((item) => item.id === result.message.id) ? current : [...current, result.message]
        ));
      }
      if (result?.conversation) upsertConversation(result.conversation);
      setInputDraft('');
      await refreshUnreadCount(ownerRestaurants);
      return result;
    } catch (err) {
      setError(err.message || 'Gửi tin nhắn thất bại');
      throw err;
    } finally {
      setSending(false);
    }
  }, [ownerRestaurants, refreshUnreadCount, selectedConversationId, socket, upsertConversation]);

  const toggleMessageReaction = useCallback(async (messageId, emoji) => {
    if (!messageId || !selectedConversationId) return null;

    try {
      setError(null);
      const payload = {
        messageId,
        conversationId: selectedConversationId,
        emoji,
      };
      const result = socket.isConnected
        ? await socket.toggleMessageReaction(payload)
        : await chatApi.toggleMessageReaction(messageId, emoji).then((response) => response.data);

      setMessages((current) => mergeReactionUpdate(current, result));
      return result;
    } catch (err) {
      setError(err.message || 'React tin nhắn thất bại');
      throw err;
    }
  }, [selectedConversationId, socket]);

  const typingStart = useCallback(() => {
    if (selectedConversationId) socket.typingStart(selectedConversationId);
  }, [selectedConversationId, socket]);

  const typingStop = useCallback(() => {
    if (selectedConversationId) socket.typingStop(selectedConversationId);
  }, [selectedConversationId, socket]);

  const openCustomerRestaurantChat = useCallback(async (restaurantId) => {
    if (!isAuthenticated || role !== 'customer') {
      throw new Error('Vui lòng đăng nhập bằng tài khoản customer để chat với nhà hàng');
    }

    try {
      setIsOpen(true);
      setIsMinimized(false);
      setError(null);
      const response = await chatApi.createConversation({
        type: 'CUSTOMER_RESTAURANT',
        restaurantId,
      });
      upsertConversation(response.data);
      selectConversation(response.data.id);
      return response.data;
    } catch (err) {
      setError(err.message || 'Không thể mở chat với nhà hàng');
      throw err;
    }
  }, [isAuthenticated, role, selectConversation, upsertConversation]);

  const openOwnerAdminChat = useCallback(async () => {
    if (!selectedRestaurantId) {
      throw new Error('Vui lòng chọn nhà hàng trước khi chat với Admin');
    }

    const response = await chatApi.createConversation({
      type: 'ADMIN_RESTAURANT',
      restaurantId: selectedRestaurantId,
    });
    upsertConversation(response.data);
    selectConversation(response.data.id);
    return response.data;
  }, [selectConversation, selectedRestaurantId, upsertConversation]);

  const openAdminRestaurantChat = useCallback(async (restaurantId) => {
    const response = await chatApi.createConversation({
      type: 'ADMIN_RESTAURANT',
      restaurantId,
    });
    upsertConversation(response.data);
    selectConversation(response.data.id);
    return response.data;
  }, [selectConversation, upsertConversation]);

  const activeTyping = useMemo(() => Object.values(typingUsers).some(Boolean), [typingUsers]);

  const value = useMemo(() => ({
    activeTyping,
    activeView,
    adminRestaurants,
    closeWidget,
    conversations,
    error,
    filteredConversations,
    inputDraft,
    isAuthenticated,
    isMinimized,
    isOpen,
    loadingConversations,
    loadingMessages,
    loadingRestaurants,
    messages,
    minimizeWidget,
    openAdminRestaurantChat,
    openCustomerRestaurantChat,
    openOwnerAdminChat,
    openWidget,
    ownerRestaurants,
    refreshConversations: loadConversations,
    refreshUnreadCount,
    role,
    searchKeyword,
    selectedConversation,
    selectedConversationId,
    selectedRestaurantId,
    selectConversation,
    sendMessage,
    sending,
    setInputDraft,
    setIsOpen,
    setSearchKeyword,
    setSelectedRestaurantId,
    showConversationList,
    socketStatus: socket.status,
    typingStart,
    typingStop,
    toggleMessageReaction,
    unreadByRestaurant,
    unreadCount,
    user,
  }), [
    activeTyping,
    activeView,
    adminRestaurants,
    closeWidget,
    conversations,
    error,
    filteredConversations,
    inputDraft,
    isAuthenticated,
    isMinimized,
    isOpen,
    loadConversations,
    loadingConversations,
    loadingMessages,
    loadingRestaurants,
    messages,
    minimizeWidget,
    openAdminRestaurantChat,
    openCustomerRestaurantChat,
    openOwnerAdminChat,
    openWidget,
    ownerRestaurants,
    refreshUnreadCount,
    role,
    searchKeyword,
    selectedConversation,
    selectedConversationId,
    selectedRestaurantId,
    selectConversation,
    sendMessage,
    sending,
    setSelectedRestaurantId,
    showConversationList,
    socket.status,
    typingStart,
    typingStop,
    toggleMessageReaction,
    unreadByRestaurant,
    unreadCount,
    user,
  ]);

  return (
    <ChatWidgetContext.Provider value={value}>
      {children}
    </ChatWidgetContext.Provider>
  );
}
