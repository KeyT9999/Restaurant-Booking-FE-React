import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Star, Utensils } from 'lucide-react';

const formatAddress = (address) => {
  if (!address) return 'Chưa cập nhật';
  if (typeof address === 'string') return address;
  if (typeof address === 'object') {
    if (address.fullAddress && typeof address.fullAddress === 'string') {
      return address.fullAddress;
    }
    return [
      address.street,
      address.ward,
      address.district,
      address.city,
    ].filter(Boolean).join(', ') || 'Chưa cập nhật';
  }
  return String(address);
};

const formatPrice = (value) => {
  if (!value) return 'Giá liên hệ';
  return `~ ${Number(value).toLocaleString('vi-VN')} đ`;
};

export function AIRestaurantResultCard({ restaurant }) {
  const image = restaurant.coverImageUrl || restaurant.logo;

  return (
    <article className="overflow-hidden rounded-lg border border-border bg-card text-left shadow-sm">
      <div className="relative aspect-[4/3] bg-secondary">
        {image ? (
          <img
            src={image}
            alt={restaurant.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <Utensils size={28} aria-hidden="true" />
          </div>
        )}
      </div>

      <div className="space-y-3 p-3">
        <div className="flex items-start justify-between gap-2">
          <h4 className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground" title={restaurant.name}>
            {restaurant.name}
          </h4>
          <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary">
            <Star size={13} fill="currentColor" aria-hidden="true" />
            {Number(restaurant.averageRating || 0).toFixed(1)}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          {restaurant.cuisineType && (
            <span className="font-medium text-primary">{restaurant.cuisineType}</span>
          )}
          <span>{formatPrice(restaurant.averagePrice)}</span>
        </div>

        {restaurant.description && (
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {restaurant.description}
          </p>
        )}

        {restaurant.address && (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin size={13} className="shrink-0 text-primary" aria-hidden="true" />
            <span className="truncate" title={formatAddress(restaurant.address)}>{formatAddress(restaurant.address)}</span>
          </p>
        )}

        <Link
          to={restaurant.detailUrl || `/restaurants/${restaurant.id}`}
          className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Xem chi tiết
          <ArrowRight size={13} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

export function AIRestaurantResultList({ payload }) {
  const restaurants = payload?.restaurants || [];

  if (restaurants.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card/60 p-4 text-center text-sm text-muted-foreground">
        Không tìm thấy nhà hàng public phù hợp.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>{payload?.sourceLabel || 'BookEat public restaurants'}</span>
        <span>{payload?.total ?? restaurants.length} kết quả</span>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {restaurants.map((restaurant) => (
          <AIRestaurantResultCard key={restaurant.id} restaurant={restaurant} />
        ))}
      </div>
    </div>
  );
}
