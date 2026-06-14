import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Zap, Star, Check, Clock, CreditCard, ChevronRight } from 'lucide-react';
import OwnerLayout from '../../components/owner/OwnerLayout';
import { useRestaurantContext } from '../../context/useRestaurantContext';
import { getCurrentSubscription, getBillingHistory, createPayment, checkPaymentStatus } from '../../api/paymentApi';
import './OwnerBilling.css';

const formatMoney = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v || 0);
const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

export default function OwnerBilling() {
  const { selectedRestaurantId } = useRestaurantContext();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // QR Modal
  const [showQR, setShowQR] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const pollRef = useRef(null);

  useEffect(() => {
    if (!selectedRestaurantId) return;
    loadData();
    loadHistory();
  }, [selectedRestaurantId]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getCurrentSubscription();
      setData(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const res = await getBillingHistory({ limit: 10 });
      setHistory(res.data || []);
    } catch (e) {}
  };

  const handleSelectPlan = async (planKey) => {
    if (!selectedRestaurantId) return;
    try {
      setPaymentLoading(true);
      const res = await createPayment({
        targetType: 'subscription',
        targetId: selectedRestaurantId,
        plan: planKey,
      });
      setPaymentData(res.data);
      setShowQR(true);
      startPolling(res.data.orderCode);
    } catch (err) {
      alert(err.message || 'Lỗi tạo thanh toán');
    } finally {
      setPaymentLoading(false);
    }
  };

  const startPolling = (orderCode) => {
    setPolling(true);
    pollRef.current = setInterval(async () => {
      try {
        const res = await checkPaymentStatus(orderCode);
        if (res.data?.status === 'paid') {
          clearInterval(pollRef.current);
          setPolling(false);
          setShowQR(false);
          navigate('/payment-success?targetType=subscription');
        }
      } catch (e) {}
    }, 5000);
  };

  const handleCloseQR = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    setPolling(false);
    setShowQR(false);
    setPaymentData(null);
  };

  const planIcons = {
    free: <Star size={20} />,
    plus: <Zap size={20} />,
    pro: <Crown size={20} />,
  };

  if (!selectedRestaurantId) {
    return (
      <OwnerLayout title="Gói dịch vụ" subtitle="Quản lý gói dịch vụ và thanh toán">
        <div className="owner-panel empty-context">
          <h2>Chọn nhà hàng để xem gói dịch vụ</h2>
        </div>
      </OwnerLayout>
    );
  }

  return (
    <OwnerLayout title="Gói dịch vụ" subtitle="Quản lý gói dịch vụ và thanh toán cho nhà hàng">
      {loading && <div className="billing-loading">Đang tải...</div>}
      {error && <div className="billing-error">{error}</div>}

      {data && (
        <>
          {/* Current Plan */}
          <section className="billing-current-plan">
            <div className="billing-current-plan__icon">
              {planIcons[data.currentPlan] || <Star size={20} />}
            </div>
            <div className="billing-current-plan__info">
              <span className="billing-label">GÓI HIỆN TẠI</span>
              <h2 className="billing-current-plan__name">{data.planInfo?.name || 'Free'}</h2>
              {data.subscription && (
                <p className="billing-current-plan__expiry">
                  <Clock size={14} />
                  Hết hạn: {formatDate(data.subscription.expiredAt)}
                </p>
              )}
            </div>
          </section>

          {/* Plan Cards */}
          <section className="billing-plans">
            <h3 className="billing-section-title">Chọn gói dịch vụ</h3>
            <div className="billing-plans-grid">
              {data.availablePlans?.map((plan) => (
                <article
                  key={plan.key}
                  className={`billing-plan-card ${plan.isCurrent ? 'billing-plan-card--current' : ''}`}
                >
                  <div className="billing-plan-card__header">
                    {planIcons[plan.key]}
                    <h4>{plan.name}</h4>
                    {plan.isCurrent && <span className="billing-badge">Đang dùng</span>}
                  </div>
                  <div className="billing-plan-card__price">
                    {plan.price > 0 ? (
                      <>
                        <span className="billing-price-amount">{formatMoney(plan.price)}</span>
                        <span className="billing-price-period">/ tháng</span>
                      </>
                    ) : (
                      <span className="billing-price-amount">Miễn phí</span>
                    )}
                  </div>
                  <ul className="billing-plan-card__benefits">
                    <li><Check size={14} /> {plan.benefits.maxMenuItems === -1 ? 'Không giới hạn món' : `${plan.benefits.maxMenuItems} món`}</li>
                    <li><Check size={14} /> {plan.benefits.maxTables === -1 ? 'Không giới hạn bàn' : `${plan.benefits.maxTables} bàn`}</li>
                    {plan.benefits.allowRealtime && <li><Check size={14} /> Chat realtime</li>}
                    {plan.benefits.allowAnalytics && <li><Check size={14} /> Phân tích nâng cao</li>}
                    {plan.benefits.prioritySupport && <li><Check size={14} /> Hỗ trợ ưu tiên</li>}
                  </ul>
                  {plan.canSelect && !plan.isCurrent && (
                    <button
                      className="billing-plan-card__btn"
                      onClick={() => handleSelectPlan(plan.key)}
                      disabled={paymentLoading}
                    >
                      {paymentLoading ? 'Đang xử lý...' : 'Nâng cấp'}
                      <ChevronRight size={16} />
                    </button>
                  )}
                  {plan.isCurrent && plan.canSelect && (
                    <button
                      className="billing-plan-card__btn billing-plan-card__btn--renew"
                      onClick={() => handleSelectPlan(plan.key)}
                      disabled={paymentLoading}
                    >
                      Gia hạn <ChevronRight size={16} />
                    </button>
                  )}
                </article>
              ))}
            </div>
          </section>

          {/* Billing History */}
          <section className="billing-history">
            <h3 className="billing-section-title">Lịch sử thanh toán</h3>
            {history.length === 0 ? (
              <div className="billing-empty">Chưa có giao dịch nào.</div>
            ) : (
              <div className="billing-table-wrap">
                <table className="billing-table">
                  <thead>
                    <tr>
                      <th>Ngày</th>
                      <th>Mô tả</th>
                      <th>Số tiền</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((p) => (
                      <tr key={p._id}>
                        <td>{formatDate(p.createdAt)}</td>
                        <td>{p.description || 'Thanh toán gói'}</td>
                        <td className="billing-td-amount">{formatMoney(p.amount)}</td>
                        <td><span className={`billing-status billing-status--${p.status}`}>{p.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      {/* QR Payment Modal */}
      {showQR && paymentData && (
        <div className="qr-modal-overlay" onClick={handleCloseQR}>
          <div className="qr-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="qr-modal__title">Thanh toán qua PayOS</h3>
            <p className="qr-modal__amount">{formatMoney(paymentData.amount)}</p>
            <p className="qr-modal__desc">{paymentData.description}</p>

            {paymentData.checkoutUrl && (
              <div className="qr-modal__actions">
                <a
                  href={paymentData.checkoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="qr-modal__btn"
                >
                  <CreditCard size={16} />
                  Mở trang thanh toán PayOS
                </a>
              </div>
            )}

            {polling && (
              <p className="qr-modal__polling">
                <span className="qr-modal__spinner" />
                Đang chờ xác nhận thanh toán...
              </p>
            )}

            <button className="qr-modal__close" onClick={handleCloseQR}>
              Hủy giao dịch
            </button>
          </div>
        </div>
      )}
    </OwnerLayout>
  );
}
