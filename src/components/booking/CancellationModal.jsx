import { AlertTriangle, Loader2, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

const formatVnd = (amount = 0) => `${new Intl.NumberFormat('vi-VN').format(amount)}đ`;

export default function CancellationModal({
  open,
  preview,
  loading,
  reason,
  onReasonChange,
  accepted,
  onAcceptedChange,
  submitting,
  onClose,
  onConfirm,
  booking,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="cancel-booking-title">
      <button className="absolute inset-0" onClick={onClose} aria-label="Đóng hộp thoại" />
      <Card className="relative z-10 max-h-[92vh] w-full max-w-lg overflow-y-auto border-border bg-card p-5 shadow-2xl sm:p-6">
        <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
          <div>
            <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-rose-400">Thao tác tài chính</p>
            <h2 id="cancel-booking-title" className="flex items-center gap-2 text-lg font-bold text-white">
              <AlertTriangle size={19} /> Xác nhận hủy đặt bàn?
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">Booking #{String(booking?.id || booking?._id || '').slice(-8).toUpperCase()}</p>
          </div>
          <button onClick={onClose} disabled={submitting} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-white" aria-label="Đóng">
            <X size={18} />
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
            <Loader2 size={18} className="animate-spin text-primary" /> Đang tính khoản hoàn theo thời gian máy chủ...
          </div>
        )}

        {!loading && preview && (
          <div className="mt-5 space-y-4">
            <div className="rounded-xl border border-border bg-secondary/30 p-4 text-sm">
              <div className="flex justify-between gap-4 py-1.5 text-muted-foreground"><span>Tiền cọc đã thanh toán</span><strong className="text-white">{formatVnd(preview.depositPaid)}</strong></div>
              <div className="flex justify-between gap-4 py-1.5 text-muted-foreground"><span>Phí hủy {preview.cancellationFeeRateBasisPoints === 3000 ? '30%' : ''}</span><strong className="text-rose-300">{formatVnd(preview.cancellationFeeAmount)}</strong></div>
              <div className="my-2 h-px bg-border" />
              <div className="flex justify-between gap-4 py-1 text-base font-semibold text-white"><span>Hoàn vào Ví BookEat</span><strong className="text-emerald-400">{formatVnd(preview.refundAmount)}</strong></div>
            </div>

            <p className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs leading-relaxed text-muted-foreground">
              {preview.message} Tiền hoàn dùng cho các lần đặt bàn tiếp theo, không tự động hoàn về tài khoản ngân hàng.
            </p>

            {preview.canCancel && (
              <>
                <label className="block text-xs font-semibold text-muted-foreground" htmlFor="cancellation-reason">Lý do hủy (tùy chọn)</label>
                <textarea
                  id="cancellation-reason"
                  rows="3"
                  maxLength="200"
                  value={reason}
                  onChange={(event) => onReasonChange(event.target.value)}
                  placeholder="Ví dụ: Tôi có việc đột xuất"
                  className="w-full rounded-lg border border-border bg-secondary/40 p-3 text-sm text-white outline-none focus:border-primary"
                />
                <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-border p-3 text-xs leading-relaxed text-muted-foreground">
                  <input type="checkbox" checked={accepted} onChange={(event) => onAcceptedChange(event.target.checked)} className="mt-0.5 h-4 w-4 accent-[#D49653]" />
                  <span>Tôi đã đọc và đồng ý với phí hủy cùng khoản hoàn vào Ví BookEat nêu trên.</span>
                </label>
              </>
            )}
          </div>
        )}

        {!loading && !preview && (
          <p className="my-6 rounded-lg border border-rose-500/20 bg-rose-500/5 p-4 text-sm text-rose-300">Không thể xác định khoản hoàn. Vui lòng đóng và thử lại.</p>
        )}

        <div className="mt-5 flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose} disabled={submitting}>Giữ booking</Button>
          <Button onClick={onConfirm} disabled={submitting || !accepted || !preview?.canCancel} className="bg-rose-500 font-bold text-white hover:bg-rose-600 disabled:opacity-40">
            {submitting ? <><Loader2 size={15} className="mr-2 animate-spin" /> Đang hủy...</> : preview ? `Hủy và nhận lại ${formatVnd(preview.refundAmount)}` : 'Xác nhận hủy'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
