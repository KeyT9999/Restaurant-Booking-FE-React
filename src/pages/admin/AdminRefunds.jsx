import { useEffect, useState } from 'react';
import { RefreshCcw, Check, X, DollarSign } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminGetRefunds, adminApproveRefund, adminRejectRefund, adminProcessRefund } from '../../api/paymentApi';
import './AdminRefunds.css';

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

  useEffect(() => { loadRefunds(); }, [filter]);

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

  return (
    <AdminLayout>
      <div className="admin-refunds">
        <div className="admin-refunds__header">
          <h1 className="admin-refunds__title">Quản lý hoàn tiền</h1>
          <button className="admin-refunds__refresh" onClick={loadRefunds}>
            <RefreshCcw size={16} /> Làm mới
          </button>
        </div>

        {/* Filters */}
        <div className="admin-refunds__filters">
          {['', 'requested', 'approved', 'refunded', 'rejected'].map((s) => (
            <button
              key={s}
              className={`admin-refunds__filter-btn ${filter === s ? 'active' : ''}`}
              onClick={() => setFilter(s)}
            >
              {s === '' ? 'Tất cả' : statusLabels[s] || s}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="admin-refunds__loading">Đang tải...</div>
        ) : refunds.length === 0 ? (
          <div className="admin-refunds__empty">Không có yêu cầu hoàn tiền nào.</div>
        ) : (
          <div className="admin-refunds__list">
            {refunds.map((r) => (
              <article key={r._id} className="refund-card">
                <div className="refund-card__top">
                  <span className={`refund-status refund-status--${r.status}`}>
                    {statusLabels[r.status] || r.status}
                  </span>
                  <span className="refund-card__date">{formatDate(r.createdAt)}</span>
                </div>

                <div className="refund-card__body">
                  <div className="refund-card__amount">{formatMoney(r.amount)}</div>
                  <div className="refund-card__info">
                    <p><strong>Người yêu cầu:</strong> {r.requestedBy?.fullName || '—'} ({r.requestedByRole})</p>
                    <p><strong>Lý do:</strong> {r.reason}</p>
                    {r.bookingId && (
                      <p><strong>Đặt bàn:</strong> {formatDate(r.bookingId?.bookingDate)} - {r.bookingId?.customerName}</p>
                    )}
                    {r.bankInfo?.bankName && (
                      <p><strong>Ngân hàng:</strong> {r.bankInfo.bankName} - {r.bankInfo.accountNumber} - {r.bankInfo.accountHolder}</p>
                    )}
                    {r.adminNote && <p><strong>Ghi chú admin:</strong> {r.adminNote}</p>}
                  </div>
                </div>

                {r.status === 'requested' && (
                  <div className="refund-card__actions">
                    <button className="refund-action-btn refund-action-btn--approve" onClick={() => setActionModal({ type: 'approve', refund: r })}>
                      <Check size={14} /> Duyệt
                    </button>
                    <button className="refund-action-btn refund-action-btn--reject" onClick={() => setActionModal({ type: 'reject', refund: r })}>
                      <X size={14} /> Từ chối
                    </button>
                    <button className="refund-action-btn refund-action-btn--process" onClick={() => setActionModal({ type: 'process', refund: r })}>
                      <DollarSign size={14} /> Đã hoàn tiền
                    </button>
                  </div>
                )}
                {r.status === 'approved' && (
                  <div className="refund-card__actions">
                    <button className="refund-action-btn refund-action-btn--process" onClick={() => setActionModal({ type: 'process', refund: r })}>
                      <DollarSign size={14} /> Xác nhận đã chuyển tiền
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}

        {/* Action Modal */}
        {actionModal && (
          <div className="refund-modal-overlay" onClick={() => setActionModal(null)}>
            <div className="refund-modal" onClick={(e) => e.stopPropagation()}>
              <h3 className="refund-modal__title">
                {actionModal.type === 'approve' && 'Duyệt yêu cầu hoàn tiền'}
                {actionModal.type === 'reject' && 'Từ chối yêu cầu hoàn tiền'}
                {actionModal.type === 'process' && 'Xác nhận đã chuyển tiền hoàn'}
              </h3>
              <p className="refund-modal__amount">Số tiền: {formatMoney(actionModal.refund.amount)}</p>

              <div className="refund-modal__field">
                <label>Ghi chú</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={actionModal.type === 'reject' ? 'Lý do từ chối...' : 'Ghi chú...'}
                  rows={3}
                />
              </div>

              {actionModal.type === 'process' && (
                <div className="refund-modal__field">
                  <label>Mã giao dịch chuyển khoản</label>
                  <input
                    value={refId}
                    onChange={(e) => setRefId(e.target.value)}
                    placeholder="VD: FT123456789"
                  />
                </div>
              )}

              <div className="refund-modal__actions">
                <button className="refund-modal__btn--cancel" onClick={() => setActionModal(null)}>Hủy</button>
                <button className="refund-modal__btn--confirm" onClick={handleAction} disabled={processing}>
                  {processing ? 'Đang xử lý...' : 'Xác nhận'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
