import { Card } from '../ui/card';

const LoadingSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} className="overflow-hidden bg-card border-border">
          {/* Image skeleton */}
          <div className="aspect-[16/10] bg-muted animate-pulse" />
          
          {/* Content skeleton */}
          <div className="p-4 space-y-3">
            {/* Title and rating */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-muted rounded animate-pulse w-3/4" />
                <div className="h-3 bg-muted rounded animate-pulse w-full" />
              </div>
              <div className="h-8 w-14 bg-muted rounded-lg animate-pulse" />
            </div>
            
            {/* Info row */}
            <div className="flex items-center gap-3">
              <div className="h-4 bg-muted rounded animate-pulse w-16" />
              <div className="h-4 bg-muted rounded animate-pulse w-20" />
              <div className="h-4 bg-muted rounded animate-pulse w-12" />
            </div>
            
            {/* Reason */}
            <div className="h-12 bg-muted rounded animate-pulse" />
            
            {/* Button */}
            <div className="h-10 bg-muted rounded animate-pulse mt-2" />
          </div>
        </Card>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
