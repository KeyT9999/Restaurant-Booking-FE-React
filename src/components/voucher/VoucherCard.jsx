import React from 'react';
import './VoucherCard.css';

const VoucherCard = ({ voucher, onAction, actionText, disabled, isSaved, context = 'default' }) => {
  const {
    code,
    name,
    description,
    discountType,
    discountValue,
    minOrderAmount,
    maxDiscountAmount,
    endDate,
  } = voucher;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Không giới hạn';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  // Determine button state and text
  const isApplyAction = actionText === 'Dùng ngay' || actionText === 'Áp dụng' || context === 'booking';
  const showButton = !!onAction;
  
  // Custom tooltip message describing voucher benefits/rules
  const tooltipText = `Mã: ${code} - Giảm ${
    discountType === 'percentage' ? `${discountValue}%` : formatCurrency(discountValue)
  }${minOrderAmount ? ` cho đơn từ ${formatCurrency(minOrderAmount)}` : ''}`;

  return (
    <div 
      className={`voucher-card ${isSaved ? 'saved' : ''} ${disabled ? 'disabled' : ''}`}
      data-tooltip={tooltipText}
    >
      {/* Cutouts on the division line */}
      <div className="ticket-cutout cutout-top"></div>
      <div className="ticket-cutout cutout-bottom"></div>

      {/* Left section: Details */}
      <div className="voucher-details">
        <div className="voucher-header-info">
          <span className="voucher-label-eyebrow">ƯU ĐÃI KHÁCH HÀNG</span>
          <div className="voucher-value-badge">
            {discountType === 'percentage' ? `${discountValue}% OFF` : formatCurrency(discountValue)}
          </div>
        </div>
        <div className="voucher-code-display">{code}</div>
        <h4 className="voucher-name-display">{name}</h4>
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

      {/* Dashed divider */}
      <div className="voucher-divider"></div>

      {/* Right section: Action */}
      <div className="voucher-action-section">
        {showButton ? (
          <button
            className={`voucher-btn ${isSaved && !isApplyAction ? 'btn-saved' : 'btn-claim'}`}
            onClick={() => !disabled && (!isSaved || isApplyAction) && onAction(voucher)}
            disabled={disabled || (isSaved && !isApplyAction)}
            aria-label={`Mã giảm giá ${code}, ${discountType === 'percentage' ? `${discountValue}%` : formatCurrency(discountValue)}`}
          >
            {isSaved && !isApplyAction ? 'Đã lưu' : actionText || 'Lưu mã'}
          </button>
        ) : (
          <div className="voucher-badge-only">Ưu đãi</div>
        )}
      </div>
    </div>
  );
};

export default VoucherCard;
