import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BadgePercent,
  Ban,
  CalendarDays,
  Check,
  Clock3,
  Edit3,
  Mail,
  MapPin,
  Phone,
  ReceiptText,
  RefreshCw,
  Sparkles,
  UserRound,
  Users,
} from 'lucide-react';
import {
  cancelPendingAction,
  confirmPendingAction,
  getOrCreateConfirmIdempotencyKey,
} from '../../../api/aiApi';
import { Button } from '../../ui/button';
import AIBookingSuccessCard from './AIBookingSuccessCard';
import AIConfirmActionCard from './AIConfirmActionCard';

const STATUS_COPY = {
  pending: {
    label: 'Chưa đặt bàn',
    detail: 'Bản xem trước đang chờ bạn kiểm tra.',
    className: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
  },
  cancelled: {
    label: 'Đã hủy bản xem trước',
    detail: 'Không có booking nào được tạo.',
    className: 'border-border bg-secondary/60 text-muted-foreground',
  },
  expired: {
    label: 'Bản xem trước đã hết hạn',
    detail: 'Hãy tạo bản mới để kiểm tra lại bàn và voucher.',
    className: 'border-destructive/30 bg-destructive/10 text-destructive',
  },
  failed: {
    label: 'Cần chuẩn bị lại',
    detail: 'Thông tin đã thay đổi trước khi booking được tạo.',
    className: 'border-destructive/30 bg-destructive/10 text-destructive',
  },
};

const ERROR_COPY = {
  PENDING_ACTION_EXPIRED: 'Bản xem trước đã hết hạn. Vui lòng chuẩn bị lại.',
  PENDING_ACTION_CANCELLED: 'Bản xem trước đã bị hủy và không thể xác nhận.',
  TABLE_NO_LONGER_AVAILABLE: 'Bàn vừa hết trong lúc bạn kiểm tra. Hãy chuẩn bị lại booking.',
  VOUCHER_NO_LONGER_VALID: 'Voucher không còn hợp lệ. Hãy chuẩn bị lại để cập nhật số tiền.',
  BOOKING_POLICY_BLOCKED: 'Booking không còn đáp ứng chính sách hiện tại. Hãy kiểm tra lại.',
  IDEMPOTENCY_CONFLICT: 'Yêu cầu đang được xử lý. Bạn có thể thử lại, BookEat sẽ dùng cùng mã chống trùng.',
  BOOKING_CREATE_FAILED: 'Không thể tạo booking lúc này. Hãy kiểm tra My Bookings trước khi thử lại.',
};

const OCCASION_LABELS = {
  birthday: 'Sinh nhật',
  anniversary: 'Kỷ niệm',
  business: 'Công việc',
  date: 'Hẹn hò',
  family: 'Gia đình',
  other: 'Dịp đặc biệt',
};

const formatCurrency = (value) => (
  `${Math.max(0, Number(value) || 0).toLocaleString('vi-VN')} đ`
);

const formatBookingDate = (value) => {
  if (!value) return 'Chưa có ngày';
  const date = new Date(`${value}T00:00:00+07:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Asia/Bangkok',
  });
};

const formatExpiry = (milliseconds) => {
  if (milliseconds <= 0) return 'Đã hết hạn';
  const totalSeconds = Math.ceil(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0
    ? `Còn ${minutes}:${String(seconds).padStart(2, '0')}`
    : `Còn ${seconds} giây`;
};

const getRequestErrorCode = (error) => (
  error?.code
  || error?.raw?.response?.data?.code
  || error?.response?.data?.code
  || null
);

function DetailLine({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5 py-1.5 text-xs">
      <Icon size={14} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
      <span className="min-w-0 flex-1 text-muted-foreground">
        {label}
        <strong className="ml-1 break-words font-medium text-foreground">{value}</strong>
      </span>
    </div>
  );
}

export default function AIBookingPreviewCard({ payload, onEdit, onConfirmed }) {
  const preview = payload?.preview;
  const expiresAtMs = useMemo(() => {
    const value = new Date(payload?.expiresAt).getTime();
    return Number.isNaN(value) ? 0 : value;
  }, [payload?.expiresAt]);
  const [status, setStatus] = useState(payload?.status || 'pending');
  const [remainingMs, setRemainingMs] = useState(() => Math.max(0, expiresAtMs - Date.now()));
  const [cancelling, setCancelling] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [booking, setBooking] = useState(payload?.confirmedBooking || null);
  const [error, setError] = useState(null);
  const confirmLockRef = useRef(false);
  const idempotencyKeyRef = useRef(null);

  useEffect(() => {
    if (status !== 'pending' || !expiresAtMs) return undefined;
    const update = () => {
      const next = Math.max(0, expiresAtMs - Date.now());
      setRemainingMs(next);
      if (next === 0) setStatus('expired');
    };
    update();
    const intervalId = window.setInterval(update, 1000);
    return () => window.clearInterval(intervalId);
  }, [expiresAtMs, status]);

  if (!preview || !payload?.pendingActionId) return null;
  if (booking) {
    return (
      <AIBookingSuccessCard
        booking={booking}
        restaurantName={preview.restaurant?.name}
      />
    );
  }

  const activeStatus = STATUS_COPY[status] || STATUS_COPY.pending;
  const isPending = status === 'pending' && remainingMs > 0;
  const isMutating = confirming || cancelling;
  const canConfirm = Boolean(payload.confirmEnabled) && isPending && !isMutating;
  const canPrepareAgain = ['expired', 'cancelled', 'failed'].includes(status)
    || ['TABLE_NO_LONGER_AVAILABLE', 'VOUCHER_NO_LONGER_VALID', 'BOOKING_POLICY_BLOCKED']
      .includes(error?.code);
  const tableText = preview.tableNumbers?.length
    ? preview.tableNumbers.map((table) => `Bàn ${table}`).join(', ')
    : 'Nhà hàng sẽ sắp bàn';

  const handleConfirm = async () => {
    if (!canConfirm || confirmLockRef.current) return;
    confirmLockRef.current = true;
    setConfirming(true);
    setError(null);

    try {
      if (!idempotencyKeyRef.current) {
        idempotencyKeyRef.current = getOrCreateConfirmIdempotencyKey(payload.pendingActionId);
      }
      const response = await confirmPendingAction(
        payload.pendingActionId,
        idempotencyKeyRef.current,
      );
      const confirmedBooking = response?.data?.booking || null;
      setStatus(response?.data?.pendingAction?.status || 'confirmed');
      setBooking(confirmedBooking);
      if (confirmedBooking) {
        onConfirmed?.({
          pendingActionId: payload.pendingActionId,
          booking: confirmedBooking,
        });
      }
    } catch (requestError) {
      const code = getRequestErrorCode(requestError);
      if (code === 'PENDING_ACTION_EXPIRED') setStatus('expired');
      else if (code === 'PENDING_ACTION_CANCELLED') setStatus('cancelled');
      else if (['TABLE_NO_LONGER_AVAILABLE', 'VOUCHER_NO_LONGER_VALID', 'BOOKING_POLICY_BLOCKED'].includes(code)) {
        setStatus('failed');
      }
      setError({
        code,
        message: ERROR_COPY[code]
          || requestError?.message
          || 'Không thể xác nhận booking. Vui lòng thử lại.',
      });
    } finally {
      confirmLockRef.current = false;
      setConfirming(false);
    }
  };

  const handleCancel = async () => {
    if (!isPending || isMutating) return;
    setCancelling(true);
    setError(null);
    try {
      const response = await cancelPendingAction(payload.pendingActionId);
      setStatus(response?.data?.status || 'cancelled');
    } catch (requestError) {
      setError({
        code: getRequestErrorCode(requestError),
        message: requestError?.message || 'Không thể hủy bản xem trước. Vui lòng thử lại.',
      });
    } finally {
      setCancelling(false);
    }
  };

  return (
    <article className="overflow-hidden rounded-xl border border-border bg-card text-left shadow-lg">
      <div className="border-b border-border bg-[#14171D] px-3.5 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary">
              <ReceiptText size={17} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
                Booking preview
              </p>
              <h4 className="mt-0.5 truncate text-sm font-semibold text-foreground">
                {preview.restaurant?.name || 'Nhà hàng BookEat'}
              </h4>
            </div>
          </div>
          <span className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-semibold ${activeStatus.className}`}>
            {activeStatus.label}
          </span>
        </div>
        {preview.restaurant?.address && (
          <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
            <MapPin size={12} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span className="min-w-0 break-words">{preview.restaurant.address}</span>
          </p>
        )}
      </div>

      <div className="px-3.5 py-3">
        <div className="grid grid-cols-2 gap-x-3 border-b border-border pb-2">
          <DetailLine icon={CalendarDays} label="Ngày" value={formatBookingDate(preview.bookingDate)} />
          <DetailLine icon={Clock3} label="Giờ" value={preview.bookingTime || 'Chưa có'} />
          <DetailLine icon={Users} label="Số khách" value={`${preview.numberOfGuests || 0} người`} />
          <DetailLine icon={Sparkles} label="Bàn" value={tableText} />
        </div>

        <div className="border-b border-border py-2">
          <DetailLine icon={UserRound} label="Người đặt" value={preview.contact?.name || 'Chưa có'} />
          <DetailLine icon={Phone} label="Điện thoại" value={preview.contact?.phone || 'Chưa có'} />
          <DetailLine icon={Mail} label="Email" value={preview.contact?.email || 'Chưa có'} />
        </div>

        {(preview.occasion || preview.specialRequests) && (
          <div className="border-b border-border py-2 text-xs leading-relaxed">
            {preview.occasion && (
              <p className="text-muted-foreground">
                Dịp: <span className="font-medium text-foreground">
                  {OCCASION_LABELS[preview.occasion] || preview.occasion}
                </span>
              </p>
            )}
            {preview.specialRequests && (
              <p className="mt-1 text-muted-foreground">
                Ghi chú: <span className="break-words font-medium text-foreground">{preview.specialRequests}</span>
              </p>
            )}
          </div>
        )}

        <div className="space-y-1.5 py-2.5 text-xs">
          <div className="flex items-center justify-between gap-3 text-muted-foreground">
            <span>Tiền cọc dự kiến</span>
            <strong className="font-medium text-foreground">{formatCurrency(preview.depositAmount)}</strong>
          </div>
          {preview.voucher && (
            <div className="flex items-center justify-between gap-3 text-emerald-300">
              <span className="flex items-center gap-1.5">
                <BadgePercent size={13} aria-hidden="true" />
                Voucher {preview.voucher.code}
              </span>
              <strong className="font-medium">−{formatCurrency(preview.discountAmount)}</strong>
            </div>
          )}
          <div className="flex items-center justify-between gap-3 border-t border-border pt-2 text-foreground">
            <span className="font-semibold">Cần thanh toán dự kiến</span>
            <strong className="text-sm text-primary">{formatCurrency(preview.amountDue)}</strong>
          </div>
        </div>

        {confirming ? (
          <AIConfirmActionCard />
        ) : (
          <div className={`rounded-lg border px-3 py-2 text-[11px] leading-relaxed ${activeStatus.className}`}>
            <p className="font-semibold">{activeStatus.detail}</p>
            {isPending && <p className="mt-0.5">{formatExpiry(remainingMs)}</p>}
          </div>
        )}

        {error && (
          <div className="mt-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2" role="alert">
            <p className="text-xs text-destructive">{error.message}</p>
            {canPrepareAgain && (
              <button
                type="button"
                className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-foreground underline decoration-border underline-offset-4 hover:text-primary"
                onClick={() => onEdit?.(preview)}
              >
                <RefreshCw size={12} aria-hidden="true" />
                Chuẩn bị lại
              </button>
            )}
          </div>
        )}

        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button
            type="button"
            size="sm"
            disabled={!canConfirm}
            className="col-span-2"
            onClick={handleConfirm}
          >
            <Check size={14} aria-hidden="true" />
            {confirming ? 'Đang xác nhận...' : 'Xác nhận đặt bàn'}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onEdit?.(preview)}
            disabled={isMutating}
          >
            <Edit3 size={14} aria-hidden="true" />
            Chỉnh sửa
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleCancel}
            disabled={!isPending || isMutating}
            className="border-destructive/35 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Ban size={14} aria-hidden="true" />
            {cancelling ? 'Đang hủy...' : 'Hủy'}
          </Button>
        </div>

        <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
          {preview.disclaimer || 'Chưa tạo booking, chưa giữ bàn và chưa khóa voucher.'}
        </p>
      </div>
    </article>
  );
}
