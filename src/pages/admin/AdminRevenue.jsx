import { useEffect, useState } from 'react';
import { TrendingUp, RefreshCcw, Users, Wallet, Check, X, CreditCard, Clock, MessageSquare, AlertCircle, HelpCircle } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminGetRevenue, adminGetPayments } from '../../api/paymentApi';
import { adminGetWithdrawals, adminApproveWithdrawal, adminRejectWithdrawal, adminCompleteWithdrawal } from '../../api/withdrawalApi';

const formatMoney = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v || 0);
const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

export default function AdminRevenue() {
  const [revenue, setRevenue] = useState(null);
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Withdrawal requests States
  const [withdrawals, setWithdrawals] = useState([]);
  const [withdrawalLoading, setWithdrawalLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('pending'); // default show pending to process
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [modalAction, setModalAction] = useState(''); // 'approve' | 'reject' | 'complete'
  const [adminNote, setAdminNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [revRes, payRes] = await Promise.all([
        adminGetRevenue(),
        adminGetPayments({ limit: 8, status: 'paid' }),
      ]);
      setRevenue(revRes.data);
      setRecentPayments(payRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadWithdrawals = async () => {
    setWithdrawalLoading(true);
    try {
      const params = {};
      if (statusFilter) {
        params.status = statusFilter;
      }
      const res = await adminGetWithdrawals(params);
      setWithdrawals(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setWithdrawalLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadWithdrawals();
  }, [statusFilter]);

  const handleOpenActionModal = (withdrawal, action) => {
    setSelectedWithdrawal(withdrawal);
    setModalAction(action);
    setAdminNote(action === 'approve' ? 'Đã duyệt yêu cầu rút tiền' : action === 'complete' ? 'Đã chuyển tiền hoàn tất' : '');
    setActionError(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedWithdrawal(null);
    setModalAction('');
    setAdminNote('');
    setActionError(null);
  };

  const handleConfirmAction = async () => {
    if (!selectedWithdrawal) return;
    
    if (modalAction === 'reject' && !adminNote.trim()) {
      setActionError('Lý do từ chối là bắt buộc.');
      return;
    }

    setActionLoading(true);
    setActionError(null);
    
    try {
      if (modalAction === 'approve') {
        await adminApproveWithdrawal(selectedWithdrawal._id, { adminNote });
      } else if (modalAction === 'reject') {
        await adminRejectWithdrawal(selectedWithdrawal._id, { adminNote });
      } else if (modalAction === 'complete') {
        await adminCompleteWithdrawal(selectedWithdrawal._id, { adminNote });
      }
      
      handleCloseModal();
      loadWithdrawals();
      loadData(); // reload stats just in case
    } catch (err) {
      setActionError(err.message || 'Thao tác thất bại.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminLayout title="Doanh thu" subtitle="Quản lý dòng tiền, doanh thu & yêu cầu rút tiền toàn sàn BookEat">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center mb-6">
        <h1 className="text-xl font-extrabold text-zinc-100 uppercase tracking-wide flex items-center gap-2">
          <TrendingUp className="text-amber-500" /> Báo cáo doanh thu & Rút tiền
        </h1>
        <button 
          className="inline-flex items-center gap-1.5 px-4 py-2 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold rounded-lg transition disabled:opacity-50 cursor-pointer" 
          onClick={() => { loadData(); loadWithdrawals(); }} 
          disabled={loading || withdrawalLoading}
        >
          <RefreshCcw size={14} className={loading || withdrawalLoading ? 'animate-spin' : ''} /> Làm mới
        </button>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-400 space-y-3 bg-[#1A1D24] border border-zinc-800 rounded-xl mb-6">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Đang tải dữ liệu...</span>
        </div>
      )}

      {revenue && !loading && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-in fade-in duration-200">
            <div className="bg-[#1A1D24] border border-zinc-800 rounded-xl p-5 shadow-lg flex flex-col justify-between border-l-4 border-l-amber-500">
              <span className="text-xs text-zinc-400 uppercase tracking-wide font-semibold">Tổng doanh thu</span>
              <strong className="text-2xl font-black text-amber-500 mt-1">{formatMoney(revenue.totalRevenue)}</strong>
              <span className="text-[10px] text-zinc-500 mt-2 font-mono">Tính cả đăng ký & cọc bàn</span>
            </div>
            <div className="bg-[#1A1D24] border border-zinc-800 rounded-xl p-5 shadow-lg flex flex-col justify-between border-l-4 border-l-blue-500">
              <span className="text-xs text-zinc-400 uppercase tracking-wide font-semibold">Doanh thu gói</span>
              <strong className="text-2xl font-black text-blue-400 mt-1">{formatMoney(revenue.subscriptionRevenue?.total)}</strong>
              <span className="text-[10px] text-zinc-500 mt-2 font-mono">{revenue.subscriptionRevenue?.count || 0} giao dịch</span>
            </div>
            <div className="bg-[#1A1D24] border border-zinc-800 rounded-xl p-5 shadow-lg flex flex-col justify-between border-l-4 border-l-emerald-500">
              <span className="text-xs text-zinc-400 uppercase tracking-wide font-semibold">Doanh thu đặt cọc</span>
              <strong className="text-2xl font-black text-emerald-400 mt-1">{formatMoney(revenue.bookingRevenue?.total)}</strong>
              <span className="text-[10px] text-zinc-500 mt-2 font-mono">{revenue.bookingRevenue?.count || 0} giao dịch</span>
            </div>
            <div className="bg-[#1A1D24] border border-zinc-800 rounded-xl p-5 shadow-lg flex flex-col justify-between border-l-4 border-l-rose-500">
              <span className="text-xs text-zinc-400 uppercase tracking-wide font-semibold">Đã hoàn tiền</span>
              <strong className="text-2xl font-black text-rose-400 mt-1">{formatMoney(revenue.refundTotal?.total)}</strong>
              <span className="text-[10px] text-zinc-500 mt-2 font-mono">{revenue.refundTotal?.count || 0} giao dịch</span>
            </div>
          </div>

          {/* Net Revenue Summary */}
          <div className="bg-[#1A1D24] border border-zinc-800 rounded-xl p-5 shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-400 font-medium">Doanh thu thực nhận (Net Revenue):</span>
              <strong className="text-xl font-black text-emerald-450">{formatMoney(revenue.netRevenue)}</strong>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#13161C] border border-zinc-800 rounded-lg text-xs font-semibold text-zinc-300">
              <Users size={14} className="text-amber-500" /> {revenue.activeSubscriptions || 0} gói đang hoạt động
            </span>
          </div>

          {/* Daily Revenue Chart */}
          {revenue.dailyRevenue && revenue.dailyRevenue.length > 0 && (
            <div className="bg-[#1A1D24] border border-zinc-800 rounded-xl p-5 shadow-lg mb-6 animate-in fade-in duration-200">
              <h3 className="text-sm font-bold text-zinc-200 mb-6 pb-2 border-b border-zinc-800 uppercase tracking-wide">Doanh thu 30 ngày gần đây</h3>
              <div className="flex items-end justify-between h-48 pt-4 gap-1.5 overflow-x-auto scrollbar-none">
                {revenue.dailyRevenue.map((day) => {
                  const maxVal = Math.max(...revenue.dailyRevenue.map(d => d.total));
                  const height = maxVal > 0 ? (day.total / maxVal) * 100 : 0;
                  return (
                    <div key={day._id} className="flex flex-col items-center flex-1 min-w-[32px] group" title={`${day._id}: ${formatMoney(day.total)}`}>
                      <div className="w-full relative flex flex-col justify-end h-32">
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-200 px-2 py-0.5 rounded whitespace-nowrap shadow-md z-10">
                          {formatMoney(day.total)}
                        </div>
                        <div 
                          className="w-full bg-amber-500/80 hover:bg-amber-500 rounded-t-sm transition-all duration-300" 
                          style={{ height: `${Math.max(height, 4)}%` }} 
                        />
                      </div>
                      <span className="text-[9px] text-zinc-500 mt-2 font-mono">{day._id.slice(5)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TWO MAIN COLUMNS: Left (Recent Payments), Right (Withdrawals Requests) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Recent Payments (5/12 width) */}
            <div className="lg:col-span-5 bg-[#1A1D24] border border-zinc-800 rounded-xl p-5 shadow-lg flex flex-col gap-4">
              <h3 className="text-sm font-bold text-zinc-200 pb-2 border-b border-zinc-800 uppercase tracking-wide flex items-center gap-1.5">
                <CreditCard size={16} className="text-amber-500" /> Giao dịch gần đây
              </h3>
              {recentPayments.length === 0 ? (
                <p className="text-xs text-zinc-500 italic py-8 text-center">Chưa có giao dịch nào.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-zinc-300 text-xs">
                    <thead>
                      <tr className="bg-zinc-900/50 border-b border-zinc-800 text-zinc-400 font-medium">
                        <th className="p-3">Ngày</th>
                        <th className="p-3">Loại</th>
                        <th className="p-3">Số tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {recentPayments.map((p) => (
                        <tr key={p._id} className="hover:bg-zinc-800/30 transition-colors">
                          <td className="p-3 text-zinc-400 font-mono text-[10px]">{new Date(p.paidAt || p.createdAt).toLocaleDateString('vi-VN')}</td>
                          <td className="p-3">
                            <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                              p.targetType === 'subscription' 
                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            }`}>
                              {p.targetType === 'subscription' ? 'Gói' : 'Cọc'}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-zinc-200 font-mono">{formatMoney(p.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Right Column: Withdrawals Requests (7/12 width) */}
            <div className="lg:col-span-7 bg-[#1A1D24] border border-zinc-800 rounded-xl p-5 shadow-lg flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-800 pb-2">
                <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wide flex items-center gap-1.5">
                  <Wallet size={16} className="text-amber-500" /> Yêu cầu rút tiền
                </h3>

                {/* Filter statuses */}
                <div className="flex bg-zinc-900/60 p-1 border border-zinc-800 rounded-lg gap-1">
                  {['pending', 'approved', 'completed', 'rejected', ''].map((st) => {
                    const label = st === 'pending' ? 'Chờ duyệt' : 
                                  st === 'approved' ? 'Đã duyệt' : 
                                  st === 'completed' ? 'Hoàn tất' : 
                                  st === 'rejected' ? 'Từ chối' : 'Tất cả';
                    return (
                      <button
                        key={st}
                        onClick={() => setStatusFilter(st)}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded cursor-pointer transition ${
                          statusFilter === st
                            ? 'bg-amber-500 text-zinc-950 font-black'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {withdrawalLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-zinc-400 space-y-2">
                  <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs">Đang tải yêu cầu rút tiền...</span>
                </div>
              ) : withdrawals.length === 0 ? (
                <p className="text-xs text-zinc-550 italic py-12 text-center">Không có yêu cầu rút tiền nào phù hợp.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-zinc-300 text-xs">
                    <thead>
                      <tr className="bg-zinc-900/50 border-b border-zinc-800 text-zinc-400 font-medium">
                        <th className="p-3">Nhà hàng/Chủ sở hữu</th>
                        <th className="p-3 text-right">Số tiền</th>
                        <th className="p-3">Tài khoản nhận</th>
                        <th className="p-3 text-center">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {withdrawals.map((w) => (
                        <tr key={w._id} className="hover:bg-zinc-800/30 transition-colors">
                          <td className="p-3">
                            <div className="font-bold text-zinc-200">{w.restaurantId?.name || 'Nhà hàng ẩn'}</div>
                            <div className="text-[10px] text-zinc-400 mt-0.5">Chủ: {w.ownerId?.fullName || '—'}</div>
                            <div className="text-[9px] text-zinc-550 mt-1 font-mono">{formatDate(w.createdAt)}</div>
                          </td>
                          <td className="p-3 text-right font-bold text-zinc-200 font-mono">
                            {formatMoney(w.amount)}
                          </td>
                          <td className="p-3">
                            <div className="font-semibold text-zinc-200">{w.bankInfo?.bankName}</div>
                            <div className="text-[10px] text-zinc-400 font-mono mt-0.5">{w.bankInfo?.accountNumber}</div>
                            <div className="text-[10px] text-zinc-400 capitalize">{w.bankInfo?.accountHolder}</div>
                            {w.note && <div className="text-[10px] italic text-zinc-500 mt-1">Ghi chú: {w.note}</div>}
                          </td>
                          <td className="p-3 text-center">
                            {w.status === 'pending' && (
                              <div className="flex gap-1.5 justify-center">
                                <button
                                  onClick={() => handleOpenActionModal(w, 'approve')}
                                  className="p-1 px-2 text-[10px] font-bold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 cursor-pointer"
                                  title="Duyệt yêu cầu"
                                >
                                  Duyệt
                                </button>
                                <button
                                  onClick={() => handleOpenActionModal(w, 'reject')}
                                  className="p-1 px-2 text-[10px] font-bold rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 cursor-pointer"
                                  title="Từ chối yêu cầu"
                                >
                                  Từ chối
                                </button>
                              </div>
                            )}

                            {w.status === 'approved' && (
                              <div className="flex flex-col gap-1 items-center">
                                <button
                                  onClick={() => handleOpenActionModal(w, 'complete')}
                                  className="p-1 px-2 text-[10px] font-bold rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 cursor-pointer flex items-center gap-1"
                                >
                                  Hoàn tất
                                </button>
                                <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider mt-0.5">Đã duyệt</span>
                              </div>
                            )}

                            {w.status === 'completed' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                <Check size={10} /> Hoàn tất
                              </span>
                            )}

                            {w.status === 'rejected' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-500 border border-zinc-700">
                                <X size={10} /> Từ chối
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Action Modal Confirm */}
      {showModal && selectedWithdrawal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={handleCloseModal}>
          <div 
            className="w-full max-w-[440px] bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-5 shadow-2xl relative text-left" 
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-serif text-lg text-zinc-100 font-bold border-b border-zinc-800 pb-3 flex items-center gap-2">
              <Wallet className="text-amber-500" size={18} />
              <span>
                {modalAction === 'approve' ? 'Duyệt yêu cầu rút tiền' : 
                 modalAction === 'reject' ? 'Từ chối yêu cầu rút tiền' : 'Hoàn tất giao dịch rút tiền'}
              </span>
            </h3>

            {actionError && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive text-xs leading-relaxed">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{actionError}</span>
              </div>
            )}

            <div className="flex flex-col gap-3 text-xs bg-zinc-950 p-4 border border-zinc-800 rounded-xl">
              <div className="flex justify-between">
                <span className="text-zinc-500">Nhà hàng:</span>
                <span className="font-bold text-zinc-200">{selectedWithdrawal.restaurantId?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Số tiền rút:</span>
                <span className="font-black text-amber-500 text-sm">{formatMoney(selectedWithdrawal.amount)}</span>
              </div>
              <div className="flex flex-col gap-1 border-t border-zinc-800/80 pt-2.5 mt-1">
                <span className="text-zinc-500 font-semibold mb-1">Tài khoản nhận:</span>
                <div className="flex justify-between">
                  <span className="text-zinc-550">Ngân hàng:</span>
                  <span className="text-zinc-300 font-medium">{selectedWithdrawal.bankInfo?.bankName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-550">Số tài khoản:</span>
                  <span className="text-zinc-300 font-mono font-medium">{selectedWithdrawal.bankInfo?.accountNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-550">Chủ tài khoản:</span>
                  <span className="text-zinc-300 capitalize font-medium">{selectedWithdrawal.bankInfo?.accountHolder}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="adminNote" className="text-xs font-semibold text-zinc-400">
                {modalAction === 'reject' ? 'Lý do từ chối *' : 'Phản hồi / Ghi chú cho Owner'}
              </label>
              <textarea
                id="adminNote"
                placeholder={modalAction === 'reject' ? 'Bắt buộc nhập lý do từ chối...' : 'Nhập ghi chú phản hồi...'}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={3}
                className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white placeholder:text-zinc-650 focus:outline-none focus:border-amber-500/50 transition-colors resize-none"
                required={modalAction === 'reject'}
              />
            </div>

            <div className="flex justify-end gap-3 mt-2 border-t border-zinc-800 pt-4">
              <button
                onClick={handleCloseModal}
                className="h-10 px-4 rounded-lg border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={actionLoading}
                className={`h-10 px-5 rounded-lg text-zinc-950 font-bold text-xs hover:opacity-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  modalAction === 'reject' 
                    ? 'bg-rose-500 text-white' 
                    : modalAction === 'complete' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-amber-500'
                }`}
              >
                {actionLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <span>Xác nhận</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
