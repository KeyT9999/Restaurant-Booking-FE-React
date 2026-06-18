import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, CircleSlash, Utensils } from 'lucide-react';

const formatPrice = (value) => {
  if (typeof value !== 'number') return 'Giá liên hệ';
  return `${value.toLocaleString('vi-VN')} đ`;
};

export function AIMenuResultCard({ item }) {
  return (
    <article className="flex gap-3 rounded-lg border border-border bg-card p-3 text-left shadow-sm">
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md border border-border bg-secondary">
        {item.image ? (
          <img src={item.image} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <Utensils size={22} aria-hidden="true" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <h4 className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground" title={item.name}>
            {item.name}
          </h4>
          <span className="shrink-0 text-xs font-bold text-primary">{formatPrice(item.price)}</span>
        </div>

        {item.categoryName && (
          <p className="truncate text-[11px] font-medium text-muted-foreground">{item.categoryName}</p>
        )}
        {item.description && (
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
        )}

        <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium ${
          item.isAvailable
            ? 'bg-emerald-500/10 text-emerald-300'
            : 'bg-destructive/10 text-destructive'
        }`}
        >
          {item.isAvailable ? <BadgeCheck size={12} aria-hidden="true" /> : <CircleSlash size={12} aria-hidden="true" />}
          {item.isAvailable ? 'Đang bán' : 'Tạm hết'}
        </span>
      </div>
    </article>
  );
}

export function AIMenuResultList({ payload }) {
  const items = payload?.items || [];
  const restaurant = payload?.restaurant;

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card/60 p-4 text-center text-sm text-muted-foreground">
        Không tìm thấy món public phù hợp.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>{restaurant?.name || payload?.sourceLabel || 'BookEat public menu'}</span>
        <span>{payload?.total ?? items.length} món</span>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <AIMenuResultCard key={item.id} item={item} />
        ))}
      </div>
      {restaurant?.menuUrl && (
        <Link
          to={restaurant.menuUrl}
          className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-md border border-border bg-secondary px-3 text-xs font-semibold text-foreground transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Mở menu đầy đủ
          <ArrowRight size={13} aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
