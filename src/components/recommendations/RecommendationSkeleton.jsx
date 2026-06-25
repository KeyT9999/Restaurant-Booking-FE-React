import { Card } from '../ui/card';

function RestaurantSkeletonCard() {
  return (
    <Card className="overflow-hidden border-border bg-card/80">
      <div className="aspect-[4/3] animate-pulse bg-secondary/70" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-2/3 animate-pulse rounded-full bg-secondary/70" />
        <div className="h-3 w-1/2 animate-pulse rounded-full bg-secondary/60" />
        <div className="flex gap-2">
          <div className="h-6 w-24 animate-pulse rounded-full bg-secondary/60" />
          <div className="h-6 w-20 animate-pulse rounded-full bg-secondary/60" />
        </div>
        <div className="grid grid-cols-2 gap-2 pt-2">
          <div className="h-8 animate-pulse rounded-md bg-secondary/70" />
          <div className="h-8 animate-pulse rounded-md bg-secondary/70" />
        </div>
      </div>
    </Card>
  );
}

function MenuSkeletonCard() {
  return (
    <Card className="overflow-hidden border-border bg-card/80">
      <div className="flex gap-4 p-4">
        <div className="h-24 w-24 shrink-0 animate-pulse rounded-xl bg-secondary/70" />
        <div className="min-w-0 flex-1 space-y-3">
          <div className="h-4 w-2/3 animate-pulse rounded-full bg-secondary/70" />
          <div className="h-3 w-1/3 animate-pulse rounded-full bg-secondary/60" />
          <div className="flex flex-wrap gap-2">
            <div className="h-6 w-24 animate-pulse rounded-full bg-secondary/60" />
            <div className="h-6 w-20 animate-pulse rounded-full bg-secondary/60" />
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <div className="h-8 animate-pulse rounded-md bg-secondary/70" />
            <div className="h-8 animate-pulse rounded-md bg-secondary/70" />
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function RecommendationSkeleton({
  variant = 'restaurant',
  count = 3,
  testId,
}) {
  const items = Array.from({ length: count }, (_, index) => `${variant}-${index}`);
  const SkeletonCard = variant === 'menu' ? MenuSkeletonCard : RestaurantSkeletonCard;

  return (
    <div
      className={variant === 'menu'
        ? 'grid grid-cols-1 xl:grid-cols-2 gap-4'
        : 'grid grid-cols-1 md:grid-cols-3 gap-5'}
      data-testid={testId}
    >
      {items.map((item) => (
        <SkeletonCard key={item} />
      ))}
    </div>
  );
}
