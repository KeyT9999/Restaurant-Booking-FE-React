import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Zap, Star, Check, Clock, CreditCard, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import OwnerLayout from '../../components/owner/OwnerLayout';
import { useRestaurantContext } from '../../context/useRestaurantContext';
import { getCurrentSubscription, getBillingHistory, createPayment, checkPaymentStatus } from '../../api/paymentApi';

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
    free: <Star size={18} />,
    plus: <Zap size={18} />,
    pro: <Crown size={18} />,
  };

  if (!selectedRestaurantId) {
    return (
      <OwnerLayout title="Gói dịch vụ" subtitle="Quản lý gói dịch vụ và thanh toán">
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border/40 bg-card/10 rounded-2xl text-center max-w-lg mx-auto my-10">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-5 border border-primary/20 text-primary">
            <CreditCard size={28} />
          </div>
          <h2 className="font-serif text-lg font-bold text-white mb-2">Chọn nhà hàng để xem gói dịch vụ</h2>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
            Thông tin gói dịch vụ hiện tại, hạn dùng và lịch sử hóa đơn thanh toán sẽ hiển thị theo nhà hàng đang chọn ở Switcher.
          </p>
        </div>
      </OwnerLayout>
    );
  }

  return (
    <OwnerLayout title="Gói dịch vụ" subtitle="Quản lý gói dịch vụ và thanh toán cho nhà hàng">
      <div className="max-w-6xl mx-auto py-4">
        
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Đang tải thông tin dịch vụ...</p>
          </div>
        )}
        
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive text-xs leading-relaxed max-w-lg mx-auto mb-6">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {data && !loading && (
          <div className="flex flex-col gap-8">
            {/* Current Plan Card */}
            <section className="flex items-center gap-4 p-5 bg-[#14171D] border border-border rounded-xl shadow-md">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                {planIcons[data.currentPlan] || <Star size={20} />}
              </div>
              <div className="flex-1 min-w-0 flex flex-col text-left">
                <span className="text-[10px] font-bold tracking-wider uppercase text-primary">GÓI HIỆN TẠI</span>
                <h2 className="font-serif text-2xl text-white font-bold leading-tight mt-0.5">{data.planInfo?.name || 'Free'}</h2>
                {data.subscription && (
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                    <Clock size={13} className="text-primary/70 shrink-0" />
                    <span>Hết hạn: {formatDate(data.subscription.expiredAt)}</span>
                  </p>
                )}
              </div>
            </section>

            {/* Plan Cards Grid */}
            <section className="flex flex-col gap-4">
              <h3 className="font-serif text-xl text-white font-bold border-b border-border/40 pb-3">Chọn gói dịch vụ</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {data.availablePlans?.map((plan) => {
                  const isCurrent = plan.isCurrent;
                  return (
                    <article
                      key={plan.key}
                      className={`p-6 bg-card border rounded-xl flex flex-col hover:border-primary/45 hover:bg-primary/[0.01] transition-all relative overflow-hidden shadow-lg ${
                        isCurrent ? 'border-primary/55 ring-1 ring-primary/20 bg-primary/[0.02]' : 'border-border'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-white mb-4">
                        <span className="text-primary">{planIcons[plan.key]}</span>
                        <h4 className="text-sm font-bold flex-1">{plan.name}</h4>
                        {isCurrent && (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary uppercase shrink-0">
                            Đang dùng
                          </span>
                        )}
                      </div>
                      
                      <div className="mb-4 flex items-baseline gap-1">
                        {plan.price > 0 ? (
                          <>
                            <span className="font-serif text-2xl md:text-3xl font-bold text-white">{formatMoney(plan.price)}</span>
                            <span className="text-xs text-muted-foreground">/ tháng</span>
                          </>
                        ) : (
                          <span className="font-serif text-2xl md:text-3xl font-bold text-white">Miễn phí</span>
                        )}
                      </div>

                      <ul className="flex flex-col gap-2.5 mb-6 flex-1 text-xs text-muted-foreground border-t border-border/40 pt-4">
                        <li className="flex items-center gap-2">
                          <Check size={13} className="text-primary shrink-0" /> 
                          <span>{plan.benefits.maxMenuItems === -1 ? 'Không giới hạn món ăn' : `${plan.benefits.maxMenuItems} món ăn`}</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check size={13} className="text-primary shrink-0" /> 
                          <span>{plan.benefits.maxTables === -1 ? 'Không giới hạn bàn' : `${plan.benefits.maxTables} bàn`}</span>
                        </li>
                        {plan.benefits.allowRealtime && (
                          <li className="flex items-center gap-2">
                            <Check size={13} className="text-primary shrink-0" /> 
                            <span>Hỗ trợ chat realtime</span>
                          </li>
                        )}
                        {plan.benefits.allowAnalytics && (
                          <li className="flex items-center gap-2">
                            <Check size={13} className="text-primary shrink-0" /> 
                            <span>Phân tích thống kê nâng cao</span>
                          </li>
                        )}
                        {plan.benefits.prioritySupport && (
                          <li className="flex items-center gap-2">
                            <Check size={13} className="text-primary shrink-0" /> 
                            <span>Hỗ trợ kỹ thuật ưu tiên</span>
                          </li>
                        )}
                      </ul>

                      {plan.canSelect && !isCurrent && (
                        <button
                          className="w-full h-11 rounded-xl bg-primary text-[#0F1115] font-bold text-xs uppercase tracking-wider hover:bg-primary/95 transition-all flex items-center justify-center gap-1 cursor-pointer mt-auto"
                          onClick={() => handleSelectPlan(plan.key)}
                          disabled={paymentLoading}
                        >
                          <span>{paymentLoading ? 'Đang xử lý...' : 'Nâng cấp ngay'}</span>
                          <ChevronRight size={14} />
                        </button>
                      )}
                      
                      {isCurrent && plan.canSelect && (
                        <button
                          className="w-full h-11 rounded-xl border border-primary/30 bg-transparent text-primary hover:bg-primary/5 hover:border-primary transition-all flex items-center justify-center gap-1 cursor-pointer mt-auto text-xs font-bold uppercase tracking-wider"
                          onClick={() => handleSelectPlan(plan.key)}
                          disabled={paymentLoading}
                        >
                          <span>Gia hạn gói</span>
                          <ChevronRight size={14} />
                        </button>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>

            {/* Billing History */}
            <section className="flex flex-col gap-4 mt-6">
              <h3 className="font-serif text-xl text-white font-bold border-b border-border/40 pb-3">Lịch sử thanh toán</h3>
              {history.length === 0 ? (
                <div className="text-xs text-muted-foreground p-8 border border-dashed border-border/40 bg-card/10 rounded-xl text-center">
                  Chưa ghi nhận giao dịch hóa đơn nào.
                </div>
              ) : (
                <div className="overflow-x-auto border border-border rounded-xl bg-card/40 shadow-inner">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-[#1A1D24] text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60">
                        <th className="p-4">Ngày</th>
                        <th className="p-4">Mô tả giao dịch</th>
                        <th className="p-4 text-right">Số tiền</th>
                        <th className="p-4 text-center">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {history.map((p) => (
                        <tr key={p._id} className="hover:bg-white/5 transition-colors">
                          <td className="p-4 whitespace-nowrap text-muted-foreground">{formatDate(p.createdAt)}</td>
                          <td className="p-4 text-white font-medium">{p.description || 'Thanh toán gói dịch vụ'}</td>
                          <td className="p-4 text-right font-bold text-white whitespace-nowrap">{formatMoney(p.amount)}</td>
                          <td className="p-4 text-center whitespace-nowrap">
                            <span className={`inline-block px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                              p.status === 'paid'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : p.status === 'pending'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : p.status === 'refunded'
                                ? 'bg-primary/10 text-primary border-primary/20'
                                : 'bg-destructive/10 text-destructive border-destructive/20'
                            }`}>
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        )}
      </div>

      {/* QR Payment Modal */}
      {showQR && paymentData && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={handleCloseQR}>
          <div className="w-full max-w-[420px] bg-card border border-border rounded-2xl p-6 md:p-8 flex flex-col items-center gap-6 shadow-2xl relative text-center" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-serif text-xl text-white font-bold">Thanh toán qua cổng PayOS</h3>
            <p className="font-serif text-3xl font-bold text-primary -mt-2">{formatMoney(paymentData.amount)}</p>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">{paymentData.description}</p>

            {paymentData.checkoutUrl && (
              <div className="w-full mt-2">
                <a
                  href={paymentData.checkoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-12 rounded-xl bg-primary text-[#0F1115] font-bold text-xs hover:bg-primary/95 transition-all flex items-center justify-center gap-2 uppercase tracking-wider shadow-md decoration-none cursor-pointer"
                >
                  <CreditCard size={15} />
                  <span>Mở trang thanh toán PayOS</span>
                </a>
              </div>
            )}

            {polling && (
              <p className="flex items-center justify-center gap-2 text-xs text-primary font-medium mt-1">
                <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                <span>Đang chờ xác nhận thanh toán...</span>
              </p>
            )}

            <div className="w-full border-t border-border/40 pt-4 flex justify-center mt-2">
              <button
                onClick={handleCloseQR}
                className="h-10 px-5 rounded-xl border border-destructive/20 bg-transparent text-destructive hover:bg-destructive/5 text-xs font-semibold cursor-pointer"
              >
                Hủy giao dịch
              </button>
            </div>
          </div>
        </div>
      )}
    </OwnerLayout>
  );
}
