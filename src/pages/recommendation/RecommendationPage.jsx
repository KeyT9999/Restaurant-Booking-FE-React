import { useState, useEffect, useCallback } from 'react';
import { Sparkles, MapPin, RefreshCw, SlidersHorizontal, AlertCircle } from 'lucide-react';
import Header from '../../components/Header';
import useGeolocation from '../../hooks/useGeolocation';
import { getLocationRecommendations } from '../../api/locationRecommendationApi';
import RestaurantRecommendationCard from '../../components/recommendation/RestaurantRecommendationCard';
import LocationPermissionPrompt from '../../components/recommendation/LocationPermissionPrompt';
import LoadingSkeleton from '../../components/recommendation/LoadingSkeleton';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Section, PhaseLabel } from '../../components/bookeat/Section';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

const CUISINE_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'Việt Nam', label: 'Việt Nam' },
  { value: 'Nhật Bản', label: 'Nhật Bản' },
  { value: 'Hàn Quốc', label: 'Hàn Quốc' },
  { value: 'Trung Quốc', label: 'Trung Quốc' },
  { value: 'Thái Lan', label: 'Thái Lan' },
  { value: 'Ý', label: 'Ý' },
  { value: 'Pháp', label: 'Pháp' },
  { value: 'Mỹ', label: 'Mỹ' },
  { value: 'Hải sản', label: 'Hải sản' },
  { value: 'Bít tết', label: 'Bít tết' },
  { value: 'Café', label: 'Café' },
];

const DISTANCE_OPTIONS = [
  { value: '10000', label: '10 km' },
  { value: '20000', label: '20 km' },
  { value: '30000', label: '30 km' },
  { value: '40000', label: '40 km' },
  { value: '50000', label: '50 km' },
];

const RATING_OPTIONS = [
  { value: '0', label: 'Tất cả' },
  { value: '3.0', label: '3.0+' },
  { value: '3.5', label: '3.5+' },
  { value: '4.0', label: '4.0+' },
  { value: '4.5', label: '4.5+' },
];

export default function RecommendationPage() {
  const { location, error: locationError, loading: locationLoading, permissionStatus, requestLocation, hasLocation } = useGeolocation();

  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fetched, setFetched] = useState(false);
  const [initialRequested, setInitialRequested] = useState(false);

  const [filters, setFilters] = useState({
    category: '',
    maxDistance: '5000',
    minimumRating: '0',
  });

  // Auto-request location on mount
  useEffect(() => {
    if (!initialRequested && permissionStatus !== 'denied') {
      setInitialRequested(true);
      requestLocation().catch(() => {});
    }
  }, [initialRequested, permissionStatus, requestLocation]);

  const fetchRecommendations = useCallback(async (lat, lng) => {
    setLoading(true);
    setError(null);

    try {
      const response = await getLocationRecommendations({
        latitude: lat,
        longitude: lng,
        category: filters.category || undefined,
        maxDistance: parseInt(filters.maxDistance, 10),
        minimumRating: parseFloat(filters.minimumRating),
        limit: 50,
      });

      if (response.success && response.data) {
        setRecommendations(response.data.items || []);
      } else {
        setError('Không thể lấy đề xuất. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error('Fetch recommendations error:', err);
      setError(err.message || 'Đã xảy ra lỗi khi lấy đề xuất.');
    } finally {
      setLoading(false);
      setFetched(true);
    }
  }, [filters]);

  useEffect(() => {
    if (hasLocation && location) {
      fetchRecommendations(location.latitude, location.longitude);
    }
  }, [hasLocation, location, filters, fetchRecommendations]);

  const handleRequestPermission = async () => {
    try {
      const position = await requestLocation();
      fetchRecommendations(position.latitude, position.longitude);
    } catch (err) {
      console.error('Location request error:', err);
    }
  };

  const handleRefresh = () => {
    if (location) {
      fetchRecommendations(location.latitude, location.longitude);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const renderContent = () => {
    if (!hasLocation && !locationLoading) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <LocationPermissionPrompt
            onRequestPermission={handleRequestPermission}
            error={locationError}
            loading={locationLoading}
            permissionStatus={permissionStatus}
          />
        </div>
      );
    }

    if (locationLoading) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="p-8 bg-card border-border text-center max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="h-8 w-8 text-primary animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Đang lấy vị trí...</h3>
            <p className="text-sm text-muted-foreground">
              Vui lòng đợi trong giây lát
            </p>
          </Card>
        </div>
      );
    }

    if (loading) {
      return <LoadingSkeleton />;
    }

    if (error) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="p-8 bg-card border-border text-center max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Đã xảy ra lỗi</h3>
            <p className="text-sm text-muted-foreground mb-6">{error}</p>
            <Button
              onClick={handleRefresh}
              className="bg-primary hover:bg-[#E0A968] text-background font-semibold gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Thử lại
            </Button>
          </Card>
        </div>
      );
    }

    if (fetched && recommendations.length === 0) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="p-8 bg-card border-border text-center max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Không tìm thấy nhà hàng</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Không có nhà hàng nào phù hợp với vị trí và bộ lọc của bạn.
              Hãy thử điều chỉnh bộ lọc hoặc mở rộng khu vực tìm kiếm.
            </p>
            <Button
              onClick={handleRefresh}
              variant="outline"
              className="border-primary/30 text-primary hover:bg-primary/10"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Tải lại
            </Button>
          </Card>
        </div>
      );
    }

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((restaurant, index) => (
            <RestaurantRecommendationCard
              key={restaurant.restaurantId}
              restaurant={restaurant}
              index={index}
            />
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-background text-white flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-12 md:pt-20">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1800&q=80"
            alt="Restaurant background"
            className="w-full h-full object-cover opacity-20"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0F1115]/30 via-[#0F1115]/80 to-[#0F1115]" />
        </div>

        <div className="relative z-10 mx-auto max-w-[1280px] px-6 text-left">
          <div className="max-w-3xl">
            <PhaseLabel>Gợi ý thông minh</PhaseLabel>
            
            <h1
              className="mt-4 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Nhà hàng gần bạn nhất
            </h1>

            <p className="mt-4 max-w-2xl text-sm md:text-base text-[#A5ADBA] leading-relaxed">
              Dựa trên vị trí hiện tại của bạn, chúng tôi gợi ý những nhà hàng 
              ngon nhất xung quanh với đánh giá thực tế từ cộng đồng.
            </p>

            {/* Location Info */}
            {hasLocation && location && (
              <div className="mt-4 flex items-center gap-2 text-sm text-primary">
                <MapPin className="h-4 w-4" />
                <span>
                  {location.address || `Vị trí của bạn: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Filters Section */}
        <Section>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-primary">
              <SlidersHorizontal className="h-5 w-5" />
              <span className="font-semibold">Bộ lọc</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Loại:</span>
                <Select
                  value={filters.category}
                  onValueChange={(value) => handleFilterChange('category', value)}
                >
                  <SelectTrigger className="w-[140px] h-9 bg-card border-border text-xs">
                    <SelectValue placeholder="Tất cả" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {CUISINE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-xs">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Distance Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Bán kính:</span>
                <Select
                  value={filters.maxDistance}
                  onValueChange={(value) => handleFilterChange('maxDistance', value)}
                >
                  <SelectTrigger className="w-[110px] h-9 bg-card border-border text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {DISTANCE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-xs">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Rating Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Đánh giá:</span>
                <Select
                  value={filters.minimumRating}
                  onValueChange={(value) => handleFilterChange('minimumRating', value)}
                >
                  <SelectTrigger className="w-[100px] h-9 bg-card border-border text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {RATING_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-xs">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Refresh Button */}
              <Button
                onClick={handleRefresh}
                disabled={!hasLocation || loading}
                variant="outline"
                size="sm"
                className="border-primary/30 text-primary hover:bg-primary/10 gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Làm mới
              </Button>
            </div>
          </div>

          {/* Results Count */}
          {recommendations.length > 0 && (
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                Tìm thấy <span className="font-semibold text-white">{recommendations.length}</span> nhà hàng phù hợp
              </span>
            </div>
          )}

          {/* Content */}
          {renderContent()}
        </Section>
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-border bg-[#090B0E] py-6 text-center text-xs text-muted-foreground">
        <p>© 2026 BookEat. Mọi quyền được bảo lưu.</p>
      </footer>
    </div>
  );
}
