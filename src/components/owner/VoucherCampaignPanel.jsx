import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Bot,
  Check,
  ChevronRight,
  CreditCard,
  Home,
  Loader2,
  Search,
  TicketPercent,
} from 'lucide-react';

const formatMoney = (value) => new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
}).format(value || 0);

const formatDate = (value) => value
  ? new Date(value).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  : '-';

const placementMeta = {
  homepage: {
    title: 'Trang chủ',
    description: 'Đưa voucher vào khu vực ưu đãi nổi bật trên trang chủ.',
    icon: Home,
  },
  search_boost: {
    title: 'Search boost',
    description: 'Tăng ưu tiên nhà hàng trong danh sách tìm kiếm và hiện badge voucher.',
    icon: Search,
  },
  ai_suggestion: {
    title: 'AI suggestion',
    description: 'Tăng ưu tiên voucher trong gợi ý AI khi phù hợp dữ liệu thật.',
    icon: Bot,
  },
};

const getVoucherLabel = (voucher) => {
  if (!voucher) return '';
  const discount = voucher.discountType === 'percentage'
    ? `${voucher.discountValue}%`
    : formatMoney(voucher.discountValue);
  return `${voucher.code} - Giảm ${discount}`;
};

export default function VoucherCampaignPanel({
  data,
  loading,
  error,
  canBuy,
  paymentLoading,
  onCheckout,
  onContinuePayment,
}) {
  const navigate = useNavigate();
  const eligibleVouchers = useMemo(
    () => (data?.vouchers || []).filter((voucher) => voucher.isCampaignEligible),
    [data]
  );
  const [selectedVoucherId, setSelectedVoucherId] = useState('');

  useEffect(() => {
    if (!eligibleVouchers.some((voucher) => String(voucher._id) === String(selectedVoucherId))) {
      setSelectedVoucherId(eligibleVouchers[0]?._id || '');
    }
  }, [eligibleVouchers, selectedVoucherId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium">Đang tải chiến dịch voucher...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive text-xs leading-relaxed max-w-lg mx-auto">
        <AlertCircle size={16} className="shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-200">
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-[#14171D] border border-border rounded-xl shadow-md">
        <div className="flex items-start gap-4 text-left">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <TicketPercent size={21} />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold tracking-wider uppercase text-primary">Voucher Campaign</span>
            <h2 className="text-xl md:text-2xl text-white font-bold leading-tight mt-0.5">
              Quảng bá voucher theo từng nhà hàng
            </h2>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-2xl">
              Chiến dịch chỉ active sau khi PayOS webhook xác nhận thanh toán.
            </p>
          </div>
        </div>
        {!canBuy && (
          <div className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
            Cần gói Plus hoặc Pro để mua chiến dịch voucher.
          </div>
        )}
      </section>

      {data.pendingPayment && (
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-amber-500/10 border border-amber-500/25 rounded-xl">
          <div className="flex items-start gap-3 text-left">
            <AlertCircle size={18} className="text-amber-400 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-bold text-amber-300">Chiến dịch đang chờ thanh toán</h3>
              <p className="text-xs text-muted-foreground">
                {data.pendingPayment.description || 'Voucher campaign'} - {formatMoney(data.pendingPayment.amount)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onContinuePayment(data.pendingPayment)}
            className="h-10 px-4 rounded-lg bg-primary text-[#0F1115] text-xs font-bold uppercase tracking-wider hover:bg-primary/95 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <CreditCard size={14} />
            <span>Tiếp tục thanh toán</span>
          </button>
        </section>
      )}

      <section className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-border/40 pb-3">
          <div>
            <h3 className="text-lg text-white font-bold">Chọn voucher</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Chỉ voucher hoạt động và còn hạn mới có thể mua chiến dịch.
            </p>
          </div>
          {(data.vouchers || []).length > 0 && eligibleVouchers.length === 0 && (
            <span className="text-xs text-amber-300">Không có voucher đủ điều kiện.</span>
          )}
        </div>

        {(data.vouchers || []).length === 0 ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 border border-dashed border-border bg-card/20 rounded-xl text-center sm:text-left">
            <div>
              <h4 className="text-sm font-bold text-white">Chưa có voucher cho nhà hàng này</h4>
              <p className="text-xs text-muted-foreground mt-1">Tạo voucher trước khi mua placement quảng bá.</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/owner/vouchers')}
              className="h-10 px-4 rounded-lg bg-primary text-[#0F1115] text-xs font-bold flex items-center gap-2"
            >
              <TicketPercent size={14} />
              Tạo voucher trước
            </button>
          </div>
        ) : (
          <div className="max-w-xl">
            <label htmlFor="campaign-voucher" className="block text-xs font-semibold text-muted-foreground mb-2">
              Voucher sẽ được quảng bá
            </label>
            <select
              id="campaign-voucher"
              value={selectedVoucherId}
              onChange={(event) => setSelectedVoucherId(event.target.value)}
              className="w-full h-11 bg-secondary/40 border border-border rounded-lg px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {eligibleVouchers.length === 0 && <option value="">Không có voucher đủ điều kiện</option>}
              {eligibleVouchers.map((voucher) => (
                <option key={voucher._id} value={voucher._id} className="bg-card">
                  {getVoucherLabel(voucher)}
                </option>
              ))}
            </select>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-5">
        <h3 className="text-lg text-white font-bold border-b border-border/40 pb-3">Chọn placement và thời hạn</h3>
        <div className="flex flex-col gap-5">
          {Object.entries(placementMeta).map(([placement, meta]) => {
            const Icon = meta.icon;
            const packages = (data.packages || []).filter((pkg) => pkg.placement === placement);
            return (
              <div key={placement} className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4 items-start">
                <div className="flex items-start gap-3 pt-2">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 text-primary grid place-items-center shrink-0">
                    <Icon size={17} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{meta.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{meta.description}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {packages.map((pkg) => (
                    <article key={pkg.code} className="p-5 bg-card border border-border rounded-xl hover:border-primary/40 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-primary font-bold">
                            {pkg.durationDays} ngày
                          </span>
                          <p className="text-xl text-white font-bold mt-1">{formatMoney(pkg.amount)}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground border border-border rounded px-2 py-1">
                          Weight {pkg.priorityWeight}
                        </span>
                      </div>
                      <ul className="mt-4 pt-4 border-t border-border/40 flex flex-col gap-2 text-xs text-muted-foreground min-h-20">
                        {(pkg.benefits || []).slice(0, 3).map((benefit) => (
                          <li key={benefit} className="flex items-start gap-2">
                            <Check size={13} className="text-primary shrink-0 mt-0.5" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                      <button
                        type="button"
                        onClick={() => onCheckout({
                          voucherId: selectedVoucherId,
                          packageCode: pkg.code,
                        })}
                        disabled={!canBuy || !selectedVoucherId || paymentLoading}
                        className="mt-5 w-full h-10 rounded-lg bg-primary text-[#0F1115] font-bold text-xs uppercase tracking-wider hover:bg-primary/95 disabled:bg-primary/30 disabled:text-[#0F1115]/50 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>{paymentLoading ? 'Đang xử lý...' : 'Mua chiến dịch'}</span>
                        <ChevronRight size={14} />
                      </button>
                    </article>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="text-lg text-white font-bold border-b border-border/40 pb-3">Lịch sử chiến dịch</h3>
        {!data.campaigns?.length ? (
          <div className="text-xs text-muted-foreground p-8 border border-dashed border-border/40 bg-card/10 rounded-xl text-center">
            Chưa có chiến dịch voucher nào.
          </div>
        ) : (
          <div className="overflow-x-auto border border-border rounded-xl bg-card/40">
            <table className="w-full min-w-[760px] text-xs text-left border-collapse">
              <thead>
                <tr className="bg-[#1A1D24] text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60">
                  <th className="p-4">Voucher</th>
                  <th className="p-4">Placement</th>
                  <th className="p-4">Goi</th>
                  <th className="p-4">Thoi gian</th>
                  <th className="p-4 text-center">Campaign</th>
                  <th className="p-4 text-center">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {data.campaigns.map((campaign) => (
                  <tr key={campaign._id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 text-white font-bold">{campaign.voucherId?.code || 'Voucher'}</td>
                    <td className="p-4 text-muted-foreground">{placementMeta[campaign.placement]?.title || campaign.placement}</td>
                    <td className="p-4 text-white">{campaign.packageCode}</td>
                    <td className="p-4 text-muted-foreground">
                      <div>{formatDate(campaign.startAt)}</div>
                      <div className="mt-1">{formatDate(campaign.endAt)}</div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex px-2.5 py-1 rounded text-[10px] font-bold uppercase border ${
                        campaign.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : campaign.status === 'pending'
                            ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                            : 'bg-secondary text-muted-foreground border-border'
                      }`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="p-4 text-center text-muted-foreground">
                      {campaign.paymentId?.status || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
