import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import AdminLayout from '../../components/admin/AdminLayout';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Store, MapPin, Phone, Mail, Clock, ShieldCheck,
  CheckCircle, XCircle, PauseCircle, Users, Activity,
} from 'lucide-react';
import './AdminRestaurants.css';

export default function AdminRestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [approveModal, setApproveModal] = useState(false);
  const [commissionRate, setCommissionRate] = useState(10);
  
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const [suspendModal, setSuspendModal] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getRestaurantById(id);
      setRestaurant(res.data);
      if (res.data.commissionRate) {
        setCommissionRate(res.data.commissionRate);
      }
    } catch (err) {
      toast.error('Không thể tải chi tiết nhà hàng');
      navigate('/admin/restaurants');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      const res = await adminApi.approveRestaurant(id, commissionRate);
      toast.success(res.message);
      setApproveModal(false);
      fetchDetail();
    } catch (err) {
      toast.error(err.message || 'Duyệt thất bại');
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    try {
      const res = await adminApi.rejectRestaurant(id, rejectReason);
      toast.success(res.message);
      setRejectModal(false);
      setRejectReason('');
      fetchDetail();
    } catch (err) {
      toast.error(err.message || 'Từ chối thất bại');
    }
  };

  const handleSuspend = async () => {
    if (!suspendReason.trim()) return;
    try {
      const res = await adminApi.suspendRestaurant(id, suspendReason);
      toast.success(res.message);
      setSuspendModal(false);
      setSuspendReason('');
      fetchDetail();
    } catch (err) {
      toast.error(err.message || 'Tạm ngưng thất bại');
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Chi tiết Nhà hàng">
        <div className="admin-loading">
          <div className="admin-spinner" />
          <span>Đang tải thông tin...</span>
        </div>
      </AdminLayout>
    );
  }

  if (!restaurant) return null;

  const getStatusBadge = (status) => {
    const map = {
      pending: { label: 'Chờ duyệt', cls: 'pending' },
      approved: { label: 'Đã duyệt', cls: 'approved' },
      rejected: { label: 'Từ chối', cls: 'rejected' },
      suspended: { label: 'Tạm ngưng', cls: 'suspended' },
    };
    const s = map[status] || { label: status, cls: '' };
    return <span className={`status-badge ${s.cls}`}>{s.label}</span>;
  };

  return (
    <AdminLayout title={restaurant.name} subtitle="Chi tiết thông tin nhà hàng">
      <div className="detail-header">
        <button className="btn-back" onClick={() => navigate('/admin/restaurants')}>
          <ArrowLeft size={16} /> Quay lại danh sách
        </button>
        <div className="detail-actions">
          {restaurant.approvalStatus === 'pending' && (
            <>
              <button className="btn-success" onClick={() => setApproveModal(true)}>
                <CheckCircle size={16} /> Duyệt
              </button>
              <button className="btn-danger" onClick={() => setRejectModal(true)}>
                <XCircle size={16} /> Từ chối
              </button>
            </>
          )}
          {restaurant.approvalStatus === 'approved' && (
            <button className="btn-warning" onClick={() => setSuspendModal(true)}>
              <PauseCircle size={16} /> Tạm ngưng
            </button>
          )}
          {restaurant.approvalStatus === 'suspended' && (
            <button className="btn-success" onClick={() => setApproveModal(true)}>
              <CheckCircle size={16} /> Mở lại (Duyệt)
            </button>
          )}
        </div>
      </div>

      <div className="detail-grid">
        {/* Left Column */}
        <div className="detail-col">
          {/* Basic Info */}
          <div className="detail-card">
            <h3 className="card-title">Thông tin cơ bản</h3>
            <div className="info-list">
              <div className="info-item">
                <span className="info-label">Trạng thái:</span>
                <span className="info-value">{getStatusBadge(restaurant.approvalStatus)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Tên nhà hàng:</span>
                <span className="info-value bold">{restaurant.name}</span>
              </div>
              <div className="info-item full">
                <span className="info-label">Mô tả:</span>
                <span className="info-value text-muted">{restaurant.description}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Phân khúc:</span>
                <span className="info-value capitalize">{restaurant.priceRange}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Sức chứa:</span>
                <span className="info-value">{restaurant.capacity} khách</span>
              </div>
              <div className="info-item full">
                <span className="info-label">Loại hình (Cuisine):</span>
                <span className="info-value">
                  {restaurant.cuisineTypes?.join(', ') || 'Chưa cập nhật'}
                </span>
              </div>
            </div>
          </div>

          {/* Contact & Location */}
          <div className="detail-card">
            <h3 className="card-title">Liên hệ & Vị trí</h3>
            <div className="info-list">
              <div className="info-item">
                <span className="info-label"><Phone size={14} /> Điện thoại:</span>
                <span className="info-value">{restaurant.phoneNumber}</span>
              </div>
              <div className="info-item">
                <span className="info-label"><Mail size={14} /> Email:</span>
                <span className="info-value">{restaurant.email}</span>
              </div>
              <div className="info-item full">
                <span className="info-label"><MapPin size={14} /> Địa chỉ:</span>
                <span className="info-value">{restaurant.address?.fullAddress || `${restaurant.address?.street}, ${restaurant.address?.ward}, ${restaurant.address?.district}, ${restaurant.address?.city}`}</span>
              </div>
            </div>
          </div>

          {/* Business & Legal */}
          <div className="detail-card">
            <h3 className="card-title">Pháp lý & Tài chính</h3>
            <div className="info-list">
              <div className="info-item">
                <span className="info-label">Mã số thuế:</span>
                <span className="info-value">{restaurant.taxCode || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">GPKD:</span>
                <span className="info-value">{restaurant.businessLicense?.number || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Tỷ lệ hoa hồng:</span>
                <span className="info-value bold amber">{restaurant.commissionRate}%</span>
              </div>
              <div className="info-item">
                <span className="info-label">Doanh thu tổng:</span>
                <span className="info-value">{restaurant.totalRevenue?.toLocaleString('vi-VN')} đ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="detail-col">
          {/* Owner Info */}
          <div className="detail-card">
            <h3 className="card-title">Chủ sở hữu</h3>
            <div className="owner-profile">
              <div className="owner-avatar">
                {restaurant.ownerId?.avatarUrl ? (
                  <img src={restaurant.ownerId.avatarUrl} alt="" />
                ) : (
                  <Users size={24} />
                )}
              </div>
              <div className="owner-details">
                <div className="owner-name-large">{restaurant.ownerId?.fullName || 'N/A'}</div>
                <div className="owner-email">{restaurant.ownerId?.email}</div>
                <div className="owner-phone">{restaurant.ownerId?.phoneNumber || 'Chưa cập nhật SĐT'}</div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="detail-card">
            <h3 className="card-title">Thống kê hoạt động</h3>
            <div className="stats-mini-grid">
              <div className="stat-box">
                <span className="stat-label">Tổng Booking</span>
                <span className="stat-value">{restaurant.stats?.totalBookings || 0}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Đã hoàn thành</span>
                <span className="stat-value green">{restaurant.stats?.completedBookings || 0}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Đã hủy</span>
                <span className="stat-value red">{restaurant.stats?.cancelledBookings || 0}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Đánh giá TB</span>
                <span className="stat-value amber">{restaurant.stats?.averageRating?.toFixed(1) || '0.0'} ⭐</span>
              </div>
            </div>
          </div>

          {/* Moderation Notes */}
          {(restaurant.rejectionReason || restaurant.suspensionReason) && (
            <div className="detail-card warning-card">
              <h3 className="card-title">Ghi chú Kiểm duyệt</h3>
              {restaurant.rejectionReason && (
                <div className="note-box reject">
                  <strong>Lý do từ chối:</strong> {restaurant.rejectionReason}
                </div>
              )}
              {restaurant.suspensionReason && (
                <div className="note-box suspend">
                  <strong>Lý do tạm ngưng:</strong> {restaurant.suspensionReason}
                </div>
              )}
            </div>
          )}

          {/* Images preview */}
          {restaurant.images?.length > 0 && (
            <div className="detail-card">
              <h3 className="card-title">Hình ảnh ({restaurant.images.length})</h3>
              <div className="images-grid">
                {restaurant.images.slice(0, 4).map((img, idx) => (
                  <div key={idx} className="image-preview">
                    <img src={img.url} alt={`img-${idx}`} />
                    {img.isPrimary && <span className="primary-tag">Chính</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Approve Modal */}
      {approveModal && (
        <div className="modal-overlay" onClick={() => setApproveModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Duyệt Nhà Hàng</h3>
            <p>Bạn đang duyệt nhà hàng <strong>{restaurant.name}</strong>.</p>
            <p className="modal-hint">Vui lòng thiết lập tỷ lệ hoa hồng cho nhà hàng này.</p>
            
            <label className="modal-label">Tỷ lệ hoa hồng (%)</label>
            <input
              type="number"
              className="modal-input"
              value={commissionRate}
              onChange={(e) => setCommissionRate(Number(e.target.value))}
              min={0}
              max={100}
            />

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setApproveModal(false)}>Hủy</button>
              <button className="btn-success" onClick={handleApprove}>Xác nhận Duyệt</button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="modal-overlay" onClick={() => { setRejectModal(false); setRejectReason(''); }}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Từ chối Nhà Hàng</h3>
            <p>Từ chối yêu cầu đăng ký của <strong>{restaurant.name}</strong>.</p>
            
            <label className="modal-label">Lý do từ chối (bắt buộc)</label>
            <textarea
              className="modal-input"
              rows={3}
              placeholder="Nhập lý do để thông báo cho chủ nhà hàng..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => { setRejectModal(false); setRejectReason(''); }}>Hủy</button>
              <button className="btn-danger" onClick={handleReject} disabled={!rejectReason.trim()}>
                Xác nhận Từ chối
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Modal */}
      {suspendModal && (
        <div className="modal-overlay" onClick={() => { setSuspendModal(false); setSuspendReason(''); }}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Tạm ngưng Nhà Hàng</h3>
            <p>Tạm ngưng hoạt động của <strong>{restaurant.name}</strong>.</p>
            <p className="modal-hint">Nhà hàng sẽ không còn hiển thị trên app và không thể nhận booking mới.</p>
            
            <label className="modal-label">Lý do tạm ngưng (bắt buộc)</label>
            <textarea
              className="modal-input"
              rows={3}
              placeholder="Nhập lý do..."
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
            />

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => { setSuspendModal(false); setSuspendReason(''); }}>Hủy</button>
              <button className="btn-warning" onClick={handleSuspend} disabled={!suspendReason.trim()}>
                Xác nhận Tạm ngưng
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
