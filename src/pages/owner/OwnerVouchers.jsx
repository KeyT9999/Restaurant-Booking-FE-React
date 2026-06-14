import { useEffect, useState } from 'react';
import { Plus, ToggleLeft, ToggleRight, Trash2, BarChart2, Ticket } from 'lucide-react';
import OwnerLayout from '../../components/owner/OwnerLayout';
import { useRestaurantContext } from '../../context/useRestaurantContext';
import { getOwnerVouchers, createVoucher, updateVoucher, deleteVoucher, getVoucherStats } from '../../api/voucherApi';
import VoucherFormModal from '../../components/voucher/VoucherFormModal';
import VoucherStatusBadge from '../../components/voucher/VoucherStatusBadge';
import './OwnerVouchers.css';

const formatMoney = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v || 0);
const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : 'Không giới hạn';

export default function OwnerVouchers() {
  const { selectedRestaurantId } = useRestaurantContext();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  
  // Stats drawer/modal states
  const [statsVoucher, setStatsVoucher] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    if (!selectedRestaurantId) return;
    loadVouchers();
  }, [selectedRestaurantId]);

  const loadVouchers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getOwnerVouchers();
      if (res.data?.success) {
        setVouchers(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Không thể tải danh sách voucher');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (data) => {
    try {
      if (editingVoucher) {
        await updateVoucher(editingVoucher._id, data);
      } else {
        await createVoucher(data);
      }
      setIsModalOpen(false);
      loadVouchers();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi lưu thông tin voucher');
    }
  };

  const handleToggleStatus = async (voucher) => {
    const nextStatus = voucher.status === 'active' ? 'paused' : 'active';
    try {
      await updateVoucher(voucher._id, { status: nextStatus });
      loadVouchers();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi thay đổi trạng thái');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn vô hiệu hóa mã giảm giá này? Người dùng sẽ không thể lưu hoặc áp dụng mã này nữa.')) return;
    try {
      await deleteVoucher(id);
      loadVouchers();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi vô hiệu hóa voucher');
    }
  };

  const handleShowStats = async (voucher) => {
    setStatsVoucher(voucher);
    setLoadingStats(true);
    try {
      const res = await getVoucherStats(voucher._id);
      if (res.data?.success) {
        setStatsData(res.data.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi lấy báo cáo thống kê');
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
          <h2>Chọn nhà hàng để xem và quản lý Voucher</h2>
        </div>
      </OwnerLayout>
    );
  }

  return (
    <OwnerLayout title="Mã giảm giá" subtitle="Thiết lập các chương trình khuyến mại, mã giảm giá cọc đặt bàn cho khách hàng">
      <div className="owner-vouchers-container">
        
        {/* Thống kê nhanh */}
        <section className="vouchers-kpi-grid">
          <div className="kpi-card">
            <Ticket size={24} className="kpi-icon" />
            <div className="kpi-info">
              <span className="kpi-label">Tổng số Voucher</span>
              <h3 className="kpi-value">{vouchers.length}</h3>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon-active" />
            <div className="kpi-info">
              <span className="kpi-label">Voucher Đang hoạt động</span>
              <h3 className="kpi-value">{activeCount}</h3>
            </div>
          </div>
        </section>

        {/* Nút hành động */}
        <div className="vouchers-actions-bar">
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

        {/* Bảng danh sách */}
        {loading ? (
          <div className="vouchers-loading">Đang tải danh sách voucher...</div>
        ) : error ? (
          <div className="vouchers-error">{error}</div>
        ) : vouchers.length === 0 ? (
          <div className="vouchers-empty">Bạn chưa tạo chương trình khuyến mại nào. Hãy tạo mã đầu tiên!</div>
        ) : (
          <div className="vouchers-table-wrap">
            <table className="vouchers-table">
              <thead>
                <tr>
                  <th>Mã Code</th>
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
                    <td className="voucher-code-td">{v.code}</td>
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
                      {v.perCustomerLimit} lần/khách
                      {v.globalUsageLimit && ` (Hệ thống: ${v.globalUsageLimit})`}
                    </td>
                    <td>
                      <VoucherStatusBadge status={v.status} />
                    </td>
                    <td>
                      <div className="vouchers-action-buttons">
                        <button 
                          className="action-btn btn-stats" 
                          title="Báo cáo hiệu quả"
                          onClick={() => handleShowStats(v)}
                        >
                          <BarChart2 size={16} />
                        </button>
                        
                        {v.status !== 'disabled' && (
                          <>
                            <button 
                              className="action-btn btn-toggle" 
                              title={v.status === 'active' ? 'Tạm dừng' : 'Kích hoạt'}
                              onClick={() => handleToggleStatus(v)}
                            >
                              {v.status === 'active' ? (
                                <ToggleRight size={20} className="status-active-icon" />
                              ) : (
                                <ToggleLeft size={20} />
                              )}
                            </button>
                            
                            <button 
                              className="action-btn btn-delete" 
                              title="Xóa"
                              onClick={() => handleDelete(v._id)}
                            >
                              <Trash2 size={16} />
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

        {/* Modal Form Tạo/Sửa */}
        <VoucherFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateOrUpdate}
          voucher={editingVoucher}
        />

        {/* Drawer Báo cáo Thống kê */}
        {statsVoucher && (
          <div className="stats-drawer-overlay" onClick={() => setStatsVoucher(null)}>
            <div className="stats-drawer" onClick={(e) => e.stopPropagation()}>
              <div className="stats-drawer-header">
                <h4>Hiệu quả Voucher: {statsVoucher.code}</h4>
                <button className="stats-drawer-close" onClick={() => setStatsVoucher(null)}>&times;</button>
              </div>
              <div className="stats-drawer-body">
                {loadingStats ? (
                  <div className="stats-loading">Đang tính toán số liệu...</div>
                ) : statsData ? (
                  <div className="stats-content">
                    <div className="stats-kpi-grid">
                      <div className="stats-kpi">
                        <span className="stats-kpi-lbl">Số lượt đã lưu</span>
                        <h4 className="stats-kpi-val">{statsData.savedCount}</h4>
                      </div>
                      <div className="stats-kpi">
                        <span className="stats-kpi-lbl">Lượt đã redeem</span>
                        <h4 className="stats-kpi-val">{statsData.usedCount}</h4>
                      </div>
                      <div className="stats-kpi">
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
      </div>
    </OwnerLayout>
  );
}
