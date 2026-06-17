import React from 'react';

const VoucherStatusBadge = ({ status }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'active':
        return {
          border: '1px solid var(--color-success)',
          color: 'var(--color-success-text)',
          background: 'var(--color-success-bg)',
        };
      case 'inactive':
      case 'scheduled':
        return {
          border: '1px solid var(--color-warning)',
          color: 'var(--color-warning-text)',
          background: 'var(--color-warning-bg)',
        };
      case 'expired':
      case 'disabled':
        return {
          border: '1px solid var(--color-error)',
          color: 'var(--color-error-text)',
          background: 'var(--color-error-bg)',
        };
      case 'paused':
        return {
          border: '1px solid var(--border-accent)',
          color: 'var(--color-amber-glow)',
          background: 'rgba(212, 150, 83, 0.08)',
        };
      default:
        return {
          border: '1px solid var(--border-subtle)',
          color: 'var(--color-faded-stone)',
          background: 'rgba(216, 203, 184, 0.04)',
        };
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'active':
        return 'Hoạt động';
      case 'inactive':
      case 'scheduled':
        return 'Chờ chạy';
      case 'expired':
        return 'Hết hạn';
      case 'paused':
        return 'Tạm dừng';
      case 'disabled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const baseStyle = {
    display: 'inline-block',
    padding: '4px 8px',
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    borderRadius: 'var(--radius-sm)', /* 3px */
    ...getBadgeStyle(),
  };

  return <span style={baseStyle}>{getStatusLabel()}</span>;
};

export default VoucherStatusBadge;
