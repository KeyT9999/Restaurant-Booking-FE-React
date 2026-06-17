import React, { useState, useEffect } from 'react';
import { getMyVouchers, validateVoucherForBooking } from '../../api/voucherApi';
import VoucherCard from '../voucher/VoucherCard';
import './ApplyVoucher.css';

const ApplyVoucher = ({ restaurantId, bookingAmount, onApplySuccess, onRemove }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [appliedVoucher, setAppliedVoucher] = useState(null);

  const [walletVouchers, setWalletVouchers] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [fetchingWallet, setFetchingWallet] = useState(false);

  // Tải danh sách ví voucher chưa sử dụng của khách hàng
  const fetchWallet = async () => {
    setFetchingWallet(true);
    try {
      const response = await getMyVouchers({ filter: 'unused' });
      if (response?.success) {
        // Lọc các voucher hợp lệ với nhà hàng hiện tại (của riêng nhà hàng này HOẶC Global)
        const validVouchers = (response.data || []).filter(item => {
          const v = item.voucherId;
          return v && (!v.restaurantId || v.restaurantId._id === restaurantId || v.restaurantId === restaurantId);
        });
        setWalletVouchers(validVouchers);
      }
    } catch (err) {
      console.error('Không thể tải ví voucher:', err.message);
    } finally {
      setFetchingWallet(false);
    }
  };

  useEffect(() => {
    if (isDrawerOpen) {
      fetchWallet();
    }
  }, [isDrawerOpen, restaurantId]);

  const handleApply = async (voucherCode) => {
    const codeToApply = (voucherCode || code).trim().toUpperCase();
    if (!codeToApply) return;

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const response = await validateVoucherForBooking({
        code: codeToApply,
        restaurantId,
        orderAmount: bookingAmount,
      });

      if (response?.valid) {
        const { discountAmount, voucher } = response;
        setAppliedVoucher(voucher);
        setSuccessMsg(`Áp dụng thành công! Bạn được giảm ${discountAmount.toLocaleString('vi-VN')} ₫`);
        setCode(codeToApply);
        onApplySuccess({ voucherCode: codeToApply, discountAmount });
        setIsDrawerOpen(false);
      } else {
        setError(response?.reason || 'Mã giảm giá không hợp lệ');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi áp dụng mã');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setAppliedVoucher(null);
    setCode('');
    setSuccessMsg(null);
    setError(null);
    onRemove();
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <div className="apply-voucher-container">
      <label className="apply-voucher-label">Mã ưu đãi / Khuyến mại</label>
      
      {!appliedVoucher ? (
        <div className="apply-voucher-input-wrapper">
          <input
            type="text"
            className={`apply-voucher-input ${error ? 'input-error' : ''}`}
            placeholder="Nhập mã ưu đãi (Ví dụ: SUMMER50)"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError(null);
            }}
            disabled={loading}
          />
          <button
            type="button"
            className="apply-voucher-btn-apply"
            onClick={() => handleApply()}
            disabled={loading || !code.trim()}
          >
            {loading ? '...' : 'Áp dụng'}
          </button>
          
          <button
            type="button"
            className="apply-voucher-btn-wallet"
            onClick={() => setIsDrawerOpen(true)}
          >
            Chọn từ ví
          </button>
        </div>
      ) : (
        <div className="apply-voucher-success-box">
          <div className="success-content">
            <span className="success-tag">{appliedVoucher.code}</span>
            <span className="success-desc">
              {appliedVoucher.discountType === 'percentage'
                ? `Giảm ${appliedVoucher.discountValue}%`
                : `Giảm ${formatCurrency(appliedVoucher.discountValue)}`}
            </span>
          </div>
          <button type="button" className="success-remove-btn" onClick={handleRemove}>
            Gỡ bỏ
          </button>
        </div>
      )}

      {error && <div className="apply-voucher-error">{error}</div>}
      {successMsg && <div className="apply-voucher-success-text">{successMsg}</div>}

      {/* Drawer Ví Voucher */}
      {isDrawerOpen && (
        <div className="wallet-drawer-overlay" onClick={() => setIsDrawerOpen(false)}>
          <div className="wallet-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="wallet-drawer-header">
              <h4>Ví Voucher Ưu đãi</h4>
              <button className="wallet-drawer-close" onClick={() => setIsDrawerOpen(false)}>
                &times;
              </button>
            </div>
            
            <div className="wallet-drawer-body">
              {fetchingWallet ? (
                <div className="wallet-loading">Đang tải ví voucher...</div>
              ) : walletVouchers.length === 0 ? (
                <div className="wallet-empty">
                  Bạn chưa lưu voucher nào khả dụng cho nhà hàng này. Hãy lưu thêm voucher ngoài trang chủ nhà hàng nhé!
                </div>
              ) : (
                <div className="wallet-list">
                  {walletVouchers.map((item) => (
                    <div key={item._id} className="wallet-item">
                      <VoucherCard
                        voucher={item.voucherId}
                        onAction={(v) => handleApply(v.code)}
                        actionText="Dùng ngay"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplyVoucher;
