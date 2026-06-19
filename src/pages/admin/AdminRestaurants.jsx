import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import AdminLayout from '../../components/admin/AdminLayout';
import toast from 'react-hot-toast';
import {
  Search, Eye, EyeOff, CheckCircle, XCircle, PauseCircle, Play,
  RefreshCw, ChevronLeft, ChevronRight, Store, Star, Trash2, Undo
} from 'lucide-react';

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
      await adminApi.updateRestaurant(restaurant.id, { featured: targetState });
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
      <div className="flex border-b border-zinc-800 mb-6 overflow-x-auto whitespace-nowrap scrollbar-none gap-2">
        {STATUS_TABS.map((tab) => {
          const isActive = filters.deleted === 'true' 
            ? tab.value === 'deleted' 
            : filters.approvalStatus === tab.value && tab.value !== 'deleted';
          return (
            <button
              key={tab.value}
              className={`px-4 py-2 text-xs font-semibold tracking-wide uppercase border-b-2 transition duration-200 outline-none ${
                isActive 
                  ? 'border-amber-500 text-amber-500' 
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
              onClick={() => handleTabChange(tab.value)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center mb-6">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Tìm theo tên, email, sđt..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-[#1A1D24] border border-zinc-800 text-zinc-200 placeholder-zinc-500 rounded-lg text-sm pl-10 pr-4 py-2 outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
          />
        </form>

        <div className="flex items-center gap-3">
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters((p) => ({ ...p, sortBy: e.target.value }))}
            className="bg-[#1A1D24] border border-zinc-800 text-zinc-300 rounded-lg text-sm px-3 py-2 outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="createdAt">Đăng ký mới nhất</option>
            <option value="name">Tên nhà hàng A-Z</option>
            <option value="stats.averageRating">Đánh giá cao nhất</option>
            <option value="stats.totalBookings">Lượt đặt bàn nhiều nhất</option>
          </select>
          <select
            value={filters.sortOrder}
            onChange={(e) => setFilters((p) => ({ ...p, sortOrder: e.target.value }))}
            className="bg-[#1A1D24] border border-zinc-800 text-zinc-300 rounded-lg text-sm px-3 py-2 outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="desc">Giảm dần</option>
            <option value="asc">Tăng dần</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-400 space-y-3 bg-[#1A1D24] border border-zinc-800 rounded-xl">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Đang tải danh sách...</span>
        </div>
      ) : restaurants.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-400 space-y-4 bg-[#1A1D24] border border-zinc-800 rounded-xl">
          <Store size={48} className="opacity-40 text-amber-500" />
          <p className="text-sm">Không tìm thấy nhà hàng nào phù hợp với bộ lọc</p>
          <button 
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold rounded-lg transition"
            onClick={() => { setFilters({ search: '', approvalStatus: '', deleted: 'false', sortBy: 'createdAt', sortOrder: 'desc' }); setSearchInput(''); }}
          >
            <RefreshCw size={14} /> Xóa bộ lọc
          </button>
        </div>
      ) : (
        <>
          <div className="bg-[#1A1D24] border border-zinc-800 rounded-xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-zinc-350 text-sm">
                <thead>
                  <tr className="bg-zinc-900/50 border-b border-zinc-800 text-zinc-450 font-medium">
                    <th className="p-4 text-center w-20">Hiển thị</th>
                    <th className="p-4">Nhà hàng</th>
                    <th className="p-4">Chủ sở hữu</th>
                    <th className="p-4">Trạng thái</th>
                    <th className="p-4">Tỉnh/Thành phố</th>
                    <th className="p-4">Đánh giá</th>
                    <th className="p-4">Ngày đăng ký</th>
                    <th className="p-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {restaurants.map((restaurant) => {
                    const isDeleted = !!restaurant.deletedAt;
                    return (
                      <tr key={restaurant.id} className="hover:bg-zinc-850/30 transition-colors">
                        <td className="p-4 text-center">
                          {!isDeleted && (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                className={`p-1.5 rounded-lg border transition ${
                                  restaurant.featured 
                                    ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                                    : 'border-zinc-800 text-zinc-500 hover:text-zinc-350'
                                }`}
                                onClick={() => handleToggleFeatured(restaurant)}
                                title={restaurant.featured ? 'Hủy ghim nổi bật' : 'Ghim nổi bật'}
                              >
                                <Star size={14} fill={restaurant.featured ? 'currentColor' : 'none'} />
                              </button>
                              <button
                                className={`p-1.5 rounded-lg border transition ${
                                  restaurant.active 
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                    : 'border-zinc-805 text-zinc-500 hover:text-zinc-350'
                                }`}
                                onClick={() => handleToggleActive(restaurant)}
                                title={restaurant.active ? 'Đang hiển thị - Nhấn để ẩn' : 'Đang ẩn - Nhấn để hiển thị'}
                              >
                                {restaurant.active ? <Eye size={14} /> : <EyeOff size={14} />}
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-zinc-805 border border-zinc-800 overflow-hidden flex items-center justify-center text-zinc-400">
                              {restaurant.logo ? (
                                <img src={restaurant.logo} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <Store size={18} />
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-zinc-200">{restaurant.name}</div>
                              <div className="text-xs text-zinc-400 font-mono">{restaurant.phoneNumber}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div>
                            <div className="font-medium text-zinc-300">{restaurant.ownerId?.fullName || 'N/A'}</div>
                            <div className="text-xs text-zinc-500">{restaurant.ownerId?.email || 'N/A'}</div>
                          </div>
                        </td>
                        <td className="p-4">
                          <RestaurantStatusBadge status={isDeleted ? 'deleted' : restaurant.approvalStatus} />
                        </td>
                        <td className="p-4 text-xs text-zinc-300">
                          {restaurant.address?.city || 'N/A'}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1 text-xs text-zinc-350 font-medium">
                            <Star size={13} fill="#fbbf24" color="#fbbf24" />
                            <span>{restaurant.stats?.averageRating ? restaurant.stats.averageRating.toFixed(1) : '0.0'}</span>
                          </div>
                        </td>
                        <td className="p-4 text-xs text-zinc-400 font-mono">
                          {new Date(restaurant.createdAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-amber-500 rounded-lg transition"
                              title="Xem chi tiết"
                              onClick={() => navigate(`/admin/restaurants/${restaurant.id}`)}
                            >
                              <Eye size={14} />
                            </button>

                            {/* Dynamic Actions based on Status */}
                            {isDeleted ? (
                              <button
                                className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-emerald-500 rounded-lg transition"
                                title="Khôi phục nhà hàng"
                                onClick={() => openActionModal('restore', restaurant)}
                              >
                                <Undo size={14} />
                              </button>
                            ) : (
                              <>
                                {restaurant.approvalStatus === 'pending' && (
                                  <>
                                    <button
                                      className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-emerald-500 rounded-lg transition"
                                      title="Duyệt"
                                      onClick={() => openActionModal('approve', restaurant)}
                                    >
                                      <CheckCircle size={14} />
                                    </button>
                                    <button
                                      className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-rose-500 rounded-lg transition"
                                      title="Từ chối"
                                      onClick={() => openActionModal('reject', restaurant)}
                                    >
                                      <XCircle size={14} />
                                    </button>
                                  </>
                                )}

                                {restaurant.approvalStatus === 'approved' && (
                                  <button
                                    className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-orange-500 rounded-lg transition"
                                    title="Tạm ngưng hoạt động"
                                    onClick={() => openActionModal('suspend', restaurant)}
                                  >
                                    <PauseCircle size={14} />
                                  </button>
                                )}
                                
                                {restaurant.approvalStatus === 'suspended' && (
                                  <button
                                    className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-emerald-500 rounded-lg transition"
                                    title="Gỡ tạm ngưng"
                                    onClick={() => openActionModal('unsuspend', restaurant)}
                                  >
                                    <Play size={14} />
                                  </button>
                                )}

                                {restaurant.approvalStatus === 'rejected' && (
                                  <button
                                    className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-emerald-500 rounded-lg transition"
                                    title="Duyệt lại"
                                    onClick={() => openActionModal('approve', restaurant)}
                                  >
                                    <CheckCircle size={14} />
                                  </button>
                                )}

                                <button
                                  className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-rose-505 rounded-lg transition"
                                  title="Xóa nhà hàng"
                                  onClick={() => openActionModal('delete', restaurant)}
                                >
                                  <Trash2 size={14} />
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
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchRestaurants(pagination.page - 1)}
                className="p-2 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 disabled:opacity-50 rounded-lg transition"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs text-zinc-400">
                Trang {pagination.page} / {pagination.totalPages}
              </span>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchRestaurants(pagination.page + 1)}
                className="p-2 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 disabled:opacity-50 rounded-lg transition"
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
