import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertCircle,
  Building2,
  Check,
  CircleDollarSign,
  CreditCard,
  Download,
  FileWarning,
  ReceiptText,
  RefreshCcw,
  ShieldCheck,
  TrendingUp,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  adminExportMonetizationCsv,
  adminGetBookingCommissions,
  adminGetMonetizationPaymentHealth,
  adminGetMonetizationPayments,
  adminGetMonetizationSummary,
  adminGetSettlementReadiness,
  adminGetTopMonetizationOwners,
  adminGetTopMonetizationRestaurants,
} from '../../api/paymentApi';
import {
  adminApproveWithdrawal,
  adminCompleteWithdrawal,
  adminGetWithdrawals,
  adminRejectWithdrawal,
} from '../../api/withdrawalApi';

const EMPTY_PAGINATED = {
  items: [],
  pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
};

const STATUS_META = {
  paid: { label: 'Đã thanh toán', className: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300' },
  pending: { label: 'Chờ thanh toán', className: 'border-amber-500/25 bg-amber-500/10 text-amber-300' },
  processing: { label: 'Đang xử lý', className: 'border-blue-500/25 bg-blue-500/10 text-blue-300' },
  failed: { label: 'Thất bại', className: 'border-rose-500/25 bg-rose-500/10 text-rose-300' },
  cancelled: { label: 'Đã hủy', className: 'border-zinc-500/25 bg-zinc-500/10 text-zinc-300' },
  expired: { label: 'Hết hạn', className: 'border-zinc-500/25 bg-zinc-500/10 text-zinc-300' },
  refunded: { label: 'Hoàn tiền', className: 'border-cyan-500/25 bg-cyan-500/10 text-cyan-300' },
  partially_refunded: { label: 'Hoàn một phần', className: 'border-cyan-500/25 bg-cyan-500/10 text-cyan-300' },
  billable: { label: 'Có thể tính', className: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300' },
  waived: { label: 'Được miễn', className: 'border-cyan-500/25 bg-cyan-500/10 text-cyan-300' },
};

const TARGET_TYPE_LABELS = {
  subscription: 'Subscription',
  featured_restaurant: 'Featured',
  voucher_campaign: 'Voucher campaign',
  booking_fee: 'Phí booking',
  deposit_platform_fee: 'Phí đặt cọc',
  booking: 'Đặt cọc',
};

const CHECK_STATUS_META = {
  ready: { label: 'Sẵn sàng', className: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300' },
  attention: { label: 'Cần xử lý', className: 'border-amber-500/25 bg-amber-500/10 text-amber-300' },
  info: { label: 'Theo dõi', className: 'border-blue-500/25 bg-blue-500/10 text-blue-300' },
};

const formatMoney = (value) => new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
}).format(Number(value) || 0);

const formatDate = (value, includeTime = false) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  });
};

const compactId = (value) => {
  const text = String(value || '');
  return text ? `#${text.slice(-8).toUpperCase()}` : '-';
};

const formatChecklistValue = (item) => {
  if (typeof item.value !== 'number') return item.value;
  return ['payos_paid_revenue', 'booking_commission_billable'].includes(item.key)
    ? formatMoney(item.value)
    : item.value;
};

const cleanParams = (params) => Object.fromEntries(
  Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
);

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

const MetricCard = ({ icon: Icon, label, value, note, tone = 'text-primary' }) => (
  <article className="rounded-xl border border-border bg-card p-4">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-semibold text-muted-foreground">{label}</p>
        <strong className="mt-2 block text-xl font-bold text-white">{value}</strong>
      </div>
      <Icon size={18} className={tone} aria-hidden="true" />
    </div>
    {note && <p className="mt-3 text-[11px] leading-4 text-muted-foreground">{note}</p>}
  </article>
);

const EmptyState = ({ icon: Icon, title, description }) => (
  <div className="flex flex-col items-center px-4 py-12 text-center">
    <Icon size={30} className="text-muted-foreground/40" aria-hidden="true" />
    <h3 className="mt-3 text-sm font-bold text-white">{title}</h3>
    <p className="mt-1 max-w-md text-xs leading-5 text-muted-foreground">{description}</p>
  </div>
);

const SectionHeader = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:items-start sm:justify-between">
    <div className="flex gap-3">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
        <Icon size={17} aria-hidden="true" />
      </div>
      <div>
        <h2 className="text-sm font-bold text-white">{title}</h2>
        {description && <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>}
      </div>
    </div>
    {action}
  </div>
);

export default function AdminRevenue() {
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    targetType: '',
    status: '',
    ownerId: '',
    restaurantId: '',
  });
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [commissionPage, setCommissionPage] = useState(1);
  const [summary, setSummary] = useState(null);
  const [payments, setPayments] = useState(EMPTY_PAGINATED);
  const [commissions, setCommissions] = useState(EMPTY_PAGINATED);
  const [topOwners, setTopOwners] = useState([]);
  const [topRestaurants, setTopRestaurants] = useState([]);
  const [health, setHealth] = useState(null);
  const [settlement, setSettlement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  const [withdrawals, setWithdrawals] = useState([]);
  const [withdrawalLoading, setWithdrawalLoading] = useState(false);
  const [withdrawalStatus, setWithdrawalStatus] = useState('pending');
  const [showModal, setShowModal] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [modalAction, setModalAction] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  const baseParams = useMemo(() => cleanParams(filters), [filters]);

  const loadMonetization = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [
        summaryRes,
        paymentsRes,
        commissionsRes,
        topOwnersRes,
        topRestaurantsRes,
        healthRes,
        settlementRes,
      ] = await Promise.all([
        adminGetMonetizationSummary(baseParams),
        adminGetMonetizationPayments({ ...baseParams, page: paymentsPage, limit: 12 }),
        adminGetBookingCommissions({ ...baseParams, page: commissionPage, limit: 10 }),
        adminGetTopMonetizationOwners({ ...baseParams, limit: 5 }),
        adminGetTopMonetizationRestaurants({ ...baseParams, limit: 5 }),
        adminGetMonetizationPaymentHealth(baseParams),
        adminGetSettlementReadiness(baseParams),
      ]);

      setSummary(summaryRes.data || null);
      setPayments(paymentsRes.data || EMPTY_PAGINATED);
      setCommissions(commissionsRes.data || EMPTY_PAGINATED);
      setTopOwners(topOwnersRes.data || []);
      setTopRestaurants(topRestaurantsRes.data || []);
      setHealth(healthRes.data || null);
      setSettlement(settlementRes.data || null);
    } catch (requestError) {
      setError(requestError.message || 'Không thể tải dashboard monetization.');
    } finally {
      setLoading(false);
    }
  }, [baseParams, commissionPage, paymentsPage]);

  const loadWithdrawals = useCallback(async () => {
    setWithdrawalLoading(true);
    try {
      const params = withdrawalStatus ? { status: withdrawalStatus } : {};
      const response = await adminGetWithdrawals(params);
      setWithdrawals(response.data || []);
    } catch (requestError) {
      console.error(requestError);
    } finally {
      setWithdrawalLoading(false);
    }
  }, [withdrawalStatus]);

  useEffect(() => {
    // Remote API synchronization intentionally starts when monetization filters/pages change.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadMonetization();
  }, [loadMonetization]);

  useEffect(() => {
    // Remote API synchronization intentionally starts when withdrawal status changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadWithdrawals();
  }, [loadWithdrawals]);

  const updateFilter = (key, value) => {
    setPaymentsPage(1);
    setCommissionPage(1);
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const clearFilters = () => {
    setPaymentsPage(1);
    setCommissionPage(1);
    setFilters({
      fromDate: '',
      toDate: '',
      targetType: '',
      status: '',
      ownerId: '',
      restaurantId: '',
    });
  };

  const exportCsv = async () => {
    setExporting(true);
    try {
      const blobResponse = await adminExportMonetizationCsv(baseParams);
      const blob = blobResponse instanceof Blob
        ? blobResponse
        : new Blob([blobResponse], { type: 'text/csv;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'bookeat-monetization-report.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (requestError) {
      setError(requestError.message || 'Không thể xuất CSV.');
    } finally {
      setExporting(false);
    }
  };

  const openWithdrawalModal = (withdrawal, action) => {
    setSelectedWithdrawal(withdrawal);
    setModalAction(action);
    setAdminNote(action === 'approve' ? 'Đã duyệt yêu cầu rút tiền' : action === 'complete' ? 'Đã chuyển tiền hoàn tất' : '');
    setActionError('');
    setShowModal(true);
  };

  const closeWithdrawalModal = () => {
    setShowModal(false);
    setSelectedWithdrawal(null);
    setModalAction('');
    setAdminNote('');
    setActionError('');
  };

  const confirmWithdrawalAction = async () => {
    if (!selectedWithdrawal) return;
    if (modalAction === 'reject' && !adminNote.trim()) {
      setActionError('Lý do từ chối là bắt buộc.');
      return;
    }

    setActionLoading(true);
    setActionError('');
    try {
      if (modalAction === 'approve') {
        await adminApproveWithdrawal(selectedWithdrawal._id, { adminNote });
      }
      if (modalAction === 'reject') {
        await adminRejectWithdrawal(selectedWithdrawal._id, { adminNote });
      }
      if (modalAction === 'complete') {
        await adminCompleteWithdrawal(selectedWithdrawal._id, { adminNote });
      }
      closeWithdrawalModal();
      loadWithdrawals();
    } catch (requestError) {
      setActionError(requestError.message || 'Thao tác thất bại.');
    } finally {
      setActionLoading(false);
    }
  };

  const paidRevenue = summary?.paidRevenue || {};
  const paymentCounts = health?.paymentCounts || summary?.paymentCounts || {};
  const commissionSummary = commissions.summary || {};

  return (
    <AdminLayout
      title="Doanh thu"
      subtitle="Đối soát monetization, payment health và dữ liệu settlement readiness"
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-primary">
              <TrendingUp size={18} aria-hidden="true" />
              <span className="text-xs font-bold uppercase tracking-wide">Monetization Phase 5</span>
            </div>
            <h1 className="mt-2 text-xl font-bold text-white">Dashboard doanh thu Admin</h1>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
              Tách riêng tiền PayOS đã nhận và phí booking dự kiến để sẵn sàng đối soát.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={exportCsv}
              disabled={exporting}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-border bg-card px-3 text-xs font-semibold text-white transition-colors hover:bg-accent disabled:opacity-50"
            >
              <Download size={14} className={exporting ? 'animate-pulse' : ''} aria-hidden="true" />
              Xuất CSV
            </button>
            <button
              type="button"
              onClick={loadMonetization}
              disabled={loading}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-3 text-xs font-bold text-background transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} aria-hidden="true" />
              Làm mới
            </button>
          </div>
        </div>

        <section className="rounded-xl border border-border bg-card">
          <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-6">
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
            <label className="space-y-1.5 text-xs font-semibold text-muted-foreground">
              Dòng tiền
              <select
                value={filters.targetType}
                onChange={(event) => updateFilter('targetType', event.target.value)}
                className="h-9 w-full rounded-md border border-input bg-secondary/30 px-3 text-xs font-normal text-white outline-none transition-colors focus:border-primary"
              >
                <option value="">Tất cả</option>
                {Object.entries(TARGET_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
            <label className="space-y-1.5 text-xs font-semibold text-muted-foreground">
              Trạng thái
              <select
                value={filters.status}
                onChange={(event) => updateFilter('status', event.target.value)}
                className="h-9 w-full rounded-md border border-input bg-secondary/30 px-3 text-xs font-normal text-white outline-none transition-colors focus:border-primary"
              >
                <option value="">Tất cả</option>
                {Object.entries(STATUS_META).map(([value, meta]) => (
                  <option key={value} value={value}>{meta.label}</option>
                ))}
              </select>
            </label>
            <label className="space-y-1.5 text-xs font-semibold text-muted-foreground">
              Owner ID
              <input
                value={filters.ownerId}
                onChange={(event) => updateFilter('ownerId', event.target.value.trim())}
                placeholder="Nhập Owner ID"
                className="h-9 w-full rounded-md border border-input bg-secondary/30 px-3 text-xs font-normal text-white outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
              />
            </label>
            <label className="space-y-1.5 text-xs font-semibold text-muted-foreground">
              Restaurant ID
              <input
                value={filters.restaurantId}
                onChange={(event) => updateFilter('restaurantId', event.target.value.trim())}
                placeholder="Nhập Restaurant ID"
                className="h-9 w-full rounded-md border border-input bg-secondary/30 px-3 text-xs font-normal text-white outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
              />
            </label>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3 text-xs">
            <span className="text-muted-foreground">Paid revenue dùng `paidAt`; phí booking dùng ngày ghi nhận ledger.</span>
            <button type="button" onClick={clearFilters} className="font-bold text-primary hover:text-primary/80">
              Đặt lại bộ lọc
            </button>
          </div>
        </section>

        {error && (
          <div role="alert" className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-bold">Không tải được dữ liệu</p>
              <p className="mt-1 text-xs leading-5">{error}</p>
            </div>
          </div>
        )}

        {loading && !summary ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="h-28 animate-pulse rounded-xl border border-border bg-card" />
            ))}
          </div>
        ) : (
          <>
            <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6">
              <MetricCard
                icon={CircleDollarSign}
                label="Paid Revenue"
                value={formatMoney(paidRevenue.total)}
                note="Tiền PayOS đã nhận"
                tone="text-emerald-300"
              />
              <MetricCard
                icon={CreditCard}
                label="Subscription"
                value={formatMoney(paidRevenue.subscription)}
                note={`${summary?.paidRevenueCounts?.subscription || 0} giao dịch paid`}
                tone="text-blue-300"
              />
              <MetricCard
                icon={TrendingUp}
                label="Featured"
                value={formatMoney(paidRevenue.featuredRestaurant)}
                note={`${summary?.paidRevenueCounts?.featuredRestaurant || 0} giao dịch paid`}
                tone="text-primary"
              />
              <MetricCard
                icon={ReceiptText}
                label="Voucher campaign"
                value={formatMoney(paidRevenue.voucherCampaign)}
                note={`${summary?.paidRevenueCounts?.voucherCampaign || 0} giao dịch paid`}
                tone="text-purple-300"
              />
              <MetricCard
                icon={ShieldCheck}
                label="Projected booking"
                value={formatMoney(summary?.projectedBookingCommission)}
                note="Pending + billable ledger"
                tone="text-amber-300"
              />
              <MetricCard
                icon={Activity}
                label="Total potential"
                value={formatMoney(summary?.totalPotentialRevenue)}
                note="Paid + projected"
                tone="text-white"
              />
            </section>

            <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              <div className="rounded-xl border border-border bg-card xl:col-span-2">
                <SectionHeader
                  icon={Activity}
                  title="Payment health"
                  description="Theo dõi trạng thái payment và các dấu hiệu cần đối soát."
                />
                <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
                  <MetricCard icon={Check} label="Paid" value={paymentCounts.paid || 0} tone="text-emerald-300" />
                  <MetricCard icon={FileWarning} label="Pending quá hạn" value={health?.pendingOverdue?.count || 0} tone="text-amber-300" />
                  <MetricCard icon={X} label="Failed" value={paymentCounts.failed || 0} tone="text-rose-300" />
                  <MetricCard icon={AlertCircle} label="Activation thiếu" value={health?.activationMissing?.count || 0} tone="text-rose-300" />
                </div>
                <div className="grid gap-4 border-t border-border p-4 lg:grid-cols-2">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Pending quá hạn</h3>
                    {health?.pendingOverdue?.items?.length ? (
                      <div className="mt-3 space-y-2">
                        {health.pendingOverdue.items.slice(0, 4).map((item) => (
                          <div key={item.paymentId} className="rounded-lg border border-border bg-secondary/20 p-3 text-xs">
                            <div className="flex items-center justify-between gap-3">
                              <span className="font-mono font-bold text-white">{item.orderCodeMasked}</span>
                              <StatusBadge status={item.status} />
                            </div>
                            <p className="mt-1 text-muted-foreground">{TARGET_TYPE_LABELS[item.targetType] || item.targetType} - {formatMoney(item.amount)}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 text-xs text-muted-foreground">Không có payment pending quá hạn trong bộ lọc.</p>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Activation thiếu</h3>
                    {health?.activationMissing?.items?.length ? (
                      <div className="mt-3 space-y-2">
                        {health.activationMissing.items.slice(0, 4).map((item) => (
                          <div key={item.paymentId} className="rounded-lg border border-border bg-secondary/20 p-3 text-xs">
                            <div className="flex items-center justify-between gap-3">
                              <span className="font-mono font-bold text-white">{compactId(item.paymentId)}</span>
                              <StatusBadge status={item.status} />
                            </div>
                            <p className="mt-1 text-muted-foreground">{TARGET_TYPE_LABELS[item.targetType] || item.targetType} - {formatMoney(item.amount)}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 text-xs text-muted-foreground">Chưa phát hiện payment paid thiếu activation.</p>
                    )}
                  </div>
                </div>
                {health?.technicalDebt?.length ? (
                  <p className="border-t border-border px-4 py-3 text-[11px] leading-5 text-muted-foreground">
                    Technical debt: {health.technicalDebt.join(' ')}
                  </p>
                ) : null}
              </div>

              <div className="rounded-xl border border-border bg-card">
                <SectionHeader
                  icon={ShieldCheck}
                  title="Settlement readiness"
                  description="Checklist dữ liệu trước đối soát kỳ."
                />
                <div className="divide-y divide-border">
                  {(settlement?.checklist || []).map((item) => {
                    const meta = CHECK_STATUS_META[item.status] || CHECK_STATUS_META.info;
                    return (
                      <div key={item.key} className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-bold text-white">{item.label}</p>
                            <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.description}</p>
                          </div>
                          <span className={`shrink-0 rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${meta.className}`}>
                            {meta.label}
                          </span>
                        </div>
                        <p className="mt-2 text-xs font-semibold text-primary">
                          {formatChecklistValue(item)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-border bg-card">
              <SectionHeader
                icon={CreditCard}
                title="Payment transactions"
                description="Danh sách payment an toàn, không expose checkout URL, QR hoặc raw metadata."
              />
              {payments.items?.length ? (
                <>
                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full min-w-[960px] border-collapse text-left text-xs">
                      <thead>
                        <tr className="border-b border-border bg-secondary/20 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                          <th className="px-4 py-3">Payment</th>
                          <th className="px-4 py-3">Owner</th>
                          <th className="px-4 py-3">Nhà hàng</th>
                          <th className="px-4 py-3">Loại</th>
                          <th className="px-4 py-3 text-right">Số tiền</th>
                          <th className="px-4 py-3">Trạng thái</th>
                          <th className="px-4 py-3">Paid at</th>
                          <th className="px-4 py-3">Created</th>
                          <th className="px-4 py-3">Order</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {payments.items.map((item) => (
                          <tr key={item.paymentId} className="align-top transition-colors hover:bg-secondary/20">
                            <td className="px-4 py-3 font-mono font-bold text-white">{compactId(item.paymentId)}</td>
                            <td className="px-4 py-3 text-white">{item.owner?.ownerName || compactId(item.owner?.ownerId)}</td>
                            <td className="px-4 py-3 text-muted-foreground">{item.restaurant?.restaurantName || '-'}</td>
                            <td className="px-4 py-3 text-white">{TARGET_TYPE_LABELS[item.targetType] || item.targetType}</td>
                            <td className="px-4 py-3 text-right font-bold text-white">{formatMoney(item.amount)}</td>
                            <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                            <td className="px-4 py-3 text-muted-foreground">{formatDate(item.paidAt, true)}</td>
                            <td className="px-4 py-3 text-muted-foreground">{formatDate(item.createdAt, true)}</td>
                            <td className="px-4 py-3 font-mono text-muted-foreground">{item.orderCodeMasked || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="divide-y divide-border md:hidden">
                    {payments.items.map((item) => (
                      <article key={item.paymentId} className="space-y-3 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-mono text-xs font-bold text-white">{compactId(item.paymentId)}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{item.owner?.ownerName || 'Không rõ owner'}</p>
                          </div>
                          <StatusBadge status={item.status} />
                        </div>
                        <div className="flex items-center justify-between gap-3 text-xs">
                          <span className="text-muted-foreground">{TARGET_TYPE_LABELS[item.targetType] || item.targetType}</span>
                          <strong className="text-white">{formatMoney(item.amount)}</strong>
                        </div>
                        <p className="text-xs text-muted-foreground">Paid: {formatDate(item.paidAt, true)}</p>
                      </article>
                    ))}
                  </div>
                  {payments.pagination?.totalPages > 1 && (
                    <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3 text-xs">
                      <span className="text-muted-foreground">{payments.pagination.total} payment</span>
                      <div className="flex items-center gap-2">
                        <button type="button" disabled={paymentsPage <= 1} onClick={() => setPaymentsPage((page) => page - 1)} className="h-8 rounded-md border border-border px-3 font-semibold text-white hover:bg-accent disabled:opacity-40">Trước</button>
                        <span className="text-muted-foreground">{paymentsPage}/{payments.pagination.totalPages}</span>
                        <button type="button" disabled={paymentsPage >= payments.pagination.totalPages} onClick={() => setPaymentsPage((page) => page + 1)} className="h-8 rounded-md border border-border px-3 font-semibold text-white hover:bg-accent disabled:opacity-40">Sau</button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <EmptyState icon={CreditCard} title="Chưa có payment phù hợp" description="Thử mở rộng khoảng ngày hoặc bỏ bớt bộ lọc." />
              )}
            </section>

            <section className="rounded-xl border border-border bg-card">
              <SectionHeader
                icon={ReceiptText}
                title="Booking commission ledger"
                description="Khoản projected/billable từ booking hoàn thành, không cộng vào Paid Revenue."
              />
              <div className="grid gap-3 border-b border-border p-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard icon={CircleDollarSign} label="Projected" value={formatMoney(commissionSummary.projectedCommission)} tone="text-amber-300" />
                <MetricCard icon={ShieldCheck} label="Billable" value={formatMoney(commissionSummary.billableCommission)} tone="text-emerald-300" />
                <MetricCard icon={Check} label="Waived" value={formatMoney(commissionSummary.waivedCommission)} tone="text-cyan-300" />
                <MetricCard icon={X} label="Cancelled" value={formatMoney(commissionSummary.cancelledCommission)} tone="text-rose-300" />
              </div>
              {commissions.items?.length ? (
                <>
                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full min-w-[980px] border-collapse text-left text-xs">
                      <thead>
                        <tr className="border-b border-border bg-secondary/20 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                          <th className="px-4 py-3">Ledger</th>
                          <th className="px-4 py-3">Booking</th>
                          <th className="px-4 py-3">Owner</th>
                          <th className="px-4 py-3">Nhà hàng</th>
                          <th className="px-4 py-3">Gói</th>
                          <th className="px-4 py-3 text-right">Phí</th>
                          <th className="px-4 py-3">Trạng thái</th>
                          <th className="px-4 py-3">Billable at</th>
                          <th className="px-4 py-3">Created</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {commissions.items.map((item) => (
                          <tr key={item.ledgerId || item.id} className="align-top transition-colors hover:bg-secondary/20">
                            <td className="px-4 py-3 font-mono font-bold text-white">{compactId(item.ledgerId || item.id)}</td>
                            <td className="px-4 py-3 font-mono text-muted-foreground">{compactId(item.bookingId)}</td>
                            <td className="px-4 py-3 text-white">{item.ownerName || compactId(item.ownerId)}</td>
                            <td className="px-4 py-3 text-muted-foreground">{item.restaurantName || '-'}</td>
                            <td className="px-4 py-3 uppercase text-white">{item.planCodeAtBooking || '-'}</td>
                            <td className="px-4 py-3 text-right font-bold text-white">{formatMoney(item.commissionAmount)}</td>
                            <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                            <td className="px-4 py-3 text-muted-foreground">{formatDate(item.billableAt, true)}</td>
                            <td className="px-4 py-3 text-muted-foreground">{formatDate(item.createdAt, true)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="divide-y divide-border md:hidden">
                    {commissions.items.map((item) => (
                      <article key={item.ledgerId || item.id} className="space-y-3 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-mono text-xs font-bold text-white">{compactId(item.bookingId)}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{item.restaurantName || 'Nhà hàng đã ẩn'}</p>
                          </div>
                          <StatusBadge status={item.status} />
                        </div>
                        <div className="flex items-center justify-between gap-3 text-xs">
                          <span className="uppercase text-muted-foreground">Gói {item.planCodeAtBooking || '-'}</span>
                          <strong className="text-white">{formatMoney(item.commissionAmount)}</strong>
                        </div>
                        <p className="text-xs text-muted-foreground">Ghi nhận: {formatDate(item.createdAt, true)}</p>
                      </article>
                    ))}
                  </div>
                  {commissions.pagination?.totalPages > 1 && (
                    <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3 text-xs">
                      <span className="text-muted-foreground">{commissions.pagination.total} ledger</span>
                      <div className="flex items-center gap-2">
                        <button type="button" disabled={commissionPage <= 1} onClick={() => setCommissionPage((page) => page - 1)} className="h-8 rounded-md border border-border px-3 font-semibold text-white hover:bg-accent disabled:opacity-40">Trước</button>
                        <span className="text-muted-foreground">{commissionPage}/{commissions.pagination.totalPages}</span>
                        <button type="button" disabled={commissionPage >= commissions.pagination.totalPages} onClick={() => setCommissionPage((page) => page + 1)} className="h-8 rounded-md border border-border px-3 font-semibold text-white hover:bg-accent disabled:opacity-40">Sau</button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <EmptyState icon={ReceiptText} title="Chưa có ledger phù hợp" description="Ledger xuất hiện khi booking được đánh dấu hoàn thành." />
              )}
            </section>

            <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <div className="rounded-xl border border-border bg-card">
                <SectionHeader icon={Users} title="Top owners" description="Xếp hạng theo paid revenue và projected commission." />
                <RankingTable rows={topOwners} type="owner" />
              </div>
              <div className="rounded-xl border border-border bg-card">
                <SectionHeader icon={Building2} title="Top restaurants" description="Tách rõ doanh thu đã nhận và phí booking dự kiến." />
                <RankingTable rows={topRestaurants} type="restaurant" />
              </div>
            </section>
          </>
        )}

        <section className="rounded-xl border border-border bg-card">
          <SectionHeader
            icon={Wallet}
            title="Yêu cầu rút tiền hiện hữu"
            description="Giữ workflow cũ ở đây, Phase 5 không thêm payout logic mới."
            action={(
              <div className="flex rounded-lg border border-border bg-secondary/30 p-1">
                {['pending', 'approved', 'completed', 'rejected', ''].map((status) => {
                  const label = status === 'pending' ? 'Chờ duyệt'
                    : status === 'approved' ? 'Đã duyệt'
                      : status === 'completed' ? 'Hoàn tất'
                        : status === 'rejected' ? 'Từ chối'
                          : 'Tất cả';
                  return (
                    <button
                      key={status || 'all'}
                      type="button"
                      onClick={() => setWithdrawalStatus(status)}
                      className={`rounded-md px-2.5 py-1 text-[10px] font-bold transition-colors ${
                        withdrawalStatus === status
                          ? 'bg-primary text-background'
                          : 'text-muted-foreground hover:text-white'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            )}
          />
          {withdrawalLoading ? (
            <div className="space-y-3 p-4">
              {[0, 1, 2].map((item) => <div key={item} className="h-14 animate-pulse rounded-lg bg-secondary/50" />)}
            </div>
          ) : withdrawals.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-secondary/20 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3">Nhà hàng</th>
                    <th className="px-4 py-3">Owner</th>
                    <th className="px-4 py-3 text-right">Số tiền</th>
                    <th className="px-4 py-3">Tài khoản nhận</th>
                    <th className="px-4 py-3 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {withdrawals.map((item) => (
                    <tr key={item._id} className="align-top transition-colors hover:bg-secondary/20">
                      <td className="px-4 py-3 font-bold text-white">{item.restaurantId?.name || 'Nhà hàng ẩn'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{item.ownerId?.fullName || '-'}</td>
                      <td className="px-4 py-3 text-right font-bold text-white">{formatMoney(item.amount)}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        <span className="block text-white">{item.bankInfo?.bankName || '-'}</span>
                        <span className="font-mono">{item.bankInfo?.accountNumber || '-'}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {item.status === 'pending' && (
                          <div className="flex justify-center gap-2">
                            <button type="button" onClick={() => openWithdrawalModal(item, 'approve')} className="rounded-md border border-emerald-500/25 bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-300 hover:bg-emerald-500/20">Duyệt</button>
                            <button type="button" onClick={() => openWithdrawalModal(item, 'reject')} className="rounded-md border border-rose-500/25 bg-rose-500/10 px-2 py-1 text-[10px] font-bold text-rose-300 hover:bg-rose-500/20">Từ chối</button>
                          </div>
                        )}
                        {item.status === 'approved' && (
                          <button type="button" onClick={() => openWithdrawalModal(item, 'complete')} className="rounded-md border border-blue-500/25 bg-blue-500/10 px-2 py-1 text-[10px] font-bold text-blue-300 hover:bg-blue-500/20">Hoàn tất</button>
                        )}
                        {item.status === 'completed' && (
                          <span className="rounded-md border border-blue-500/25 bg-blue-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-300">
                            Hoàn tất
                          </span>
                        )}
                        {item.status === 'rejected' && (
                          <span className="rounded-md border border-zinc-500/25 bg-zinc-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-zinc-300">
                            Từ chối
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState icon={Wallet} title="Không có yêu cầu rút tiền" description="Không có bản ghi phù hợp với trạng thái đang chọn." />
          )}
        </section>
      </div>

      {showModal && selectedWithdrawal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 p-4" onClick={closeWithdrawalModal}>
          <div className="w-full max-w-[440px] rounded-xl border border-border bg-card p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Wallet size={18} className="text-primary" aria-hidden="true" />
              <h3 className="text-sm font-bold text-white">
                {modalAction === 'approve' ? 'Duyệt yêu cầu rút tiền' : modalAction === 'reject' ? 'Từ chối yêu cầu rút tiền' : 'Hoàn tất rút tiền'}
              </h3>
            </div>
            {actionError && (
              <div role="alert" className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                <AlertCircle size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
                <span>{actionError}</span>
              </div>
            )}
            <div className="mt-4 rounded-lg border border-border bg-secondary/20 p-4 text-xs">
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Nhà hàng</span>
                <span className="font-bold text-white">{selectedWithdrawal.restaurantId?.name || '-'}</span>
              </div>
              <div className="mt-2 flex justify-between gap-3">
                <span className="text-muted-foreground">Số tiền</span>
                <span className="font-bold text-primary">{formatMoney(selectedWithdrawal.amount)}</span>
              </div>
            </div>
            <label className="mt-4 block space-y-1.5 text-xs font-semibold text-muted-foreground">
              {modalAction === 'reject' ? 'Lý do từ chối *' : 'Ghi chú cho owner'}
              <textarea
                value={adminNote}
                onChange={(event) => setAdminNote(event.target.value)}
                rows={3}
                className="w-full resize-none rounded-md border border-input bg-secondary/30 p-3 text-xs font-normal text-white outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                placeholder={modalAction === 'reject' ? 'Nhập lý do từ chối' : 'Nhập ghi chú'}
              />
            </label>
            <div className="mt-5 flex justify-end gap-2 border-t border-border pt-4">
              <button type="button" onClick={closeWithdrawalModal} className="h-9 rounded-md border border-border px-4 text-xs font-semibold text-white hover:bg-accent">
                Hủy
              </button>
              <button
                type="button"
                onClick={confirmWithdrawalAction}
                disabled={actionLoading}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 text-xs font-bold text-background hover:bg-primary/90 disabled:opacity-50"
              >
                {actionLoading && <RefreshCcw size={13} className="animate-spin" aria-hidden="true" />}
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

const RankingTable = ({ rows, type }) => {
  if (!rows?.length) {
    return (
      <EmptyState
        icon={type === 'owner' ? Users : Building2}
        title={type === 'owner' ? 'Chưa có owner phù hợp' : 'Chưa có nhà hàng phù hợp'}
        description="Dữ liệu sẽ xuất hiện khi có payment paid hoặc booking commission trong bộ lọc."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[620px] border-collapse text-left text-xs">
        <thead>
          <tr className="border-b border-border bg-secondary/20 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
            <th className="px-4 py-3">{type === 'owner' ? 'Owner' : 'Nhà hàng'}</th>
            <th className="px-4 py-3 text-right">Paid</th>
            <th className="px-4 py-3 text-right">Projected</th>
            <th className="px-4 py-3 text-right">Potential</th>
            <th className="px-4 py-3 text-right">Payments</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {rows.map((item) => {
            const id = type === 'owner' ? item.ownerId : item.restaurantId;
            const name = type === 'owner' ? item.ownerName : item.restaurantName;
            return (
              <tr key={String(id)} className="transition-colors hover:bg-secondary/20">
                <td className="px-4 py-3">
                  <p className="font-bold text-white">{name || compactId(id)}</p>
                  <p className="mt-1 font-mono text-[10px] text-muted-foreground">{compactId(id)}</p>
                </td>
                <td className="px-4 py-3 text-right font-bold text-white">{formatMoney(item.paidRevenue)}</td>
                <td className="px-4 py-3 text-right text-muted-foreground">{formatMoney(item.projectedCommission)}</td>
                <td className="px-4 py-3 text-right font-bold text-primary">{formatMoney(item.totalPotentialRevenue)}</td>
                <td className="px-4 py-3 text-right text-muted-foreground">{item.paymentCount || 0}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
