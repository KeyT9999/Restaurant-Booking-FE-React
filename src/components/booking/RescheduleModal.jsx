import { useState } from 'react';
import { rescheduleBooking } from '../../api/bookingApi';
import { X, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import './RescheduleModal.css';

export default function RescheduleModal({ booking, onClose, onSuccess }) {
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newDate || !newTime) {
      toast.error('Vui lòng chọn ngày và giờ mới');
      return;
    }
    setSubmitting(true);
    try {
      const res = await rescheduleBooking(booking._id, { newDate, newTime });
      if (res.success) {
        toast.success('Đổi lịch đặt bàn thành công');
        onSuccess?.(res.data);
        onClose();
      } else {
        toast.error(res.message || 'Đổi lịch thất bại');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi đổi lịch');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="reschedule-overlay" onClick={onClose}>
      <div className="reschedule-modal" onClick={(e) => e.stopPropagation()}>
        <div className="reschedule-modal-header">
          <h3><Calendar size={16} /> Đổi lịch đặt bàn</h3>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="reschedule-current">
          <p className="reschedule-label">Thời gian hiện tại:</p>
          <p className="reschedule-current-time">
            {new Date(booking.bookingDate).toLocaleDateString('vi-VN')} - {booking.bookingTime}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="reschedule-form">
          <div className="reschedule-row">
            <div className="reschedule-group">
              <label>Ngày mới <span className="required">*</span></label>
              <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} min={new Date().toISOString().slice(0, 10)} />
            </div>
            <div className="reschedule-group">
              <label>Giờ mới <span className="required">*</span></label>
              <input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} />
            </div>
          </div>

          <div className="reschedule-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting ? 'Đang xử lý...' : 'Xác nhận đổi lịch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
