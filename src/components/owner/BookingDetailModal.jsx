import { useState, useEffect, useCallback, useRef } from 'react';
import { getBookingDetail, confirmBooking, completeBooking, markNoShow, addInternalNote, deleteInternalNote } from '../../api/bookingApi';
import StatusBadge from '../booking/StatusBadge';
import StatusTimeline from '../booking/StatusTimeline';
import { X, User, Phone, Mail, Calendar, Clock, Users, ShieldAlert, Tag, MessageSquare, Clipboard, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../ui/button';

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
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm" 
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-left"
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-detail-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
          <h3 id="booking-detail-modal-title" className="font-serif text-lg font-bold text-white">
            📋 Chi tiết đặt bàn #{bookingId.substring(18).toUpperCase()}
          </h3>
          <button 
            type="button" 
            className="text-muted-foreground hover:text-white transition rounded-lg p-1 hover:bg-secondary/40" 
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-sm text-muted-foreground">
            <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p>Đang tải chi tiết đặt bàn...</p>
          </div>
        ) : !booking ? null : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              
              {/* Left Column: Details */}
              <div className="space-y-4">
                
                {/* Status Box */}
                <div className="p-4 rounded-xl bg-[#0F1115]/50 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Trạng thái hiện tại:</span>
                    <StatusBadge status={booking.status} />
                  </div>
                  {booking.status === 'cancelled' && (
                    <div className="text-xs text-rose-450 mt-1 sm:mt-0 font-medium">
                      <strong>Lý do hủy:</strong> {booking.cancellationReason || 'Không rõ lý do'}
                    </div>
                  )}
                </div>

                {/* Customer Contact */}
                <div className="p-4 rounded-xl bg-[#0F1115]/30 border border-border space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-border/40 pb-2">
                    👤 Thông tin khách hàng
                  </h4>
                  <div className="grid grid-cols-1 gap-2 text-xs">
                    <div className="flex items-center gap-2.5 text-white/95">
                      <User size={14} className="text-muted-foreground/60" /> 
                      <span>Họ tên: <strong className="text-white font-semibold">{booking.customerName}</strong></span>
                    </div>
                    <div className="flex items-center gap-2.5 text-white/95">
                      <Phone size={14} className="text-muted-foreground/60" /> 
                      <span>Số ĐT: <strong className="text-white font-semibold">{booking.customerPhone}</strong></span>
                    </div>
                    <div className="flex items-center gap-2.5 text-white/95">
                      <Mail size={14} className="text-muted-foreground/60" /> 
                      <span>Email: <strong className="text-white font-semibold">{booking.customerEmail}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Booking Info */}
                <div className="p-4 rounded-xl bg-[#0F1115]/30 border border-border space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-border/40 pb-2">
                    🍽️ Chi tiết đơn đặt
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-muted-foreground/60 shrink-0" />
                      <div>Ngày ăn: <strong className="text-white font-semibold">{new Date(booking.bookingDate).toLocaleDateString('vi-VN')}</strong></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-muted-foreground/60 shrink-0" />
                      <div>Giờ ăn: <strong className="text-primary font-bold text-sm">{booking.bookingTime}</strong></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-muted-foreground/60 shrink-0" />
                      <div>Số khách: <strong className="text-white font-semibold">{booking.numberOfGuests}</strong> người</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldAlert size={14} className="text-muted-foreground/60 shrink-0" />
                      <div>Bàn gán: <strong className="text-primary font-bold text-sm">{booking.tableNumbers?.length > 0 ? booking.tableNumbers.join(', ') : 'Chưa gán bàn'}</strong></div>
                    </div>
                    {booking.occasion && (
                      <div className="flex items-center gap-2 sm:col-span-2">
                        <Tag size={14} className="text-muted-foreground/60 shrink-0" />
                        <div>Dịp đặc biệt: <strong className="text-white font-medium">{occasionLabels[booking.occasion]}</strong></div>
                      </div>
                    )}
                    {booking.specialRequests && (
                      <div className="flex flex-col gap-1.5 sm:col-span-2 pt-1">
                        <div className="flex items-center gap-2 font-semibold text-muted-foreground/90">
                          <MessageSquare size={14} className="text-muted-foreground/60 shrink-0" />
                          <span>Yêu cầu đặc biệt:</span>
                        </div>
                        <div className="p-2 bg-[#0F1115]/60 border border-border rounded-lg text-[11px] text-muted-foreground italic leading-normal">
                          "{booking.specialRequests}"
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Internal Notes */}
                <div className="p-4 rounded-xl bg-[#0F1115]/30 border border-border space-y-3">
                  <div className="flex justify-between items-center border-b border-border/40 pb-2">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Clipboard size={14} className="text-muted-foreground/60" /> Ghi chú nội bộ
                    </h4>
                    {booking.internalNotes && (
                      <button 
                        type="button"
                        className="text-[10px] text-rose-400 hover:text-rose-300 font-medium inline-flex items-center gap-0.5 border border-rose-500/20 bg-rose-500/5 px-2 py-0.5 rounded transition cursor-pointer" 
                        onClick={handleDeleteNotes} 
                        title="Xóa ghi chú"
                      >
                        <Trash2 size={10} /> Xóa hết
                      </button>
                    )}
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#0F1115]/65 text-xs border border-border/60">
                    {booking.internalNotes ? (
                      <pre className="whitespace-pre-wrap font-sans text-muted-foreground leading-normal">{booking.internalNotes}</pre>
                    ) : (
                      <p className="text-muted-foreground/50 italic text-center py-2">Chưa có ghi chú nội bộ cho đơn đặt bàn này.</p>
                    )}
                  </div>

                  <form className="flex items-center gap-2 mt-2" onSubmit={handleAddNote}>
                    <input
                      type="text"
                      className="flex-1 bg-[#0F1115] border border-border text-white text-xs rounded-xl px-3 py-2 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-all"
                      placeholder="Thêm ghi chú nội bộ mới..."
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      disabled={submittingNote}
                    />
                    <Button 
                      type="submit" 
                      variant="outline" 
                      size="sm"
                      disabled={!noteContent.trim() || submittingNote}
                      className="border-border text-xs shrink-0"
                    >
                      {submittingNote ? 'Đang lưu...' : 'Ghi'}
                    </Button>
                  </form>
                </div>
              </div>

              {/* Right Column: Timeline & Actions */}
              <div className="space-y-4">
                {/* Timeline */}
                <div className="p-4 rounded-xl bg-[#0F1115]/30 border border-border">
                  <StatusTimeline
                    statusHistory={booking.statusHistory}
                    currentStatus={booking.status}
                  />
                </div>

                {/* Operations */}
                {['pending', 'confirmed'].includes(booking.status) && (
                  <div className="p-4 rounded-xl bg-[#0F1115]/35 border border-border space-y-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-border/40 pb-2">
                      ⚙️ Thao tác nghiệp vụ
                    </h4>
                    
                    <div className="flex flex-col gap-2 pt-1">
                      {booking.status === 'pending' && (
                        <>
                          <Button 
                            variant="default"
                            onClick={handleConfirm}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs h-10"
                          >
                            Duyệt & Xác nhận đặt bàn
                          </Button>
                          <Button 
                            variant="destructive"
                            onClick={() => onCancelClick(booking.id, booking.customerName)}
                            className="w-full text-xs h-10"
                          >
                            Từ chối / Hủy đơn đặt
                          </Button>
                        </>
                      )}

                      {booking.status === 'confirmed' && (
                        <>
                          <Button 
                            variant="default"
                            onClick={handleComplete}
                            className="w-full bg-emerald-650 hover:bg-emerald-550 text-white font-semibold text-xs h-10"
                          >
                            ✓ Hoàn thành dùng bữa
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => onChangeTableClick(booking.id, booking.tableNumbers)}
                            className="w-full border-border hover:bg-secondary/40 text-xs h-10"
                          >
                            🪑 Đổi bàn phục vụ
                          </Button>
                          <Button 
                            variant="default"
                            onClick={handleNoShow}
                            className="w-full bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs h-10"
                          >
                            👤 Đánh dấu Khách vắng mặt (No-show)
                          </Button>
                          <Button 
                            variant="destructive"
                            onClick={() => onCancelClick(booking.id, booking.customerName)}
                            className="w-full text-xs h-10"
                          >
                            Hủy đặt bàn này
                          </Button>
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
