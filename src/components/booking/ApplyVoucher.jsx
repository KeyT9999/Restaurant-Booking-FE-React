import { useEffect, useState } from 'react';
import { Check, Ticket, X } from 'lucide-react';
import { getMyVouchers, validateVoucherForBooking } from '../../api/voucherApi';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { cn } from '../ui/utils';
import VoucherCard from '../voucher/VoucherCard';

export default function ApplyVoucher({ restaurantId, bookingAmount, onApplySuccess, onRemove }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [walletVouchers, setWalletVouchers] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [fetchingWallet, setFetchingWallet] = useState(false);

  useEffect(() => {
    if (!isDrawerOpen) return;

    const fetchWallet = async () => {
      setFetchingWallet(true);
      try {
        const response = await getMyVouchers({ filter: 'unused' });
        if (response?.success) {
          const validVouchers = (response.data || []).filter((item) => {
            const voucher = item.voucherId;
            const voucherRestaurant = voucher?.restaurantId;
            return (
              voucher &&
              (!voucherRestaurant ||
                voucherRestaurant?._id === restaurantId ||
                voucherRestaurant === restaurantId)
            );
          });
          setWalletVouchers(validVouchers);
        }
      } catch (err) {
        console.error('Không thể tải ví voucher:', err.message);
      } finally {
        setFetchingWallet(false);
      }
    };

    fetchWallet();
  }, [isDrawerOpen, restaurantId]);

  const handleApply = async (voucherCode) => {
    const codeToApply = (voucherCode || code).trim().toUpperCase();
    if (!codeToApply) return;

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const response = await validateVoucherForBooking({
        code: codeToApply,
        restaurantId,
        orderAmount: bookingAmount,
      });

      if (response?.valid) {
        const discountAmount = response.discountAmount || 0;
        const voucher = response.voucher || { code: codeToApply };

        setAppliedVoucher(voucher);
        setCode(codeToApply);
        setSuccessMsg(`Áp dụng thành công, giảm ${discountAmount.toLocaleString('vi-VN')}đ.`);
        onApplySuccess({ voucherCode: codeToApply, discountAmount });
        setIsDrawerOpen(false);
      } else {
        setError(response?.reason || 'Mã ưu đãi không hợp lệ.');
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi áp dụng mã.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setAppliedVoucher(null);
    setCode('');
    setSuccessMsg(null);
    setError(null);
    onRemove();
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);

  return (
    <div className="flex flex-col gap-2.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Mã ưu đãi
      </label>

      {!appliedVoucher ? (
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Ticket className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Nhập mã ưu đãi"
              value={code}
              onChange={(event) => {
                setCode(event.target.value.toUpperCase());
                setError(null);
              }}
              disabled={loading}
              className={cn(
                'h-10 bg-secondary/40 pl-9 text-sm border-border text-white focus-visible:ring-primary/40',
                error && 'border-rose-500/60 focus-visible:ring-rose-500/30'
              )}
            />
          </div>

          <div className="flex gap-2 sm:shrink-0">
            <Button
              type="button"
              onClick={() => handleApply()}
              disabled={loading || !code.trim()}
              className="h-10 bg-primary px-4 text-sm font-bold text-background hover:bg-primary/95"
            >
              {loading ? 'Đang áp dụng' : 'Áp dụng'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDrawerOpen(true)}
              className="h-10 border-border text-sm font-semibold text-white hover:bg-secondary"
            >
              Chọn từ ví
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3">
          <div className="flex items-center gap-2.5 text-sm font-semibold text-emerald-400">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10">
              <Check className="h-3.5 w-3.5" />
            </span>
            <span>
              Đã áp dụng <strong className="rounded bg-card px-1.5 py-0.5 font-mono text-white">{appliedVoucher.code}</strong>
              {appliedVoucher.discountType && (
                <>
                  {' '}
                  (
                  {appliedVoucher.discountType === 'percentage'
                    ? `${appliedVoucher.discountValue}%`
                    : formatCurrency(appliedVoucher.discountValue)}
                  )
                </>
              )}
            </span>
          </div>
          <button type="button" onClick={handleRemove} className="text-sm font-bold text-rose-400 hover:text-rose-300">
            Gỡ bỏ
          </button>
        </div>
      )}

      {error && <p className="text-xs font-semibold text-rose-400">{error}</p>}
      {successMsg && !error && <p className="text-xs font-semibold text-emerald-400">{successMsg}</p>}

      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Đóng ví voucher"
            className="absolute inset-0 z-0"
            onClick={() => setIsDrawerOpen(false)}
          />

          <div className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h4 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                <Ticket className="h-5 w-5 text-primary" /> Ví voucher
              </h4>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="rounded-lg p-1 text-muted-foreground transition hover:bg-secondary hover:text-white"
                aria-label="Đóng ví voucher"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              {fetchingWallet ? (
                <div className="rounded-xl border border-border bg-secondary/20 p-6 text-center text-sm text-muted-foreground">
                  Đang tải ví voucher...
                </div>
              ) : walletVouchers.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center text-sm leading-relaxed text-muted-foreground">
                  Bạn chưa có voucher khả dụng cho nhà hàng này.
                </div>
              ) : (
                walletVouchers.map((item) => (
                  <VoucherCard
                    key={item._id}
                    voucher={item.voucherId}
                    onAction={(voucher) => handleApply(voucher.code)}
                    actionText="Dùng ngay"
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
