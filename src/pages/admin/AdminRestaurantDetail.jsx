import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import AdminLayout from '../../components/admin/AdminLayout';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Store, MapPin, Phone, Mail, Clock, ShieldCheck,
  CheckCircle, XCircle, PauseCircle, Users, Activity, CreditCard,
  FileText, History, Star, Landmark, Eye, Undo, Play, Trash2
} from 'lucide-react';
import './AdminRestaurantDetail.css';

// Components & Modals
import RestaurantStatusBadge from '../../components/admin/RestaurantStatusBadge';
import ApproveModal from '../../components/admin/ApproveModal';
import RejectModal from '../../components/admin/RejectModal';
import SuspendModal from '../../components/admin/SuspendModal';
import UnsuspendModal from '../../components/admin/UnsuspendModal';
import DeleteModal from '../../components/admin/DeleteModal';
import RestoreModal from '../../components/admin/RestoreModal';
import ActivityTimeline from '../../components/admin/ActivityTimeline';

export default function AdminRestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Data state
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'financial' | 'logs'
  const [actionLoading, setActionLoading] = useState(false);

  // Edit settings state
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [editCommissionRate, setEditCommissionRate] = useState(10);
  const [editFeatured, setEditFeatured] = useState(false);

  // Logs state
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsPage, setLogsPage] = useState(1);
  const [logsTotalPages, setLogsTotalPages] = useState(1);

  // Modals state
  const [activeModal, setActiveModal] = useState(null); // 'approve' | 'reject' | 'suspend' | 'unsuspend' | 'delete' | 'restore'
  const [showLicenseViewer, setShowLicenseViewer] = useState(false);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'logs') {
      fetchLogs(1, true);
    }
  }, [activeTab, id]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getRestaurantById(id);
      setRestaurant(res.data);
      setEditCommissionRate(res.data.commissionRate ?? 10);
      setEditFeatured(res.data.featured ?? false);
    } catch (err) {
      toast.error('Không thể tải chi tiết nhà hàng');
      navigate('/admin/restaurants');
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async (page = 1, isNew = false) => {
    setLogsLoading(true);
    try {
      const res = await adminApi.getActivityLogs(id, { page, limit: 10 });
      if (isNew) {
        setLogs(res.data.logs);
      } else {
        setLogs((prev) => [...prev, ...res.data.logs]);
      }
      setLogsPage(res.data.page);
      setLogsTotalPages(res.data.totalPages);
    } catch (err) {
      toast.error(err.message || 'Không thể tải lịch sử hoạt động');
    } finally {
      setLogsLoading(false);
    }
  };

  const handleLoadMoreLogs = () => {
    if (logsPage < logsTotalPages) {
      fetchLogs(logsPage + 1, false);
    }
  };

  // Modals confirming callbacks
  const onApproveConfirm = async (id, commissionRate) => {
    setActionLoading(true);
    try {
      const res = await adminApi.approveRestaurant(id, commissionRate);
      toast.success(res.message || 'Đã duyệt nhà hàng thành công');
      setActiveModal(null);
      fetchDetail();
    } catch (err) {
      toast.error(err.message || 'Duyệt nhà hàng thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const onRejectConfirm = async (id, reason) => {
    setActionLoading(true);
    try {
      const res = await adminApi.rejectRestaurant(id, reason);
      toast.success(res.message || 'Đã từ chối duyệt hồ sơ');
      setActiveModal(null);
      fetchDetail();
    } catch (err) {
      toast.error(err.message || 'Từ chối thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const onSuspendConfirm = async (id, reason) => {
    setActionLoading(true);
    try {
      const res = await adminApi.suspendRestaurant(id, reason);
      toast.success(res.message || 'Đã tạm ngưng hoạt động');
      setActiveModal(null);
      fetchDetail();
    } catch (err) {
      toast.error(err.message || 'Tạm ngưng thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const onUnsuspendConfirm = async (id) => {
    setActionLoading(true);
    try {
      const res = await adminApi.unsuspendRestaurant(id);
      toast.success(res.message || 'Đã gỡ tạm ngưng hoạt động');
      setActiveModal(null);
      fetchDetail();
    } catch (err) {
      toast.error(err.message || 'Gỡ tạm ngưng thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const onDeleteConfirm = async (id, reason) => {
    setActionLoading(true);
    try {
      const res = await adminApi.deleteRestaurant(id, reason);
      toast.success(res.message || 'Đã xóa nhà hàng');
      setActiveModal(null);
      fetchDetail();
    } catch (err) {
      toast.error(err.message || 'Xóa thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const onRestoreConfirm = async (id) => {
    setActionLoading(true);
    try {
      const res = await adminApi.restoreRestaurant(id);
      toast.success(res.message || 'Đã khôi phục nhà hàng');
      setActiveModal(null);
      fetchDetail();
    } catch (err) {
      toast.error(err.message || 'Khôi phục thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setActionLoading(true);
    try {
      const res = await adminApi.updateRestaurant(id, {
        commissionRate: editCommissionRate,
        featured: editFeatured,
      });
      toast.success(res.message || 'Cập nhật cấu hình thành công');
      setIsEditingSettings(false);
      fetchDetail();
    } catch (err) {
      toast.error(err.message || 'Cập nhật cấu hình thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Chi tiết Nhà hàng">
        <div className="admin-loading">
          <div className="admin-spinner" />
          <span>Đang tải thông tin nhà hàng...</span>
        </div>
      </AdminLayout>
    );
  }

  if (!restaurant) return null;
  const isDeleted = !!restaurant.deletedAt;

  return (
    <AdminLayout title={restaurant.name} subtitle={`Quản lý nhà hàng của ${restaurant.ownerId?.fullName || 'N/A'}`}>
      <div className="detail-header">
        <button className="btn-back" onClick={() => navigate('/admin/restaurants')}>
          <ArrowLeft size={16} /> Quay lại danh sách
        </button>
        <div className="detail-actions">
          {isDeleted ? (
            <button className="btn-success" onClick={() => setActiveModal('restore')}>
              <Undo size={16} /> Khôi phục nhà hàng
            </button>
          ) : (
            <>
              {restaurant.approvalStatus === 'pending' && (
                <>
                  <button className="btn-success" onClick={() => setActiveModal('approve')}>
                    <CheckCircle size={16} /> Duyệt hoạt động
                  </button>
                  <button className="btn-danger" onClick={() => setActiveModal('reject')}>
                    <XCircle size={16} /> Từ chối duyệt
                  </button>
                </>
              )}
              {restaurant.approvalStatus === 'approved' && (
                <button className="btn-warning" onClick={() => setActiveModal('suspend')}>
                  <PauseCircle size={16} /> Tạm ngưng
                </button>
              )}
              {restaurant.approvalStatus === 'suspended' && (
                <button className="btn-success" onClick={() => setActiveModal('unsuspend')}>
                  <Play size={16} /> Gỡ tạm ngưng
                </button>
              )}
              {restaurant.approvalStatus === 'rejected' && (
                <button className="btn-success" onClick={() => setActiveModal('approve')}>
                  <CheckCircle size={16} /> Duyệt lại
                </button>
              )}
              <button className="btn-danger" onClick={() => setActiveModal('delete')}>
                <Trash2 size={16} /> Xóa nhà hàng
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs list */}
      <div className="detail-tabs">
        <button
          className={`detail-tab-btn ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          <Store size={15} /> Thông tin
        </button>
        <button
          className={`detail-tab-btn ${activeTab === 'financial' ? 'active' : ''}`}
          onClick={() => setActiveTab('financial')}
        >
          <CreditCard size={15} /> Tài chính & Pháp lý
        </button>
        <button
          className={`detail-tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          <History size={15} /> Lịch sử hoạt động
        </button>
      </div>

      {/* Tab Contents */}
      <div className="tab-content-wrapper">
        
        {/* Tab 1: INFO */}
        {activeTab === 'info' && (
          <div className="detail-grid">
            <div className="detail-col">
              {/* Basic Info */}
              <div className="detail-card">
                <h3 className="card-title">Thông tin cơ bản</h3>
                <div className="info-list">
                  <div className="info-item">
                    <span className="info-label">Trạng thái duyệt:</span>
                    <span className="info-value">
                      <RestaurantStatusBadge status={isDeleted ? 'deleted' : restaurant.approvalStatus} />
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Ghim nổi bật:</span>
                    <span className="info-value" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {restaurant.featured ? (
                        <>
                          <Star size={14} fill="#fbbf24" color="#fbbf24" />
                          <span style={{ color: '#fbbf24', fontWeight: 600 }}>Nổi bật</span>
                        </>
                      ) : (
                        <span style={{ color: 'var(--color-faded-stone)' }}>Không</span>
                      )}
                    </span>
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
                    <span className="info-label">Phân khúc giá:</span>
                    <span className="info-value capitalize">{restaurant.priceRange}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Sức chứa tối đa:</span>
                    <span className="info-value">{restaurant.capacity} khách</span>
                  </div>
                  <div className="info-item full">
                    <span className="info-label">Loại ẩm thực:</span>
                    <span className="info-value">
                      {restaurant.cuisineTypes && restaurant.cuisineTypes.length > 0 ? (
                        <div className="tags-container">
                          {restaurant.cuisineTypes.map((tag) => (
                            <span key={tag} className="tag-item">{tag}</span>
                          ))}
                        </div>
                      ) : 'Chưa cập nhật'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact & Location */}
              <div className="detail-card">
                <h3 className="card-title">Liên hệ & Địa chỉ</h3>
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
                    <span className="info-label"><MapPin size={14} /> Địa chỉ chi tiết:</span>
                    <span className="info-value">{restaurant.address?.fullAddress}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Tỉnh / Thành phố:</span>
                    <span className="info-value">{restaurant.address?.city}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Quận / Huyện:</span>
                    <span className="info-value">{restaurant.address?.district}</span>
                  </div>
                </div>
              </div>

              {/* Operating Hours */}
              <div className="detail-card">
                <h3 className="card-title"><Clock size={14} /> Giờ hoạt động</h3>
                <div className="operating-hours-table">
                  {restaurant.operatingHours ? (
                    Object.keys(restaurant.operatingHours).map((day) => {
                      const hours = restaurant.operatingHours[day];
                      const dayLabels = {
                        monday: 'Thứ Hai', tuesday: 'Thứ Ba', wednesday: 'Thứ Tư',
                        thursday: 'Thứ Năm', friday: 'Thứ Sáu', saturday: 'Thứ Bảy', sunday: 'Chủ Nhật'
                      };
                      return (
                        <div key={day} className="hours-row">
                          <span className="day-name">{dayLabels[day] || day}</span>
                          <span className="hours-time">
                            {hours.closed ? (
                              <span className="closed-tag">Đóng cửa</span>
                            ) : (
                              `${hours.open} - ${hours.close}`
                            )}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <p style={{ fontSize: '13px', color: 'var(--color-faded-stone)' }}>Chưa cập nhật</p>
                  )}
                </div>
              </div>
            </div>

            <div className="detail-col">
              {/* Owner Profile */}
              <div className="detail-card">
                <h3 className="card-title">Chủ sở hữu</h3>
                <div className="owner-profile">
                  <div className="owner-avatar">
                    {restaurant.ownerId?.fullName?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="owner-details">
                    <div className="owner-name-large">{restaurant.ownerId?.fullName || 'N/A'}</div>
                    <div className="owner-email">{restaurant.ownerId?.email}</div>
                    <div className="owner-phone">{restaurant.ownerId?.phoneNumber || 'Chưa cập nhật SĐT'}</div>
                  </div>
                </div>
              </div>

              {/* Stats overview */}
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

              {/* Moderation Warnings */}
              {(restaurant.rejectionReason || restaurant.suspensionReason || restaurant.deleteReason) && (
                <div className="detail-card warning-card">
                  <h3 className="card-title" style={{ color: '#fb923c' }}>Ghi chú Kiểm duyệt</h3>
                  {restaurant.rejectionReason && (
                    <div className="note-box reject">
                      <strong>Lý do từ chối duyệt:</strong> {restaurant.rejectionReason}
                    </div>
                  )}
                  {restaurant.suspensionReason && (
                    <div className="note-box suspend">
                      <strong>Lý do tạm ngưng:</strong> {restaurant.suspensionReason}
                    </div>
                  )}
                  {restaurant.deleteReason && (
                    <div className="note-box delete">
                      <strong>Lý do xóa nhà hàng:</strong> {restaurant.deleteReason}
                    </div>
                  )}
                </div>
              )}

              {/* Admin configuration settings */}
              {!isDeleted && (
                <div className="detail-card admin-config-card">
                  <h3 className="card-title">Cấu hình Admin</h3>
                  {!isEditingSettings ? (
                    <div className="config-view-mode">
                      <div className="info-item">
                        <span className="info-label">Tỷ lệ hoa hồng:</span>
                        <span className="info-value bold amber">{restaurant.commissionRate ?? 10}%</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Ghi nhận nổi bật:</span>
                        <span className="info-value">{restaurant.featured ? 'Đang Bật' : 'Đang Tắt'}</span>
                      </div>
                      <button 
                        className="btn-primary" 
                        style={{ marginTop: '16px', width: '100%', justifyContent: 'center' }}
                        onClick={() => setIsEditingSettings(true)}
                      >
                        Chỉnh sửa cấu hình
                      </button>
                    </div>
                  ) : (
                    <div className="config-edit-mode" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div className="form-group">
                        <label>Tỷ lệ hoa hồng (%)</label>
                        <input
                          type="number"
                          className="modal-input"
                          min="0"
                          max="100"
                          value={editCommissionRate}
                          onChange={(e) => setEditCommissionRate(Number(e.target.value))}
                        />
                      </div>
                      <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                        <input
                          type="checkbox"
                          id="featured-check"
                          checked={editFeatured}
                          onChange={(e) => setEditFeatured(e.target.checked)}
                          style={{ width: 'auto', cursor: 'pointer' }}
                        />
                        <label htmlFor="featured-check" style={{ cursor: 'pointer' }}>Ghim nổi bật (Featured)</label>
                      </div>
                      <div className="form-actions" style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                        <button className="btn-cancel" style={{ flex: 1 }} onClick={() => { setIsEditingSettings(false); setEditCommissionRate(restaurant.commissionRate ?? 10); setEditFeatured(restaurant.featured ?? false); }}>Hủy</button>
                        <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleSaveSettings} disabled={actionLoading}>
                          {actionLoading ? 'Đang lưu...' : 'Lưu lại'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Gallery Images */}
              {restaurant.images && restaurant.images.length > 0 && (
                <div className="detail-card">
                  <h3 className="card-title">Hình ảnh nhà hàng</h3>
                  <div className="images-preview-grid">
                    {restaurant.images.map((img, idx) => (
                      <div key={idx} className="detail-image-preview">
                        <img src={img.url} alt="" />
                        {img.isPrimary && <span className="primary-tag">Chính</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: FINANCIAL & LEGAL */}
        {activeTab === 'financial' && (
          <div className="detail-grid">
            <div className="detail-col">
              {/* Financial Balance Info */}
              <div className="detail-card">
                <h3 className="card-title"><Landmark size={15} /> Tổng quan tài chính</h3>
                <div className="info-list">
                  <div className="info-item">
                    <span className="info-label">Số dư hiện tại (Balance):</span>
                    <span className="info-value bold green">{restaurant.balance?.toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Doanh thu tổng:</span>
                    <span className="info-value">{restaurant.totalRevenue?.toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Hoa hồng đã thu:</span>
                    <span className="info-value bold amber">{restaurant.totalCommission?.toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Tỷ lệ chiết khấu:</span>
                    <span className="info-value">{restaurant.commissionRate ?? 10}%</span>
                  </div>
                </div>
              </div>

              {/* Bank Transfer Details */}
              <div className="detail-card">
                <h3 className="card-title">Thông tin tài khoản ngân hàng</h3>
                {restaurant.bankInfo && restaurant.bankInfo.bankName ? (
                  <div className="info-list">
                    <div className="info-item">
                      <span className="info-label">Ngân hàng nhận:</span>
                      <span className="info-value bold">{restaurant.bankInfo.bankName}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Số tài khoản:</span>
                      <span className="info-value bold amber">{restaurant.bankInfo.accountNumber}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Chủ tài khoản:</span>
                      <span className="info-value capitalize">{restaurant.bankInfo.accountHolder}</span>
                    </div>
                    <div className="info-item full">
                      <span className="info-label">Chi nhánh ngân hàng:</span>
                      <span className="info-value">{restaurant.bankInfo.branch || 'Chưa cập nhật'}</span>
                    </div>
                  </div>
                ) : (
                  <p style={{ fontSize: '13px', color: 'var(--color-faded-stone)', padding: '10px 0' }}>Chủ nhà hàng chưa thiết lập thông tin ngân hàng rút tiền.</p>
                )}
              </div>
            </div>

            <div className="detail-col">
              {/* Business License & Tax Code */}
              <div className="detail-card">
                <h3 className="card-title"><FileText size={15} /> Hồ sơ pháp lý</h3>
                <div className="info-list">
                  <div className="info-item">
                    <span className="info-label">Mã số thuế doanh nghiệp:</span>
                    <span className="info-value bold">{restaurant.taxCode || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Số giấy phép kinh doanh:</span>
                    <span className="info-value bold">{restaurant.businessLicense?.number || 'Chưa cập nhật'}</span>
                  </div>
                  {restaurant.businessLicense?.verifiedAt && (
                    <div className="info-item full">
                      <span className="info-label">Ngày xác thực GPKD:</span>
                      <span className="info-value text-muted">{new Date(restaurant.businessLicense.verifiedAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  )}
                  {restaurant.businessLicense?.imageUrl && (
                    <div className="info-item full" style={{ flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
                      <span className="info-label">Ảnh chụp Giấy phép kinh doanh:</span>
                      <div className="business-license-img-wrap" onClick={() => setShowLicenseViewer(true)}>
                        <img src={restaurant.businessLicense.imageUrl} alt="GPKD" />
                        <div className="img-overlay">
                          <Eye size={20} />
                          <span>Click xem ảnh lớn</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: ACTIVITY LOGS */}
        {activeTab === 'logs' && (
          <div className="detail-card">
            <h3 className="card-title">Nhật ký hoạt động của nhà hàng</h3>
            <ActivityTimeline
              logs={logs}
              loading={logsLoading}
              hasMore={logsPage < logsTotalPages}
              onLoadMore={handleLoadMoreLogs}
            />
          </div>
        )}
      </div>

      {/* Fullscreen business license image viewer */}
      {showLicenseViewer && restaurant.businessLicense?.imageUrl && (
        <div className="modal-overlay license-viewer-overlay" onClick={() => setShowLicenseViewer(false)}>
          <div className="license-viewer-box" onClick={(e) => e.stopPropagation()}>
            <div className="license-viewer-header">
              <h4>Giấy phép kinh doanh - {restaurant.name}</h4>
              <button onClick={() => setShowLicenseViewer(false)}>Đóng (X)</button>
            </div>
            <div className="license-viewer-img-container">
              <img src={restaurant.businessLicense.imageUrl} alt="GPKD Fullscreen" />
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      <ApproveModal
        isOpen={activeModal === 'approve'}
        restaurant={restaurant}
        onConfirm={onApproveConfirm}
        onClose={() => setActiveModal(null)}
        loading={actionLoading}
      />

      {/* Reject Modal */}
      <RejectModal
        isOpen={activeModal === 'reject'}
        restaurant={restaurant}
        onConfirm={onRejectConfirm}
        onClose={() => setActiveModal(null)}
        loading={actionLoading}
      />

      {/* Suspend Modal */}
      <SuspendModal
        isOpen={activeModal === 'suspend'}
        restaurant={restaurant}
        onConfirm={onSuspendConfirm}
        onClose={() => setActiveModal(null)}
        loading={actionLoading}
      />

      {/* Unsuspend Modal */}
      <UnsuspendModal
        isOpen={activeModal === 'unsuspend'}
        restaurant={restaurant}
        onConfirm={onUnsuspendConfirm}
        onClose={() => setActiveModal(null)}
        loading={actionLoading}
      />

      {/* Delete Modal */}
      <DeleteModal
        isOpen={activeModal === 'delete'}
        restaurant={restaurant}
        onConfirm={onDeleteConfirm}
        onClose={() => setActiveModal(null)}
        loading={actionLoading}
      />

      {/* Restore Modal */}
      <RestoreModal
        isOpen={activeModal === 'restore'}
        restaurant={restaurant}
        onConfirm={onRestoreConfirm}
        onClose={() => setActiveModal(null)}
        loading={actionLoading}
      />
    </AdminLayout>
  );
}
