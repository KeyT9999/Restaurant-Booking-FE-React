import { Calendar, ShieldCheck, Sparkles, Ticket } from 'lucide-react';
import { cn } from '../ui/utils';

export default function VoucherCard({ voucher, onAction, actionText, disabled, isSaved, context = 'default' }) {
  const {
    code,
    name,
    description,
    discountType,
    discountValue,
    minOrderAmount,
    maxDiscountAmount,
    endDate,
  } = voucher || {};

  const formatCurrency = (value) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Không giới hạn';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  // Determine button state and text
  const isApplyAction = actionText === 'Dùng ngay' || actionText === 'Áp dụng' || context === 'booking';
  const showButton = !!onAction;

  return (
    <div
      className={cn(
        'relative flex overflow-hidden rounded-xl border border-[#2C313C] bg-[#1A1D24] shadow-md transition-all',
        isSaved && !isApplyAction && 'border-primary/40 bg-primary/5',
        disabled && 'pointer-events-none opacity-50'
      )}
    >
      <div className="absolute -left-2 top-1/2 z-10 h-4 w-4 -translate-y-1/2 rounded-full border-r border-[#2C313C] bg-[#0F1115]" />
      <div className="absolute -right-2 top-1/2 z-10 h-4 w-4 -translate-y-1/2 rounded-full border-l border-[#2C313C] bg-[#0F1115]" />

      <div className="flex min-w-0 flex-1 flex-col justify-between p-4 pl-6">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
              <Ticket className="h-3.5 w-3.5" />
              <span>
                {discountType === 'percentage' ? `${discountValue}% OFF` : formatCurrency(discountValue)}
              </span>
            </div>
            {voucher?.isSponsored && (
              <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/8 px-2 py-0.5 text-[9px] font-bold text-primary">
                <Sparkles className="h-3 w-3" />
                Duoc tai tro
              </span>
            )}
          </div>
          <h4 className="mt-1.5 truncate text-sm font-bold text-white">
            {name ? `${name} (${code})` : `Mã: ${code}`}
          </h4>
          {description && <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{description}</p>}
        </div>

        <div className="mt-4 flex flex-col gap-1 border-t border-border/40 pt-3 text-[10px] text-muted-foreground">
          <div className="flex justify-between gap-3">
            <span>Đơn tối thiểu:</span>
            <span className="font-semibold text-white">{formatCurrency(minOrderAmount)}</span>
          </div>
          {discountType === 'percentage' && maxDiscountAmount && (
            <div className="flex justify-between gap-3">
              <span>Giảm tối đa:</span>
              <span className="font-semibold text-white">{formatCurrency(maxDiscountAmount)}</span>
            </div>
          )}
          <div className="mt-1 flex items-center gap-1 text-[9px] uppercase tracking-wider text-muted-foreground">
            <Calendar className="h-3 w-3 text-primary/70" />
            <span>Hạn dùng: {formatDate(endDate)}</span>
          </div>
        </div>
      </div>

      <div className="relative my-3 w-px border-l-2 border-dashed border-border/60">
        <div className="absolute -top-3.5 -left-[4px] h-2 w-2 rounded-full bg-[#0F1115]" />
        <div className="absolute -bottom-3.5 -left-[4px] h-2 w-2 rounded-full bg-[#0F1115]" />
      </div>

      <div className="flex w-24 shrink-0 flex-col items-center justify-center bg-black/10 p-3 pr-5">
        {showButton ? (
          <button
            type="button"
            onClick={() => !disabled && (!isSaved || isApplyAction) && onAction(voucher)}
            disabled={disabled || (isSaved && !isApplyAction)}
            className={cn(
              'w-full rounded-lg px-2.5 py-2 text-center text-xs font-bold transition focus:outline-none',
              isSaved && !isApplyAction
                ? 'flex items-center justify-center gap-1 border border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                : 'bg-primary text-background hover:bg-primary/90'
            )}
            aria-label={`Voucher ${code}`}
          >
            {isSaved && !isApplyAction ? (
              <>
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Đã lưu</span>
              </>
            ) : (
              actionText || 'Lưu mã'
            )}
          </button>
        ) : (
          <div className="rounded border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
            Ưu đãi
          </div>
        )}
      </div>
    </div>
  );
}
