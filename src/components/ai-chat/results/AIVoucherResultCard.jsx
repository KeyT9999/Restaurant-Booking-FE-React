import { Link } from 'react-router-dom';
import {
  BadgePercent,
  CheckCircle2,
  Info,
  LockKeyhole,
  ReceiptText,
  XCircle,
} from 'lucide-react';

const formatCurrency = (value) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 'Chưa có';
  return `${value.toLocaleString('vi-VN')} đ`;
};

const formatDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const getStatus = (payload) => {
  if (payload?.authRequired) {
    return {
      title: 'Cần đăng nhập',
      icon: LockKeyhole,
      className: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
    };
  }
  if (payload?.valid) {
    return {
      title: 'Voucher có thể dùng',
      icon: CheckCircle2,
      className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    };
  }
  if (payload?.status === 'needs_input') {
    return {
      title: 'Cần thêm thông tin',
      icon: ReceiptText,
      className: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
    };
  }
  return {
    title: 'Voucher chưa hợp lệ',
    icon: XCircle,
    className: 'border-destructive/30 bg-destructive/10 text-destructive',
  };
};

const renderConditionText = (conditions) => {
  if (!conditions) return [];

  const items = [];
  if (conditions.discountType === 'percentage' && typeof conditions.discountValue === 'number') {
    items.push(`Giảm ${conditions.discountValue}%`);
  }
  if (conditions.discountType === 'fixed_amount' && typeof conditions.discountValue === 'number') {
    items.push(`Giảm ${formatCurrency(conditions.discountValue)}`);
  }
  if (typeof conditions.minOrderAmount === 'number' && conditions.minOrderAmount > 0) {
    items.push(`Tối thiểu ${formatCurrency(conditions.minOrderAmount)}`);
  }
  if (typeof conditions.maxDiscountAmount === 'number') {
    items.push(`Giảm tối đa ${formatCurrency(conditions.maxDiscountAmount)}`);
  }
  const validUntil = formatDate(conditions.validUntil);
  if (validUntil) items.push(`Hạn dùng ${validUntil}`);
  return items;
};

export default function AIVoucherResultCard({ payload }) {
  if (!payload) return null;

  const status = getStatus(payload);
  const StatusIcon = status.icon;
  const conditions = renderConditionText(payload.conditions);

  return (
    <article className="rounded-lg border border-border bg-card p-3 text-left shadow-sm">
      <div className="flex items-start gap-2">
        <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border ${status.className}`}>
          <StatusIcon size={16} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold text-foreground">{status.title}</h4>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Mã <span className="font-semibold text-foreground">{payload.code || 'chưa rõ'}</span>
          </p>
        </div>
      </div>

      {payload.reason && (
        <p className="mt-3 rounded-md border border-border bg-secondary/40 p-2.5 text-xs leading-relaxed text-muted-foreground">
          {payload.reason}
        </p>
      )}

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-md border border-border bg-secondary/50 p-2">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <BadgePercent size={13} aria-hidden="true" />
            Giảm dự kiến
          </span>
          <strong className="mt-1 block font-semibold text-foreground">
            {formatCurrency(payload.discountAmountEstimate)}
          </strong>
        </div>
        <div className="rounded-md border border-border bg-secondary/50 p-2">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <ReceiptText size={13} aria-hidden="true" />
            Giá trị tính
          </span>
          <strong className="mt-1 block font-semibold text-foreground">
            {formatCurrency(payload.orderAmountEstimate)}
          </strong>
        </div>
      </div>

      {payload.restaurant?.name && (
        <p className="mt-2 text-xs text-muted-foreground">
          Nhà hàng: <span className="font-medium text-foreground">{payload.restaurant.name}</span>
        </p>
      )}

      {conditions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {conditions.map((condition) => (
            <span
              key={condition}
              className="rounded-md border border-border bg-secondary/50 px-2 py-1 text-[11px] text-muted-foreground"
            >
              {condition}
            </span>
          ))}
        </div>
      )}

      <p className="mt-3 flex items-start gap-1.5 border-t border-border pt-2 text-[11px] leading-relaxed text-muted-foreground">
        <Info size={12} className="mt-0.5 shrink-0" aria-hidden="true" />
        <span>{payload.disclaimer || 'Voucher sẽ được kiểm tra lại trong luồng đặt bàn.'}</span>
      </p>

      {payload.authRequired && (
        <Link
          to={payload.loginUrl || '/auth/login'}
          className="mt-3 inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Đăng nhập để kiểm tra
          <LockKeyhole size={13} aria-hidden="true" />
        </Link>
      )}
    </article>
  );
}
