import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/useAuth';
import { useChatSocket } from './useChatSocket';

const getToastId = (prefix, payload) => `${prefix}-${payload?.waitlistId || payload?.id || Date.now()}`;

export default function useWaitlistNotifications() {
  const { isAuthenticated, user } = useAuth();

  const handleWaitlistEvent = useCallback((eventName, payload) => {
    window.dispatchEvent(new CustomEvent('bookeat:waitlist-event', {
      detail: { eventName, payload },
    }));

    const isOwner = user?.role === 'restaurant_owner';
    const isAdmin = user?.role === 'admin';
    const isCustomer = user?.role === 'customer';
    const customerName = payload?.customerName || 'Khach hang';

    switch (eventName) {
      case 'waitlist:created':
        if (isOwner || isAdmin) {
          toast.success(`${customerName} vừa tham gia danh sách chờ.`, {
            id: getToastId('waitlist-created', payload),
          });
        } else if (isCustomer) {
          toast.success('Yêu cầu danh sách chờ đã được gửi đến nhà hàng.', {
            id: getToastId('waitlist-created', payload),
          });
        }
        break;
      case 'waitlist:confirmed':
        if (isCustomer) {
          toast.success('Nhà hàng đã có bàn trống và xác nhận yêu cầu của bạn.', {
            id: getToastId('waitlist-confirmed', payload),
            duration: 6000,
          });
        } else {
          toast.success(`Đã xác nhận danh sách chờ của ${customerName}.`, {
            id: getToastId('waitlist-confirmed', payload),
          });
        }
        break;
      case 'waitlist:cancelled':
        toast.error(isCustomer ? 'Yêu cầu danh sách chờ đã bị hủy.' : `Danh sách chờ của ${customerName} đã bị hủy.`, {
          id: getToastId('waitlist-cancelled', payload),
        });
        break;
      case 'waitlist:expired':
        toast.error(isCustomer ? 'Yêu cầu danh sách chờ đã hết thời gian chờ.' : `Danh sách chờ của ${customerName} đã hết hạn.`, {
          id: getToastId('waitlist-expired', payload),
        });
        break;
      default:
        if (payload?.message) {
          toast(payload.message, { id: getToastId('waitlist-updated', payload) });
        }
    }
  }, [user?.role]);

  useChatSocket({
    enabled: !!isAuthenticated,
    onWaitlistEvent: handleWaitlistEvent,
  });
}
