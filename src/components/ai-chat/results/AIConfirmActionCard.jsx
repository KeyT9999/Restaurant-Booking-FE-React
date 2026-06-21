import { Loader2, ShieldCheck } from 'lucide-react';

export default function AIConfirmActionCard() {
  return (
    <div
      className="flex items-start gap-3 rounded-lg border border-primary/25 bg-primary/8 px-3 py-2.5"
      role="status"
      aria-live="polite"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/12 text-primary">
        <Loader2 size={16} className="animate-spin" aria-hidden="true" />
      </span>
      <div>
        <p className="text-xs font-semibold text-foreground">Đang xác nhận đặt bàn</p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
          BookEat đang kiểm tra lại bàn, voucher và số tiền trước khi tạo booking.
        </p>
        <p className="mt-1 flex items-center gap-1 text-[10px] text-primary">
          <ShieldCheck size={11} aria-hidden="true" />
          Có bảo vệ chống tạo trùng
        </p>
      </div>
    </div>
  );
}
