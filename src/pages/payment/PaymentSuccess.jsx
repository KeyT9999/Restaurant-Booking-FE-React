import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock, Loader2, RotateCw, XCircle } from 'lucide-react';
import { checkPaymentStatus } from '../../api/paymentApi';

const OWNER_TARGET_TYPES = ['subscription', 'featured_restaurant', 'voucher_campaign'];
const TERMINAL_FAILURE_STATUSES = new Set(['failed', 'cancelled', 'expired', 'refunded', 'partially_refunded']);

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderCode = searchParams.get('orderCode');

  const [checking, setChecking] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [targetType, setTargetType] = useState(searchParams.get('targetType') || null);
  const isMountedRef = useRef(true);

  const isOwnerMonetization = OWNER_TARGET_TYPES.includes(targetType);

  const verifyPayment = useCallback(async () => {
    if (!orderCode) {
      if (!isMountedRef.current) return;
      setPaymentStatus('missing_order_code');
      setChecking(false);
      return;
    }

    if (isMountedRef.current) {
      setChecking(true);
    }

    try {
      const res = await checkPaymentStatus(orderCode);
      const payment = res.data;

      if (!isMountedRef.current) return;

      setPaymentStatus(payment?.status || 'pending');
      if (payment?.targetType) {
        setTargetType((current) => current || payment.targetType);
      }
    } catch {
      if (!isMountedRef.current) return;
      setPaymentStatus('pending');
    } finally {
      if (isMountedRef.current) {
        setChecking(false);
      }
    }
  }, [orderCode]);

  useEffect(() => {
    isMountedRef.current = true;
    const timeoutId = window.setTimeout(() => {
      void verifyPayment();
    }, 0);

    return () => {
      isMountedRef.current = false;
      window.clearTimeout(timeoutId);
    };
  }, [verifyPayment]);

  const isPaid = paymentStatus === 'paid';
  const isFailed = TERMINAL_FAILURE_STATUSES.has(paymentStatus);

  const getSuccessMessage = () => {
    if (targetType === 'subscription') {
      return 'Thanh toán đã được xác nhận. Gói dịch vụ chỉ được kích hoạt khi backend hoặc webhook PayOS đối soát hợp lệ.';
    }

    if (targetType === 'featured_restaurant') {
      return 'Thanh toán đã được xác nhận. Featured placement chỉ được kích hoạt khi backend hoặc webhook PayOS đối soát hợp lệ.';
    }

    if (targetType === 'voucher_campaign') {
      return 'Thanh toán đã được xác nhận. Voucher campaign chỉ được kích hoạt khi backend hoặc webhook PayOS đối soát hợp lệ.';
    }

    return 'Đặt cọc thành công. Yêu cầu đặt bàn của bạn đã được hệ thống xác nhận.';
  };

  const getFailureHeading = () => {
    if (paymentStatus === 'expired') return 'Giao dịch đã hết hạn';
    if (paymentStatus === 'cancelled') return 'Giao dịch đã bị hủy';
    return 'Thanh toán chưa thành công';
  };

  const getFailureMessage = () => {
    if (paymentStatus === 'expired') {
      return 'Phiên thanh toán đã hết hạn trước khi hoàn tất. Vui lòng tạo lại giao dịch mới nếu bạn vẫn muốn tiếp tục.';
    }

    if (paymentStatus === 'cancelled') {
      return 'Giao dịch đã bị hủy và hệ thống không ghi nhận thanh toán thành công.';
    }

    return 'Hệ thống chưa ghi nhận thanh toán thành công cho giao dịch này. Vui lòng kiểm tra lại trong lịch sử thanh toán.';
  };

  const getPendingMessage = () => {
    if (paymentStatus === 'missing_order_code') {
      return 'Không tìm thấy mã giao dịch trên đường dẫn. Hệ thống sẽ không xác nhận thành công chỉ dựa trên return URL.';
    }

    return 'Thanh toán chưa được xác nhận hoàn tất. Vui lòng đợi hoặc kiểm tra lại.';
  };

  const getStatusLabel = () => {
    if (paymentStatus === 'paid') return 'Đã thanh toán';
    if (paymentStatus === 'expired') return 'Đã hết hạn';
    if (paymentStatus === 'cancelled') return 'Đã hủy';
    if (paymentStatus === 'failed') return 'Thất bại';
    if (paymentStatus === 'refunded') return 'Đã hoàn tiền';
    if (paymentStatus === 'partially_refunded') return 'Hoàn tiền một phần';
    if (paymentStatus === 'missing_order_code') return 'Thiếu mã giao dịch';
    return 'Chờ xác nhận';
  };

  return (
    <div className="min-h-screen w-full bg-[#0F1115] relative flex items-center justify-center p-4 overflow-hidden before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_center,rgba(212,150,83,0.06)_0%,transparent_70%)]">
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
        ) : isPaid ? (
          <div className="flex flex-col items-center gap-4 py-2">
            <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle size={36} />
            </div>
            <h1 className="font-serif text-2xl text-white font-bold tracking-tight">Thanh toán thành công!</h1>
            <p className="text-xs text-muted-foreground max-w-[320px] leading-relaxed">
              {getSuccessMessage()}
            </p>
            <span className="text-[11px] uppercase tracking-[0.18em] text-emerald-400/80">
              Trạng thái: {getStatusLabel()}
            </span>
          </div>
        ) : isFailed ? (
          <div className="flex flex-col items-center gap-4 py-2">
            <div className="h-16 w-16 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive">
              <XCircle size={36} />
            </div>
            <h1 className="font-serif text-2xl text-white font-bold tracking-tight">{getFailureHeading()}</h1>
            <p className="text-xs text-muted-foreground max-w-[320px] leading-relaxed">
              {getFailureMessage()}
            </p>
            <span className="text-[11px] uppercase tracking-[0.18em] text-destructive/80">
              Trạng thái: {getStatusLabel()}
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-2">
            <div className="h-16 w-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Clock size={36} />
            </div>
            <h1 className="font-serif text-2xl text-white font-bold tracking-tight">Đang chờ xác nhận</h1>
            <p className="text-xs text-muted-foreground max-w-[320px] leading-relaxed">
              {getPendingMessage()}
            </p>
            <span className="text-[11px] uppercase tracking-[0.18em] text-amber-400/80">
              Trạng thái: {getStatusLabel()}
            </span>
            {orderCode && (
              <button
                className="mt-1 h-10 px-5 rounded-xl border border-border bg-transparent text-muted-foreground hover:text-white hover:bg-white/5 transition-all text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                onClick={() => verifyPayment()}
              >
                <RotateCw size={14} />
                <span>Kiểm tra lại trạng thái</span>
              </button>
            )}
          </div>
        )}

        <div className="w-full border-t border-border/40 pt-6 mt-2">
          {isOwnerMonetization ? (
            <button
              className="w-full h-12 rounded-xl bg-primary text-[#0F1115] font-bold text-sm tracking-wide hover:bg-primary/95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              onClick={() => navigate('/owner/billing')}
            >
              <ArrowLeft size={16} />
              <span>Về trang tài chính owner</span>
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
