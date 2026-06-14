import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, ArrowLeft } from 'lucide-react';
import './PaymentResult.css';

export default function PaymentCancel() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetType = searchParams.get('targetType');

  return (
    <div className="payment-result">
      <div className="payment-result__card">
        <XCircle size={56} className="payment-result__icon payment-result__icon--cancel" />
        <h1 className="payment-result__title">Giao dịch đã hủy</h1>
        <p className="payment-result__desc">
          Bạn đã hủy giao dịch thanh toán. Không có khoản tiền nào bị trừ.
        </p>
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
