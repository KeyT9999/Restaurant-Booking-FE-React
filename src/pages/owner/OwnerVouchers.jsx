import { useEffect, useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  Plus,
  ToggleLeft,
  ToggleRight,
  Trash2,
  BarChart2,
  Ticket,
  ClipboardList,
  TrendingUp,
  Edit,
  AlertTriangle,
  Loader2,
  Power,
  X,
  Pencil,
  AlertCircle,
} from 'lucide-react';
import OwnerLayout from '../../components/owner/OwnerLayout';
import { useRestaurantContext } from '../../context/useRestaurantContext';
import {
  getOwnerVouchers,
  createOwnerVoucher,
  updateOwnerVoucher,
  deleteOwnerVoucher,
  changeOwnerVoucherStatus,
  getOwnerVoucherStats,
  getOwnerRestaurantRedemptions,
  getOwnerVouchersAnalytics,
} from '../../api/voucherApi';
import VoucherFormModal from '../../components/voucher/VoucherFormModal';
import VoucherStatusBadge from '../../components/voucher/VoucherStatusBadge';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { cn } from '../../components/ui/utils';

const formatMoney = (value) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value || 0);

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('vi-VN');
};

export default function OwnerVouchers() {
  const { selectedRestaurantId, selectedRestaurant, isRestaurantReady } = useRestaurantContext();
  const [activeTab, setActiveTab] = useState('list'); // list, analytics, logs
  
  // List states
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  
  // Summary Stats states (top cards)
  const [summaryStats, setSummaryStats] = useState({ totalRedeemed: 0, totalDiscountIssued: 0 });

  // Analytics states
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  
  // Logs states
  const [redemptions, setRedemptions] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logsPagination, setLogsPagination] = useState({ page: 1, limit: 10, totalPages: 1 });

  // Custom confirm delete modal state
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Stats modal/drawer states
  const [statsVoucher, setStatsVoucher] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const activeCount = useMemo(() => {
    return vouchers.filter(v => v.status === 'active').length;
  }, [vouchers]);

  const loadVouchers = async () => {
    if (!selectedRestaurantId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getOwnerVouchers({ restaurantId: selectedRestaurantId });
      if (res?.success) {
        setVouchers(res.data || []);
      } else {
        setVouchers([]);
      }
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách voucher');
    } finally {
      setLoading(false);
    }
  };

  const loadSummaryStats = async () => {
    if (!selectedRestaurantId) return;
    try {
      const res = await getOwnerVouchersAnalytics({ restaurantId: selectedRestaurantId });
      if (res?.success && res.data?.finance) {
        setSummaryStats({
          totalRedeemed: res.data.finance.totalRedeemed || 0,
          totalDiscountIssued: res.data.finance.totalDiscountIssued || 0
        });
      }
    } catch (err) {
      console.error('Lỗi tải tóm tắt thống kê:', err.message);
    }
  };

  const loadAnalytics = async () => {
    if (!selectedRestaurantId) return;
    try {
      setLoadingAnalytics(true);
      const res = await getOwnerVouchersAnalytics({ restaurantId: selectedRestaurantId });
      if (res?.success) {
        setAnalyticsData(res.data);
      }
    } catch (err) {
      console.error('Không thể tải báo cáo:', err.message);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const loadLogs = async (pageNumber = 1) => {
    if (!selectedRestaurantId) return;
    try {
      setLoadingLogs(true);
      const res = await getOwnerRestaurantRedemptions({ restaurantId: selectedRestaurantId, page: pageNumber, limit: 10 });
      if (res?.success) {
        setRedemptions(res.data || []);
        setLogsPagination({
          page: res.pagination?.page || pageNumber,
          limit: res.pagination?.limit || 10,
          totalPages: res.pagination?.totalPages || 1
        });
      }
    } catch (err) {
      console.error('Lỗi tải nhật ký dùng:', err.message);
      setRedemptions([]);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (!selectedRestaurantId) return;
    
    loadVouchers();
    loadSummaryStats();

    if (activeTab === 'analytics') {
      loadAnalytics();
    } else if (activeTab === 'logs') {
      loadLogs(1);
    }
  }, [selectedRestaurantId, activeTab]);

  const handleCreateOrUpdate = async (data) => {
    try {
      const payload = { ...data, restaurantId: selectedRestaurantId };
      let res;
      if (editingVoucher) {
        res = await updateOwnerVoucher(editingVoucher._id, payload);
      } else {
        res = await createOwnerVoucher(payload);
      }
      
      if (res?.success) {
        toast.success(editingVoucher ? 'Cập nhật voucher thành công!' : 'Tạo mới voucher thành công!');
        setIsModalOpen(false);
        setEditingVoucher(null);
        loadVouchers();
        loadSummaryStats();
      } else {
        toast.error(res?.message || 'Lỗi lưu thông tin voucher');
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi lưu thông tin voucher');
    }
  };

  const handleToggleStatus = async (voucher) => {
    const nextStatus = voucher.status === 'active' ? 'paused' : 'active';
    try {
      const res = await changeOwnerVoucherStatus(voucher._id, nextStatus);
      if (res?.success) {
        toast.success(nextStatus === 'active' ? 'Đã kích hoạt lại voucher.' : 'Đã tạm dừng voucher.');
        loadVouchers();
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi thay đổi trạng thái');
    }
  };

  const handleDeleteClick = (id) => {
    setConfirmDeleteId(id);
  };

  const executeDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      const res = await deleteOwnerVoucher(confirmDeleteId);
      if (res?.success) {
        toast.success('Đã vô hiệu hóa voucher thành công!');
        setConfirmDeleteId(null);
        loadVouchers();
        loadSummaryStats();
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi vô hiệu hóa voucher');
    }
  };

  const handleShowStats = async (voucher) => {
    setStatsVoucher(voucher);
    setLoadingStats(true);
    setStatsData(null);
    try {
      const res = await getOwnerVoucherStats(voucher._id);
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

  if (!isRestaurantReady) {
    return (
      <OwnerLayout title="Mã giảm giá" subtitle="Quản lý các chương trình khuyến mại">
        <Card className="mx-auto max-w-2xl border-dashed border-border bg-card/70 p-8 text-center mt-10">
          <Ticket className="mx-auto h-12 w-12 text-primary" />
          <h2 className="font-serif text-3xl font-bold text-white mt-4">Chọn nhà hàng</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Vui lòng chọn một nhà hàng từ thanh công cụ phía trên để tiếp tục thiết lập ưu đãi.
          </p>
        </Card>
      </OwnerLayout>
    );
  }

  return (
    <OwnerLayout title="Mã giảm giá" subtitle="Thiết lập các chương trình khuyến mại, mã giảm giá cọc đặt bàn cho khách hàng">
      <div className="flex flex-col gap-6">
        
        {/* Navigation Tabs */}
        <div className="flex gap-6 border-b border-border/40 pb-px">
          <button 
            className={cn(
              "pb-3 text-sm font-medium transition-all relative cursor-pointer outline-none flex items-center gap-2",
              activeTab === 'list' ? 'text-primary' : 'text-muted-foreground hover:text-white'
            )}
            onClick={() => setActiveTab('list')}
          >
            <Ticket size={16} />
            <span>Danh Sách Voucher</span>
            {activeTab === 'list' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
          </button>
          <button 
            className={cn(
              "pb-3 text-sm font-medium transition-all relative cursor-pointer outline-none flex items-center gap-2",
              activeTab === 'analytics' ? 'text-primary' : 'text-muted-foreground hover:text-white'
            )}
            onClick={() => setActiveTab('analytics')}
          >
            <TrendingUp size={16} />
            <span>Hiệu Quả Chiến Dịch</span>
            {activeTab === 'analytics' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
          </button>
          <button 
            className={cn(
              "pb-3 text-sm font-medium transition-all relative cursor-pointer outline-none flex items-center gap-2",
              activeTab === 'logs' ? 'text-primary' : 'text-muted-foreground hover:text-white'
            )}
            onClick={() => setActiveTab('logs')}
          >
            <ClipboardList size={16} />
            <span>Nhật Ký Sử Dụng</span>
            {activeTab === 'logs' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
          </button>
        </div>

        {/* Global KPI Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-5 bg-card border-border flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
              <Ticket className="h-5 w-5 text-primary" />
            </div>
            <div>
              <span className="block text-[10px] text-muted-foreground uppercase font-semibold">Tổng số Voucher</span>
              <h3 className="text-xl font-bold text-white mt-0.5">{vouchers.length}</h3>
            </div>
          </Card>
          <Card className="p-5 bg-card border-border flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div>
              <span className="block text-[10px] text-muted-foreground uppercase font-semibold">Đang Hoạt Động</span>
              <h3 className="text-xl font-bold text-white mt-0.5">{activeCount}</h3>
            </div>
          </Card>
          <Card className="p-5 bg-card border-border flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shrink-0">
              <ClipboardList className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <span className="block text-[10px] text-muted-foreground uppercase font-semibold">Tổng lượt đã dùng</span>
              <h3 className="text-xl font-bold text-white mt-0.5">{summaryStats.totalRedeemed}</h3>
            </div>
          </Card>
          <Card className="p-5 bg-card border-border flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shrink-0">
              <TrendingUp className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <span className="block text-[10px] text-muted-foreground uppercase font-semibold">Doanh thu tiết kiệm</span>
              <h3 className="text-xl font-bold text-amber-400 mt-0.5">{formatMoney(summaryStats.totalDiscountIssued)}</h3>
            </div>
          </Card>
        </div>

        {/* Tab 1: Voucher List */}
        {activeTab === 'list' && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between gap-4">
              <h4 className="text-base font-semibold text-white">Chi tiết chương trình của {selectedRestaurant?.name || 'Nhà hàng'}</h4>
              <Button 
                className="h-10 bg-primary px-5 text-background hover:bg-primary/95"
                onClick={() => {
                  setEditingVoucher(null);
                  setIsModalOpen(true);
                }}
              >
                <Plus size={16} /> Tạo Voucher mới
              </Button>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm font-medium">Đang tải danh sách voucher...</p>
              </div>
            ) : error ? (
              <Card className="border-rose-500/25 bg-rose-500/10 p-5 text-rose-300">
                <div className="flex items-center gap-3">
                  <AlertCircle size={18} />
                  <span className="text-sm font-semibold">{error}</span>
                </div>
              </Card>
            ) : vouchers.length === 0 ? (
              <Card className="border-dashed border-border bg-card/70 p-8 text-center">
                <Ticket className="mx-auto h-12 w-12 text-primary" />
                <h2 className="font-serif text-2xl font-bold text-white mt-4">Chưa có voucher nào</h2>
                <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
                  Bạn chưa tạo chương trình khuyến mại nào cho nhà hàng này. Tạo ngay voucher đầu tiên để thúc đẩy lượng đặt bàn!
                </p>
                <Button 
                  className="mx-auto mt-4 bg-primary text-background hover:bg-primary/95"
                  onClick={() => setIsModalOpen(true)}
                >
                  Tạo Voucher Đầu Tiên
                </Button>
              </Card>
            ) : (
              <div className="overflow-x-auto border border-border/40 rounded-xl bg-card">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border/50 bg-secondary/10">
                      <th className="p-3.5 text-muted-foreground font-semibold uppercase tracking-wider">Tên hiển thị</th>
                      <th className="p-3.5 text-muted-foreground font-semibold uppercase tracking-wider">Mã Code</th>
                      <th className="p-3.5 text-muted-foreground font-semibold uppercase tracking-wider">Loại giảm</th>
                      <th className="p-3.5 text-muted-foreground font-semibold uppercase tracking-wider">Giá trị giảm</th>
                      <th className="p-3.5 text-muted-foreground font-semibold uppercase tracking-wider">Đơn tối thiểu</th>
                      <th className="p-3.5 text-muted-foreground font-semibold uppercase tracking-wider">Thời hạn</th>
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
                        <td className="p-3.5">{v.discountType === 'percentage' ? 'Phần trăm (%)' : 'Số tiền (đ)'}</td>
                        <td className="p-3.5 font-bold text-primary">
                          {v.discountType === 'percentage' ? `${v.discountValue}%` : formatMoney(v.discountValue)}
                        </td>
                        <td className="p-3.5 text-muted-foreground">{formatMoney(v.minOrderAmount)}</td>
                        <td className="p-3.5 text-muted-foreground">
                          <div className="flex flex-col gap-0.5">
                            <span>Từ: {formatDate(v.startDate)}</span>
                            <span>Đến: {formatDate(v.endDate)}</span>
                          </div>
                        </td>
                        <td className="p-3.5 text-muted-foreground">
                          {v.currentUsage || 0} {v.globalUsageLimit ? `/ ${v.globalUsageLimit}` : '(Không giới hạn)'}
                        </td>
                        <td className="p-3.5">
                          <VoucherStatusBadge status={v.status} />
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <IconButton label="Báo cáo hiệu quả" onClick={() => handleShowStats(v)}>
                              <BarChart2 size={15} />
                            </IconButton>
                            
                            {v.status !== 'disabled' && (
                              <>
                                <IconButton 
                                  label={v.status === 'active' ? 'Tạm dừng' : 'Kích hoạt'}
                                  onClick={() => handleToggleStatus(v)}
                                >
                                  <Power size={15} className={v.status === 'active' ? 'text-emerald-400' : ''} />
                                </IconButton>
                                
                                <IconButton 
                                  label="Chỉnh sửa"
                                  onClick={() => {
                                    setEditingVoucher(v);
                                    setIsModalOpen(true);
                                  }}
                                >
                                  <Pencil size={15} />
                                </IconButton>
                                
                                <IconButton 
                                  label="Vô hiệu hóa"
                                  danger
                                  onClick={() => handleDeleteClick(v._id)}
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
            )}
          </div>
        )}

        {/* Tab 2: Analytics */}
        {activeTab === 'analytics' && (
          <div className="flex flex-col gap-6">
            {loadingAnalytics ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm font-medium">Đang tải dữ liệu phân tích...</p>
              </div>
            ) : analyticsData ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatBox label="Lượt đã dùng" value={analyticsData.finance?.totalRedeemed || 0} />
                  <StatBox label="Tổng chiết khấu" value={formatMoney(analyticsData.finance?.totalDiscountIssued)} accent />
                  <StatBox label="Doanh thu cọc đặt bàn" value={formatMoney(analyticsData.finance?.totalRevenueGenerated)} />
                  <StatBox label="Chỉ số ROI đặt cọc" value={`${analyticsData.finance?.roi || 0}x`} accent />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* SVG Trend Chart */}
                  <Card className="p-6 border-border bg-card">
                    <h4 className="font-semibold text-white mb-4">Xu hướng sử dụng gần đây</h4>
                    {(!analyticsData.usageTrend || analyticsData.usageTrend.length === 0) ? (
                      <p className="py-12 text-center text-sm text-muted-foreground">Chưa có dữ liệu xu hướng.</p>
                    ) : (
                      <div className="w-full">
                        <svg viewBox="0 0 500 200" className="w-full h-auto text-muted-foreground">
                          {/* Y-axis gridlines */}
                          <line x1="40" y1="20" x2="480" y2="20" stroke="rgba(216, 203, 184, 0.05)" />
                          <line x1="40" y1="80" x2="480" y2="80" stroke="rgba(216, 203, 184, 0.05)" />
                          <line x1="40" y1="140" x2="480" y2="140" stroke="rgba(216, 203, 184, 0.05)" />
                          <line x1="40" y1="170" x2="480" y2="170" stroke="rgba(255, 255, 255, 0.1)" />
                          
                          {/* Render simple bars */}
                          {analyticsData.usageTrend.map((item, idx) => {
                            const barWidth = 30;
                            const spacing = 15;
                            const x = 50 + idx * (barWidth + spacing);
                            const maxVal = Math.max(...(analyticsData.usageTrend?.map(i => i.count) || []), 1);
                            const barHeight = (item.count / maxVal) * 130;
                            const y = 170 - barHeight;
                            
                            return (
                              <g key={idx}>
                                <rect 
                                  x={x} 
                                  y={y} 
                                  width={barWidth} 
                                  height={barHeight} 
                                  fill="hsl(var(--primary))" 
                                  className="fill-primary opacity-80 hover:opacity-100 transition-opacity"
                                  rx={2}
                                />
                                <text 
                                  x={x + barWidth / 2} 
                                  y={185} 
                                  textAnchor="middle" 
                                  fontSize="9" 
                                  className="fill-muted-foreground"
                                >
                                  {item.date?.slice(-5) || ''}
                                </text>
                                <text 
                                  x={x + barWidth / 2} 
                                  y={y - 5} 
                                  textAnchor="middle" 
                                  fontSize="10" 
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
                    <h4 className="font-semibold text-white mb-4">Phễu chuyển đổi Voucher</h4>
                    {(!analyticsData.conversion || !analyticsData.conversion.funnel) ? (
                      <p className="py-12 text-center text-sm text-muted-foreground">Chưa có dữ liệu chuyển đổi.</p>
                    ) : (
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Lượt Thử (Validate)</span>
                            <span className="font-semibold text-white">{analyticsData.conversion.funnel.validates || 0}</span>
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
              </>
            ) : (
              <Card className="border-dashed border-border p-8 text-center text-muted-foreground">
                <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
                <p className="text-sm">Không thể phân tích dữ liệu hiệu quả vào lúc này.</p>
              </Card>
            )}
          </div>
        )}

        {/* Tab 3: Detailed Logs */}
        {activeTab === 'logs' && (
          <div className="flex flex-col gap-6">
            {loadingLogs ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm font-medium">Đang tải nhật ký dùng...</p>
              </div>
            ) : redemptions.length === 0 ? (
              <Card className="border-dashed border-border bg-card/70 p-8 text-center">
                <ClipboardList className="mx-auto h-12 w-12 text-primary" />
                <h2 className="font-serif text-2xl font-bold text-white mt-4">Chưa có lượt sử dụng nào</h2>
                <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
                  Không tìm thấy nhật ký sử dụng voucher nào tại nhà hàng này.
                </p>
              </Card>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="overflow-x-auto border border-border/40 rounded-xl bg-card">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-border/50 bg-secondary/10">
                        <th className="p-3.5 text-muted-foreground font-semibold uppercase tracking-wider">Thời gian</th>
                        <th className="p-3.5 text-muted-foreground font-semibold uppercase tracking-wider">Khách hàng</th>
                        <th className="p-3.5 text-muted-foreground font-semibold uppercase tracking-wider">Mã Voucher</th>
                        <th className="p-3.5 text-muted-foreground font-semibold uppercase tracking-wider">Booking ID</th>
                        <th className="p-3.5 text-muted-foreground font-semibold uppercase tracking-wider">Giảm giá</th>
                        <th className="p-3.5 text-muted-foreground font-semibold uppercase tracking-wider">Trước giảm</th>
                        <th className="p-3.5 text-muted-foreground font-semibold uppercase tracking-wider">Sau giảm</th>
                        <th className="p-3.5 text-muted-foreground font-semibold uppercase tracking-wider">Loại kênh</th>
                      </tr>
                    </thead>
                    <tbody>
                      {redemptions.map((r) => (
                        <tr key={r._id} className="border-b border-border/30 hover:bg-secondary/10 transition-colors">
                          <td className="p-3.5 text-muted-foreground">{new Date(r.usedAt).toLocaleString('vi-VN')}</td>
                          <td className="p-3.5 text-white">
                            {r.customer ? (
                              <div className="flex flex-col gap-0.5">
                                <span className="font-semibold">{r.customer.fullName}</span>
                                <span className="text-[10px] text-muted-foreground">{r.customer.phoneNumber || r.customer.email}</span>
                              </div>
                            ) : <span className="text-muted-foreground/60 italic">Khách vãng lai</span>}
                          </td>
                          <td className="p-3.5"><code className="px-2 py-1 bg-secondary rounded text-primary border border-border/50 text-[10px] font-mono font-semibold">{r.voucher?.code || '—'}</code></td>
                          <td className="p-3.5 font-mono text-muted-foreground">#{String(r.bookingId).slice(-6).toUpperCase()}</td>
                          <td className="p-3.5 text-rose-400 font-bold">-{formatMoney(r.discountApplied)}</td>
                          <td className="p-3.5 text-muted-foreground">{formatMoney(r.amountBefore)}</td>
                          <td className="p-3.5 font-semibold text-white">{formatMoney(r.amountAfter)}</td>
                          <td className="p-3.5">
                            <span className={cn(
                              "inline-block px-2 py-0.5 rounded-full text-[9px] font-semibold border",
                              r.channel === 'booking' ? "bg-primary/10 border-primary/20 text-primary" : "bg-secondary border-border text-muted-foreground"
                            )}>
                              {r.channel === 'booking' ? 'Đặt bàn cọc' : 'Dùng trực tiếp'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {logsPagination.totalPages > 1 && (
                  <div className="flex items-center justify-end gap-3 mt-2">
                    <Button 
                      variant="outline"
                      size="sm"
                      className="border-border text-white hover:bg-secondary text-xs h-8"
                      disabled={logsPagination.page === 1}
                      onClick={() => loadLogs(logsPagination.page - 1)}
                    >
                      Trước
                    </Button>
                    <span className="text-xs text-muted-foreground">Trang {logsPagination.page} / {logsPagination.totalPages}</span>
                    <Button 
                      variant="outline"
                      size="sm"
                      className="border-border text-white hover:bg-secondary text-xs h-8"
                      disabled={logsPagination.page === logsPagination.totalPages}
                      onClick={() => loadLogs(logsPagination.page + 1)}
                    >
                      Sau
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>

      <VoucherFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingVoucher(null);
        }}
        onSubmit={handleCreateOrUpdate}
        voucher={editingVoucher}
      />

      {/* Confirmation Dialog for Voucher Deactivation */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" onClick={() => setConfirmDeleteId(null)}>
          <Card
            className="w-full max-w-sm border-border bg-card p-6 text-center"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <AlertTriangle className="mx-auto h-12 w-12 text-rose-400 mb-3" />
            <h3 className="font-serif text-2xl font-bold text-white">Vô hiệu hóa Voucher?</h3>
            <p className="text-sm text-muted-foreground mt-2 mb-6 leading-relaxed">
              Bạn có chắc chắn muốn vô hiệu hóa mã giảm giá này? Hành động này sẽ dừng hoạt động của mã ngay lập tức và khách hàng sẽ không thể lưu hay áp dụng mã nữa.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="border-border text-white hover:bg-secondary" onClick={() => setConfirmDeleteId(null)}>
                Hủy bỏ
              </Button>
              <Button variant="destructive" onClick={executeDelete}>
                Xác nhận
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Drawer Báo cáo Thống kê đơn lẻ */}
      {statsVoucher && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/75 p-4 backdrop-blur-sm" onClick={() => setStatsVoucher(null)}>
          <Card
            className="flex h-full w-full max-w-[460px] flex-col rounded-none border-border bg-card p-0"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border p-5">
              <div>
                <h4 className="font-serif text-xl font-bold text-white">Hiệu quả Voucher</h4>
                <p className="text-sm text-muted-foreground">{statsVoucher.code}</p>
              </div>
              <button
                type="button"
                onClick={() => setStatsVoucher(null)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-secondary hover:text-white cursor-pointer"
                aria-label="Close voucher stats"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {loadingStats ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="text-sm">Đang tính toán số liệu...</span>
                </div>
              ) : statsData ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-3">
                    <StatBox label="Số lượt đã lưu" value={statsData.savedCount || 0} />
                    <StatBox label="Lượt đã dùng" value={statsData.usedCount || 0} />
                    <StatBox label="Doanh thu đã giảm" value={formatMoney(statsData.totalDiscount)} accent />
                  </div>

                  <div>
                    <h5 className="border-b border-border pb-2 text-xs font-bold uppercase tracking-wider text-white">
                      Nhật ký sử dụng gần đây
                    </h5>
                    {statsData.redemptions?.length ? (
                      <div className="mt-3 space-y-3">
                        {statsData.redemptions.map((item, index) => (
                          <div key={`${item.bookingId}-${index}`} className="rounded-xl border border-border bg-secondary/20 p-3 text-sm">
                            <div className="flex items-center justify-between gap-3 font-semibold text-white">
                              <span>Booking #{String(item.bookingId).slice(-6).toUpperCase()}</span>
                              <span className="text-xs font-normal text-muted-foreground">
                                {new Date(item.usedAt).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">
                              Giảm: {formatMoney(item.discountApplied)} · Đã thanh toán: {formatMoney(item.amountAfter)}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="py-8 text-center text-sm text-muted-foreground">Chưa có lượt sử dụng nào.</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">Không tìm thấy thống kê của voucher này.</p>
              )}
            </div>
          </Card>
        </div>
      )}

    </OwnerLayout>
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
