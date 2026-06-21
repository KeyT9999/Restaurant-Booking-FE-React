import { Link } from 'react-router-dom';
import { ArrowRight, Clock, MapPin, ShieldCheck, Star, Utensils } from 'lucide-react';

const formatAddress = (address) => {
  if (!address) return 'Chưa cập nhật địa chỉ';
  if (typeof address === 'string') return address;
  return address.fullAddress
    || [address.street, address.ward, address.district, address.city].filter(Boolean).join(', ')
    || 'Chưa cập nhật địa chỉ';
};

const formatPrice = (value) => {
  if (!value) return 'Giá liên hệ';
  return `${Number(value).toLocaleString('vi-VN')} đ/người`;
};

export default function AIRestaurantDetailCard({ payload }) {
  const restaurant = payload?.restaurant;
  if (!restaurant) return null;
  const image = restaurant.coverImageUrl || restaurant.logo;

  return (
    <article className="overflow-hidden rounded-lg border border-border bg-card text-left shadow-sm">
      <div className="relative aspect-[16/9] bg-secondary">
        {image ? (
          <img src={image} alt={restaurant.name} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <Utensils size={30} aria-hidden="true" />
          </div>
        )}
      </div>

      <div className="space-y-3 p-3">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h4 className="min-w-0 flex-1 text-sm font-semibold leading-snug text-foreground">
              {restaurant.name}
            </h4>
            <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary">
              <Star size={13} fill="currentColor" aria-hidden="true" />
              {Number(restaurant.averageRating || 0).toFixed(1)}
            </span>
          </div>
          {restaurant.description && (
            <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
              {restaurant.description}
            </p>
          )}
        </div>

        <div className="grid gap-2 text-xs text-muted-foreground">
          <p className="flex items-start gap-1.5">
            <MapPin size={13} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
            <span>{formatAddress(restaurant.address)}</span>
          </p>
          <p className="flex items-center gap-1.5">
            <Clock size={13} className="shrink-0 text-primary" aria-hidden="true" />
            <span>{formatPrice(restaurant.averagePrice)}</span>
          </p>
        </div>

        {(restaurant.signatureDishes?.length > 0 || restaurant.amenities?.length > 0) && (
          <div className="flex flex-wrap gap-1.5">
            {[...(restaurant.signatureDishes || []), ...(restaurant.amenities || [])].slice(0, 6).map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary/60 px-2 py-1 text-[11px] text-muted-foreground"
              >
                <ShieldCheck size={11} className="text-primary" aria-hidden="true" />
                {item}
              </span>
            ))}
          </div>
        )}

        <Link
          to={restaurant.detailUrl || `/restaurants/${restaurant.id}`}
          className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Mở trang nhà hàng
          <ArrowRight size={13} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
