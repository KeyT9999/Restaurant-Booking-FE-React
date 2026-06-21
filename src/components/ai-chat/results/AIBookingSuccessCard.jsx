import { Link } from 'react-router-dom';
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  ListChecks,
  Users,
} from 'lucide-react';
import { Button } from '../../ui/button';

const formatBookingDate = (value) => {
  if (!value) return 'Chưa có ngày';
  const date = new Date(`${value}T00:00:00+07:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Asia/Bangkok',
  });
};

function SuccessDetail({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <Icon size={14} className="shrink-0 text-primary" aria-hidden="true" />
      <span className="text-muted-foreground">
        {label}: <strong className="font-medium text-foreground">{value}</strong>
      </span>
    </div>
  );
}

export default function AIBookingSuccessCard({ booking, restaurantName }) {
  if (!booking?.id) return null;

  return (
    <article className="overflow-hidden rounded-xl border border-emerald-500/30 bg-card text-left shadow-lg">
      <div className="flex items-start gap-3 border-b border-emerald-500/20 bg-emerald-500/8 px-4 py-3.5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-300">
          <CheckCircle2 size={21} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-300">
            Đã tạo booking
          </p>
          <h4 className="mt-0.5 truncate text-sm font-semibold text-foreground">
            {restaurantName || 'Nhà hàng BookEat'}
          </h4>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Mã booking: <span className="font-mono text-foreground">{booking.id}</span>
          </p>
        </div>
      </div>

      <div className="space-y-3 px-4 py-3.5">
        <div className="grid grid-cols-2 gap-x-3 gap-y-2">
          <SuccessDetail
            icon={CalendarDays}
            label="Ngày"
            value={formatBookingDate(booking.bookingDate)}
          />
          <SuccessDetail icon={Clock3} label="Giờ" value={booking.bookingTime || 'Chưa có'} />
          <SuccessDetail
            icon={Users}
            label="Số khách"
            value={`${booking.numberOfGuests || 0} người`}
          />
          <SuccessDetail icon={ListChecks} label="Trạng thái" value="Chờ nhà hàng xác nhận" />
        </div>

        <p className="rounded-lg border border-border bg-secondary/50 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
          Booking đã xuất hiện trong danh sách của bạn. BookEat chưa tạo thanh toán trong bước này.
        </p>

        <div className="grid grid-cols-2 gap-2">
          <Button asChild size="sm">
            <Link to={`/bookings/${booking.id}`}>Xem booking</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link to="/my-bookings">My Bookings</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
