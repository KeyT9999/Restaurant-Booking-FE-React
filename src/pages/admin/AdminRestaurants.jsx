import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import AdminLayout from '../../components/admin/AdminLayout';
import toast from 'react-hot-toast';
import {
  Search, Eye, EyeOff, CheckCircle, XCircle, PauseCircle, Play,
  RefreshCw, ChevronLeft, ChevronRight, Store, Star, Trash2, Undo
} from 'lucide-react';
import './AdminRestaurants.css';

// Badge & Modals Components
import RestaurantStatusBadge from '../../components/admin/RestaurantStatusBadge';
import ApproveModal from '../../components/admin/ApproveModal';
import RejectModal from '../../components/admin/RejectModal';
import SuspendModal from '../../components/admin/SuspendModal';
import UnsuspendModal from '../../components/admin/UnsuspendModal';
import DeleteModal from '../../components/admin/DeleteModal';
import RestoreModal from '../../components/admin/RestoreModal';

const STATUS_TABS = [
  { value: '', label: 'Tất cả' },
  { value: 'pending', label: 'Chờ duyệt' },
  { value: 'approved', label: 'Hoạt động' },
  { value: 'suspended', label: 'Tạm ngưng' },
  { value: 'rejected', label: 'Từ chối' },
  { value: 'deleted', label: 'Đã xóa' },
];

export default function AdminRestaurants() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState({ 
    search: '', 
    approvalStatus: '', 
    deleted: 'false',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [searchInput, setSearchInput] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Modals state
  const [selectedRest, setSelectedRest] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // 'approve' | 'reject' | 'suspend' | 'unsuspend' | 'delete' | 'restore'

  const fetchRestaurants = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await adminApi.getRestaurants({ page, limit: 15, ...filters });
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, search: searchInput }));
  };

  const handleTabChange = (tabValue) => {
    setSearchInput('');
    if (tabValue === 'deleted') {
      setFilters((prev) => ({
        ...prev,
        search: '',
        approvalStatus: '',
        deleted: 'true',
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        search: '',
        approvalStatus: tabValue,
        deleted: 'false',
      }));
    }
  };

  const handleToggleFeatured = async (restaurant) => {
    try {
      const targetState = !restaurant.featured;
      const res = await adminApi.updateRestaurant(restaurant.id, { featured: targetState });
      toast.success(targetState ? 'Đã ghim nổi bật nhà hàng' : 'Đã hủy ghim nổi bật');
      
      // Update state locally to avoid full refetch stutter
      setRestaurants(prev => prev.map(r => r.id === restaurant.id ? { ...r, featured: targetState } : r));
    } catch (err) {
      toast.error(err.message || 'Cập nhật nổi bật thất bại');
    }
  };

  const handleToggleActive = async (restaurant) => {
    try {
      const targetState = !restaurant.active;
      await adminApi.updateRestaurant(restaurant.id, { active: targetState });
      toast.success(targetState ? 'Đã bật hiển thị nhà hàng' : 'Đã ẩn nhà hàng');
      
      // Update state locally
      setRestaurants(prev => prev.map(r => r.id === restaurant.id ? { ...r, active: targetState } : r));
    } catch (err) {
      toast.error(err.message || 'Cập nhật hiển thị thất bại');
    }
  };

  const onApproveConfirm = async (id, commissionRate) => {
    setActionLoading(true);
    try {
      const res = await adminApi.approveRestaurant(id, commissionRate);
      toast.success(res.message || 'Đã duyệt nhà hàng thành công');
      setActiveModal(null);
      fetchRestaurants(pagination.page);
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
      toast.success(res.message || 'Đã từ chối hồ sơ nhà hàng');
      setActiveModal(null);
      fetchRestaurants(pagination.page);
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
      toast.success(res.message || 'Đã tạm ngưng hoạt động nhà hàng');
      setActiveModal(null);
      fetchRestaurants(pagination.page);
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
      fetchRestaurants(pagination.page);
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
      toast.success(res.message || 'Đã xóa nhà hàng thành công');
      setActiveModal(null);
      fetchRestaurants(pagination.page);
    } catch (err) {
      toast.error(err.message || 'Xóa nhà hàng thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const onRestoreConfirm = async (id) => {
    setActionLoading(true);
    try {
      const res = await adminApi.restoreRestaurant(id);
      toast.success(res.message || 'Đã khôi phục nhà hàng thành công');
      setActiveModal(null);
      fetchRestaurants(pagination.page);
    } catch (err) {
      toast.error(err.message || 'Khôi phục thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const openActionModal = (modalType, restaurant) => {
    setSelectedRest(restaurant);
    setActiveModal(modalType);
  };

  return (
    <AdminLayout title="Quản lý Nhà hàng" subtitle={`Tổng cộng ${pagination.total} nhà hàng`}>
      {/* Tabs Filter */}
      <div className="status-tabs-container">
        {STATUS_TABS.map((tab) => {
          const isActive = filters.deleted === 'true' 
            ? tab.value === 'deleted' 
            : filters.approvalStatus === tab.value && tab.value !== 'deleted';
          return (
            <button
              key={tab.value}
              className={`status-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => handleTabChange(tab.value)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="restaurants-toolbar">
        <form onSubmit={handleSearchSubmit} className="search-bar">
          <Search size={16} />
          <input
            type="text"
            placeholder="Tìm theo tên, email, sđt..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </form>

        <div className="filter-group">
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters((p) => ({ ...p, sortBy: e.target.value }))}
          >
            <option value="createdAt">Đăng ký mới nhất</option>
            <option value="name">Tên nhà hàng A-Z</option>
            <option value="stats.averageRating">Đánh giá cao nhất</option>
            <option value="stats.totalBookings">Lượt đặt bàn nhiều nhất</option>
          </select>
          <select
            value={filters.sortOrder}
            onChange={(e) => setFilters((p) => ({ ...p, sortOrder: e.target.value }))}
          >
            <option value="desc">Giảm dần</option>
            <option value="asc">Tăng dần</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="admin-loading">
          <div className="admin-spinner" />
          <span>Đang tải danh sách...</span>
        </div>
      ) : restaurants.length === 0 ? (
        <div className="admin-empty">
          <Store size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          <p>Không tìm thấy nhà hàng nào phù hợp với bộ lọc</p>
          <button onClick={() => { setFilters({ search: '', approvalStatus: '', deleted: 'false', sortBy: 'createdAt', sortOrder: 'desc' }); setSearchInput(''); }}>
            <RefreshCw size={14} /> Xóa bộ lọc
          </button>
        </div>
      ) : (
        <>
          <div className="restaurants-table-wrap">
            <table className="restaurants-table">
              <thead>
                <tr>
                  <th style={{ width: '80px', textAlign: 'center' }}>Hiển thị</th>
                  <th>Nhà hàng</th>
                  <th>Chủ sở hữu</th>
                  <th>Trạng thái</th>
                  <th>Tỉnh/Thành phố</th>
                  <th>Đánh giá</th>
                  <th>Ngày đăng ký</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {restaurants.map((restaurant) => {
                  const isDeleted = !!restaurant.deletedAt;
                  return (
                    <tr key={restaurant.id}>
                      <td style={{ textAlign: 'center' }}>
                        {!isDeleted && (
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                            <button
                              className={`btn-featured-toggle ${restaurant.featured ? 'featured' : ''}`}
                              onClick={() => handleToggleFeatured(restaurant)}
                              title={restaurant.featured ? 'Hủy ghim nổi bật' : 'Ghim nổi bật'}
                            >
                              <Star size={16} />
                            </button>
                            <button
                              className="btn-active-toggle"
                              onClick={() => handleToggleActive(restaurant)}
                              style={{ 
                                background: 'transparent', 
                                border: 'none', 
                                cursor: 'pointer', 
                                padding: '4px',
                                color: restaurant.active ? '#10b981' : '#94a3b8',
                                transition: 'color 0.2s'
                              }}
                              title={restaurant.active ? 'Đang hiển thị - Nhấn để ẩn' : 'Đang ẩn - Nhấn để hiển thị'}
                            >
                              {restaurant.active ? <Eye size={16} /> : <EyeOff size={16} />}
                            </button>
                          </div>
                        )}
                      </td>
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
                      <td>
                        <RestaurantStatusBadge status={isDeleted ? 'deleted' : restaurant.approvalStatus} />
                      </td>
                      <td>
                        <div className="address-city">
                          {restaurant.address?.city || 'N/A'}
                        </div>
                      </td>
                      <td>
                        <div className="rating-cell" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Star size={13} fill="#fbbf24" color="#fbbf24" />
                          <span>{restaurant.stats?.averageRating ? restaurant.stats.averageRating.toFixed(1) : '0.0'}</span>
                        </div>
                      </td>
                      <td className="date-cell">
                        {new Date(restaurant.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td>
                        <div className="action-btns" style={{ justifyContent: 'flex-end' }}>
                          <button
                            className="action-btn view"
                            title="Xem chi tiết"
                            onClick={() => navigate(`/admin/restaurants/${restaurant.id}`)}
                          >
                            <Eye size={16} />
                          </button>

                          {/* Dynamic Actions based on Status */}
                          {isDeleted ? (
                            <button
                              className="action-btn activate"
                              title="Khôi phục nhà hàng"
                              onClick={() => openActionModal('restore', restaurant)}
                            >
                              <Undo size={16} />
                            </button>
                          ) : (
                            <>
                              {restaurant.approvalStatus === 'pending' && (
                                <>
                                  <button
                                    className="action-btn approve"
                                    title="Duyệt"
                                    onClick={() => openActionModal('approve', restaurant)}
                                  >
                                    <CheckCircle size={16} />
                                  </button>
                                  <button
                                    className="action-btn reject"
                                    title="Từ chối"
                                    onClick={() => openActionModal('reject', restaurant)}
                                  >
                                    <XCircle size={16} />
                                  </button>
                                </>
                              )}

                              {restaurant.approvalStatus === 'approved' && (
                                <button
                                  className="action-btn suspend"
                                  title="Tạm ngưng hoạt động"
                                  onClick={() => openActionModal('suspend', restaurant)}
                                >
                                  <PauseCircle size={16} />
                                </button>
                              )}
                              
                              {restaurant.approvalStatus === 'suspended' && (
                                <button
                                  className="action-btn approve"
                                  title="Gỡ tạm ngưng"
                                  onClick={() => openActionModal('unsuspend', restaurant)}
                                >
                                  <Play size={16} />
                                </button>
                              )}

                              {restaurant.approvalStatus === 'rejected' && (
                                <button
                                  className="action-btn approve"
                                  title="Duyệt lại"
                                  onClick={() => openActionModal('approve', restaurant)}
                                >
                                  <CheckCircle size={16} />
                                </button>
                              )}

                              <button
                                className="action-btn delete"
                                title="Xóa nhà hàng"
                                onClick={() => openActionModal('delete', restaurant)}
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
      <ApproveModal
        isOpen={activeModal === 'approve'}
        restaurant={selectedRest}
        onConfirm={onApproveConfirm}
        onClose={() => setActiveModal(null)}
        loading={actionLoading}
      />

      {/* Reject Modal */}
      <RejectModal
        isOpen={activeModal === 'reject'}
        restaurant={selectedRest}
        onConfirm={onRejectConfirm}
        onClose={() => setActiveModal(null)}
        loading={actionLoading}
      />

      {/* Suspend Modal */}
      <SuspendModal
        isOpen={activeModal === 'suspend'}
        restaurant={selectedRest}
        onConfirm={onSuspendConfirm}
        onClose={() => setActiveModal(null)}
        loading={actionLoading}
      />

      {/* Unsuspend Modal */}
      <UnsuspendModal
        isOpen={activeModal === 'unsuspend'}
        restaurant={selectedRest}
        onConfirm={onUnsuspendConfirm}
        onClose={() => setActiveModal(null)}
        loading={actionLoading}
      />

      {/* Delete Modal */}
      <DeleteModal
        isOpen={activeModal === 'delete'}
        restaurant={selectedRest}
        onConfirm={onDeleteConfirm}
        onClose={() => setActiveModal(null)}
        loading={actionLoading}
      />

      {/* Restore Modal */}
      <RestoreModal
        isOpen={activeModal === 'restore'}
        restaurant={selectedRest}
        onConfirm={onRestoreConfirm}
        onClose={() => setActiveModal(null)}
        loading={actionLoading}
      />
    </AdminLayout>
  );
}
