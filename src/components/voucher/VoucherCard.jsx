import React from 'react';
import './VoucherCard.css';

const VoucherCard = ({ voucher, onAction, actionText, disabled, isSaved }) => {
  const {
    code,
    description,
    discountType,
    discountValue,
    minOrderAmount,
    maxDiscountAmount,
    endDate,
  } = voucher;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Không giới hạn';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  return (
    <div className={`voucher-card ${isSaved ? 'saved' : ''} ${disabled ? 'disabled' : ''}`}>
      {/* Khuyết răng cưa trái */}
      <div className="ticket-cutout cutout-top"></div>
      <div className="ticket-cutout cutout-bottom"></div>

      {/* Phần trái: Chi tiết ưu đãi */}
      <div className="voucher-details">
        <div className="voucher-value-badge">
          {discountType === 'percentage' ? `${discountValue}% OFF` : formatCurrency(discountValue)}
        </div>
        <div className="voucher-code-display">{code}</div>
        {description && <p className="voucher-description-text">{description}</p>}
        
        <div className="voucher-limits">
          <span>Đơn tối thiểu: {formatCurrency(minOrderAmount)}</span>
          {discountType === 'percentage' && maxDiscountAmount && (
            <span>Giảm tối đa: {formatCurrency(maxDiscountAmount)}</span>
          )}
        </div>

        <div className="voucher-expiry">
          Hạn dùng: {formatDate(endDate)}
        </div>
      </div>

      {/* Đường phân tách đứt nét */}
      <div className="voucher-divider"></div>

      {/* Phần phải: Nút hành động */}
      <div className="voucher-action-section">
        {onAction ? (
          <button
            className={`voucher-btn ${isSaved ? 'btn-saved' : 'btn-claim'}`}
            onClick={() => !disabled && !isSaved && onAction(voucher)}
            disabled={disabled || isSaved}
            aria-label={`Mã giảm giá ${code}, ${discountType === 'percentage' ? `${discountValue}%` : formatCurrency(discountValue)}`}
          >
            {isSaved ? 'Đã lưu' : actionText || 'Lưu mã'}
          </button>
        ) : (
          <div className="voucher-badge-only">Ưu đãi</div>
        )}
      </div>
    </div>
  );
};

export default VoucherCard;
