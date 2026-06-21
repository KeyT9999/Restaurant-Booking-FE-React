import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowLeft, ExternalLink } from 'lucide-react';
import { checkPaymentStatus } from '../../api/paymentApi';
import './PaymentResult.css';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [verified, setVerified] = useState(false);
  const [targetType, setTargetType] = useState(searchParams.get('targetType') || null);
  const orderCode = searchParams.get('orderCode');

  useEffect(() => {
    if (orderCode) {
      verifyPayment();
    } else {
      setChecking(false);
      setVerified(true);
    }
  }, [orderCode]);

  const verifyPayment = async () => {
    try {
      const res = await checkPaymentStatus(orderCode);
      const payment = res.data;
      setVerified(payment?.status === 'paid');
      // Use targetType from payment record if not in URL params
      if (!targetType && payment?.targetType) {
        setTargetType(payment.targetType);
      }
    } catch (e) {
      setVerified(false);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="payment-result">
      <div className="payment-result__card">
        {checking ? (
          <>
            <div className="payment-result__spinner" />
            <h1 className="payment-result__title">Đang kiểm tra giao dịch...</h1>
            <p className="payment-result__desc">Vui lòng đợi hệ thống xác nhận thanh toán từ cổng PayOS.</p>
          </>
        ) : verified ? (
          <>
            <CheckCircle size={56} className="payment-result__icon payment-result__icon--success" />
            <h1 className="payment-result__title">Thanh toán thành công!</h1>
            <p className="payment-result__desc">
              {targetType === 'subscription'
                ? 'Gói dịch vụ đã được kích hoạt cho nhà hàng của bạn.'
                : 'Đặt cọc thành công. Yêu cầu đặt bàn của bạn đã được xác nhận.'}
            </p>
          </>
        ) : (
          <>
            <div className="payment-result__icon payment-result__icon--pending">⏳</div>
            <h1 className="payment-result__title">Đang chờ xác nhận</h1>
            <p className="payment-result__desc">Thanh toán chưa được xác nhận. Vui lòng đợi hoặc kiểm tra lại.</p>
            <button className="payment-result__btn--outline" onClick={verifyPayment}>
              <ExternalLink size={16} /> Kiểm tra lại trạng thái
            </button>
          </>
        )}

        <div className="payment-result__actions">
          {targetType === 'subscription' ? (
            <button className="payment-result__btn" onClick={() => navigate('/owner/billing')}>
              <ArrowLeft size={16} /> Về trang gói dịch vụ
            </button>
          ) : (
            <button className="payment-result__btn" onClick={() => navigate('/my-bookings')}>
              <ArrowLeft size={16} /> Về danh sách đặt bàn
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
