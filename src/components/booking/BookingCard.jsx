import { Calendar, Clock, Users, ShieldAlert } from 'lucide-react';
import { StatusBadge } from '../bookeat/StatusBadge';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';

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

  // Capitalize status string for matching StatusBadge component mapping keys
  const badgeStatus = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Pending';

  return (
    <Card
      className="overflow-hidden bg-card border-border hover:border-primary/20 transition-all duration-300 flex flex-col sm:flex-row gap-5 p-4 items-start sm:items-center"
      role="article"
      aria-label={`Đặt bàn tại ${restaurant?.name || 'Nhà hàng'} - ${formattedDate} lúc ${bookingTime}`}
    >
      {/* Image Block */}
      <div className="h-24 w-full sm:w-32 rounded-lg bg-secondary overflow-hidden shrink-0 border border-border flex items-center justify-center">
        {restaurant?.primaryImage || restaurant?.logo ? (
          <img src={restaurant.primaryImage || restaurant.logo} alt={restaurant.name} className="h-full w-full object-cover" />
        ) : (
          <span className="text-3xl">🍽️</span>
        )}
      </div>

      {/* Info Block */}
      <div className="flex-1 min-w-0 flex flex-col gap-2 w-full text-left">
        <div className="flex items-center justify-between gap-3 w-full">
          <h3 className="text-base font-bold text-white truncate" style={{ fontFamily: "'Playfair Display', serif" }}>
            {restaurant?.name || 'Nhà hàng'}
          </h3>
          <StatusBadge status={badgeStatus === 'No_show' ? 'No-show' : badgeStatus} />
        </div>

        <p className="text-xs text-muted-foreground truncate leading-relaxed">
          {restaurant?.address}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 min-w-0">
            <Calendar size={14} className="text-primary flex-shrink-0" />
            <span className="truncate">{formattedDate}</span>
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <Clock size={14} className="text-primary flex-shrink-0" />
            <span className="font-bold text-white">{bookingTime}</span>
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <Users size={14} className="text-primary flex-shrink-0" />
            <span>{numberOfGuests} khách</span>
          </div>
          {tableNumbers && tableNumbers.length > 0 && (
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="h-[14px] w-[14px] flex items-center justify-center text-xs">🪑</span>
              <span className="truncate">Bàn: <strong className="text-white font-semibold">{tableNumbers.join(', ')}</strong></span>
            </div>
          )}
          {discountAmount > 0 && (
            <div className="flex items-center gap-1.5 min-w-0 text-emerald-400">
              <ShieldAlert size={14} className="text-emerald-400 flex-shrink-0" />
              <span className="truncate font-semibold">Giảm: {formatCurrency(discountAmount)}</span>
            </div>
          )}
        </div>

        {/* Buttons actions block */}
        <div className="mt-3.5 pt-3 border-t border-border/40 flex items-center gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => onViewDetail(id)}
            className="border-border text-white hover:bg-secondary text-xs font-semibold h-8.5 px-3.5"
            aria-label={`Xem chi tiết đặt bàn tại ${restaurant?.name}`}
          >
            Xem chi tiết
          </Button>
          {canCancel() && (
            <Button
              variant="destructive"
              onClick={() => onCancel(id)}
              className="bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white text-xs font-semibold h-8.5 px-3.5"
              aria-label={`Hủy đặt bàn tại ${restaurant?.name}`}
            >
              Hủy đặt bàn
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
