import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowLeft, Loader2, Clock, RotateCw } from 'lucide-react';
import { checkPaymentStatus } from '../../api/paymentApi';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [verified, setVerified] = useState(false);
  const orderCode = searchParams.get('orderCode');
  const targetType = searchParams.get('targetType');

  const verifyPayment = async () => {
    try {
      const res = await checkPaymentStatus(orderCode);
      setVerified(res.data?.status === 'paid');
    } catch {
      setVerified(false);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (orderCode) {
      verifyPayment();
    } else {
      setChecking(false);
      setVerified(true); // Assume success if no orderCode (came from webhook)
    }
  }, [orderCode]);

  return (
    <div className="min-h-screen w-full bg-[#0F1115] relative flex items-center justify-center p-4 overflow-hidden before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_center,rgba(212,150,83,0.06)_0%,transparent_70%)]">
      {/* Background decoration blur */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20 z-0">
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-[480px] p-8 md:p-10 bg-card/90 border border-border rounded-2xl flex flex-col items-center gap-6 shadow-2xl relative backdrop-blur-md z-10 text-center">
        {checking ? (
          <div className="flex flex-col items-center gap-4 py-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <h1 className="font-serif text-2xl text-white font-bold tracking-tight">Đang kiểm tra giao dịch...</h1>
            <p className="text-xs text-muted-foreground max-w-[320px] leading-relaxed">
              Vui lòng đợi hệ thống xác nhận thanh toán từ cổng PayOS.
            </p>
          </div>
        ) : verified ? (
          <div className="flex flex-col items-center gap-4 py-2">
            <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle size={36} />
            </div>
            <h1 className="font-serif text-2xl text-white font-bold tracking-tight">Thanh toán thành công!</h1>
            <p className="text-xs text-muted-foreground max-w-[320px] leading-relaxed">
              {targetType === 'subscription'
                ? 'Gói dịch vụ đã được kích hoạt thành công cho nhà hàng của bạn.'
                : 'Đặt cọc thành công. Yêu cầu đặt bàn của bạn đã được hệ thống xác nhận.'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-2">
            <div className="h-16 w-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Clock size={36} />
            </div>
            <h1 className="font-serif text-2xl text-white font-bold tracking-tight">Đang chờ xác nhận</h1>
            <p className="text-xs text-muted-foreground max-w-[320px] leading-relaxed">
              Thanh toán chưa được xác nhận hoàn tất. Vui lòng đợi hoặc kiểm tra lại.
            </p>
            <button 
              className="mt-1 h-10 px-5 rounded-xl border border-border bg-transparent text-muted-foreground hover:text-white hover:bg-white/5 transition-all text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer" 
              onClick={verifyPayment}
            >
              <RotateCw size={14} />
              <span>Kiểm tra lại trạng thái</span>
            </button>
          </div>
        )}

        <div className="w-full border-t border-border/40 pt-6 mt-2">
          {targetType === 'subscription' ? (
            <button 
              className="w-full h-12 rounded-xl bg-primary text-[#0F1115] font-bold text-sm tracking-wide hover:bg-primary/95 transition-all flex items-center justify-center gap-2 cursor-pointer" 
              onClick={() => navigate('/owner/billing')}
            >
              <ArrowLeft size={16} /> 
              <span>Về trang gói dịch vụ</span>
            </button>
          ) : (
            <button 
              className="w-full h-12 rounded-xl bg-primary text-[#0F1115] font-bold text-sm tracking-wide hover:bg-primary/95 transition-all flex items-center justify-center gap-2 cursor-pointer" 
              onClick={() => navigate('/my-bookings')}
            >
              <ArrowLeft size={16} /> 
              <span>Về danh sách đặt bàn</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
