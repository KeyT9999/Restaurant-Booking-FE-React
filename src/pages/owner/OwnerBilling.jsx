import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Zap, Star, Check, Clock, CreditCard, ChevronRight, Loader2, AlertCircle, Wallet, Send, History, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import OwnerLayout from '../../components/owner/OwnerLayout';
import { useRestaurantContext } from '../../context/useRestaurantContext';
import { getCurrentSubscription, getBillingHistory, createPayment, checkPaymentStatus } from '../../api/paymentApi';
import { createWithdrawal, getMyWithdrawals } from '../../api/withdrawalApi';

const formatMoney = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v || 0);
const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

export default function OwnerBilling() {
  const { selectedRestaurantId } = useRestaurantContext();
  const navigate = useNavigate();
  
  // Tabs: 'billing' (Gói dịch vụ) | 'withdrawal' (Rút tiền doanh thu)
  const [activeTab, setActiveTab] = useState('billing');

  // Gói dịch vụ States
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

  // Rút tiền States
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [withdrawNote, setWithdrawNote] = useState('');
  
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);
  const [withdrawalLoading, setWithdrawalLoading] = useState(false);
  const [withdrawSubmitLoading, setWithdrawSubmitLoading] = useState(false);
  const [withdrawalError, setWithdrawalError] = useState(null);
  const [withdrawalSuccessMsg, setWithdrawalSuccessMsg] = useState(null);
  const [withdrawalPage, setWithdrawalPage] = useState(1);
  const [withdrawalTotalPages, setWithdrawalTotalPages] = useState(1);

  useEffect(() => {
    if (!selectedRestaurantId) return;
    if (activeTab === 'billing') {
      loadData();
      loadHistory();
    } else {
      loadWithdrawals();
    }
  }, [selectedRestaurantId, activeTab, withdrawalPage]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getCurrentSubscription();
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Lỗi tải gói dịch vụ');
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

  const loadWithdrawals = async () => {
    try {
      setWithdrawalLoading(true);
      setWithdrawalError(null);
      const res = await getMyWithdrawals({
        restaurantId: selectedRestaurantId,
        page: withdrawalPage,
        limit: 10
      });
      setWithdrawalHistory(res.data || []);
      if (res.pagination) {
        setWithdrawalTotalPages(res.pagination.totalPages || 1);
      }
    } catch (err) {
      setWithdrawalError(err.message || 'Lỗi tải lịch sử rút tiền');
    } finally {
      setWithdrawalLoading(false);
    }
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

  const handleCreateWithdrawal = async (e) => {
    e.preventDefault();
    if (!selectedRestaurantId) return;
    
    setWithdrawalError(null);
    setWithdrawalSuccessMsg(null);
    
    const amountVal = Number(withdrawAmount);
    if (!withdrawAmount || isNaN(amountVal) || amountVal < 10000) {
      setWithdrawalError('Số tiền rút phải lớn hơn hoặc bằng 10,000 VNĐ.');
      return;
    }
    if (!bankName.trim() || !accountNumber.trim() || !accountHolder.trim()) {
      setWithdrawalError('Vui lòng nhập đầy đủ thông tin tài khoản nhận tiền.');
      return;
    }

    try {
      setWithdrawSubmitLoading(true);
      await createWithdrawal({
        restaurantId: selectedRestaurantId,
        amount: amountVal,
        bankName,
        accountNumber,
        accountHolder,
        note: withdrawNote
      });
      
      setWithdrawalSuccessMsg('Yêu cầu rút tiền của bạn đã được gửi thành công! Đang chờ admin duyệt.');
      setWithdrawAmount('');
      setWithdrawNote('');
      loadWithdrawals();
    } catch (err) {
      setWithdrawalError(err.message || 'Có lỗi xảy ra khi tạo yêu cầu rút tiền.');
    } finally {
      setWithdrawSubmitLoading(false);
    }
  };

  const planIcons = {
    free: <Star size={18} />,
    plus: <Zap size={18} />,
    pro: <Crown size={18} />,
  };

  if (!selectedRestaurantId) {
    return (
      <OwnerLayout title="Tài chính & Giao dịch" subtitle="Quản lý gói dịch vụ và yêu cầu rút tiền doanh thu">
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border/40 bg-card/10 rounded-2xl text-center max-w-lg mx-auto my-10">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-5 border border-primary/20 text-primary">
            <CreditCard size={28} />
          </div>
          <h2 className="font-serif text-lg font-bold text-white mb-2">Chọn nhà hàng để quản lý tài chính</h2>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
            Thông tin gói dịch vụ, hạn dùng và các yêu cầu rút tiền sẽ hiển thị theo nhà hàng đang chọn ở Switcher.
          </p>
        </div>
      </OwnerLayout>
    );
  }

  return (
    <OwnerLayout title="Tài chính & Giao dịch" subtitle="Quản lý gói dịch vụ và doanh thu đặt cọc của nhà hàng">
      <div className="max-w-6xl mx-auto py-2">
        
        {/* Tab Header */}
        <div className="flex border-b border-border/60 mb-6 gap-2">
          <button
            onClick={() => setActiveTab('billing')}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'billing'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-white'
            }`}
          >
            <CreditCard size={15} />
            <span>Gói dịch vụ</span>
          </button>
          <button
            onClick={() => setActiveTab('withdrawal')}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'withdrawal'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-white'
            }`}
          >
            <Wallet size={15} />
            <span>Rút tiền doanh thu</span>
          </button>
        </div>

        {activeTab === 'billing' ? (
          <div>
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
              <div className="flex flex-col gap-8 animate-in fade-in duration-200">
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
        ) : (
          /* Withdrawal Tab Content */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-200">
            {/* Form Column */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              <div className="p-6 bg-card border border-border rounded-xl shadow-lg">
                <div className="flex items-center gap-2 text-white mb-4 border-b border-border/40 pb-3">
                  <Send className="text-primary shrink-0" size={18} />
                  <h3 className="font-serif text-lg font-bold">Yêu cầu rút tiền</h3>
                </div>

                {withdrawalError && (
                  <div className="flex items-start gap-2.5 p-3 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive text-xs leading-relaxed mb-4">
                    <AlertCircle size={15} className="shrink-0 mt-0.5" />
                    <span>{withdrawalError}</span>
                  </div>
                )}

                {withdrawalSuccessMsg && (
                  <div className="flex items-start gap-2.5 p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs leading-relaxed mb-4">
                    <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
                    <span>{withdrawalSuccessMsg}</span>
                  </div>
                )}

                <form onSubmit={handleCreateWithdrawal} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5 text-left">
                    <label htmlFor="amount" className="text-xs font-semibold text-muted-foreground">Số tiền rút (VND) *</label>
                    <input
                      id="amount"
                      type="number"
                      placeholder="Tối thiểu 10,000"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="h-10 px-3.5 bg-secondary/30 border border-border rounded-lg text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 text-left">
                    <label htmlFor="bankName" className="text-xs font-semibold text-muted-foreground">Tên ngân hàng *</label>
                    <input
                      id="bankName"
                      type="text"
                      placeholder="Ví dụ: Vietcombank, MB, Techcombank"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="h-10 px-3.5 bg-secondary/30 border border-border rounded-lg text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 text-left">
                    <label htmlFor="accountNumber" className="text-xs font-semibold text-muted-foreground">Số tài khoản *</label>
                    <input
                      id="accountNumber"
                      type="text"
                      placeholder="Nhập số tài khoản ngân hàng"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="h-10 px-3.5 bg-secondary/30 border border-border rounded-lg text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 text-left">
                    <label htmlFor="accountHolder" className="text-xs font-semibold text-muted-foreground">Tên chủ tài khoản *</label>
                    <input
                      id="accountHolder"
                      type="text"
                      placeholder="Nhập tên viết hoa không dấu"
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                      className="h-10 px-3.5 bg-secondary/30 border border-border rounded-lg text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 text-left">
                    <label htmlFor="note" className="text-xs font-semibold text-muted-foreground">Ghi chú thêm</label>
                    <textarea
                      id="note"
                      placeholder="Nội dung ghi chú nếu có"
                      value={withdrawNote}
                      onChange={(e) => setWithdrawNote(e.target.value)}
                      rows={2}
                      className="p-3 bg-secondary/30 border border-border rounded-lg text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={withdrawSubmitLoading}
                    className="w-full h-11 bg-primary text-[#0F1115] font-bold text-xs uppercase tracking-wider hover:bg-primary/95 disabled:bg-primary/40 disabled:text-[#0F1115]/50 transition-all rounded-lg flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                  >
                    {withdrawSubmitLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Đang xử lý...</span>
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        <span>Gửi yêu cầu rút</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Guide card */}
              <div className="p-4 bg-secondary/10 border border-border/60 rounded-xl flex items-start gap-3 text-left">
                <HelpCircle size={18} className="text-primary shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1 text-[11px] text-muted-foreground leading-relaxed">
                  <h4 className="font-bold text-white text-xs">Lưu ý rút tiền:</h4>
                  <p>• Chỉ được gửi yêu cầu rút tiền mới khi không có yêu cầu nào đang ở trạng thái <span className="text-amber-400 font-semibold">Chờ duyệt (pending)</span>.</p>
                  <p>• Số tiền rút tối thiểu cho mỗi giao dịch là <span className="text-white font-semibold">10,000 VNĐ</span>.</p>
                  <p>• Thời gian admin xử lý chuyển khoản ngân hàng thông thường từ 1-3 ngày làm việc.</p>
                </div>
              </div>
            </div>

            {/* History Column */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="p-6 bg-card border border-border rounded-xl shadow-lg flex-1 flex flex-col">
                <div className="flex items-center gap-2 text-white mb-4 border-b border-border/40 pb-3">
                  <History className="text-primary shrink-0" size={18} />
                  <h3 className="font-serif text-lg font-bold">Lịch sử rút tiền</h3>
                </div>

                {withdrawalLoading ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-xs font-semibold">Đang tải lịch sử rút tiền...</p>
                  </div>
                ) : withdrawalHistory.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-16 text-center border border-dashed border-border/40 bg-card/10 rounded-xl text-muted-foreground">
                    <Wallet className="h-10 w-10 text-muted-foreground/30 mb-3" />
                    <p className="text-xs">Chưa có yêu cầu rút tiền nào được tạo.</p>
                  </div>
                ) : (
                  <div className="flex-grow flex flex-col justify-between">
                    <div className="overflow-x-auto border border-border rounded-xl bg-card/40 shadow-inner mb-4">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="bg-[#1A1D24] text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60">
                            <th className="p-4">Ngày yêu cầu</th>
                            <th className="p-4">Tài khoản nhận</th>
                            <th className="p-4 text-right">Số tiền</th>
                            <th className="p-4 text-center">Trạng thái</th>
                            <th className="p-4">Phản hồi Admin</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                          {withdrawalHistory.map((w) => (
                            <tr key={w._id} className="hover:bg-white/5 transition-colors">
                              <td className="p-4 whitespace-nowrap text-muted-foreground">
                                {formatDate(w.createdAt)}
                              </td>
                              <td className="p-4 text-white">
                                <div className="font-semibold">{w.bankInfo?.bankName}</div>
                                <div className="text-[10px] text-muted-foreground mt-0.5">{w.bankInfo?.accountNumber} - {w.bankInfo?.accountHolder}</div>
                                {w.note && <div className="text-[10px] italic text-primary mt-1">Ghi chú: {w.note}</div>}
                              </td>
                              <td className="p-4 text-right font-bold text-white whitespace-nowrap">
                                {formatMoney(w.amount)}
                              </td>
                              <td className="p-4 text-center whitespace-nowrap">
                                <span className={`inline-block px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                                  w.status === 'completed'
                                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                    : w.status === 'approved'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : w.status === 'pending'
                                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                    : 'bg-destructive/10 text-destructive border-destructive/20'
                                }`}>
                                  {w.status === 'pending' ? 'Chờ duyệt' : 
                                   w.status === 'approved' ? 'Đã duyệt' : 
                                   w.status === 'completed' ? 'Hoàn tất' : 'Từ chối'}
                                </span>
                              </td>
                              <td className="p-4 text-muted-foreground max-w-xs truncate">
                                {w.adminNote ? (
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-white text-[11px]">{w.adminNote}</span>
                                    {w.reviewedAt && (
                                      <span className="text-[9px] text-muted-foreground/85">
                                        Duyệt lúc: {new Date(w.reviewedAt).toLocaleDateString('vi-VN')}
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground/40 italic">Chưa có phản hồi</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {withdrawalTotalPages > 1 && (
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          disabled={withdrawalPage === 1}
                          onClick={() => setWithdrawalPage((p) => p - 1)}
                          className="px-3 h-8 text-[11px] rounded bg-secondary/50 border border-border text-white disabled:opacity-40 hover:bg-secondary transition-colors cursor-pointer"
                        >
                          Trước
                        </button>
                        <span className="flex items-center px-2 text-[11px] text-muted-foreground font-medium">
                          Trang {withdrawalPage} / {withdrawalTotalPages}
                        </span>
                        <button
                          disabled={withdrawalPage === withdrawalTotalPages}
                          onClick={() => setWithdrawalPage((p) => p + 1)}
                          className="px-3 h-8 text-[11px] rounded bg-secondary/50 border border-border text-white disabled:opacity-40 hover:bg-secondary transition-colors cursor-pointer"
                        >
                          Sau
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
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
