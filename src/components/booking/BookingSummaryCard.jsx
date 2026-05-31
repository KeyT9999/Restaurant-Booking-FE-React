import { Store, Calendar, Clock, Users, Tag, MessageSquare, Landmark } from 'lucide-react';
import './BookingSummaryCard.css';

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '0đ';
  return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
};

const occasionMap = {
  birthday: '🎂 Sinh nhật',
  anniversary: '💍 Kỷ niệm',
  business: '💼 Công việc',
  date: '💑 Hẹn hò',
  family: '👨‍👩‍👧‍👦 Gia đình',
  other: '🎯 Khác',
};

export default function BookingSummaryCard({ bookingData, restaurant, selectedTables = [] }) {
  const {
    bookingDate,
    bookingTime,
    numberOfGuests,
    customerName,
    customerPhone,
    customerEmail,
    specialRequests,
    occasion,
    voucherCode,
    discountAmount = 0,
  } = bookingData;

  const formattedDate = bookingDate
    ? new Date(bookingDate).toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  // Calculate total deposit amount if tables have individual deposit policies
  const totalDeposit = selectedTables.reduce((sum, t) => sum + (t.depositAmount || 0), 0);

  return (
    <div className="booking-summary-card">
      <div className="summary-section-title">
        <h4>📋 Tóm tắt chi tiết đặt bàn</h4>
      </div>

      <div className="summary-body">
        {/* Restaurant Section */}
        <div className="summary-item">
          <Store size={18} className="summary-icon" />
          <div className="summary-text">
            <span className="summary-label">Nhà hàng</span>
            <span className="summary-val font-bold">{restaurant?.name || 'Nhà hàng'}</span>
            <span className="summary-subtext">
              {restaurant?.address?.fullAddress || `${restaurant?.address?.street}, ${restaurant?.address?.ward}, ${restaurant?.address?.district}, ${restaurant?.address?.city}`}
            </span>
          </div>
        </div>

        {/* Date Section */}
        <div className="summary-item">
          <Calendar size={18} className="summary-icon" />
          <div className="summary-text">
            <span className="summary-label">Ngày đặt bàn</span>
            <span className="summary-val">{formattedDate}</span>
          </div>
        </div>

        {/* Time Section */}
        <div className="summary-item">
          <Clock size={18} className="summary-icon" />
          <div className="summary-text">
            <span className="summary-label">Giờ đặt bàn</span>
            <span className="summary-val font-bold text-amber">{bookingTime}</span>
          </div>
        </div>

        {/* Guests Section */}
        <div className="summary-item">
          <Users size={18} className="summary-icon" />
          <div className="summary-text">
            <span className="summary-label">Số lượng khách</span>
            <span className="summary-val">{numberOfGuests} người</span>
          </div>
        </div>

        {/* Tables Section */}
        {selectedTables.length > 0 && (
          <div className="summary-item">
            <span className="summary-icon-char">🪑</span>
            <div className="summary-text">
              <span className="summary-label">Bàn đã chọn</span>
              <span className="summary-val text-blue font-semibold">
                {selectedTables.map(t => `${t.tableNumber} (${t.capacity} chỗ)`).join(', ')}
              </span>
            </div>
          </div>
        )}

        <hr className="summary-divider" />

        {/* Customer Contact */}
        <div className="contact-summary">
          <h5>👤 Thông tin liên hệ</h5>
          <div className="contact-summary-grid">
            <div><span className="contact-label">Họ tên:</span> <span className="contact-val">{customerName}</span></div>
            <div><span className="contact-label">Số ĐT:</span> <span className="contact-val">{customerPhone}</span></div>
            <div><span className="contact-label">Email:</span> <span className="contact-val">{customerEmail}</span></div>
          </div>
        </div>

        <hr className="summary-divider" />

        {/* Additional information */}
        {occasion && (
          <div className="summary-item small-item">
            <Tag size={16} className="summary-icon" />
            <div className="summary-text horizontal">
              <span className="summary-label">Dịp đặc biệt:</span>
              <span className="summary-val font-medium">{occasionMap[occasion] || occasion}</span>
            </div>
          </div>
        )}

        {specialRequests && (
          <div className="summary-item small-item">
            <MessageSquare size={16} className="summary-icon" />
            <div className="summary-text">
              <span className="summary-label">Yêu cầu đặc biệt:</span>
              <span className="summary-val italic">"{specialRequests}"</span>
            </div>
          </div>
        )}

        {voucherCode && (
          <div className="summary-item small-item">
            <Tag size={16} className="summary-icon text-green" />
            <div className="summary-text horizontal">
              <span className="summary-label">Khuyến mãi ({voucherCode}):</span>
              <span className="summary-val text-green font-bold">-{formatCurrency(discountAmount)}</span>
            </div>
          </div>
        )}

        <div className="summary-item small-item last-item">
          <Landmark size={16} className="summary-icon text-amber" />
          <div className="summary-text horizontal">
            <span className="summary-label">Yêu cầu đặt cọc:</span>
            <span className="summary-val font-bold">
              {totalDeposit > 0 ? formatCurrency(totalDeposit) : '0đ (Miễn phí đặt bàn)'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
