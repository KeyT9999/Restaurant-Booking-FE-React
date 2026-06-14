import { CalendarDays, Clock, Users, Utensils, ConciergeBell } from 'lucide-react';
import WaitlistStatusBadge from './WaitlistStatusBadge';
import './WaitlistCard.css';

const formatDate = (dateValue) => {
  if (!dateValue) return 'Chua chon ngay';
  return new Date(dateValue).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export default function WaitlistCard({ waitlist, onView, onCancel }) {
  const restaurantName = waitlist.restaurant?.name || waitlist.restaurantId?.name || 'Nha hang';
  const dishesCount = waitlist.dishes?.reduce((sum, item) => sum + Number(item.quantity || 1), 0) || 0;
  const servicesCount = waitlist.services?.reduce((sum, item) => sum + Number(item.quantity || 1), 0) || 0;

  return (
    <article className="waitlist-card">
      <div className="waitlist-card__top">
        <div>
          <h3>{restaurantName}</h3>
          <p>Ma yeu cau #{String(waitlist.id || '').slice(-6).toUpperCase()}</p>
        </div>
        <WaitlistStatusBadge status={waitlist.status} />
      </div>

      <div className="waitlist-card__meta">
        <span><CalendarDays size={16} /> {formatDate(waitlist.preferredDate)}</span>
        <span><Clock size={16} /> {waitlist.preferredTime || '--:--'}</span>
        <span><Users size={16} /> {waitlist.numberOfGuests} khach</span>
      </div>

      <div className="waitlist-card__extras">
        <span><Utensils size={15} /> {dishesCount} mon chon truoc</span>
        <span><ConciergeBell size={15} /> {servicesCount} dich vu</span>
      </div>

      {waitlist.status === 'pending' && (
        <p className="waitlist-card__queue">
          Vi tri du kien: {waitlist.queuePositionSnapshot || 'dang tinh'} · Cho khoang {waitlist.estimatedWaitMinutes || 0} phut
        </p>
      )}

      <div className="waitlist-card__actions">
        <button type="button" className="btn-soft" onClick={() => onView?.(waitlist)}>
          Xem chi tiet
        </button>
        {waitlist.status === 'pending' && (
          <button type="button" className="btn-danger-soft" onClick={() => onCancel?.(waitlist)}>
            Huy yeu cau
          </button>
        )}
      </div>
    </article>
  );
}
