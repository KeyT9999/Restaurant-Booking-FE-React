import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import AdminLayout from '../../components/admin/AdminLayout';
import toast from 'react-hot-toast';
import {
  ArrowLeft, CalendarDays, Clock, Users, User, Store,
  MapPin, Phone, Mail, CheckCircle, Save,
} from 'lucide-react';
import './AdminBookings.css';

const STATUSES = [
  { value: 'pending', label: 'Chờ xác nhận' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'completed', label: 'Đã hoàn thành' },
  { value: 'cancelled', label: 'Đã hủy' },
  { value: 'no_show', label: 'Khách không đến' },
];

export default function AdminBookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  // Status edit state
  const [status, setStatus] = useState('');
  const [note, setNote] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getBookingById(id);
      setBooking(res.data);
      setStatus(res.data.status);
      setInternalNotes(res.data.internalNotes || '');
    } catch (err) {
      toast.error('Không thể tải chi tiết đặt bàn');
      navigate('/admin/bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (status === booking.status && internalNotes === (booking.internalNotes || '')) {
      toast('Không có thay đổi nào', { icon: 'ℹ️' });
      return;
    }

    setSaving(true);
    try {
      const res = await adminApi.updateBookingStatus(id, { status, note, internalNotes });
      toast.success(res.message);
      setBooking(res.data);
      setNote(''); // reset note input after success
    } catch (err) {
      toast.error(err.message || 'Cập nhật thất bại');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Chi tiết Đặt bàn">
        <div className="admin-loading">
          <div className="admin-spinner" />
          <span>Đang tải thông tin...</span>
        </div>
      </AdminLayout>
    );
  }

  if (!booking) return null;

  const getStatusBadge = (s) => {
    const map = {
      pending:   { label: 'Chờ xác nhận', cls: 'pending' },
      confirmed: { label: 'Đã xác nhận', cls: 'confirmed' },
      completed: { label: 'Hoàn thành',   cls: 'completed' },
      cancelled: { label: 'Đã hủy',       cls: 'cancelled' },
      no_show:   { label: 'Không đến',    cls: 'no-show' },
    };
    const mapped = map[s] || { label: s, cls: '' };
    return <span className={`status-badge ${mapped.cls}`}>{mapped.label}</span>;
  };

  return (
    <AdminLayout title="Chi tiết Đặt bàn" subtitle={`Mã: ${booking.id.substring(0, 8).toUpperCase()}`}>
      <div className="detail-header">
        <button className="btn-back" onClick={() => navigate('/admin/bookings')}>
          <ArrowLeft size={16} /> Quay lại danh sách
        </button>
      </div>

      <div className="detail-grid">
        {/* Left Column */}
        <div className="detail-col">
          {/* Booking Info */}
          <div className="detail-card">
            <h3 className="card-title">Thông tin Đặt bàn</h3>
            <div className="info-list">
              <div className="info-item">
                <span className="info-label"><CalendarDays size={14} /> Ngày đặt:</span>
                <span className="info-value bold">
                  {new Date(booking.bookingDate).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label"><Clock size={14} /> Giờ đặt:</span>
                <span className="info-value bold amber">{booking.bookingTime}</span>
              </div>
              <div className="info-item">
                <span className="info-label"><Users size={14} /> Số lượng khách:</span>
                <span className="info-value">{booking.numberOfGuests} người</span>
              </div>
              <div className="info-item">
                <span className="info-label">Dịp đặc biệt (Occasion):</span>
                <span className="info-value capitalize">{booking.occasion || 'Không có'}</span>
              </div>
              <div className="info-item full">
                <span className="info-label">Yêu cầu đặc biệt:</span>
                <span className="info-value text-muted">
                  {booking.specialRequests || 'Không có yêu cầu đặc biệt'}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="detail-card">
            <h3 className="card-title">Thông tin Khách hàng</h3>
            <div className="info-list">
              <div className="info-item">
                <span className="info-label"><User size={14} /> Tên khách hàng:</span>
                <span className="info-value bold">{booking.customerName}</span>
              </div>
              <div className="info-item">
                <span className="info-label"><Phone size={14} /> Điện thoại:</span>
                <span className="info-value">{booking.customerPhone}</span>
              </div>
              <div className="info-item full">
                <span className="info-label"><Mail size={14} /> Email:</span>
                <span className="info-value">{booking.customerEmail}</span>
              </div>
            </div>
          </div>

          {/* Restaurant Info */}
          <div className="detail-card">
            <h3 className="card-title">Nhà hàng</h3>
            <div className="info-list">
              <div className="info-item full">
                <span className="info-label"><Store size={14} /> Tên nhà hàng:</span>
                <span className="info-value bold amber">{booking.restaurantId?.name || 'N/A'}</span>
              </div>
              <div className="info-item full">
                <span className="info-label"><MapPin size={14} /> Địa chỉ:</span>
                <span className="info-value">
                  {booking.restaurantId?.address?.fullAddress || 
                   `${booking.restaurantId?.address?.street || ''}, ${booking.restaurantId?.address?.district || ''}, ${booking.restaurantId?.address?.city || ''}`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="detail-col">
          {/* Status Update */}
          <div className="detail-card">
            <h3 className="card-title">Trạng thái & Cập nhật</h3>
            
            <div className="info-item" style={{ marginBottom: '20px' }}>
              <span className="info-label">Trạng thái hiện tại:</span>
              <span className="info-value" style={{ marginTop: '8px' }}>
                {getStatusBadge(booking.status)}
              </span>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="modal-label">Cập nhật trạng thái:</label>
              <select
                className="select-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {STATUSES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            {status !== booking.status && (
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="modal-label">Ghi chú đổi trạng thái (Gửi cho khách/nhà hàng):</label>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="Vd: Quá giờ, Khách yêu cầu hủy..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            )}

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="modal-label">Ghi chú nội bộ (Chỉ Admin xem):</label>
              <textarea
                className="modal-input"
                rows={3}
                placeholder="Ghi chú nội bộ cho quản trị viên..."
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
              />
            </div>

            <button
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={handleUpdateStatus}
              disabled={saving}
            >
              <Save size={16} /> {saving ? 'Đang lưu...' : 'Lưu cập nhật'}
            </button>
          </div>

          {/* Status History */}
          {booking.statusHistory && booking.statusHistory.length > 0 && (
            <div className="detail-card">
              <h3 className="card-title">Lịch sử trạng thái</h3>
              <div className="history-timeline">
                {booking.statusHistory.slice().reverse().map((hist, idx) => (
                  <div key={idx} className="history-item">
                    <div className="history-dot" />
                    <div className="history-content">
                      <div className="history-top">
                        {getStatusBadge(hist.status)}
                        <span className="history-date">
                          {new Date(hist.changedAt).toLocaleString('vi-VN')}
                        </span>
                      </div>
                      {hist.note && (
                        <div className="history-note">
                          <strong>Note:</strong> {hist.note}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
