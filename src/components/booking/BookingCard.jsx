import { Calendar, Clock, Users, ShieldAlert } from 'lucide-react';
import StatusBadge from './StatusBadge';
import './BookingCard.css';

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '0đ';
  return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
};

export default function BookingCard({ booking, onViewDetail, onCancel }) {
  const {
    id,
    bookingDate,
    bookingTime,
    numberOfGuests,
    tableNumbers,
    status,
    restaurant,
    discountAmount,
  } = booking;

  const formattedDate = new Date(bookingDate).toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const canCancel = () => {
    const now = new Date();
    const bDate = new Date(bookingDate);
    const [h, m] = bookingTime.split(':').map(Number);
    bDate.setHours(h, m, 0, 0);
    return ['pending', 'confirmed'].includes(status) && bDate > now;
  };

  return (
    <div
      className="booking-card"
      role="article"
      aria-label={`Đặt bàn tại ${restaurant?.name || 'Nhà hàng'} - ${formattedDate} lúc ${bookingTime}`}
      tabIndex={0}
    >
      <div className="booking-card-image" aria-hidden="true">
        {restaurant?.primaryImage || restaurant?.logo ? (
          <img src={restaurant.primaryImage || restaurant.logo} alt={restaurant.name} />
        ) : (
          <div className="booking-card-placeholder">🍽️</div>
        )}
      </div>

      <div className="booking-card-content">
        <div className="booking-card-header">
          <h3 className="restaurant-name">{restaurant?.name || 'Nhà hàng'}</h3>
          <StatusBadge status={status} />
        </div>

        <p className="restaurant-address">{restaurant?.address?.fullAddress || `${restaurant?.address?.street}, ${restaurant?.address?.ward}, ${restaurant?.address?.district}, ${restaurant?.address?.city}`}</p>

        <div className="booking-details-grid">
          <div className="detail-item">
            <Calendar size={16} className="detail-icon" aria-hidden="true" />
            <span>{formattedDate}</span>
          </div>
          <div className="detail-item">
            <Clock size={16} className="detail-icon" aria-hidden="true" />
            <span>{bookingTime}</span>
          </div>
          <div className="detail-item">
            <Users size={16} className="detail-icon" aria-hidden="true" />
            <span>{numberOfGuests} khách</span>
          </div>
          {tableNumbers && tableNumbers.length > 0 && (
            <div className="detail-item">
              <ShieldAlert size={16} className="detail-icon text-blue" aria-hidden="true" />
              <span>Bàn: <strong>{tableNumbers.join(', ')}</strong></span>
            </div>
          )}
          {discountAmount > 0 && (
            <div className="detail-item">
              <ShieldAlert size={16} className="detail-icon text-blue" aria-hidden="true" />
              <span>Giảm giá: <strong>{formatCurrency(discountAmount)}</strong></span>
            </div>
          )}
        </div>

        <div className="booking-card-actions">
          <button
            className="btn btn-outline"
            onClick={() => onViewDetail(id)}
            aria-label={`Xem chi tiết đặt bàn tại ${restaurant?.name}`}
          >
            Xem chi tiết
          </button>
          {canCancel() && (
            <button
              className="btn btn-danger"
              onClick={() => onCancel(id)}
              aria-label={`Hủy đặt bàn tại ${restaurant?.name}`}
            >
              Hủy đặt bàn
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
