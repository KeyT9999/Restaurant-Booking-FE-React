import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyBookings, cancelBooking } from '../../api/bookingApi';
import BookingCard from '../../components/booking/BookingCard';
import { useAuth } from '../../context/useAuth';
import toast from 'react-hot-toast';
import { AlertTriangle, X } from 'lucide-react';
import './MyBookingsPage.css';

export default function MyBookingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, upcoming, past, cancelled
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Cancel dialog state
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMyBookings({
        filter,
        page,
        limit: 5,
      });

      if (res.success) {
        setBookings(res.data.bookings || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalElements(res.data.total || 0);
      } else {
        toast.error(res.message || 'Lỗi khi tải lịch sử đặt bàn');
      }
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải lịch sử đặt bàn');
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      fetchBookings();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchBookings]);

  useEffect(() => {
    const handleBookingEvent = () => {
      fetchBookings();
    };

    window.addEventListener('bookeat:booking-event', handleBookingEvent);
    return () => window.removeEventListener('bookeat:booking-event', handleBookingEvent);
  }, [fetchBookings]);

  // Reset page when filter changes
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setPage(1);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [filter]);

  const handleCancelClick = (id) => {
    setCancellingId(id);
    setCancelReason('');
  };

  const handleConfirmCancel = async () => {
    setIsCancelling(true);
    try {
      const res = await cancelBooking(cancellingId, cancelReason);
      if (res.success) {
        toast.success('Đã hủy đặt bàn thành công');
        setCancellingId(null);
        fetchBookings(); // refresh
      } else {
        toast.error(res.message || 'Không thể hủy đặt bàn');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Lỗi khi hủy đặt bàn');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleViewDetail = (id) => {
    navigate(`/bookings/${id}`);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          className={`pagination-btn ${page === i ? 'active' : ''}`}
          onClick={() => setPage(i)}
        >
          {i}
        </button>
      );
    }
    return <div className="bookings-pagination">{pages}</div>;
  };

  return (
    <div className="my-bookings-page-container">
      <h2 className="page-title">📋 Lịch sử đặt bàn của tôi</h2>

      {/* No-show warning badge */}
      {user?.bookingBlockedUntil && new Date(user.bookingBlockedUntil) > new Date() ? (
        <div className="noshow-badge noshow-badge--blocked" role="alert">
          🚫 Đã bị cấm đặt bàn đến {new Date(user.bookingBlockedUntil).toLocaleDateString('vi-VN')}
        </div>
      ) : user?.noShowCounter >= 2 ? (
        <div className="noshow-badge noshow-badge--warning" role="alert">
          ⚠️ Bạn đã có {user.noShowCounter}/3 lần vắng mặt. Thêm 1 lần nữa sẽ bị cấm đặt bàn 30 ngày.
        </div>
      ) : user?.noShowCounter >= 1 ? (
        <div className="noshow-badge noshow-badge--info" role="alert">
          ℹ️ Bạn đã có {user.noShowCounter}/3 lần vắng mặt.
        </div>
      ) : null}

      {/* Tabs list */}
      <div className="filter-tabs-container" role="tablist" aria-label="Lọc đơn đặt bàn">
        {[
          { value: 'all', label: 'Tất cả đơn đặt' },
          { value: 'upcoming', label: 'Đang chờ / Sắp tới' },
          { value: 'past', label: 'Đã hoàn tất' },
          { value: 'cancelled', label: 'Đã hủy' },
        ].map((tab) => (
          <button
            key={tab.value}
            role="tab"
            className={`filter-tab-btn ${filter === tab.value ? 'active' : ''}`}
            onClick={() => setFilter(tab.value)}
            aria-selected={filter === tab.value}
            aria-controls="bookings-panel"
            tabIndex={filter === tab.value ? 0 : -1}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="bookings-loading-state">
          <div className="skeleton-card"></div>
          <div className="skeleton-card"></div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="bookings-empty-state">
          <span className="empty-icon">🍽️</span>
          <h3>Không tìm thấy đơn đặt bàn nào</h3>
          <p>Bạn chưa thực hiện đơn đặt bàn nào tương ứng với bộ lọc này.</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            🔍 Khám phá nhà hàng & đặt bàn ngay
          </button>
        </div>
      ) : (
        <div className="bookings-list-content">
          <p className="results-count-text">Tìm thấy <strong>{totalElements}</strong> kết quả đặt bàn</p>
          {bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onViewDetail={handleViewDetail}
              onCancel={handleCancelClick}
            />
          ))}
          {renderPagination()}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancellingId && (
        <div className="cancel-dialog-backdrop" onClick={() => setCancellingId(null)}>
          <div
            className="cancel-dialog-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-dialog-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dialog-header">
              <h4 className="text-danger flex items-center gap-2">
                <AlertTriangle size={20} /> Xác nhận hủy đặt bàn
              </h4>
              <button className="close-dialog-btn" onClick={() => setCancellingId(null)}>
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
              <button className="btn btn-outline" onClick={() => setCancellingId(null)} disabled={isCancelling}>
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
