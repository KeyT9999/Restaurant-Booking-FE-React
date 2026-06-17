import { useEffect, useState } from 'react';
import { RefreshCw, Check, X, DollarSign } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminGetRefunds, adminApproveRefund, adminRejectRefund, adminProcessRefund } from '../../api/paymentApi';

const formatMoney = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v || 0);
const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

export default function AdminRefunds() {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [actionModal, setActionModal] = useState(null); // { type: 'approve'|'reject'|'process', refund }
  const [note, setNote] = useState('');
  const [refId, setRefId] = useState('');
  const [processing, setProcessing] = useState(false);

  const loadRefunds = async () => {
    setLoading(true);
    try {
      const res = await adminGetRefunds({ status: filter || undefined, limit: 50 });
      setRefunds(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRefunds(); }, [filter]);


  const handleAction = async () => {
    if (!actionModal) return;
    setProcessing(true);
    try {
      if (actionModal.type === 'approve') {
        await adminApproveRefund(actionModal.refund._id, { adminNote: note });
      } else if (actionModal.type === 'reject') {
        await adminRejectRefund(actionModal.refund._id, { adminNote: note });
      } else if (actionModal.type === 'process') {
        await adminProcessRefund(actionModal.refund._id, { adminNote: note, gatewayRefundId: refId });
      }
      setActionModal(null);
      setNote('');
      setRefId('');
      loadRefunds();
    } catch (e) {
      alert(e.message || 'Lỗi xử lý');
    } finally {
      setProcessing(false);
    }
  };

  const statusLabels = {
    requested: 'Chờ duyệt',
    approved: 'Đã duyệt',
    rejected: 'Từ chối',
    refunded: 'Đã hoàn tiền',
    processing: 'Đang xử lý',
    cancelled: 'Đã hủy',
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case 'requested':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'approved':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'refunded':
        return 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20';
      case 'rejected':
        return 'bg-rose-500/10 text-rose-450 border border-rose-500/20';
      case 'processing':
        return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      case 'cancelled':
      default:
        return 'bg-zinc-500/10 text-zinc-400 border border-zinc-550/20';
    }
  };

  return (
    <AdminLayout title="Quản lý hoàn tiền" subtitle="Quản trị, duyệt và theo dõi trạng thái các yêu cầu hoàn tiền cọc">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center mb-6">
        <h1 className="text-xl font-extrabold text-zinc-100 uppercase tracking-wide flex items-center gap-2">
          <DollarSign className="text-amber-500" /> Hồ sơ hoàn tiền
        </h1>
        <button 
          className="inline-flex items-center gap-1.5 px-4 py-2 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold rounded-lg transition" 
          onClick={loadRefunds}
        >
          <RefreshCw size={14} /> Làm mới
        </button>
      </div>

      {/* Filters */}
      <div className="flex border-b border-zinc-800 mb-6 overflow-x-auto whitespace-nowrap scrollbar-none gap-2">
        {['', 'requested', 'approved', 'refunded', 'rejected'].map((s) => (
          <button
            key={s}
            className={`px-4 py-2 text-xs font-semibold tracking-wide uppercase border-b-2 transition duration-200 outline-none ${
              filter === s 
                ? 'border-amber-500 text-amber-500' 
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
            onClick={() => setFilter(s)}
          >
            {s === '' ? 'Tất cả' : statusLabels[s] || s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-400 space-y-3 bg-[#1A1D24] border border-zinc-800 rounded-xl">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Đang tải...</span>
        </div>
      ) : refunds.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-400 bg-[#1A1D24] border border-zinc-800 rounded-xl text-sm">
          Không có yêu cầu hoàn tiền nào.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {refunds.map((r) => (
            <article key={r._id} className="bg-[#1A1D24] border border-zinc-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${getStatusClasses(r.status)}`}>
                    {statusLabels[r.status] || r.status}
                  </span>
                  <span className="text-xs text-zinc-500 font-mono">{formatDate(r.createdAt)}</span>
                </div>

                <div className="flex items-baseline justify-between mb-4">
                  <div className="text-xl font-black text-amber-500 font-mono">{formatMoney(r.amount)}</div>
                </div>

                <div className="text-xs space-y-2 border-t border-zinc-850 pt-3 mb-4 text-zinc-405">
                  <p><strong className="text-zinc-300">Người yêu cầu:</strong> {r.requestedBy?.fullName || '—'} ({r.requestedByRole === 'admin' ? 'Admin' : 'Chủ nhà hàng'})</p>
                  <p><strong className="text-zinc-300">Lý do:</strong> {r.reason}</p>
                  {r.bookingId && (
                    <p><strong className="text-zinc-300">Đặt bàn:</strong> {formatDate(r.bookingId?.bookingDate)} - {r.bookingId?.customerName}</p>
                  )}
                  {r.bankInfo?.bankName && (
                    <p><strong className="text-zinc-300">Ngân hàng:</strong> {r.bankInfo.bankName} - {r.bankInfo.accountNumber} - {r.bankInfo.accountHolder}</p>
                  )}
                  {r.adminNote && (
                    <p className="bg-zinc-900/40 p-2 border border-zinc-855 rounded-lg text-zinc-400 italic">
                      <strong className="text-zinc-305 not-italic block mb-0.5">Ghi chú admin:</strong> {r.adminNote}
                    </p>
                  )}
                </div>
              </div>

              {/* Action area */}
              <div className="flex flex-wrap items-center justify-end gap-2 border-t border-zinc-850 pt-3">
                {r.status === 'requested' && (
                  <>
                    <button 
                      className="inline-flex items-center gap-1 px-3 py-1.5 border border-zinc-800 hover:bg-emerald-500/10 hover:text-emerald-400 text-zinc-400 text-xs font-semibold rounded-lg transition" 
                      onClick={() => setActionModal({ type: 'approve', refund: r })}
                    >
                      <Check size={13} /> Duyệt
                    </button>
                    <button 
                      className="inline-flex items-center gap-1 px-3 py-1.5 border border-zinc-800 hover:bg-rose-500/10 hover:text-rose-400 text-zinc-400 text-xs font-semibold rounded-lg transition" 
                      onClick={() => setActionModal({ type: 'reject', refund: r })}
                    >
                      <X size={13} /> Từ chối
                    </button>
                    <button 
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold rounded-lg transition" 
                      onClick={() => setActionModal({ type: 'process', refund: r })}
                    >
                      <DollarSign size={13} /> Đã hoàn tiền
                    </button>
                  </>
                )}
                {r.status === 'approved' && (
                  <button 
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold rounded-lg transition" 
                    onClick={() => setActionModal({ type: 'process', refund: r })}
                  >
                    <DollarSign size={13} /> Xác nhận đã chuyển tiền
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Action Modal */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setActionModal(null)}>
          <div className="bg-[#1A1D24] border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-zinc-150 mb-2">
              {actionModal.type === 'approve' && 'Duyệt yêu cầu hoàn tiền'}
              {actionModal.type === 'reject' && 'Từ chối yêu cầu hoàn tiền'}
              {actionModal.type === 'process' && 'Xác nhận đã chuyển tiền hoàn'}
            </h3>
            <p className="text-sm text-zinc-400 mb-4">Số tiền: <strong className="text-amber-550 font-mono">{formatMoney(actionModal.refund.amount)}</strong></p>

            <form onSubmit={(e) => { e.preventDefault(); handleAction(); }} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-450 tracking-wide uppercase">Ghi chú</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={actionModal.type === 'reject' ? 'Lý do từ chối...' : 'Ghi chú...'}
                  rows={3}
                  className="w-full bg-[#13161C] border border-zinc-800 text-zinc-200 placeholder-zinc-650 rounded-lg text-sm px-3.5 py-2.5 outline-none focus:ring-1 focus:ring-amber-500 resize-none"
                />
              </div>

              {actionModal.type === 'process' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-450 tracking-wide uppercase">Mã giao dịch chuyển khoản</label>
                  <input
                    value={refId}
                    onChange={(e) => setRefId(e.target.value)}
                    placeholder="VD: FT123456789"
                    className="w-full bg-[#13161C] border border-zinc-800 text-zinc-200 placeholder-zinc-650 rounded-lg text-sm px-3.5 py-2.5 outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button 
                  type="button"
                  className="px-4 py-2 border border-zinc-800 hover:bg-zinc-850 text-zinc-300 font-semibold text-xs rounded-lg transition" 
                  onClick={() => setActionModal(null)}
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-black font-bold text-xs rounded-lg transition disabled:opacity-50"
                  disabled={processing}
                >
                  {processing ? 'Đang xử lý...' : 'Xác nhận'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
