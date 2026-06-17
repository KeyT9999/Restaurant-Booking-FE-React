import { useEffect, useState } from 'react';
import { Ticket, Plus, ToggleLeft, ToggleRight, Trash2, BarChart2 } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { getAdminVouchers, createVoucher, updateVoucher, deleteVoucher, getVoucherStats } from '../../api/voucherApi';
import VoucherFormModal from '../../components/voucher/VoucherFormModal';
import VoucherStatusBadge from '../../components/voucher/VoucherStatusBadge';

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

  useEffect(() => {
    loadVouchers();
  }, []);

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
    <AdminLayout title="Quản lý Voucher Khuyến Mại" subtitle="Quản trị mã giảm giá toàn sàn và theo dõi mã của các nhà hàng">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center mb-6">
        <h1 className="text-xl font-extrabold text-zinc-100 uppercase tracking-wide flex items-center gap-2">
          <Ticket className="text-amber-500" /> Voucher Khuyến Mại
        </h1>
        <button 
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-black font-semibold text-sm rounded-lg transition duration-150 shadow-lg shadow-amber-500/10" 
          onClick={() => {
            setEditingVoucher(null);
            setIsModalOpen(true);
          }}
        >
          <Plus size={16} /> Tạo Voucher Global
        </button>
      </div>

      {/* Thống kê nhanh */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-[#1A1D24] border border-zinc-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <span className="text-xs text-zinc-550 uppercase tracking-wide font-semibold">Voucher Toàn Sàn</span>
          <strong className="text-3xl font-extrabold text-zinc-150 mt-1">{vouchers.length}</strong>
          <span className="text-xs text-zinc-500 mt-2">{globalVouchers.length} Global | {restaurantVouchers.length} Nhà hàng</span>
        </div>
        <div className="bg-[#1A1D24] border border-zinc-800 rounded-xl p-5 shadow-lg flex flex-col justify-between border-l-4 border-l-emerald-500">
          <span className="text-xs text-zinc-550 uppercase tracking-wide font-semibold">Đang hoạt động</span>
          <strong className="text-3xl font-extrabold text-emerald-400 mt-1">
            {vouchers.filter(v => v.status === 'active').length}
          </strong>
          <span className="text-xs text-zinc-500 mt-2">Đang phân phối tới khách hàng</span>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-400 space-y-3 bg-[#1A1D24] border border-zinc-800 rounded-xl mb-6">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Đang tải danh sách voucher...</span>
        </div>
      )}
      
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-450 p-4 rounded-xl text-sm mb-6">
          {error}
        </div>
      )}

      {!loading && vouchers.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-400 bg-[#1A1D24] border border-zinc-800 rounded-xl text-sm">
          Chưa có voucher nào trên hệ thống.
        </div>
      )}

      {vouchers.length > 0 && (
        <div className="bg-[#1A1D24] border border-zinc-800 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-zinc-350 text-sm">
              <thead>
                <tr className="bg-zinc-900/50 border-b border-zinc-800 text-zinc-455 font-medium">
                  <th className="p-4">Mã Code</th>
                  <th className="p-4">Phạm vi</th>
                  <th className="p-4">Loại giảm</th>
                  <th className="p-4">Giá trị giảm</th>
                  <th className="p-4">Đơn tối thiểu</th>
                  <th className="p-4">Hạn dùng</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {vouchers.map(v => (
                  <tr key={v._id} className="hover:bg-zinc-850/30 transition-colors">
                    <td className="p-4 font-bold text-zinc-200 font-mono tracking-wider">{v.code}</td>
                    <td className="p-4">
                      {v.restaurantId ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 max-w-[180px] truncate">
                          NH: {v.restaurantId?.name || '—'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">Global (Toàn sàn)</span>
                      )}
                    </td>
                    <td className="p-4 text-xs text-zinc-300">
                      {v.discountType === 'percentage' ? 'Phần trăm (%)' : 'Số tiền (đ)'}
                    </td>
                    <td className="p-4 text-zinc-200 font-semibold font-mono">
                      {v.discountType === 'percentage' ? `${v.discountValue}%` : formatMoney(v.discountValue)}
                    </td>
                    <td className="p-4 font-mono text-zinc-400">{formatMoney(v.minOrderAmount)}</td>
                    <td className="p-4 text-xs text-zinc-400 font-mono">{formatDate(v.endDate)}</td>
                    <td className="p-4">
                      <VoucherStatusBadge status={v.status} />
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-amber-500 rounded-lg transition"
                          title="Báo cáo hiệu quả"
                          onClick={() => handleShowStats(v)}
                        >
                          <BarChart2 size={14} />
                        </button>
                        
                        {v.status !== 'disabled' && (
                          <>
                            <button 
                              className="p-1.5 hover:bg-zinc-800 rounded-lg transition text-zinc-400"
                              title={v.status === 'active' ? 'Tạm dừng' : 'Kích hoạt'}
                              onClick={() => handleToggleStatus(v)}
                            >
                              {v.status === 'active' ? (
                                <ToggleRight size={18} className="text-emerald-400" />
                              ) : (
                                <ToggleLeft size={18} className="text-zinc-550" />
                              )}
                            </button>
                            <button 
                              className="p-1.5 hover:bg-zinc-805 text-zinc-400 hover:text-rose-500 rounded-lg transition"
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
                className="text-zinc-500 hover:text-zinc-200 text-2xl font-semibold leading-none" 
                onClick={() => setStatsVoucher(null)}
              >
                &times;
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 scrollbar-none pr-1">
              {loadingStats ? (
                <div className="flex flex-col items-center justify-center py-20 text-zinc-450 space-y-2">
                  <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
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
                    {statsData.redemptions?.length === 0 ? (
                      <div className="text-xs text-zinc-500 italic py-4">Chưa có lượt sử dụng nào cho mã này.</div>
                    ) : (
                      <div className="divide-y divide-zinc-805">
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
                <div className="text-xs text-rose-400 text-center py-10">Không thể tải báo cáo.</div>
              )}
            </div>

            <div className="pt-4 border-t border-zinc-800 mt-6 flex justify-end">
              <button 
                className="px-4 py-2 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-semibold text-xs rounded-lg transition"
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
