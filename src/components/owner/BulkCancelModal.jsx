import { useState } from 'react';
import { bulkCancelBookings } from '../../api/bookingApi';
import { X, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import './BulkCancelModal.css';

export default function BulkCancelModal({ restaurantId, onClose, onSuccess }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [statusFilter, setStatusFilter] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date) {
      toast.error('Vui lòng chọn ngày');
      return;
    }
    setSubmitting(true);
    try {
      const res = await bulkCancelBookings({ restaurantId, date, statusFilter: statusFilter || undefined, reason: reason || undefined });
      if (res.success) {
        toast.success(res.message || 'Hủy hàng loạt thành công');
        onSuccess?.();
        onClose();
      } else {
        toast.error(res.message || 'Hủy thất bại');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi hủy hàng loạt');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bulk-cancel-overlay" onClick={onClose}>
      <div className="bulk-cancel-modal" onClick={(e) => e.stopPropagation()}>
        <div className="bulk-cancel-header">
          <h3><AlertTriangle size={16} /> Hủy đặt bàn hàng loạt</h3>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="bulk-cancel-warning">
          <AlertTriangle size={20} />
          <p>Thao tác này sẽ hủy tất cả đặt bàn đang chờ xác nhận / đã xác nhận trong ngày đã chọn. Hành động này không thể hoàn tác.</p>
        </div>

        <form onSubmit={handleSubmit} className="bulk-cancel-form">
          <div className="form-group">
            <label>Ngày <span className="required">*</span></label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Trạng thái (tùy chọn)</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">Tất cả (pending + confirmed)</option>
              <option value="pending">Chờ xác nhận</option>
              <option value="confirmed">Đã xác nhận</option>
            </select>
          </div>
          <div className="form-group">
            <label>Lý do (tùy chọn)</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows="2" placeholder="VD: Nhà hàng bảo trì, đóng cửa đột xuất..." />
          </div>

          <div className="bulk-cancel-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Quay lại</button>
            <button type="submit" className="btn-danger" disabled={submitting}>
              {submitting ? 'Đang xử lý...' : 'Xác nhận hủy hàng loạt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
