import { useState } from 'react';
import { Check, ChefHat, ChevronDown, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRestaurantContext } from '../../context/useRestaurantContext';
import { cn } from '../ui/utils';

export default function RestaurantSwitcher() {
  const {
    restaurants,
    selectedRestaurant,
    selectedRestaurantId,
    setSelectedRestaurantId,
    loading,
    restaurantQuota,
  } = useRestaurantContext();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/20" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-3 w-28 rounded bg-secondary" />
          <div className="h-3 w-20 rounded bg-secondary/70" />
        </div>
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <button
        type="button"
        onClick={() => navigate('/owner/restaurants/create')}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-xl text-left"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-background">
          <Plus size={18} />
        </span>
        <span className="min-w-0">
          <span className="block truncate font-serif text-base font-bold text-white">Tạo nhà hàng</span>
          <span className="block truncate text-sm text-muted-foreground">Khu vực quản lý</span>
        </span>
      </button>
    );
  }

  const current = selectedRestaurant || restaurants[0];
  const currentId = selectedRestaurantId || current?.id;

  return (
    <div className="relative min-w-0 flex-1">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full min-w-0 items-center gap-3 rounded-xl text-left"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary text-background">
          {current?.logo ? (
            <img src={current.logo} alt={current.name} className="h-full w-full object-cover" />
          ) : (
            <ChefHat size={19} />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-serif text-base font-bold text-white">
            {current?.name || 'Nhà hàng'}
          </span>
          <span className="block truncate text-sm text-muted-foreground flex items-center gap-1.5">
            <span>Khu vực quản lý</span>
            {restaurantQuota && (
              <span className="inline-flex items-center rounded-full bg-zinc-800 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-400 border border-zinc-700">
                {restaurantQuota.currentCount}/{restaurantQuota.limit}
              </span>
            )}
          </span>
        </span>
        <ChevronDown size={16} className={cn('shrink-0 text-muted-foreground transition', open && 'rotate-180')} />
      </button>

      {open && (
        <>
          <button type="button" aria-label="Close restaurant menu" className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-12 z-40 max-h-[340px] overflow-y-auto rounded-xl border border-border bg-card p-1.5 shadow-2xl">
            <div className="space-y-0.5">
              {restaurants.map((restaurant) => {
                const isSelected = restaurant.id === currentId;
                const statusLabel =
                  restaurant.approvalStatus === 'approved'
                    ? 'Đã duyệt'
                    : restaurant.approvalStatus === 'rejected'
                    ? 'Từ chối'
                    : restaurant.approvalStatus === 'suspended'
                    ? 'Tạm ngưng'
                    : 'Chờ duyệt';
                return (
                  <button
                    type="button"
                    key={restaurant.id}
                    className={cn(
                      'flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition',
                      isSelected ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary hover:text-white'
                    )}
                    onClick={() => {
                      setSelectedRestaurantId(restaurant.id);
                      setOpen(false);
                    }}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{restaurant.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">{statusLabel}</span>
                    </span>
                    {isSelected && <Check size={15} className="shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="mt-1.5 border-t border-border/60 pt-1.5 px-1">
              {restaurantQuota?.remaining === 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    navigate(`/owner/billing?restaurantId=${currentId}`);
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 py-2 text-center text-xs font-bold text-amber-500 hover:bg-amber-500 hover:text-white transition"
                >
                  <span>Nâng cấp gói (Hết quota {restaurantQuota.currentCount}/{restaurantQuota.limit})</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    navigate('/owner/restaurants/create');
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary/10 border border-primary/20 py-2 text-center text-xs font-bold text-primary hover:bg-primary hover:text-background transition"
                >
                  <Plus size={14} />
                  <span>Đăng ký nhà hàng mới</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
