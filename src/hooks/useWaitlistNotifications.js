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
          toast.success(`${customerName} vua tham gia danh sach cho.`, {
            id: getToastId('waitlist-created', payload),
          });
        } else if (isCustomer) {
          toast.success('Yeu cau danh sach cho da duoc gui den nha hang.', {
            id: getToastId('waitlist-created', payload),
          });
        }
        break;
      case 'waitlist:confirmed':
        if (isCustomer) {
          toast.success('Nha hang da co ban trong va xac nhan yeu cau cua ban.', {
            id: getToastId('waitlist-confirmed', payload),
            duration: 6000,
          });
        } else {
          toast.success(`Da xac nhan waitlist cua ${customerName}.`, {
            id: getToastId('waitlist-confirmed', payload),
          });
        }
        break;
      case 'waitlist:cancelled':
        toast.error(isCustomer ? 'Yeu cau danh sach cho da bi huy.' : `Waitlist cua ${customerName} da bi huy.`, {
          id: getToastId('waitlist-cancelled', payload),
        });
        break;
      case 'waitlist:expired':
        toast.error(isCustomer ? 'Yeu cau danh sach cho da het thoi gian cho.' : `Waitlist cua ${customerName} da het han.`, {
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
