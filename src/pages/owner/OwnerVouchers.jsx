import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  AlertCircle,
  BarChart2,
  Loader2,
  Pencil,
  Plus,
  Power,
  Ticket,
  Trash2,
  X,
} from 'lucide-react';
import OwnerLayout from '../../components/owner/OwnerLayout';
import { useRestaurantContext } from '../../context/useRestaurantContext';
import { createVoucher, deleteVoucher, getOwnerVouchers, getVoucherStats, updateVoucher } from '../../api/voucherApi';
import VoucherFormModal from '../../components/voucher/VoucherFormModal';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { cn } from '../../components/ui/utils';

const STATUS_CONFIG = {
  active: { label: 'Active', className: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400' },
  paused: { label: 'Paused', className: 'border-amber-500/25 bg-amber-500/10 text-amber-400' },
  expired: { label: 'Ended', className: 'border-border bg-secondary text-muted-foreground' },
  disabled: { label: 'Ended', className: 'border-border bg-secondary text-muted-foreground' },
};

const formatMoney = (value) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value || 0);

function getRestaurantId(value) {
  if (!value) return null;
  if (typeof value === 'string') return value;
  return value._id || value.id || null;
}

function getOfferText(voucher) {
  if (voucher.discountType === 'percentage') return `${voucher.discountValue}% off`;
  return `${formatMoney(voucher.discountValue)} off`;
}

function getVoucherTitle(voucher) {
  return voucher.name || voucher.title || voucher.description || `${voucher.code} offer`;
}

function getUsageText(voucher) {
  const used = voucher.usedCount || voucher.redemptionCount || voucher.currentUsage || voucher.usageCount || 0;
  if (voucher.globalUsageLimit) return `Used: ${used} / ${voucher.globalUsageLimit}`;
  if (voucher.status === 'expired' || voucher.status === 'disabled') return 'Used: Expired';
  return `Used: ${used}`;
}

export default function OwnerVouchers() {
  const { selectedRestaurantId, isRestaurantReady } = useRestaurantContext();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [statsVoucher, setStatsVoucher] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const loadVouchers = async () => {
    if (!selectedRestaurantId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getOwnerVouchers();
      if (res?.success) {
        setVouchers(res.data || []);
      } else {
        setVouchers([]);
      }
    } catch (err) {
      setError(err.message || 'Cannot load vouchers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVouchers();
  }, [selectedRestaurantId]);

  const visibleVouchers = useMemo(() => {
    return vouchers.filter((voucher) => {
      const voucherRestaurantId = getRestaurantId(voucher.restaurantId);
      return !voucherRestaurantId || voucherRestaurantId === selectedRestaurantId;
    });
  }, [vouchers, selectedRestaurantId]);

  const handleCreateOrUpdate = async (data) => {
    try {
      if (editingVoucher) {
        await updateVoucher(editingVoucher._id, data);
        toast.success('Voucher updated.');
      } else {
        await createVoucher({ ...data, restaurantId: data.restaurantId || selectedRestaurantId });
        toast.success('Voucher created.');
      }
      setIsModalOpen(false);
      setEditingVoucher(null);
      loadVouchers();
    } catch (err) {
      toast.error(err.message || 'Cannot save voucher.');
    }
  };

  const handleToggleStatus = async (voucher) => {
    const nextStatus = voucher.status === 'active' ? 'paused' : 'active';
    try {
      await updateVoucher(voucher._id, { status: nextStatus });
      toast.success(nextStatus === 'active' ? 'Voucher activated.' : 'Voucher paused.');
      loadVouchers();
    } catch (err) {
      toast.error(err.message || 'Cannot change voucher status.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteVoucher(deleteTarget._id);
      toast.success('Voucher ended.');
      setDeleteTarget(null);
      loadVouchers();
    } catch (err) {
      toast.error(err.message || 'Cannot end voucher.');
      setDeleteTarget(null);
    }
  };

  const handleShowStats = async (voucher) => {
    setStatsVoucher(voucher);
    setLoadingStats(true);
    setStatsData(null);
    try {
      const res = await getVoucherStats(voucher._id);
      if (res?.success) {
        setStatsData(res.data);
      }
    } catch (err) {
      toast.error(err.message || 'Cannot load voucher stats.');
      setStatsVoucher(null);
    } finally {
      setLoadingStats(false);
    }
  };

  if (!isRestaurantReady) {
    return (
      <OwnerLayout title="Vouchers & promos" subtitle="Drive repeat business">
        <Card className="mx-auto max-w-2xl border-dashed border-border bg-card/70 p-8 text-center">
          <Ticket className="mx-auto h-12 w-12 text-primary" />
          <h2 className="font-serif text-3xl font-bold text-white">Select a restaurant</h2>
          <p className="text-sm text-muted-foreground">
            Choose a restaurant in the sidebar before creating targeted promotions.
          </p>
        </Card>
      </OwnerLayout>
    );
  }

  return (
    <OwnerLayout title="Vouchers & promos" subtitle="Drive repeat business">
      <div className="flex items-center justify-between gap-4">
        <p className="text-base text-muted-foreground">Boost repeat visits with targeted offers.</p>
        <Button
          className="h-10 bg-primary px-5 text-background hover:bg-primary/95"
          onClick={() => {
            setEditingVoucher(null);
            setIsModalOpen(true);
          }}
        >
          <Plus size={16} /> New voucher
        </Button>
      </div>

      {loading ? (
        <div className="mt-12 flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm font-medium">Loading vouchers...</span>
        </div>
      ) : error ? (
        <Card className="mt-10 border-rose-500/25 bg-rose-500/10 p-5 text-rose-300">
          <div className="flex items-center gap-3">
            <AlertCircle size={18} />
            <span className="text-sm font-semibold">{error}</span>
          </div>
        </Card>
      ) : visibleVouchers.length === 0 ? (
        <Card className="mt-10 border-dashed border-border bg-card/70 p-8 text-center">
          <Ticket className="mx-auto h-12 w-12 text-primary" />
          <h2 className="font-serif text-3xl font-bold text-white">No vouchers yet</h2>
          <p className="text-sm text-muted-foreground">
            Create a first-time guest offer, a weekday tasting promotion or a loyalty reward.
          </p>
          <Button
            className="mx-auto bg-primary text-background hover:bg-primary/95"
            onClick={() => {
              setEditingVoucher(null);
              setIsModalOpen(true);
            }}
          >
            <Plus size={16} /> New voucher
          </Button>
        </Card>
      ) : (
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {visibleVouchers.map((voucher) => {
            const status = STATUS_CONFIG[voucher.status] || STATUS_CONFIG.paused;
            const ended = voucher.status === 'disabled' || voucher.status === 'expired';

            return (
              <Card key={voucher._id} className="min-h-[212px] border-border bg-card p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-bold text-white">{getVoucherTitle(voucher)}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Code · {voucher.code}</p>
                  </div>
                  <Badge className={`${status.className} rounded-lg border px-3 py-2 text-xs font-bold`}>
                    {status.label}
                  </Badge>
                </div>

                <div className="mt-12 text-base font-semibold text-primary">
                  {getOfferText(voucher)}
                </div>

                <div className="mt-9 flex items-end justify-between gap-4">
                  <p className="text-sm text-muted-foreground">{getUsageText(voucher)}</p>
                  <div className="flex items-center gap-1.5">
                    <IconButton label="View stats" onClick={() => handleShowStats(voucher)}>
                      <BarChart2 size={15} />
                    </IconButton>
                    {!ended && (
                      <>
                        <IconButton
                          label="Edit voucher"
                          onClick={() => {
                            setEditingVoucher(voucher);
                            setIsModalOpen(true);
                          }}
                        >
                          <Pencil size={15} />
                        </IconButton>
                        <IconButton label={voucher.status === 'active' ? 'Pause voucher' : 'Activate voucher'} onClick={() => handleToggleStatus(voucher)}>
                          <Power size={15} className={voucher.status === 'active' ? 'text-emerald-400' : ''} />
                        </IconButton>
                        <IconButton label="End voucher" danger onClick={() => setDeleteTarget(voucher)}>
                          <Trash2 size={15} />
                        </IconButton>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <VoucherFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingVoucher(null);
        }}
        onSubmit={handleCreateOrUpdate}
        voucher={editingVoucher}
      />

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" onClick={() => setDeleteTarget(null)}>
          <Card
            className="w-full max-w-sm border-border bg-card p-6 text-center"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <h3 className="font-serif text-2xl font-bold text-white">End this voucher?</h3>
            <p className="text-sm text-muted-foreground">
              Guests will no longer be able to save or apply code {deleteTarget.code}.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="border-border text-white hover:bg-secondary" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                End voucher
              </Button>
            </div>
          </Card>
        </div>
      )}

      {statsVoucher && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/75 p-4 backdrop-blur-sm" onClick={() => setStatsVoucher(null)}>
          <Card
            className="flex h-full w-full max-w-[460px] flex-col rounded-none border-border bg-card p-0"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border p-5">
              <div>
                <h4 className="font-serif text-xl font-bold text-white">Voucher performance</h4>
                <p className="text-sm text-muted-foreground">{statsVoucher.code}</p>
              </div>
              <button
                type="button"
                onClick={() => setStatsVoucher(null)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-secondary hover:text-white"
                aria-label="Close voucher stats"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {loadingStats ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="text-sm">Calculating stats...</span>
                </div>
              ) : statsData ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-3">
                    <StatBox label="Saved" value={statsData.savedCount || 0} />
                    <StatBox label="Used" value={statsData.usedCount || 0} />
                    <StatBox label="Discount" value={formatMoney(statsData.totalDiscount)} accent />
                  </div>

                  <div>
                    <h5 className="border-b border-border pb-2 text-xs font-bold uppercase tracking-wider text-white">
                      Redemption history
                    </h5>
                    {statsData.redemptions?.length ? (
                      <div className="mt-3 space-y-3">
                        {statsData.redemptions.map((item, index) => (
                          <div key={`${item.bookingId}-${index}`} className="rounded-xl border border-border bg-secondary/20 p-3 text-sm">
                            <div className="flex items-center justify-between gap-3 font-semibold text-white">
                              <span>Booking #{String(item.bookingId).slice(-6).toUpperCase()}</span>
                              <span className="text-xs font-normal text-muted-foreground">
                                {new Date(item.usedAt).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">
                              Discount: {formatMoney(item.discountApplied)} · Paid: {formatMoney(item.amountAfter)}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="py-8 text-center text-sm text-muted-foreground">No redemptions yet.</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">No stats available.</p>
              )}
            </div>
          </Card>
        </div>
      )}
    </OwnerLayout>
  );
}

function IconButton({ children, label, onClick, danger }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary',
        danger && 'hover:border-rose-500/50 hover:text-rose-400'
      )}
    >
      {children}
    </button>
  );
}

function StatBox({ label, value, accent }) {
  return (
    <div className="rounded-xl border border-border bg-secondary/30 p-3 text-center">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={cn('mt-1 truncate font-serif text-lg font-bold text-white', accent && 'text-primary')}>{value}</p>
    </div>
  );
}
