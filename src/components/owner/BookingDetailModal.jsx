import { useState, useEffect, useCallback, useRef } from 'react';
import { getBookingDetail, confirmBooking, completeBooking, markNoShow, addInternalNote, deleteInternalNote } from '../../api/bookingApi';
import StatusBadge from '../booking/StatusBadge';
import StatusTimeline from '../booking/StatusTimeline';
import { X, User, Phone, Mail, Calendar, Clock, Users, ShieldAlert, Tag, MessageSquare, Clipboard, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import './BookingDetailModal.css';

const occasionLabels = {
  birthday: '🎂 Sinh nhật',
  anniversary: '💍 Kỷ niệm',
  business: '💼 Công việc',
  date: '💑 Hẹn hò',
  family: '👨‍👩‍👧‍👦 Gia đình',
  other: '🎯 Khác',
};

export default function BookingDetailModal({
  isOpen,
  bookingId,
  onClose,
  onActionComplete,
  onCancelClick,
  onChangeTableClick,
}) {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noteContent, setNoteContent] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);
  const modalRef = useRef(null);

  // Focus trap & Escape key handler
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex="0"]'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Initial focus focusable elements after render
    const timeoutId = window.setTimeout(() => {
      const focusable = modalRef.current?.querySelectorAll(
        'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex="0"]'
      );
      if (focusable && focusable.length > 0) {
        focusable[0].focus();
      }
    }, 50);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.clearTimeout(timeoutId);
    };
  }, [isOpen, onClose]);

  const fetchDetail = useCallback(async () => {
    if (!bookingId) return;
    setLoading(true);
    try {
      const res = await getBookingDetail(bookingId);
      if (res.success) {
        setBooking(res.data);
      } else {
        toast.error(res.message || 'Lỗi khi tải chi tiết đặt bàn');
        onClose();
      }
    } catch (err) {
      console.error(err);
      toast.error('Có lỗi xảy ra khi tải chi tiết đặt bàn');
      onClose();
    } finally {
      setLoading(false);
    }
  }, [bookingId, onClose]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const timeoutId = window.setTimeout(() => {
      fetchDetail();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchDetail, isOpen]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      const res = await confirmBooking(bookingId);
      if (res.success) {
        toast.success('Xác nhận đặt bàn thành công');
        fetchDetail();
        if (onActionComplete) onActionComplete();
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi khi xác nhận đặt bàn');
    }
  };

  const handleComplete = async () => {
    try {
      const res = await completeBooking(bookingId);
      if (res.success) {
        toast.success('Hoàn thành đặt bàn thành công');
        fetchDetail();
        if (onActionComplete) onActionComplete();
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi khi hoàn tất đặt bàn');
    }
  };

  const handleNoShow = async () => {
    try {
      const res = await markNoShow(bookingId);
      if (res.success) {
        toast.success('Đã đánh dấu khách vắng mặt');
        fetchDetail();
        if (onActionComplete) onActionComplete();
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi khi đánh dấu vắng mặt');
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    
    setSubmittingNote(true);
    try {
      const res = await addInternalNote(bookingId, noteContent);
      if (res.success) {
        toast.success('Thêm ghi chú nội bộ thành công');
        setNoteContent('');
        fetchDetail();
      } else {
        toast.error(res.message || 'Lỗi khi thêm ghi chú');
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi kết nối khi thêm ghi chú');
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleDeleteNotes = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa toàn bộ ghi chú nội bộ của đơn đặt bàn này?')) return;
    try {
      const res = await deleteInternalNote(bookingId);
      if (res.success) {
        toast.success('Đã xóa toàn bộ ghi chú nội bộ');
        fetchDetail();
      } else {
        toast.error(res.message || 'Không thể xóa ghi chú');
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi xóa ghi chú nội bộ');
    }
  };

  return (
    <div className="owner-modal-overlay" onMouseDown={onClose}>
      <div
        ref={modalRef}
        className="owner-modal owner-modal--detail"
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-detail-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 id="booking-detail-modal-title">📋 Chi tiết đặt bàn #{bookingId.substring(18)}</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="modal-loading-state">
            <div className="spinner"></div>
            <p>Đang tải chi tiết đặt bàn...</p>
          </div>
        ) : !booking ? null : (
          <div className="modal-body-scrollable">
            <div className="modal-detail-columns">
              
              {/* Left Column: Details */}
              <div className="details-info-section">
                
                {/* Status Box */}
                <div className="status-box-panel">
                  <span className="box-lbl">Trạng thái hiện tại:</span>
                  <StatusBadge status={booking.status} />
                  {booking.status === 'cancelled' && (
                    <div className="detail-cancelled-reason">
                      <strong>Lý do hủy:</strong> {booking.cancellationReason || 'Không rõ lý do'}
                    </div>
                  )}
                </div>

                {/* Customer Contact */}
                <div className="detail-card-section">
                  <h4 className="detail-sec-title">👤 Thông tin khách hàng</h4>
                  <div className="customer-info-list">
                    <div className="cust-item">
                      <User size={16} /> <span>Họ tên: <strong>{booking.customerName}</strong></span>
                    </div>
                    <div className="cust-item">
                      <Phone size={16} /> <span>Số ĐT: <strong>{booking.customerPhone}</strong></span>
                    </div>
                    <div className="cust-item">
                      <Mail size={16} /> <span>Email: <strong>{booking.customerEmail}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Booking Info */}
                <div className="detail-card-section">
                  <h4 className="detail-sec-title">🍽️ Chi tiết đơn đặt</h4>
                  <div className="booking-info-list-details">
                    <div className="info-row">
                      <div className="info-lbl"><Calendar size={15} /> Ngày ăn:</div>
                      <div className="info-val font-semibold">
                        {new Date(booking.bookingDate).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                    <div className="info-row">
                      <div className="info-lbl"><Clock size={15} /> Giờ ăn:</div>
                      <div className="info-val font-bold text-amber">{booking.bookingTime}</div>
                    </div>
                    <div className="info-row">
                      <div className="info-lbl"><Users size={15} /> Số khách:</div>
                      <div className="info-val"><strong>{booking.numberOfGuests}</strong> người</div>
                    </div>
                    <div className="info-row">
                      <div className="info-lbl"><ShieldAlert size={15} /> Bàn gán:</div>
                      <div className="info-val text-blue font-bold">
                        {booking.tableNumbers?.length > 0 ? booking.tableNumbers.join(', ') : 'Chưa gán bàn'}
                      </div>
                    </div>
                    {booking.occasion && (
                      <div className="info-row">
                        <div className="info-lbl"><Tag size={15} /> Dịp đặc biệt:</div>
                        <div className="info-val">{occasionLabels[booking.occasion]}</div>
                      </div>
                    )}
                    {booking.specialRequests && (
                      <div className="info-row vertical">
                        <div className="info-lbl"><MessageSquare size={15} /> Yêu cầu đặc biệt:</div>
                        <div className="info-val textarea-preview italic">"{booking.specialRequests}"</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Internal Notes */}
                <div className="detail-card-section">
                  <div className="notes-header-row">
                    <h4 className="detail-sec-title"><Clipboard size={16} /> Ghi chú nội bộ</h4>
                    {booking.internalNotes && (
                      <button className="btn-delete-notes" onClick={handleDeleteNotes} title="Xóa toàn bộ ghi chú">
                        <Trash2 size={14} /> Xóa ghi chú
                      </button>
                    )}
                  </div>

                  <div className="notes-list-box">
                    {booking.internalNotes ? (
                      <pre className="notes-content-text">{booking.internalNotes}</pre>
                    ) : (
                      <p className="no-notes-text">Chưa có ghi chú nội bộ cho đơn đặt bàn này.</p>
                    )}
                  </div>

                  <form className="add-note-inline-form" onSubmit={handleAddNote}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Thêm ghi chú nội bộ mới..."
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      disabled={submittingNote}
                    />
                    <button type="submit" className="btn btn-outline" disabled={!noteContent.trim() || submittingNote}>
                      {submittingNote ? 'Lưu...' : 'Ghi'}
                    </button>
                  </form>
                </div>
              </div>

              {/* Right Column: Timeline & Actions */}
              <div className="timeline-actions-section">
                
                {/* Timeline */}
                <StatusTimeline
                  statusHistory={booking.statusHistory}
                  currentStatus={booking.status}
                />

                {/* Operations */}
                {['pending', 'confirmed'].includes(booking.status) && (
                  <div className="detail-card-section operations-card">
                    <h4 className="detail-sec-title">⚙️ Thao tác nghiệp vụ</h4>
                    
                    <div className="operations-buttons-grid">
                      {booking.status === 'pending' && (
                        <>
                          <button className="btn btn-confirm w-full" onClick={handleConfirm}>
                            Duyệt & Xác nhận đặt bàn
                          </button>
                          <button
                            className="btn btn-danger w-full"
                            onClick={() => onCancelClick(booking.id, booking.customerName)}
                          >
                            Từ chối / Hủy đơn đặt
                          </button>
                        </>
                      )}

                      {booking.status === 'confirmed' && (
                        <>
                          <button className="btn btn-confirm w-full" onClick={handleComplete}>
                            ✓ Hoàn thành dùng bữa
                          </button>
                          <button
                            className="btn btn-outline w-full"
                            onClick={() => onChangeTableClick(booking.id, booking.tableNumbers)}
                          >
                            🪑 Đổi bàn phục vụ
                          </button>
                          <button className="btn btn-no-show w-full" onClick={handleNoShow}>
                            👤 Đánh dấu No-show
                          </button>
                          <button
                            className="btn btn-danger w-full"
                            onClick={() => onCancelClick(booking.id, booking.customerName)}
                          >
                            Huỷ đặt bàn này
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
