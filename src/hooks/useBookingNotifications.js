import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/useAuth';
import { useChatSocket } from './useChatSocket';

export default function useBookingNotifications() {
  const { isAuthenticated, user } = useAuth();

  const handleBookingEvent = (eventName, payload) => {
    // 1. Dispatch custom event for active pages to trigger refetches/updates
    const event = new CustomEvent('bookeat:booking-event', {
      detail: { eventName, payload },
    });
    window.dispatchEvent(event);

    // 2. Display elegant Toast Notifications based on User Role & Event
    const isOwner = user?.role === 'restaurant_owner';
    const isAdmin = user?.role === 'admin';
    const isCustomer = user?.role === 'customer';

    const { bookingId, customerName, restaurantName, status, message, reason } = payload || {};

    switch (eventName) {
      case 'booking:created':
        if (isOwner || isAdmin) {
          toast.success(
            `🔔 Đơn đặt bàn mới! ${customerName || 'Khách hàng'} vừa đặt bàn tại nhà hàng của bạn.`,
            { id: `booking-created-${bookingId}` }
          );
        } else if (isCustomer) {
          toast.success(
            `🎉 Đặt bàn thành công! Đơn đặt bàn tại ${restaurantName || 'nhà hàng'} đang chờ xác nhận.`,
            { id: `booking-created-${bookingId}` }
          );
        }
        break;

      case 'booking:confirmed':
        if (isCustomer) {
          toast.success(
            `✅ Tuyệt vời! Đơn đặt bàn của bạn tại ${restaurantName || 'nhà hàng'} đã được XÁC NHẬN.`,
            { id: `booking-confirmed-${bookingId}`, duration: 5000 }
          );
        } else if (isOwner || isAdmin) {
          toast.success(
            `✅ Đã xác nhận đơn đặt bàn của khách ${customerName || 'hàng'}.`,
            { id: `booking-confirmed-${bookingId}` }
          );
        }
        break;

      case 'booking:cancelled':
        const cancelReasonMsg = reason ? ` Lý do: "${reason}"` : '';
        if (isCustomer) {
          toast.error(
            `❌ Rất tiếc! Đơn đặt bàn của bạn tại ${restaurantName || 'nhà hàng'} đã bị HỦY.${cancelReasonMsg}`,
            { id: `booking-cancelled-${bookingId}`, duration: 6000 }
          );
        } else {
          toast.error(
            `❌ Đơn đặt bàn của khách ${customerName || 'hàng'} đã bị HỦY.${cancelReasonMsg}`,
            { id: `booking-cancelled-${bookingId}` }
          );
        }
        break;

      case 'booking:completed':
        if (isCustomer) {
          toast.success(
            `🍽️ Cảm ơn quý khách! Chúc bạn đã có một bữa ăn ngon miệng tại ${restaurantName || 'nhà hàng'}.`,
            { id: `booking-completed-${bookingId}` }
          );
        } else {
          toast.success(
            `🍽️ Đơn đặt bàn của khách ${customerName || 'hàng'} đã hoàn tất dùng bữa.`,
            { id: `booking-completed-${bookingId}` }
          );
        }
        break;

      case 'booking:no_show':
        if (isOwner || isAdmin) {
          toast.error(
            `👤 Khách hàng ${customerName || ''} vắng mặt (No-Show).`,
            { id: `booking-noshow-${bookingId}` }
          );
        } else if (isCustomer) {
          toast.error(
            `👤 Đơn đặt bàn của bạn đã bị đánh dấu vắng mặt (No-Show).`,
            { id: `booking-noshow-${bookingId}` }
          );
        }
        break;

      default:
        if (message) {
          toast(message, { id: `booking-generic-${bookingId || Date.now()}` });
        }
        break;
    }
  };

  // Connect to the socket for booking updates only if user is logged in
  useChatSocket({
    enabled: !!isAuthenticated,
    onBookingEvent: handleBookingEvent,
  });
}
