import { useEffect, useState } from 'react';
import { Plus, ToggleLeft, ToggleRight, Trash2, BarChart2, Ticket, ClipboardList, TrendingUp, Edit, AlertTriangle } from 'lucide-react';
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
  getOwnerVouchersAnalytics
} from '../../api/voucherApi';
import VoucherFormModal from '../../components/voucher/VoucherFormModal';
import VoucherStatusBadge from '../../components/voucher/VoucherStatusBadge';
import './OwnerVouchers.css';

const formatMoney = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v || 0);
const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : 'Không giới hạn';

export default function OwnerVouchers() {
  const { selectedRestaurantId, selectedRestaurant } = useRestaurantContext();
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

  // Stats modal states
  const [statsVoucher, setStatsVoucher] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Custom confirm delete modal state
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    if (!selectedRestaurantId) return;
    
    // Always load vouchers and summary stats when restaurant context changes
    loadVouchers();
    loadSummaryStats();

    if (activeTab === 'analytics') {
      loadAnalytics();
    } else if (activeTab === 'logs') {
      loadLogs(1);
    }
  }, [selectedRestaurantId, activeTab]);

  const loadVouchers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getOwnerVouchers({ restaurantId: selectedRestaurantId });
      if (res?.success) {
        setVouchers(res.data || []);
      }
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách voucher');
    } finally {
      setLoading(false);
    }
  };

  const loadSummaryStats = async () => {
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
    try {
      setLoadingLogs(true);
      // Fetch redemptions for all vouchers of the current restaurant
      const res = await getOwnerRestaurantRedemptions({ restaurantId: selectedRestaurantId, page: pageNumber, limit: 10 });
      if (res?.success) {
        setRedemptions(res.data || []);
        setLogsPagination({
          page: res.pagination.page,
          limit: res.pagination.limit,
          totalPages: res.pagination.totalPages
        });
      }
    } catch (err) {
      console.error('Lỗi tải nhật ký dùng:', err.message);
      setRedemptions([]);
    } finally {
      setLoadingLogs(false);
    }
  };

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
        alert(editingVoucher ? 'Cập nhật voucher thành công!' : 'Tạo mới voucher thành công!');
        setIsModalOpen(false);
        loadVouchers();
        loadSummaryStats();
      } else {
        alert(res?.message || 'Lỗi lưu thông tin voucher');
      }
    } catch (err) {
      alert(err.message || 'Lỗi lưu thông tin voucher');
    }
  };

  const handleToggleStatus = async (voucher) => {
    const nextStatus = voucher.status === 'active' ? 'paused' : 'active';
    try {
      const res = await changeOwnerVoucherStatus(voucher._id, nextStatus);
      if (res?.success) {
        loadVouchers();
      }
    } catch (err) {
      alert(err.message || 'Lỗi thay đổi trạng thái');
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
        setConfirmDeleteId(null);
        loadVouchers();
        loadSummaryStats();
      }
    } catch (err) {
      alert(err.message || 'Lỗi vô hiệu hóa voucher');
    }
  };

  const handleShowStats = async (voucher) => {
    setStatsVoucher(voucher);
    setLoadingStats(true);
    try {
      const res = await getOwnerVoucherStats(voucher._id);
      if (res?.success) {
        setStatsData(res.data);
      }
    } catch (err) {
      alert(err.message || 'Lỗi lấy báo cáo thống kê');
      setStatsVoucher(null);
    } finally {
      setLoadingStats(false);
    }
  };

  const activeCount = vouchers.filter(v => v.status === 'active').length;

  if (!selectedRestaurantId) {
    return (
      <OwnerLayout title="Mã giảm giá" subtitle="Quản lý các chương trình khuyến mại">
        <div className="owner-panel empty-context">
          <Ticket size={48} className="empty-icon-main" />
          <h2>Chọn nhà hàng để xem và quản lý Voucher</h2>
          <p>Vui lòng chọn một nhà hàng từ thanh công cụ phía trên để tiếp tục thiết lập ưu đãi.</p>
        </div>
      </OwnerLayout>
    );
  }

  return (
    <OwnerLayout title="Mã giảm giá" subtitle="Thiết lập các chương trình khuyến mại, mã giảm giá cọc đặt bàn cho khách hàng">
      <div className="owner-vouchers-container">
        
        {/* Navigation Tabs */}
        <div className="owner-vouchers-tabs">
          <button 
            className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            <Ticket size={16} /> Danh Sách Voucher
          </button>
          <button 
            className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <TrendingUp size={16} /> Hiệu Quả Chiến Dịch
          </button>
          <button 
            className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
            onClick={() => setActiveTab('logs')}
          >
            <ClipboardList size={16} /> Nhật Ký Sử Dụng
          </button>
        </div>

        {/* Global KPI Stats Grid */}
        <section className="vouchers-kpi-grid">
          <div className="kpi-card">
            <Ticket size={20} className="kpi-icon" />
            <div className="kpi-info">
              <span className="kpi-label">Tổng số Voucher</span>
              <h3 className="kpi-value">{vouchers.length}</h3>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon-active" />
            <div className="kpi-info">
              <span className="kpi-label">Đang Hoạt Động</span>
              <h3 className="kpi-value">{activeCount}</h3>
            </div>
          </div>
          <div className="kpi-card">
            <ClipboardList size={20} className="kpi-icon" />
            <div className="kpi-info">
              <span className="kpi-label">Tổng lượt đã dùng</span>
              <h3 className="kpi-value">{summaryStats.totalRedeemed}</h3>
            </div>
          </div>
          <div className="kpi-card">
            <TrendingUp size={20} className="kpi-icon" />
            <div className="kpi-info">
              <span className="kpi-label">Doanh thu tiết kiệm</span>
              <h3 className="kpi-value text-amber">{formatMoney(summaryStats.totalDiscountIssued)}</h3>
            </div>
          </div>
        </section>

        {/* Tab 1: Voucher List */}
        {activeTab === 'list' && (
          <>
            <div className="vouchers-actions-bar">
              <h4 className="section-table-title">Chi tiết chương trình của {selectedRestaurant?.name || 'Nhà hàng'}</h4>
              <button 
                className="btn-create-voucher" 
                onClick={() => {
                  setEditingVoucher(null);
                  setIsModalOpen(true);
                }}
              >
                <Plus size={16} /> Tạo Voucher mới
              </button>
            </div>

            {loading ? (
              <div className="vouchers-loading">
                <div className="gold-spinner"></div>
                <p>Đang tải danh sách voucher...</p>
              </div>
            ) : error ? (
              <div className="vouchers-error">{error}</div>
            ) : vouchers.length === 0 ? (
              <div className="vouchers-empty">
                <Ticket size={32} />
                <p>Bạn chưa tạo chương trình khuyến mại nào cho nhà hàng này.</p>
                <button 
                  className="btn-create-voucher inline-btn"
                  onClick={() => setIsModalOpen(true)}
                >
                  Tạo Voucher Đầu Tiên
                </button>
              </div>
            ) : (
              <div className="vouchers-table-wrap">
                <table className="vouchers-table">
                  <thead>
                    <tr>
                      <th>Tên hiển thị</th>
                      <th>Mã Code</th>
                      <th>Nhà hàng áp dụng</th>
                      <th>Loại giảm</th>
                      <th>Giá trị giảm</th>
                      <th>Đơn tối thiểu</th>
                      <th>Thời hạn</th>
                      <th>Đã dùng / Giới hạn</th>
                      <th>Trạng thái</th>
                      <th className="text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vouchers.map((v) => (
                      <tr key={v._id}>
                        <td>{v.name}</td>
                        <td className="voucher-code-td"><code>{v.code}</code></td>
                        <td><span className="restaurant-tag">{selectedRestaurant?.name || '—'}</span></td>
                        <td>{v.discountType === 'percentage' ? 'Phần trăm (%)' : 'Số tiền (đ)'}</td>
                        <td className="voucher-val-td">
                          {v.discountType === 'percentage' ? `${v.discountValue}%` : formatMoney(v.discountValue)}
                        </td>
                        <td>{formatMoney(v.minOrderAmount)}</td>
                        <td className="voucher-date-td">
                          <div>Từ: {formatDate(v.startDate)}</div>
                          <div>Đến: {formatDate(v.endDate)}</div>
                        </td>
                        <td>
                          {v.currentUsage} {v.globalUsageLimit ? `/ ${v.globalUsageLimit}` : '(Không giới hạn)'}
                        </td>
                        <td>
                          <VoucherStatusBadge status={v.status} />
                        </td>
                        <td>
                          <div className="vouchers-action-buttons">
                            <button 
                              className="action-btn btn-stats" 
                              data-tooltip="Báo cáo hiệu quả"
                              aria-label="Báo cáo hiệu quả"
                              onClick={() => handleShowStats(v)}
                            >
                              <BarChart2 size={15} />
                            </button>
                            
                            {v.status !== 'disabled' && (
                              <>
                                <button 
                                  className="action-btn btn-toggle" 
                                  data-tooltip={v.status === 'active' ? 'Tạm dừng' : 'Kích hoạt'}
                                  aria-label={v.status === 'active' ? 'Tạm dừng' : 'Kích hoạt'}
                                  onClick={() => handleToggleStatus(v)}
                                >
                                  {v.status === 'active' ? (
                                    <ToggleRight size={18} className="status-active-icon" />
                                  ) : (
                                    <ToggleLeft size={18} />
                                  )}
                                </button>
                                
                                <button 
                                  className="action-btn btn-edit" 
                                  data-tooltip="Chỉnh sửa"
                                  aria-label="Chỉnh sửa"
                                  onClick={() => {
                                    setEditingVoucher(v);
                                    setIsModalOpen(true);
                                  }}
                                >
                                  <Edit size={14} />
                                </button>
                                
                                <button 
                                  className="action-btn btn-delete" 
                                  data-tooltip="Vô hiệu hóa"
                                  aria-label="Vô hiệu hóa"
                                  onClick={() => handleDeleteClick(v._id)}
                                >
                                  <Trash2 size={14} />
                                </button>
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
          </>
        )}

        {/* Tab 2: Analytics */}
        {activeTab === 'analytics' && (
          <div className="analytics-tab-content">
            {loadingAnalytics ? (
              <div className="vouchers-loading">
                <div className="gold-spinner"></div>
                <p>Đang tải dữ liệu phân tích...</p>
              </div>
            ) : analyticsData ? (
              <>
                <div className="stats-kpi-grid">
                  <div className="stats-kpi">
                    <span className="stats-kpi-lbl">Lượt đã dùng</span>
                    <h4 className="stats-kpi-val">{analyticsData.finance.totalRedeemed}</h4>
                  </div>
                  <div className="stats-kpi">
                    <span className="stats-kpi-lbl">Tổng chiết khấu</span>
                    <h4 className="stats-kpi-val text-amber">{formatMoney(analyticsData.finance.totalDiscountIssued)}</h4>
                  </div>
                  <div className="stats-kpi">
                    <span className="stats-kpi-lbl">Doanh thu cọc đặt bàn</span>
                    <h4 className="stats-kpi-val">{formatMoney(analyticsData.finance.totalRevenueGenerated)}</h4>
                  </div>
                  <div className="stats-kpi">
                    <span className="stats-kpi-lbl">Chỉ số ROI đặt cọc</span>
                    <h4 className="stats-kpi-val text-amber">{analyticsData.finance.roi}x</h4>
                  </div>
                </div>

                <div className="charts-flex-row">
                  {/* SVG Trend Chart */}
                  <div className="chart-card">
                    <h4>Xu hướng sử dụng gần đây</h4>
                    {analyticsData.usageTrend.length === 0 ? (
                      <p className="no-chart-data">Chưa có dữ liệu xu hướng.</p>
                    ) : (
                      <div className="svg-chart-container">
                        <svg viewBox="0 0 500 200" className="analytics-svg-chart">
                          {/* Y-axis gridlines */}
                          <line x1="40" y1="20" x2="480" y2="20" stroke="rgba(216, 203, 184, 0.1)" />
                          <line x1="40" y1="80" x2="480" y2="80" stroke="rgba(216, 203, 184, 0.1)" />
                          <line x1="40" y1="140" x2="480" y2="140" stroke="rgba(216, 203, 184, 0.1)" />
                          <line x1="40" y1="170" x2="480" y2="170" stroke="var(--border-subtle)" />
                          
                          {/* Render simple bars */}
                          {analyticsData.usageTrend.map((item, idx) => {
                            const barWidth = 30;
                            const spacing = 15;
                            const x = 50 + idx * (barWidth + spacing);
                            const maxVal = Math.max(...analyticsData.usageTrend.map(i => i.count)) || 1;
                            const barHeight = (item.count / maxVal) * 130;
                            const y = 170 - barHeight;
                            
                            return (
                              <g key={idx}>
                                <rect 
                                  x={x} 
                                  y={y} 
                                  width={barWidth} 
                                  height={barHeight} 
                                  fill="var(--color-amber-glow)" 
                                />
                                <text 
                                  x={x + barWidth / 2} 
                                  y={185} 
                                  textAnchor="middle" 
                                  fontSize="9" 
                                  fill="var(--color-faded-stone)"
                                >
                                  {item.date.slice(-5)}
                                </text>
                                <text 
                                  x={x + barWidth / 2} 
                                  y={y - 5} 
                                  textAnchor="middle" 
                                  fontSize="10" 
                                  fill="var(--color-aged-parchment)"
                                >
                                  {item.count}
                                </text>
                              </g>
                            );
                          })}
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Funnel Conversions */}
                  <div className="chart-card">
                    <h4>Phễu chuyển đổi Voucher</h4>
                    <div className="funnel-container">
                      <div className="funnel-stage">
                        <span className="stage-label">Lượt Thử (Validate)</span>
                        <div className="stage-bar stage-1">{analyticsData.conversion.funnel.validates}</div>
                      </div>
                      <div className="funnel-stage">
                        <span className="stage-label">Lưu Ví (Save)</span>
                        <div className="stage-bar stage-2" style={{ width: `${analyticsData.conversion.conversionRates.validateToSave || 100}%` }}>
                          {analyticsData.conversion.funnel.saves} ({analyticsData.conversion.conversionRates.validateToSave}%)
                        </div>
                      </div>
                      <div className="funnel-stage">
                        <span className="stage-label">Đặt Thành Công (Redeem)</span>
                        <div className="stage-bar stage-3" style={{ width: `${analyticsData.conversion.conversionRates.validateToRedeem || 100}%` }}>
                          {analyticsData.conversion.funnel.redeems} ({analyticsData.conversion.conversionRates.validateToRedeem}%)
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="stats-error">Không thể phân tích dữ liệu hiệu quả vào lúc này.</div>
            )}
          </div>
        )}

        {/* Tab 3: Detailed Logs */}
        {activeTab === 'logs' && (
          <div className="logs-tab-content">
            {loadingLogs ? (
              <div className="vouchers-loading">
                <div className="gold-spinner"></div>
                <p>Đang tải nhật ký dùng...</p>
              </div>
            ) : redemptions.length === 0 ? (
              <div className="vouchers-empty">
                <ClipboardList size={32} />
                <p>Không tìm thấy nhật ký sử dụng voucher nào tại nhà hàng này.</p>
              </div>
            ) : (
              <div className="vouchers-table-wrap">
                <table className="vouchers-table">
                  <thead>
                    <tr>
                      <th>Thời gian</th>
                      <th>Khách hàng</th>
                      <th>Mã Voucher</th>
                      <th>Booking ID</th>
                      <th>Giảm giá</th>
                      <th>Trước giảm</th>
                      <th>Sau giảm</th>
                      <th>Loại kênh</th>
                    </tr>
                  </thead>
                  <tbody>
                    {redemptions.map((r) => (
                      <tr key={r._id}>
                        <td>{new Date(r.usedAt).toLocaleString('vi-VN')}</td>
                        <td>
                          {r.customer ? (
                            <div>
                              <div className="customer-name-bold">{r.customer.fullName}</div>
                              <div className="log-customer-meta">{r.customer.phoneNumber || r.customer.email}</div>
                            </div>
                          ) : <span className="customer-anonymous">Khách vãng lai</span>}
                        </td>
                        <td><code className="voucher-code-tag">{r.voucher?.code || '—'}</code></td>
                        <td>Booking #{r.bookingId?.toString().slice(-6).toUpperCase()}</td>
                        <td className="text-amber">-{formatMoney(r.discountApplied)}</td>
                        <td>{formatMoney(r.amountBefore)}</td>
                        <td>{formatMoney(r.amountAfter)}</td>
                        <td>
                          <span className="channel-badge">{r.channel === 'booking' ? 'Đặt bàn cọc' : 'Dùng trực tiếp'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {logsPagination.totalPages > 1 && (
                  <div className="logs-pagination">
                    <button 
                      className="pagination-btn"
                      disabled={logsPagination.page === 1}
                      onClick={() => loadLogs(logsPagination.page - 1)}
                    >
                      Trước
                    </button>
                    <span className="pagination-info">Trang {logsPagination.page} / {logsPagination.totalPages}</span>
                    <button 
                      className="pagination-btn"
                      disabled={logsPagination.page === logsPagination.totalPages}
                      onClick={() => loadLogs(logsPagination.page + 1)}
                    >
                      Sau
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Modal Form Tạo/Sửa */}
        <VoucherFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateOrUpdate}
          voucher={editingVoucher}
        />

        {/* Drawer Báo cáo Thống kê đơn lẻ */}
        {statsVoucher && (
          <div className="stats-drawer-overlay" onClick={() => setStatsVoucher(null)}>
            <div className="stats-drawer" onClick={(e) => e.stopPropagation()}>
              <div className="stats-drawer-header">
                <h4>Hiệu quả Voucher: {statsVoucher.code}</h4>
                <button className="stats-drawer-close" onClick={() => setStatsVoucher(null)}>&times;</button>
              </div>
              <div className="stats-drawer-body">
                {loadingStats ? (
                  <div className="stats-loading">
                    <div className="gold-spinner"></div>
                    <p>Đang tính toán số liệu...</p>
                  </div>
                ) : statsData ? (
                  <div className="stats-content">
                    <div className="stats-drawer-kpis">
                      <div className="stats-kpi-small">
                        <span className="stats-kpi-lbl">Số lượt đã lưu</span>
                        <h4 className="stats-kpi-val">{statsData.savedCount}</h4>
                      </div>
                      <div className="stats-kpi-small">
                        <span className="stats-kpi-lbl">Lượt đã redeem</span>
                        <h4 className="stats-kpi-val">{statsData.usedCount}</h4>
                      </div>
                      <div className="stats-kpi-small">
                        <span className="stats-kpi-lbl">Doanh thu đã giảm</span>
                        <h4 className="stats-kpi-val text-amber">{formatMoney(statsData.totalDiscount)}</h4>
                      </div>
                    </div>

                    <h5 className="stats-sub-title">Lịch sử sử dụng chi tiết</h5>
                    {statsData.redemptions?.length === 0 ? (
                      <div className="stats-empty">Chưa có lượt sử dụng nào cho mã này.</div>
                    ) : (
                      <div className="stats-history-list">
                        {statsData.redemptions.map((r, idx) => (
                          <div key={idx} className="stats-history-item">
                            <div className="history-item-top">
                              <strong>Booking #{r.bookingId?.toString().slice(-6).toUpperCase()}</strong>
                              <span className="history-date"> - {new Date(r.usedAt).toLocaleDateString('vi-VN')}</span>
                            </div>
                            <div className="history-amounts">
                              Đơn gốc: {formatMoney(r.amountBefore)} | Giảm: -{formatMoney(r.discountApplied)} | Thanh toán: {formatMoney(r.amountAfter)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="stats-error">Không thể tải báo cáo.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Custom Confirmation Dialog for Voucher Deactivation */}
        {confirmDeleteId && (
          <div className="confirm-modal-overlay">
            <div className="confirm-modal-container">
              <div className="confirm-modal-header">
                <AlertTriangle size={24} className="warning-icon" />
                <h4>Vô hiệu hóa Voucher</h4>
              </div>
              <p>Bạn có chắc chắn muốn vô hiệu hóa mã giảm giá này? Hành động này sẽ dừng hoạt động của mã ngay lập tức và khách hàng sẽ không thể lưu hay áp dụng mã nữa.</p>
              <div className="confirm-modal-actions">
                <button className="voucher-btn-secondary" onClick={() => setConfirmDeleteId(null)}>Hủy bỏ</button>
                <button className="voucher-btn-danger" onClick={executeDelete}>Xác nhận vô hiệu hóa</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </OwnerLayout>
  );
}
