import {
  Banknote,
  CalendarClock,
  CheckCircle2,
  Clock3,
  MessageSquareText,
  ReceiptText,
  Search,
  ShieldCheck,
  Star,
  Table2,
  TicketPercent,
  Users,
} from 'lucide-react';

const formatCurrency = (value) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '0 đ';
  return `${value.toLocaleString('vi-VN')} đ`;
};

const formatDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const formatRange = (from, to) => {
  if (!from && !to) return 'Hôm nay';
  if (from === to) return formatDate(from);
  return `${formatDate(from) || from} - ${formatDate(to) || to}`;
};

const getStatusLabel = (status) => ({
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  completed: 'Hoàn tất',
  cancelled: 'Đã hủy',
  no_show: 'Không đến',
}[status] || status || 'Chưa rõ');

const CardShell = ({
  icon: Icon,
  title,
  subtitle,
  sourceLabel,
  children,
}) => (
  <article className="max-w-full overflow-hidden rounded-lg border border-border bg-card p-3 text-left shadow-sm">
    <div className="flex items-start gap-2">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon size={16} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <h4 className="break-words text-sm font-semibold text-foreground">{title}</h4>
        {subtitle && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground" title={subtitle}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
    <div className="mt-3 space-y-3">{children}</div>
    <p className="mt-3 flex items-center gap-1.5 border-t border-border pt-2 text-[11px] text-muted-foreground">
      <ShieldCheck size={12} className="shrink-0 text-primary" aria-hidden="true" />
      <span className="min-w-0 break-words">{sourceLabel || 'BookEat owner data'}</span>
    </p>
  </article>
);

const Metric = ({ label, value, icon: Icon }) => (
  <div className="min-w-0 rounded-md border border-border bg-secondary/50 p-2 text-xs">
    <span className="flex items-center gap-1.5 text-muted-foreground">
      {Icon ? <Icon size={13} className="shrink-0" aria-hidden="true" /> : null}
      <span className="min-w-0 truncate">{label}</span>
    </span>
    <strong className="mt-1 block break-words font-semibold text-foreground">{value}</strong>
  </div>
);

const BookingRow = ({ booking, compact = false }) => (
  <li className="min-w-0 rounded-md border border-border bg-secondary/40 px-2.5 py-2 text-xs">
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <p className="font-semibold text-foreground">
          {booking.time || '--:--'}{booking.date && !compact ? ` · ${formatDate(booking.date) || booking.date}` : ''}
        </p>
        <p className="mt-0.5 break-words text-muted-foreground">
          {booking.customerLabel || 'Khách'} · {booking.guestCount || 0} khách
        </p>
      </div>
      <span className="shrink-0 rounded-md border border-border bg-card px-1.5 py-0.5 text-[10px] text-muted-foreground">
        {getStatusLabel(booking.status)}
      </span>
    </div>
    {Array.isArray(booking.tableNumbers) && booking.tableNumbers.length > 0 && (
      <p className="mt-1.5 break-words text-[11px] text-muted-foreground">
        Bàn {booking.tableNumbers.join(', ')}
      </p>
    )}
  </li>
);

export function AIOwnerBookingSummaryCard({ payload }) {
  if (!payload) return null;
  const upcoming = Array.isArray(payload.upcoming) ? payload.upcoming : [];
  const byStatus = payload.byStatus || {};

  return (
    <CardShell
      icon={CalendarClock}
      title="Tóm tắt booking"
      subtitle={`${payload.restaurant?.name || 'Nhà hàng'} · ${payload.date || 'Hôm nay'}`}
      sourceLabel={payload.sourceLabel}
    >
      <div className="grid grid-cols-2 gap-2">
        <Metric label="Tổng booking" value={payload.total ?? upcoming.length} icon={ReceiptText} />
        <Metric label="Đã xác nhận" value={byStatus.confirmed || 0} icon={CheckCircle2} />
        <Metric label="Chờ xử lý" value={byStatus.pending || 0} icon={Clock3} />
        <Metric label="Đã hủy" value={(byStatus.cancelled || 0) + (byStatus.no_show || 0)} icon={Users} />
      </div>

      {upcoming.length > 0 ? (
        <ul className="space-y-1.5">
          {upcoming.map((booking) => (
            <BookingRow key={booking.bookingId} booking={booking} compact />
          ))}
        </ul>
      ) : (
        <p className="rounded-md border border-border bg-secondary/40 p-2.5 text-xs text-muted-foreground">
          Chưa có booking phù hợp trong phạm vi này.
        </p>
      )}
    </CardShell>
  );
}

export function AIOwnerTableAvailabilityCard({ payload }) {
  if (!payload) return null;
  const tables = Array.isArray(payload.availableTables) ? payload.availableTables : [];

  return (
    <CardShell
      icon={Table2}
      title="Bàn trống"
      subtitle={`${payload.restaurant?.name || 'Nhà hàng'} · ${payload.bookingTime || '--:--'} · ${payload.bookingDate || 'Hôm nay'}`}
      sourceLabel={payload.sourceLabel}
    >
      <div className="grid grid-cols-2 gap-2">
        <Metric label="Bàn trống" value={payload.availableCount ?? tables.length} icon={CheckCircle2} />
        <Metric label="Đang bận" value={payload.occupiedCount ?? 0} icon={Clock3} />
      </div>

      {tables.length > 0 ? (
        <ul className="grid grid-cols-1 gap-1.5">
          {tables.map((table) => (
            <li
              key={`${table.tableNumber}-${table.zone || 'zone'}`}
              className="flex min-w-0 items-center justify-between gap-2 rounded-md border border-border bg-secondary/40 px-2.5 py-2 text-xs"
            >
              <span className="min-w-0 break-words font-semibold text-foreground">Bàn {table.tableNumber}</span>
              <span className="shrink-0 text-muted-foreground">
                {table.capacity} khách{table.zone ? ` · ${table.zone}` : ''}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-md border border-border bg-secondary/40 p-2.5 text-xs text-muted-foreground">
          Chưa có bàn trống phù hợp với khung giờ này.
        </p>
      )}
    </CardShell>
  );
}

export function AIOwnerRevenueSummaryCard({ payload }) {
  if (!payload) return null;

  return (
    <CardShell
      icon={Banknote}
      title="Tóm tắt doanh thu"
      subtitle={`${payload.restaurant?.name || 'Nhà hàng'} · ${formatRange(payload.dateFrom, payload.dateTo)}`}
      sourceLabel={payload.sourceLabel}
    >
      <div className="grid grid-cols-2 gap-2">
        <Metric label="Gross" value={formatCurrency(payload.grossRevenue)} icon={Banknote} />
        <Metric label="Net" value={formatCurrency(payload.netRevenue)} icon={ReceiptText} />
        <Metric label="Booking có cọc" value={payload.bookingCount ?? 0} icon={CalendarClock} />
        <Metric label="Tiền tệ" value={payload.currency || 'VND'} icon={ShieldCheck} />
      </div>
    </CardShell>
  );
}

export function AIOwnerVoucherSummaryCard({ payload }) {
  if (!payload) return null;

  return (
    <CardShell
      icon={TicketPercent}
      title="Tóm tắt voucher"
      subtitle={payload.restaurant?.name || 'Nhà hàng'}
      sourceLabel={payload.sourceLabel}
    >
      <div className="grid grid-cols-2 gap-2">
        <Metric label="Đang active" value={payload.activeCount ?? 0} icon={CheckCircle2} />
        <Metric label="Hết hạn" value={payload.expiredCount ?? 0} icon={Clock3} />
        <Metric label="Lượt dùng" value={payload.usageCount ?? 0} icon={TicketPercent} />
        <Metric label="Giảm ước tính" value={formatCurrency(payload.estimatedDiscountTotal)} icon={ReceiptText} />
      </div>
    </CardShell>
  );
}

export function AIOwnerReviewSummaryCard({ payload }) {
  if (!payload) return null;
  const reviews = Array.isArray(payload.latestReviews) ? payload.latestReviews : [];

  return (
    <CardShell
      icon={Star}
      title="Tóm tắt review"
      subtitle={payload.restaurant?.name || 'Nhà hàng'}
      sourceLabel={payload.sourceLabel}
    >
      <div className="grid grid-cols-2 gap-2">
        <Metric label="Điểm trung bình" value={Number(payload.averageRating || 0).toFixed(1)} icon={Star} />
        <Metric label="Số review" value={payload.reviewCount ?? reviews.length} icon={MessageSquareText} />
      </div>

      {reviews.length > 0 ? (
        <ul className="space-y-1.5">
          {reviews.map((review) => (
            <li key={review.reviewId} className="rounded-md border border-border bg-secondary/40 p-2.5 text-xs">
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="font-semibold text-foreground">{review.rating || 0}/5 sao</span>
                <span className="shrink-0 text-[11px] text-muted-foreground">{formatDate(review.createdAt)}</span>
              </div>
              <p className="break-words leading-relaxed text-muted-foreground">{review.content}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-md border border-border bg-secondary/40 p-2.5 text-xs text-muted-foreground">
          Chưa có review phù hợp trong phạm vi này.
        </p>
      )}
    </CardShell>
  );
}

export function AIOwnerBookingSearchCard({ payload }) {
  if (!payload) return null;
  const bookings = Array.isArray(payload.bookings) ? payload.bookings : [];

  return (
    <CardShell
      icon={Search}
      title="Kết quả tìm booking"
      subtitle={`${payload.restaurant?.name || 'Nhà hàng'} · ${payload.query || 'Bộ lọc hiện tại'}`}
      sourceLabel={payload.sourceLabel}
    >
      <Metric label="Kết quả" value={payload.total ?? bookings.length} icon={Search} />
      {bookings.length > 0 ? (
        <ul className="space-y-1.5">
          {bookings.map((booking) => (
            <BookingRow key={booking.bookingId} booking={booking} />
          ))}
        </ul>
      ) : (
        <p className="rounded-md border border-border bg-secondary/40 p-2.5 text-xs text-muted-foreground">
          Không tìm thấy booking phù hợp.
        </p>
      )}
    </CardShell>
  );
}

export function AIOwnerReviewReplySuggestionCard({ payload }) {
  if (!payload) return null;

  return (
    <CardShell
      icon={MessageSquareText}
      title="Bản nháp trả lời review"
      subtitle={payload.tone || 'warm_professional'}
      sourceLabel={payload.sourceLabel}
    >
      <p className="whitespace-pre-wrap break-words rounded-md border border-border bg-secondary/40 p-2.5 text-xs leading-relaxed text-foreground">
        {payload.draftReply}
      </p>
      <p className="rounded-md border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs leading-relaxed text-amber-100">
        {payload.disclaimer || 'Đây chỉ là bản nháp, chưa được gửi.'}
      </p>
    </CardShell>
  );
}
