import { useEffect, useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { 
  Ticket, Plus, ToggleLeft, ToggleRight, Trash2, BarChart2, Calendar, 
  ShieldAlert, TrendingUp, RefreshCw, Gift, Search, Edit, Eye, UserCheck, Activity, Loader2, X, AlertTriangle
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { 
  getAdminVouchers, 
  createPlatformVoucher, 
  updateAdminVoucher, 
  changeAdminVoucherStatus, 
  deleteAdminVoucher, 
  getAdminVouchersAnalytics, 
  getAdminVouchersFraudReport, 
  resetAdminVoucherUsage, 
  issueAdminVoucherCompensation, 
  createAdminCampaign, 
  getAdminCampaigns, 
  updateAdminCampaign 
} from '../../api/voucherApi';
import VoucherFormModal from '../../components/voucher/VoucherFormModal';
import VoucherStatusBadge from '../../components/voucher/VoucherStatusBadge';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { cn } from '../../components/ui/utils';

const formatMoney = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v || 0);
const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : 'Không giới hạn';

export default function AdminVouchers() {
  const [activeTab, setActiveTab] = useState('list'); // list, campaigns, analytics, fraud

  // Vouchers List State
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: '',
    scope: 'all' // all, platform, restaurant
  });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1 });
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);

  // Campaigns State
  const [campaigns, setCampaigns] = useState([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    description: '',
    type: 'flash_sale',
    startDate: '',
    endDate: '',
    targetSegments: 'all', // all, new_user, vip, inactive
    autoDistribute: false
  });

  // Reset Usage State
  const [resetModalVoucher, setResetModalVoucher] = useState(null);
  const [resetCount, setResetCount] = useState(0);

  // Compensation State
  const [isCompModalOpen, setIsCompModalOpen] = useState(false);
  const [compForm, setCompForm] = useState({
    customerId: '',
    name: 'Voucher đền bù dịch vụ',
    discountType: 'percentage',
    discountValue: '',
    minOrderAmount: '0',
    daysValid: '30'
  });

  // Analytics State
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [analyticsFilter, setAnalyticsFilter] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    granularity: 'day'
  });

  // Fraud State
  const [fraudData, setFraudData] = useState(null);
  const [loadingFraud, setLoadingFraud] = useState(false);

  // Single Voucher Stats Drawer State
  const [statsVoucher, setStatsVoucher] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Derived KPI Stats
  const globalVouchers = useMemo(() => vouchers.filter(v => !v.restaurantId), [vouchers]);
  const restaurantVouchers = useMemo(() => vouchers.filter(v => !!v.restaurantId), [vouchers]);
  const activeCount = useMemo(() => vouchers.filter(v => v.status === 'active').length, [vouchers]);

  useEffect(() => {
    if (activeTab === 'list') {
      loadVouchers(pagination.page);
    } else if (activeTab === 'campaigns') {
      loadCampaigns();
    } else if (activeTab === 'analytics') {
      loadAnalytics();
    } else if (activeTab === 'fraud') {
      loadFraudReport();
    }
  }, [activeTab, filters.type, filters.status, filters.scope, pagination.page]);

  // --- VOUCHERS LIST FLOW ---
  const loadVouchers = async (pageNumber = 1) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = {
        page: pageNumber,
        limit: 10,
        search: filters.search,
        type: filters.type || undefined,
        status: filters.status || undefined,
      };
      
      if (filters.scope === 'platform') {
        queryParams.restaurantId = 'null';
      }

      const res = await getAdminVouchers(queryParams);
      if (res?.success) {
        let list = res.data || [];
        // Client-side fallback if backend doesn't handle restaurantId = null strictly
        if (filters.scope === 'restaurant') {
          list = list.filter(v => !!v.restaurantId);
        } else if (filters.scope === 'platform') {
          list = list.filter(v => !v.restaurantId);
        }

        setVouchers(list);
        setPagination({
          page: res.pagination?.page || pageNumber,
          limit: res.pagination?.limit || 10,
          totalPages: res.pagination?.totalPages || 1
        });
      }
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách voucher toàn hệ thống');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdateVoucher = async (data) => {
    try {
      let res;
      if (editingVoucher) {
        res = await updateAdminVoucher(editingVoucher._id, data);
      } else {
        res = await createPlatformVoucher({ ...data, type: 'platform', restaurantId: null });
      }
      if (res?.success) {
        toast.success(editingVoucher ? 'Cập nhật voucher thành công!' : 'Tạo mới voucher platform thành công!');
        setIsVoucherModalOpen(false);
        setEditingVoucher(null);
        loadVouchers(pagination.page);
      } else {
        toast.error(res?.message || 'Lỗi lưu thông tin voucher');
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi lưu thông tin voucher');
    }
  };

  const handleToggleVoucherStatus = async (voucher) => {
    const nextStatus = voucher.status === 'active' ? 'paused' : 'active';
    try {
      const res = await changeAdminVoucherStatus(voucher._id, nextStatus);
      if (res?.success) {
        toast.success(nextStatus === 'active' ? 'Voucher đã hoạt động trở lại.' : 'Voucher đã tạm dừng.');
        loadVouchers(pagination.page);
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi thay đổi trạng thái');
    }
  };

  const handleDeleteVoucher = async (id) => {
    const force = window.confirm('Bạn muốn xóa vĩnh viễn (OK) hay chỉ vô hiệu hóa (Cancel) voucher này?');
    try {
      const res = await deleteAdminVoucher(id, force);
      if (res?.success) {
        toast.success(force ? 'Đã xóa vĩnh viễn voucher!' : 'Đã vô hiệu hóa voucher!');
        loadVouchers(pagination.page);
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi xử lý xóa voucher');
    }
  };

  const handleResetUsageSubmit = async (e) => {
    e.preventDefault();
    if (!resetModalVoucher) return;
    try {
      const res = await resetAdminVoucherUsage(resetModalVoucher._id, resetCount);
      if (res?.success) {
        setResetModalVoucher(null);
        loadVouchers(pagination.page);
        toast.success('Đã cập nhật số lượt sử dụng voucher thành công.');
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi reset lượt sử dụng');
    }
  };

  // --- CAMPAIGNS FLOW ---
  const loadCampaigns = async () => {
    setLoadingCampaigns(true);
    try {
      const res = await getAdminCampaigns();
      if (res?.success) {
        setCampaigns(res.data || []);
      }
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoadingCampaigns(false);
    }
  };

  const handleCampaignSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...campaignForm,
        targetSegments: [campaignForm.targetSegments],
        distributionRule: {}
      };
      let res;
      if (editingCampaign) {
        res = await updateAdminCampaign(editingCampaign._id, payload);
      } else {
        res = await createAdminCampaign(payload);
      }
      if (res?.success) {
        toast.success(editingCampaign ? 'Cập nhật chiến dịch thành công!' : 'Tạo mới chiến dịch thành công!');
        setIsCampaignModalOpen(false);
        setEditingCampaign(null);
        loadCampaigns();
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi lưu chiến dịch');
    }
  };

  const handleToggleCampaignStatus = async (campaign) => {
    const nextStatus = campaign.status === 'active' ? 'ended' : 'active';
    try {
      const res = await updateAdminCampaign(campaign._id, { status: nextStatus });
      if (res?.success) {
        toast.success(nextStatus === 'active' ? 'Kích hoạt chiến dịch thành công' : 'Đã đóng chiến dịch');
        loadCampaigns();
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi cập nhật chiến dịch');
    }
  };

  // --- COMPENSATION FLOW ---
  const handleCompSubmit = async (e) => {
    e.preventDefault();
    if (!compForm.customerId) {
      toast.error('Vui lòng nhập Customer ID');
      return;
    }
    if (!compForm.discountValue || Number(compForm.discountValue) <= 0) {
      toast.error('Mức giảm giá phải lớn hơn 0');
      return;
    }
    try {
      const res = await issueAdminVoucherCompensation({
        customerId: compForm.customerId.trim(),
        name: compForm.name,
        discountType: compForm.discountType,
        discountValue: Number(compForm.discountValue),
        minOrderAmount: Number(compForm.minOrderAmount),
        daysValid: Number(compForm.daysValid)
      });
      if (res?.success) {
        setIsCompModalOpen(false);
        setCompForm({
          customerId: '',
          name: 'Voucher đền bù dịch vụ',
          discountType: 'percentage',
          discountValue: '',
          minOrderAmount: '0',
          daysValid: '30'
        });
        toast.success('Phát hành voucher đền bù thành công và đã tự động thêm vào ví khách hàng.');
        if (activeTab === 'list') loadVouchers(1);
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi phát hành voucher đền bù. Vui lòng kiểm tra lại Customer ID.');
    }
  };

  // --- ANALYTICS FLOW ---
  const loadAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const res = await getAdminVouchersAnalytics(analyticsFilter);
      if (res?.success) {
        setAnalyticsData(res.data);
      }
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // --- FRAUD FLOW ---
  const loadFraudReport = async () => {
    setLoadingFraud(true);
    try {
      const res = await getAdminVouchersFraudReport();
      if (res?.success) {
        setFraudData(res.data);
      }
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoadingFraud(false);
    }
  };

  // --- SINGLE VOUCHER STATS FLOW ---
  const handleShowStats = async (voucher) => {
    setStatsVoucher(voucher);
    setLoadingStats(true);
    setStatsData(null);
    try {
      const res = await getAdminVouchersAnalytics({ voucherId: voucher._id });
      if (res?.success) {
        setStatsData(res.data);
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi lấy báo cáo thống kê');
      setStatsVoucher(null);
    } finally {
      setLoadingStats(false);
    }
  };

  return (
    <AdminLayout title="Quản lý Voucher Khuyến Mại" subtitle="Quản trị mã giảm giá toàn sàn và theo dõi mã của các nhà hàng">
      <div className="flex flex-col gap-6">
        
        {/* Navigation Tabs */}
        <div className="flex gap-6 border-b border-border/40 pb-px">
          <button 
            className={cn(
              "pb-3 text-sm font-medium transition-all relative cursor-pointer outline-none flex items-center gap-2",
              activeTab === 'list' ? 'text-primary' : 'text-zinc-400 hover:text-white'
            )}
            onClick={() => setActiveTab('list')}
          >
            <Ticket size={16} />
            <span>Vouchers Hệ Thống</span>
            {activeTab === 'list' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
          </button>
          <button 
            className={cn(
              "pb-3 text-sm font-medium transition-all relative cursor-pointer outline-none flex items-center gap-2",
              activeTab === 'campaigns' ? 'text-primary' : 'text-zinc-400 hover:text-white'
            )}
            onClick={() => setActiveTab('campaigns')}
          >
            <Calendar size={16} />
            <span>Quản Lý Chiến Dịch</span>
            {activeTab === 'campaigns' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
          </button>
          <button 
            className={cn(
              "pb-3 text-sm font-medium transition-all relative cursor-pointer outline-none flex items-center gap-2",
              activeTab === 'analytics' ? 'text-primary' : 'text-zinc-400 hover:text-white'
            )}
            onClick={() => setActiveTab('analytics')}
          >
            <TrendingUp size={16} />
            <span>Báo Cáo Hiệu Năng</span>
            {activeTab === 'analytics' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
          </button>
          <button 
            className={cn(
              "pb-3 text-sm font-medium transition-all relative cursor-pointer outline-none flex items-center gap-2",
              activeTab === 'fraud' ? 'text-primary' : 'text-zinc-400 hover:text-white'
            )}
            onClick={() => setActiveTab('fraud')}
          >
            <ShieldAlert size={16} />
            <span>Bảo Mật & Gian Lận</span>
            {activeTab === 'fraud' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
          </button>
        </div>

        {/* TAB 1: Vouchers List */}
        {activeTab === 'list' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <h2 className="text-lg font-bold text-white uppercase tracking-wide">Danh Sách Voucher Hệ Thống & Nhà Hàng</h2>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  className="h-10 border-border text-white hover:bg-secondary/60 text-xs font-semibold gap-1.5"
                  onClick={() => setIsCompModalOpen(true)}
                >
                  <Gift size={15} className="text-primary" /> Phát hành đền bù
                </Button>
                <Button 
                  className="h-10 bg-primary px-5 text-background hover:bg-primary/95 font-semibold text-xs gap-1.5"
                  onClick={() => {
                    setEditingVoucher(null);
                    setIsVoucherModalOpen(true);
                  }}
                >
                  <Plus size={15} /> Tạo Voucher Global
                </Button>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-5 bg-card border-border flex flex-col justify-between">
                <span className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Voucher Hệ Thống</span>
                <strong className="text-3xl font-extrabold text-white mt-1.5">{vouchers.length}</strong>
                <span className="text-xs text-zinc-500 mt-2 font-medium">{globalVouchers.length} Global | {restaurantVouchers.length} Nhà hàng</span>
              </Card>
              <Card className="p-5 bg-card border-border border-l-4 border-l-emerald-500 flex flex-col justify-between">
                <span className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Đang hoạt động</span>
                <strong className="text-3xl font-extrabold text-emerald-400 mt-1.5">{activeCount}</strong>
                <span className="text-xs text-zinc-500 mt-2 font-medium">Đang phân phối tới ví khách hàng</span>
              </Card>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap gap-3 items-center bg-card border border-border/40 p-4 rounded-xl">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Tìm theo tên hoặc mã code..." 
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === 'Enter') loadVouchers(1); }}
                  className="w-full pl-9 pr-3 py-2 bg-secondary/30 border border-border/60 rounded-lg text-xs text-white focus:outline-none focus:border-primary"
                />
              </div>

              <select 
                value={filters.scope} 
                onChange={(e) => setFilters(prev => ({ ...prev, scope: e.target.value }))}
                className="bg-secondary/40 border border-border/60 rounded-lg text-xs text-white p-2 focus:outline-none"
              >
                <option value="all">Tất cả phạm vi</option>
                <option value="platform">Voucher Global (Toàn sàn)</option>
                <option value="restaurant">Voucher của Nhà Hàng</option>
              </select>

              <select 
                value={filters.type} 
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="bg-secondary/40 border border-border/60 rounded-lg text-xs text-white p-2 focus:outline-none"
              >
                <option value="">Tất cả loại hình</option>
                <option value="platform">Platform</option>
                <option value="restaurant">Restaurant</option>
                <option value="loyalty">Loyalty</option>
                <option value="referral">Referral</option>
                <option value="compensation">Đền bù (Compensation)</option>
              </select>

              <select 
                value={filters.status} 
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="bg-secondary/40 border border-border/60 rounded-lg text-xs text-white p-2 focus:outline-none"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="active">Đang hoạt động</option>
                <option value="paused">Tạm dừng</option>
                <option value="scheduled">Chờ kích hoạt</option>
                <option value="disabled">Đã hủy</option>
              </select>

              <Button className="bg-primary text-background hover:bg-primary/95 text-xs font-bold py-2 px-4 rounded-lg h-9" onClick={() => loadVouchers(1)}>Lọc</Button>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm font-medium">Đang tải danh sách voucher hệ thống...</p>
              </div>
            ) : error ? (
              <Card className="border-rose-500/25 bg-rose-500/10 p-5 text-rose-300">
                <div className="flex items-center gap-3">
                  <AlertTriangle size={18} />
                  <span className="text-sm font-semibold">{error}</span>
                </div>
              </Card>
            ) : vouchers.length === 0 ? (
              <Card className="border-dashed border-border bg-card/70 p-8 text-center text-muted-foreground text-sm">
                Không tìm thấy voucher nào phù hợp với bộ lọc.
              </Card>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="overflow-x-auto border border-border/40 rounded-xl bg-card">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-border/50 bg-secondary/10">
                        <th className="p-3.5 text-muted-foreground font-semibold uppercase tracking-wider">Tên hiển thị</th>
                        <th className="p-3.5 text-muted-foreground font-semibold uppercase tracking-wider">Mã Code</th>
                        <th className="p-3.5 text-muted-foreground font-semibold uppercase tracking-wider">Phạm vi</th>
                        <th className="p-3.5 text-muted-foreground font-semibold uppercase tracking-wider">Loại hình</th>
                        <th className="p-3.5 text-muted-foreground font-semibold uppercase tracking-wider">Chiết khấu</th>
                        <th className="p-3.5 text-muted-foreground font-semibold uppercase tracking-wider">Đơn tối thiểu</th>
                        <th className="p-3.5 text-muted-foreground font-semibold uppercase tracking-wider">Đã dùng / Giới hạn</th>
                        <th className="p-3.5 text-muted-foreground font-semibold uppercase tracking-wider">Trạng thái</th>
                        <th className="p-3.5 text-muted-foreground font-semibold uppercase tracking-wider text-center">Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vouchers.map((v) => (
                        <tr key={v._id} className="border-b border-border/30 hover:bg-secondary/10 transition-colors">
                          <td className="p-3.5 font-bold text-white">{v.name}</td>
                          <td className="p-3.5"><code className="px-2 py-1 bg-secondary rounded text-primary border border-border/50 text-[11px] font-mono font-semibold">{v.code}</code></td>
                          <td className="p-3.5">
                            {v.restaurantId ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 max-w-[180px] truncate" title={v.restaurantId.name}>
                                NH: {v.restaurantId.name}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">Toàn sàn (Global)</span>
                            )}
                          </td>
                          <td className="p-3.5 text-muted-foreground capitalize">{v.type}</td>
                          <td className="p-3.5 font-bold text-primary">
                            {v.discountType === 'percentage' ? `${v.discountValue}%` : formatMoney(v.discountValue)}
                          </td>
                          <td className="p-3.5 text-muted-foreground">{formatMoney(v.minOrderAmount)}</td>
                          <td className="p-3.5 text-muted-foreground">
                            {v.currentUsage || 0} / {v.globalUsageLimit || '∞'}
                          </td>
                          <td className="p-3.5">
                            <VoucherStatusBadge status={v.status} />
                          </td>
                          <td className="p-3.5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <IconButton label="Reset/Sửa lượt sử dụng" onClick={() => {
                                setResetModalVoucher(v);
                                setResetCount(v.currentUsage || 0);
                              }}>
                                <RefreshCw size={15} />
                              </IconButton>
                              
                              {v.status !== 'disabled' && (
                                <>
                                  <IconButton 
                                    label={v.status === 'active' ? 'Tạm dừng' : 'Kích hoạt'}
                                    onClick={() => handleToggleVoucherStatus(v)}
                                  >
                                    <Power size={15} className={v.status === 'active' ? 'text-emerald-400' : ''} />
                                  </IconButton>
                                  <IconButton 
                                    label="Chỉnh sửa"
                                    onClick={() => {
                                      setEditingVoucher(v);
                                      setIsVoucherModalOpen(true);
                                    }}
                                  >
                                    <Pencil size={15} />
                                  </IconButton>
                                  <IconButton 
                                    label="Xóa/Vô hiệu hóa"
                                    danger
                                    onClick={() => handleDeleteVoucher(v._id)}
                                  >
                                    <Trash2 size={15} />
                                  </IconButton>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-end gap-3 mt-2">
                    <Button 
                      variant="outline"
                      size="sm"
                      className="border-border text-white hover:bg-secondary text-xs h-8"
                      disabled={pagination.page === 1}
                      onClick={() => loadVouchers(pagination.page - 1)}
                    >
                      Trước
                    </Button>
                    <span className="text-xs text-muted-foreground">Trang {pagination.page} / {pagination.totalPages}</span>
                    <Button 
                      variant="outline"
                      size="sm"
                      className="border-border text-white hover:bg-secondary text-xs h-8"
                      disabled={pagination.page === pagination.totalPages}
                      onClick={() => loadVouchers(pagination.page + 1)}
                    >
                      Sau
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Campaigns */}
        {activeTab === 'campaigns' && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-white uppercase tracking-wide">Chiến Dịch Khuyến Mại Hệ Thống</h2>
              <Button 
                className="h-10 bg-primary px-5 text-background hover:bg-primary/95 font-semibold text-xs gap-1.5"
                onClick={() => {
                  setEditingCampaign(null);
                  setCampaignForm({
                    name: '',
                    description: '',
                    type: 'flash_sale',
                    startDate: new Date().toISOString().slice(0, 16),
                    endDate: '',
                    targetSegments: 'all',
                    autoDistribute: false
                  });
                  setIsCampaignModalOpen(true);
                }}
              >
                <Plus size={15} /> Tạo Chiến Dịch Mới
              </Button>
            </div>

            {loadingCampaigns ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm font-medium">Đang tải danh sách chiến dịch...</p>
              </div>
            ) : campaigns.length === 0 ? (
              <Card className="border-dashed border-border bg-card/70 p-8 text-center text-muted-foreground text-sm">
                Chưa có chiến dịch khuyến mại nào được tạo.
              </Card>
            ) : (
              <div className="overflow-x-auto border border-border/40 rounded-xl bg-card">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border/50 bg-secondary/10">
                      <th className="p-3.5 text-muted-foreground font-semibold uppercase tracking-wider">Tên chiến dịch</th>
                      <th className="p-3.5 text-muted-foreground font-semibold uppercase tracking-wider">Loại hình</th>
                      <th className="p-3.5 text-muted-foreground font-semibold uppercase tracking-wider">Thời gian chạy</th>
                      <th className="p-3.5 text-muted-foreground font-semibold uppercase tracking-wider">Đối tượng áp dụng</th>
                      <th className="p-3.5 text-muted-foreground font-semibold uppercase tracking-wider">Phân phối tự động</th>
                      <th className="p-3.5 text-muted-foreground font-semibold uppercase tracking-wider">Trạng thái</th>
                      <th className="p-3.5 text-muted-foreground font-semibold uppercase tracking-wider text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((c) => (
                      <tr key={c._id} className="border-b border-border/30 hover:bg-secondary/10 transition-colors">
                        <td className="p-3.5 font-bold text-white">
                          <div>{c.name}</div>
                          {c.description && <div className="text-[10px] text-muted-foreground font-normal mt-0.5">{c.description}</div>}
                        </td>
                        <td className="p-3.5 text-muted-foreground uppercase font-semibold text-[10px] tracking-wider">{c.type}</td>
                        <td className="p-3.5 text-muted-foreground">
                          <div className="flex flex-col gap-0.5">
                            <span>Từ: {new Date(c.startDate).toLocaleString('vi-VN')}</span>
                            <span>Đến: {formatDate(c.endDate)}</span>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className="inline-block bg-secondary px-2 py-0.5 rounded border border-border/50 text-[10px] text-white font-medium capitalize">
                            {c.targetSegments?.join(', ') || 'Tất cả'}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className={cn(
                            "inline-block px-2 py-0.5 rounded text-[10px] font-bold border",
                            c.autoDistribute ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-zinc-500/10 border-zinc-550 text-zinc-400"
                          )}>
                            {c.autoDistribute ? 'Có' : 'Không'}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <VoucherStatusBadge status={c.status} />
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <IconButton 
                              label={c.status === 'active' ? 'Đóng chiến dịch' : 'Kích hoạt'}
                              onClick={() => handleToggleCampaignStatus(c)}
                            >
                              <Power size={15} className={c.status === 'active' ? 'text-emerald-400' : ''} />
                            </IconButton>
                            <IconButton 
                              label="Chỉnh sửa chiến dịch"
                              onClick={() => {
                                setEditingCampaign(c);
                                setCampaignForm({
                                  name: c.name,
                                  description: c.description || '',
                                  type: c.type,
                                  startDate: c.startDate ? new Date(c.startDate).toISOString().slice(0, 16) : '',
                                  endDate: c.endDate ? new Date(c.endDate).toISOString().slice(0, 16) : '',
                                  targetSegments: c.targetSegments?.[0] || 'all',
                                  autoDistribute: c.autoDistribute || false
                                });
                                setIsCampaignModalOpen(true);
                              }}
                            >
                              <Pencil size={15} />
                            </IconButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Analytics */}
        {activeTab === 'analytics' && (
          <div className="flex flex-col gap-6">
            <h2 className="text-lg font-bold text-white uppercase tracking-wide">Phân Tích Hiệu Suất Chiến Dịch Toàn Hệ Thống</h2>

            {/* Date filter */}
            <div className="flex flex-wrap gap-4 items-center bg-card border border-border/40 p-4 rounded-xl">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted-foreground">Từ ngày</label>
                <input 
                  type="date" 
                  value={analyticsFilter.startDate}
                  onChange={(e) => setAnalyticsFilter(p => ({ ...p, startDate: e.target.value }))}
                  className="bg-secondary/40 border border-border/60 rounded-lg text-xs text-white p-2 focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted-foreground">Đến ngày</label>
                <input 
                  type="date" 
                  value={analyticsFilter.endDate}
                  onChange={(e) => setAnalyticsFilter(p => ({ ...p, endDate: e.target.value }))}
                  className="bg-secondary/40 border border-border/60 rounded-lg text-xs text-white p-2 focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted-foreground">Độ chia</label>
                <select 
                  value={analyticsFilter.granularity}
                  onChange={(e) => setAnalyticsFilter(p => ({ ...p, granularity: e.target.value }))}
                  className="bg-secondary/40 border border-border/60 rounded-lg text-xs text-white p-2 focus:outline-none"
                >
                  <option value="day">Từng ngày</option>
                  <option value="week">Theo tuần</option>
                  <option value="month">Theo tháng</option>
                </select>
              </div>
              <Button className="bg-primary text-background hover:bg-primary/95 text-xs font-bold py-2 px-4 rounded-lg h-9 mt-5" onClick={loadAnalytics}>Áp dụng</Button>
            </div>

            {loadingAnalytics ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm font-medium">Đang tổng hợp dữ liệu thống kê...</p>
              </div>
            ) : analyticsData ? (
              <div className="flex flex-col gap-6">
                
                {/* KPIs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatBox label="Tổng Lượt Sử Dụng" value={analyticsData.finance?.totalRedeemed || 0} />
                  <StatBox label="Tổng Chiết Khấu Toàn Sàn" value={formatMoney(analyticsData.finance?.totalDiscountIssued)} accent />
                  <StatBox label="Tổng Doanh Thu Thu Về" value={formatMoney(analyticsData.finance?.totalRevenueGenerated)} />
                  <StatBox label="Chỉ số ROI trung bình" value={`${analyticsData.finance?.roi || 0}x`} accent />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* SVG Chart for usage trend */}
                  <Card className="p-6 border-border bg-card">
                    <h4 className="font-semibold text-white mb-4">Xu hướng sử dụng mã đặt cọc toàn sàn</h4>
                    {(!analyticsData.usageTrend || analyticsData.usageTrend.length === 0) ? (
                      <p className="py-12 text-center text-sm text-muted-foreground">Không có dữ liệu xu hướng trong khoảng thời gian này.</p>
                    ) : (
                      <div className="w-full">
                        <svg viewBox="0 0 500 200" className="w-full h-auto text-muted-foreground">
                          {/* Gridlines */}
                          <line x1="40" y1="20" x2="480" y2="20" stroke="rgba(216, 203, 184, 0.05)" />
                          <line x1="40" y1="70" x2="480" y2="70" stroke="rgba(216, 203, 184, 0.05)" />
                          <line x1="40" y1="120" x2="480" y2="120" stroke="rgba(216, 203, 184, 0.05)" />
                          <line x1="40" y1="160" x2="480" y2="160" stroke="rgba(255, 255, 255, 0.1)" />
                          
                          {/* Drawing lines or bars */}
                          {analyticsData.usageTrend.map((item, idx) => {
                            const barWidth = Math.max(8, 380 / analyticsData.usageTrend.length - 8);
                            const spacing = 6;
                            const x = 50 + idx * (barWidth + spacing);
                            const maxVal = Math.max(...(analyticsData.usageTrend?.map(i => i.count) || []), 1);
                            const barHeight = (item.count / maxVal) * 120;
                            const y = 160 - barHeight;
                            
                            return (
                              <g key={idx}>
                                <rect 
                                  x={x} 
                                  y={y} 
                                  width={barWidth} 
                                  height={barHeight} 
                                  fill="hsl(var(--primary))" 
                                  className="fill-primary opacity-80 hover:opacity-100 transition-opacity"
                                  rx={1.5}
                                />
                                <text 
                                  x={x + barWidth / 2} 
                                  y={175} 
                                  textAnchor="middle" 
                                  fontSize="8" 
                                  className="fill-muted-foreground"
                                >
                                  {item.date?.slice(-5) || ''}
                                </text>
                                <text 
                                  x={x + barWidth / 2} 
                                  y={y - 4} 
                                  textAnchor="middle" 
                                  fontSize="9" 
                                  className="fill-white font-semibold"
                                >
                                  {item.count}
                                </text>
                              </g>
                            );
                          })}
                        </svg>
                      </div>
                    )}
                  </Card>

                  {/* Funnel Conversions */}
                  <Card className="p-6 border-border bg-card">
                    <h4 className="font-semibold text-white mb-4">Phễu chuyển đổi Voucher toàn diện</h4>
                    {(!analyticsData.conversion || !analyticsData.conversion.funnel) ? (
                      <p className="py-12 text-center text-sm text-muted-foreground">Chưa có dữ liệu chuyển đổi.</p>
                    ) : (
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Lượt Xác Thực Mã (Validate)</span>
                            <span className="font-semibold text-white">{analyticsData.conversion.funnel.validates || 0} lượt</span>
                          </div>
                          <div className="h-6 w-full bg-secondary/50 rounded-lg overflow-hidden border border-border/30">
                            <div className="h-full bg-muted-foreground/30 text-[10px] text-white font-bold flex items-center pl-3" style={{ width: '100%' }}>
                              {analyticsData.conversion.funnel.validates || 0} (100%)
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Lưu Ví (Save)</span>
                            <span className="font-semibold text-white">
                              {analyticsData.conversion.funnel.saves || 0} ({analyticsData.conversion.conversionRates?.validateToSave || 0}%)
                            </span>
                          </div>
                          <div className="h-6 w-full bg-secondary/50 rounded-lg overflow-hidden border border-border/30">
                            <div className="h-full bg-amber-500/60 text-[10px] text-white font-bold flex items-center pl-3" style={{ width: `${analyticsData.conversion.conversionRates?.validateToSave || 0}%` }}>
                              {analyticsData.conversion.funnel.saves || 0} ({analyticsData.conversion.conversionRates?.validateToSave || 0}%)
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Đặt Thành Công (Redeem)</span>
                            <span className="font-semibold text-white">
                              {analyticsData.conversion.funnel.redeems || 0} ({analyticsData.conversion.conversionRates?.validateToRedeem || 0}%)
                            </span>
                          </div>
                          <div className="h-6 w-full bg-secondary/50 rounded-lg overflow-hidden border border-border/30">
                            <div className="h-full bg-primary/80 text-[10px] text-background font-bold flex items-center pl-3" style={{ width: `${analyticsData.conversion.conversionRates?.validateToRedeem || 0}%` }}>
                              {analyticsData.conversion.funnel.redeems || 0} ({analyticsData.conversion.conversionRates?.validateToRedeem || 0}%)
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                </div>

                {/* Top Vouchers Table */}
                <div className="overflow-x-auto border border-border/40 rounded-xl bg-card">
                  <div className="p-4 border-b border-border/50 bg-secondary/10 flex justify-between items-center">
                    <h3 className="font-bold text-white text-xs uppercase tracking-wider">
                      TOP VOUCHER HIỆU QUẢ CAO NHẤT
                    </h3>
                  </div>
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-border/50 bg-secondary/5">
                        <th className="p-3.5 text-muted-foreground font-semibold uppercase tracking-wider">Tên Voucher</th>
                        <th className="p-3.5 text-muted-foreground font-semibold uppercase tracking-wider">Mã Code</th>
                        <th className="p-3.5 text-muted-foreground font-semibold uppercase tracking-wider">Lượt sử dụng</th>
                        <th className="p-3.5 text-muted-foreground font-semibold uppercase tracking-wider">Tổng số tiền đã giảm</th>
                        <th className="p-3.5 text-muted-foreground font-semibold uppercase tracking-wider">Doanh thu kéo về</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(analyticsData.topVouchers || []).map((item, index) => (
                        <tr key={index} className="border-b border-border/30 hover:bg-secondary/10 transition-colors">
                          <td className="p-3.5 text-white font-semibold">{item.name}</td>
                          <td className="p-3.5"><code className="px-2 py-1 bg-secondary rounded text-primary border border-border/50 text-[10px] font-mono font-semibold">{item.code}</code></td>
                          <td className="p-3.5 text-white">{item.usageCount} lượt</td>
                          <td className="p-3.5 text-rose-400 font-semibold">-{formatMoney(item.totalDiscount)}</td>
                          <td className="p-3.5 text-emerald-400 font-bold">{formatMoney(item.revenueGenerated)}</td>
                        </tr>
                      ))}
                      {(!analyticsData.topVouchers || analyticsData.topVouchers.length === 0) && (
                        <tr>
                          <td colSpan="5" className="text-center py-8 text-muted-foreground italic">Chưa có voucher nào phát sinh redemptions.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <Card className="border-dashed border-border p-8 text-center text-muted-foreground text-sm">
                Không thể kết xuất dữ liệu báo cáo lúc này.
              </Card>
            )}
          </div>
        )}

        {/* TAB 4: Fraud & Security */}
        {activeTab === 'fraud' && (
          <div className="flex flex-col gap-6">
            <h2 className="text-lg font-bold text-white uppercase tracking-wide">Phát Hiện Gian Lận & Bảo Mật Voucher</h2>

            {loadingFraud ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm font-medium">Đang phân tích các mẫu hành vi bất thường...</p>
              </div>
            ) : fraudData ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Suspicious IPs */}
                <Card className="p-5 border-border bg-card flex flex-col gap-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                    <ShieldAlert className="h-5 w-5 text-rose-500 animate-pulse" />
                    <h3 className="font-semibold text-white text-sm">IP NHẬP NHIỀU MÃ BẤT THƯỜNG (24H QUA)</h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">Cảnh báo các địa chỉ IP liên tục thử nghiệm/áp dụng nhiều mã voucher khác nhau (lớn hơn 3 mã) nhằm spam hoặc dò quét code.</p>
                  
                  <div className="overflow-x-auto border border-border/40 rounded-xl bg-[#13161C]">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-border/50 bg-secondary/10">
                          <th className="p-3.5 text-muted-foreground font-semibold">Địa chỉ IP</th>
                          <th className="p-3.5 text-muted-foreground font-semibold">Số mã thử nghiệm</th>
                          <th className="p-3.5 text-muted-foreground font-semibold">Tổng số lượt nhấn</th>
                          <th className="p-3.5 text-muted-foreground font-semibold">Mức độ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(fraudData.suspiciousIPs || []).map((ip, idx) => (
                          <tr key={idx} className="border-b border-border/30 hover:bg-secondary/10">
                            <td className="p-3.5 font-mono font-semibold text-white">{ip.ipAddress}</td>
                            <td className="p-3.5 text-white">{ip.distinctVoucherCount} mã</td>
                            <td className="p-3.5 text-muted-foreground">{ip.attempts} lần</td>
                            <td className="p-3.5">
                              <span className={cn(
                                "inline-block px-2 py-0.5 rounded text-[9px] font-bold border uppercase",
                                ip.distinctVoucherCount > 5 ? "bg-rose-500/10 border-rose-500/20 text-rose-400" : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                              )}>
                                {ip.distinctVoucherCount > 5 ? 'Nguy cấp' : 'Cảnh giác'}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {(!fraudData.suspiciousIPs || fraudData.suspiciousIPs.length === 0) && (
                          <tr>
                            <td colSpan="4" className="text-center py-6 text-muted-foreground italic">
                              Chưa phát hiện hành vi spam IP bất thường.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>

                {/* Suspicious Customers */}
                <Card className="p-5 border-border bg-card flex flex-col gap-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                    <Activity className="h-5 w-5 text-rose-500" />
                    <h3 className="font-semibold text-white text-sm">KHÁCH HÀNG SPAM THỬ MÃ THẤT BẠI LIÊN TIẾP</h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">Danh sách tài khoản khách hàng thực hiện xác thực mã giảm giá bị thất bại trên 5 lần liên tiếp trong 24 giờ qua (hành vi đoán mã).</p>

                  <div className="overflow-x-auto border border-border/40 rounded-xl bg-[#13161C]">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-border/50 bg-secondary/10">
                          <th className="p-3.5 text-muted-foreground font-semibold">Khách hàng</th>
                          <th className="p-3.5 text-muted-foreground font-semibold">Email</th>
                          <th className="p-3.5 text-muted-foreground font-semibold">Lượt thất bại</th>
                          <th className="p-3.5 text-muted-foreground font-semibold">Các lý do lỗi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(fraudData.suspiciousCustomers || []).map((c, idx) => (
                          <tr key={idx} className="border-b border-border/30 hover:bg-secondary/10">
                            <td className="p-3.5 font-bold text-white">{c.customerName || 'N/A'}</td>
                            <td className="p-3.5 text-muted-foreground">{c.customerEmail || 'N/A'}</td>
                            <td className="p-3.5 text-rose-400 font-bold font-mono">{c.failures} lần</td>
                            <td className="p-3.5 text-muted-foreground text-[10px] max-w-[150px] truncate" title={c.reasons?.join(', ')}>
                              {c.reasons?.join(', ') || 'Không rõ'}
                            </td>
                          </tr>
                        ))}
                        {(!fraudData.suspiciousCustomers || fraudData.suspiciousCustomers.length === 0) && (
                          <tr>
                            <td colSpan="4" className="text-center py-6 text-muted-foreground italic">
                              Chưa phát hiện tài khoản dò quét mã nào.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            ) : (
              <Card className="border-dashed border-border p-8 text-center text-muted-foreground text-sm">
                Không thể lấy dữ liệu phân tích bảo mật lúc này.
              </Card>
            )}
          </div>
        )}

      </div>

      {/* MODAL 1: Create/Edit Platform/Global Voucher */}
      <VoucherFormModal
        isOpen={isVoucherModalOpen}
        onClose={() => {
          setIsVoucherModalOpen(false);
          setEditingVoucher(null);
        }}
        onSubmit={handleCreateOrUpdateVoucher}
        voucher={editingVoucher}
      />

      {/* MODAL 2: Create/Edit Campaign */}
      {isCampaignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" onClick={() => setIsCampaignModalOpen(false)}>
          <Card
            className="w-full max-w-lg border-border bg-card p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-4 border-b border-border mb-4">
              <h3 className="font-serif text-xl font-bold text-white">{editingCampaign ? 'Chỉnh Sửa Chiến Dịch' : 'Tạo Chiến Dịch Voucher Mới'}</h3>
              <button 
                type="button" 
                onClick={() => setIsCampaignModalOpen(false)}
                className="text-muted-foreground hover:text-white cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCampaignSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted-foreground">Tên chiến dịch *</label>
                <input 
                  type="text" 
                  className="w-full rounded-lg border border-border bg-[#1A1D24] px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                  value={campaignForm.name}
                  onChange={(e) => setCampaignForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Ví dụ: Lễ hội ẩm thực hè 2026"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted-foreground">Mô tả chiến dịch</label>
                <textarea 
                  className="w-full rounded-lg border border-border bg-[#1A1D24] px-3 py-2 text-sm text-white focus:outline-none focus:border-primary min-h-[60px]"
                  value={campaignForm.description}
                  onChange={(e) => setCampaignForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Mô tả mục tiêu và cách thức phân phối voucher..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-muted-foreground">Loại chiến dịch</label>
                  <select 
                    className="w-full rounded-lg border border-border bg-[#1A1D24] px-3 py-2 text-sm text-white focus:outline-none"
                    value={campaignForm.type}
                    onChange={(e) => setCampaignForm(p => ({ ...p, type: e.target.value }))}
                  >
                    <option value="flash_sale">Flash Sale</option>
                    <option value="seasonal">Theo Mùa (Seasonal)</option>
                    <option value="event">Sự Kiện Đặc Biệt</option>
                    <option value="custom">Tùy Chọn (Custom)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-muted-foreground">Nhóm khách hàng mục tiêu</label>
                  <select 
                    className="w-full rounded-lg border border-border bg-[#1A1D24] px-3 py-2 text-sm text-white focus:outline-none"
                    value={campaignForm.targetSegments}
                    onChange={(e) => setCampaignForm(p => ({ ...p, targetSegments: e.target.value }))}
                  >
                    <option value="all">Tất cả khách hàng</option>
                    <option value="new_user">Khách hàng mới (New Users)</option>
                    <option value="vip">Khách hàng VIP</option>
                    <option value="inactive">Khách hàng lâu không đặt bàn</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-muted-foreground">Ngày bắt đầu *</label>
                  <input 
                    type="datetime-local" 
                    className="w-full rounded-lg border border-border bg-[#1A1D24] px-3 py-2 text-sm text-white focus:outline-none"
                    value={campaignForm.startDate}
                    onChange={(e) => setCampaignForm(p => ({ ...p, startDate: e.target.value }))}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-muted-foreground">Ngày kết thúc *</label>
                  <input 
                    type="datetime-local" 
                    className="w-full rounded-lg border border-border bg-[#1A1D24] px-3 py-2 text-sm text-white focus:outline-none"
                    value={campaignForm.endDate}
                    onChange={(e) => setCampaignForm(p => ({ ...p, endDate: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="autoDistribute"
                  checked={campaignForm.autoDistribute}
                  onChange={(e) => setCampaignForm(p => ({ ...p, autoDistribute: e.target.checked }))}
                  className="rounded border-border bg-[#1A1D24] text-primary focus:ring-0 cursor-pointer h-4 w-4"
                />
                <label htmlFor="autoDistribute" className="text-xs text-muted-foreground cursor-pointer select-none">
                  Tự động phân phối vào ví khi khách thuộc phân khúc đăng nhập/đặt bàn
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border mt-4">
                <Button type="button" variant="outline" className="border-border text-white hover:bg-secondary" onClick={() => setIsCampaignModalOpen(false)}>
                  Hủy bỏ
                </Button>
                <Button type="submit" className="bg-primary text-background hover:bg-primary/95">
                  {editingCampaign ? 'Cập nhật' : 'Tạo mới'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* MODAL 3: Reset Usage */}
      {resetModalVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" onClick={() => setResetModalVoucher(null)}>
          <Card
            className="w-full max-w-sm border-border bg-card p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="font-serif text-2xl font-bold text-white mb-2">Cập Nhật Số Lượt Sử Dụng</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Cập nhật lượt sử dụng của voucher <strong className="text-white">{resetModalVoucher.code}</strong>. 
              Điều này giúp tăng hoặc khôi phục lượt dùng tối đa của mã trên toàn sàn.
            </p>
            <form onSubmit={handleResetUsageSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted-foreground">Lượt sử dụng hiện tại</label>
                <input 
                  type="text" 
                  className="w-full rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm text-zinc-400 cursor-not-allowed"
                  value={resetModalVoucher.currentUsage || 0}
                  disabled
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted-foreground">Lượt sử dụng mới đặt lại thành *</label>
                <input 
                  type="number" 
                  className="w-full rounded-lg border border-border bg-secondary/35 px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                  value={resetCount}
                  onChange={(e) => setResetCount(Number(e.target.value))}
                  min="0"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button type="button" variant="outline" className="border-border text-white hover:bg-secondary" onClick={() => setResetModalVoucher(null)}>
                  Quay lại
                </Button>
                <Button type="submit" className="bg-primary text-background hover:bg-primary/90">
                  Xác nhận
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* MODAL 4: Issue Compensation */}
      {isCompModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" onClick={() => setIsCompModalOpen(false)}>
          <Card
            className="w-full max-w-lg border-border bg-card p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-4 border-b border-border mb-4">
              <h3 className="font-serif text-xl font-bold text-white">Phát Hành Voucher Đền Bù Cho Khách Hàng</h3>
              <button 
                type="button" 
                onClick={() => setIsCompModalOpen(false)}
                className="text-muted-foreground hover:text-white cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCompSubmit} className="space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                Phát hành một mã giảm giá cá nhân hóa đặc biệt trực tiếp vào ví voucher của khách hàng nhằm đền bù lỗi hệ thống, sự cố nhà hàng, hoặc chăm sóc đặc biệt.
              </p>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted-foreground">Mã ID tài khoản khách hàng (Customer User ID) *</label>
                <input 
                  type="text" 
                  className="w-full rounded-lg border border-border bg-[#1A1D24] px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                  value={compForm.customerId}
                  onChange={(e) => setCompForm(p => ({ ...p, customerId: e.target.value }))}
                  placeholder="Nhập Mongoose ObjectId của tài khoản khách hàng"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted-foreground">Tên hiển thị voucher</label>
                <input 
                  type="text" 
                  className="w-full rounded-lg border border-border bg-[#1A1D24] px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                  value={compForm.name}
                  onChange={(e) => setCompForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Ví dụ: Voucher đền bù đặt bàn ngày 16/06"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-muted-foreground">Hình thức giảm</label>
                  <select 
                    className="w-full rounded-lg border border-border bg-[#1A1D24] px-3 py-2 text-sm text-white focus:outline-none"
                    value={compForm.discountType}
                    onChange={(e) => setCompForm(p => ({ ...p, discountType: e.target.value }))}
                  >
                    <option value="percentage">Phần trăm (%)</option>
                    <option value="fixed_amount">Số tiền cố định (đ)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-muted-foreground">Mức giảm giá *</label>
                  <input 
                    type="number" 
                    className="w-full rounded-lg border border-border bg-[#1A1D24] px-3 py-2 text-sm text-white focus:outline-none"
                    value={compForm.discountValue}
                    onChange={(e) => setCompForm(p => ({ ...p, discountValue: e.target.value }))}
                    placeholder={compForm.discountType === 'percentage' ? 'Ví dụ: 20' : 'Ví dụ: 100000'}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-muted-foreground">Đơn tối thiểu áp dụng</label>
                  <input 
                    type="number" 
                    className="w-full rounded-lg border border-border bg-[#1A1D24] px-3 py-2 text-sm text-white focus:outline-none"
                    value={compForm.minOrderAmount}
                    onChange={(e) => setCompForm(p => ({ ...p, minOrderAmount: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-muted-foreground">Số ngày hiệu lực</label>
                  <input 
                    type="number" 
                    className="w-full rounded-lg border border-border bg-[#1A1D24] px-3 py-2 text-sm text-white focus:outline-none"
                    value={compForm.daysValid}
                    onChange={(e) => setCompForm(p => ({ ...p, daysValid: e.target.value }))}
                    min="1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border mt-4">
                <Button type="button" variant="outline" className="border-border text-white hover:bg-secondary" onClick={() => setIsCompModalOpen(false)}>
                  Hủy bỏ
                </Button>
                <Button type="submit" className="bg-primary text-background hover:bg-primary/95">
                  Phát hành ngay
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Drawer Báo cáo thống kê đơn lẻ */}
      {statsVoucher && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" 
          onClick={() => setStatsVoucher(null)}
        >
          <div 
            className="bg-[#1A1D24] border-l border-zinc-800 w-full max-w-md h-full p-6 shadow-2xl animate-in slide-in-from-right duration-250 flex flex-col justify-between" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-4 border-b border-zinc-800 mb-6">
              <h4 className="font-bold text-zinc-150 text-sm uppercase tracking-wide">Hiệu quả Voucher: {statsVoucher.code}</h4>
              <button 
                className="text-zinc-550 hover:text-zinc-200 text-2xl font-semibold leading-none cursor-pointer" 
                onClick={() => setStatsVoucher(null)}
              >
                &times;
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 scrollbar-none pr-1">
              {loadingStats ? (
                <div className="flex flex-col items-center justify-center py-20 text-zinc-450 space-y-2">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs">Đang tính toán số liệu...</span>
                </div>
              ) : statsData ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-[#13161C] border border-zinc-800 p-3 rounded-lg flex flex-col">
                      <span className="text-[10px] text-zinc-550 uppercase font-semibold">Đã lưu</span>
                      <h4 className="text-lg font-bold text-zinc-200 mt-1">{statsData.savedCount}</h4>
                    </div>
                    <div className="bg-[#13161C] border border-zinc-800 p-3 rounded-lg flex flex-col">
                      <span className="text-[10px] text-zinc-550 uppercase font-semibold">Đã dùng</span>
                      <h4 className="text-lg font-bold text-zinc-200 mt-1">{statsData.usedCount}</h4>
                    </div>
                    <div className="bg-[#13161C] border border-zinc-800 p-3 rounded-lg flex flex-col">
                      <span className="text-[10px] text-zinc-550 uppercase font-semibold">Đã giảm</span>
                      <h4 className="text-xs font-bold text-amber-500 mt-1 truncate">{formatMoney(statsData.totalDiscount)}</h4>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h5 className="text-xs font-bold text-zinc-300 uppercase tracking-wide">Lịch sử sử dụng chi tiết</h5>
                    {(!statsData.redemptions || statsData.redemptions.length === 0) ? (
                      <div className="text-xs text-zinc-500 italic py-4">Chưa có lượt sử dụng nào cho mã này.</div>
                    ) : (
                      <div className="divide-y divide-zinc-800/60">
                        {statsData.redemptions.map((r, idx) => (
                          <div key={idx} className="py-3 text-xs space-y-1">
                            <div className="flex justify-between items-center">
                              <strong className="text-zinc-200">Booking #{r.bookingId?.toString().slice(-6).toUpperCase()}</strong>
                              <span className="text-zinc-500 font-mono text-[10px]">
                                {new Date(r.usedAt).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                            <div className="text-[11px] text-zinc-400">
                              Đơn gốc: {formatMoney(r.amountBefore)} | Giảm: -{formatMoney(r.discountApplied)} | Thanh toán: {formatMoney(r.amountAfter)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-rose-450 text-center py-10">Không thể tải báo cáo.</div>
              )}
            </div>

            <div className="pt-4 border-t border-zinc-800 mt-6 flex justify-end">
              <button 
                className="px-4 py-2 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-semibold text-xs rounded-lg transition cursor-pointer"
                onClick={() => setStatsVoucher(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}

function IconButton({ children, label, onClick, danger }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary cursor-pointer',
        danger && 'hover:border-rose-500/50 hover:text-rose-400'
      )}
    >
      {children}
    </button>
  );
}

function StatBox({ label, value, accent }) {
  return (
    <div className="rounded-xl border border-border bg-secondary/30 p-3 text-center">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={cn('mt-1 truncate font-serif text-lg font-bold text-white', accent && 'text-primary')}>{value}</p>
    </div>
  );
}
