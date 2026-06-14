import React from 'react';

const VoucherStatusBadge = ({ status }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'active':
        return {
          border: '1px solid rgba(163, 190, 140, 0.6)',
          color: 'rgba(163, 190, 140, 1)',
          background: 'rgba(163, 190, 140, 0.08)',
        };
      case 'inactive':
        return {
          border: '1px solid rgba(180, 180, 180, 0.4)',
          color: 'rgba(180, 180, 180, 1)',
          background: 'rgba(180, 180, 180, 0.05)',
        };
      case 'expired':
      case 'disabled':
        return {
          border: '1px solid rgba(200, 114, 114, 0.6)',
          color: 'rgba(200, 114, 114, 1)',
          background: 'rgba(200, 114, 114, 0.08)',
        };
      case 'paused':
        return {
          border: '1px solid rgba(212, 150, 83, 0.6)',
          color: 'var(--color-amber-glow)',
          background: 'rgba(212, 150, 83, 0.08)',
        };
      default:
        return {};
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'active':
        return 'Hoạt động';
      case 'inactive':
        return 'Chờ kích hoạt';
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
    letterSpacing: '0.05em',
    borderRadius: '3px', /* var(--radius-sm) */
    ...getBadgeStyle(),
  };

  return <span style={baseStyle}>{getStatusLabel()}</span>;
};

export default VoucherStatusBadge;
