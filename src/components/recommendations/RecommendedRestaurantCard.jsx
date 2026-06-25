import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, MapPin, Sparkles, Star, TicketPercent, Utensils } from 'lucide-react';
import SafeImage from '../common/SafeImage';
import RecommendationReasonChips from './RecommendationReasonChips';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

export default function RecommendedRestaurantCard({
  restaurant,
  personalized = false,
}) {
  return (
    <Card className="overflow-hidden border-border bg-card text-left transition-colors duration-300 hover:border-primary/45">
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        <SafeImage
          src={restaurant.image}
          alt={restaurant.name}
          className="h-full w-full object-cover"
          fallback={(
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <Utensils size={30} aria-hidden="true" />
            </div>
          )}
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {personalized ? (
            <Badge className="border-none bg-primary text-primary-foreground">
              <Sparkles size={12} aria-hidden="true" />
              Phù hợp với bạn
            </Badge>
          ) : null}
          {restaurant.voucherActive ? (
            <Badge className="border-primary/20 bg-[#14171D]/90 text-primary" variant="outline">
              <TicketPercent size={12} aria-hidden="true" />
              Ưu đãi
            </Badge>
          ) : null}
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3
              className="truncate text-xl font-bold text-white"
              style={{ fontFamily: "'Playfair Display', serif" }}
              title={restaurant.name}
            >
              {restaurant.name}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {restaurant.priceRange ? <span>{restaurant.priceRange}</span> : null}
              {restaurant.cuisineTypes?.[0] ? <span>{restaurant.cuisineTypes[0]}</span> : null}
            </div>
          </div>

          <div className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary">
            <Star size={14} fill="currentColor" aria-hidden="true" />
            <span>{Number(restaurant.ratingAverage || 0).toFixed(1)}</span>
          </div>
        </div>

        <RecommendationReasonChips reasons={restaurant.reasons} />

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin size={13} className="shrink-0 text-primary" aria-hidden="true" />
          <span className="truncate">Sẵn sàng để bạn khám phá thêm trên BookEat</span>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Button asChild size="sm">
            <Link to={restaurant.detailUrl}>
              Xem chi tiết
              <ArrowRight size={13} aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link to={restaurant.bookingUrl}>
              <CalendarDays size={13} aria-hidden="true" />
              Đặt bàn
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
