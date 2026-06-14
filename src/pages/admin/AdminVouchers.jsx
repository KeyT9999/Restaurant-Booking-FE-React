import { useEffect, useState } from 'react';
import { Ticket, Plus, ToggleLeft, ToggleRight, Trash2, BarChart2 } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { getAdminVouchers, createVoucher, updateVoucher, deleteVoucher, getVoucherStats } from '../../api/voucherApi';
import VoucherFormModal from '../../components/voucher/VoucherFormModal';
import VoucherStatusBadge from '../../components/voucher/VoucherStatusBadge';
import './AdminVouchers.css';

const formatMoney = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v || 0);
const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : 'Không giới hạn';

export default function AdminVouchers() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  
  // Stats states
  const [statsVoucher, setStatsVoucher] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    loadVouchers();
  }, []);

  const loadVouchers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminVouchers();
      if (res.data?.success) {
        setVouchers(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Không thể tải danh sách voucher toàn hệ thống');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (data) => {
    try {
      if (editingVoucher) {
        await updateVoucher(editingVoucher._id, data);
      } else {
        await createVoucher({ ...data, restaurantId: null });
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
    if (!window.confirm('Bạn có chắc muốn vô hiệu hóa voucher này? Khách hàng sẽ không thể lưu hay sử dụng được nữa.')) return;
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

  const globalVouchers = vouchers.filter(v => !v.restaurantId);
  const restaurantVouchers = vouchers.filter(v => v.restaurantId);

  return (
    <AdminLayout>
      <div className="admin-vouchers">
        <div className="admin-vouchers__header">
          <h1 className="admin-vouchers__title">Quản lý Voucher Khuyến Mại</h1>
          <button 
            className="admin-vouchers__create-btn"
            onClick={() => {
              setEditingVoucher(null);
              setIsModalOpen(true);
            }}
          >
            <Plus size={16} /> Tạo Voucher Global
          </button>
        </div>

        {/* Thống kê nhanh */}
        <div className="admin-vouchers__kpi-grid">
          <article className="kpi-card-admin">
            <span className="kpi-card-admin__lbl">VOUCHER TOÀN SÀN</span>
            <strong className="kpi-card-admin__val">{vouchers.length}</strong>
            <small>{globalVouchers.length} Global | {restaurantVouchers.length} Nhà hàng</small>
          </article>
          <article className="kpi-card-admin">
            <span className="kpi-card-admin__lbl">ĐANG HOẠT ĐỘNG</span>
            <strong className="kpi-card-admin__val text-green">
              {vouchers.filter(v => v.status === 'active').length}
            </strong>
          </article>
        </div>

        {loading && <div className="admin-vouchers__loading">Đang tải danh sách voucher...</div>}
        {error && <div className="admin-vouchers__error">{error}</div>}

        {!loading && vouchers.length === 0 && (
          <div className="admin-vouchers__empty">Chưa có voucher nào trên hệ thống.</div>
        )}

        {vouchers.length > 0 && (
          <div className="admin-vouchers__table-wrap">
            <table className="admin-vouchers__table">
              <thead>
                <tr>
                  <th>Mã Code</th>
                  <th>Phạm vi</th>
                  <th>Loại giảm</th>
                  <th>Giá trị giảm</th>
                  <th>Đơn tối thiểu</th>
                  <th>Hạn dùng</th>
                  <th>Trạng thái</th>
                  <th className="text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {vouchers.map(v => (
                  <tr key={v._id}>
                    <td className="admin-code-td">{v.code}</td>
                    <td>
                      {v.restaurantId ? (
                        <span className="scope-badge scope-restaurant">
                          NH: {v.restaurantId?.name || '—'}
                        </span>
                      ) : (
                        <span className="scope-badge scope-global">Global (Toàn sàn)</span>
                      )}
                    </td>
                    <td>{v.discountType === 'percentage' ? 'Phần trăm (%)' : 'Số tiền (đ)'}</td>
                    <td className="admin-val-td">
                      {v.discountType === 'percentage' ? `${v.discountValue}%` : formatMoney(v.discountValue)}
                    </td>
                    <td>{formatMoney(v.minOrderAmount)}</td>
                    <td className="admin-date-td">{formatDate(v.endDate)}</td>
                    <td><VoucherStatusBadge status={v.status} /></td>
                    <td>
                      <div className="admin-vouchers__actions">
                        <button 
                          className="admin-action-btn"
                          title="Báo cáo hiệu quả"
                          onClick={() => handleShowStats(v)}
                        >
                          <BarChart2 size={14} />
                        </button>
                        
                        {v.status !== 'disabled' && (
                          <>
                            <button 
                              className="admin-action-btn"
                              title={v.status === 'active' ? 'Tạm dừng' : 'Kích hoạt'}
                              onClick={() => handleToggleStatus(v)}
                            >
                              {v.status === 'active' ? (
                                <ToggleRight size={18} className="text-green" />
                              ) : (
                                <ToggleLeft size={18} />
                              )}
                            </button>
                            <button 
                              className="admin-action-btn text-red-btn"
                              title="Vô hiệu hóa"
                              onClick={() => handleDelete(v._id)}
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

        {/* Modal tạo voucher Global */}
        <VoucherFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateOrUpdate}
          voucher={editingVoucher}
        />

        {/* Drawer Báo cáo thống kê */}
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
    </AdminLayout>
  );
}
