import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Ban,
  CalendarDays,
  CircleDollarSign,
  ReceiptText,
  RefreshCcw,
  ShieldCheck,
  WalletCards,
} from 'lucide-react';
import {
  adminGetBookingCommissions,
  getOwnerBookingCommissions,
} from '../../api/paymentApi';

const EMPTY_DATA = {
  summary: {},
  items: [],
  pagination: { page: 1, totalPages: 1, total: 0 },
};

const STATUS_META = {
  pending: {
    label: 'Chờ xử lý',
    className: 'border-amber-500/25 bg-amber-500/10 text-amber-300',
  },
  billable: {
    label: 'Có thể tính',
    className: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300',
  },
  waived: {
    label: 'Được miễn',
    className: 'border-blue-500/25 bg-blue-500/10 text-blue-300',
  },
  cancelled: {
    label: 'Đã huỷ',
    className: 'border-rose-500/25 bg-rose-500/10 text-rose-300',
  },
  paid: {
    label: 'Đã thanh toán',
    className: 'border-primary/25 bg-primary/10 text-primary',
  },
};

const formatMoney = (value) => new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
}).format(Number(value) || 0);

const formatDate = (value, includeTime = false) => {
  if (!value) return 'Chưa có';
  return new Date(value).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  });
};

const bookingCode = (value) => {
  const text = String(value || '');
  return text ? `#${text.slice(-8).toUpperCase()}` : 'Chưa có mã';
};

const StatusBadge = ({ status }) => {
  const meta = STATUS_META[status] || {
    label: status || 'Không rõ',
    className: 'border-border bg-secondary/50 text-muted-foreground',
  };
  return (
    <span className={`inline-flex rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${meta.className}`}>
      {meta.label}
    </span>
  );
};

const SummaryItem = ({ icon: Icon, label, value, count, tone }) => (
  <div className="min-w-0 rounded-xl border border-border bg-card px-4 py-4">
    <div className="flex items-start justify-between gap-3">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <Icon size={16} className={tone} aria-hidden="true" />
    </div>
    <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <strong className="text-xl font-bold text-white">{formatMoney(value)}</strong>
      <span className="text-[10px] text-muted-foreground">{count || 0} booking</span>
    </div>
  </div>
);

export default function BookingCommissionPanel({
  mode = 'owner',
  restaurants = [],
  initialRestaurantId = '',
}) {
  const isAdmin = mode === 'admin';
  const [filters, setFilters] = useState({
    restaurantId: initialRestaurantId || '',
    ownerId: '',
    status: '',
    fromDate: '',
    toDate: '',
  });
  const [page, setPage] = useState(1);
  const [data, setData] = useState(EMPTY_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const params = useMemo(() => ({
    ...filters,
    page,
    limit: 12,
  }), [filters, page]);

  const loadCommissions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = isAdmin
        ? await adminGetBookingCommissions(params)
        : await getOwnerBookingCommissions(params);
      setData(response.data || EMPTY_DATA);
    } catch (requestError) {
      setError(requestError.message || 'Không thể tải sổ phí booking.');
    } finally {
      setLoading(false);
    }
  }, [isAdmin, params]);

  useEffect(() => {
    // Remote API synchronization intentionally starts when the filter snapshot changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCommissions();
  }, [loadCommissions]);

  const updateFilter = (key, value) => {
    setPage(1);
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const clearFilters = () => {
    setPage(1);
    setFilters({
      restaurantId: initialRestaurantId || '',
      ownerId: '',
      status: '',
      fromDate: '',
      toDate: '',
    });
  };

  const summary = data.summary || {};
  const counts = summary.counts || {};
  const summaryItems = isAdmin
    ? [
        { label: 'Phí dự kiến', value: summary.projectedCommission, count: (counts.pending || 0) + (counts.billable || 0), icon: CircleDollarSign, tone: 'text-amber-300' },
        { label: 'Có thể tính', value: summary.billableCommission, count: counts.billable, icon: WalletCards, tone: 'text-emerald-300' },
        { label: 'Được miễn', value: summary.waivedCommission, count: counts.waived, icon: ShieldCheck, tone: 'text-blue-300' },
        { label: 'Đã huỷ', value: summary.cancelledCommission, count: counts.cancelled, icon: Ban, tone: 'text-rose-300' },
      ]
    : [
        { label: 'Chờ xử lý', value: summary.totalPending, count: counts.pending, icon: CircleDollarSign, tone: 'text-amber-300' },
        { label: 'Có thể tính', value: summary.totalBillable, count: counts.billable, icon: WalletCards, tone: 'text-emerald-300' },
        { label: 'Được miễn', value: summary.totalWaived, count: counts.waived, icon: ShieldCheck, tone: 'text-blue-300' },
        { label: 'Đã huỷ', value: summary.totalCancelled, count: counts.cancelled, icon: Ban, tone: 'text-rose-300' },
      ];

  return (
    <section className="space-y-5" aria-label="Sổ phí booking">
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-secondary/20 p-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex max-w-3xl gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
            <ReceiptText size={17} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Sổ phí booking</h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Phí booking là phí nền tảng tính cho nhà hàng khi có booking thành công. Gói Pro được miễn phí này. Phần này hiện chỉ ghi nhận, chưa tự động thu tiền.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={loadCommissions}
          disabled={loading}
          className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md border border-border bg-card px-3 text-xs font-semibold text-white transition-colors hover:bg-accent disabled:opacity-50"
        >
          <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} aria-hidden="true" />
          Làm mới
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryItems.map((item) => <SummaryItem key={item.label} {...item} />)}
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="grid gap-3 border-b border-border p-4 sm:grid-cols-2 lg:grid-cols-5">
          {isAdmin ? (
            <>
              <label className="space-y-1.5 text-xs font-semibold text-muted-foreground">
                Chủ nhà hàng
                <input
                  value={filters.ownerId}
                  onChange={(event) => updateFilter('ownerId', event.target.value.trim())}
                  placeholder="Nhập Owner ID"
                  className="h-9 w-full rounded-md border border-input bg-secondary/30 px-3 text-xs font-normal text-white outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                />
              </label>
              <label className="space-y-1.5 text-xs font-semibold text-muted-foreground">
                Nhà hàng
                <input
                  value={filters.restaurantId}
                  onChange={(event) => updateFilter('restaurantId', event.target.value.trim())}
                  placeholder="Nhập Restaurant ID"
                  className="h-9 w-full rounded-md border border-input bg-secondary/30 px-3 text-xs font-normal text-white outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                />
              </label>
            </>
          ) : (
            <label className="space-y-1.5 text-xs font-semibold text-muted-foreground lg:col-span-2">
              Nhà hàng
              <select
                value={filters.restaurantId}
                onChange={(event) => updateFilter('restaurantId', event.target.value)}
                className="h-9 w-full rounded-md border border-input bg-secondary/30 px-3 text-xs font-normal text-white outline-none transition-colors focus:border-primary"
              >
                <option value="">Tất cả nhà hàng</option>
                {restaurants.map((restaurant) => (
                  <option key={restaurant.id || restaurant._id} value={restaurant.id || restaurant._id}>
                    {restaurant.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="space-y-1.5 text-xs font-semibold text-muted-foreground">
            Trạng thái
            <select
              value={filters.status}
              onChange={(event) => updateFilter('status', event.target.value)}
              className="h-9 w-full rounded-md border border-input bg-secondary/30 px-3 text-xs font-normal text-white outline-none transition-colors focus:border-primary"
            >
              <option value="">Tất cả trạng thái</option>
              {Object.entries(STATUS_META).map(([value, meta]) => (
                <option key={value} value={value}>{meta.label}</option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5 text-xs font-semibold text-muted-foreground">
            Từ ngày
            <input
              type="date"
              value={filters.fromDate}
              onChange={(event) => updateFilter('fromDate', event.target.value)}
              className="h-9 w-full rounded-md border border-input bg-secondary/30 px-3 text-xs font-normal text-white outline-none transition-colors focus:border-primary [color-scheme:dark]"
            />
          </label>

          <label className="space-y-1.5 text-xs font-semibold text-muted-foreground">
            Đến ngày
            <input
              type="date"
              value={filters.toDate}
              onChange={(event) => updateFilter('toDate', event.target.value)}
              className="h-9 w-full rounded-md border border-input bg-secondary/30 px-3 text-xs font-normal text-white outline-none transition-colors focus:border-primary [color-scheme:dark]"
            />
          </label>

          <button
            type="button"
            onClick={clearFilters}
            className="self-end text-left text-[11px] font-semibold text-primary hover:text-primary/80 lg:text-right"
          >
            Đặt lại bộ lọc
          </button>
        </div>

        {error ? (
          <div role="alert" className="flex flex-col items-center px-4 py-14 text-center">
            <Ban size={30} className="text-rose-300" aria-hidden="true" />
            <h3 className="mt-3 text-sm font-bold text-white">Không tải được sổ phí</h3>
            <p className="mt-1 max-w-md text-xs text-muted-foreground">{error}</p>
            <button type="button" onClick={loadCommissions} className="mt-4 text-xs font-bold text-primary hover:text-primary/80">
              Thử lại
            </button>
          </div>
        ) : loading ? (
          <div className="space-y-3 p-4" aria-label="Đang tải phí booking">
            {[0, 1, 2, 3].map((row) => (
              <div key={row} className="h-14 animate-pulse rounded-lg bg-secondary/50" />
            ))}
          </div>
        ) : data.items?.length === 0 ? (
          <div className="flex flex-col items-center px-4 py-14 text-center">
            <ReceiptText size={32} className="text-muted-foreground/40" aria-hidden="true" />
            <h3 className="mt-3 text-sm font-bold text-white">Chưa có phí booking</h3>
            <p className="mt-1 max-w-md text-xs leading-5 text-muted-foreground">
              Ledger sẽ xuất hiện sau khi booking được đánh dấu hoàn thành.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[940px] border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-secondary/20 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3">Booking</th>
                    {isAdmin && <th className="px-4 py-3">Chủ nhà hàng</th>}
                    <th className="px-4 py-3">Nhà hàng</th>
                    <th className="px-4 py-3">Ngày dùng bữa</th>
                    <th className="px-4 py-3">Gói</th>
                    <th className="px-4 py-3 text-right">Phí</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Lý do</th>
                    <th className="px-4 py-3">Ngày ghi nhận</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {data.items.map((item) => (
                    <tr key={item.id} className="align-top transition-colors hover:bg-secondary/20">
                      <td className="whitespace-nowrap px-4 py-3 font-mono font-semibold text-white" title={String(item.bookingId)}>{bookingCode(item.bookingId)}</td>
                      {isAdmin && <td className="px-4 py-3 text-white">{item.ownerName || String(item.ownerId || '').slice(-8) || 'Không rõ'}</td>}
                      <td className="px-4 py-3 font-semibold text-white">{item.restaurantName || 'Nhà hàng đã ẩn'}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{formatDate(item.bookingDate)}<br /><span className="text-white">{item.bookingTime || ''}</span></td>
                      <td className="px-4 py-3 uppercase text-white">{item.planCodeAtBooking}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-bold text-white">{formatMoney(item.commissionAmount)}</td>
                      <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                      <td className="max-w-[240px] px-4 py-3 leading-5 text-muted-foreground">{item.reason}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{formatDate(item.createdAt, true)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-border md:hidden">
              {data.items.map((item) => (
                <article key={item.id} className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-mono text-xs font-bold text-white">{bookingCode(item.bookingId)}</p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">{item.restaurantName || 'Nhà hàng đã ẩn'}</p>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-[10px] text-muted-foreground">Ngày dùng bữa</p>
                      <p className="mt-1 text-white">{formatDate(item.bookingDate)} {item.bookingTime || ''}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground">Phí theo gói {item.planCodeAtBooking?.toUpperCase()}</p>
                      <p className="mt-1 font-bold text-white">{formatMoney(item.commissionAmount)}</p>
                    </div>
                  </div>
                  {isAdmin && <p className="text-xs text-muted-foreground">Chủ nhà hàng: <span className="text-white">{item.ownerName || 'Không rõ'}</span></p>}
                  <p className="text-xs leading-5 text-muted-foreground">{item.reason}</p>
                  <p className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><CalendarDays size={12} aria-hidden="true" /> Ghi nhận {formatDate(item.createdAt, true)}</p>
                </article>
              ))}
            </div>
          </>
        )}

        {!loading && !error && data.pagination?.totalPages > 1 && (
          <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3 text-xs">
            <span className="text-muted-foreground">{data.pagination.total} bản ghi</span>
            <div className="flex items-center gap-2">
              <button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} className="h-8 rounded-md border border-border px-3 font-semibold text-white hover:bg-accent disabled:opacity-40">Trước</button>
              <span className="text-muted-foreground">{page}/{data.pagination.totalPages}</span>
              <button type="button" disabled={page >= data.pagination.totalPages} onClick={() => setPage((current) => current + 1)} className="h-8 rounded-md border border-border px-3 font-semibold text-white hover:bg-accent disabled:opacity-40">Sau</button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
