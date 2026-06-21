import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Building2, Clock, Edit3, Mail, MapPin, Phone, Plus, Store } from 'lucide-react';
import OwnerLayout from '../../components/owner/OwnerLayout';
import { useRestaurantContext } from '../../context/useRestaurantContext';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { getRestaurantCoverImage } from '../../utils/restaurantImages';
import SafeImage from '../../components/common/SafeImage';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1600&q=80';

const DAY_ROWS = [
  ['monday', 'Thứ hai'],
  ['tuesday', 'Thứ ba'],
  ['wednesday', 'Thứ tư'],
  ['thursday', 'Thứ năm'],
  ['friday', 'Thứ sáu'],
  ['saturday', 'Thứ bảy'],
  ['sunday', 'Chủ nhật'],
];

const STATUS_CONFIG = {
  approved: { label: 'Đã phê duyệt', className: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400' },
  pending: { label: 'Chờ phê duyệt', className: 'border-amber-500/25 bg-amber-500/10 text-amber-400' },
  rejected: { label: 'Đã từ chối', className: 'border-rose-500/25 bg-rose-500/10 text-rose-400' },
  suspended: { label: 'Tạm ngưng', className: 'border-orange-500/25 bg-orange-500/10 text-orange-400' },
};

function formatAddress(address) {
  if (!address) return 'Địa chỉ chưa thiết lập';
  if (typeof address === 'string') return address;
  if (address.fullAddress || address.formattedAddress) return address.fullAddress || address.formattedAddress;
  return [address.street, address.ward, address.district, address.city, address.province]
    .filter(Boolean)
    .join(', ') || 'Địa chỉ chưa thiết lập';
}

function formatCuisine(restaurant) {
  const cuisine = restaurant?.cuisineTypes || restaurant?.cuisines || restaurant?.cuisineType || restaurant?.cuisine;
  if (Array.isArray(cuisine)) return cuisine.filter(Boolean).join(' · ') || 'Ẩm thực chưa thiết lập';
  return cuisine || 'Ẩm thực chưa thiết lập';
}

function formatHours(dayHours) {
  if (!dayHours) return 'Chưa thiết lập';
  if (dayHours.closed || dayHours.isClosed || dayHours.isOpen === false) return 'Đóng cửa';
  const open = dayHours.open || dayHours.openTime || dayHours.from;
  const close = dayHours.close || dayHours.closeTime || dayHours.to;
  if (!open || !close) return 'Chưa thiết lập';
  return `${open} - ${close}`;
}

function FieldBox({ label, value, icon: Icon }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {Icon && <Icon size={13} className="text-primary" />}
        {label}
      </div>
      <div className="min-h-12 rounded-lg border border-border bg-secondary/50 px-4 py-3 text-base font-semibold text-white">
        {value || 'Chưa cấu hình'}
      </div>
    </div>
  );
}

export default function OwnerRestaurants() {
  const navigate = useNavigate();
  const {
    restaurants,
    selectedRestaurant,
    selectedRestaurantId,
    loading,
    error,
    setSelectedRestaurantId,
    refreshRestaurants,
    restaurantQuota,
  } = useRestaurantContext();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const planCode = restaurantQuota?.planCode || 'free';
  const planNames = { free: 'Free', plus: 'Plus', pro: 'Pro' };
  const planName = planNames[planCode] || planCode;
  const currentCount = restaurantQuota?.currentCount || restaurants.length || 0;
  const limit = restaurantQuota?.limit || 1;

  const handleCreateClick = () => {
    if (restaurantQuota?.remaining === 0) {
      setShowUpgradeModal(true);
    } else {
      navigate('/owner/restaurants/create');
    }
  };

  const restaurant = selectedRestaurant || restaurants[0] || null;
  const status = STATUS_CONFIG[restaurant?.approvalStatus] || STATUS_CONFIG.pending;
  const address = useMemo(() => formatAddress(restaurant?.address), [restaurant?.address]);
  const cuisine = useMemo(() => formatCuisine(restaurant), [restaurant]);
  const heroImage = getRestaurantCoverImage(restaurant) || FALLBACK_IMAGE;

  const action = (
    <div className="flex items-center gap-2">
      {restaurant && (
        <Button
          variant="outline"
          className="border-border bg-background text-white hover:bg-secondary"
          onClick={() => navigate(`/owner/restaurants/${restaurant.id}/edit`)}
        >
          <Edit3 size={16} /> Chỉnh sửa hồ sơ
        </Button>
      )}
      <Button
        className="bg-primary text-background hover:bg-primary/95"
        onClick={handleCreateClick}
      >
        <Plus size={16} /> Đăng ký thêm nhà hàng
      </Button>
    </div>
  );

  return (
    <OwnerLayout title="Hồ sơ nhà hàng" subtitle="Thông tin chi tiết hiển thị công khai" action={action}>
      {/* Quota Progress Bar */}
      {restaurantQuota && (
        <Card className="mb-6 border-border bg-card p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Building2 size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Hạn mức số lượng nhà hàng</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Bạn đang sử dụng gói <span className="text-primary font-bold">{planName}</span>. Đã tạo <span className="text-white font-bold">{currentCount}</span> trên tối đa <span className="text-white font-bold">{limit}</span> nhà hàng.
                </p>
              </div>
            </div>
            
            <div className="flex-1 max-w-xs space-y-1.5 w-full">
              <div className="flex justify-between text-[10px] font-semibold text-muted-foreground">
                <span>Tiến trình sử dụng</span>
                <span>{currentCount}/{limit} nhà hàng</span>
              </div>
              <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (currentCount / limit) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_540px]">
          <div className="h-[620px] animate-pulse rounded-xl border border-border bg-card" />
          <div className="h-[520px] animate-pulse rounded-xl border border-border bg-card" />
        </div>
      ) : error ? (
        <Card className="mx-auto max-w-2xl border-rose-500/25 bg-rose-500/10 p-6 text-center">
          <AlertTriangle className="mx-auto h-10 w-10 text-rose-400" />
          <h2 className="font-serif text-2xl font-bold text-white">Không thể tải hồ sơ nhà hàng</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button onClick={refreshRestaurants} className="mx-auto bg-primary text-background hover:bg-primary/95">
            Thử lại
          </Button>
        </Card>
      ) : !restaurant ? (
        <Card className="mx-auto max-w-2xl border-dashed border-border bg-card/70 p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Store size={28} />
          </div>
          <h2 className="font-serif text-3xl font-bold text-white">Bạn chưa có nhà hàng nào</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Tạo hồ sơ nhà hàng đầu tiên của bạn để bắt đầu quản lý đặt bàn, bàn ăn và ưu đãi.
          </p>
          <Button onClick={() => navigate('/owner/restaurants/create')} className="mx-auto bg-primary text-background hover:bg-primary/95">
            <Plus size={16} /> Tạo nhà hàng mới
          </Button>
        </Card>
      ) : (
        <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_540px]">
          <Card className="border-border bg-card p-6 sm:p-7">
            <div className="mb-12 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Hồ sơ nhà hàng</h2>
                <p className="mt-1 text-sm text-muted-foreground">Những thông tin này sẽ hiển thị trên trang công khai của nhà hàng.</p>
              </div>
              <Badge className={`${status.className} rounded-lg border px-3 py-1 text-xs font-bold`}>
                {status.label}
              </Badge>
            </div>

            <div className="overflow-hidden rounded-xl bg-secondary">
              <SafeImage
                src={heroImage}
                alt={restaurant.name}
                className="aspect-[2/1] w-full object-cover"
                fallback={<div className="aspect-[2/1] w-full flex items-center justify-center bg-secondary"><Store className="h-10 w-10 text-muted-foreground/70" /></div>}
              />
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2">
              <FieldBox label="Tên nhà hàng" value={restaurant.name} icon={Building2} />
              <FieldBox label="Ẩm thực" value={cuisine} icon={Store} />
              <FieldBox label="Số điện thoại" value={restaurant.phoneNumber || restaurant.phone} icon={Phone} />
              <FieldBox label="Email" value={restaurant.email} icon={Mail} />
              <div className="md:col-span-2">
                <FieldBox label="Địa chỉ" value={address} icon={MapPin} />
              </div>
            </div>

            {restaurants.length > 1 && (
              <div className="mt-7 rounded-xl border border-border bg-secondary/25 p-4">
                <p className="text-sm font-semibold text-white">Danh sách nhà hàng của bạn</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {restaurants.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setSelectedRestaurantId(item.id)}
                      className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                        item.id === (selectedRestaurantId || restaurant.id)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-card text-muted-foreground hover:text-white'
                      }`}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <Card className="border-border bg-card p-6 sm:p-7">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Thời gian hoạt động</h2>
              <Clock size={20} className="text-primary" />
            </div>

            <div className="mt-8 divide-y divide-border/70">
              {DAY_ROWS.map(([key, label]) => {
                const value = formatHours(restaurant.operatingHours?.[key] || restaurant.openingHours?.[key]);
                return (
                  <div key={key} className="grid grid-cols-[72px_minmax(0,1fr)] items-center py-4">
                    <span className="text-base font-medium text-muted-foreground">{label}</span>
                    <span className="text-right text-base font-bold text-white">
                      {value}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 border-t border-border pt-8">
              <Button
                variant="outline"
                className="h-11 w-full border-border bg-background text-white hover:bg-secondary"
                onClick={() => navigate(`/owner/restaurants/${restaurant.id}/edit`)}
              >
                Chỉnh sửa giờ hoạt động
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="relative max-w-md w-full border-border bg-card p-6 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-bold text-white font-serif">Hết Quota Tạo Nhà Hàng</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Gói hiện tại (<span className="text-primary font-semibold">{planName}</span>) chỉ cho phép tạo tối đa <span className="text-white font-semibold">{limit}</span> nhà hàng. Bạn đã dùng hết hạn mức ({currentCount}/{limit}).
              </p>
            </div>

            <div className="bg-secondary/40 border border-border rounded-xl p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Số nhà hàng hiện tại:</span>
                <span className="text-white font-semibold">{currentCount} nhà hàng</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Giới hạn gói {planName}:</span>
                <span className="text-white font-semibold">{limit} nhà hàng</span>
              </div>
              {restaurantQuota?.recommendedPlan && (
                <div className="flex justify-between text-sm border-t border-border/60 pt-2">
                  <span className="text-muted-foreground">Gói nâng cấp tiếp theo:</span>
                  <span className="text-primary font-semibold uppercase">{restaurantQuota.recommendedPlan}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-grow border-border bg-background hover:bg-secondary text-white"
                onClick={() => setShowUpgradeModal(false)}
              >
                Đóng
              </Button>
              <Button
                className="flex-grow bg-primary text-background hover:bg-primary/90"
                onClick={() => {
                  setShowUpgradeModal(false);
                  navigate(`/owner/billing?restaurantId=${restaurant?.id || ''}`);
                }}
              >
                Nâng cấp gói
              </Button>
            </div>
          </Card>
        </div>
      )}
    </OwnerLayout>
  );
}
