import React from 'react';
import { Store, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import './RestaurantStatsCards.css';

export default function RestaurantStatsCards({ stats }) {
  const {
    totalRestaurants = 0,
    pendingRestaurants = 0,
    approvedRestaurants = 0,
    suspendedRestaurants = 0,
  } = stats || {};

  const cardData = [
    {
      title: 'Tổng nhà hàng',
      value: totalRestaurants,
      icon: <Store size={20} />,
      className: 'card-total',
    },
    {
      title: 'Chờ duyệt',
      value: pendingRestaurants,
      icon: <Clock size={20} />,
      className: 'card-pending',
    },
    {
      title: 'Đang hoạt động',
      value: approvedRestaurants,
      icon: <CheckCircle2 size={20} />,
      className: 'card-approved',
    },
    {
      title: 'Bị tạm ngưng',
      value: suspendedRestaurants,
      icon: <AlertTriangle size={20} />,
      className: 'card-suspended',
    },
  ];

  return (
    <div className="restaurant-stats-grid">
      {cardData.map((card, idx) => (
        <div key={idx} className={`stat-card ${card.className}`}>
          <div className="stat-card-header">
            <span className="stat-card-title">{card.title}</span>
            <div className="stat-card-icon">{card.icon}</div>
          </div>
          <div className="stat-card-value">{card.value}</div>
        </div>
      ))}
    </div>
  );
}
