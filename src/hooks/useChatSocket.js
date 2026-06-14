import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const getSocketUrl = () => {
  const apiBase = import.meta.env.VITE_API_BASE_URL;
  if (!apiBase) return window.location.origin;
  return apiBase.replace(/\/api\/v1\/?$/, '');
};

export function useChatSocket({
  enabled = true,
  onMessage,
  onConversationUpdated,
  onTyping,
  onMessageRead,
  onReactionUpdated,
  onBookingEvent,
  onWaitlistEvent,
} = {}) {
  const socketRef = useRef(null);
  const handlersRef = useRef({
    onMessage,
    onConversationUpdated,
    onTyping,
    onMessageRead,
    onReactionUpdated,
    onBookingEvent,
    onWaitlistEvent,
  });
  const [status, setStatus] = useState('disconnected');

  useEffect(() => {
    handlersRef.current = {
      onMessage,
      onConversationUpdated,
      onTyping,
      onMessageRead,
      onReactionUpdated,
      onBookingEvent,
      onWaitlistEvent,
    };
  }, [onBookingEvent, onConversationUpdated, onMessage, onMessageRead, onReactionUpdated, onTyping, onWaitlistEvent]);

  useEffect(() => {
    if (!enabled) return undefined;
    const token = localStorage.getItem('bookeat_token');
    if (!token) return undefined;

    const statusTimeoutId = window.setTimeout(() => {
      setStatus('connecting');
    }, 0);
    const socket = io(getSocketUrl(), {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => setStatus('connected'));
    socket.on('disconnect', () => setStatus('disconnected'));
    socket.on('connect_error', () => setStatus('error'));
    socket.on('receive_message', (message) => handlersRef.current.onMessage?.(message));
    socket.on('conversation_updated', (conversation) => handlersRef.current.onConversationUpdated?.(conversation));
    socket.on('typing_start', (payload) => handlersRef.current.onTyping?.('start', payload));
    socket.on('typing_stop', (payload) => handlersRef.current.onTyping?.('stop', payload));
    socket.on('message_read', (payload) => handlersRef.current.onMessageRead?.(payload));
    socket.on('message_reaction_updated', (payload) => handlersRef.current.onReactionUpdated?.(payload));
    ['booking:created', 'booking:confirmed', 'booking:cancelled', 'booking:completed', 'booking:no_show'].forEach((eventName) => {
      socket.on(eventName, (payload) => handlersRef.current.onBookingEvent?.(eventName, payload));
    });
    ['waitlist:created', 'waitlist:updated', 'waitlist:confirmed', 'waitlist:cancelled', 'waitlist:expired'].forEach((eventName) => {
      socket.on(eventName, (payload) => handlersRef.current.onWaitlistEvent?.(eventName, payload));
    });

    return () => {
      window.clearTimeout(statusTimeoutId);
      socket.disconnect();
      socketRef.current = null;
      setStatus('disconnected');
    };
  }, [enabled]);

  const emitWithAck = useCallback((event, payload) => new Promise((resolve, reject) => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) {
      reject(new Error('Socket chua ket noi'));
      return;
    }

    socket.emit(event, payload, (response) => {
      if (response?.success) resolve(response.data || response);
      else reject(new Error(response?.message || 'Socket event that bai'));
    });
  }), []);

  return useMemo(() => ({
    status,
    isConnected: status === 'connected',
    joinRestaurant: (restaurantId) => emitWithAck('join_restaurant', { restaurantId }),
    joinConversation: (conversationId, restaurantId) => emitWithAck('join_conversation', { conversationId, restaurantId }),
    leaveConversation: (conversationId) => emitWithAck('leave_conversation', { conversationId }),
    sendMessage: (payload) => emitWithAck('send_message', payload),
    toggleMessageReaction: (payload) => emitWithAck('message_reaction_toggle', payload),
    typingStart: (conversationId) => socketRef.current?.emit('typing_start', { conversationId }),
    typingStop: (conversationId) => socketRef.current?.emit('typing_stop', { conversationId }),
    markRead: (payload) => emitWithAck('message_read', payload),
  }), [emitWithAck, status]);
}
