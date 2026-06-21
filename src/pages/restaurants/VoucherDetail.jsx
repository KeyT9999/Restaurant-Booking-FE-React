import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getVoucherById, saveVoucher, unsaveVoucher } from '../../api/voucherApi';
import './VoucherDetail.css';

export default function VoucherDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const loadVoucher = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getVoucherById(id);
      if (res?.success) {
        setVoucher(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Không thể tải thông tin chi tiết voucher');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVoucher();
  }, [id]);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleCopyCode = () => {
    if (!voucher) return;
    navigator.clipboard.writeText(voucher.code);
    showToast('📋 Đã copy mã giảm giá vào bộ nhớ tạm!');
  };

  const handleSaveToggle = async () => {
    if (!voucher) return;
    try {
      if (voucher.isSaved) {
        await unsaveVoucher(voucher._id);
        showToast('🎟️ Đã bỏ lưu voucher khỏi ví.');
        setVoucher(prev => ({ ...prev, isSaved: false }));
      } else {
        await saveVoucher({ voucherId: voucher._id });
        showToast('🎟️ Đã lưu voucher vào ví thành công!');
        setVoucher(prev => ({ ...prev, isSaved: true }));
      }
    } catch (err) {
      showToast(`❌ Lỗi: ${err.response?.data?.message || err.message || 'Thao tác thất bại'}`);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  if (loading) {
    return (
      <div className="voucher-detail-loading">
        <div className="gold-spinner"></div>
        <p>Đang tải thông tin chi tiết...</p>
      </div>
    );
  }

  if (error || !voucher) {
    return (
      <div className="voucher-detail-error">
        <h2>Lỗi Tải Thông Tin</h2>
        <p>{error || 'Voucher không tồn tại hoặc đã bị vô hiệu hóa'}</p>
        <button onClick={() => navigate(-1)} className="back-btn">Quay lại</button>
      </div>
    );
  }

  return (
    <div className="voucher-detail-page">
      {toastMessage && (
        <div className="voucher-toast-notification">
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="voucher-detail-container">
        <button onClick={() => navigate(-1)} className="back-link">
          ← Quay lại danh sách
        </button>

        <div className="voucher-detail-ticket-layout">
          {/* Main Ticket Header */}
          <div className="ticket-header">
            <span className="ticket-badge">{voucher.type.toUpperCase()} VOUCHER</span>
            <h1 className="ticket-title">{voucher.name}</h1>
            <p className="ticket-subtitle">{voucher.description || 'Ưu đãi đặt bàn đặc biệt từ BookEat.'}</p>
          </div>

          {/* Ticket Details Panel */}
          <div className="ticket-body">
            <div className="ticket-discount-info">
              <div className="discount-value">
                {voucher.discountType === 'percentage' 
                  ? `${voucher.discountValue}%` 
                  : formatCurrency(voucher.discountValue)}
              </div>
              <span className="discount-label">GIẢM GIÁ</span>
            </div>

            <div className="ticket-code-panel">
              <div className="code-box" onClick={handleCopyCode}>
                <span className="code-text">{voucher.code}</span>
                <span className="copy-icon">📋</span>
              </div>
              <p className="code-help-text">Click vào mã để copy nhanh</p>
            </div>

            <div className="ticket-actions">
              <button 
                className={`ticket-btn ${voucher.isSaved ? 'unsave-btn' : 'save-btn'}`}
                onClick={handleSaveToggle}
              >
                {voucher.isSaved ? 'Bỏ Lưu Ví' : 'Lưu Vào Ví'}
              </button>
              
              {voucher.restaurantId && (
                <button 
                  className="ticket-btn use-now-btn"
                  onClick={() => navigate(`/restaurants/${voucher.restaurantId._id || voucher.restaurantId}`)}
                >
                  Đặt Bàn Ngay
                </button>
              )}
            </div>
          </div>

          <div className="ticket-stub-divider">
            <div className="stub-circle circle-left"></div>
            <div className="stub-line"></div>
            <div className="stub-circle circle-right"></div>
          </div>

          {/* Detailed Terms and Scope */}
          <div className="ticket-footer">
            <h3>Điều Khoản & Điều Kiện Sử Dụng</h3>
            <ul className="terms-list">
              <li>
                <strong>Giá trị đặt bàn tối thiểu:</strong> {formatCurrency(voucher.minOrderAmount)}
              </li>
              {voucher.discountType === 'percentage' && voucher.maxDiscountAmount && (
                <li>
                  <strong>Giảm giá tối đa:</strong> {formatCurrency(voucher.maxDiscountAmount)}
                </li>
              )}
              <li>
                <strong>Thời gian áp dụng:</strong> Từ {new Date(voucher.startDate).toLocaleDateString('vi-VN')} đến {voucher.endDate ? new Date(voucher.endDate).toLocaleDateString('vi-VN') : 'Khi có thông báo kết thúc'}
              </li>
              <li>
                <strong>Giới hạn mỗi khách hàng:</strong> Tối đa {voucher.perCustomerLimit} lượt sử dụng
              </li>
              <li>
                <strong>Đối tượng áp dụng:</strong> Nhóm khách hàng {voucher.customerSegments.join(', ')}
              </li>
              
              {/* Scope limits */}
              {voucher.applicableRestaurants && voucher.applicableRestaurants.length > 0 && (
                <li>
                  <strong>Giới hạn nhà hàng:</strong> Chỉ áp dụng tại các chi nhánh chỉ định
                </li>
              )}
              {voucher.applicableCities && voucher.applicableCities.length > 0 && (
                <li>
                  <strong>Khu vực áp dụng:</strong> {voucher.applicableCities.join(', ')}
                </li>
              )}
              {voucher.applicableCategories && voucher.applicableCategories.length > 0 && (
                <li>
                  <strong>Danh mục ẩm thực:</strong> {voucher.applicableCategories.join(', ')}
                </li>
              )}
              <li>
                <strong>Tính chất:</strong> {voucher.stackable ? 'Được dùng kết hợp với các mã khác' : 'Không áp dụng cùng các mã giảm giá khác'}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
