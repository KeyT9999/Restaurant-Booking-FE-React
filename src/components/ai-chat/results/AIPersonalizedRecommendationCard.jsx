import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Star, Utensils } from 'lucide-react';

const formatMoney = (value) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return null;
  return `${value.toLocaleString('vi-VN')} đ`;
};

const formatScore = (value) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return null;
  return `${Math.round(value * 100)}% hop gu`;
};

const getPrimaryLink = (item) => {
  if (item?.itemType === 'menu_item') {
    return {
      href: item?.metadata?.menuUrl || item?.metadata?.detailUrl || '#',
      label: 'Mo menu',
    };
  }

  return {
    href: item?.metadata?.detailUrl || '#',
    label: 'Xem nha hang',
  };
};

function RecommendationItemCard({ item }) {
  const primaryLink = getPrimaryLink(item);
  const cuisines = Array.isArray(item?.cuisineTypes) ? item.cuisineTypes.slice(0, 2) : [];
  const priceText = item?.itemType === 'menu_item'
    ? formatMoney(item?.price)
    : item?.priceRange || null;
  const scoreText = formatScore(item?.score);

  return (
    <article className="overflow-hidden rounded-xl border border-border bg-card text-left shadow-sm">
      <div className="flex gap-3 p-3">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-secondary">
          {item?.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <Utensils size={22} aria-hidden="true" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary/80">
                {item?.itemType === 'menu_item' ? 'Mon goi y' : 'Nha hang goi y'}
              </p>
              <h4 className="truncate text-sm font-semibold text-foreground" title={item?.name}>
                {item?.name}
              </h4>
              {item?.restaurantName ? (
                <p className="truncate text-xs text-muted-foreground" title={item.restaurantName}>
                  {item.restaurantName}
                </p>
              ) : null}
            </div>

            <div className="shrink-0 text-right">
              {typeof item?.ratingAverage === 'number' && item.ratingAverage > 0 ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                  <Star size={12} fill="currentColor" aria-hidden="true" />
                  {Number(item.ratingAverage).toFixed(1)}
                </span>
              ) : null}
              {scoreText ? (
                <p className="mt-1 text-[11px] font-medium text-muted-foreground">{scoreText}</p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 text-[11px] text-muted-foreground">
            {priceText ? (
              <span className="rounded-full bg-secondary px-2 py-0.5 font-medium text-foreground/80">
                {priceText}
              </span>
            ) : null}
            {cuisines.map((cuisine) => (
              <span
                key={`${item?.id}-${cuisine}`}
                className="rounded-full border border-border px-2 py-0.5"
              >
                {cuisine}
              </span>
            ))}
          </div>

          {Array.isArray(item?.reasons) && item.reasons.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {item.reasons.slice(0, 3).map((reason) => (
                <span
                  key={`${item?.id}-${reason}`}
                  className="rounded-full bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary"
                >
                  {reason}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="border-t border-border bg-card/70 p-3">
        <Link
          to={primaryLink.href}
          className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {primaryLink.label}
          <ArrowRight size={13} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

export default function AIPersonalizedRecommendationCard({ payload }) {
  const items = payload?.items || [];

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card/60 p-4 text-center text-sm text-muted-foreground">
        Chua co goi y ca nhan hoa phu hop luc nay.
      </div>
    );
  }

  return (
    <section className="space-y-3">
      <div className="rounded-xl border border-primary/15 bg-primary/5 p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              <Sparkles size={13} aria-hidden="true" />
              {payload?.sourceLabel || 'BookEat personalized recommendations'}
            </p>
            <p className="text-sm font-medium text-foreground">
              {payload?.message || 'Duoi day la mot so goi y danh cho ban.'}
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-primary/20 bg-background/80 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            {items.length} goi y
          </span>
        </div>

        {payload?.fallbackUsed ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Dang dung goi y pho bien hoac ngu canh hien tai vi chua du du lieu ca nhan hoa.
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-3">
        {items.map((item) => (
          <RecommendationItemCard key={`${item.itemType}-${item.id}`} item={item} />
        ))}
      </div>
    </section>
  );
}
