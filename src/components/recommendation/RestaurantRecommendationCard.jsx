import { MapPin, Star, Users, Clock, MapPinned, ChevronRight, Utensils, BadgePercent } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import SafeImage from '../common/SafeImage';

const formatPriceLevel = (level) => {
  if (level === undefined || level === null) return null;
  const levels = ['$', '$$', '$$$', '$$$$', '$$$$$'];
  return levels[level] || null;
};

const formatReviewCount = (count) => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
};

const RestaurantRecommendationCard = ({ restaurant, index }) => {
  const {
    name,
    address,
    distance,
    distanceText,
    rating,
    reviewCount,
    category,
    priceLevel,
    priceLevelText,
    isOpen,
    googleMapsLink,
    photo,
    score,
    reason,
  } = restaurant;

  const handleOpenMaps = (e) => {
    e.stopPropagation();
    window.open(googleMapsLink, '_blank', 'noopener,noreferrer');
  };

  const scorePercentage = Math.round(score * 100);

  return (
    <Card className="group overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-300 cursor-pointer flex flex-col">
      {/* Image Section */}
      <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
        {photo ? (
          <SafeImage
            src={photo}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            fallback={
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary">
                <Utensils className="h-12 w-12 text-muted-foreground/50" />
              </div>
            }
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary">
            <Utensils className="h-12 w-12 text-muted-foreground/50" />
          </div>
        )}

        {/* Rank Badge */}
        <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-primary text-background flex items-center justify-center font-bold text-sm shadow-lg">
          {index + 1}
        </div>

        {/* Score Badge */}
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs font-semibold">
          {scorePercentage}% match
        </div>

        {/* Open/Closed Badge */}
        <div className="absolute bottom-3 left-3">
          {isOpen ? (
            <Badge className="bg-green-500/90 text-white border-none gap-1 text-xs">
              <Clock className="h-3 w-3" />
              Đang mở
            </Badge>
          ) : (
            <Badge className="bg-red-500/90 text-white border-none gap-1 text-xs">
              <Clock className="h-3 w-3" />
              Đã đóng
            </Badge>
          )}
        </div>

        {/* Category Badge */}
        {category && (
          <div className="absolute bottom-3 right-3">
            <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm text-foreground gap-1 text-xs">
              <Utensils className="h-3 w-3" />
              {category}
            </Badge>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col flex-1">
        {/* Title and Rating */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-white text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">
              {name}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5 flex-wrap">
              <MapPin className="h-3 w-3 text-primary flex-shrink-0" />
              <span className="truncate">{address}</span>
            </p>
          </div>
          
          {/* Rating */}
          <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-lg flex-shrink-0">
            <Star className="h-4 w-4 text-primary fill-primary" />
            <span className="font-bold text-primary text-sm">{rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Info Row */}
        <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
          {/* Distance */}
          <div className="flex items-center gap-1">
            <MapPinned className="h-3.5 w-3.5 text-primary" />
            <span>{distanceText}</span>
          </div>

          {/* Reviews */}
          <div className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            <span>{formatReviewCount(reviewCount)} đánh giá</span>
          </div>

          {/* Price Level */}
          {priceLevel !== null && priceLevel !== undefined && (
            <div className="flex items-center gap-1">
              <BadgePercent className="h-3.5 w-3.5" />
              <span>{priceLevelText || formatPriceLevel(priceLevel)}</span>
            </div>
          )}
        </div>

        {/* Recommendation Reason */}
        {reason && (
          <div className="mt-3 p-2.5 rounded-lg bg-primary/5 border border-primary/10">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-semibold text-primary">Lý do: </span>
              {reason}
            </p>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-auto pt-3">
          <Button
            onClick={handleOpenMaps}
            variant="outline"
            className="w-full border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 transition-all duration-200 group/btn"
          >
            <MapPin className="h-4 w-4 mr-2 group-hover/btn:translate-x-0.5 transition-transform" />
            Mở trên Google Maps
            <ChevronRight className="h-4 w-4 ml-auto group-hover/btn:translate-x-0.5 transition-transform" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default RestaurantRecommendationCard;
