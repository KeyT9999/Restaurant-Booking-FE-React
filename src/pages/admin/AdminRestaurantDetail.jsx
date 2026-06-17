import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import AdminLayout from '../../components/admin/AdminLayout';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Store, MapPin, Phone, Mail, Clock,
  CheckCircle, XCircle, PauseCircle, CreditCard,
  FileText, History, Star, Landmark, Eye, Undo, Play, Trash2
} from 'lucide-react';

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

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getRestaurantById(id);
      setRestaurant(res.data);
      setEditCommissionRate(res.data.commissionRate ?? 10);
      setEditFeatured(res.data.featured ?? false);
    } catch (err) {
      toast.error(err.message || 'Không thể tải chi tiết nhà hàng');
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

  useEffect(() => {
    fetchDetail();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'logs') {
      fetchLogs(1, true);
    }
  }, [activeTab, id]);

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
        <div className="flex flex-col items-center justify-center py-20 text-zinc-400 space-y-3 bg-[#1A1D24] border border-zinc-800 rounded-xl">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Đang tải thông tin nhà hàng...</span>
        </div>
      </AdminLayout>
    );
  }

  if (!restaurant) return null;
  const isDeleted = !!restaurant.deletedAt;

  return (
    <AdminLayout title={restaurant.name} subtitle={`Quản lý nhà hàng của ${restaurant.ownerId?.fullName || 'N/A'}`}>
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center mb-6">
        <button 
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold rounded-lg transition duration-150 self-start sm:self-auto" 
          onClick={() => navigate('/admin/restaurants')}
        >
          <ArrowLeft size={14} /> Quay lại danh sách
        </button>
        <div className="flex flex-wrap gap-2 items-center">
          {isDeleted ? (
            <button 
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition" 
              onClick={() => setActiveModal('restore')}
            >
              <Undo size={14} /> Khôi phục nhà hàng
            </button>
          ) : (
            <>
              {restaurant.approvalStatus === 'pending' && (
                <>
                  <button 
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition" 
                    onClick={() => setActiveModal('approve')}
                  >
                    <CheckCircle size={14} /> Duyệt hoạt động
                  </button>
                  <button 
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg transition" 
                    onClick={() => setActiveModal('reject')}
                  >
                    <XCircle size={14} /> Từ chối duyệt
                  </button>
                </>
              )}
              {restaurant.approvalStatus === 'approved' && (
                <button 
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs rounded-lg transition" 
                  onClick={() => setActiveModal('suspend')}
                >
                  <PauseCircle size={14} /> Tạm ngưng
                </button>
              )}
              {restaurant.approvalStatus === 'suspended' && (
                <button 
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition" 
                  onClick={() => setActiveModal('unsuspend')}
                >
                  <Play size={14} /> Gỡ tạm ngưng
                </button>
              )}
              {restaurant.approvalStatus === 'rejected' && (
                <button 
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition" 
                  onClick={() => setActiveModal('approve')}
                >
                  <CheckCircle size={14} /> Duyệt lại
                </button>
              )}
              <button 
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg transition" 
                onClick={() => setActiveModal('delete')}
              >
                <Trash2 size={14} /> Xóa nhà hàng
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-zinc-800 mb-6 overflow-x-auto whitespace-nowrap scrollbar-none gap-2">
        <button
          className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold tracking-wide uppercase border-b-2 transition duration-200 outline-none ${
            activeTab === 'info' 
              ? 'border-amber-500 text-amber-500' 
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
          onClick={() => setActiveTab('info')}
        >
          <Store size={14} /> Thông tin
        </button>
        <button
          className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold tracking-wide uppercase border-b-2 transition duration-200 outline-none ${
            activeTab === 'financial' 
              ? 'border-amber-500 text-amber-500' 
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
          onClick={() => setActiveTab('financial')}
        >
          <CreditCard size={14} /> Tài chính & Pháp lý
        </button>
        <button
          className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold tracking-wide uppercase border-b-2 transition duration-200 outline-none ${
            activeTab === 'logs' 
              ? 'border-amber-500 text-amber-500' 
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
          onClick={() => setActiveTab('logs')}
        >
          <History size={14} /> Lịch sử hoạt động
        </button>
      </div>

      {/* Tab Contents */}
      <div className="space-y-6">
        
        {/* Tab 1: INFO */}
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              <div className="bg-[#1A1D24] border border-zinc-800 rounded-xl p-5 shadow-lg">
                <h3 className="text-sm font-bold text-zinc-200 mb-4 pb-2 border-b border-zinc-805 uppercase tracking-wide">Thông tin cơ bản</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-zinc-500">Trạng thái duyệt</span>
                    <span className="text-sm font-medium">
                      <RestaurantStatusBadge status={isDeleted ? 'deleted' : restaurant.approvalStatus} />
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-zinc-500">Ghim nổi bật</span>
                    <span className="text-sm font-medium flex items-center gap-1">
                      {restaurant.featured ? (
                        <>
                          <Star size={14} fill="#fbbf24" color="#fbbf24" />
                          <span className="text-amber-550 font-semibold">Nổi bật</span>
                        </>
                      ) : (
                        <span className="text-zinc-500">Không</span>
                      )}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 sm:col-span-2">
                    <span className="text-xs text-zinc-500">Tên nhà hàng</span>
                    <span className="text-sm font-semibold text-zinc-200">{restaurant.name}</span>
                  </div>
                  <div className="flex flex-col gap-1 sm:col-span-2">
                    <span className="text-xs text-zinc-500">Mô tả</span>
                    <span className="text-xs text-zinc-400 leading-relaxed">{restaurant.description}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-zinc-500">Phân khúc giá</span>
                    <span className="text-sm text-zinc-200 capitalize font-medium">{restaurant.priceRange}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-zinc-500">Sức chứa tối đa</span>
                    <span className="text-sm text-zinc-200 font-medium">{restaurant.capacity} khách</span>
                  </div>
                  <div className="flex flex-col gap-1 sm:col-span-2">
                    <span className="text-xs text-zinc-500">Loại ẩm thực</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {restaurant.cuisineTypes && restaurant.cuisineTypes.length > 0 ? (
                        restaurant.cuisineTypes.map((tag) => (
                          <span key={tag} className="px-2 py-0.5 bg-zinc-800 border border-zinc-700/50 rounded text-xs text-zinc-300">{tag}</span>
                        ))
                      ) : (
                        <span className="text-xs text-zinc-500">Chưa cập nhật</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact & Location */}
              <div className="bg-[#1A1D24] border border-zinc-800 rounded-xl p-5 shadow-lg">
                <h3 className="text-sm font-bold text-zinc-200 mb-4 pb-2 border-b border-zinc-805 uppercase tracking-wide">Liên hệ & Địa chỉ</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-zinc-500 flex items-center gap-1"><Phone size={12} /> Điện thoại</span>
                    <span className="text-sm font-mono text-zinc-200">{restaurant.phoneNumber}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-zinc-500 flex items-center gap-1"><Mail size={12} /> Email</span>
                    <span className="text-sm text-zinc-200">{restaurant.email}</span>
                  </div>
                  <div className="flex flex-col gap-1 sm:col-span-2">
                    <span className="text-xs text-zinc-500 flex items-center gap-1"><MapPin size={12} /> Địa chỉ chi tiết</span>
                    <span className="text-sm text-zinc-300 leading-relaxed">{restaurant.address?.fullAddress}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-zinc-500">Tỉnh / Thành phố</span>
                    <span className="text-sm text-zinc-200">{restaurant.address?.city}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-zinc-500">Quận / Huyện</span>
                    <span className="text-sm text-zinc-200">{restaurant.address?.district}</span>
                  </div>
                </div>
              </div>

              {/* Operating Hours */}
              <div className="bg-[#1A1D24] border border-zinc-800 rounded-xl p-5 shadow-lg">
                <h3 className="text-sm font-bold text-zinc-200 mb-4 pb-2 border-b border-zinc-805 uppercase tracking-wide flex items-center gap-1.5"><Clock size={14} /> Giờ hoạt động</h3>
                <div className="divide-y divide-zinc-800/60 max-w-md">
                  {restaurant.operatingHours ? (
                    Object.keys(restaurant.operatingHours).map((day) => {
                      const hours = restaurant.operatingHours[day];
                      const dayLabels = {
                        monday: 'Thứ Hai', tuesday: 'Thứ Ba', wednesday: 'Thứ Tư',
                        thursday: 'Thứ Năm', friday: 'Thứ Sáu', saturday: 'Thứ Bảy', sunday: 'Chủ Nhật'
                      };
                      return (
                        <div key={day} className="flex justify-between items-center py-2 text-xs">
                          <span className="font-semibold text-zinc-400">{dayLabels[day] || day}</span>
                          <span className="text-zinc-200 font-mono">
                            {hours.closed ? (
                              <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded">Đóng cửa</span>
                            ) : (
                              `${hours.open} - ${hours.close}`
                            )}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-zinc-500">Chưa cập nhật</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Owner Profile */}
              <div className="bg-[#1A1D24] border border-zinc-800 rounded-xl p-5 shadow-lg">
                <h3 className="text-sm font-bold text-zinc-200 mb-4 pb-2 border-b border-zinc-805 uppercase tracking-wide">Chủ sở hữu</h3>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden flex items-center justify-center text-lg font-bold text-amber-500 uppercase">
                    {restaurant.ownerId?.fullName?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-zinc-150 truncate">{restaurant.ownerId?.fullName || 'N/A'}</div>
                    <div className="text-xs text-zinc-400 truncate">{restaurant.ownerId?.email}</div>
                    <div className="text-xs text-zinc-500 mt-1 font-mono">{restaurant.ownerId?.phoneNumber || 'Chưa cập nhật SĐT'}</div>
                  </div>
                </div>
              </div>

              {/* Stats overview */}
              <div className="bg-[#1A1D24] border border-zinc-800 rounded-xl p-5 shadow-lg">
                <h3 className="text-sm font-bold text-zinc-200 mb-4 pb-2 border-b border-zinc-805 uppercase tracking-wide">Thống kê hoạt động</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#13161C] border border-zinc-800/60 p-3 rounded-lg flex flex-col">
                    <span className="text-[10px] text-zinc-550 uppercase font-semibold">Tổng Booking</span>
                    <span className="text-lg font-bold text-zinc-200 mt-0.5">{restaurant.stats?.totalBookings || 0}</span>
                  </div>
                  <div className="bg-[#13161C] border border-zinc-800/60 p-3 rounded-lg flex flex-col">
                    <span className="text-[10px] text-zinc-550 uppercase font-semibold">Đã hoàn thành</span>
                    <span className="text-lg font-bold text-emerald-400 mt-0.5">{restaurant.stats?.completedBookings || 0}</span>
                  </div>
                  <div className="bg-[#13161C] border border-zinc-800/60 p-3 rounded-lg flex flex-col">
                    <span className="text-[10px] text-zinc-550 uppercase font-semibold">Đã hủy</span>
                    <span className="text-lg font-bold text-rose-450 mt-0.5">{restaurant.stats?.cancelledBookings || 0}</span>
                  </div>
                  <div className="bg-[#13161C] border border-zinc-800/60 p-3 rounded-lg flex flex-col">
                    <span className="text-[10px] text-zinc-550 uppercase font-semibold">Đánh giá TB</span>
                    <span className="text-lg font-bold text-amber-500 mt-0.5 flex items-center gap-1">
                      {restaurant.stats?.averageRating?.toFixed(1) || '0.0'} <span className="text-sm">⭐</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Moderation Warnings */}
              {(restaurant.rejectionReason || restaurant.suspensionReason || restaurant.deleteReason) && (
                <div className="bg-[#1A1D24] border border-zinc-800 rounded-xl p-5 shadow-lg border-l-4 border-l-orange-500">
                  <h3 className="text-sm font-bold text-orange-400 mb-3 uppercase tracking-wide">Ghi chú Kiểm duyệt</h3>
                  <div className="space-y-2.5 text-xs">
                    {restaurant.rejectionReason && (
                      <div className="p-2.5 bg-rose-500/5 border border-rose-550/10 rounded-lg text-rose-350">
                        <strong className="block mb-0.5">Lý do từ chối duyệt:</strong> {restaurant.rejectionReason}
                      </div>
                    )}
                    {restaurant.suspensionReason && (
                      <div className="p-2.5 bg-orange-500/5 border border-orange-500/10 rounded-lg text-orange-350">
                        <strong className="block mb-0.5">Lý do tạm ngưng:</strong> {restaurant.suspensionReason}
                      </div>
                    )}
                    {restaurant.deleteReason && (
                      <div className="p-2.5 bg-red-500/5 border border-red-500/10 rounded-lg text-red-350">
                        <strong className="block mb-0.5">Lý do xóa nhà hàng:</strong> {restaurant.deleteReason}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Admin configuration settings */}
              {!isDeleted && (
                <div className="bg-[#1A1D24] border border-zinc-800 rounded-xl p-5 shadow-lg">
                  <h3 className="text-sm font-bold text-zinc-200 mb-4 pb-2 border-b border-zinc-805 uppercase tracking-wide">Cấu hình Admin</h3>
                  {!isEditingSettings ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-500">Tỷ lệ hoa hồng:</span>
                        <span className="font-bold text-amber-550">{restaurant.commissionRate ?? 10}%</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-500">Ghi nhận nổi bật:</span>
                        <span className="font-semibold text-zinc-300">{restaurant.featured ? 'Đang Bật' : 'Đang Tắt'}</span>
                      </div>
                      <button 
                        className="w-full flex items-center justify-center py-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-black font-semibold text-xs rounded-lg transition"
                        onClick={() => setIsEditingSettings(true)}
                      >
                        Chỉnh sửa cấu hình
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Tỷ lệ hoa hồng (%)</label>
                        <input
                          type="number"
                          className="w-full bg-[#13161C] border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-205 focus:outline-none focus:ring-1 focus:ring-amber-500"
                          min="0"
                          max="100"
                          value={editCommissionRate}
                          onChange={(e) => setEditCommissionRate(Number(e.target.value))}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="featured-check"
                          checked={editFeatured}
                          onChange={(e) => setEditFeatured(e.target.checked)}
                          className="w-4 h-4 rounded border-zinc-850 bg-zinc-900 text-amber-550 focus:ring-amber-500 cursor-pointer"
                        />
                        <label htmlFor="featured-check" className="text-xs text-zinc-300 font-semibold cursor-pointer">Ghim nổi bật (Featured)</label>
                      </div>
                      <div className="flex items-center gap-2 pt-2">
                        <button 
                          className="flex-1 py-2 border border-zinc-800 hover:bg-zinc-850 text-zinc-300 font-semibold text-xs rounded-lg transition" 
                          onClick={() => { setIsEditingSettings(false); setEditCommissionRate(restaurant.commissionRate ?? 10); setEditFeatured(restaurant.featured ?? false); }}
                        >
                          Hủy
                        </button>
                        <button 
                          className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs rounded-lg transition" 
                          onClick={handleSaveSettings} 
                          disabled={actionLoading}
                        >
                          {actionLoading ? 'Lưu...' : 'Lưu lại'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Gallery Images */}
              {restaurant.images && restaurant.images.length > 0 && (
                <div className="bg-[#1A1D24] border border-zinc-800 rounded-xl p-5 shadow-lg">
                  <h3 className="text-sm font-bold text-zinc-200 mb-4 pb-2 border-b border-zinc-805 uppercase tracking-wide">Hình ảnh nhà hàng</h3>
                  <div className="grid grid-cols-2 gap-2.5">
                    {restaurant.images.map((img, idx) => (
                      <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900 group">
                        <img src={img.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                        {img.isPrimary && (
                          <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-amber-500 text-black text-[9px] font-bold uppercase rounded">Chính</span>
                        )}
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              {/* Financial Balance Info */}
              <div className="bg-[#1A1D24] border border-zinc-800 rounded-xl p-5 shadow-lg">
                <h3 className="text-sm font-bold text-zinc-200 mb-4 pb-2 border-b border-zinc-805 uppercase tracking-wide flex items-center gap-1.5"><Landmark size={14} /> Tổng quan tài chính</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-zinc-500">Số dư hiện tại (Balance)</span>
                    <span className="text-base font-bold text-emerald-450">{restaurant.balance?.toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-zinc-500">Doanh thu tổng</span>
                    <span className="text-sm text-zinc-200 font-semibold">{restaurant.totalRevenue?.toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-zinc-500">Hoa hồng đã thu</span>
                    <span className="text-sm text-amber-500 font-bold">{restaurant.totalCommission?.toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-zinc-500">Tỷ lệ chiết khấu</span>
                    <span className="text-sm text-zinc-300 font-semibold">{restaurant.commissionRate ?? 10}%</span>
                  </div>
                </div>
              </div>

              {/* Bank Transfer Details */}
              <div className="bg-[#1A1D24] border border-zinc-800 rounded-xl p-5 shadow-lg">
                <h3 className="text-sm font-bold text-zinc-200 mb-4 pb-2 border-b border-zinc-805 uppercase tracking-wide">Thông tin tài khoản ngân hàng</h3>
                {restaurant.bankInfo && restaurant.bankInfo.bankName ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-zinc-500">Ngân hàng nhận</span>
                      <span className="text-sm font-bold text-zinc-200">{restaurant.bankInfo.bankName}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-zinc-500">Số tài khoản</span>
                      <span className="text-sm font-bold text-amber-500 font-mono">{restaurant.bankInfo.accountNumber}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-zinc-500">Chủ tài khoản</span>
                      <span className="text-sm font-semibold text-zinc-200 capitalize">{restaurant.bankInfo.accountHolder}</span>
                    </div>
                    <div className="flex flex-col gap-1 sm:col-span-2">
                      <span className="text-xs text-zinc-500">Chi nhánh ngân hàng</span>
                      <span className="text-sm text-zinc-300">{restaurant.bankInfo.branch || 'Chưa cập nhật'}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 italic py-2">Chủ nhà hàng chưa thiết lập thông tin ngân hàng rút tiền.</p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              {/* Business License & Tax Code */}
              <div className="bg-[#1A1D24] border border-zinc-800 rounded-xl p-5 shadow-lg">
                <h3 className="text-sm font-bold text-zinc-200 mb-4 pb-2 border-b border-zinc-805 uppercase tracking-wide flex items-center gap-1.5"><FileText size={14} /> Hồ sơ pháp lý</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-zinc-500">Mã số thuế doanh nghiệp</span>
                    <span className="text-sm font-bold text-zinc-200 font-mono">{restaurant.taxCode || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-zinc-500">Số giấy phép kinh doanh</span>
                    <span className="text-sm font-bold text-zinc-200 font-mono">{restaurant.businessLicense?.number || 'Chưa cập nhật'}</span>
                  </div>
                  {restaurant.businessLicense?.verifiedAt && (
                    <div className="flex flex-col gap-1 sm:col-span-2">
                      <span className="text-xs text-zinc-500">Ngày xác thực GPKD</span>
                      <span className="text-sm text-zinc-400 font-mono">{new Date(restaurant.businessLicense.verifiedAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  )}
                  {restaurant.businessLicense?.imageUrl && (
                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <span className="text-xs text-zinc-500">Ảnh chụp Giấy phép kinh doanh</span>
                      <div 
                        className="relative max-w-sm rounded-lg overflow-hidden border border-zinc-800/80 bg-zinc-900 group cursor-pointer" 
                        onClick={() => setShowLicenseViewer(true)}
                      >
                        <img src={restaurant.businessLicense.imageUrl} alt="GPKD" className="w-full h-auto object-cover max-h-56 group-hover:brightness-90 transition" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition duration-150 gap-1.5">
                          <Eye size={20} className="text-amber-500" />
                          <span className="text-[11px] text-zinc-200 font-semibold uppercase tracking-wider">Click xem ảnh lớn</span>
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
          <div className="bg-[#1A1D24] border border-zinc-800 rounded-xl p-5 shadow-lg">
            <h3 className="text-sm font-bold text-zinc-200 mb-6 pb-2 border-b border-zinc-805 uppercase tracking-wide">Nhật ký hoạt động của nhà hàng</h3>
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
        <div 
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200" 
          onClick={() => setShowLicenseViewer(false)}
        >
          <div className="relative max-w-4xl w-full flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-bold text-zinc-100">Giấy phép kinh doanh - {restaurant.name}</h4>
              <button 
                className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg transition"
                onClick={() => setShowLicenseViewer(false)}
              >
                Đóng
              </button>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden p-2 flex items-center justify-center max-h-[80vh]">
              <img src={restaurant.businessLicense.imageUrl} alt="GPKD Fullscreen" className="max-w-full max-h-[75vh] object-contain rounded-lg" />
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
