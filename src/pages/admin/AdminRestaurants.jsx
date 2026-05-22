import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import AdminLayout from '../../components/admin/AdminLayout';
import toast from 'react-hot-toast';
import {
  Search, Eye, CheckCircle, XCircle, PauseCircle,
  RefreshCw, ChevronLeft, ChevronRight, Store,
} from 'lucide-react';
import './AdminRestaurants.css';

const STATUSES = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'pending', label: 'Chờ duyệt' },
  { value: 'approved', label: 'Đã duyệt' },
  { value: 'rejected', label: 'Bị từ chối' },
  { value: 'suspended', label: 'Tạm ngưng' },
];

export default function AdminRestaurants() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState({ search: '', approvalStatus: '' });
  const [searchInput, setSearchInput] = useState('');

  // Modals state
  const [approveModal, setApproveModal] = useState(null);
  const [commissionRate, setCommissionRate] = useState(10);
  
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const [suspendModal, setSuspendModal] = useState(null);
  const [suspendReason, setSuspendReason] = useState('');

  const fetchRestaurants = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await adminApi.getRestaurants({ page, limit: 20, ...filters });
      setRestaurants(res.data.restaurants);
      setPagination({
        page: res.data.page,
        totalPages: res.data.totalPages,
        total: res.data.total,
      });
    } catch (err) {
      toast.error(err.message || 'Không thể tải danh sách nhà hàng');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchRestaurants(1);
  }, [fetchRestaurants]);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, search: searchInput }));
  };

  const handleApprove = async () => {
    if (!approveModal) return;
    try {
      const res = await adminApi.approveRestaurant(approveModal.id, commissionRate);
      toast.success(res.message);
      setApproveModal(null);
      fetchRestaurants(pagination.page);
    } catch (err) {
      toast.error(err.message || 'Duyệt thất bại');
    }
  };

  const handleReject = async () => {
    if (!rejectModal || !rejectReason.trim()) return;
    try {
      const res = await adminApi.rejectRestaurant(rejectModal.id, rejectReason);
      toast.success(res.message);
      setRejectModal(null);
      setRejectReason('');
      fetchRestaurants(pagination.page);
    } catch (err) {
      toast.error(err.message || 'Từ chối thất bại');
    }
  };

  const handleSuspend = async () => {
    if (!suspendModal || !suspendReason.trim()) return;
    try {
      const res = await adminApi.suspendRestaurant(suspendModal.id, suspendReason);
      toast.success(res.message);
      setSuspendModal(null);
      setSuspendReason('');
      fetchRestaurants(pagination.page);
    } catch (err) {
      toast.error(err.message || 'Tạm ngưng thất bại');
    }
  };

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
    <AdminLayout title="Quản lý Nhà hàng" subtitle={`Tổng cộng ${pagination.total} nhà hàng`}>
      {/* Toolbar */}
      <div className="restaurants-toolbar">
        <form onSubmit={handleSearch} className="search-bar">
          <Search size={16} />
          <input
            type="text"
            placeholder="Tìm tên, email, sđt..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </form>

        <div className="filter-group">
          <select
            value={filters.approvalStatus}
            onChange={(e) => setFilters((p) => ({ ...p, approvalStatus: e.target.value }))}
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="admin-loading">
          <div className="admin-spinner" />
          <span>Đang tải...</span>
        </div>
      ) : restaurants.length === 0 ? (
        <div className="admin-empty">
          <Store size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          <p>Không tìm thấy nhà hàng nào</p>
          <button onClick={() => { setFilters({ search: '', approvalStatus: '' }); setSearchInput(''); }}>
            <RefreshCw size={14} /> Xóa bộ lọc
          </button>
        </div>
      ) : (
        <>
          <div className="restaurants-table-wrap">
            <table className="restaurants-table">
              <thead>
                <tr>
                  <th>Nhà hàng</th>
                  <th>Chủ sở hữu</th>
                  <th>Trạng thái</th>
                  <th>Địa chỉ</th>
                  <th>Ngày đăng ký</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {restaurants.map((restaurant) => (
                  <tr key={restaurant.id}>
                    <td>
                      <div className="restaurant-cell">
                        <div className="restaurant-cell-logo">
                          {restaurant.logo ? (
                            <img src={restaurant.logo} alt="" />
                          ) : (
                            <Store size={18} />
                          )}
                        </div>
                        <div>
                          <div className="restaurant-cell-name">{restaurant.name}</div>
                          <div className="restaurant-cell-phone">{restaurant.phoneNumber}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="owner-cell">
                        <div className="owner-name">{restaurant.ownerId?.fullName || 'N/A'}</div>
                        <div className="owner-email">{restaurant.ownerId?.email || 'N/A'}</div>
                      </div>
                    </td>
                    <td>{getStatusBadge(restaurant.approvalStatus)}</td>
                    <td>
                      <div className="address-cell" title={restaurant.address?.fullAddress}>
                        {restaurant.address?.city ? `${restaurant.address.district}, ${restaurant.address.city}` : 'N/A'}
                      </div>
                    </td>
                    <td className="date-cell">
                      {new Date(restaurant.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td>
                      <div className="action-btns">
                        <button
                          className="action-btn view"
                          title="Xem chi tiết"
                          onClick={() => navigate(`/admin/restaurants/${restaurant.id}`)}
                        >
                          <Eye size={16} />
                        </button>

                        {restaurant.approvalStatus === 'pending' && (
                          <>
                            <button
                              className="action-btn approve"
                              title="Duyệt"
                              onClick={() => setApproveModal(restaurant)}
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button
                              className="action-btn reject"
                              title="Từ chối"
                              onClick={() => setRejectModal(restaurant)}
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}

                        {restaurant.approvalStatus === 'approved' && (
                          <button
                            className="action-btn suspend"
                            title="Tạm ngưng"
                            onClick={() => setSuspendModal(restaurant)}
                          >
                            <PauseCircle size={16} />
                          </button>
                        )}
                        
                        {restaurant.approvalStatus === 'suspended' && (
                          <button
                            className="action-btn approve"
                            title="Mở lại (Duyệt)"
                            onClick={() => setApproveModal(restaurant)}
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchRestaurants(pagination.page - 1)}
              >
                <ChevronLeft size={16} />
              </button>
              <span className="page-info">
                Trang {pagination.page} / {pagination.totalPages}
              </span>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchRestaurants(pagination.page + 1)}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Approve Modal */}
      {approveModal && (
        <div className="modal-overlay" onClick={() => setApproveModal(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Duyệt Nhà Hàng</h3>
            <p>Bạn đang duyệt nhà hàng <strong>{approveModal.name}</strong>.</p>
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
              <button className="btn-cancel" onClick={() => setApproveModal(null)}>Hủy</button>
              <button className="btn-success" onClick={handleApprove}>Xác nhận Duyệt</button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="modal-overlay" onClick={() => { setRejectModal(null); setRejectReason(''); }}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Từ chối Nhà Hàng</h3>
            <p>Từ chối yêu cầu đăng ký của <strong>{rejectModal.name}</strong>.</p>
            
            <label className="modal-label">Lý do từ chối (bắt buộc)</label>
            <textarea
              className="modal-input"
              rows={3}
              placeholder="Nhập lý do để thông báo cho chủ nhà hàng..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => { setRejectModal(null); setRejectReason(''); }}>Hủy</button>
              <button className="btn-danger" onClick={handleReject} disabled={!rejectReason.trim()}>
                Xác nhận Từ chối
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Modal */}
      {suspendModal && (
        <div className="modal-overlay" onClick={() => { setSuspendModal(null); setSuspendReason(''); }}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Tạm ngưng Nhà Hàng</h3>
            <p>Tạm ngưng hoạt động của <strong>{suspendModal.name}</strong>.</p>
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
              <button className="btn-cancel" onClick={() => { setSuspendModal(null); setSuspendReason(''); }}>Hủy</button>
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
