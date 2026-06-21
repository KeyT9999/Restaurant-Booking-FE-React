import { useState } from 'react';
import { ownerCreateBooking } from '../../api/bookingApi';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import './CreateBookingModal.css';

export default function CreateBookingModal({ restaurantId, onClose, onSuccess }) {
  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    bookingDate: '',
    bookingTime: '',
    numberOfGuests: 2,
    specialRequests: '',
    setConfirmed: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customerName || !form.customerPhone || !form.bookingDate || !form.bookingTime) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }
    setSubmitting(true);
    try {
      const res = await ownerCreateBooking({
        ...form,
        restaurantId,
        numberOfGuests: Number(form.numberOfGuests),
      });
      if (res.success) {
        toast.success('Tạo đặt bàn thành công');
        onSuccess?.();
        onClose();
      } else {
        toast.error(res.message || 'Tạo thất bại');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi tạo đặt bàn');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="create-booking-overlay" onClick={onClose}>
      <div className="create-booking-modal" onClick={(e) => e.stopPropagation()}>
        <div className="create-booking-modal-header">
          <h3>Tạo đặt bàn thủ công</h3>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="create-booking-form">
          <div className="form-row">
            <div className="form-group">
              <label>Tên khách <span className="required">*</span></label>
              <input name="customerName" value={form.customerName} onChange={handleChange} placeholder="Nguyễn Văn A" />
            </div>
            <div className="form-group">
              <label>Số điện thoại <span className="required">*</span></label>
              <input name="customerPhone" value={form.customerPhone} onChange={handleChange} placeholder="0901234567" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input name="customerEmail" value={form.customerEmail} onChange={handleChange} placeholder="customer@email.com" />
            </div>
            <div className="form-group">
              <label>Số khách <span className="required">*</span></label>
              <input name="numberOfGuests" type="number" min="1" max="100" value={form.numberOfGuests} onChange={handleChange} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Ngày <span className="required">*</span></label>
              <input name="bookingDate" type="date" value={form.bookingDate} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Giờ <span className="required">*</span></label>
              <input name="bookingTime" type="time" value={form.bookingTime} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group">
            <label>Ghi chú</label>
            <textarea name="specialRequests" value={form.specialRequests} onChange={handleChange} rows="2" placeholder="Yêu cầu đặc biệt..." />
          </div>
          <div className="form-group form-checkbox">
            <label>
              <input name="setConfirmed" type="checkbox" checked={form.setConfirmed} onChange={handleChange} />
              <span>Xác nhận ngay (không cần duyệt)</span>
            </label>
          </div>

          <div className="create-booking-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting ? 'Đang tạo...' : 'Tạo đặt bàn'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
