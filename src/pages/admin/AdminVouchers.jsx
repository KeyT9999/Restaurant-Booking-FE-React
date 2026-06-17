import { useEffect, useState } from 'react';
import { 
  Ticket, Plus, ToggleLeft, ToggleRight, Trash2, BarChart2, Calendar, 
  ShieldAlert, TrendingUp, RefreshCw, Gift, Search, Edit, Eye, UserCheck, Activity
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
import './AdminVouchers.css';

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
      } else if (filters.scope === 'restaurant') {
        // We want only restaurant ones, we filter by setting non-null on restaurantId, 
        // the backend supports sending restaurantId filter.
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
          page: res.pagination.page,
          limit: res.pagination.limit,
          totalPages: res.pagination.totalPages
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
        alert(editingVoucher ? 'Cập nhật voucher thành công!' : 'Tạo mới voucher platform thành công!');
        setIsVoucherModalOpen(false);
        loadVouchers(pagination.page);
      } else {
        alert(res?.message || 'Lỗi lưu thông tin voucher');
      }
    } catch (err) {
      alert(err.message || 'Lỗi lưu thông tin voucher');
    }
  };

  const handleToggleVoucherStatus = async (voucher) => {
    const nextStatus = voucher.status === 'active' ? 'paused' : 'active';
    try {
      const res = await changeAdminVoucherStatus(voucher._id, nextStatus);
      if (res?.success) {
        loadVouchers(pagination.page);
      }
    } catch (err) {
      alert(err.message || 'Lỗi thay đổi trạng thái');
    }
  };

  const handleDeleteVoucher = async (id) => {
    const force = window.confirm('Bạn muốn xóa vĩnh viễn (OK) hay chỉ vô hiệu hóa (Cancel) voucher này?');
    try {
      const res = await deleteAdminVoucher(id, force);
      if (res?.success) {
        loadVouchers(pagination.page);
      }
    } catch (err) {
      alert(err.message || 'Lỗi xử lý xóa voucher');
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
        alert('Đã cập nhật số lượt sử dụng voucher thành công.');
      }
    } catch (err) {
      alert(err.message || 'Lỗi reset lượt sử dụng');
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
        alert(editingCampaign ? 'Cập nhật chiến dịch thành công!' : 'Tạo mới chiến dịch thành công!');
        setIsCampaignModalOpen(false);
        loadCampaigns();
      }
    } catch (err) {
      alert(err.message || 'Lỗi lưu chiến dịch');
    }
  };

  const handleToggleCampaignStatus = async (campaign) => {
    const nextStatus = campaign.status === 'active' ? 'ended' : 'active';
    try {
      const res = await updateAdminCampaign(campaign._id, { status: nextStatus });
      if (res?.success) {
        loadCampaigns();
      }
    } catch (err) {
      alert(err.message || 'Lỗi cập nhật chiến dịch');
    }
  };

  // --- COMPENSATION FLOW ---
  const handleCompSubmit = async (e) => {
    e.preventDefault();
    if (!compForm.customerId) {
      alert('Vui lòng nhập Customer ID');
      return;
    }
    if (!compForm.discountValue || Number(compForm.discountValue) <= 0) {
      alert('Mức giảm giá phải lớn hơn 0');
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
        alert('Phát hành voucher đền bù thành công và đã tự động thêm vào ví khách hàng.');
        if (activeTab === 'list') loadVouchers(1);
      }
    } catch (err) {
      alert(err.message || 'Lỗi phát hành voucher đền bù. Vui lòng kiểm tra lại Customer ID.');
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

  return (
    <AdminLayout>
      <div className="admin-vouchers-container">
        
        {/* Navigation Tabs */}
        <div className="admin-vouchers-tabs">
          <button 
            className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            <Ticket size={16} /> Vouchers Hệ Thống
          </button>
          <button 
            className={`tab-btn ${activeTab === 'campaigns' ? 'active' : ''}`}
            onClick={() => setActiveTab('campaigns')}
          >
            <Calendar size={16} /> Quản Lý Chiến Dịch
          </button>
          <button 
            className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <TrendingUp size={16} /> Báo Cáo Hiệu Năng
          </button>
          <button 
            className={`tab-btn ${activeTab === 'fraud' ? 'active' : ''}`}
            onClick={() => setActiveTab('fraud')}
          >
            <ShieldAlert size={16} /> Bảo Mật & Gian Lận
          </button>
        </div>

        {/* TAB 1: Vouchers List */}
        {activeTab === 'list' && (
          <div className="tab-pane">
            <div className="tab-pane-header">
              <h2>Quản Lý Danh Sách Voucher</h2>
              <div className="action-buttons-group">
                <button 
                  className="btn-admin-action btn-issue-comp" 
                  onClick={() => setIsCompModalOpen(true)}
                >
                  <Gift size={16} /> Phát hành đền bù
                </button>
                <button 
                  className="btn-admin-action btn-create-global" 
                  onClick={() => {
                    setEditingVoucher(null);
                    setIsVoucherModalOpen(true);
                  }}
                >
                  <Plus size={16} /> Tạo Voucher Global
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="admin-filters-bar">
              <div className="filter-input-wrap">
                <Search size={16} className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Tìm theo tên hoặc mã code..." 
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === 'Enter') loadVouchers(1); }}
                />
              </div>

              <select 
                value={filters.scope} 
                onChange={(e) => setFilters(prev => ({ ...prev, scope: e.target.value }))}
              >
                <option value="all">Tất cả phạm vi</option>
                <option value="platform">Voucher Global (Toàn sàn)</option>
                <option value="restaurant">Voucher của Nhà Hàng</option>
              </select>

              <select 
                value={filters.type} 
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
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
              >
                <option value="">Tất cả trạng thái</option>
                <option value="active">Đang hoạt động</option>
                <option value="paused">Tạm dừng</option>
                <option value="scheduled">Chờ kích hoạt</option>
                <option value="disabled">Đã hủy</option>
              </select>

              <button className="btn-filter-apply" onClick={() => loadVouchers(1)}>Lọc</button>
            </div>

            {loading ? (
              <div className="admin-vouchers__loading">Đang tải danh sách voucher hệ thống...</div>
            ) : error ? (
              <div className="admin-vouchers__error">{error}</div>
            ) : vouchers.length === 0 ? (
              <div className="admin-vouchers__empty">Không tìm thấy voucher nào phù hợp với bộ lọc.</div>
            ) : (
              <>
                <div className="admin-vouchers__table-wrap">
                  <table className="admin-vouchers__table">
                    <thead>
                      <tr>
                        <th>Tên hiển thị</th>
                        <th>Mã Code</th>
                        <th>Phạm vi</th>
                        <th>Loại hình</th>
                        <th>Chiết khấu</th>
                        <th>Đơn tối thiểu</th>
                        <th>Đã dùng / Giới hạn</th>
                        <th>Trạng thái</th>
                        <th className="text-center">Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vouchers.map((v) => (
                        <tr key={v._id}>
                          <td>{v.name}</td>
                          <td className="admin-code-td">{v.code}</td>
                          <td>
                            {v.restaurantId ? (
                              <span className="scope-badge scope-restaurant" title={v.restaurantId.name}>
                                NH: {v.restaurantId.name}
                              </span>
                            ) : (
                              <span className="scope-badge scope-global">Toàn sàn (Global)</span>
                            )}
                          </td>
                          <td style={{ textTransform: 'capitalize' }}>{v.type}</td>
                          <td className="admin-val-td text-amber">
                            {v.discountType === 'percentage' ? `${v.discountValue}%` : formatMoney(v.discountValue)}
                          </td>
                          <td>{formatMoney(v.minOrderAmount)}</td>
                          <td>
                            {v.currentUsage} / {v.globalUsageLimit || '∞'}
                          </td>
                          <td>
                            <VoucherStatusBadge status={v.status} />
                          </td>
                          <td>
                            <div className="admin-action-buttons-row">
                              <button 
                                className="admin-action-btn"
                                title="Reset/Sửa lượt sử dụng"
                                onClick={() => {
                                  setResetModalVoucher(v);
                                  setResetCount(v.currentUsage);
                                }}
                              >
                                <RefreshCw size={14} />
                              </button>
                              
                              {v.status !== 'disabled' && (
                                <>
                                  <button 
                                    className="admin-action-btn"
                                    title={v.status === 'active' ? 'Tạm dừng' : 'Kích hoạt'}
                                    onClick={() => handleToggleVoucherStatus(v)}
                                  >
                                    {v.status === 'active' ? (
                                      <ToggleRight size={18} className="text-green" />
                                    ) : (
                                      <ToggleLeft size={18} />
                                    )}
                                  </button>
                                  <button 
                                    className="admin-action-btn"
                                    title="Chỉnh sửa"
                                    onClick={() => {
                                      setEditingVoucher(v);
                                      setIsVoucherModalOpen(true);
                                    }}
                                  >
                                    <Edit size={14} />
                                  </button>
                                  <button 
                                    className="admin-action-btn text-red-btn"
                                    title="Xóa/Vô hiệu hóa"
                                    onClick={() => handleDeleteVoucher(v._id)}
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

                {pagination.totalPages > 1 && (
                  <div className="logs-pagination">
                    <button 
                      disabled={pagination.page === 1}
                      onClick={() => loadVouchers(pagination.page - 1)}
                    >
                      Trước
                    </button>
                    <span>Trang {pagination.page} / {pagination.totalPages}</span>
                    <button 
                      disabled={pagination.page === pagination.totalPages}
                      onClick={() => loadVouchers(pagination.page + 1)}
                    >
                      Sau
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* TAB 2: Campaigns */}
        {activeTab === 'campaigns' && (
          <div className="tab-pane">
            <div className="tab-pane-header">
              <h2>Chiến Dịch Khuyến Mại Hệ Thống</h2>
              <button 
                className="btn-admin-action btn-create-global" 
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
                <Plus size={16} /> Tạo Chiến Dịch Mới
              </button>
            </div>

            {loadingCampaigns ? (
              <div className="admin-vouchers__loading">Đang tải danh sách chiến dịch...</div>
            ) : campaigns.length === 0 ? (
              <div className="admin-vouchers__empty">Chưa có chiến dịch khuyến mại nào được tạo.</div>
            ) : (
              <div className="admin-vouchers__table-wrap">
                <table className="admin-vouchers__table">
                  <thead>
                    <tr>
                      <th>Tên chiến dịch</th>
                      <th>Loại hình</th>
                      <th>Thời gian chạy</th>
                      <th>Đối tượng áp dụng</th>
                      <th>Phân phối tự động</th>
                      <th>Trạng thái</th>
                      <th className="text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((c) => (
                      <tr key={c._id}>
                        <td>
                          <strong>{c.name}</strong>
                          <div style={{ fontSize: '11px', color: 'var(--color-faded-stone)' }}>{c.description}</div>
                        </td>
                        <td style={{ textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em' }}>{c.type}</td>
                        <td className="admin-date-td">
                          <div>Từ: {new Date(c.startDate).toLocaleString('vi-VN')}</div>
                          <div>Đến: {formatDate(c.endDate)}</div>
                        </td>
                        <td>
                          <span className="segment-badge">{c.targetSegments?.join(', ')}</span>
                        </td>
                        <td>
                          {c.autoDistribute ? (
                            <span className="yes-no-badge yes">Có</span>
                          ) : (
                            <span className="yes-no-badge no">Không</span>
                          )}
                        </td>
                        <td>
                          <VoucherStatusBadge status={c.status} />
                        </td>
                        <td>
                          <div className="admin-action-buttons-row">
                            <button 
                              className="admin-action-btn"
                              title={c.status === 'active' ? 'Đóng chiến dịch' : 'Kích hoạt'}
                              onClick={() => handleToggleCampaignStatus(c)}
                            >
                              {c.status === 'active' ? (
                                <ToggleRight size={18} className="text-green" />
                              ) : (
                                <ToggleLeft size={18} />
                              )}
                            </button>
                            <button 
                              className="admin-action-btn"
                              title="Chỉnh sửa chiến dịch"
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
                              <Edit size={14} />
                            </button>
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
          <div className="tab-pane">
            <div className="tab-pane-header">
              <h2>Phân Tích Hiệu Suất Chiến Dịch Toàn Hệ Thống</h2>
            </div>

            {/* Date filter */}
            <div className="analytics-filter-row">
              <div className="date-input-group">
                <label>Từ ngày</label>
                <input 
                  type="date" 
                  value={analyticsFilter.startDate}
                  onChange={(e) => setAnalyticsFilter(p => ({ ...p, startDate: e.target.value }))}
                />
              </div>
              <div className="date-input-group">
                <label>Đến ngày</label>
                <input 
                  type="date" 
                  value={analyticsFilter.endDate}
                  onChange={(p) => setAnalyticsFilter(p => ({ ...p, endDate: p.target.value }))}
                />
              </div>
              <div className="date-input-group">
                <label>Độ chia</label>
                <select 
                  value={analyticsFilter.granularity}
                  onChange={(e) => setAnalyticsFilter(p => ({ ...p, granularity: e.target.value }))}
                >
                  <option value="day">Từng ngày</option>
                  <option value="week">Theo tuần</option>
                  <option value="month">Theo tháng</option>
                </select>
              </div>
              <button className="btn-analytics-filter" onClick={loadAnalytics}>Áp dụng</button>
            </div>

            {loadingAnalytics ? (
              <div className="admin-vouchers__loading">Đang tổng hợp dữ liệu thống kê...</div>
            ) : analyticsData ? (
              <div className="analytics-pane-grid">
                
                {/* KPIs */}
                <div className="stats-kpi-grid">
                  <div className="stats-kpi">
                    <span className="stats-kpi-lbl">Tổng Lượt Sử Dụng</span>
                    <h4 className="stats-kpi-val">{analyticsData.finance.totalRedeemed}</h4>
                  </div>
                  <div className="stats-kpi">
                    <span className="stats-kpi-lbl">Tổng Chiết Khấu Toàn Sàn</span>
                    <h4 className="stats-kpi-val text-amber">{formatMoney(analyticsData.finance.totalDiscountIssued)}</h4>
                  </div>
                  <div className="stats-kpi">
                    <span className="stats-kpi-lbl">Tổng Doanh Thu Thu Về</span>
                    <h4 className="stats-kpi-val">{formatMoney(analyticsData.finance.totalRevenueGenerated)}</h4>
                  </div>
                  <div className="stats-kpi">
                    <span className="stats-kpi-lbl">Chỉ số ROI trung bình</span>
                    <h4 className="stats-kpi-val text-amber">{analyticsData.finance.roi}x</h4>
                  </div>
                </div>

                <div className="charts-flex-row">
                  {/* SVG Line/Bar Chart for usage trend */}
                  <div className="chart-card">
                    <h4>Xu hướng sử dụng mã đặt cọc toàn sàn</h4>
                    {analyticsData.usageTrend.length === 0 ? (
                      <p className="no-chart-data">Không có dữ liệu xu hướng trong khoảng thời gian này.</p>
                    ) : (
                      <div className="svg-chart-container">
                        <svg viewBox="0 0 500 200" className="analytics-svg-chart">
                          {/* Gridlines */}
                          <line x1="40" y1="20" x2="480" y2="20" stroke="rgba(216, 203, 184, 0.08)" />
                          <line x1="40" y1="70" x2="480" y2="70" stroke="rgba(216, 203, 184, 0.08)" />
                          <line x1="40" y1="120" x2="480" y2="120" stroke="rgba(216, 203, 184, 0.08)" />
                          <line x1="40" y1="160" x2="480" y2="160" stroke="var(--border-subtle)" />
                          
                          {/* Drawing lines or bars */}
                          {analyticsData.usageTrend.map((item, idx) => {
                            const barWidth = Math.max(10, 380 / analyticsData.usageTrend.length - 8);
                            const spacing = 6;
                            const x = 50 + idx * (barWidth + spacing);
                            const maxVal = Math.max(...analyticsData.usageTrend.map(i => i.count)) || 1;
                            const barHeight = (item.count / maxVal) * 120;
                            const y = 160 - barHeight;
                            
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
                                  y={175} 
                                  textAnchor="middle" 
                                  fontSize="8" 
                                  fill="var(--color-faded-stone)"
                                >
                                  {item.date.slice(-5)}
                                </text>
                                <text 
                                  x={x + barWidth / 2} 
                                  y={y - 4} 
                                  textAnchor="middle" 
                                  fontSize="9" 
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
                    <h4>Phễu chuyển đổi Voucher toàn diện</h4>
                    <div className="funnel-container">
                      <div className="funnel-stage">
                        <span className="stage-label">Lượt Xác Thực Mã (Validate)</span>
                        <div className="stage-bar stage-1">{analyticsData.conversion.funnel.validates} lượt</div>
                      </div>
                      <div className="funnel-stage">
                        <span className="stage-label">Lượt lưu ví (Save)</span>
                        <div className="stage-bar stage-2" style={{ width: `${analyticsData.conversion.conversionRates.validateToSave || 100}%` }}>
                          {analyticsData.conversion.funnel.saves} ({analyticsData.conversion.conversionRates.validateToSave}%)
                        </div>
                      </div>
                      <div className="funnel-stage">
                        <span className="stage-label">Lượt dùng thành công (Redeem)</span>
                        <div className="stage-bar stage-3" style={{ width: `${analyticsData.conversion.conversionRates.validateToRedeem || 100}%` }}>
                          {analyticsData.conversion.funnel.redeems} ({analyticsData.conversion.conversionRates.validateToRedeem}%)
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top Vouchers Table */}
                <div className="admin-vouchers__table-wrap" style={{ marginTop: '24px' }}>
                  <h3 style={{ padding: '16px', margin: 0, borderBottom: '1px solid rgba(216, 203, 184, 0.1)', fontFamily: 'var(--font-display)', fontWeight: 300, color: 'var(--color-aged-parchment)' }}>
                    TOP VOUCHER HIỆU QUẢ CAO NHẤT
                  </h3>
                  <table className="admin-vouchers__table">
                    <thead>
                      <tr>
                        <th>Tên Voucher</th>
                        <th>Mã Code</th>
                        <th>Lượt sử dụng</th>
                        <th>Tổng số tiền đã giảm</th>
                        <th>Doanh thu kéo về</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsData.topVouchers.map((item, index) => (
                        <tr key={index}>
                          <td>{item.name}</td>
                          <td className="admin-code-td">{item.code}</td>
                          <td>{item.usageCount} lượt</td>
                          <td className="text-amber">-{formatMoney(item.totalDiscount)}</td>
                          <td>{formatMoney(item.revenueGenerated)}</td>
                        </tr>
                      ))}
                      {analyticsData.topVouchers.length === 0 && (
                        <tr>
                          <td colSpan="5" className="text-center" style={{ padding: '24px', color: 'var(--color-faded-stone)' }}>Chưa có voucher nào phát sinh redemptions.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="admin-vouchers__empty">Không thể kết xuất dữ liệu báo cáo lúc này.</div>
            )}
          </div>
        )}

        {/* TAB 4: Fraud & Security */}
        {activeTab === 'fraud' && (
          <div className="tab-pane">
            <div className="tab-pane-header">
              <h2>Phát Hiện Gian Lận & Bảo Mật Voucher</h2>
            </div>

            {loadingFraud ? (
              <div className="admin-vouchers__loading">Đang phân tích các mẫu hành vi bất thường...</div>
            ) : fraudData ? (
              <div className="fraud-flex-row">
                
                {/* Suspicious IPs */}
                <div className="fraud-card">
                  <div className="fraud-card-header">
                    <ShieldAlert size={18} className="text-red-btn" />
                    <h3>IP NHẬP NHIỀU MÃ BẤT THƯỜNG (24H QUA)</h3>
                  </div>
                  <p className="fraud-card-desc">Cảnh báo các địa chỉ IP liên tục thử nghiệm/áp dụng nhiều mã voucher khác nhau (lớn hơn 3 mã) nhằm spam hoặc dò quét code.</p>
                  
                  <div className="admin-vouchers__table-wrap">
                    <table className="admin-vouchers__table">
                      <thead>
                        <tr>
                          <th>Địa chỉ IP</th>
                          <th>Số mã khác nhau thử nghiệm</th>
                          <th>Tổng số lượt nhấn</th>
                          <th>Mức độ cảnh báo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fraudData.suspiciousIPs.map((ip, idx) => (
                          <tr key={idx}>
                            <td className="admin-code-td">{ip.ipAddress}</td>
                            <td>{ip.distinctVoucherCount} mã</td>
                            <td>{ip.attempts} lần</td>
                            <td>
                              <span className={`alert-indicator ${ip.distinctVoucherCount > 5 ? 'high' : 'medium'}`}>
                                {ip.distinctVoucherCount > 5 ? 'Nguy cấp' : 'Cảnh giác'}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {fraudData.suspiciousIPs.length === 0 && (
                          <tr>
                            <td colSpan="4" className="text-center" style={{ padding: '20px', color: 'var(--color-faded-stone)' }}>
                              Chưa phát hiện hành vi spam IP bất thường.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Suspicious Customers */}
                <div className="fraud-card">
                  <div className="fraud-card-header">
                    <Activity size={18} className="text-red-btn" />
                    <h3>KHÁCH HÀNG SPAM THỬ MÃ THẤT BẠI LÊN TIẾP</h3>
                  </div>
                  <p className="fraud-card-desc">Danh sách tài khoản khách hàng thực hiện xác thực mã giảm giá bị thất bại trên 5 lần liên tiếp trong 24 giờ qua (hành vi đoán mã).</p>

                  <div className="admin-vouchers__table-wrap">
                    <table className="admin-vouchers__table">
                      <thead>
                        <tr>
                          <th>Khách hàng</th>
                          <th>Email</th>
                          <th>Lượt thất bại</th>
                          <th>Các lý do lỗi gặp phải</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fraudData.suspiciousCustomers.map((c, idx) => (
                          <tr key={idx}>
                            <td><strong>{c.customerName || 'N/A'}</strong></td>
                            <td className="log-customer-meta">{c.customerEmail || 'N/A'}</td>
                            <td className="text-red-btn font-bold">{c.failures} lần</td>
                            <td style={{ fontSize: '11px', color: 'var(--color-faded-stone)' }}>
                              {c.reasons?.join(', ') || 'Không rõ'}
                            </td>
                          </tr>
                        ))}
                        {fraudData.suspiciousCustomers.length === 0 && (
                          <tr>
                            <td colSpan="4" className="text-center" style={{ padding: '20px', color: 'var(--color-faded-stone)' }}>
                              Chưa phát hiện tài khoản dò quét mã nào.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="admin-vouchers__empty">Không thể lấy dữ liệu phân tích bảo mật lúc này.</div>
            )}
          </div>
        )}

        {/* MODAL 1: Create/Edit Platform/Global Voucher */}
        <VoucherFormModal
          isOpen={isVoucherModalOpen}
          onClose={() => setIsVoucherModalOpen(false)}
          onSubmit={handleCreateOrUpdateVoucher}
          voucher={editingVoucher}
        />

        {/* MODAL 2: Create/Edit Campaign */}
        {isCampaignModalOpen && (
          <div className="voucher-modal-overlay" onClick={() => setIsCampaignModalOpen(false)}>
            <div className="voucher-modal-container" onClick={(e) => e.stopPropagation()}>
              <div className="voucher-modal-header">
                <h3>{editingCampaign ? 'Chỉnh Sửa Chiến Dịch' : 'Tạo Chiến Dịch Voucher Mới'}</h3>
                <button className="voucher-modal-close-btn" onClick={() => setIsCampaignModalOpen(false)}>&times;</button>
              </div>
              <form onSubmit={handleCampaignSubmit} className="voucher-modal-form">
                <div className="form-group">
                  <label className="form-label">Tên chiến dịch *</label>
                  <input 
                    type="text" 
                    className="form-input"
                    value={campaignForm.name}
                    onChange={(e) => setCampaignForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="Ví dụ: Lễ hội ẩm thực hè 2026"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Mô tả chiến dịch</label>
                  <textarea 
                    className="form-textarea"
                    value={campaignForm.description}
                    onChange={(e) => setCampaignForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="Mô tả mục tiêu và cách thức phân phối voucher..."
                  />
                </div>
                <div className="form-row">
                  <div className="form-group col-6">
                    <label className="form-label">Loại chiến dịch</label>
                    <select 
                      className="form-input"
                      value={campaignForm.type}
                      onChange={(e) => setCampaignForm(p => ({ ...p, type: e.target.value }))}
                    >
                      <option value="flash_sale">Flash Sale</option>
                      <option value="seasonal">Theo Mùa (Seasonal)</option>
                      <option value="event">Sự Kiện Đặc Biệt</option>
                      <option value="custom">Tùy Chọn (Custom)</option>
                    </select>
                  </div>
                  <div className="form-group col-6">
                    <label className="form-label">Nhóm khách hàng mục tiêu</label>
                    <select 
                      className="form-input"
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
                <div className="form-row">
                  <div className="form-group col-6">
                    <label className="form-label">Ngày bắt đầu *</label>
                    <input 
                      type="datetime-local" 
                      className="form-input"
                      value={campaignForm.startDate}
                      onChange={(e) => setCampaignForm(p => ({ ...p, startDate: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group col-6">
                    <label className="form-label">Ngày kết thúc *</label>
                    <input 
                      type="datetime-local" 
                      className="form-input"
                      value={campaignForm.endDate}
                      onChange={(e) => setCampaignForm(p => ({ ...p, endDate: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                  <input 
                    type="checkbox" 
                    id="autoDistribute"
                    checked={campaignForm.autoDistribute}
                    onChange={(e) => setCampaignForm(p => ({ ...p, autoDistribute: e.target.checked }))}
                  />
                  <label htmlFor="autoDistribute" style={{ userSelect: 'none', fontSize: '13px', color: 'var(--color-aged-parchment)', cursor: 'pointer' }}>
                    Tự động phân phối vào ví khi khách thuộc phân khúc đăng nhập/đặt bàn
                  </label>
                </div>
                <div className="voucher-modal-actions">
                  <button type="button" className="voucher-btn-secondary" onClick={() => setIsCampaignModalOpen(false)}>
                    Hủy bỏ
                  </button>
                  <button type="submit" className="voucher-btn-primary">
                    {editingCampaign ? 'Cập nhật' : 'Tạo mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: Reset Usage */}
        {resetModalVoucher && (
          <div className="voucher-modal-overlay" onClick={() => setResetModalVoucher(null)}>
            <div className="voucher-modal-container reset-modal" onClick={(e) => e.stopPropagation()}>
              <div className="voucher-modal-header">
                <h3>Cập Nhật Số Lượt Sử Dụng</h3>
                <button className="voucher-modal-close-btn" onClick={() => setResetModalVoucher(null)}>&times;</button>
              </div>
              <form onSubmit={handleResetUsageSubmit} className="voucher-modal-form">
                <p style={{ fontSize: '13px', color: 'var(--color-faded-stone)', margin: '0 0 16px 0' }}>
                  Cập nhật lượt sử dụng của voucher <strong>{resetModalVoucher.code}</strong>. 
                  Điều này giúp tăng hoặc khôi phục lượt dùng tối đa của mã trên toàn sàn.
                </p>
                <div className="form-group">
                  <label className="form-label">Lượt sử dụng hiện tại</label>
                  <input 
                    type="text" 
                    className="form-input"
                    value={resetModalVoucher.currentUsage}
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Lượt sử dụng mới đặt lại thành *</label>
                  <input 
                    type="number" 
                    className="form-input"
                    value={resetCount}
                    onChange={(e) => setResetCount(Number(e.target.value))}
                    min="0"
                    required
                  />
                </div>
                <div className="voucher-modal-actions">
                  <button type="button" className="voucher-btn-secondary" onClick={() => setResetModalVoucher(null)}>
                    Quay lại
                  </button>
                  <button type="submit" className="voucher-btn-primary">
                    Xác nhận
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 4: Issue Compensation */}
        {isCompModalOpen && (
          <div className="voucher-modal-overlay" onClick={() => setIsCompModalOpen(false)}>
            <div className="voucher-modal-container" onClick={(e) => e.stopPropagation()}>
              <div className="voucher-modal-header">
                <h3>Phát Hành Voucher Đền Bù Cho Khách Hàng</h3>
                <button className="voucher-modal-close-btn" onClick={() => setIsCompModalOpen(false)}>&times;</button>
              </div>
              <form onSubmit={handleCompSubmit} className="voucher-modal-form">
                <p style={{ fontSize: '13px', color: 'var(--color-faded-stone)', margin: '0 0 16px 0' }}>
                  Phát hành một mã giảm giá cá nhân hóa đặc biệt trực tiếp vào ví voucher của khách hàng nhằm đền bù lỗi hệ thống, sự cố nhà hàng, hoặc chăm sóc đặc biệt.
                </p>
                <div className="form-group">
                  <label className="form-label">Mã ID tài khoản khách hàng (Customer User ID) *</label>
                  <input 
                    type="text" 
                    className="form-input"
                    value={compForm.customerId}
                    onChange={(e) => setCompForm(p => ({ ...p, customerId: e.target.value }))}
                    placeholder="Nhập Mongoose ObjectId của tài khoản khách hàng"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Tên hiển thị voucher</label>
                  <input 
                    type="text" 
                    className="form-input"
                    value={compForm.name}
                    onChange={(e) => setCompForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="Ví dụ: Voucher đền bù đặt bàn ngày 16/06"
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group col-6">
                    <label className="form-label">Hình thức giảm</label>
                    <select 
                      className="form-input"
                      value={compForm.discountType}
                      onChange={(e) => setCompForm(p => ({ ...p, discountType: e.target.value }))}
                    >
                      <option value="percentage">Phần trăm (%)</option>
                      <option value="fixed_amount">Số tiền cố định (đ)</option>
                    </select>
                  </div>
                  <div className="form-group col-6">
                    <label className="form-label">Mức giảm giá *</label>
                    <input 
                      type="number" 
                      className="form-input"
                      value={compForm.discountValue}
                      onChange={(e) => setCompForm(p => ({ ...p, discountValue: e.target.value }))}
                      placeholder={compForm.discountType === 'percentage' ? 'Ví dụ: 20' : 'Ví dụ: 100000'}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group col-6">
                    <label className="form-label">Đơn tối thiểu áp dụng</label>
                    <input 
                      type="number" 
                      className="form-input"
                      value={compForm.minOrderAmount}
                      onChange={(e) => setCompForm(p => ({ ...p, minOrderAmount: e.target.value }))}
                    />
                  </div>
                  <div className="form-group col-6">
                    <label className="form-label">Số ngày hiệu lực kể từ khi phát</label>
                    <input 
                      type="number" 
                      className="form-input"
                      value={compForm.daysValid}
                      onChange={(e) => setCompForm(p => ({ ...p, daysValid: e.target.value }))}
                      min="1"
                    />
                  </div>
                </div>
                <div className="voucher-modal-actions">
                  <button type="button" className="voucher-btn-secondary" onClick={() => setIsCompModalOpen(false)}>
                    Hủy bỏ
                  </button>
                  <button type="submit" className="voucher-btn-primary">
                    Phát hành ngay
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
