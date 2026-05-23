import React from 'react';
import './RestaurantStatusBadge.css';

const RestaurantStatusBadge = ({ status, size = 'md' }) => {
  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Chờ duyệt';
      case 'approved':
        return 'Hoạt động';
      case 'rejected':
        return 'Từ chối';
      case 'suspended':
        return 'Tạm ngưng';
      case 'deleted':
        return 'Đã xóa';
      default:
        return status;
    }
  };

  const statusClass = `badge-${status || 'pending'}`;
  const sizeClass = `badge-size-${size}`;

  return (
    <span className={`restaurant-status-badge ${statusClass} ${sizeClass}`}>
      {getStatusText(status)}
    </span>
  );
};

export default RestaurantStatusBadge;
