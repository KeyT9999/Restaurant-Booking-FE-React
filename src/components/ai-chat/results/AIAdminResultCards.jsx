import {
  AlertTriangle,
  Banknote,
  Building2,
  CheckCircle2,
  MessageSquareText,
  ReceiptText,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

const formatCurrency = (value) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '0 d';
  return `${value.toLocaleString('vi-VN')} d`;
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
  if (!from && !to) return 'Recent window';
  if (from === to) return formatDate(from) || from;
  return `${formatDate(from) || from} - ${formatDate(to) || to}`;
};

const getStatusLabel = (status) => ({
  pending: 'Pending',
  requested: 'Requested',
  approved: 'Approved',
  rejected: 'Rejected',
  processing: 'Processing',
  paid: 'Paid',
  failed: 'Failed',
  cancelled: 'Cancelled',
  expired: 'Expired',
  refunded: 'Refunded',
  partially_refunded: 'Partial refund',
}[status] || status || 'Unknown');

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
      <span className="min-w-0 break-words">{sourceLabel || 'BookEat admin data'}</span>
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

export function AIAdminPendingRestaurantsCard({ payload }) {
  if (!payload) return null;
  const restaurants = Array.isArray(payload.restaurants) ? payload.restaurants : [];

  return (
    <CardShell
      icon={Building2}
      title="Pending restaurants"
      subtitle={`${payload.total ?? restaurants.length} waiting for review`}
      sourceLabel={payload.sourceLabel}
    >
      {restaurants.length > 0 ? (
        <ul className="space-y-1.5">
          {restaurants.map((restaurant) => (
            <li
              key={restaurant.restaurantId}
              className="min-w-0 rounded-md border border-border bg-secondary/40 px-2.5 py-2 text-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="break-words font-semibold text-foreground">{restaurant.name}</p>
                  <p className="mt-0.5 text-muted-foreground">
                    {restaurant.ownerLabel || 'Owner'} - {formatDate(restaurant.submittedAt) || 'No date'}
                  </p>
                </div>
                <span className="shrink-0 rounded-md border border-border bg-card px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  {getStatusLabel(restaurant.status || restaurant.approvalStatus)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-md border border-border bg-secondary/40 p-2.5 text-xs text-muted-foreground">
          No pending restaurants in this query.
        </p>
      )}
    </CardShell>
  );
}

export function AIAdminTransactionSummaryCard({ payload }) {
  if (!payload) return null;
  const byStatus = payload.byStatus || {};

  return (
    <CardShell
      icon={ReceiptText}
      title="Transaction summary"
      subtitle={formatRange(payload.dateFrom, payload.dateTo)}
      sourceLabel={payload.sourceLabel}
    >
      <div className="grid grid-cols-2 gap-2">
        <Metric label="Transactions" value={payload.totalTransactions ?? 0} icon={ReceiptText} />
        <Metric label="Total amount" value={formatCurrency(payload.totalAmount)} icon={Banknote} />
        <Metric label="Paid" value={byStatus.paid || 0} icon={CheckCircle2} />
        <Metric label="Failed" value={(byStatus.failed || 0) + (byStatus.cancelled || 0) + (byStatus.expired || 0)} icon={AlertTriangle} />
      </div>
    </CardShell>
  );
}

export function AIAdminRefundSummaryCard({ payload }) {
  if (!payload) return null;
  const refunds = Array.isArray(payload.items)
    ? payload.items
    : Array.isArray(payload.refunds) ? payload.refunds : [];

  return (
    <CardShell
      icon={ReceiptText}
      title="Refund summary"
      subtitle={formatRange(payload.dateFrom, payload.dateTo)}
      sourceLabel={payload.sourceLabel}
    >
      <div className="grid grid-cols-2 gap-2">
        <Metric label="Refunds" value={payload.totalRefunds ?? refunds.length} icon={ReceiptText} />
        <Metric label="Amount" value={formatCurrency(payload.totalAmount)} icon={Banknote} />
      </div>

      {refunds.length > 0 ? (
        <ul className="space-y-1.5">
          {refunds.map((refund) => (
            <li key={refund.refundId} className="rounded-md border border-border bg-secondary/40 p-2.5 text-xs">
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-foreground">{formatCurrency(refund.amount)}</span>
                <span className="shrink-0 rounded-md border border-border bg-card px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  {getStatusLabel(refund.status)}
                </span>
              </div>
              {refund.reason && (
                <p className="mt-1.5 break-words leading-relaxed text-muted-foreground">{refund.reason}</p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-md border border-border bg-secondary/40 p-2.5 text-xs text-muted-foreground">
          No refunds in this query.
        </p>
      )}
    </CardShell>
  );
}

export function AIAdminRevenueSummaryCard({ payload }) {
  if (!payload) return null;

  return (
    <CardShell
      icon={TrendingUp}
      title="Revenue summary"
      subtitle={formatRange(payload.dateFrom, payload.dateTo)}
      sourceLabel={payload.sourceLabel}
    >
      <div className="grid grid-cols-2 gap-2">
        <Metric label="Gross" value={formatCurrency(payload.grossRevenue)} icon={TrendingUp} />
        <Metric label="Platform fee" value={formatCurrency(payload.platformFee)} icon={Banknote} />
        <Metric label="Payout" value={formatCurrency(payload.restaurantPayout)} icon={ReceiptText} />
        <Metric label="Paid txns" value={payload.paidTransactionCount ?? 0} icon={CheckCircle2} />
      </div>
    </CardShell>
  );
}

export function AIAdminAbnormalActivityCard({ payload }) {
  if (!payload) return null;
  const signals = Array.isArray(payload.signals) ? payload.signals : [];

  return (
    <CardShell
      icon={AlertTriangle}
      title="Abnormal activity"
      subtitle={formatRange(payload.dateFrom, payload.dateTo)}
      sourceLabel={payload.sourceLabel}
    >
      <div className="grid grid-cols-2 gap-2">
        <Metric label="Payments" value={payload.paymentCount ?? 0} icon={ReceiptText} />
        <Metric label="Refunds" value={payload.refundCount ?? 0} icon={ReceiptText} />
        <Metric label="Refund rate" value={`${Math.round((payload.refundRate || 0) * 100)}%`} icon={TrendingUp} />
        <Metric label="Pending reviews" value={payload.pendingRestaurantCount ?? 0} icon={Building2} />
      </div>

      {signals.length > 0 ? (
        <ul className="space-y-1.5">
          {signals.map((signal) => (
            <li key={signal.code} className="rounded-md border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-100">
              <div className="flex items-start justify-between gap-2">
                <span className="break-words font-semibold">{signal.label || signal.type || signal.code}</span>
                <span className="shrink-0 rounded-md border border-amber-500/30 px-1.5 py-0.5 text-[10px] uppercase">
                  {signal.severity || 'info'}
                </span>
              </div>
              <p className="mt-1 break-words leading-relaxed">{signal.reason || signal.summary}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-md border border-border bg-secondary/40 p-2.5 text-xs text-muted-foreground">
          No abnormal signals found in this window.
        </p>
      )}
    </CardShell>
  );
}

export function AIAdminComplaintReplyDraftCard({ payload }) {
  if (!payload) return null;

  return (
    <CardShell
      icon={MessageSquareText}
      title="Complaint reply draft"
      subtitle={payload.subjectType || payload.tone || 'Draft only'}
      sourceLabel={payload.sourceLabel}
    >
      <p className="whitespace-pre-wrap break-words rounded-md border border-border bg-secondary/40 p-2.5 text-xs leading-relaxed text-foreground">
        {payload.draftReply}
      </p>
      <p className="rounded-md border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs leading-relaxed text-amber-100">
        {payload.disclaimer || 'Draft only. Nothing has been sent or saved.'}
      </p>
    </CardShell>
  );
}
