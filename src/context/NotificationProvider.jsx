import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
import { notificationApi } from '../api/notificationApi';
import ToastNotification from '../components/notifications/ToastNotification';
import NotificationContext from './NotificationContext';
import { useAuth } from './useAuth';
import { getSocketUrl } from '../utils/socketUrl';

const getNotificationTarget = (notification, user) => {
  const role = user?.role;
  const entity = notification?.relatedEntity;
  const entityType = entity?.entityType;
  const entityId = entity?.entityId;

  if (entityType === 'booking') {
    if (role === 'admin') return entityId ? `/admin/bookings/${entityId}` : '/admin/bookings';
    if (role === 'restaurant_owner') return '/owner/bookings';
    if (entityId) return `/bookings/${entityId}`;
  }

  if (entityType === 'chat') {
    if (role === 'admin') return '/admin/chat';
    if (role === 'restaurant_owner') return '/owner/chat';
    return '/chat';
  }

  if (entityType === 'refund') {
    if (role === 'admin') return '/admin/refunds';
    if (role === 'restaurant_owner') return '/owner/billing';
    return '/my-bookings';
  }

  if (entityType === 'payment') {
    if (role === 'admin') return '/admin/revenue';
    if (role === 'restaurant_owner') return '/owner/billing';
    return '/my-bookings';
  }

  if (entityType === 'voucher') {
    if (role === 'admin') return '/admin/vouchers';
    if (role === 'restaurant_owner') return '/owner/vouchers';
    return '/my-vouchers';
  }

  if (entityType === 'restaurant') {
    if (role === 'admin') return entityId ? `/admin/restaurants/${entityId}` : '/admin/restaurants';
    if (role === 'restaurant_owner') return '/owner/restaurants';
    return '/restaurants';
  }

  if (entityType === 'withdrawal') {
    return role === 'admin' ? '/admin/revenue' : '/owner/billing';
  }

  return notification?.actionUrl || null;
};

export function NotificationProvider({ children }) {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const notificationsRef = useRef([]);
  const openNotificationRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [status, setStatus] = useState('disconnected');
  const [isLoading, setIsLoading] = useState(false);
  const userId = user?.id || user?._id || null;

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  const reset = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
    setStatus('disconnected');
  }, []);

  const refreshNotifications = useCallback(async () => {
    if (loading || !isAuthenticated) {
      reset();
      return;
    }

    setIsLoading(true);
    try {
      const res = await notificationApi.getNotifications({ limit: 30 });
      const data = res.data || {};
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.warn('Cannot load notifications:', error.message || error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, loading, reset]);

  const markAsRead = useCallback(async (id) => {
    if (!id) return null;
    const wasUnread = notificationsRef.current.some((item) => item.id === id && item.status === 'unread');
    setNotifications((current) => current.map((item) => {
      if (item.id === id) {
        return { ...item, status: 'read', readAt: item.readAt || new Date().toISOString() };
      }
      return item;
    }));
    if (wasUnread) {
      setUnreadCount((count) => Math.max(0, count - 1));
    }

    try {
      const res = await notificationApi.markAsRead(id);
      const updated = res.data;
      if (updated) {
        setNotifications((current) => current.map((item) => (item.id === id ? updated : item)));
      }
      return updated;
    } catch (error) {
      await refreshNotifications();
      throw error;
    }
  }, [refreshNotifications]);

  const markAllAsRead = useCallback(async () => {
    setNotifications((current) => current.map((item) => ({
      ...item,
      status: 'read',
      readAt: item.readAt || new Date().toISOString(),
    })));
    setUnreadCount(0);
    try {
      await notificationApi.markAllAsRead();
    } catch (error) {
      await refreshNotifications();
      throw error;
    }
  }, [refreshNotifications]);

  const deleteNotification = useCallback(async (id) => {
    const wasUnread = notificationsRef.current.some((item) => item.id === id && item.status === 'unread');
    setNotifications((current) => current.filter((item) => {
      return item.id !== id;
    }));
    if (wasUnread) {
      setUnreadCount((count) => Math.max(0, count - 1));
    }

    try {
      await notificationApi.deleteNotification(id);
    } catch (error) {
      await refreshNotifications();
      throw error;
    }
  }, [refreshNotifications]);

  const openNotification = useCallback(async (notification) => {
    if (!notification) return;
    if (notification.status === 'unread') {
      await markAsRead(notification.id).catch(() => {});
    }
    const target = getNotificationTarget(notification, user);
    if (target) navigate(target);
  }, [markAsRead, navigate, user]);

  useEffect(() => {
    openNotificationRef.current = openNotification;
  }, [openNotification]);

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications, userId]);

  useEffect(() => {
    if (loading || !isAuthenticated || !userId) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      reset();
      return undefined;
    }

    const token = localStorage.getItem('bookeat_token');
    if (!token) return undefined;

    const socket = io(getSocketUrl(), {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;
    setStatus('connecting');

    socket.on('connect', () => setStatus('connected'));
    socket.on('disconnect', () => setStatus('disconnected'));
    socket.on('connect_error', () => setStatus('error'));
    socket.on('notification:new', (notification) => {
      const exists = notificationsRef.current.some((item) => item.id === notification.id);
      if (exists) return;

      setNotifications((current) => [notification, ...current].slice(0, 50));
      if (notification.status === 'unread') {
        setUnreadCount((count) => count + 1);
      }
      toast.custom((t) => (
        <ToastNotification
          toastInstance={t}
          notification={notification}
          onOpen={() => {
            toast.dismiss(t.id);
            openNotificationRef.current?.(notification);
          }}
          onDismiss={() => toast.dismiss(t.id)}
        />
      ), { duration: 4500, position: 'top-right' });
    });
    socket.on('notification:read', (notification) => {
      const wasUnread = notificationsRef.current.some((item) => (
        item.id === notification.id && item.status === 'unread'
      ));
      setNotifications((current) => current.map((item) => {
        return item.id === notification.id ? notification : item;
      }));
      if (wasUnread) {
        setUnreadCount((count) => Math.max(0, count - 1));
      }
    });
    socket.on('notification:read_all', () => {
      setNotifications((current) => current.map((item) => ({
        ...item,
        status: 'read',
        readAt: item.readAt || new Date().toISOString(),
      })));
      setUnreadCount(0);
    });
    socket.on('notification:deleted', (notification) => {
      const wasUnread = notificationsRef.current.some((item) => (
        item.id === notification.id && item.status === 'unread'
      ));
      setNotifications((current) => current.filter((item) => item.id !== notification.id));
      if (wasUnread) {
        setUnreadCount((count) => Math.max(0, count - 1));
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setStatus('disconnected');
    };
  }, [isAuthenticated, loading, reset, userId]);

  const value = useMemo(() => ({
    notifications,
    unreadCount,
    isLoading,
    status,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    openNotification,
  }), [
    deleteNotification,
    isLoading,
    markAllAsRead,
    markAsRead,
    notifications,
    openNotification,
    refreshNotifications,
    status,
    unreadCount,
  ]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
