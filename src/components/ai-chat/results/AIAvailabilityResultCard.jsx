import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Info,
  Users,
  XCircle,
} from 'lucide-react';

const formatCheckedAt = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const getStatusCopy = (payload) => {
  if (payload?.available) {
    return {
      title: 'Còn bàn phù hợp',
      tone: 'success',
      icon: CheckCircle2,
    };
  }

  if (payload?.status === 'invalid_time') {
    return {
      title: 'Khung giờ chưa hợp lệ',
      tone: 'warning',
      icon: Clock3,
    };
  }

  return {
    title: 'Chưa có bàn phù hợp',
    tone: 'danger',
    icon: XCircle,
  };
};

const toneClass = {
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
  danger: 'border-destructive/30 bg-destructive/10 text-destructive',
};

export default function AIAvailabilityResultCard({ payload }) {
  if (!payload) return null;

  const status = getStatusCopy(payload);
  const StatusIcon = status.icon;
  const checkedAt = formatCheckedAt(payload.checkedAt);
  const tables = payload.suggestedTables || [];
  const restaurant = payload.restaurant;

  return (
    <article className="rounded-lg border border-border bg-card p-3 text-left shadow-sm">
      <div className="flex items-start gap-2">
        <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border ${toneClass[status.tone]}`}>
          <StatusIcon size={16} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold text-foreground">{status.title}</h4>
          <p className="mt-0.5 truncate text-xs text-muted-foreground" title={restaurant?.name}>
            {restaurant?.name || 'Nhà hàng BookEat'}
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-md border border-border bg-secondary/50 p-2">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <CalendarClock size={13} aria-hidden="true" />
            Thời gian
          </span>
          <strong className="mt-1 block font-semibold text-foreground">
            {payload.bookingTime} · {payload.bookingDate}
          </strong>
        </div>
        <div className="rounded-md border border-border bg-secondary/50 p-2">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Users size={13} aria-hidden="true" />
            Số khách
          </span>
          <strong className="mt-1 block font-semibold text-foreground">
            {payload.numberOfGuests} người
          </strong>
        </div>
      </div>

      {tables.length > 0 ? (
        <div className="mt-3 space-y-2">
          <p className="text-xs font-medium text-foreground">Bàn gợi ý</p>
          <div className="space-y-1.5">
            {tables.map((table) => (
              <div
                key={`${table.tableNumber}-${table.zone || 'zone'}`}
                className="flex items-center justify-between gap-2 rounded-md border border-border bg-secondary/40 px-2.5 py-2 text-xs"
              >
                <span className="font-semibold text-foreground">Bàn {table.tableNumber}</span>
                <span className="text-muted-foreground">
                  {table.capacity} khách{table.zone ? ` · ${table.zone}` : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-3 rounded-md border border-border bg-secondary/40 p-2.5 text-xs leading-relaxed text-muted-foreground">
          {payload.reason || 'BookEat chưa nhận được bàn gợi ý cho khung giờ này.'}
        </p>
      )}

      {checkedAt && (
        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Clock3 size={12} aria-hidden="true" />
          Kiểm tra lúc {checkedAt}
        </p>
      )}

      <p className="mt-2 flex items-start gap-1.5 border-t border-border pt-2 text-[11px] leading-relaxed text-muted-foreground">
        <Info size={12} className="mt-0.5 shrink-0" aria-hidden="true" />
        <span>{payload.disclaimer || 'Kết quả sẽ được kiểm tra lại khi đặt bàn.'}</span>
      </p>

      {payload.bookingUrl && (
        <Link
          to={payload.bookingUrl}
          className="mt-3 inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Mở trang đặt bàn
          <ArrowRight size={13} aria-hidden="true" />
        </Link>
      )}
    </article>
  );
}
