import { Link } from 'react-router-dom';
import { ArrowRight, NotebookTabs, Sparkles, Store, Tag, Utensils } from 'lucide-react';
import SafeImage from '../common/SafeImage';
import RecommendationReasonChips from './RecommendationReasonChips';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

const formatCurrency = (value) => {
  if (!value && value !== 0) return 'Giá liên hệ';
  return `${new Intl.NumberFormat('vi-VN').format(value)} đ`;
};

export default function RecommendedMenuItemCard({
  item,
  personalized = false,
}) {
  return (
    <Card className="overflow-hidden border-border bg-card text-left transition-colors duration-300 hover:border-primary/45">
      <div className="flex h-full flex-col gap-4 p-4 sm:flex-row">
        <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-xl border border-border bg-secondary sm:w-28">
          <SafeImage
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover"
            fallback={(
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <Utensils size={24} aria-hidden="true" />
              </div>
            )}
          />
          {personalized ? (
            <Badge className="absolute left-2 top-2 border-none bg-primary text-primary-foreground">
              <Sparkles size={12} aria-hidden="true" />
              Hợp gu
            </Badge>
          ) : null}
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-white" title={item.name}>
                {item.name}
              </h3>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Store size={12} aria-hidden="true" />
                  <span className="truncate">{item.restaurantName}</span>
                </span>
                {item.categoryName ? (
                  <span className="inline-flex items-center gap-1">
                    <Tag size={12} aria-hidden="true" />
                    {item.categoryName}
                  </span>
                ) : null}
              </div>
            </div>
            <span className="shrink-0 text-sm font-semibold text-primary">{formatCurrency(item.price)}</span>
          </div>

          <RecommendationReasonChips reasons={item.reasons} />

          <div className="flex flex-wrap gap-1.5 text-[11px] text-muted-foreground">
            {(item.tags?.length ? item.tags : item.cuisineTypes).slice(0, 3).map((tag) => (
              <span
                key={`${item.id}-${tag}`}
                className="rounded-full border border-border px-2 py-0.5"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Button asChild size="sm" variant="outline">
              <Link to={item.detailUrl}>
                <Store size={13} aria-hidden="true" />
                Xem nhà hàng
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link to={item.menuUrl}>
                <NotebookTabs size={13} aria-hidden="true" />
                Xem menu
                <ArrowRight size={13} aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
