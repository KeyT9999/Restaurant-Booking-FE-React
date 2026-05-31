import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBookingById, cancelBooking } from '../../api/bookingApi';
import StatusBadge from '../../components/booking/StatusBadge';
import StatusTimeline from '../../components/booking/StatusTimeline';
import { ArrowLeft, Store, Calendar, Clock, Users, Tag, MessageSquare, AlertTriangle, X } from 'lucide-react';
import toast from 'react-hot-toast';
import './BookingDetailPage.css';

const occasionLabels = {
  birthday: '🎂 Sinh nhật',
  anniversary: '💍 Kỷ niệm',
  business: '💼 Công việc',
  date: '💑 Hẹn hò',
  family: '👨‍👩‍👧‍👦 Gia đình',
  other: '🎯 Khác',
};

export default function BookingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cancel dialog state
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchBooking = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getBookingById(id);
      if (res.success) {
        setBooking(res.data);
      } else {
        toast.error(res.message || 'Lỗi khi tải thông tin chi tiết đặt bàn');
        navigate('/my-bookings');
      }
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải thông tin đặt bàn');
      navigate('/my-bookings');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      fetchBooking();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchBooking]);

  const handleCancelClick = () => {
    setShowCancelDialog(true);
    setCancelReason('');
  };

  const handleConfirmCancel = async () => {
    setIsCancelling(true);
    try {
      const res = await cancelBooking(id, cancelReason);
      if (res.success) {
        toast.success('Hủy đặt bàn thành công');
        setShowCancelDialog(false);
        fetchBooking(); // refresh details
      } else {
        toast.error(res.message || 'Lỗi khi hủy đặt bàn');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Có lỗi xảy ra khi hủy đặt bàn');
    } finally {
      setIsCancelling(false);
    }
  };

  const canCancel = () => {
    if (!booking) return false;
    const now = new Date();
    const bDate = new Date(booking.bookingDate);
    const [h, m] = booking.bookingTime.split(':').map(Number);
    bDate.setHours(h, m, 0, 0);
    return ['pending', 'confirmed'].includes(booking.status) && bDate > now;
  };

  if (loading) {
    return (
      <div className="booking-detail-loading-container">
        <div className="spinner"></div>
        <p>Đang tải thông tin chi tiết đặt bàn...</p>
      </div>
    );
  }

  if (!booking) return null;

  const formattedDate = new Date(booking.bookingDate).toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="booking-detail-page-container">
      {/* Header with Back button */}
      <div className="detail-page-header">
        <button className="btn-back" onClick={() => navigate('/my-bookings')}>
          <ArrowLeft size={18} /> Quay lại danh sách
        </button>
        <div className="header-title-row">
          <h2>Chi tiết đơn đặt bàn</h2>
          <span className="booking-id-text">Mã số: #{booking.id.substring(18)}</span>
        </div>
      </div>

      <div className="detail-page-grid-layout">
        {/* Left Column - Details */}
        <div className="left-info-column">
          {/* Status Panel */}
          <div className="status-panel-card">
            <span className="panel-label">Trạng thái đặt bàn hiện tại:</span>
            <div className="badge-wrapper-row">
              <StatusBadge status={booking.status} />
            </div>
            {booking.status === 'cancelled' && (
              <div className="cancel-reason-notice-box">
                <span className="notice-title">Lý do hủy đặt bàn:</span>
                <p className="notice-body">{booking.cancellationReason || 'Không có lý do chi tiết'}</p>
                <span className="notice-sub">Hủy bởi: {booking.cancelledBy === 'customer' ? 'Khách hàng' : booking.cancelledBy === 'restaurant' ? 'Nhà hàng' : 'Quản trị viên'}</span>
              </div>
            )}
          </div>

          {/* Restaurant Details */}
          <div className="detail-section-card">
            <h4 className="section-title">
              <Store size={18} /> Thông tin nhà hàng
            </h4>
            <div className="restaurant-detail-box">
              <div className="restaurant-meta-info">
                <span className="res-name">{booking.restaurant?.name}</span>
                <span className="res-address">
                  {booking.restaurant?.address?.fullAddress || `${booking.restaurant?.address?.street}, ${booking.restaurant?.address?.ward}, ${booking.restaurant?.address?.district}, ${booking.restaurant?.address?.city}`}
                </span>
                {booking.restaurant?.phoneNumber && (
                  <span className="res-phone">Điện thoại liên hệ: <strong>{booking.restaurant.phoneNumber}</strong></span>
                )}
              </div>
            </div>
          </div>

          {/* Booking details */}
          <div className="detail-section-card">
            <h4 className="section-title">📅 Chi tiết đặt bàn</h4>
            
            <div className="details-vertical-list">
              <div className="detail-row-item">
                <div className="item-label">
                  <Calendar size={16} /> Ngày dùng bữa:
                </div>
                <div className="item-val font-semibold">{formattedDate}</div>
              </div>

              <div className="detail-row-item">
                <div className="item-label">
                  <Clock size={16} /> Giờ dùng bữa:
                </div>
                <div className="item-val font-bold text-amber">{booking.bookingTime}</div>
              </div>

              <div className="detail-row-item">
                <div className="item-label">
                  <Users size={16} /> Số lượng khách:
                </div>
                <div className="item-val">{booking.numberOfGuests} người</div>
              </div>

              <div className="detail-row-item">
                <div className="item-label">🪑 Bàn được chọn:</div>
                <div className="item-val font-semibold text-blue">
                  {booking.tableNumbers && booking.tableNumbers.length > 0
                    ? booking.tableNumbers.join(', ')
                    : 'Nhà hàng tự động xếp bàn'}
                </div>
              </div>

              {booking.occasion && (
                <div className="detail-row-item">
                  <div className="item-label">
                    <Tag size={16} /> Dịp đặc biệt:
                  </div>
                  <div className="item-val">{occasionLabels[booking.occasion] || booking.occasion}</div>
                </div>
              )}

              {booking.specialRequests && (
                <div className="detail-row-item vertical-item">
                  <div className="item-label">
                    <MessageSquare size={16} /> Yêu cầu đặc biệt:
                  </div>
                  <div className="item-val block-text italic">"{booking.specialRequests}"</div>
                </div>
              )}

              <div className="detail-row-item">
                <div className="item-label">💰 Tiền đặt cọc:</div>
                <div className="item-val font-bold">
                  {booking.depositAmount > 0
                    ? `${new Intl.NumberFormat('vi-VN').format(booking.depositAmount)}đ`
                    : '0đ (Đặt bàn miễn phí)'}
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          {canCancel() && (
            <div className="booking-detail-actions-bar">
              <button className="btn btn-danger btn-cancel-large" onClick={handleCancelClick}>
                Hủy đặt bàn này
              </button>
            </div>
          )}
        </div>

        {/* Right Column - Status History Timeline */}
        <div className="right-timeline-column">
          <StatusTimeline
            statusHistory={booking.statusHistory}
            currentStatus={booking.status}
          />
        </div>
      </div>

      {/* Cancel Dialog */}
      {showCancelDialog && (
        <div className="cancel-dialog-backdrop" onClick={() => setShowCancelDialog(false)}>
          <div
            className="cancel-dialog-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-detail-dialog-title"
            onClick={(e) => e.stopPropagation()}
          >            <div className="dialog-header">
              <h4 className="text-danger flex items-center gap-2">
                <AlertTriangle size={20} /> Xác nhận hủy đặt bàn
              </h4>
              <button className="close-dialog-btn" onClick={() => setShowCancelDialog(false)}>
                <X size={18} />
              </button>
            </div>
            
            <div className="dialog-body">
              <p>Bạn có chắc chắn muốn hủy đặt bàn này không? Hành động này không thể hoàn tác.</p>
              
              <div className="form-group">
                <label className="input-label">Lý do hủy đặt bàn (tùy chọn):</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Nhập lý do hủy đặt bàn..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  maxLength="200"
                ></textarea>
              </div>
            </div>

            <div className="dialog-footer">
              <button className="btn btn-outline" onClick={() => setShowCancelDialog(false)} disabled={isCancelling}>
                Quay lại
              </button>
              <button className="btn btn-danger" onClick={handleConfirmCancel} disabled={isCancelling}>
                {isCancelling ? 'Đang hủy...' : 'Xác nhận hủy đặt bàn'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
